-- Demo seed data for shared route MVP.
-- Demo credentials created by this seed:
-- patient: maya.patel@mediconnect.demo / DemoPass123!
-- provider: elena.brooks@mediconnect.demo / DemoPass123!

do $$
declare
  v_patient_profile_id uuid;
  v_patient_user_id uuid;
  v_provider_user_id uuid;
  v_demo_patient_user_id uuid := '11111111-1111-4111-8111-111111111111';
  v_demo_provider_user_id uuid := '22222222-2222-4222-8222-222222222222';
  v_medication_plan_id uuid;
  v_prior_auth_request_id uuid;
  v_inventory_item_id uuid;
  v_shipment_id uuid;
  v_document_id uuid;
  v_program_id uuid;
  v_invoice_id uuid;
  v_seed_incident_id uuid;
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values
    (
      '00000000-0000-0000-0000-000000000000',
      v_demo_patient_user_id,
      'authenticated',
      'authenticated',
      'maya.patel@mediconnect.demo',
      crypt('DemoPass123!', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"patient","full_name":"Maya Patel"}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now())
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      v_demo_provider_user_id,
      'authenticated',
      'authenticated',
      'elena.brooks@mediconnect.demo',
      crypt('DemoPass123!', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"provider","full_name":"Dr. Elena Brooks"}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now())
    )
  on conflict (id) do update
    set email = excluded.email,
        encrypted_password = excluded.encrypted_password,
        email_confirmed_at = excluded.email_confirmed_at,
        raw_app_meta_data = excluded.raw_app_meta_data,
        raw_user_meta_data = excluded.raw_user_meta_data,
        updated_at = excluded.updated_at;

  insert into public.profiles (id, role, full_name)
  values
    (v_demo_patient_user_id, 'patient', 'Maya Patel'),
    (v_demo_provider_user_id, 'provider', 'Dr. Elena Brooks')
  on conflict (id) do update
    set role = excluded.role,
        full_name = excluded.full_name;

  insert into public.patient_profiles (
    user_id,
    condition_name,
    therapy_status,
    next_appointment_at
  )
  values (
    v_demo_patient_user_id,
    'Rheumatoid arthritis',
    'Ready for first at-home injection',
    timezone('utc', now()) + interval '6 day'
  )
  on conflict (user_id) do update
    set condition_name = excluded.condition_name,
        therapy_status = excluded.therapy_status,
        next_appointment_at = excluded.next_appointment_at;

  select pp.id, pp.user_id
  into v_patient_profile_id, v_patient_user_id
  from public.patient_profiles pp
  where pp.user_id = v_demo_patient_user_id
  limit 1;

  v_provider_user_id := v_demo_provider_user_id;

  if v_patient_profile_id is null then
    raise notice 'seed skipped: demo patient profile could not be created';
    return;
  end if;

  insert into public.medication_plans (
    patient_profile_id,
    medication_name,
    dosage,
    frequency,
    instructions,
    refill_due_in_days
  )
  select
    v_patient_profile_id,
    'Humira',
    '40 mg pen',
    'Every other Tuesday',
    'Remove from refrigerator 15 minutes before injection. Track site reaction after dose.',
    9
  where not exists (
    select 1
    from public.medication_plans mp
    where mp.patient_profile_id = v_patient_profile_id
      and mp.medication_name = 'Humira'
  );

  select mp.id
  into v_medication_plan_id
  from public.medication_plans mp
  where mp.patient_profile_id = v_patient_profile_id
  order by mp.created_at asc
  limit 1;

  insert into public.care_tasks (
    patient_profile_id,
    title,
    description,
    status,
    due_label,
    source
  )
  select * from (
    values
      (v_patient_profile_id, 'Review the injection day checklist', 'AI translated preparation into 3 simple steps.', 'complete', 'Finished yesterday', 'ai'),
      (v_patient_profile_id, 'Submit symptom baseline', 'Complete the short pre-dose symptom form before Tuesday.', 'current', 'Due by Monday evening', 'manual'),
      (v_patient_profile_id, 'Confirm reminder window', 'Set your preferred reminder time for first-dose day.', 'current', 'Set tonight', 'manual'),
      (v_patient_profile_id, 'Review drafted follow-up questions', 'AI prepared travel storage and side-effect follow-up questions.', 'upcoming', 'Before Thursday follow-up', 'ai')
  ) as t(patient_profile_id, title, description, status, due_label, source)
  where not exists (
    select 1
    from public.care_tasks ct
    where ct.patient_profile_id = t.patient_profile_id
      and ct.title = t.title
  );

  insert into public.reminders (
    patient_profile_id,
    title,
    send_at,
    window_label,
    channel,
    status
  )
  select * from (
    values
      (v_patient_profile_id, 'Injection prep reminder', timezone('utc', now()) + interval '1 day', 'Tomorrow at 7:00 PM', 'in-app', 'scheduled'),
      (v_patient_profile_id, 'Care team follow-up', timezone('utc', now()) + interval '3 day', 'Thursday at 10:00 AM', 'email', 'scheduled'),
      (v_patient_profile_id, 'Dose day check completed', timezone('utc', now()) - interval '8 hour', 'Today at 8:00 AM', 'sms', 'sent'),
      (v_patient_profile_id, 'Travel storage reminder', timezone('utc', now()) + interval '7 day', 'Next week', 'email', 'cancelled')
  ) as r(patient_profile_id, title, send_at, window_label, channel, status)
  where not exists (
    select 1
    from public.reminders rem
    where rem.patient_profile_id = r.patient_profile_id
      and rem.title = r.title
  );

  insert into public.adherence_check_ins (
    patient_profile_id,
    medication_plan_id,
    scheduled_for,
    status,
    note
  )
  select * from (
    values
      (v_patient_profile_id, v_medication_plan_id, timezone('utc', now()) - interval '2 day', 'taken', 'Completed with mild injection-site redness only.'),
      (v_patient_profile_id, v_medication_plan_id, timezone('utc', now()) - interval '1 day', 'missed', 'Patient delayed due to reminder window confusion.'),
      (v_patient_profile_id, v_medication_plan_id, timezone('utc', now()) + interval '5 day', 'upcoming', 'Next scheduled check-in.')
  ) as a(patient_profile_id, medication_plan_id, scheduled_for, status, note)
  where not exists (
    select 1
    from public.adherence_check_ins ac
    where ac.patient_profile_id = a.patient_profile_id
      and ac.status = a.status
      and ac.note = a.note
  );

  insert into public.message_drafts (
    patient_profile_id,
    author_role,
    subject,
    body,
    approved
  )
  select * from (
    values
      (
        v_patient_profile_id,
        'provider',
        'Quick check-in before first dose',
        'Hi, you are almost ready. Please submit your symptom baseline and confirm your reminder window today.',
        false
      ),
      (
        v_patient_profile_id,
        'patient',
        'Question about travel storage',
        'I may travel with my medication next week. Can you confirm the safest storage plan?',
        true
      ),
      (
        v_patient_profile_id,
        'provider',
        'Follow-up after your first Humira dose',
        'Hi Maya, I reviewed your checklist progress. Please submit the symptom baseline tonight and message us if you notice anything unexpected after the dose.',
        true
      )
  ) as md(patient_profile_id, author_role, subject, body, approved)
  where not exists (
    select 1
    from public.message_drafts existing
    where existing.patient_profile_id = md.patient_profile_id
      and existing.subject = md.subject
  );

  if v_provider_user_id is not null then
    insert into public.provider_patient_assignments (
      provider_user_id,
      patient_profile_id
    )
    values (v_provider_user_id, v_patient_profile_id)
    on conflict (provider_user_id, patient_profile_id) do nothing;
  end if;

  insert into public.insurance_policies (
    patient_profile_id,
    payer_name,
    member_id,
    plan_name,
    status,
    verified_at
  )
  select
    v_patient_profile_id,
    'Asembia Health Plan',
    'MEM-100245',
    'Specialty Gold',
    'active',
    timezone('utc', now())
  where not exists (
    select 1
    from public.insurance_policies ip
    where ip.patient_profile_id = v_patient_profile_id
      and ip.member_id = 'MEM-100245'
  );

  insert into public.prior_auth_requests (
    patient_profile_id,
    provider_user_id,
    insurance_policy_id,
    medication_name,
    diagnosis_code,
    rationale,
    status,
    submitted_at,
    reviewed_at
  )
  select
    v_patient_profile_id,
    v_provider_user_id,
    (
      select ip.id
      from public.insurance_policies ip
      where ip.patient_profile_id = v_patient_profile_id
      order by ip.created_at asc
      limit 1
    ),
    'Humira',
    'M06.9',
    'Patient requires specialty biologic initiation due to active symptoms.',
    'payer-review',
    timezone('utc', now()) - interval '6 hour',
    timezone('utc', now()) - interval '2 hour'
  where not exists (
    select 1
    from public.prior_auth_requests par
    where par.patient_profile_id = v_patient_profile_id
      and par.medication_name = 'Humira'
  );

  select par.id
  into v_prior_auth_request_id
  from public.prior_auth_requests par
  where par.patient_profile_id = v_patient_profile_id
    and par.medication_name = 'Humira'
  order by par.created_at asc
  limit 1;

  if v_prior_auth_request_id is not null then
    insert into public.prior_auth_events (
      prior_auth_request_id,
      actor_user_id,
      from_status,
      to_status,
      note
    )
    select * from (
      values
        (
          v_prior_auth_request_id,
          coalesce(v_provider_user_id, v_patient_user_id),
          'draft',
          'submitted',
          'Initial prior authorization packet submitted with diagnosis and rationale.'
        ),
        (
          v_prior_auth_request_id,
          coalesce(v_provider_user_id, v_patient_user_id),
          'submitted',
          'payer-review',
          'Payer intake acknowledged and moved to active review.'
        )
    ) as pae(prior_auth_request_id, actor_user_id, from_status, to_status, note)
    where not exists (
      select 1
      from public.prior_auth_events existing
      where existing.prior_auth_request_id = pae.prior_auth_request_id
        and existing.to_status = pae.to_status
    );
  end if;

  insert into public.ehr_links (
    patient_profile_id,
    provider_user_id,
    vendor,
    fhir_base_url,
    external_patient_id,
    status
  )
  select
    v_patient_profile_id,
    v_provider_user_id,
    'Mock Epic',
    'https://fhir.mock-mediconnect.local/r4',
    'FHIR-PAT-0001',
    'linked'
  where not exists (
    select 1
    from public.ehr_links el
    where el.patient_profile_id = v_patient_profile_id
      and el.external_patient_id = 'FHIR-PAT-0001'
  );

  insert into public.ehr_sync_jobs (
    ehr_link_id,
    job_type,
    status,
    idempotency_key,
    started_at,
    finished_at
  )
  select
    (
      select el.id
      from public.ehr_links el
      where el.patient_profile_id = v_patient_profile_id
      order by el.created_at asc
      limit 1
    ),
    'patient-summary-sync',
    'succeeded',
    'seed-ehr-sync-job',
    timezone('utc', now()) - interval '35 minute',
    timezone('utc', now()) - interval '34 minute'
  where not exists (
    select 1 from public.ehr_sync_jobs esj where esj.idempotency_key = 'seed-ehr-sync-job'
  );

  insert into public.documents (
    patient_profile_id,
    uploaded_by_user_id,
    title,
    category,
    version,
    storage_key,
    mime_type,
    size_bytes,
    visibility,
    status
  )
  select
    v_patient_profile_id,
    coalesce(v_provider_user_id, v_patient_user_id),
    'Prior Authorization Checklist',
    'authorization',
    1,
    'docs/prior-auth-checklist.pdf',
    'application/pdf',
    112944,
    'both',
    'active'
  where not exists (
    select 1
    from public.documents d
    where d.patient_profile_id = v_patient_profile_id
      and d.storage_key = 'docs/prior-auth-checklist.pdf'
  );

  select d.id
  into v_document_id
  from public.documents d
  where d.patient_profile_id = v_patient_profile_id
    and d.storage_key = 'docs/prior-auth-checklist.pdf'
  order by d.created_at asc
  limit 1;

  if v_document_id is not null and v_provider_user_id is not null then
    insert into public.document_shares (
      document_id,
      shared_with_user_id,
      permission,
      signed_url,
      expires_at
    )
    select
      v_document_id,
      v_provider_user_id,
      'view',
      'https://mock-docs.mediconnect.local/share/prior-auth-checklist',
      timezone('utc', now()) + interval '1 day'
    where not exists (
      select 1
      from public.document_shares ds
      where ds.document_id = v_document_id
        and ds.shared_with_user_id = v_provider_user_id
    );
  end if;

  insert into public.inventory_items (
    sku,
    medication_name,
    lot_number,
    location_label,
    quantity,
    cold_chain_required,
    cold_chain_status,
    status
  )
  select
    'HUMIRA-40-001',
    'Humira 40 mg pen',
    'LOT-2026-03-A',
    'Warehouse A - Cold Shelf 2',
    42,
    true,
    'ok',
    'available'
  where not exists (
    select 1
    from public.inventory_items ii
    where ii.sku = 'HUMIRA-40-001'
  );

  select ii.id
  into v_inventory_item_id
  from public.inventory_items ii
  where ii.sku = 'HUMIRA-40-001'
  limit 1;

  insert into public.shipments (
    patient_profile_id,
    inventory_item_id,
    status,
    carrier,
    tracking_number,
    eta
  )
  select
    v_patient_profile_id,
    v_inventory_item_id,
    'in_transit',
    'Mock Carrier',
    'TRACK-001-DEL',
    timezone('utc', now()) + interval '2 day'
  where not exists (
    select 1
    from public.shipments s
    where s.tracking_number = 'TRACK-001-DEL'
  );

  select s.id
  into v_shipment_id
  from public.shipments s
  where s.tracking_number = 'TRACK-001-DEL'
  limit 1;

  if v_shipment_id is not null then
    insert into public.shipment_events (
      shipment_id,
      event_type,
      event_status,
      location_label,
      temperature_c,
      occurred_at
    )
    select * from (
      values
        (v_shipment_id, 'picked_up', 'in_transit', 'Origin Facility', 4.1::numeric, timezone('utc', now()) - interval '5 hour'),
        (v_shipment_id, 'checkpoint', 'in_transit', 'Regional Hub', 4.3::numeric, timezone('utc', now()) - interval '2 hour')
    ) as se(shipment_id, event_type, event_status, location_label, temperature_c, occurred_at)
    where not exists (
      select 1
      from public.shipment_events ex
      where ex.shipment_id = se.shipment_id
        and ex.event_type = se.event_type
    );
  end if;

  insert into public.assistance_programs (
    name,
    sponsor,
    eligibility_rules,
    active
  )
  select
    'Starter Support Program',
    'MediConnect Foundation',
    '{"max_income_usd": 90000, "requires_prior_auth": true}'::jsonb,
    true
  where not exists (
    select 1
    from public.assistance_programs ap
    where ap.name = 'Starter Support Program'
  );

  select ap.id
  into v_program_id
  from public.assistance_programs ap
  where ap.name = 'Starter Support Program'
  limit 1;

  if v_program_id is not null then
    insert into public.assistance_enrollments (
      patient_profile_id,
      program_id,
      status,
      eligibility_snapshot,
      submitted_at
    )
    select
      v_patient_profile_id,
      v_program_id,
      'submitted',
      '{"income_verified": true, "prior_auth_submitted": true}'::jsonb,
      timezone('utc', now()) - interval '1 day'
    where not exists (
      select 1
      from public.assistance_enrollments ae
      where ae.patient_profile_id = v_patient_profile_id
        and ae.program_id = v_program_id
    );
  end if;

  insert into public.invoices (
    patient_profile_id,
    invoice_number,
    amount_cents,
    currency,
    status,
    due_at,
    issued_at
  )
  select
    v_patient_profile_id,
    'INV-SEED-0001',
    14900,
    'USD',
    'issued',
    timezone('utc', now()) + interval '10 day',
    timezone('utc', now()) - interval '1 day'
  where not exists (
    select 1
    from public.invoices i
    where i.invoice_number = 'INV-SEED-0001'
  );

  insert into public.invoices (
    patient_profile_id,
    invoice_number,
    amount_cents,
    currency,
    status,
    due_at,
    issued_at
  )
  select
    v_patient_profile_id,
    'INV-SEED-0002',
    8900,
    'USD',
    'paid',
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) - interval '10 day'
  where not exists (
    select 1
    from public.invoices i
    where i.invoice_number = 'INV-SEED-0002'
  );

  select i.id
  into v_invoice_id
  from public.invoices i
  where i.invoice_number = 'INV-SEED-0001'
  limit 1;

  if v_invoice_id is not null then
    insert into public.payments (
      invoice_id,
      provider_ref,
      amount_cents,
      currency,
      method,
      status,
      metadata
    )
    select
      v_invoice_id,
      'mock_ch_seed_0001',
      14900,
      'USD',
      'card',
      'pending',
      '{"adapterProvider":"mock"}'::jsonb
    where not exists (
      select 1
      from public.payments p
      where p.provider_ref = 'mock_ch_seed_0001'
    );
  end if;

  insert into public.payments (
    invoice_id,
    provider_ref,
    amount_cents,
    currency,
    method,
    status,
    metadata,
    reconciled_at
  )
  select
    (
      select i.id
      from public.invoices i
      where i.invoice_number = 'INV-SEED-0002'
      limit 1
    ),
    'mock_ch_seed_0002',
    8900,
    'USD',
    'ach',
    'reconciled',
    '{"adapterProvider":"mock","reconciledBy":"seed-script"}'::jsonb,
    timezone('utc', now()) - interval '12 hour'
  where not exists (
    select 1
    from public.payments p
    where p.provider_ref = 'mock_ch_seed_0002'
  );

  insert into public.emergency_contacts (
    patient_profile_id,
    name,
    relationship,
    phone,
    email,
    is_primary
  )
  select
    v_patient_profile_id,
    'Alex Patel',
    'Spouse',
    '+1-555-201-0001',
    'alex.patel@example.com',
    true
  where not exists (
    select 1
    from public.emergency_contacts ec
    where ec.patient_profile_id = v_patient_profile_id
      and ec.phone = '+1-555-201-0001'
  );

  insert into public.escalation_incidents (
    patient_profile_id,
    reported_by_user_id,
    severity,
    status,
    source,
    summary,
    sla_due_at
  )
  select
    v_patient_profile_id,
    coalesce(v_provider_user_id, v_patient_user_id),
    'medium',
    'open',
    'seed',
    'Patient requested guidance about first-dose side effects.',
    timezone('utc', now()) + interval '8 hour'
  where not exists (
    select 1
    from public.escalation_incidents ei
    where ei.patient_profile_id = v_patient_profile_id
      and ei.source = 'seed'
  );

  select ei.id
  into v_seed_incident_id
  from public.escalation_incidents ei
  where ei.patient_profile_id = v_patient_profile_id
    and ei.source = 'seed'
  order by ei.created_at asc
  limit 1;

  insert into public.adverse_events (
    patient_profile_id,
    reported_by_user_id,
    symptom_text,
    severity,
    status
  )
  select
    v_patient_profile_id,
    coalesce(v_provider_user_id, v_patient_user_id),
    'Mild injection-site redness for 24 hours after dose.',
    'low',
    'reviewed'
  where not exists (
    select 1
    from public.adverse_events ae
    where ae.patient_profile_id = v_patient_profile_id
      and ae.symptom_text = 'Mild injection-site redness for 24 hours after dose.'
  );

  if v_seed_incident_id is not null then
    insert into public.adverse_events (
      patient_profile_id,
      reported_by_user_id,
      symptom_text,
      severity,
      status,
      linked_incident_id
    )
    select
      v_patient_profile_id,
      coalesce(v_provider_user_id, v_patient_user_id),
      'Persistent dizziness and chest tightness reported after evening dose.',
      'high',
      'linked_to_incident',
      v_seed_incident_id
    where not exists (
      select 1
      from public.adverse_events ae
      where ae.patient_profile_id = v_patient_profile_id
        and ae.symptom_text = 'Persistent dizziness and chest tightness reported after evening dose.'
    );
  end if;

  insert into public.risk_predictions (
    patient_profile_id,
    model_name,
    risk_type,
    risk_score,
    risk_level,
    explanation,
    requires_human_approval
  )
  select
    v_patient_profile_id,
    'mock-adherence-risk-v1',
    'adherence',
    0.52,
    'medium',
    '{"missed_doses_last_30_days":2,"ack_rate":0.62}'::jsonb,
    true
  where not exists (
    select 1
    from public.risk_predictions rp
    where rp.patient_profile_id = v_patient_profile_id
      and rp.model_name = 'mock-adherence-risk-v1'
      and rp.risk_type = 'adherence'
  );

  insert into public.risk_predictions (
    patient_profile_id,
    model_name,
    risk_type,
    risk_score,
    risk_level,
    explanation,
    requires_human_approval
  )
  select
    v_patient_profile_id,
    'mock-adverse-event-v1',
    'adverse-event',
    0.78,
    'high',
    '{"reported_severity":"high","trigger_phrase_match":true}'::jsonb,
    true
  where not exists (
    select 1
    from public.risk_predictions rp
    where rp.patient_profile_id = v_patient_profile_id
      and rp.model_name = 'mock-adverse-event-v1'
      and rp.risk_type = 'adverse-event'
  );

  insert into public.risk_predictions (
    patient_profile_id,
    model_name,
    risk_type,
    risk_score,
    risk_level,
    explanation,
    requires_human_approval
  )
  select
    v_patient_profile_id,
    'mock-general-risk-v1',
    'general',
    0.33,
    'medium',
    '{"recent_context":"stable adherence trend with one missed check-in"}'::jsonb,
    true
  where not exists (
    select 1
    from public.risk_predictions rp
    where rp.patient_profile_id = v_patient_profile_id
      and rp.model_name = 'mock-general-risk-v1'
      and rp.risk_type = 'general'
  );

  insert into public.iot_devices (
    patient_profile_id,
    device_type,
    manufacturer,
    model,
    serial_number,
    status,
    last_seen_at
  )
  select
    v_patient_profile_id,
    'smart_pill_dispenser',
    'Mock Devices Inc.',
    'PillBox X',
    'IOT-SEED-0001',
    'active',
    timezone('utc', now()) - interval '30 minute'
  where not exists (
    select 1
    from public.iot_devices idv
    where idv.serial_number = 'IOT-SEED-0001'
  );

  insert into public.iot_events (
    device_id,
    patient_profile_id,
    event_type,
    payload,
    occurred_at
  )
  select
    (
      select idv.id
      from public.iot_devices idv
      where idv.serial_number = 'IOT-SEED-0001'
      limit 1
    ),
    v_patient_profile_id,
    'dose_compartment_opened',
    '{"compartment":"A","duration_seconds":18}'::jsonb,
    timezone('utc', now()) - interval '22 minute'
  where not exists (
    select 1
    from public.iot_events ie
    where ie.event_type = 'dose_compartment_opened'
      and ie.patient_profile_id = v_patient_profile_id
  );

  insert into public.audit_events (
    actor_user_id,
    actor_role,
    action,
    resource_type,
    resource_id,
    trace_id,
    scope_context,
    metadata
  )
  select
    coalesce(v_provider_user_id, v_patient_user_id),
    case
      when v_provider_user_id is not null then 'provider'
      else 'patient'
    end,
    'seed.demo.bootstrap',
    'patient_profile',
    v_patient_profile_id,
    'seed-trace-demo-bootstrap',
    jsonb_build_object(
      'patientProfileId',
      v_patient_profile_id::text,
      'module',
      'seed'
    ),
    '{"source":"seed.sql","purpose":"demo-bootstrap"}'::jsonb
  where not exists (
    select 1
    from public.audit_events ae
    where ae.trace_id = 'seed-trace-demo-bootstrap'
      and ae.action = 'seed.demo.bootstrap'
  );

  raise notice 'seed complete for patient_profile_id: %', v_patient_profile_id;
end
$$;
