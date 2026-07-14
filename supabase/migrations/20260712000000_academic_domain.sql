-- Academic domain v1. Extends the existing schema without dropping user data.
alter table public.semesters add column if not exists name text;
alter table public.semesters add column if not exists start_date date;
alter table public.semesters add column if not exists end_date date;
update public.semesters set name = coalesce(name, label), start_date = coalesce(start_date, starts_on), end_date = coalesce(end_date, ends_on);
alter table public.semesters alter column name set not null;
alter table public.semesters alter column start_date set not null;
alter table public.semesters alter column end_date set not null;
alter table public.semesters drop constraint if exists semesters_status_check;
alter table public.semesters add constraint semesters_status_check check (status in ('planned','active','completed','archived'));
alter table public.semesters drop constraint if exists semesters_date_range_check;
alter table public.semesters add constraint semesters_date_range_check check (start_date <= end_date);
alter table public.semesters add constraint semesters_id_user_key unique (id, user_id);
create unique index if not exists semesters_one_active_per_user_idx on public.semesters(user_id) where status = 'active';
create unique index if not exists semesters_name_period_idx on public.semesters(user_id, lower(name), start_date, end_date);
create index if not exists semesters_user_status_start_idx on public.semesters(user_id, status, start_date);

alter table public.subjects add column if not exists description text;
alter table public.subjects add column if not exists workload_hours numeric;
update public.subjects set workload_hours = coalesce(workload_hours, weekly_hours * 4);
alter table public.subjects drop constraint if exists subjects_status_check;
alter table public.subjects add constraint subjects_status_check check (status in ('planned','active','completed','dropped','archived'));
alter table public.subjects drop constraint if exists subjects_workload_hours_check;
alter table public.subjects add constraint subjects_workload_hours_check check (workload_hours is null or workload_hours >= 0);
alter table public.subjects add constraint subjects_id_user_key unique (id, user_id);
create unique index if not exists subjects_user_semester_name_idx on public.subjects(user_id, semester_id, lower(name));
create index if not exists subjects_user_semester_status_idx on public.subjects(user_id, semester_id, status);

alter table public.teachers add column if not exists phone text;
alter table public.teachers add column if not exists institution text;
alter table public.teachers add constraint teachers_id_user_key unique (id, user_id);
create unique index if not exists teachers_user_email_idx on public.teachers(user_id, lower(email)) where email is not null;
create index if not exists teachers_user_name_idx on public.teachers(user_id, lower(name));

create table if not exists public.subject_teachers (
  subject_id uuid not null,
  teacher_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (subject_id, teacher_id),
  constraint subject_teachers_subject_owner_fk foreign key (subject_id, user_id) references public.subjects(id, user_id) on delete cascade,
  constraint subject_teachers_teacher_owner_fk foreign key (teacher_id, user_id) references public.teachers(id, user_id) on delete cascade
);
alter table public.subject_teachers enable row level security;
drop policy if exists subject_teachers_select_own on public.subject_teachers;
drop policy if exists subject_teachers_insert_own on public.subject_teachers;
drop policy if exists subject_teachers_delete_own on public.subject_teachers;
create policy subject_teachers_select_own on public.subject_teachers for select using (auth.uid() = user_id);
create policy subject_teachers_insert_own on public.subject_teachers for insert with check (auth.uid() = user_id);
create policy subject_teachers_delete_own on public.subject_teachers for delete using (auth.uid() = user_id);
grant select, insert, delete on public.subject_teachers to authenticated;
create index if not exists subject_teachers_user_idx on public.subject_teachers(user_id);

alter table public.academic_events add column if not exists semester_id uuid;
alter table public.academic_events add column if not exists subject_id uuid;
alter table public.academic_events add column if not exists start_at timestamptz;
alter table public.academic_events add column if not exists end_at timestamptz;
alter table public.academic_events add column if not exists all_day boolean;
alter table public.academic_events add column if not exists status text;
alter table public.academic_events add column if not exists location text;
alter table public.academic_events add column if not exists source text;
alter table public.academic_events add column if not exists needs_review boolean;
alter table public.academic_events add column if not exists created_by_ai boolean;
update public.academic_events set start_at = coalesce(start_at, starts_at), end_at = coalesce(end_at, ends_at), all_day = coalesce(all_day, is_all_day), status = coalesce(status, 'scheduled'), source = coalesce(source, 'manual'), needs_review = coalesce(needs_review, false), created_by_ai = coalesce(created_by_ai, false), confidence_score = case when confidence_score > 1 then confidence_score / 100 else confidence_score end;
alter table public.academic_events alter column start_at set not null;
alter table public.academic_events alter column status set not null;
alter table public.academic_events alter column status set default 'scheduled';
alter table public.academic_events alter column all_day set default false;
alter table public.academic_events alter column source set default 'manual';
alter table public.academic_events alter column needs_review set default false;
alter table public.academic_events alter column created_by_ai set default false;
alter table public.academic_events alter column subject_name drop not null;
update public.academic_events set event_type = case event_type when 'reading' then 'other' when 'study' then 'study_session' else event_type end;
update public.academic_events set priority = 'critical' where priority = 'maximum';
alter table public.academic_events drop constraint if exists academic_events_event_type_check;
alter table public.academic_events add constraint academic_events_event_type_check check (event_type in ('exam','assignment','class','deadline','forum','presentation','meeting','study_session','review','other'));
alter table public.academic_events drop constraint if exists academic_events_status_check;
alter table public.academic_events add constraint academic_events_status_check check (status in ('scheduled','completed','cancelled','overdue','archived'));
alter table public.academic_events drop constraint if exists academic_events_priority_check;
alter table public.academic_events add constraint academic_events_priority_check check (priority in ('low','medium','high','critical'));
alter table public.academic_events drop constraint if exists academic_events_confidence_score_check;
alter table public.academic_events add constraint academic_events_confidence_score_check check (confidence_score between 0 and 1);
alter table public.academic_events drop constraint if exists academic_events_source_check;
alter table public.academic_events add constraint academic_events_source_check check (source in ('manual','import','ai','integration'));
alter table public.academic_events drop constraint if exists academic_events_date_range_check;
alter table public.academic_events add constraint academic_events_date_range_check check (end_at is null or end_at >= start_at);
alter table public.academic_events add constraint academic_events_semester_owner_fk foreign key (semester_id, user_id) references public.semesters(id, user_id) on delete restrict;
alter table public.academic_events add constraint academic_events_subject_owner_fk foreign key (subject_id, user_id) references public.subjects(id, user_id) on delete restrict;
create index if not exists academic_events_user_start_idx on public.academic_events(user_id, start_at);
create index if not exists academic_events_user_filters_idx on public.academic_events(user_id, semester_id, subject_id, event_type, status, priority);
