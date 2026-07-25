-- Incremental hardening for the Sprint 5.5 upload and cancellation contracts.
-- Do not amend the already-applied 20260716041227 migration.
create index if not exists file_upload_intents_expires_at_idx
  on public.file_upload_intents(expires_at)
  where status = 'pending_upload';

create or replace function public.cancel_background_job_server(target_job_id uuid, caller_id uuid)
returns public.background_jobs language plpgsql security definer set search_path = '' as $$
declare job public.background_jobs;
begin
  select * into job from public.background_jobs
    where id = target_job_id and user_id = caller_id and type = 'file_extraction';
  if job.id is null then raise exception 'job not found' using errcode='P0002'; end if;
  if job.status = 'cancelled' then return job; end if;
  if job.status not in ('pending','retry') then raise exception 'job not cancellable' using errcode='P0001'; end if;
  update public.background_jobs
    set status = 'cancelled', cancel_requested_at = now(), cancelled_at = now(), cancelled_by = caller_id,
        locked_at = null, locked_by = null, updated_at = now()
    where id = job.id
    returning * into job;
  return job;
end;
$$;

revoke all on function public.cancel_background_job_server(uuid, uuid) from public;
grant execute on function public.cancel_background_job_server(uuid, uuid) to service_role;
