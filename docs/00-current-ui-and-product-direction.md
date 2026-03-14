# Current UI And Product Direction

## Short Answer

The product flow is now:

1. Landing page (`/`)
2. Sign in or sign up (`/sign-in`, `/sign-up`)
3. Shared authenticated routes (`/dashboard`, `/tasks`, `/adherence`, `/reminders`, `/messages`, `/account`, `/support`)
4. Enterprise modules (`/prior-auth`, `/ehr`, `/operations`, `/assistance`, `/documents`, `/billing`, `/emergency`, `/ai-insights`)

## Why This Changed

Earlier, the product used separate post-login route trees (`/patient` and `/provider`).
That made navigation and maintenance harder.

Now, URLs are shared and role behavior is resolved inside each page and API.

## Current Routing Model

- Canonical post-login routes:
  - `/dashboard`
  - `/tasks`
  - `/adherence`
  - `/reminders`
  - `/messages`
  - `/account`
  - `/support`
  - `/prior-auth`
  - `/ehr`
  - `/operations`
  - `/assistance`
  - `/documents`
  - `/billing`
  - `/emergency`
  - `/ai-insights`
- Legacy compatibility aliases:
  - `/patient` -> redirects to `/dashboard`
  - `/provider` -> redirects to `/dashboard`

## Current Auth Behavior

- Unauthenticated access to shared routes redirects to `/sign-in`.
- Successful sign-in/sign-up redirects to `/dashboard`.
- Role is still required (`patient` or `provider`) and controls module behavior.

## Product Direction

MediConnect remains focused on clear care coordination:

- help patients understand next steps
- help providers triage quickly
- use AI for explanation, summary, and draft support

Out of scope for MVP:

- billing and insurance workflows
- supply chain and shipping operations
- large enterprise admin systems
