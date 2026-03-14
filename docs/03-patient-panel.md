# Patient Panel

## Goal

Reduce confusion for a patient starting or maintaining specialty medication therapy.

## Route

- Primary: `/dashboard`, `/tasks`, `/adherence`, `/reminders`, `/messages`, `/support`
- Legacy alias: `/patient` redirects to `/dashboard`

## Primary User Story

As a patient, I want to understand what I need to do next, when I need to do it, and when I should contact my care team.

## Core Jobs To Be Done

- understand therapy instructions
- see the next dose or appointment
- complete open onboarding tasks
- review reminders
- ask for help in plain language
- review or send drafted care-team questions

## Current Panel Modules

### Hero Summary

- therapy status
- next appointment
- plain-language next-step summary

### Medication Card

- medication name
- dosage
- frequency
- simple instructions

### Care Team Card

- provider name
- next touchpoint
- provider review entry point

### Checklist

- task title
- plain-language description
- due label
- source: manual or AI-assisted
- status: complete, current, upcoming

### Adherence

- scheduled check-ins
- basic status tracking
- simple note for each event

### Education

- approved short guidance
- first-dose preparation
- care escalation reminders

### AI Assistant

- next-step summary
- drafted questions
- refill timing forecast

### Reminders

- what reminder is coming
- when it fires
- which channel will be used

### Draft Message

- subject
- editable body later
- approval state

## Data Dependencies

- `profiles`
- `patient_profiles`
- `medication_plans`
- `care_tasks`
- `reminders`
- `adherence_check_ins`
- `message_drafts`

## AI Responsibilities

AI may:

- translate medication instructions into a checklist
- draft patient questions
- suggest refill timing
- explain next steps in plain language

AI may not:

- change dosage
- approve a refill
- diagnose side effects
- replace urgent medical guidance

## Required Interactions

- open checklist item details
- confirm reminder window
- review drafted question
- move to provider review when needed
- open chatbot support for education or clarification

## Empty And Error States

- no medication plan yet
- no tasks yet
- reminder delivery unavailable
- AI summary unavailable
- profile incomplete

## Future Enhancements

- mark a task complete
- choose reminder channels
- upload symptom baseline
- attach first-dose notes
- start secure message thread

## Acceptance Criteria

- The patient can understand the therapy plan without reading dense medical text.
- The patient can see the next dose, next appointment, and next task quickly.
- The screen feels supportive, not clinical or overwhelming.
- AI support is visible but does not take control away from the user.
