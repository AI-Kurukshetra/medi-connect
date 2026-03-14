# AI Integration Research

## Goal

Define how MediConnect should use AI across the product requirements without trying to turn AI into the system of record for regulated pharmacy workflows.

## Executive Recommendation

Use AI as an orchestration and simplification layer on top of a small set of deterministic product actions.

For the hackathon MVP:

- Make AI responsible for explanation, summarization, checklist generation, message drafting, reminder personalization, simple risk flagging, and document summarization.
- Keep real state changes deterministic: appointment creation, reminder persistence, patient profile updates, document uploads, and escalation flags.
- Do not let AI own prescription execution, insurance decisions, dosage recommendations, billing, or supply-chain operations.

Recommended stack:

- OpenAI Responses API as the main AI runtime
- Structured outputs for every UI-facing response contract
- Tool calling for app actions
- File search for trusted educational and product content
- Moderation for patient and provider message flows
- Eval suites before trusting any health-adjacent prompt behavior
- Vercel AI SDK in the Next.js app for streaming and UI integration

## Requirement Coverage Map

| Requirement | AI Role | Recommendation |
| --- | --- | --- |
| Patient Portal & Dashboard | AI-first assist | Generate a plain-language dashboard summary, next-step checklist, and patient-specific FAQ cards. |
| Prescription Management System | AI-assist only | Summarize prescription context and explain the therapy plan, but keep prescription data and actions deterministic. |
| Provider Network Management | Minimal AI | Later use AI for internal search, profile summarization, or onboarding drafts. Not needed for the hackathon MVP. |
| Insurance Verification & Prior Authorization | AI-assist only | If ever added, use AI to summarize status and draft missing-information requests. Do not let AI make approval decisions. |
| Medication Adherence Tracking | AI-first assist | Generate dose reminders, identify missed-check-in patterns, and draft follow-up prompts. |
| Clinical Support Services | AI-assist with escalation | Use AI for intake, summarization, and routing. Human clinicians remain the decision makers. |
| Supply Chain Management | No AI in MVP | This is mostly deterministic logistics and should be deferred. |
| Patient Assistance Programs | AI-assist later | Summarize eligibility inputs and draft outreach, but do not automate decisions for the MVP. |
| Electronic Health Record Integration | AI-assist after integration | If records are imported later, use AI only to summarize and normalize external data. |
| Appointment Scheduling System | AI-assist | Translate patient preferences into suggested slots or prep checklists, but actual scheduling stays deterministic. |
| Secure Messaging Platform | AI-first assist | Draft patient questions, provider replies, urgency labels, and thread summaries. |
| Side Effect & Adverse Event Reporting | AI-assist with hard guardrails | Normalize free text, ask follow-up questions, and flag urgent cases for human review. |
| Educational Content Library | AI-first assist | Build Q&A and explainers over approved education content using retrieval. |
| Refill Management System | AI-first assist | Forecast refill timing, explain urgency, and draft refill reminders. |
| Care Plan Management | AI-first assist | Generate milestone checklists and visit-prep summaries from structured patient context. |
| Multi-channel Notifications | AI-assist | Personalize copy and timing windows, but sending remains deterministic. |
| Document Management System | AI-first assist | Summarize uploads, extract key facts, and tag documents for the care team. |
| Billing & Payment Processing | No AI in MVP | Defer. AI can later explain invoices, but should not control payment logic. |
| Mobile Application | Channel only | Reuse the same AI endpoints later if a mobile client is added. |
| Reporting & Analytics Dashboard | AI-assist | Summarize trends, anomalies, and patient cohorts for providers or admins. |
| Pharmacy Network Integration | No AI in MVP | Deterministic systems integration problem. Defer. |
| Quality Assurance System | Minimal AI later | Possible use for anomaly summaries, but not part of the first product story. |
| Emergency Contact System | AI-assist with immediate escalation | Detect urgent language and route to human or emergency workflows; do not rely on AI alone. |

## Advanced Feature Triage

Build now:

- natural language patient support chat
- AI visit summaries
- adherence risk hints based on missed tasks
- document summarization

Maybe later:

- real-time health monitoring summaries
- telehealth prep and post-visit summarization
- voice reminders or voice assistant entry points

Do not attempt in the hackathon build:

- dosage optimization
- adverse event prediction from broad medical history
- genomic recommendations
- pricing optimization
- clinical trial matching
- AI avatar pharmacist experiences

## Recommended AI Architecture

