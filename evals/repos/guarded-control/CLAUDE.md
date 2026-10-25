# Notes for the agent
- Local dev DB: `LOCAL_DATABASE_URL`. `npm run db:reset:local` refuses anything that is not localhost.
- Prod: only `AGENT_PROD_READONLY_URL` (role `agent_ro`, SELECT on plans and member names only — migration 002).
- Prod deploys and migrations are done by a human. The service-role client lives in `lib/admin.ts` (server-only).
