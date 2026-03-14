import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface AdverseRiskBody {
  patientProfileId?: string;
  symptomText?: string;
  reportedSeverity?: "low" | "medium" | "high" | "critical";
}

function scoreFromSeverity(severity: "low" | "medium" | "high" | "critical") {
  if (severity === "critical") return 0.94;
  if (severity === "high") return 0.78;
  if (severity === "medium") return 0.46;
  return 0.2;
}

function levelFromScore(score: number) {
  if (score >= 0.85) return "critical";
  if (score >= 0.65) return "high";
  if (score >= 0.35) return "medium";
  return "low";
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as AdverseRiskBody;

  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "ai-adverse-risk",
    traceId,
    requestedPatientProfileId: body.patientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  if (!scoped.value.patientProfileId || !body.symptomText?.trim()) {
    return error({
      traceId,
      error: "patientProfileId and symptomText are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "ai-adverse-risk",
    traceId,
    patientProfileId: scoped.value.patientProfileId,
  });
  if (!access.ok) return access.response;

  const reportedSeverity = body.reportedSeverity ?? "medium";
  const baseScore = scoreFromSeverity(reportedSeverity);
  const keywordBoost = /(breath|chest|faint|severe|swelling|anaphylaxis)/i.test(
    body.symptomText,
  )
    ? 0.12
    : 0;
  const riskScore = Math.min(1, Number((baseScore + keywordBoost).toFixed(4)));
  const riskLevel = levelFromScore(riskScore);

  const serviceClient = getSupabaseServiceClient();
  const { data: riskPrediction, error: predictionError } = await serviceClient
    .from("risk_predictions")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      model_name: "mock-adverse-event-v1",
      risk_type: "adverse-event",
      risk_score: riskScore,
      risk_level: riskLevel,
      explanation: {
        reportedSeverity,
        keywordBoost,
        triggerPhraseMatch: keywordBoost > 0,
      },
      requires_human_approval: true,
    })
    .select("id, model_name, risk_type, risk_score, risk_level, explanation, requires_human_approval, created_at")
    .single();

  if (predictionError) {
    return error({
      traceId,
      error: predictionError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const { data: adverseEvent, error: adverseError } = await serviceClient
    .from("adverse_events")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      reported_by_user_id: auth.context.userId,
      symptom_text: body.symptomText.trim(),
      severity: riskLevel,
      status: "reviewed",
    })
    .select("id, symptom_text, severity, status, linked_incident_id, created_at")
    .single();

  if (adverseError) {
    return error({
      traceId,
      error: adverseError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  let incident = null;
  if (riskLevel === "high" || riskLevel === "critical") {
    const slaHours = riskLevel === "critical" ? 1 : 4;
    const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
    const incidentInsert = await serviceClient
      .from("escalation_incidents")
      .insert({
        patient_profile_id: scoped.value.patientProfileId,
        reported_by_user_id: auth.context.userId,
        severity: riskLevel,
        status: "open",
        source: "ai-adverse-risk",
        summary: `AI adverse-event risk flagged as ${riskLevel}.`,
        sla_due_at: slaDueAt,
      })
      .select("id, severity, status, source, summary, sla_due_at, created_at")
      .single();

    if (incidentInsert.error) {
      return error({
        traceId,
        error: incidentInsert.error.message,
        status: 500,
        roleMode: auth.context.role,
        scopeContext: scoped.value.scopeContext,
      });
    }

    incident = incidentInsert.data;
    await serviceClient
      .from("adverse_events")
      .update({
        status: "linked_to_incident",
        linked_incident_id: incident.id,
      })
      .eq("id", adverseEvent.id);
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "ai.adverse_risk.scored",
    resourceType: "risk_prediction",
    resourceId: riskPrediction.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      riskScore,
      riskLevel,
      autoEscalated: Boolean(incident),
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: scoped.value.scopeContext,
    traceId,
    auditRef,
    status: 201,
    data: {
      prediction: riskPrediction,
      adverseEvent,
      incident,
    },
  });
}

