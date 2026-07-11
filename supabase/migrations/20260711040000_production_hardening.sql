alter function public.set_updated_at() set search_path = public;

drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "notifications_insert_own" on public.notifications;
drop policy if exists "notifications_update_own" on public.notifications;

create policy "notifications_select_own" on public.notifications
for select to authenticated using ((select auth.uid()) = user_id);
create policy "notifications_insert_own" on public.notifications
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "notifications_update_own" on public.notifications
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists academic_events_source_file_id_idx on public.academic_events(source_file_id);
create index if not exists courses_institution_id_idx on public.courses(institution_id);
create index if not exists file_extractions_user_id_idx on public.file_extractions(user_id);
create index if not exists files_subject_id_idx on public.files(subject_id);
create index if not exists flashcard_decks_user_id_idx on public.flashcard_decks(user_id);
create index if not exists flashcard_reviews_flashcard_id_idx on public.flashcard_reviews(flashcard_id);
create index if not exists flashcard_reviews_user_id_idx on public.flashcard_reviews(user_id);
create index if not exists flashcards_deck_id_idx on public.flashcards(deck_id);
create index if not exists flashcards_source_file_id_idx on public.flashcards(source_file_id);
create index if not exists notifications_related_event_id_idx on public.notifications(related_event_id);
create index if not exists profiles_course_id_idx on public.profiles(course_id);
create index if not exists profiles_institution_id_idx on public.profiles(institution_id);
create index if not exists profiles_semester_id_idx on public.profiles(semester_id);
create index if not exists semesters_course_id_idx on public.semesters(course_id);
create index if not exists study_plans_user_id_idx on public.study_plans(user_id);
create index if not exists study_tasks_event_id_idx on public.study_tasks(event_id);
create index if not exists study_tasks_plan_id_idx on public.study_tasks(plan_id);
create index if not exists subjects_semester_id_idx on public.subjects(semester_id);
create index if not exists subjects_teacher_id_idx on public.subjects(teacher_id);
