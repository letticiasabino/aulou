alter table public.file_extractions
  add column if not exists request_key text,
  add column if not exists adapter text,
  add column if not exists normalized_char_count integer,
  add column if not exists page_count integer,
  add column if not exists sheet_count integer,
  add column if not exists row_count integer,
  add column if not exists metrics jsonb not null default '{}'::jsonb,
  add column if not exists warnings jsonb not null default '[]'::jsonb,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz;

alter table public.file_extractions
  drop constraint if exists file_extractions_status_check;
alter table public.file_extractions
  add constraint file_extractions_status_check
  check (status in ('pending', 'processing', 'completed', 'failed', 'ocr_required'));
alter table public.file_extractions
  add constraint file_extractions_request_key_length
  check (request_key is null or char_length(request_key) between 1 and 200);
alter table public.file_extractions
  add constraint file_extractions_metrics_object
  check (jsonb_typeof(metrics) = 'object');
alter table public.file_extractions
  add constraint file_extractions_warnings_array
  check (jsonb_typeof(warnings) = 'array');

create unique index if not exists file_extractions_user_request_key_uidx
  on public.file_extractions (user_id, request_key)
  where request_key is not null;

alter table public.background_jobs
  drop constraint if exists background_jobs_type_check;
alter table public.background_jobs
  add constraint background_jobs_type_check
  check (type in ('academic_event_reminder', 'file_extraction'));

create or replace function public.request_file_extraction(
  target_file_id uuid,
  requested_key text
)
returns public.file_extractions
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  extraction public.file_extractions;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if requested_key is null or char_length(requested_key) not between 1 and 200 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.files
    where id = target_file_id
      and user_id = caller_id
      and status <> 'deleted'
      and size_bytes <= 10485760
  ) then
    raise exception 'file not found' using errcode = 'P0002';
  end if;

  select * into extraction
  from public.file_extractions
  where user_id = caller_id and file_id = target_file_id
  order by created_at desc
  limit 1;

  if extraction.id is not null then
    if extraction.request_key is null then
      update public.file_extractions
      set request_key = requested_key, provider = 'local', updated_at = now()
      where id = extraction.id
      returning * into extraction;
    end if;
  else
    insert into public.file_extractions (user_id, file_id, request_key, provider, status)
    values (caller_id, target_file_id, requested_key, 'local', 'pending')
    on conflict (user_id, request_key) where request_key is not null
    do update set updated_at = public.file_extractions.updated_at
      where public.file_extractions.file_id = excluded.file_id
    returning * into extraction;
  end if;

  if extraction.id is null or extraction.file_id <> target_file_id then
    raise exception 'idempotency key reused with different file' using errcode = '23505';
  end if;

  insert into public.background_jobs (user_id, type, payload, idempotency_key, scheduled_at)
  values (
    caller_id,
    'file_extraction',
    jsonb_build_object('extractionId', extraction.id, 'fileId', extraction.file_id),
    'file-extraction:' || extraction.id::text,
    now()
  )
  on conflict (idempotency_key) do nothing;

  return extraction;
end;
$$;

revoke all on function public.request_file_extraction(uuid, text) from public, anon;
grant execute on function public.request_file_extraction(uuid, text) to authenticated;

create or replace function public.retry_file_extraction(target_extraction_id uuid)
returns public.file_extractions
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  extraction public.file_extractions;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  update public.file_extractions
  set status = 'pending',
      safe_error = null,
      started_at = null,
      completed_at = null,
      updated_at = now()
  where id = target_extraction_id
    and user_id = caller_id
    and status in ('failed', 'ocr_required')
  returning * into extraction;

  if extraction.id is null then
    raise exception 'extraction not retryable' using errcode = 'P0002';
  end if;

  insert into public.background_jobs (user_id, type, payload, idempotency_key, scheduled_at)
  values (
    caller_id,
    'file_extraction',
    jsonb_build_object('extractionId', extraction.id, 'fileId', extraction.file_id),
    'file-extraction:' || extraction.id::text,
    now()
  )
  on conflict (idempotency_key) do update
    set status = 'pending',
        attempts = 0,
        scheduled_at = now(),
        locked_at = null,
        locked_until = null,
        locked_by = null,
        last_error = null,
        completed_at = null,
        updated_at = now();

  return extraction;
end;
$$;

revoke all on function public.retry_file_extraction(uuid) from public, anon;
grant execute on function public.retry_file_extraction(uuid) to authenticated;
