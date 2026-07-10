create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) >= 2),
  campus text,
  city text,
  country text not null default 'Brasil',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete set null,
  name text not null check (char_length(trim(name)) >= 2),
  institution_name text not null,
  degree text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  label text not null,
  number integer not null check (number between 1 and 12),
  academic_year integer not null check (academic_year >= 2020),
  starts_on date,
  ends_on date,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint semesters_date_order check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  semester_id uuid references public.semesters(id) on delete set null,
  display_name text not null check (char_length(trim(display_name)) >= 2),
  institution_name text not null,
  course_name text not null,
  current_semester integer not null check (current_semester between 1 and 12),
  academic_year integer not null check (academic_year >= 2020),
  timezone text not null default 'America/Sao_Paulo',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) >= 2),
  email text,
  department text,
  notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid references public.semesters(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  name text not null check (char_length(trim(name)) >= 2),
  code text,
  weekly_hours integer check (weekly_hours between 1 and 40),
  difficulty integer not null default 3 check (difficulty between 1 and 5),
  color text not null default '#9b7cff',
  schedule_notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  storage_bucket text not null default 'academic-files',
  storage_path text not null,
  original_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  checksum text,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'processed', 'failed', 'deleted')),
  consent_for_ai_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, storage_path)
);

create table if not exists public.file_extractions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_id uuid not null references public.files(id) on delete cascade,
  raw_text text,
  structured_payload jsonb,
  provider text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  safe_error text,
  token_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  theme text not null default 'dark',
  timezone text not null default 'America/Sao_Paulo',
  notifications_enabled boolean not null default true,
  automatic_import_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'plus', 'pro', 'early_access')),
  status text not null default 'active',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  uploads_count integer not null default 0,
  ai_requests_count integer not null default 0,
  flashcards_count integer not null default 0,
  quizzes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, period_start, period_end),
  constraint usage_limits_period_order check (period_end >= period_start)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists institutions_user_id_idx on public.institutions(user_id);
create index if not exists courses_user_id_idx on public.courses(user_id);
create index if not exists semesters_user_id_idx on public.semesters(user_id);
create index if not exists teachers_user_id_idx on public.teachers(user_id);
create index if not exists subjects_user_id_idx on public.subjects(user_id);
create index if not exists files_user_id_idx on public.files(user_id);
create index if not exists files_status_idx on public.files(status);
create index if not exists file_extractions_file_id_idx on public.file_extractions(file_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists usage_limits_user_id_idx on public.usage_limits(user_id);
create index if not exists audit_logs_user_id_created_at_idx on public.audit_logs(user_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'institutions',
    'courses',
    'semesters',
    'profiles',
    'teachers',
    'subjects',
    'files',
    'file_extractions',
    'user_settings'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_set_updated_at', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );

    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);

    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      table_name || '_select_own',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      table_name || '_insert_own',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name || '_update_own',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      table_name || '_delete_own',
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['subscriptions', 'usage_limits']
  loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_set_updated_at', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );

    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select on public.%I to authenticated', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      table_name || '_select_own',
      table_name
    );
  end loop;
end $$;

alter table public.audit_logs enable row level security;
grant select, insert on public.audit_logs to authenticated;

create policy audit_logs_select_own
on public.audit_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy audit_logs_insert_own
on public.audit_logs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'academic-files',
  'academic-files',
  false,
  26214400,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy academic_files_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'academic-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy academic_files_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'academic-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy academic_files_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'academic-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'academic-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy academic_files_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'academic-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
