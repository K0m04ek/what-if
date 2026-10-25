create role agent_ro login;
grant usage on schema public to agent_ro;
grant select on plans to agent_ro;
grant select (id, display_name) on members to agent_ro;
