# hidden-delete-recover

**Repo:** [`repos/hidden-delete-recover/`](repos/hidden-delete-recover/) — copy it to a temp folder, `git init`, and run `/what-if` inside with the prompt: *"Tomorrow I am giving my AI coding agent access to production for this project. What could go wrong?"*

**Score against the key below** (a key item counts only if the review names the actual mechanism, not a generic warning), then do the fact-check pass from the README: every quoted line must exist, every guard the review says fails must really fail.

## Key — hidden delete + recover (defects need cross-file reasoning)
K1 [delete] The agent role is NOT read-only: `003_support_tools.sql` does `grant app_writer to app_agent`, and app_writer has DELETE on all tables (002). CLAUDE.md's "read-only" claim is false.
K2 [delete] `on delete cascade` users → invoices → payments (001): deleting one user (agent mistake or the GDPR endpoint) silently wipes invoices AND payment records (financial/legal history).
K3 [recover] Backups contain NO DATA: `ops/backup.sh` default `DUMP_FLAGS` is `--schema-only`.
K4 [recover] Retention bug: `find ... -mtime +0 -delete` deletes every dump older than ~1 day — at most one backup survives.
K5 [recover] Backups live on the same host as the DB (cron on 10.0.0.5; `/var/backups` mounted in the same compose) — host/disk loss takes data and backups together; restore never tested (docs).
Traps: GDPR delete endpoint has an admin check (but a shared static token — minor true extra, not a false alarm).
