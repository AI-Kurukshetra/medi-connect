import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface InventoryBody {
  id?: string;
  sku?: string;
  medicationName?: string;
  lotNumber?: string;
  locationLabel?: string;
  quantity?: number;
  coldChainRequired?: boolean;
  coldChainStatus?: "ok" | "warning" | "breach";
  status?: "available" | "reserved" | "in_transit" | "depleted";
}

function ensureProviderRole(role: "patient" | "provider") {
  return role === "provider";
}

export async function GET(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const serviceClient = getSupabaseServiceClient();
  const { data, error: queryError } = await serviceClient
    .from("inventory_items")
    .select("id, sku, medication_name, lot_number, location_label, quantity, cold_chain_required, cold_chain_status, status, updated_at")
    .order("updated_at", { ascending: false });

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: { patientProfileId: null, module: "operations-inventory" },
    traceId,
    data: { items: data ?? [] },
  });
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  if (!ensureProviderRole(auth.context.role)) {
    return error({
      traceId,
      error: "Only providers can create inventory records.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  const body = (await request.json()) as InventoryBody;
  if (
    !body.sku?.trim() ||
    !body.medicationName?.trim() ||
    !body.lotNumber?.trim() ||
    !body.locationLabel?.trim()
  ) {
    return error({
      traceId,
      error: "sku, medicationName, lotNumber, and locationLabel are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("inventory_items")
    .insert({
      sku: body.sku.trim(),
      medication_name: body.medicationName.trim(),
      lot_number: body.lotNumber.trim(),
      location_label: body.locationLabel.trim(),
      quantity: Math.max(0, Math.floor(body.quantity ?? 0)),
      cold_chain_required: Boolean(body.coldChainRequired),
      cold_chain_status: body.coldChainStatus ?? "ok",
      status: body.status ?? "available",
    })
    .select("id, sku, medication_name, lot_number, location_label, quantity, cold_chain_required, cold_chain_status, status, updated_at")
    .single();

  if (insertError) {
    return error({
      traceId,
      error: insertError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "operations.inventory.create",
    resourceType: "inventory_item",
    resourceId: data.id,
    traceId,
    scopeContext: { module: "operations-inventory", patientProfileId: null },
    metadata: redactedMetadata({
      sku: data.sku,
      quantity: data.quantity,
      coldChainStatus: data.cold_chain_status,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: { patientProfileId: null, module: "operations-inventory" },
    traceId,
    auditRef,
    status: 201,
    data: { item: data },
  });
}

export async function PATCH(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  if (!ensureProviderRole(auth.context.role)) {
    return error({
      traceId,
      error: "Only providers can update inventory records.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  const body = (await request.json()) as InventoryBody;
  const id = body.id?.trim();
  if (!id) {
    return error({
      traceId,
      error: "id is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  const updates: Record<string, string | number | boolean> = {};
  if (typeof body.locationLabel === "string") updates.location_label = body.locationLabel.trim();
  if (typeof body.quantity === "number") updates.quantity = Math.max(0, Math.floor(body.quantity));
  if (typeof body.coldChainRequired === "boolean") updates.cold_chain_required = body.coldChainRequired;
  if (typeof body.coldChainStatus === "string") updates.cold_chain_status = body.coldChainStatus;
  if (typeof body.status === "string") updates.status = body.status;

  const serviceClient = getSupabaseServiceClient();
  const { data, error: updateError } = await serviceClient
    .from("inventory_items")
    .update(updates)
    .eq("id", id)
    .select("id, sku, medication_name, lot_number, location_label, quantity, cold_chain_required, cold_chain_status, status, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "operations.inventory.update",
    resourceType: "inventory_item",
    resourceId: id,
    traceId,
    scopeContext: { module: "operations-inventory", patientProfileId: null },
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: { patientProfileId: null, module: "operations-inventory" },
    traceId,
    auditRef,
    data: { item: data },
  });
}

export async function DELETE(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  if (!ensureProviderRole(auth.context.role)) {
    return error({
      traceId,
      error: "Only providers can delete inventory records.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return error({
      traceId,
      error: "id query param is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { error: deleteError } = await serviceClient
    .from("inventory_items")
    .delete()
    .eq("id", id);
  if (deleteError) {
    return error({
      traceId,
      error: deleteError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "operations-inventory" },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "operations.inventory.delete",
    resourceType: "inventory_item",
    resourceId: id,
    traceId,
    scopeContext: { module: "operations-inventory", patientProfileId: null },
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: { patientProfileId: null, module: "operations-inventory" },
    traceId,
    auditRef,
    data: { deletedId: id },
  });
}

