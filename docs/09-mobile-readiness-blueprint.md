# Mobile Readiness Blueprint

## Goal

Prepare a stable API-first contract for a future React Native / Expo app without blocking current web delivery.

## Current Readiness Deliverables

- Shared role-aware post-login route architecture already exists on web.
- Mobile session bridge endpoint is available at `/api/auth/mobile/session`.
- OpenAPI contract baseline is documented in `docs/openapi-core.yaml`.
- Domain APIs are normalized to include envelope metadata:
  - `roleMode`
  - `scopeContext`
  - `traceId`
  - `auditRef` (mutation flows)

## Recommended React Native App v1 Scope

- Auth: sign-in, sign-up, mobile session binding
- Dashboard: role-aware summary cards
- Tasks + reminders
- Emergency incidents and contacts

## API Contract Notes

- Access token is exchanged through `/api/auth/mobile/session` to establish secure cookie-backed session.
- All business APIs remain shared and role-aware; mobile should not use separate role routes.
- Server enforces ownership/assignment checks on mutable routes.

## Next Implementation Wave (Native)

1. Create `apps/mobile` with Expo + TypeScript.
2. Add typed API SDK generated from `openapi-core.yaml`.
3. Implement auth and dashboard flows first.
4. Add offline cache for tasks/reminders and queued incident submissions.

