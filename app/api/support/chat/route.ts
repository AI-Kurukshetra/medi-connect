import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { patientJourney } from "@/lib/mock-data";
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

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
}

type Severity = "low" | "medium" | "high" | "critical";

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function getSystemPrompt(role: "patient" | "provider", moduleLabel: string) {
  const roleGuidance =
    role === "provider"
      ? [
          "You support care coordinators and providers using the MediConnect MVP.",
          "Keep answers concise, operational, and easy to scan.",
          "Help with workflow questions, follow-up wording, patient-facing summaries, and where to find information in the product.",
        ]
      : [
          "You support patients using the MediConnect MVP.",
          "Use calm plain language, short sentences, and explain what happens next.",
          "Help users understand the product, their checklist, reminders, and how to contact the care team.",
        ];

  return [
    "You are MediConnect Support, a platform help assistant for a hackathon MVP focused on specialty medication care coordination.",
    ...roleGuidance,
    "Your main job is to answer questions about how the platform works and what the user should do next inside the app.",
    "Only describe features that exist in this MVP experience: Dashboard, Tasks, Adherence, Reminders, Messages, Account, Support, Medication Help, and Provider Review.",
    "Do not invent enterprise modules, insurance automation, billing workflows, or hidden backend actions.",
    "You may explain, summarize, and draft. You must not diagnose, interpret symptoms clinically, recommend dosage changes, or make treatment decisions.",
    "If the user asks for medical advice, explain the platform limitation and direct them to their care team.",
    "If the user sounds urgent or unsafe, tell them to seek immediate human help and keep the answer short.",
    "When helpful, reference the current MediConnect demo context:",
    `- Condition: ${patientJourney.profile.condition}`,
    `- Medication: ${patientJourney.medication.name} ${patientJourney.medication.dosage}`,
    `- Therapy status: ${patientJourney.profile.therapyStatus}`,
    `- Next appointment: ${patientJourney.profile.nextAppointmentAt}`,
    `- Current module: ${moduleLabel}`,
    "Keep answers under 180 words unless the user explicitly asks for more detail.",
  ].join("\n");
}

function detectSeverityFromMessage(message: string): Severity {
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

function slaForSeverity(severity: Severity) {
  if (severity === "critical") return 1;
  if (severity === "high") return 4;
  if (severity === "medium") return 8;
  return 24;
}

function buildSupportUserPrompt(params: {
  role: "patient" | "provider";
  message: string;
  moduleLabel: string;
}) {
  return [
    `Role: ${params.role}`,
    `Module: ${params.moduleLabel}`,
    "User request:",
    params.message,
    "",
    "Answer as MediConnect Support.",
    "Prefer platform guidance and next-step clarity over general medical education.",
    "If the question is outside the app or needs clinical judgment, say so clearly and direct them to the care team.",
  ].join("\n");
}

function extractGeminiText(payload: GeminiGenerateContentResponse) {
  const text = payload.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text?.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return text || null;
}

function buildEscalationReply(role: "patient" | "provider", severity: Severity) {
  if (role === "provider") {
    return severity === "critical"
      ? "This message may indicate an urgent safety issue. An escalation incident has been opened for immediate human review. Please move this out of chat and follow your emergency workflow now."
      : "This message may need prompt clinical review. An escalation incident has been opened. Please review the patient context and follow up through the care team workflow.";
  }

  return severity === "critical"
    ? "Your message may describe an urgent health issue. Please seek immediate in-person help or call emergency services now. I also flagged this for human review in MediConnect."
    : "Your message may need prompt human review. Please contact your care team as soon as possible. I also flagged this for follow-up in MediConnect.";
}

async function generateGeminiSupportAnswer(params: {
  role: "patient" | "provider";
  message: string;
  moduleLabel: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Support bot is not configured. Add GEMINI_API_KEY to your environment.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: getSystemPrompt(params.role, params.moduleLabel) }],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: buildSupportUserPrompt(params),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 320,
        },
      }),
    },
  );

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Gemini request failed with status ${response.status}. ${responseText.slice(0, 240)}`,
    );
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;

  if (payload.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked this request: ${payload.promptFeedback.blockReason}.`);
  }

  const answer = extractGeminiText(payload);
  if (!answer) {
    throw new Error("Gemini returned no text content.");
  }

  return answer;
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

  try {
    const answer =
      triggersEscalation
        ? buildEscalationReply(auth.context.role, severity)
        : await generateGeminiSupportAnswer({
            role: auth.context.role,
            message,
            moduleLabel,
          });

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
        provider: triggersEscalation ? "safety-fallback" : "gemini",
        model: triggersEscalation ? null : DEFAULT_GEMINI_MODEL,
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
        answer,
        adverseEvent,
        incident,
        severity,
        provider: triggersEscalation ? "safety-fallback" : "gemini",
        model: triggersEscalation ? null : DEFAULT_GEMINI_MODEL,
      },
    });
  } catch (caughtError) {
    const messageText =
      caughtError instanceof Error ? caughtError.message : "Support generation failed.";

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
        provider: "gemini",
        model: DEFAULT_GEMINI_MODEL,
        generationError: true,
      }),
    });

    return error({
      traceId,
      error: messageText,
      status: 503,
      roleMode: auth.context.role,
      auditRef,
      scopeContext: {
        patientProfileId: auth.context.patientProfileId,
        module: "support-chat",
      },
    });
  }
}
