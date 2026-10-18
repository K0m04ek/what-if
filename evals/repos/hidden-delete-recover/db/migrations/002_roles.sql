create role app_writer nologin;
grant select, insert, update, delete on all tables in schema public to app_writer;

create role app_agent login;
grant usage on schema public to app_agent;
grant select on all tables in schema public to app_agent;
