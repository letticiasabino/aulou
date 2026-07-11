-- Sprint 7: eventos confirmados da agenda acadêmica.
create table if not exists public.academic_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_file_id uuid references public.files(id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  description text,
  subject_name text not null,
  event_type text not null check (event_type in ('class', 'exam', 'assignment', 'forum', 'reading', 'study', 'other')),
  starts_at timestamptz,
  ends_at timestamptz,
  is_all_day boolean not null default false,
  weight numeric check (weight between 0 and 100),
  confidence_score numeric not null check (confidence_score between 0 and 100),
  confidence_label text not null check (confidence_label in ('needs_review', 'probable', 'high_confidence')),
  review_status text not null default 'confirmed' check (review_status in ('pending_review', 'confirmed', 'rejected')),
  priority text not null check (priority in ('low', 'medium', 'high', 'maximum')),
  evidence text,
  review_reasons text[] not null default '{}',
  dedupe_key text not null,
  confirmed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists academic_events_user_starts_at_idx on public.academic_events(user_id, starts_at);
create index if not exists academic_events_user_subject_idx on public.academic_events(user_id, subject_name);

alter table public.academic_events enable row level security;
grant select, insert, update, delete on public.academic_events to authenticated;

create policy "academic_events_select_own" on public.academic_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "academic_events_insert_own" on public.academic_events for insert to authenticated with check ((select auth.uid()) = user_id and review_status = 'confirmed');
create policy "academic_events_update_own" on public.academic_events for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and review_status = 'confirmed');
create policy "academic_events_delete_own" on public.academic_events for delete to authenticated using ((select auth.uid()) = user_id);
