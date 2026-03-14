create table if not exists public.provider_patient_assignments (
  id uuid primary key default gen_random_uuid(),
  provider_user_id uuid not null references public.profiles (id) on delete cascade,
  patient_profile_id uuid not null references public.patient_profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider_user_id, patient_profile_id)
);

create index if not exists idx_provider_patient_assignments_provider_user_id
  on public.provider_patient_assignments (provider_user_id);

create index if not exists idx_provider_patient_assignments_patient_profile_id
  on public.provider_patient_assignments (patient_profile_id);

drop trigger if exists set_provider_patient_assignments_updated_at on public.provider_patient_assignments;
create trigger set_provider_patient_assignments_updated_at
before update on public.provider_patient_assignments
for each row
execute function public.set_updated_at();

