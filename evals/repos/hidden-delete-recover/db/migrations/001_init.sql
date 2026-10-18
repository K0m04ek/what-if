create table users (
  id bigserial primary key,
  email text unique not null
);
create table invoices (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  amount_cents int not null,
  paid_at timestamptz
);
create table payments (
  id bigserial primary key,
  invoice_id bigint not null references invoices(id) on delete cascade,
  provider_ref text not null,
  amount_cents int not null
);
