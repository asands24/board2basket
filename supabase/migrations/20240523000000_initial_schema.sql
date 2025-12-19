-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);

-- Create households table
create table public.households (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Create household_members table
create table public.household_members (
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('owner', 'member')),
  created_at timestamptz default now(),
  primary key (household_id, user_id)
);

-- Create lists table
create table public.lists (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade,
  title text not null,
  status text check (status in ('draft', 'shopping', 'complete')) default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Create list_items table
create table public.list_items (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references public.lists(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  category text,
  confidence numeric,
  status text check (status in ('active', 'purchased', 'removed')) default 'active',
  claimed_by uuid references public.profiles(id),
  source text check (source in ('manual', 'whiteboard', 'receipt')) default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create whiteboard_uploads table
create table public.whiteboard_uploads (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade,
  list_id uuid references public.lists(id) on delete cascade,
  uploaded_by uuid references public.profiles(id),
  image_path text not null,
  raw_ai_json jsonb,
  created_at timestamptz default now()
);

-- Create mealplans table
create table public.mealplans (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade,
  list_id uuid references public.lists(id) on delete set null,
  start_date date,
  days int,
  preferences jsonb,
  plan_json jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.whiteboard_uploads enable row level security;
alter table public.mealplans enable row level security;

-- Policies

-- Profiles: Users can view all profiles (for member search) but update only own
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Helper function to check membership
create or replace function is_household_member(household_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from household_members
    where household_id = household_uuid
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Households
create policy "Users can view households they belong to"
  on households for select
  using ( is_household_member(id) );

create policy "Users can insert households"
  on households for insert
  with check ( auth.uid() = created_by );
  -- Logic: When creating, you aren't a member yet technically, so we need to allow creation.
  -- But usually we insert the member row in same transaction or right after.
  -- Simple approach: Allow auth users to create, verify created_by matches uid.

create policy "Owners can update households"
  on households for update
  using (
    exists (
      select 1 from household_members
      where household_id = households.id
      and user_id = auth.uid()
      and role = 'owner'
    )
  );

-- Household Members
create policy "Members can view other members of same household"
  on household_members for select
  using (
    is_household_member(household_id) or user_id = auth.uid()
  );

create policy "Users can join households (insert self)"
  on household_members for insert
  with check ( user_id = auth.uid() );
  -- Note: This is loose, allows joining any household if you know the ID.
  -- For MVP, this is acceptable if we assume household ID sharing is the invite mechanism.

-- Lists
create policy "Members see lists"
  on lists for select
  using ( is_household_member(household_id) );

create policy "Members create lists"
  on lists for insert
  with check ( is_household_member(household_id) );

create policy "Members update lists"
  on lists for update
  using ( is_household_member(household_id) );

-- List Items
create policy "Members see items"
  on list_items for select
  using (
    exists ( select 1 from lists where id = list_items.list_id and is_household_member(lists.household_id) )
  );

create policy "Members create items"
  on list_items for insert
  with check (
    exists ( select 1 from lists where id = list_items.list_id and is_household_member(lists.household_id) )
  );

create policy "Members update items"
  on list_items for update
  using (
    exists ( select 1 from lists where id = list_items.list_id and is_household_member(lists.household_id) )
  );

create policy "Members delete items"
  on list_items for delete
  using (
    exists ( select 1 from lists where id = list_items.list_id and is_household_member(lists.household_id) )
  );


-- Whiteboard Uploads
create policy "Members see uploads"
  on whiteboard_uploads for select
  using ( is_household_member(household_id) );

create policy "Members insert uploads"
  on whiteboard_uploads for insert
  with check ( is_household_member(household_id) );

-- Mealplans
create policy "Members see mealplans"
  on mealplans for select
  using ( is_household_member(household_id) );

create policy "Members insert mealplans"
  on mealplans for insert
  with check ( is_household_member(household_id) );

-- Trigger for Profile creation on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bucket for images
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true) on conflict do nothing;

create policy "Members view images"
  on storage.objects for select
  using ( bucket_id = 'uploads' and auth.role() = 'authenticated' ); 
  -- Simplified for MVP: Any auth user can view. Real RLS involves checking path/metadata.

create policy "Members upload images"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' and auth.role() = 'authenticated' );
