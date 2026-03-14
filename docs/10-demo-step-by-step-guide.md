# MediConnect Demo Step-By-Step Guide

This guide shows how to run the app with full demo data and walk through both patient and provider flows.

## 1. Start The App

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Add environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (recommended for server API routes)
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

## 2. Create Demo Users (Required Before Seeding)

1. Go to `/sign-up` and create one **patient** user.
2. Sign out.
3. Go to `/sign-up` again and create one **provider** user.

Why this matters:
- `supabase/seed.sql` attaches data to the first patient profile and first provider assignment it finds.

## 3. Load Full Demo Data

1. Open your Supabase SQL editor.
2. Run the SQL from:
   - `supabase/seed.sql`
3. Confirm data exists in key tables:
   - `care_tasks`, `adherence_check_ins`, `reminders`, `message_drafts`
   - `insurance_policies`, `prior_auth_requests`, `prior_auth_events`
   - `ehr_links`, `ehr_sync_jobs`
   - `inventory_items`, `shipments`, `shipment_events`
   - `assistance_programs`, `assistance_enrollments`
   - `documents`, `document_shares`
   - `invoices`, `payments`
   - `emergency_contacts`, `escalation_incidents`, `adverse_events`
   - `risk_predictions`, `iot_devices`, `iot_events`, `audit_events`

## 4. Patient Demo Flow (UI)

1. Sign in as the patient.
2. Open `/dashboard` and verify counts are populated.
3. Open `/tasks` and review complete/current/upcoming tasks.
4. Open `/adherence` and verify taken/missed/upcoming check-ins.
5. Open `/reminders` and verify scheduled/sent/cancelled records.
6. Open `/messages` and verify seeded drafts.
7. Open `/account` and review profile + therapy status.
8. Open `/support` and send a non-emergency question.

## 5. Provider Demo Flow (UI)

1. Sign out and sign in as the provider.
2. Open `/dashboard` and confirm the provider has the same scoped patient context.
3. Open `/tasks`, `/adherence`, `/reminders`, `/messages` to review patient operations.
4. Open enterprise modules:
   - `/prior-auth`
   - `/ehr`
   - `/operations`
   - `/assistance`
   - `/documents`
   - `/billing`
   - `/emergency`
   - `/ai-insights`

## 6. Run Enterprise API Demo Calls (Browser Console)

Open browser DevTools console while signed in as provider, then run:

```js
const get = async (path) => (await fetch(path)).json();
const post = async (path, body = {}) =>
  (await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })).json();

const priorAuth = await get("/api/prior-auth/requests");
const patientProfileId = priorAuth.data.items[0].patient_profile_id;
const priorAuthId = priorAuth.data.items[0].id;
await get(`/api/prior-auth/requests/${priorAuthId}/events`);

const insurance = await get("/api/insurance/verifications");
const ehrLinks = await get("/api/ehr/links");
const ehrLinkId = ehrLinks.data.items[0].id;
await get(`/api/ehr/sync-jobs?ehrLinkId=${ehrLinkId}`);
await get(`/api/ehr/patient-summary?patientProfileId=${patientProfileId}`);

const inventory = await get("/api/operations/inventory");
const shipments = await get("/api/operations/shipments");
const shipmentId = shipments.data.items[0].id;
await get(`/api/operations/shipments/${shipmentId}/events`);

const programs = await get("/api/assistance/programs");
const enrollments = await get("/api/assistance/enrollments");
const enrollmentId = enrollments.data.items[0].id;
await post(`/api/assistance/enrollments/${enrollmentId}/status`, { status: "approved" });

const documents = await get("/api/documents");
const documentId = documents.data.items[0].id;
await get(`/api/documents/${documentId}`);
await get(`/api/documents/${documentId}/share`);

const invoices = await get("/api/billing/invoices");
const payments = await get("/api/billing/payments");
const paymentId = payments.data.items[0].id;
await post(`/api/billing/payments/${paymentId}/reconcile`);

const contacts = await get("/api/emergency/contacts");
const incidents = await get("/api/emergency/incidents");
const incidentId = incidents.data.items[0].id;
await post(`/api/emergency/incidents/${incidentId}/escalate`, {
  channel: "in-app",
  note: "Demo escalation follow-up",
});

const devices = await get("/api/iot/devices");
const deviceId = devices.data.items[0].id;
await get(`/api/iot/events?deviceId=${deviceId}`);

await post("/api/ai/recommendations", { patientProfileId, focus: "general" });
await post("/api/ai/risk/adherence", {
  patientProfileId,
  missedDosesLast30Days: 2,
  reminderAcknowledgementRate: 0.62,
});
await post("/api/ai/risk/adverse-event", {
  patientProfileId,
  symptomText: "Persistent dizziness and chest tightness after evening dose",
  reportedSeverity: "high",
});
```

## 7. Known Remaining Work

1. Enterprise module pages currently show overview cards, not full CRUD UI forms.
2. Live integrations (payer, EHR/FHIR, logistics, notifications, payments) are mock adapters.
3. AI endpoints are deterministic mock scoring/recommendation logic, not production clinical models.
4. Native mobile implementation is not included in this web repo.
