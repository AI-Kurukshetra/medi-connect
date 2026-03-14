import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface AdherenceRiskBody {
  patientProfileId?: string;
  missedDosesLast30Days?: number;
  reminderAcknowledgementRate?: number;
}

function toRiskScore(input: AdherenceRiskBody) {
  const missed = Math.max(0, input.missedDosesLast30Days ?? 0);
  const reminderRate = Math.min(
    1,
    Math.max(0, input.reminderAcknowledgementRate ?? 0.5),
  );
  const missedWeight = Math.min(0.8, missed * 0.08);
  const acknowledgementPenalty = (1 - reminderRate) * 0.3;
  return Math.min(1, Number((missedWeight + acknowledgementPenalty + 0.1).toFixed(4)));
}

function riskLevel(score: number) {
  if (score >= 0.8) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as AdherenceRiskBody;

  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "ai-adherence-risk",
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

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "ai-adherence-risk",
    traceId,
    patientProfileId: scoped.value.patientProfileId,
  });
  if (!access.ok) return access.response;

  const score = toRiskScore(body);
  const level = riskLevel(score);

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("risk_predictions")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      model_name: "mock-adherence-risk-v1",
      risk_type: "adherence",
      risk_score: score,
      risk_level: level,
      explanation: {
        missedDosesLast30Days: body.missedDosesLast30Days ?? 0,
        reminderAcknowledgementRate: body.reminderAcknowledgementRate ?? 0.5,
      },
      requires_human_approval: true,
    })
    .select("id, model_name, risk_type, risk_score, risk_level, explanation, requires_human_approval, created_at")
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
    action: "ai.adherence_risk.scored",
    resourceType: "risk_prediction",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      riskScore: data.risk_score,
      riskLevel: data.risk_level,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: scoped.value.scopeContext,
    traceId,
    auditRef,
    status: 201,
    data: { prediction: data },
  });
}

