# Main Dashboard

## Goal

Provide one authenticated starting point after login and branch into shared modules without URL changes by role.

## Route

- `/dashboard`

## Status

Implemented as the canonical post-login destination.

## Behavior

The dashboard must:

- confirm role mode (`patient` or `provider`)
- summarize scoped workload counts (tasks, adherence, reminders, messages)
- provide quick actions to shared modules

## Role Modes

### Patient Mode

- focuses on own profile and care progression
- sees patient-owned records
- cannot mutate provider-only fields

### Provider Mode

- uses provider-to-patient assignment scope
- sees assigned patient context only
- can perform provider-allowed edits

## Core Sections

- role-aware hero summary
- module counters
- quick links to `/tasks`, `/adherence`, `/reminders`, `/messages`, `/account`, `/support`
- sign-out action

## Security Rules

- hard auth guard on `/dashboard`
- no guest preview
- server-side role/session resolution

## Acceptance Criteria

- successful auth lands on `/dashboard`
- same URL renders role-aware content
- empty states are shown instead of forced redirects when scoped data is missing
- legacy `/patient` and `/provider` still resolve via redirect to `/dashboard`

