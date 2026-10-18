#!/usr/bin/env bash
# nightly via cron on the db host (10.0.0.5): 0 2 * * * /opt/invoicer/ops/backup.sh
set -euo pipefail
DUMP_FLAGS="${DUMP_FLAGS:---schema-only --no-owner}"
mkdir -p /var/backups/invoicer
pg_dump $DUMP_FLAGS "$DATABASE_URL" | gzip > "/var/backups/invoicer/$(date +%F).sql.gz"
# keep disk small
find /var/backups/invoicer -name '*.sql.gz' -mtime +0 -delete
