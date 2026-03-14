import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getPayerClient } from "@/lib/integrations/payer";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface VerificationBody {
  patientProfileId?: string;
  payerName?: string;
  memberId?: string;
  planName?: string;
  medicationName?: string;
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
    module: "insurance",
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
    .from("insurance_policies")
    .select("id, payer_name, member_id, plan_name, status, verified_at, updated_at")
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

  const body = (await request.json()) as VerificationBody;
  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "insurance",
    traceId,
    requestedPatientProfileId: body.patientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  const patientProfileId = scoped.value.patientProfileId;
  if (!patientProfileId) {
    return error({
      traceId,
      error: "No scoped patient profile is available for verification.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  if (!body.payerName?.trim() || !body.memberId?.trim() || !body.planName?.trim()) {
    return error({
      traceId,
      error: "payerName, memberId, and planName are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const medicationName = body.medicationName?.trim() || "Unknown medication";
  const payerClient = getPayerClient();
  const verification = await payerClient.verifyBenefits({
    payerName: body.payerName.trim(),
    memberId: body.memberId.trim(),
    medicationName,
  });

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("insurance_policies")
    .insert({
      patient_profile_id: patientProfileId,
      payer_name: body.payerName.trim(),
      member_id: body.memberId.trim(),
      plan_name: body.planName.trim(),
      status:
        verification.status === "verified"
          ? "active"
          : verification.status === "manual_review"
            ? "pending"
            : "inactive",
      verified_at:
        verification.status === "verified" ? new Date().toISOString() : null,
    })
    .select("id, payer_name, member_id, plan_name, status, verified_at, updated_at")
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
    action: "insurance.verification.create",
    resourceType: "insurance_policy",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      payerProvider: payerClient.provider,
      verificationStatus: verification.status,
      priorAuthRequired: verification.priorAuthRequired,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: scoped.value.scopeContext,
    traceId,
    auditRef,
    status: 201,
    data: {
      item: data,
      verification,
      adapterProvider: payerClient.provider,
    },
  });
}

