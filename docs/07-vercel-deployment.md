# Vercel Deployment

## Goal

Deploy the MediConnect MVP to Vercel with the minimum configuration needed for auth, Next.js hosting, and future AI/server features.

## Deployment Strategy

- use one Vercel project for the app
- deploy preview builds from feature branches
- deploy production from the main branch

## Prerequisites

- code pushed to GitHub, GitLab, or Bitbucket
- Vercel account
- Supabase project already configured
- environment variables prepared

## Required Environment Variables

### Required Now

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Required When Server Features Are Enabled

- `DATABASE_URL`
- `DIRECT_URL`

### Required When AI Server Routes Are Enabled

- `GEMINI_API_KEY`

### Optional AI Configuration

- `GEMINI_MODEL`

### Required Only For Server-Side Supabase Admin Actions

- `SUPABASE_SERVICE_ROLE_KEY`

## Vercel Setup Steps

1. Import the repository into Vercel.
2. Confirm the project root is the MediConnect app root.
3. Let Vercel detect the Next.js framework settings.
4. Add the environment variables for:
   - Production
   - Preview
   - Development if needed
5. Run the first deployment.

## Supabase Auth Setup For Deployment

After the Vercel URL exists:

1. Set `NEXT_PUBLIC_APP_URL` to the production URL or custom domain.
2. In Supabase Auth settings, update:
   - site URL
   - allowed redirect URLs
3. Include preview URLs only if you want preview auth testing.

## Suggested Preview Workflow

- every branch gets a preview deployment
- test auth, navigation, and main flows before merging
- keep risky AI or schema work off production until preview passes

## Suggested Production Workflow

- merge into the production branch only after preview review
- verify auth redirect URLs after deployment
- run basic smoke tests immediately

## Smoke Test Checklist

- homepage loads
- sign-up loads
- sign-in loads
- dashboard loads after auth
- shared routes load (`/tasks`, `/adherence`, `/reminders`, `/messages`, `/account`, `/support`)
- legacy aliases (`/patient`, `/provider`) redirect to `/dashboard`
- Supabase auth works
- deployed URL matches app URL configuration

## Common Risks

- wrong `NEXT_PUBLIC_APP_URL`
- missing Supabase redirect URL
- missing environment variables in Preview vs Production
- trying to use server-only secrets in the client
- database env vars present but unused or misconfigured

## Deployment Readiness Checklist

- lint passes
- build passes
- env vars are set in Vercel
- Supabase site URL matches deployment target
- auth redirect URLs are configured
- no local-only assumptions remain in the app
