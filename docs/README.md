# MediConnect Docs

This folder is the working product spec for the hackathon build.

## Document Order

1. [00-current-ui-and-product-direction.md](./00-current-ui-and-product-direction.md)
2. [01-sign-in-sign-up.md](./01-sign-in-sign-up.md)
3. [02-main-dashboard.md](./02-main-dashboard.md)
4. [03-patient-panel.md](./03-patient-panel.md)
5. [04-provider-panel.md](./04-provider-panel.md)
6. [05-account-profile.md](./05-account-profile.md)
7. [06-chatbot-support.md](./06-chatbot-support.md)
8. [07-vercel-deployment.md](./07-vercel-deployment.md)
9. [08-main-use-cases.md](./08-main-use-cases.md)

## Current Product Scope

- Focus on specialty medication onboarding, reminders, provider follow-up, and AI simplification.
- Use one shared authenticated route map after login.
- Keep role behavior/data/actions inside shared pages and APIs.

## Build Status Snapshot

- `Implemented now`: landing page, sign-in, sign-up, shared authenticated routes, role-aware APIs, auth guards, server-session cookie bridge, legacy `/patient` and `/provider` redirects, base theming
- `Next`: deeper UI CRUD forms, assignment management UI, real LLM integration for support chat, deployment hardening

## Shared Route Map

- `/dashboard`
- `/tasks`
- `/adherence`
- `/reminders`
- `/messages`
- `/account`
- `/support`

