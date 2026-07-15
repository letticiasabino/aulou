alter table public.background_jobs
  add column environment text,
  add column queue_name text,
  add column available_at timestamptz,
  add column priority integer;

-- Previous jobs were created in the only remote project. Fixtures from the
-- documented Sprint 5 validation are isolated as test; all other legacy jobs
-- stay production and are never requeued by this migration.
update public.background_jobs jobs
set environment = case
      when exists (
        select 1 from auth.users users
        where users.id = jobs.user_id
          and users.email like 'sprint5-%@example.test'
      ) then 'test'
      else 'production'
    end,
    queue_name = case jobs.type
      when 'file_extraction' then 'file-extraction'
      when 'academic_event_reminder' then 'notification'
      else 'document-analysis'
    end,
    available_at = jobs.scheduled_at,
    priority = 100
where environment is null or queue_name is null or available_at is null or priority is null;

alter table public.background_jobs
  alter column environment set not null,
  alter column queue_name set not null,
  alter column available_at set not null,
  alter column priority set not null,
  alter column environment set default 'production',
  alter column priority set default 100;

alter table public.background_jobs
  add constraint background_jobs_environment_check
    check (environment in ('development', 'test', 'staging', 'production')),
  add constraint background_jobs_queue_name_check
    check (queue_name in ('file-extraction', 'notification', 'ocr', 'document-analysis', 'email')),
  add constraint background_jobs_priority_check
    check (priority between -1000 and 1000);

create index background_jobs_environment_claim_idx
  on public.background_jobs (environment, queue_name, priority desc, available_at, created_at)
  where status in ('pending', 'retry', 'running');

create or replace function private.job_queue_for_type(job_type text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case job_type
    when 'file_extraction' then 'file-extraction'
    when 'academic_event_reminder' then 'notification'
    else null
  end;
$$;
revoke all on function private.job_queue_for_type(text) from public, anon, authenticated;

create or replace function public.claim_background_jobs(
  worker_id text,
  worker_environment text,
  worker_queues text[],
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
    where environment = worker_environment
      and queue_name = any(worker_queues)
      and attempts < max_attempts
      and available_at <= now()
      and (
        status in ('pending', 'retry')
        or (status = 'running' and locked_until < now())
      )
    order by priority desc, available_at, created_at
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
revoke all on function public.claim_background_jobs(text, text, text[], integer, integer) from public, anon, authenticated;
grant execute on function public.claim_background_jobs(text, text, text[], integer, integer) to service_role;

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
  insert into public.background_jobs (user_id, type, environment, queue_name, payload, idempotency_key, scheduled_at, available_at)
  values (
    new.user_id,
    'academic_event_reminder',
    'production',
    private.job_queue_for_type('academic_event_reminder'),
    jsonb_build_object('eventId', new.id),
    'academic-event-reminder:' || new.id::text,
    greatest(run_at, now()),
    greatest(run_at, now())
  )
  on conflict (idempotency_key) do update
    set user_id = excluded.user_id,
        payload = excluded.payload,
        status = 'pending',
        attempts = 0,
        scheduled_at = excluded.scheduled_at,
        available_at = excluded.available_at,
        locked_at = null,
        locked_until = null,
        locked_by = null,
        last_error = null,
        completed_at = null,
        updated_at = now();
  return new;
end;
$$;

create or replace function public.request_file_extraction_server(
  target_file_id uuid,
  requested_key text,
  caller_id uuid,
  requested_environment text
)
returns public.file_extractions
language plpgsql
security definer
set search_path = ''
as $$
declare extraction public.file_extractions;
begin
  if requested_environment not in ('development', 'test', 'staging', 'production') then
    raise exception 'invalid job environment' using errcode = '22023';
  end if;
  if requested_key is null or char_length(requested_key) not between 1 and 200 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  if not exists (select 1 from public.files where id = target_file_id and user_id = caller_id and status <> 'deleted' and size_bytes <= 10485760) then
    raise exception 'file not found' using errcode = 'P0002';
  end if;
  select * into extraction from public.file_extractions where user_id = caller_id and file_id = target_file_id order by created_at desc limit 1;
  if extraction.id is null then
    insert into public.file_extractions (user_id, file_id, request_key, provider, status)
    values (caller_id, target_file_id, requested_key, 'local', 'pending')
    on conflict (user_id, request_key) where request_key is not null do update set updated_at = public.file_extractions.updated_at
      where public.file_extractions.file_id = excluded.file_id
    returning * into extraction;
  elsif extraction.request_key is null then
    update public.file_extractions set request_key = requested_key, provider = 'local', updated_at = now() where id = extraction.id returning * into extraction;
  end if;
  if extraction.id is null or extraction.file_id <> target_file_id then
    raise exception 'idempotency key reused with different file' using errcode = '23505';
  end if;
  insert into public.background_jobs (user_id, type, environment, queue_name, payload, idempotency_key, scheduled_at, available_at)
  values (caller_id, 'file_extraction', requested_environment, private.job_queue_for_type('file_extraction'), jsonb_build_object('extractionId', extraction.id, 'fileId', extraction.file_id), 'file-extraction:' || extraction.id::text, now(), now())
  on conflict (idempotency_key) do nothing;
  return extraction;
end;
$$;
revoke all on function public.request_file_extraction_server(uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.request_file_extraction_server(uuid, text, uuid, text) to service_role;
revoke execute on function public.request_file_extraction(uuid, text) from authenticated;

create or replace function public.retry_file_extraction_server(target_extraction_id uuid, caller_id uuid)
returns public.file_extractions
language plpgsql
security definer
set search_path = ''
as $$
declare extraction public.file_extractions; job_environment text;
begin
  update public.file_extractions set status = 'pending', safe_error = null, started_at = null, completed_at = null, updated_at = now()
    where id = target_extraction_id and user_id = caller_id and status in ('failed', 'ocr_required') returning * into extraction;
  if extraction.id is null then raise exception 'extraction not retryable' using errcode = 'P0002'; end if;
  select environment into job_environment from public.background_jobs where idempotency_key = 'file-extraction:' || extraction.id::text;
  if job_environment is null then raise exception 'job environment not found' using errcode = 'P0002'; end if;
  update public.background_jobs set status = 'pending', attempts = 0, scheduled_at = now(), available_at = now(), locked_at = null, locked_until = null, locked_by = null, last_error = null, completed_at = null, updated_at = now()
    where idempotency_key = 'file-extraction:' || extraction.id::text;
  return extraction;
end;
$$;
revoke all on function public.retry_file_extraction_server(uuid, uuid) from public, anon, authenticated;
grant execute on function public.retry_file_extraction_server(uuid, uuid) to service_role;
revoke execute on function public.retry_file_extraction(uuid) from authenticated;
