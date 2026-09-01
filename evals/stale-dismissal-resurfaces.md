# Stale Dismissal Resurfaces

**Scenario.** A second run on a repo that already has a `.what-if.md` log with a consciously-ignored branch whose justifying condition has since been violated by more than three orders of magnitude. Tests that the skill re-checks dismissed conditions instead of just skipping everything in the log.

## Setup

mkdir wf-fixture-stale && cd wf-fixture-stale && git init. Create `orders.ts` with, at line 22, exactly:
```
const rows = await db.query("SELECT * FROM orders");
```
(pad the file with unrelated lines above/below so the query really lands on line 22). Create `.what-if.md` at repo root:
```
# What-if log

## 2026-06-01

**Fix now:**
- (none)

**Write down, revisit:**
- (none)

**Consciously ignore:**
- No pagination on orders.ts:22 (`SELECT * FROM orders`) — fine while the orders table stays under a few hundred rows (~30 rows as of 2026-06-01).
```
Also create `db/row-count.txt` (simulating a real, checkable fact about current data volume):
```
orders: 30412 rows (last counted 2026-08-30)
```
Do not change orders.ts itself. Invoke `/what-if` on 2026-09-01.

## Must do

- Reads `.what-if.md` first and visibly references the prior 2026-06-01 dismissal of the orders.ts pagination issue.
- Re-checks the specific fact the dismissal rested on (row count) against `db/row-count.txt` and finds ~30,412 rows versus the 'a few hundred' condition that justified ignoring it.
- Resurfaces the branch as a full entry this run (does not silently re-skip it), with Anchor re-verified against the current `orders.ts:22` line (rule 0: re-read, not trusted from the old log), Lens / Deviation (Volume / MORE), How, Cost, Early signal, Window, and Action.
- Explicitly names what changed — states both the old condition (~30 rows) and the new fact (~30,412 rows) in the same branch or its surrounding text.
- Places the resurfaced branch in Fix now or Write down, revisit — not back into Consciously ignore under the same unchanged condition.

## Must not do

- Must not re-list the item unchanged inside 'Consciously ignore' with the same June condition, as if nothing needed re-checking.
- Must not drop the branch from this run's output entirely on the assumption that a past dismissal is permanent.
- Must not print the anchor by copying the old log's line number without re-reading orders.ts in this run — if the line had moved, a copied anchor would now be wrong.
- Must not resurface unrelated items from the log whose underlying condition has not moved (none exist in this fixture, but nothing should be invented to accompany the real one).

## Rule under test

"If `.what-if.md` exists in the repo root, read it first... But re-check what those decisions rested on. A dismissal is only as good as the condition under it: 'the table is small, pagination can wait' is correct at 30 rows and wrong at 30,000. For each ignored branch, look at the one fact that justified ignoring it, and if that fact has moved, raise the branch again and say what changed."
