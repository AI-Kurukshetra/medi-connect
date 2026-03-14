import { NextResponse } from "next/server";
import { jsonValidationError, requireApiAuthContext } from "@/lib/auth/api";

interface SupportChatBody {
  message?: string;
  module?: "dashboard" | "tasks" | "adherence" | "reminders" | "messages" | "account" | "support";
}

function getSystemPrompt(role: "patient" | "provider") {
  if (role === "provider") {
    return "You are a provider support assistant. Keep responses concise, operational, and patient-safe. Do not make diagnosis or treatment decisions.";
  }

  return "You are a patient support assistant. Explain in plain language, keep instructions simple, and recommend contacting the care team for clinical decisions.";
}

export async function POST(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as SupportChatBody;
  const message = body.message?.trim();

  if (!message) {
    return jsonValidationError("message is required.");
  }

  const systemPrompt = getSystemPrompt(auth.context.role);
  const moduleLabel = body.module ?? "support";

  const reply =
    auth.context.role === "provider"
      ? `Provider support (${moduleLabel}): prioritize blockers, confirm ownership, and queue the next outreach action for approval.`
      : `Patient support (${moduleLabel}): break the next step into one small action, then check reminders and tasks for timing.`;

  return NextResponse.json({
    roleMode: auth.context.role,
    systemPrompt,
    answer: `${reply}\n\nQuestion received: "${message}"`,
  });
}

