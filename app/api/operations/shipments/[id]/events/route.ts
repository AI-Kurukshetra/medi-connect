import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface ShipmentEventBody {
  eventType?: string;
  eventStatus?: string;
  locationLabel?: string | null;
  temperatureC?: number | null;
  occurredAt?: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const serviceClient = getSupabaseServiceClient();
  const { data: shipment } = await serviceClient
    .from("shipments")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!shipment) {
    return error({
      traceId,
      error: "Shipment not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "shipment-events" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "shipment-events",
    traceId,
    patientProfileId: shipment.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { data, error: queryError } = await serviceClient
    .from("shipment_events")
    .select("id, event_type, event_status, location_label, temperature_c, occurred_at, created_at")
    .eq("shipment_id", id)
    .order("occurred_at", { ascending: true });

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: shipment.patient_profile_id,
        module: "shipment-events",
      },
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: shipment.patient_profile_id,
      module: "shipment-events",
    },
    traceId,
    data: { items: data ?? [] },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  if (auth.context.role !== "provider") {
    return error({
      traceId,
      error: "Only providers can add shipment events.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "shipment-events" },
    });
  }
  const { id } = await params;
  const body = (await request.json()) as ShipmentEventBody;

  if (!body.eventType?.trim() || !body.eventStatus?.trim()) {
    return error({
      traceId,
      error: "eventType and eventStatus are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "shipment-events" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: shipment } = await serviceClient
    .from("shipments")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!shipment) {
    return error({
      traceId,
      error: "Shipment not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "shipment-events" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "shipment-events",
    traceId,
    patientProfileId: shipment.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { data, error: insertError } = await serviceClient
    .from("shipment_events")
    .insert({
      shipment_id: id,
      event_type: body.eventType.trim(),
      event_status: body.eventStatus.trim(),
      location_label: body.locationLabel?.trim() ?? null,
      temperature_c: body.temperatureC ?? null,
      occurred_at: body.occurredAt ?? new Date().toISOString(),
    })
    .select("id, event_type, event_status, location_label, temperature_c, occurred_at, created_at")
    .single();

  if (insertError) {
    return error({
      traceId,
      error: insertError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: shipment.patient_profile_id,
        module: "shipment-events",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "operations.shipment_event.create",
    resourceType: "shipment_event",
    resourceId: data.id,
    traceId,
    scopeContext: {
      patientProfileId: shipment.patient_profile_id,
      module: "shipment-events",
    },
    metadata: redactedMetadata({
      eventType: data.event_type,
      eventStatus: data.event_status,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: shipment.patient_profile_id,
      module: "shipment-events",
    },
    traceId,
    auditRef,
    status: 201,
    data: { item: data },
  });
}

