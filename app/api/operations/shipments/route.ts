import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getLogisticsClient } from "@/lib/integrations/logistics";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface ShipmentBody {
  id?: string;
  patientProfileId?: string;
  inventoryItemId?: string | null;
  carrier?: string;
  trackingNumber?: string;
  eta?: string | null;
  status?: "pending" | "packed" | "in_transit" | "delivered" | "failed";
}

export async function GET(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const requestedPatientProfileId = new URL(request.url).searchParams.get(
    "patientProfileId",
  );
  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "operations-shipments",
    traceId,
    requestedPatientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  const serviceClient = getSupabaseServiceClient();
  let query = serviceClient
    .from("shipments")
    .select("id, patient_profile_id, inventory_item_id, status, carrier, tracking_number, eta, delivered_at, updated_at")
    .order("updated_at", { ascending: false });

  if (scoped.value.patientProfileId) {
    query = query.eq("patient_profile_id", scoped.value.patientProfileId);
  }

  const { data, error: queryError } = await query;

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: scoped.value.scopeContext,
    traceId,
    data: { items: data ?? [] },
  });
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  if (auth.context.role !== "provider") {
    return error({
      traceId,
      error: "Only providers can create shipments.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-shipments" },
    });
  }

  const body = (await request.json()) as ShipmentBody;
  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "operations-shipments",
    traceId,
    requestedPatientProfileId: body.patientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  if (!scoped.value.patientProfileId || !body.trackingNumber?.trim()) {
    return error({
      traceId,
      error: "patientProfileId and trackingNumber are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const logisticsClient = getLogisticsClient();
  const trackingResult = await logisticsClient.trackShipment({
    trackingNumber: body.trackingNumber.trim(),
  });

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("shipments")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      inventory_item_id: body.inventoryItemId ?? null,
      status:
        body.status ??
        (trackingResult.status === "delivered" ? "delivered" : "in_transit"),
      carrier: body.carrier?.trim() ?? "mock-carrier",
      tracking_number: body.trackingNumber.trim(),
      eta: body.eta ?? null,
      delivered_at:
        trackingResult.status === "delivered" ? new Date().toISOString() : null,
    })
    .select("id, patient_profile_id, inventory_item_id, status, carrier, tracking_number, eta, delivered_at, updated_at")
    .single();

  if (insertError) {
    return error({
      traceId,
      error: insertError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "operations.shipment.create",
    resourceType: "shipment",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      trackingStatus: trackingResult.status,
      adapterProvider: logisticsClient.provider,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: scoped.value.scopeContext,
    traceId,
    auditRef,
    status: 201,
    data: { item: data, trackingResult },
  });
}

export async function PATCH(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  if (auth.context.role !== "provider") {
    return error({
      traceId,
      error: "Only providers can update shipments.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-shipments" },
    });
  }

  const body = (await request.json()) as ShipmentBody;
  const id = body.id?.trim();
  if (!id) {
    return error({
      traceId,
      error: "id is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-shipments" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("shipments")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return error({
      traceId,
      error: "Shipment not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-shipments" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "operations-shipments",
    traceId,
    patientProfileId: existing.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const updates: Record<string, string | null> = {};
  if (typeof body.status === "string") updates.status = body.status;
  if (typeof body.carrier === "string") updates.carrier = body.carrier.trim();
  if (typeof body.eta === "string" || body.eta === null) updates.eta = body.eta ?? null;
  if (typeof body.trackingNumber === "string") updates.tracking_number = body.trackingNumber.trim();
  if (body.status === "delivered") {
    updates.delivered_at = new Date().toISOString();
  }

  const { data, error: updateError } = await serviceClient
    .from("shipments")
    .update(updates)
    .eq("id", id)
    .select("id, patient_profile_id, inventory_item_id, status, carrier, tracking_number, eta, delivered_at, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: existing.patient_profile_id,
        module: "operations-shipments",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "operations.shipment.update",
    resourceType: "shipment",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "operations-shipments",
    },
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "operations-shipments",
    },
    traceId,
    auditRef,
    data: { item: data },
  });
}

