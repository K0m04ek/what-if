# N Cap At Ten

**Scenario.** User asks for far more branches than the lens table allows: `/what-if 25`. Tests that the skill caps at 10 and explains why, rather than either producing 25 or silently truncating without comment.

## Setup

mkdir wf-fixture-cap && cd wf-fixture-cap && git init. Build a small multi-surface app so there's enough real material across lenses to make the cap (not the cull) the visible constraint. Minimal files:
- `routes/login.ts` — no rate limit on failed attempts (Omissions/Access).
- `routes/checkout.ts` — Stripe webhook handler with no signature verification (Money).
- `routes/upload.ts` — saves files to disk keyed only by original filename, no owner check on download (Access).
- `jobs/backup.ts` — cron job with an empty `catch {}` around the S3 upload call (Error paths).
- `package.json` — pins a dependency at `"0.9.3"` (pre-1.0, External).
- `db/inventory.ts` — `UPDATE inventory SET qty = qty - 1` with no transaction/lock (Concurrency).
- `README.md` — claims 'supports CSV export' but no export code exists anywhere (Drift).
- `routes/signup.ts` — submit button with no debounce/disabled state (Human behavior).
- `db/events.ts` — `SELECT * FROM events` with no LIMIT (Volume).
- A `// TODO: hack for launch, fix properly later` comment left in `routes/checkout.ts` (Time).

Invoke `/what-if 25`.

## Must do

- Caps the generated branch count at 10, matching the number of rows in the lens table.
- States explicitly why it capped at 10 instead of 25, referencing the lens-table limit (e.g. 'the lens table caps distinct lenses at 10, so I generated 10, not 25').
- Each of the branches attempted uses a distinct lens from the table — no lens reused to pad toward 10.
- If the cull step then drops some of the 10 candidates, the output also states that plainly (per the separate 'fewer than N survive' rule) rather than hiding the reduction.
- Surviving branches still carry Anchor, Lens / Deviation, How, Cost, Early signal (naming a watcher or explicitly 'nobody'), Window, and Action, and the run still closes with the three buckets and the 'Not shown:' line.

## Must not do

- Must not produce anywhere close to 25 branches.
- Must not silently truncate to 10 without any acknowledgment of the cap — a truncation with zero explanation is a failure even if the count is right.
- Must not refuse the request outright ('25 is too many, please ask for 10 or fewer') without still delivering the capped run.
- Must not reuse the same lens twice to reach 10 when a 10th distinct lens genuinely has no anchor — in that case it should say fewer than 10 survived, not double up a lens.

## Rule under test

"Default N is 3, and N is capped by the lens table below: at most 10. N is the number of distinct lenses, not the number of paragraphs. If the user asks for more than 10, give 10 and say why."
