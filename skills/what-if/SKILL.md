---
name: what-if
description: Use before giving an AI agent (or yourself) production access, before a deploy, or when adding a database, a paid API, payments or user data - "is it safe to give the agent prod", "what could go wrong", "is it safe to launch", "run a premortem", "review this before I ship". Answers what could get DELETED, EXPOSED or SPENT - and what you could RECOVER - each finding traced to code it re-read, each ending in one step a beginner can take. Not for narrow single-line questions like "what if I use useMemo here".
allowed-tools: Read, Grep, Glob, Write, Bash(git log:*), Bash(git diff:*), Bash(git status:*), Bash(git remote:*), Bash(ls:*), Bash(ps:*)
---

# WHAT-IF

Before an agent (or you) gets production access, answer four questions about **this** project:

1. **Delete** — what data could be destroyed, and by whom?
2. **Expose** — who could read or change data that is not theirs?
3. **Spend** — what could run up a bill, or move money wrongly?
4. **Recover** — when one of those happens, what can actually be restored, and how fast?

The fourth is the one people skip and the one that decides whether a mistake is an evening or the
end of the project. **Always answer it, even when the first three come back clean.**

**This skill reads and reports. It never edits the project's code.** The one file you may write
is `.what-if.md`, this skill's own log at the repo root.

## The rule that decides whether this is useful

**Report only what you traced end to end in this run.** A finding is a mechanism you followed
through the lines you read — not a pattern that resembles a known bug. There is no target count:
three confirmed findings beat eight plausible ones, and "nothing serious here" is a legitimate
result. Padding is the failure mode of this skill: a list with one invented item teaches the
reader to distrust the true ones.

## Procedure

### 1. Read before you imagine

State the scope in one sentence — "the repo as it would be when the agent gets prod access". Then
read, in this order:

