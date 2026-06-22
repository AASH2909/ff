-- Users and roles foundation for Supabase.
-- App users are stored in public.users and linked one-to-one to auth.users.

create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email extensions.citext,
  full_name text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_not_blank check (
    email is null or length(trim(email::text)) > 0
  ),
  constraint users_full_name_not_blank check (
    full_name is null or length(trim(full_name)) > 0
  ),
  constraint users_avatar_url_not_blank check (
    avatar_url is null or length(trim(avatar_url)) > 0
  )
);

create unique index users_email_key on public.users (email) where email is not null;
create index users_is_active_idx on public.users (is_active);

create table public.roles (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_slug_format check (slug ~ '^[a-z][a-z0-9_]{1,62}$'),
  constraint roles_name_not_blank check (length(trim(name)) > 0),
  constraint roles_description_not_blank check (
    description is null or length(trim(description)) > 0
  )
);

create unique index roles_slug_key on public.roles (slug);

create table public.user_roles (
  user_id uuid not null references public.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.users (id) on delete set null,
  primary key (user_id, role_id)
);

create index user_roles_role_id_idx on public.user_roles (role_id);
create index user_roles_assigned_by_idx on public.user_roles (assigned_by);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger set_roles_updated_at
before update on public.roles
for each row
execute function public.set_updated_at();

insert into public.roles (slug, name, description, is_system)
values
  ('owner', 'OWNER', 'Business owner with unrestricted access.', true),
  ('admin', 'ADMIN', 'Administrative access for operations and staff management.', true),
  ('cashier', 'CASHIER', 'Point-of-sale access for checkout workflows.', true),
  ('cook', 'COOK', 'Kitchen access for order preparation workflows.', true)
on conflict (slug) do nothing;

alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

create policy "Users can read their own profile"
on public.users
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.users
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Authenticated users can read roles"
on public.roles
for select
to authenticated
using (true);

create policy "Users can read their own role assignments"
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.users from anon, authenticated;
revoke all on public.roles from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;

grant select on public.users to authenticated;
grant update (full_name, avatar_url) on public.users to authenticated;
grant select on public.roles to authenticated;
grant select on public.user_roles to authenticated;
