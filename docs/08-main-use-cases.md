# Main Use Cases

This file describes the end-to-end stories the hackathon MVP must support.

## UC-01 New Patient Creates Account And Starts Onboarding

### Actor

- Patient

### Goal

- Get into MediConnect quickly and understand the first therapy steps.

### Preconditions

- Patient has access to sign-up.
- Specialty medication onboarding data exists or mock data is available.

### Main Flow

1. Patient opens sign-up.
2. Patient enters full name, email, password, and selects patient role.
3. System creates the auth account and patient profile.
4. Patient is routed into `/dashboard`.
5. Patient sees therapy summary, medication card, and checklist.
6. Patient understands the next required action.

### Alternate Flows

- Email confirmation required before access
- Duplicate email error
- Email rate limit error

### Success Outcome

- Patient is authenticated and can begin onboarding without confusion.

## UC-02 Returning Patient Signs In And Completes A Task

### Actor

- Patient

### Goal

- Review current plan and complete the next open setup step.

### Preconditions

- Patient already has an account.

### Main Flow

1. Patient signs in with email and password.
2. System routes patient to `/dashboard`.
3. Patient reviews the hero summary.
4. Patient opens the checklist.
5. Patient identifies the current task.
6. Patient continues the onboarding flow.

### Alternate Flows

- Invalid credentials
- Email not confirmed
- Temporary auth service failure

### Success Outcome

- Patient knows what to do next and does not need external support to understand the screen.

## UC-03 Provider Reviews A Patient And Sends Follow-Up

### Actor

- Provider or care coordinator

### Goal

- Triage one patient quickly and send or approve helpful outreach.

### Preconditions

- Provider account exists.
- Patient data is available.

### Main Flow

1. Provider signs in.
2. System routes provider to `/dashboard`.
3. Provider reviews risk summary and blockers.
4. Provider scans the AI visit brief.
5. Provider reviews drafted outreach.
6. Provider decides whether to approve, edit, or send follow-up.

### Alternate Flows

- No blockers found
- Drafted message unavailable
- AI summary unavailable

### Success Outcome

- Provider can act in under a minute with enough confidence and context.

## UC-04 User Updates Account Profile And Preferences

### Actor

- Patient or provider

### Goal

- Keep account details and reminder preferences current.

### Preconditions

- User is signed in.

### Main Flow

1. User opens account profile.
2. User reviews identity and role information.
3. User updates preferences such as reminder timing or communication channel.
4. System saves changes.
5. Future reminders and profile views reflect the update.

### Alternate Flows

- Validation failure
- permission error
- partial profile data missing

### Success Outcome

- User feels in control of their account and communication preferences.

## UC-05 Patient Uses Chatbot Support For Clarification

### Actor

- Patient

### Goal

- Get a simple explanation or draft a question for the care team.

### Preconditions

- Chatbot support is available.
- Approved source content exists for medication education.

### Main Flow

1. Patient opens chatbot support from `/support`.
2. Patient asks a question such as "What should I do before my first dose?"
3. System returns a short plain-language answer.
4. System suggests the next action or a drafted care-team question.
5. Patient either continues self-service or opens a message draft.

### Alternate Flows

- assistant unavailable
- unclear question
- symptom wording triggers safety escalation

### Success Outcome

- Patient gets help faster without unsafe automation.

## UC-06 Provider Uses Chatbot To Draft Follow-Up

### Actor

- Provider

### Goal

- Save time on summary and communication drafting.

### Preconditions

- Provider is viewing patient context.

### Main Flow

1. Provider opens chatbot support.
2. Provider requests a follow-up summary or outreach draft.
3. System returns a concise summary and draft message.
4. Provider reviews and edits if needed.
5. Provider approves the final action.

### Alternate Flows

- assistant cannot confidently summarize
- patient context incomplete

### Success Outcome

- Provider effort is reduced without removing human approval.

## UC-07 Team Deploys To Preview And Production

### Actor

- Builder or engineer

### Goal

- Ship the app reliably for demo and production-like review.

### Preconditions

- Repo is connected to Vercel.
- environment variables are set.

### Main Flow

1. Engineer pushes a feature branch.
2. Vercel creates a preview deployment.
3. Team verifies auth and core routes.
4. Engineer merges to the production branch.
5. Vercel creates a production deployment.
6. Team runs smoke tests on the live URL.

### Alternate Flows

- missing env variables
- broken auth redirect URL
- failed build

### Success Outcome

- The app is available on a stable deployment target with predictable rollout steps.
