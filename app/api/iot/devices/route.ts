import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface DeviceBody {
  id?: string;
  patientProfileId?: string;
  deviceType?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status?: "active" | "inactive" | "retired";
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
    module: "iot-devices",
    traceId,
    requestedPatientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  if (!scoped.value.patientProfileId) {
    return ok({
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
      traceId,
      data: { items: [] },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error: queryError } = await serviceClient
    .from("iot_devices")
    .select("id, device_type, manufacturer, model, serial_number, status, last_seen_at, updated_at")
    .eq("patient_profile_id", scoped.value.patientProfileId)
    .order("updated_at", { ascending: false });

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
      error: "Only providers can register devices.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "iot-devices" },
    });
  }

  const body = (await request.json()) as DeviceBody;
  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "iot-devices",
    traceId,
    requestedPatientProfileId: body.patientProfileId,
  });
  if (!scoped.ok) return scoped.response;
  if (!scoped.value.patientProfileId || !body.deviceType?.trim() || !body.serialNumber?.trim()) {
    return error({
      traceId,
      error: "patientProfileId, deviceType and serialNumber are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "iot-devices",
    traceId,
    patientProfileId: scoped.value.patientProfileId,
  });
  if (!access.ok) return access.response;

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("iot_devices")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      device_type: body.deviceType.trim(),
      manufacturer: body.manufacturer?.trim() ?? "unknown",
      model: body.model?.trim() ?? "unknown",
      serial_number: body.serialNumber.trim(),
      status: body.status ?? "active",
      last_seen_at: new Date().toISOString(),
    })
    .select("id, device_type, manufacturer, model, serial_number, status, last_seen_at, updated_at")
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
    action: "iot.device.create",
    resourceType: "iot_device",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: scoped.value.scopeContext,
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
  const body = (await request.json()) as DeviceBody;
  const id = body.id?.trim();

  if (!id) {
    return error({
      traceId,
      error: "id is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "iot-devices" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("iot_devices")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return error({
      traceId,
      error: "Device not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "iot-devices" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "iot-devices",
    traceId,
    patientProfileId: existing.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const updates: Record<string, string> = {};
  if (typeof body.status === "string") updates.status = body.status;
  if (typeof body.model === "string") updates.model = body.model.trim();
  if (typeof body.manufacturer === "string") updates.manufacturer = body.manufacturer.trim();
  updates.last_seen_at = new Date().toISOString();

  const { data, error: updateError } = await serviceClient
    .from("iot_devices")
    .update(updates)
    .eq("id", id)
    .select("id, device_type, manufacturer, model, serial_number, status, last_seen_at, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: existing.patient_profile_id,
        module: "iot-devices",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "iot.device.update",
    resourceType: "iot_device",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "iot-devices",
    },
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "iot-devices",
    },
    traceId,
    auditRef,
    data: { item: data },
  });
}

