
-- 1. Create a type for application roles
create type public.app_role as enum ('admin');

-- 2. Create a table to assign roles to users
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

-- 3. Enable Row Level Security for the new table
alter table public.user_roles enable row level security;

-- 4. Create a function to check if a user has a specific role
-- This function runs with the privileges of the user who created it,
-- allowing it to bypass RLS policies and check roles securely.
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 5. Create RLS policies for the user_roles table
-- Allow users to view their own roles
create policy "Users can view their own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

-- Allow admins to manage all user roles
create policy "Admins can manage user roles"
on public.user_roles
for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

