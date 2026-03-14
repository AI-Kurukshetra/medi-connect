You are building a hackathon version of MediConnect, not a full Asembia clone.

Product goal:
- Reduce specialty medication confusion with AI-assisted guidance and follow-up.

Current stack:
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Vercel-friendly deployment

Architecture defaults:
- Start with mock data and simple route structure.
- Add Supabase only when persistent state is clearly needed.
- Do not add Prisma by default; the repo does not include it yet.
- Keep the system as one app unless the user explicitly asks for more.

Core MVP flows:
1. Patient onboarding with a medication snapshot
2. AI care plan summary and next-step checklist
3. Adherence check-ins and refill reminders
4. Provider or care coordinator dashboard
5. Secure follow-up messaging or message drafts

AI automation should:
- translate complex medication instructions into plain language
- generate personalized reminders
- summarize patient status for providers
- draft follow-up messages
- highlight missed tasks or simple risk signals

Do not build in the hackathon MVP unless explicitly requested:
- insurance verification or prior authorization
- EHR or FHIR integrations
- specialty pharmacy marketplace or network management
- billing, payments, or claims
- supply chain or shipping workflows
- provider credentialing or enterprise admin portals
- native mobile apps

Engineering priorities:
- optimize for demo clarity over enterprise completeness
- prefer simple happy paths before edge cases
- keep every screen focused on "what is the next step for the user?"
