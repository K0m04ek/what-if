# Backups
- Supabase PITR on prod (7 days).
- Nightly custom-format dump to S3 (KMS-encrypted, 30-day lifecycle, separate AWS account). The job fails if the dump has no `members` data.
- Restore drill monthly; last: 2026-10-05, 9 minutes to a scratch project.
