import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface EnrollmentBody {
  patientProfileId?: string;
  programId?: string;
  eligibilitySnapshot?: Record<string, unknown>;
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
    module: "assistance-enrollments",
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
    .from("assistance_enrollments")
    .select("id, program_id, status, eligibility_snapshot, submitted_at, reviewed_at, updated_at")
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
  const body = (await request.json()) as EnrollmentBody;

  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "assistance-enrollments",
    traceId,
    requestedPatientProfileId: body.patientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  if (!scoped.value.patientProfileId || !body.programId?.trim()) {
    return error({
      traceId,
      error: "patientProfileId and programId are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "assistance-enrollments",
    traceId,
    patientProfileId: scoped.value.patientProfileId,
  });
  if (!access.ok) return access.response;

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("assistance_enrollments")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      program_id: body.programId.trim(),
      status: "draft",
      eligibility_snapshot: body.eligibilitySnapshot ?? {},
    })
    .select("id, program_id, status, eligibility_snapshot, submitted_at, reviewed_at, updated_at")
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
    action: "assistance.enrollment.create",
    resourceType: "assistance_enrollment",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      status: data.status,
      programId: data.program_id,
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

