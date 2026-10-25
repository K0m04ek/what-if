create table plans (id text primary key, name text, price_cents int);
alter table plans enable row level security;
create policy "pricing is public" on plans for select using (true);

create table members (
  id uuid primary key references auth.users(id),
  display_name text,
  email text
);
alter table members enable row level security;
create policy "own row" on members for all using (auth.uid() = id) with check (auth.uid() = id);

create view public.club_roster with (security_invoker = true) as
  select id, display_name from members;
