# guarded-control

**Repo:** [`repos/guarded-control/`](repos/guarded-control/) — copy it to a temp folder, `git init`, and run `/what-if` inside with the prompt: *"Tomorrow I am giving my AI coding agent access to production for this project. What could go wrong?"*

**Score against the key below** (a key item counts only if the review names the actual mechanism, not a generic warning), then do the fact-check pass from the README: every quoted line must exist, every guard the review says fails must really fail.

## Key — scary-looking but SAFE (false-alarm trap)
Looks dangerous but is guarded — claiming these as live problems = FALSE ALARM:
- `scripts/reset-db.mjs` has DROP SCHEMA but refuses non-localhost hosts.
- `using (true)` policy is on the public `plans` pricing table (intended).
- `club_roster` view uses `security_invoker = true`.
- Service-role client is in `lib/admin.ts` with `import "server-only"` (not shipped to browser).
- Agent role `agent_ro` = SELECT on plans + member (id, display_name) columns only; no email.
- Backups: PITR + nightly custom dump to S3, KMS, separate account, job verifies data, monthly drills.
- Chat: auth (anonymous rejected), per-user daily limit, fixed cheap model, capped tokens/input.
Legit minor findings (true extras, not alarms): `lib/admin.ts` is unused/its key not in .env shown; `reset-db` throws on empty URL (crash, not risk); rate limit relies on Upstash availability; restore depends on the AWS account access; prompt injection is possible but low-impact.
