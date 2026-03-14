-- Demo seed data for shared route MVP.
-- This script assumes auth users + public profiles already exist.

do $$
declare
  v_patient_profile_id uuid;
  v_patient_user_id uuid;
  v_provider_user_id uuid;
  v_medication_plan_id uuid;
  v_inventory_item_id uuid;
  v_shipment_id uuid;
  v_document_id uuid;
  v_program_id uuid;
  v_invoice_id uuid;
begin
  select pp.id, pp.user_id
  into v_patient_profile_id, v_patient_user_id
  from public.patient_profiles pp
  order by pp.created_at asc
  limit 1;

  if v_patient_profile_id is null then
    raise notice 'seed skipped: no patient_profiles rows found';
    return;
  end if;

  select p.id
  into v_provider_user_id
  from public.profiles p
  where p.role = 'provider'
  order by p.created_at asc
  limit 1;

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
      (v_patient_profile_id, 'Confirm reminder window', 'Set your preferred reminder time for first-dose day.', 'upcoming', 'Set this week', 'manual')
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
      (v_patient_profile_id, 'Care team follow-up', timezone('utc', now()) + interval '3 day', 'Thursday at 10:00 AM', 'email', 'scheduled')
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
      and ac.scheduled_for = a.scheduled_for
  );

  insert into public.message_drafts (
    patient_profile_id,
    author_role,
    subject,
    body,
    approved
  )
  select
    v_patient_profile_id,
    'provider',
    'Quick check-in before first dose',
    'Hi, you are almost ready. Please submit your symptom baseline and confirm your reminder window today.',
    false
  where not exists (
    select 1
    from public.message_drafts md
    where md.patient_profile_id = v_patient_profile_id
      and md.subject = 'Quick check-in before first dose'
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
    submitted_at
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
    'submitted',
    timezone('utc', now()) - interval '6 hour'
  where not exists (
    select 1
    from public.prior_auth_requests par
    where par.patient_profile_id = v_patient_profile_id
      and par.medication_name = 'Humira'
  );

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

  raise notice 'seed complete for patient_profile_id: %', v_patient_profile_id;
end
$$;
