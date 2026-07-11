-- Sprint 10: baralhos, flashcards e histórico de revisão.
create table if not exists public.flashcard_decks (
  id text primary key, user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, subject_name text not null, description text, card_count integer not null default 0 check (card_count >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.flashcards (
  id text primary key, deck_id text not null references public.flashcard_decks(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  front text not null, back text not null, source_file_id uuid references public.files(id) on delete set null,
  next_review_at timestamptz not null, repetitions integer not null default 0 check (repetitions >= 0), interval_days integer not null default 0 check (interval_days >= 0), ease_factor numeric not null default 2.5 check (ease_factor between 1.3 and 5), last_reviewed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.flashcard_reviews (
  id text primary key, flashcard_id text not null references public.flashcards(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')), reviewed_at timestamptz not null, previous_interval_days integer not null, next_interval_days integer not null
);
create index if not exists flashcards_user_due_idx on public.flashcards(user_id, next_review_at);
alter table public.flashcard_decks enable row level security; alter table public.flashcards enable row level security; alter table public.flashcard_reviews enable row level security;
grant select, insert, update, delete on public.flashcard_decks, public.flashcards, public.flashcard_reviews to authenticated;
create policy "flashcard_decks_own" on public.flashcard_decks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "flashcards_own" on public.flashcards for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "flashcard_reviews_own" on public.flashcard_reviews for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
