create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('bug', 'suggestion', 'compliment', 'question', 'other')),
  message text not null check (char_length(message) between 10 and 2000),
  rating integer not null check (rating between 1 and 5),
  page_url text,
  user_agent text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_user_created_idx on public.feedback(user_id, created_at desc);
alter table public.feedback enable row level security;
drop policy if exists "feedback_insert_own" on public.feedback;
create policy "feedback_insert_own" on public.feedback for insert to authenticated with check ((select auth.uid()) = user_id);
grant insert on public.feedback to authenticated;
