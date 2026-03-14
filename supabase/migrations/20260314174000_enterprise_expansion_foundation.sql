create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles (id) on delete cascade,
  actor_role text not null check (actor_role in ('patient', 'provider')),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  trace_id text not null,
  scope_context jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  payer_name text not null,
  member_id text not null,
  plan_name text not null,
  status text not null check (status in ('active', 'inactive', 'pending')) default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.prior_auth_requests (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  provider_user_id uuid references public.profiles (id) on delete set null,
  insurance_policy_id uuid references public.insurance_policies (id) on delete set null,
  medication_name text not null,
  diagnosis_code text not null,
  rationale text not null default '',
  status text not null check (status in ('draft', 'submitted', 'payer-review', 'approved', 'denied', 'appeal')) default 'draft',
  external_reference text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.prior_auth_events (
  id uuid primary key default gen_random_uuid(),
  prior_auth_request_id uuid not null references public.prior_auth_requests (id) on delete cascade,
  actor_user_id uuid not null references public.profiles (id) on delete cascade,
  from_status text,
  to_status text not null,
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ehr_links (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  provider_user_id uuid references public.profiles (id) on delete set null,
  vendor text not null,
  fhir_base_url text not null,
  external_patient_id text not null,
  status text not null check (status in ('linked', 'syncing', 'error')) default 'linked',
  last_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ehr_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  ehr_link_id uuid not null references public.ehr_links (id) on delete cascade,
  job_type text not null,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')) default 'queued',
  idempotency_key text not null unique,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  uploaded_by_user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null,
  version integer not null default 1 check (version > 0),
  storage_key text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  visibility text not null check (visibility in ('patient', 'provider', 'both')) default 'both',
  status text not null check (status in ('active', 'archived')) default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  shared_with_user_id uuid not null references public.profiles (id) on delete cascade,
  permission text not null check (permission in ('view', 'edit')) default 'view',
  signed_url text,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  medication_name text not null,
  lot_number text not null,
  location_label text not null,
  quantity integer not null check (quantity >= 0),
  cold_chain_required boolean not null default false,
  cold_chain_status text not null check (cold_chain_status in ('ok', 'warning', 'breach')) default 'ok',
  status text not null check (status in ('available', 'reserved', 'in_transit', 'depleted')) default 'available',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid references public.patient_profiles (id) on delete set null,
  inventory_item_id uuid references public.inventory_items (id) on delete set null,
  status text not null check (status in ('pending', 'packed', 'in_transit', 'delivered', 'failed')) default 'pending',
  carrier text not null default 'mock-carrier',
  tracking_number text,
  eta timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  event_type text not null,
  event_status text not null,
  location_label text,
  temperature_c numeric(5, 2),
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assistance_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sponsor text not null,
  eligibility_rules jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assistance_enrollments (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  program_id uuid not null references public.assistance_programs (id) on delete cascade,
  status text not null check (status in ('draft', 'submitted', 'approved', 'denied', 'expired')) default 'draft',
  eligibility_snapshot jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  invoice_number text not null unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD',
  status text not null check (status in ('draft', 'issued', 'paid', 'void')) default 'draft',
  due_at timestamptz,
  issued_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  provider_ref text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD',
  method text not null default 'card',
  status text not null check (status in ('pending', 'succeeded', 'failed', 'reconciled')) default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  reconciled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  name text not null,
  relationship text not null,
  phone text not null,
  email text,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.escalation_incidents (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid references public.patient_profiles (id) on delete set null,
  reported_by_user_id uuid not null references public.profiles (id) on delete cascade,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null check (status in ('open', 'acknowledged', 'escalated', 'closed')) default 'open',
  source text not null default 'manual',
  summary text not null,
  sla_due_at timestamptz,
  acknowledged_at timestamptz,
  escalated_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.adverse_events (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid references public.patient_profiles (id) on delete set null,
  reported_by_user_id uuid not null references public.profiles (id) on delete cascade,
  symptom_text text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null check (status in ('new', 'reviewed', 'linked_to_incident')) default 'new',
  linked_incident_id uuid references public.escalation_incidents (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.risk_predictions (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid references public.patient_profiles (id) on delete set null,
  model_name text not null,
  risk_type text not null check (risk_type in ('adverse-event', 'adherence', 'general')),
  risk_score numeric(5, 4) not null check (risk_score >= 0 and risk_score <= 1),
  risk_level text not null,
  explanation jsonb not null default '{}'::jsonb,
  requires_human_approval boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.iot_devices (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid references public.patient_profiles (id) on delete set null,
  device_type text not null,
  manufacturer text not null default 'unknown',
  model text not null default 'unknown',
  serial_number text not null unique,
  status text not null check (status in ('active', 'inactive', 'retired')) default 'active',
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.iot_events (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.iot_devices (id) on delete cascade,
  patient_profile_id uuid references public.patient_profiles (id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_audit_events_actor_user_id on public.audit_events (actor_user_id);
create index if not exists idx_audit_events_trace_id on public.audit_events (trace_id);

create index if not exists idx_insurance_policies_patient_profile_id on public.insurance_policies (patient_profile_id);
create index if not exists idx_prior_auth_requests_patient_profile_id on public.prior_auth_requests (patient_profile_id);
create index if not exists idx_prior_auth_requests_provider_user_id on public.prior_auth_requests (provider_user_id);
create index if not exists idx_prior_auth_events_prior_auth_request_id on public.prior_auth_events (prior_auth_request_id);

create index if not exists idx_ehr_links_patient_profile_id on public.ehr_links (patient_profile_id);
create index if not exists idx_ehr_sync_jobs_ehr_link_id on public.ehr_sync_jobs (ehr_link_id);

create index if not exists idx_documents_patient_profile_id on public.documents (patient_profile_id);
create index if not exists idx_document_shares_document_id on public.document_shares (document_id);

create index if not exists idx_shipments_patient_profile_id on public.shipments (patient_profile_id);
create index if not exists idx_shipment_events_shipment_id on public.shipment_events (shipment_id);

create index if not exists idx_assistance_enrollments_patient_profile_id on public.assistance_enrollments (patient_profile_id);
create index if not exists idx_assistance_enrollments_program_id on public.assistance_enrollments (program_id);

create index if not exists idx_invoices_patient_profile_id on public.invoices (patient_profile_id);
create index if not exists idx_payments_invoice_id on public.payments (invoice_id);

create index if not exists idx_emergency_contacts_patient_profile_id on public.emergency_contacts (patient_profile_id);
create index if not exists idx_escalation_incidents_patient_profile_id on public.escalation_incidents (patient_profile_id);
create index if not exists idx_adverse_events_patient_profile_id on public.adverse_events (patient_profile_id);

create index if not exists idx_risk_predictions_patient_profile_id on public.risk_predictions (patient_profile_id);
create index if not exists idx_iot_devices_patient_profile_id on public.iot_devices (patient_profile_id);
create index if not exists idx_iot_events_device_id on public.iot_events (device_id);

drop trigger if exists set_insurance_policies_updated_at on public.insurance_policies;
create trigger set_insurance_policies_updated_at
before update on public.insurance_policies
for each row execute function public.set_updated_at();

drop trigger if exists set_prior_auth_requests_updated_at on public.prior_auth_requests;
create trigger set_prior_auth_requests_updated_at
before update on public.prior_auth_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_ehr_links_updated_at on public.ehr_links;
create trigger set_ehr_links_updated_at
before update on public.ehr_links
for each row execute function public.set_updated_at();

drop trigger if exists set_ehr_sync_jobs_updated_at on public.ehr_sync_jobs;
create trigger set_ehr_sync_jobs_updated_at
before update on public.ehr_sync_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists set_document_shares_updated_at on public.document_shares;
create trigger set_document_shares_updated_at
before update on public.document_shares
for each row execute function public.set_updated_at();

drop trigger if exists set_inventory_items_updated_at on public.inventory_items;
create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

drop trigger if exists set_shipments_updated_at on public.shipments;
create trigger set_shipments_updated_at
before update on public.shipments
for each row execute function public.set_updated_at();

drop trigger if exists set_assistance_programs_updated_at on public.assistance_programs;
create trigger set_assistance_programs_updated_at
before update on public.assistance_programs
for each row execute function public.set_updated_at();

drop trigger if exists set_assistance_enrollments_updated_at on public.assistance_enrollments;
create trigger set_assistance_enrollments_updated_at
before update on public.assistance_enrollments
for each row execute function public.set_updated_at();

drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists set_emergency_contacts_updated_at on public.emergency_contacts;
create trigger set_emergency_contacts_updated_at
before update on public.emergency_contacts
for each row execute function public.set_updated_at();

drop trigger if exists set_escalation_incidents_updated_at on public.escalation_incidents;
create trigger set_escalation_incidents_updated_at
before update on public.escalation_incidents
for each row execute function public.set_updated_at();

drop trigger if exists set_adverse_events_updated_at on public.adverse_events;
create trigger set_adverse_events_updated_at
before update on public.adverse_events
for each row execute function public.set_updated_at();

drop trigger if exists set_risk_predictions_updated_at on public.risk_predictions;
create trigger set_risk_predictions_updated_at
before update on public.risk_predictions
for each row execute function public.set_updated_at();

drop trigger if exists set_iot_devices_updated_at on public.iot_devices;
create trigger set_iot_devices_updated_at
before update on public.iot_devices
for each row execute function public.set_updated_at();
