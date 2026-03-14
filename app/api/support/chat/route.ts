import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface SupportChatBody {
  message?: string;
  module?:
    | "dashboard"
    | "tasks"
    | "adherence"
    | "reminders"
    | "messages"
    | "account"
    | "support"
    | "emergency";
}

function getSystemPrompt(role: "patient" | "provider") {
  if (role === "provider") {
    return "You are a provider support assistant. Keep responses concise, operational, and patient-safe. Do not make diagnosis or treatment decisions.";
  }

  return "You are a patient support assistant. Explain in plain language, keep instructions simple, and recommend contacting the care team for clinical decisions.";
}

function detectSeverityFromMessage(message: string): "low" | "medium" | "high" | "critical" {
  if (/(cannot breathe|trouble breathing|severe chest pain|passed out|anaphylaxis)/i.test(message)) {
    return "critical";
  }
  if (/(chest pain|swelling|severe rash|blood pressure drop|faint)/i.test(message)) {
    return "high";
  }
  if (/(nausea|dizziness|headache|pain)/i.test(message)) {
    return "medium";
  }
  return "low";
}

function slaForSeverity(severity: "low" | "medium" | "high" | "critical") {
  if (severity === "critical") return 1;
  if (severity === "high") return 4;
  if (severity === "medium") return 8;
  return 24;
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as SupportChatBody;
  const message = body.message?.trim();

  if (!message) {
    return error({
      traceId,
      error: "message is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: auth.context.patientProfileId,
        module: "support-chat",
      },
    });
  }

  const systemPrompt = getSystemPrompt(auth.context.role);
  const moduleLabel = body.module ?? "support";
  const severity = detectSeverityFromMessage(message);
  const triggersEscalation = severity === "high" || severity === "critical";

  const serviceClient = getSupabaseServiceClient();

  let adverseEvent: {
    id: string;
    severity: string;
    status: string;
    linked_incident_id: string | null;
  } | null = null;
  let incident: {
    id: string;
    severity: string;
    status: string;
    source: string;
    sla_due_at: string | null;
  } | null = null;

  if (auth.context.patientProfileId) {
    const adverseInsert = await serviceClient
      .from("adverse_events")
      .insert({
        patient_profile_id: auth.context.patientProfileId,
        reported_by_user_id: auth.context.userId,
        symptom_text: message,
        severity,
        status: triggersEscalation ? "linked_to_incident" : "reviewed",
      })
      .select("id, severity, status, linked_incident_id")
      .single();

    if (!adverseInsert.error) {
      adverseEvent = adverseInsert.data;
    }

    if (triggersEscalation) {
      const slaHours = slaForSeverity(severity);
      const incidentInsert = await serviceClient
        .from("escalation_incidents")
        .insert({
          patient_profile_id: auth.context.patientProfileId,
          reported_by_user_id: auth.context.userId,
          severity,
          status: "open",
          source: "support-chat",
          summary: `Support chat triggered ${severity} severity review.`,
          sla_due_at: new Date(
            Date.now() + slaHours * 60 * 60 * 1000,
          ).toISOString(),
        })
        .select("id, severity, status, source, sla_due_at")
        .single();

      if (!incidentInsert.error) {
        incident = incidentInsert.data;
        if (adverseEvent) {
          await serviceClient
            .from("adverse_events")
            .update({ linked_incident_id: incident.id })
            .eq("id", adverseEvent.id);
        }
      }
    }
  }

  const reply =
    auth.context.role === "provider"
      ? `Provider support (${moduleLabel}): review blockers, confirm ownership, and queue follow-up actions requiring approval.`
      : `Patient support (${moduleLabel}): complete one next step, review reminders, and notify your care team if symptoms worsen.`;

  const safetySuffix = triggersEscalation
    ? "Safety note: this message triggered an escalation incident for human review."
    : "Safety note: no emergency escalation was triggered from this message.";

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "support.chat.message",
    resourceType: "support_chat",
    resourceId: incident?.id ?? adverseEvent?.id ?? null,
    traceId,
    scopeContext: {
      patientProfileId: auth.context.patientProfileId,
      module: "support-chat",
    },
    metadata: redactedMetadata({
      severity,
      escalationTriggered: triggersEscalation,
      module: moduleLabel,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: auth.context.patientProfileId,
      module: "support-chat",
    },
    traceId,
    auditRef,
    data: {
      systemPrompt,
      answer: `${reply}\n\n${safetySuffix}\n\nQuestion received: "${message}"`,
      adverseEvent,
      incident,
      severity,
    },
  });
}

