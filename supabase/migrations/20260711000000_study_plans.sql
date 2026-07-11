-- Sprint 9: planos e tarefas de estudo.
create table if not exists public.study_plans (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  available_minutes_per_day integer not null check (available_minutes_per_day between 1 and 1440),
  availability_by_weekday jsonb not null default '{}',
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.study_plans(id) on delete cascade,
  event_id uuid not null references public.academic_events(id) on delete cascade,
  title text not null,
  subject_name text,
  scheduled_for date not null,
  due_at timestamptz not null,
  estimated_minutes integer not null check (estimated_minutes between 1 and 1440),
  priority text not null check (priority in ('low', 'medium', 'high', 'maximum')),
  status text not null default 'todo' check (status in ('todo', 'done', 'skipped')),
  overdue boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_tasks_user_schedule_idx on public.study_tasks(user_id, scheduled_for);
alter table public.study_plans enable row level security;
alter table public.study_tasks enable row level security;
grant select, insert, update, delete on public.study_plans, public.study_tasks to authenticated;
create policy "study_plans_own" on public.study_plans for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "study_tasks_own" on public.study_tasks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
