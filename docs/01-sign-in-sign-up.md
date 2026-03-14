# Sign-In And Sign-Up

## Goal

Authenticate quickly, then route everyone to one shared post-login entry point.

## Routes

- `/sign-in`
- `/sign-up`

## Post-Auth Redirect

- Success destination: `/dashboard` for both roles.
- Role mode is resolved after login and used inside shared routes.

## MVP Fields

### Sign-Up

- full name
- email
- password
- role: `patient` or `provider`

### Sign-In

- email
- password

## Current Technical Behavior

- Supabase Auth handles credentials.
- Sign-up uses `supabase.auth.signUp`.
- Sign-in uses `supabase.auth.signInWithPassword`.
- On successful session, access token is persisted to a secure server cookie through `/api/auth/session`.
- Shared routes are protected and redirect unauthenticated users to `/sign-in`.

## Data Touched

- `auth.users`
- `public.profiles`
- `public.patient_profiles` (patient role)

## Main User Flow

1. User opens sign-up.
2. User submits name, email, password, and role.
3. System creates account and profile trigger sync runs.
4. If session exists immediately, user is redirected to `/dashboard`.
5. If email confirmation is enabled, user sees confirmation guidance.

## Sign-In Flow

1. User opens sign-in.
2. User submits email and password.
3. System authenticates with Supabase.
4. Session cookie is written for server-side guards.
5. User is redirected to `/dashboard`.

## Required Error States

- invalid email or password
- user not found
- email not confirmed
- email rate limit exceeded
- duplicate email on sign-up
- generic auth/network failure

## Acceptance Criteria

- A patient can sign up and reach `/dashboard`.
- A provider can sign up and reach `/dashboard`.
- Existing users can sign in and reach `/dashboard`.
- Shared authenticated routes reject unauthenticated access.

