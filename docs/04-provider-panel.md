# Provider Panel

## Goal

Give the provider a fast, low-noise view of patient onboarding progress and follow-up needs.

## Route

- Primary: `/dashboard`, `/tasks`, `/adherence`, `/reminders`, `/messages`, `/support`
- Legacy alias: `/provider` redirects to `/dashboard`

## Primary User Story

As a provider or care coordinator, I want a concise summary of what the patient has completed, what is blocked, and what outreach is needed next.

## Core Jobs To Be Done

- triage the patient quickly
- identify blockers before the first dose
- review adherence prep and open tasks
- approve or edit drafted outreach
- avoid digging through multiple disconnected notes

## Current Panel Modules

### Hero Summary

- risk level
- adherence trend
- provider note
- open blockers count

### Current Blockers

- unresolved patient setup issues
- plain-language list for immediate review

### Recommended Action

- one suggested next move
- one button to compare with patient panel

### Therapy Timeline

- important milestones in order
- where the patient is in the onboarding story

### Adherence Trend

- check-ins
- early signal tracking
- basic context for follow-up

### Care Tasks

- open and completed onboarding tasks
- task status summary

### AI Visit Brief

- condensed patient snapshot
- highest-value context for next review

### Draft Outreach

- message prepared for approval
- clear reminder that sending still needs human control

## Data Dependencies

- `profiles`
- `patient_profiles`
- `care_tasks`
- `adherence_check_ins`
- `message_drafts`
- future provider queue and patient assignment tables

## AI Responsibilities

AI may:

- summarize patient status
- estimate simple risk level
- draft outreach
- highlight blockers

AI may not:

- make clinical decisions
- suppress urgent events
- send final communication automatically
- modify patient records without explicit app action

## Required Interactions

- review blocker details
- open patient panel
- edit or approve draft outreach
- flag a task for follow-up
- open chatbot support for summary or message help

## Future Enhancements

- provider patient list
- queue filters by risk or due date
- escalation labels
- document summary panel
- appointment prep summary

## Acceptance Criteria

- The provider can understand the patient status in less than 30 seconds.
- Open blockers are obvious.
- Draft outreach saves time but still requires provider approval.
- The screen supports action, not passive reporting.
