# Chatbot Support

## Goal

Provide a safe, plain-language assistant that reduces user confusion without pretending to replace a clinician or a care coordinator.

## Entry Points

- shared `/support` route (role-aware mode)
- optional in-panel entry points from dashboard modules

## Primary Users

- patient with onboarding questions
- patient reviewing reminders or first-dose prep
- provider needing a quick summary or drafted message

## Core Supported Intents

### Patient Intents

- "What should I do next?"
- "What does this medication instruction mean?"
- "Help me prepare questions for my care team."
- "When should I request a refill?"
- "What reminder options do I have?"

### Provider Intents

- "Summarize this patient before the next review."
- "Draft a follow-up message."
- "Show the biggest blockers."
- "Explain the current onboarding status."

## Recommended AI Jobs

- explanation
- summarization
- checklist generation
- message drafting
- reminder copy suggestions
- educational Q&A over approved content

## AI Jobs To Avoid

- diagnosis
- dosage advice
- emergency triage without human escalation
- insurance decision making
- autonomous clinical recommendations

## Product Behavior

### Patient Mode

- answers should be short and plain-language
- responses should point to the next action
- symptom mentions should trigger cautious follow-up guidance

### Provider Mode

- answers should be concise and structured
- responses should highlight blockers and suggested action
- drafted communication should remain editable

## Suggested Backend Shape

- `/api/ai/patient-summary`
- `/api/ai/provider-brief`
- `/api/ai/message-draft`
- `/api/ai/content-answer`
- future `/api/ai/side-effect-intake`

## Required Guardrails

- structured outputs for UI-bound responses
- moderation for message and symptom flows
- retrieval over approved content when answering education questions
- explicit fallback when the assistant is unsure
- urgent symptom language must escalate to human review

## Conversation UX Rules

- start with quick prompts
- keep answers short by default
- expose source context in human language when helpful
- end with one suggested next action
- never flood the screen with long paragraphs

## Fallback States

- assistant unavailable
- content unavailable
- safety escalation triggered
- model response invalid for UI schema

## Acceptance Criteria

- The chatbot makes the product easier to use, not harder.
- Patient answers remain understandable without medical jargon.
- Provider answers remain brief and operational.
- High-risk questions are escalated instead of answered with false confidence.
