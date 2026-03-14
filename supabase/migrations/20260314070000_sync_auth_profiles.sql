create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_role text;
  account_name text;
begin
  account_role := coalesce(new.raw_user_meta_data ->> 'role', 'patient');

  if account_role not in ('patient', 'provider') then
    account_role := 'patient';
  end if;

  account_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(new.email, 'member@mediconnect.app'), '@', 1)
  );

  insert into public.profiles (id, role, full_name)
  values (new.id, account_role, account_name)
  on conflict (id) do update
    set role = excluded.role,
        full_name = excluded.full_name;

  if account_role = 'patient' then
    insert into public.patient_profiles (
      user_id,
      condition_name,
      therapy_status
    )
    values (
      new.id,
      'Needs intake review',
      'Getting started'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
