-- Sample table: the pattern for user-owned rows (RLS by owner). Replace with your product schema.
create table public.notes (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
	title text not null check (char_length(title) between 1 and 200),
	created_at timestamptz not null default now()
);

create index notes_user_id_created_at_idx on public.notes (user_id, created_at desc);

alter table public.notes enable row level security;

create policy "Owners read their notes" on public.notes
	for select to authenticated using ((select auth.uid()) = user_id);

create policy "Owners insert their notes" on public.notes
	for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Owners update their notes" on public.notes
	for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Owners delete their notes" on public.notes
	for delete to authenticated using ((select auth.uid()) = user_id);
