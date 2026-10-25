create table credits (user_id uuid primary key references auth.users(id), balance int not null default 20);
create table processed_events (event_id text primary key);

create function spend_credit(p_user uuid) returns void language sql as $$
  update credits set balance = balance - 1 where user_id = p_user;
$$;
create function add_credits(p_user uuid, p_amount int) returns void language sql as $$
  insert into credits (user_id, balance) values (p_user, p_amount)
  on conflict (user_id) do update set balance = credits.balance + p_amount;
$$;
