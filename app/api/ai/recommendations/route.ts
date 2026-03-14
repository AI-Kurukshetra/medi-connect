import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface RecommendationBody {
  patientProfileId?: string;
  focus?: "adherence" | "adverse-event" | "general";
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as RecommendationBody;

  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "ai-recommendations",
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
    module: "ai-recommendations",
    traceId,
    patientProfileId: scoped.value.patientProfileId,
  });
  if (!access.ok) return access.response;

  const serviceClient = getSupabaseServiceClient();
  const { data: predictions } = await serviceClient
    .from("risk_predictions")
    .select("risk_type, risk_score, risk_level, created_at")
    .eq("patient_profile_id", scoped.value.patientProfileId)
    .order("created_at", { ascending: false })
    .limit(5);

  const focus = body.focus ?? "general";
  const topPrediction = (predictions ?? []).find((item) =>
    focus === "general" ? true : item.risk_type === focus,
  );

  const recommendations = topPrediction
    ? [
        "Review latest risk signal and confirm patient-reported context.",
        "Use shared modules to schedule next follow-up action.",
        "Require provider approval before any care-plan adjustment.",
      ]
    : [
        "No recent prediction found. Run risk scoring endpoint first.",
        "Continue baseline adherence reminders.",
        "Escalate only if new symptoms or missed-dose patterns emerge.",
      ];

  return ok({
    roleMode: auth.context.role,
    scopeContext: scoped.value.scopeContext,
    traceId,
    data: {
      focus,
      topPrediction: topPrediction ?? null,
      recommendations,
      nonAutonomous: true,
    },
  });
}