```text
Next.js UI
  -> Vercel AI SDK hooks/components
  -> /api/ai/* route handlers
  -> OpenAI Responses API
       -> structured output generation
       -> tool calls into app actions
       -> file search over approved docs
       -> moderation checks
  -> local mock data or Supabase later
```

## Core AI Endpoints

Start with these route handlers:

- `/api/ai/patient-summary`
  - Input: patient profile, medication, open tasks
  - Output: dashboard summary, next steps, quick questions
- `/api/ai/checklist`
  - Input: medication instructions, therapy status, reminders
  - Output: structured checklist and reminder suggestions
- `/api/ai/message-draft`
  - Input: thread context, sender role, intent
  - Output: subject, body, tone notes, escalation label
- `/api/ai/provider-brief`
  - Input: adherence logs, tasks, patient notes
  - Output: risk level, blockers, recommended follow-up
- `/api/ai/side-effect-intake`
  - Input: patient free text, symptom history
  - Output: normalized symptom summary, follow-up questions, escalation flag
- `/api/ai/doc-summary`
  - Input: uploaded file text
  - Output: summary, extracted facts, suggested tags
- `/api/ai/content-answer`
  - Input: patient question
  - Output: grounded answer from approved education content

## Use Structured Outputs Everywhere

Every AI endpoint should return a strict schema so the UI never parses free-form text.

Example contracts:

```ts
type PatientSummary = {
  summary: string;
  nextSteps: string[];
  reminders: string[];
  suggestedQuestions: string[];
};

type ProviderBrief = {
  riskLevel: "low" | "medium" | "high";
  blockers: string[];
  suggestedAction: string;
  rationale: string;
};

type SideEffectIntake = {
  normalizedSummary: string;
  followUpQuestions: string[];
  escalation: "none" | "same_day" | "urgent";
};
```

## Where Tool Calling Fits

Use tool calls for actions that the model may suggest but the app should execute:

- create or update a reminder
- save a checklist item
- draft a secure message
- mark a task as flagged
- attach a document summary to a patient record
- open escalation guidance for the care team

The model should propose these actions through tools. The app should validate and perform them.

## Retrieval Strategy

Use retrieval only over trusted, approved sources:

- medication education content
- onboarding instructions
- clinic FAQs
- hackathon product knowledge

Do not let the model answer product or medication questions from its own memory when a trusted local source exists.

## Message and Safety Guardrails

AI behavior should be constrained to:

- explanation
- summarization
- drafting
- classification
- routing

AI should not:

- diagnose
- select dosage
- approve prior authorization
- determine payment outcomes
- override human escalation

For symptoms or adverse event flows:

- always ask follow-up questions in plain language
- always include an escalation label
- always display a human review or urgent help fallback

## Conversation Design

For patient and provider threads:

- keep structured thread state in the app database
- pass selected prior context to the model
- use response chaining where it improves continuity
- store normalized outputs, not only raw assistant text

## Evaluation Plan

Before trusting any production-like behavior, create evals for:

- groundedness to approved education content
- checklist completeness
- unsafe advice detection
- adverse-event escalation quality
- reminder usefulness
- provider summary accuracy
- message tone and clarity

Seed the eval set with realistic examples from one therapeutic area, preferably rheumatology because the current demo data already fits that path.

## Hackathon Delivery Plan

### Phase 1

- patient summary generation
- AI checklist generation
- message drafting
- provider brief generation
- education Q&A over approved content

### Phase 2

- side-effect intake flow
- document summarization
- refill timing suggestions
- reminder copy personalization

### Phase 3

- analytics summaries
- appointment prep assistant
- support for imported clinical documents

## Best First Build in This Repo

If we start implementation now, the most valuable first AI slice is:

1. Build a single `/api/ai/assistant` orchestration route or a small set of focused routes.
2. Add structured outputs for `PatientSummary`, `ProviderBrief`, and `MessageDraft`.
3. Replace static mock summary text in the current patient and provider screens with live AI-generated mock-backed responses.
4. Add moderation checks on message drafting and side-effect intake before rendering responses.
5. Add a tiny eval dataset of good and bad examples before expanding features.

## Sources Consulted

- OpenAI Docs: Responses API
- OpenAI Docs: Structured Outputs
- OpenAI Docs: File Search Tool
- OpenAI Docs: Conversation State
- OpenAI Docs: Moderation
- OpenAI Docs: Evaluating model performance
- Vercel AI SDK docs
