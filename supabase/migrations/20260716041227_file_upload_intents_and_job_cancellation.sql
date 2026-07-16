create table public.file_upload_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_id uuid not null unique default gen_random_uuid(),
  storage_bucket text not null default 'academic-files' check (storage_bucket = 'academic-files'),
  storage_path text not null unique,
  original_name text not null,
  content_type text not null check (content_type in ('application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv','image/png','image/jpeg','image/webp')),
  expected_size_bytes bigint not null check (expected_size_bytes > 0 and expected_size_bytes <= 10485760),
  idempotency_key text not null,
  status text not null default 'pending_upload' check (status in ('pending_upload','completed','expired','cancelled')),
  expires_at timestamptz not null default now() + interval '15 minutes',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
alter table public.file_upload_intents enable row level security;
revoke all on public.file_upload_intents from anon, authenticated;
grant select on public.file_upload_intents to authenticated;
create policy file_upload_intents_select_own on public.file_upload_intents for select to authenticated using ((select auth.uid()) = user_id);
create index file_upload_intents_user_status_idx on public.file_upload_intents(user_id, status, expires_at);

alter table public.background_jobs add column cancel_requested_at timestamptz, add column cancelled_at timestamptz, add column cancelled_by uuid references auth.users(id) on delete set null;
create index background_jobs_cancel_idx on public.background_jobs(user_id, status, environment, queue_name);

create or replace function public.cancel_background_job_server(target_job_id uuid, caller_id uuid)
returns public.background_jobs language plpgsql security definer set search_path = '' as $$
declare job public.background_jobs;
begin
  select * into job from public.background_jobs where id = target_job_id and user_id = caller_id;
  if job.id is null then raise exception 'job not found' using errcode='P0002'; end if;
  if job.status = 'cancelled' then return job; end if;
  if job.status not in ('pending','retry') then raise exception 'job not cancellable' using errcode='P0001'; end if;
  update public.background_jobs set status='cancelled', cancelled_at=now(), cancelled_by=caller_id, locked_at=null, locked_until=null, locked_by=null, updated_at=now() where id=job.id returning * into job;
  return job;
end; $$;
revoke all on function public.cancel_background_job_server(uuid,uuid) from public, anon, authenticated;
grant execute on function public.cancel_background_job_server(uuid,uuid) to service_role;
