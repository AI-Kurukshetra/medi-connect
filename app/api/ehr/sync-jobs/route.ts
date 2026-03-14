import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface SyncJobBody {
  ehrLinkId?: string;
  jobType?: string;
  idempotencyKey?: string;
}

export async function GET(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const linkId = new URL(request.url).searchParams.get("ehrLinkId");
  if (!linkId) {
    return error({
      traceId,
      error: "ehrLinkId query param is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "ehr-sync-jobs" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: link } = await serviceClient
    .from("ehr_links")
    .select("id, patient_profile_id")
    .eq("id", linkId)
    .maybeSingle();

  if (!link) {
    return error({
      traceId,
      error: "EHR link not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "ehr-sync-jobs" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "ehr-sync-jobs",
    traceId,
    patientProfileId: link.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { data, error: queryError } = await serviceClient
    .from("ehr_sync_jobs")
    .select("id, job_type, status, idempotency_key, started_at, finished_at, error_message, created_at")
    .eq("ehr_link_id", linkId)
    .order("created_at", { ascending: false });

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: link.patient_profile_id,
        module: "ehr-sync-jobs",
      },
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: link.patient_profile_id,
      module: "ehr-sync-jobs",
    },
    traceId,
    data: { items: data ?? [] },
  });
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as SyncJobBody;
  if (!body.ehrLinkId?.trim() || !body.jobType?.trim()) {
    return error({
      traceId,
      error: "ehrLinkId and jobType are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "ehr-sync-jobs" },
    });
  }

  const idempotencyKey =
    body.idempotencyKey?.trim() ??
    `${body.ehrLinkId.trim()}:${body.jobType.trim()}:${new Date().toISOString()}`;

  const serviceClient = getSupabaseServiceClient();
  const { data: link } = await serviceClient
    .from("ehr_links")
    .select("id, patient_profile_id")
    .eq("id", body.ehrLinkId.trim())
    .maybeSingle();

  if (!link) {
    return error({
      traceId,
      error: "EHR link not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "ehr-sync-jobs" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "ehr-sync-jobs",
    traceId,
    patientProfileId: link.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { data, error: insertError } = await serviceClient
    .from("ehr_sync_jobs")
    .insert({
      ehr_link_id: body.ehrLinkId.trim(),
      job_type: body.jobType.trim(),
      status: "queued",
      idempotency_key: idempotencyKey,
    })
    .select("id, job_type, status, idempotency_key, created_at")
    .single();

  if (insertError) {
    return error({
      traceId,
      error: insertError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: link.patient_profile_id,
        module: "ehr-sync-jobs",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "ehr.sync_job.create",
    resourceType: "ehr_sync_job",
    resourceId: data.id,
    traceId,
    scopeContext: {
      patientProfileId: link.patient_profile_id,
      module: "ehr-sync-jobs",
    },
    metadata: redactedMetadata({
      jobType: data.job_type,
      idempotencyKey: data.idempotency_key,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: link.patient_profile_id,
      module: "ehr-sync-jobs",
    },
    traceId,
    auditRef,
    status: 201,
    data: { item: data },
  });
}

