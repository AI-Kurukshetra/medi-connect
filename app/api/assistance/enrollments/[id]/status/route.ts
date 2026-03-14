import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface EnrollmentStatusBody {
  status?: "draft" | "submitted" | "approved" | "denied" | "expired";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await request.json()) as EnrollmentStatusBody;

  if (!body.status) {
    return error({
      traceId,
      error: "status is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "assistance-status" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: enrollment } = await serviceClient
    .from("assistance_enrollments")
    .select("id, patient_profile_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!enrollment) {
    return error({
      traceId,
      error: "Enrollment not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "assistance-status" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "assistance-status",
    traceId,
    patientProfileId: enrollment.patient_profile_id,
  });
  if (!access.ok) return access.response;

  if (auth.context.role === "patient" && !["draft", "submitted"].includes(body.status)) {
    return error({
      traceId,
      error: "Patients can only set draft or submitted status.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: enrollment.patient_profile_id,
        module: "assistance-status",
      },
    });
  }

  const updates: Record<string, string | null> = {
    status: body.status,
    submitted_at: body.status === "submitted" ? new Date().toISOString() : null,
    reviewed_at:
      body.status === "approved" || body.status === "denied"
        ? new Date().toISOString()
        : null,
  };

  const { data, error: updateError } = await serviceClient
    .from("assistance_enrollments")
    .update(updates)
    .eq("id", id)
    .select("id, program_id, status, eligibility_snapshot, submitted_at, reviewed_at, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: enrollment.patient_profile_id,
        module: "assistance-status",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "assistance.enrollment.status_update",
    resourceType: "assistance_enrollment",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: enrollment.patient_profile_id,
      module: "assistance-status",
    },
    metadata: redactedMetadata({
      previousStatus: enrollment.status,
      nextStatus: data.status,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: enrollment.patient_profile_id,
      module: "assistance-status",
    },
    traceId,
    auditRef,
    data: { item: data },
  });
}