- agent instructions (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`) and every credential the agent is
  handed (`.env*`, config) — **what the agent is told it can do vs. what its credentials allow**;
- database: migrations, roles and grants, policies (RLS), views, functions, triggers, cascades;
- every place money or a paid API is called: routes, webhooks, cron jobs, queues, retries;
- backups and recovery: backup scripts and workflows, where dumps land, retention, restore notes,
  `git remote -v`;
- `git log --oneline -15` and the diff — recent change is where faults cluster.

Budget: about 12 files. Stop when the four questions have evidence; more input does not buy more
foresight.

**If `.what-if.md` exists, read it first.** Skip what the user already chose to ignore — but
re-check the condition the dismissal rested on, and raise it again (saying what changed) if that
condition has moved.

### 2. Generate candidates systematically

For each thing you read (a grant, a policy, a route, a script), apply the deviation operators
instead of free-associating:

**NONE** (missing, empty) · **MORE** (too many, too fast, repeated) · **AS WELL AS** (duplicate,
extra, unintended) · **PART OF** (half done) · **REVERSE** (undo, out of order) · **OTHER THAN**
(wrong user, wrong id, wrong environment) · **EARLY / LATE** (race, retry, after teardown)

Walk error paths and retries first; hunt **absence** as hard as presence (no backup off the
machine, no auth check, no limit, no remote). Most cells are empty — that is expected.

### 3. Trace every candidate through its guard — or drop it

This step is where wrong findings come from, so it is not optional.

- **Read the guard before claiming it fails.** If the code has a check in the way — an env or
  host check, `set -e`, `server-only`, RLS on a table used inside a policy's subquery,
  `security_invoker`, a dedupe table, a role that lacks a grant — you must either show the line
  where the guard does **not** cover your case, or drop the candidate. "Someone could change the
  config / disable the check" is not a finding unless the repo does it.
- **Credentials: follow the grant chain.** What a role can do = its own grants + every role
  granted to it, in every migration, in order. Docs and comments that say "read-only" are claims
  to check, not evidence.
- **A presence claim needs a verbatim excerpt** (1–3 lines copied from the file just read). A line
  number is optional; never invent one.
- **An absence claim needs the search you ran** and its literal result.
- **Never compare two files you have not both read in this run.**

Then label each survivor:

- **Confirmed** — every step of the mechanism is in lines you quoted.
- **Check** — the mechanism holds only if one fact you cannot see is true (dashboard setting,
  bucket policy, real env value). Name that fact. A **Check** is never placed in *Fix now*.

### 4. Order by what cannot be undone

Lost data → leaked data → money moved or spent → time burned. Worst first. **No probabilities** —
neither percentages nor "likely". If a **Confirmed** finding destroys or leaks data and there is no
working recovery for it, it goes first regardless of anything else.

### 5. Write each finding

Past-tense headline — it already happened — naming the failure, not a date.

```
### The nightly cleanup deleted every unpaid order — including the ones being paid right now

**Status**        Confirmed
**Axis**          Delete
**Evidence**      jobs/cleanup.ts — `await db.query("delete from orders where status <> 'paid'")`
                  vercel.json — `{ "path": "/api/jobs/cleanup", "schedule": "0 * * * *" }`
**How**           Checkout writes the order as `pending` before the card is charged; the hourly job
                  deleted it in between, and the webhook then found no order to mark paid.
**In plain words** A cleaning robot throws away carts while customers are still at the till.
**Check it yourself** Open vercel.json: if the cleanup runs more often than once a day, this is live.
**Fix**           Delete only orders older than a day; never delete rows a webhook may still update.
```

- **In plain words** — one sentence a person who never opened a terminal understands.
- **Check it yourself** — one step that confirms the risk without reading code: open a file and
  look at one value, run one `curl`, look at one dashboard page. If no such step exists, say so.

### 6. Recovery — always a separate section

After the findings, answer the fourth question for the data that matters:

```
## If it happens: what you can get back
Database    — <what backups exist, where they land, how old, whether they contain data, retention>
Code        — <git remote? last push? or "only on this machine">
Money/keys  — <can a key be revoked/rotated fast? is there a spend cap or alert?>
Weakest link — <the one gap that turns a mistake into a permanent loss>
Check it yourself — <one step: e.g. "open the backups folder: is there more than one file, on another machine?">
```

Trace recovery the same way as findings: a backup that is `--schema-only`, deleted by its own
retention, or stored on the same disk as the database is **not** a backup — say so with the excerpt.
A recovery path that is configured and documented as tested counts as working; say so plainly.

### 7. Close the output

- **Fix now** — at most 2, only **Confirmed**.
- **Check next** — the **Check** items, each with the one fact to look up.
- **Fine as is** — what you looked at and found guarded, each with the **condition** that keeps it
  fine ("fine while the agent only has `agent_ro`"). This is part of the answer, not filler: it
  tells the reader which alarms not to raise.

Then always:

> **Not shown:** one pass over the files listed above. A different review method finds a largely
> different set of problems — treat this as a sample, not an inventory.

**Hand over the next move:** for each *Fix now* item give a line the user can say back:

> Say `fix the reset script` and I'll make the change **and add a small test that fails if it comes back**.

**Finally, append the run to `.what-if.md`** (one dated section: the three buckets, one line each).
Mention it in one line; do not paste it.

## Anti-sycophancy

Restate the plan in one neutral sentence without the user's confidence language ("it's read-only",
"RLS is on everywhere", "spend is capped") and verify those claims rather than inheriting them —
they are exactly where the hidden findings live. Never soften a finding because the user sounds
attached to the plan.

## What good and bad findings look like

**Bad — pattern-matched, guard ignored:**
> `seed.js` truncates every table, so the agent could wipe prod.

…when the script exits unless `NODE_ENV === "development"`. Either quote the case the guard misses,
or put it under *Fine as is* with its condition.

**Bad — vivid but hollow.** Detail makes a scenario feel more likely while making it less likely:
> Someone exports NODE_ENV=development on the prod box, then runs the seed, and…

**Good — claim in the docs checked against the code:**
> ### The "test mode" Stripe key charged real cards
> **Status** Confirmed · **Axis** Spend
> **Evidence** README — "payments run in test mode" · .env.production — `STRIPE_SECRET_KEY=sk_live_…` · lib/stripe.ts — `new Stripe(process.env.STRIPE_SECRET_KEY!)`
> **In plain words** The note says it's play money; the key in use is the real one.
> **Check it yourself** Open .env.production: a key starting with `sk_live_` charges real cards.

## If the user asks how accurate this is

Say plainly: this is not prediction. It checks the specific ways this repo can lose, leak or spend,
and what can be recovered. It does not replace a secret scanner or a penetration test.
