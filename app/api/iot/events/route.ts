import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface IoTEventBody {
  deviceId?: string;
  eventType?: string;
  payload?: Record<string, unknown>;
  occurredAt?: string | null;
}

export async function GET(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const deviceId = new URL(request.url).searchParams.get("deviceId");
  if (!deviceId) {
    return error({
      traceId,
      error: "deviceId query param is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "iot-events" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: device } = await serviceClient
    .from("iot_devices")
    .select("id, patient_profile_id")
    .eq("id", deviceId)
    .maybeSingle();

  if (!device) {
    return error({
      traceId,
      error: "IoT device not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "iot-events" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "iot-events",
    traceId,
    patientProfileId: device.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { data, error: queryError } = await serviceClient
    .from("iot_events")
    .select("id, event_type, payload, occurred_at, created_at")
    .eq("device_id", deviceId)
    .order("occurred_at", { ascending: false });

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: device.patient_profile_id,
        module: "iot-events",
      },
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: device.patient_profile_id,
      module: "iot-events",
    },
    traceId,
    data: { items: data ?? [] },
  });
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as IoTEventBody;

  if (!body.deviceId?.trim() || !body.eventType?.trim()) {
    return error({
      traceId,
      error: "deviceId and eventType are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "iot-events" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: device } = await serviceClient
    .from("iot_devices")
    .select("id, patient_profile_id")
    .eq("id", body.deviceId.trim())
    .maybeSingle();

  if (!device) {
    return error({
      traceId,
      error: "IoT device not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "iot-events" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "iot-events",
    traceId,
    patientProfileId: device.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { data, error: insertError } = await serviceClient
    .from("iot_events")
    .insert({
      device_id: body.deviceId.trim(),
      patient_profile_id: device.patient_profile_id,
      event_type: body.eventType.trim(),
      payload: body.payload ?? {},
      occurred_at: body.occurredAt ?? new Date().toISOString(),
    })
    .select("id, event_type, payload, occurred_at, created_at")
    .single();

  if (insertError) {
    return error({
      traceId,
      error: insertError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: device.patient_profile_id,
        module: "iot-events",
      },
    });
  }

  await serviceClient
    .from("iot_devices")
    .update({ last_seen_at: data.occurred_at })
    .eq("id", body.deviceId.trim());

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "iot.event.create",
    resourceType: "iot_event",
    resourceId: data.id,
    traceId,
    scopeContext: {
      patientProfileId: device.patient_profile_id,
      module: "iot-events",
    },
    metadata: redactedMetadata({
      eventType: data.event_type,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: device.patient_profile_id,
      module: "iot-events",
    },
    traceId,
    auditRef,
    status: 201,
    data: { item: data },
  });
}

