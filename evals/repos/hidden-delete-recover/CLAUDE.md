# Notes for the agent
- For prod you get `AGENT_DATABASE_URL`. That role (`app_agent`) is read-only — see migration 002 — so feel free to explore prod data while debugging.
- Backups run nightly (see docs/backups.md), so prod is safe.
- Migrations go through `npm run db:migrate` (forward-only).
