create table public.background_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('academic_event_reminder')),
  status text not null default 'pending' check (status in ('pending', 'running', 'retry', 'completed', 'dead')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  result jsonb,
  idempotency_key text not null unique,
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 5 check (max_attempts between 1 and 20),
  scheduled_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_until timestamptz,
  locked_by text,
  last_error text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index background_jobs_claim_idx
  on public.background_jobs (scheduled_at, created_at)
  where status in ('pending', 'retry', 'running');
create index background_jobs_user_created_idx on public.background_jobs (user_id, created_at desc);

alter table public.background_jobs enable row level security;
create policy "background_jobs_select_own" on public.background_jobs
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on table public.background_jobs from anon, authenticated;
grant select on table public.background_jobs to authenticated;
grant select, insert, update, delete on table public.background_jobs to service_role;

create or replace function public.claim_background_jobs(
  worker_id text,
  batch_size integer default 10,
  lock_seconds integer default 60
)
returns setof public.background_jobs
language sql
security definer
set search_path = ''
as $$
  with candidates as (
    select id
    from public.background_jobs
    where attempts < max_attempts
      and scheduled_at <= now()
      and (
        status in ('pending', 'retry')
        or (status = 'running' and locked_until < now())
      )
    order by scheduled_at, created_at
    for update skip locked
    limit least(greatest(batch_size, 1), 100)
  )
  update public.background_jobs jobs
  set status = 'running',
      attempts = jobs.attempts + 1,
      locked_at = now(),
      locked_until = now() + make_interval(secs => least(greatest(lock_seconds, 10), 600)),
      locked_by = worker_id,
      updated_at = now()
  from candidates
  where jobs.id = candidates.id
  returning jobs.*;
$$;

revoke all on function public.claim_background_jobs(text, integer, integer) from public, anon, authenticated;
grant execute on function public.claim_background_jobs(text, integer, integer) to service_role;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.enqueue_academic_event_reminder()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  run_at timestamptz;
begin
  if new.review_status <> 'confirmed'
     or new.start_at is null
     or new.status in ('completed', 'cancelled', 'archived') then
    delete from public.background_jobs where idempotency_key = 'academic-event-reminder:' || new.id::text;
    return new;
  end if;

  run_at := new.start_at - case when new.event_type = 'exam' then interval '72 hours' else interval '24 hours' end;
  insert into public.background_jobs (user_id, type, payload, idempotency_key, scheduled_at)
  values (
    new.user_id,
    'academic_event_reminder',
    jsonb_build_object('eventId', new.id),
    'academic-event-reminder:' || new.id::text,
    greatest(run_at, now())
  )
  on conflict (idempotency_key) do update
    set user_id = excluded.user_id,
        payload = excluded.payload,
        status = 'pending',
        attempts = 0,
        scheduled_at = excluded.scheduled_at,
        locked_at = null,
        locked_until = null,
        locked_by = null,
        last_error = null,
        completed_at = null,
        updated_at = now();
  return new;
end;
$$;

revoke all on function private.enqueue_academic_event_reminder() from public, anon, authenticated;

create trigger enqueue_academic_event_reminder
after insert or update of start_at, event_type, review_status, status on public.academic_events
for each row execute function private.enqueue_academic_event_reminder();

insert into public.background_jobs (user_id, type, payload, idempotency_key, scheduled_at)
select
  user_id,
  'academic_event_reminder',
  jsonb_build_object('eventId', id),
  'academic-event-reminder:' || id::text,
  greatest(start_at - case when event_type = 'exam' then interval '72 hours' else interval '24 hours' end, now())
from public.academic_events
where review_status = 'confirmed'
  and start_at is not null
  and status not in ('completed', 'cancelled', 'archived')
on conflict (idempotency_key) do nothing;
