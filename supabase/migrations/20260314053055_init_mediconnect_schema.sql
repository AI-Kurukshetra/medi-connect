create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('patient', 'provider')),
  full_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patient_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  condition_name text not null,
  therapy_status text not null,
  next_appointment_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medication_plans (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  medication_name text not null,
  dosage text not null,
  frequency text not null,
  instructions text not null,
  refill_due_in_days integer not null default 0 check (refill_due_in_days >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  title text not null,
  description text not null,
  status text not null check (status in ('complete', 'current', 'upcoming')),
  due_at timestamptz,
  due_label text,
  source text not null check (source in ('manual', 'ai')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  title text not null,
  send_at timestamptz,
  window_label text not null,
  channel text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.adherence_check_ins (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  medication_plan_id uuid references public.medication_plans (id) on delete cascade,
  scheduled_for timestamptz,
  status text not null check (status in ('taken', 'missed', 'upcoming')),
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.message_drafts (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  author_role text not null check (author_role in ('patient', 'provider')),
  subject text not null,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_patient_profiles_user_id
  on public.patient_profiles (user_id);

create index if not exists idx_medication_plans_patient_profile_id
  on public.medication_plans (patient_profile_id);

create index if not exists idx_care_tasks_patient_profile_id
  on public.care_tasks (patient_profile_id);

create index if not exists idx_reminders_patient_profile_id
  on public.reminders (patient_profile_id);

create index if not exists idx_adherence_check_ins_patient_profile_id
  on public.adherence_check_ins (patient_profile_id);

create index if not exists idx_message_drafts_patient_profile_id
  on public.message_drafts (patient_profile_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_patient_profiles_updated_at
before update on public.patient_profiles
for each row
execute function public.set_updated_at();

create trigger set_medication_plans_updated_at
before update on public.medication_plans
for each row
execute function public.set_updated_at();

create trigger set_care_tasks_updated_at
before update on public.care_tasks
for each row
execute function public.set_updated_at();

create trigger set_reminders_updated_at
before update on public.reminders
for each row
execute function public.set_updated_at();

create trigger set_adherence_check_ins_updated_at
before update on public.adherence_check_ins
for each row
execute function public.set_updated_at();

create trigger set_message_drafts_updated_at
before update on public.message_drafts
for each row
execute function public.set_updated_at();
