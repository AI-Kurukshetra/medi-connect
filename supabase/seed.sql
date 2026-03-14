-- Demo seed data for shared route MVP.
-- This script assumes auth users + public profiles already exist.

do $$
declare
  v_patient_profile_id uuid;
  v_patient_user_id uuid;
  v_provider_user_id uuid;
  v_medication_plan_id uuid;
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

  raise notice 'seed complete for patient_profile_id: %', v_patient_profile_id;
end
$$;

