import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface IncidentBody {
  id?: string;
  patientProfileId?: string;
  severity?: "low" | "medium" | "high" | "critical";
  summary?: string;
  source?: string;
  status?: "open" | "acknowledged" | "escalated" | "closed";
}

function defaultSlaHours(severity: "low" | "medium" | "high" | "critical") {
  if (severity === "critical") return 1;
  if (severity === "high") return 4;
  if (severity === "medium") return 8;
  return 24;
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
    module: "emergency-incidents",
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
    .from("escalation_incidents")
    .select("id, severity, status, source, summary, sla_due_at, acknowledged_at, escalated_at, closed_at, created_at, updated_at")
    .eq("patient_profile_id", scoped.value.patientProfileId)
    .order("created_at", { ascending: false });

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
  const body = (await request.json()) as IncidentBody;

  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "emergency-incidents",
    traceId,
    requestedPatientProfileId: body.patientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  if (!scoped.value.patientProfileId) {
    return error({
      traceId,
      error: "No scoped patient profile is available.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  if (!body.severity || !body.summary?.trim()) {
    return error({
      traceId,
      error: "severity and summary are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const slaHours = defaultSlaHours(body.severity);
  const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("escalation_incidents")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      reported_by_user_id: auth.context.userId,
      severity: body.severity,
      status: "open",
      source: body.source?.trim() ?? "manual",
      summary: body.summary.trim(),
      sla_due_at: slaDueAt,
    })
    .select("id, severity, status, source, summary, sla_due_at, created_at, updated_at")
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
    action: "emergency.incident.create",
    resourceType: "escalation_incident",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      severity: data.severity,
      source: data.source,
    }),
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
  const body = (await request.json()) as IncidentBody;

  const id = body.id?.trim();
  if (!id) {
    return error({
      traceId,
      error: "id is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "emergency-incidents" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("escalation_incidents")
    .select("id, patient_profile_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return error({
      traceId,
      error: "Incident not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "emergency-incidents" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "emergency-incidents",
    traceId,
    patientProfileId: existing.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const updates: Record<string, string> = {};
  if (typeof body.summary === "string") updates.summary = body.summary.trim();
  if (typeof body.status === "string") {
    updates.status = body.status;
  }

  if (updates.status === "acknowledged") {
    updates.acknowledged_at = new Date().toISOString();
  }
  if (updates.status === "closed") {
    updates.closed_at = new Date().toISOString();
  }

  const { data, error: updateError } = await serviceClient
    .from("escalation_incidents")
    .update(updates)
    .eq("id", id)
    .select("id, severity, status, source, summary, sla_due_at, acknowledged_at, escalated_at, closed_at, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: existing.patient_profile_id,
        module: "emergency-incidents",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "emergency.incident.update",
    resourceType: "escalation_incident",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "emergency-incidents",
    },
    metadata: redactedMetadata({
      previousStatus: existing.status,
      nextStatus: data.status,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "emergency-incidents",
    },
    traceId,
    auditRef,
    data: { item: data },
  });
}

