---
name: what-if
description: Use when the user asks for a risk scan of a whole plan, changeset, or feature before committing to it - "what am I missing", "what could go wrong with this plan", "run a premortem", "review this before I ship", "is this plan sound". Unrolls N branches of the project's near future, each anchored to verified code or a real plan item, each ending in one concrete action. Not for narrow single-line questions like "what if I use useMemo here".
allowed-tools: Read, Grep, Glob, Write, Bash(git log:*), Bash(git diff:*), Bash(git status:*), Bash(ls:*), Bash(ps:*)
---

# WHAT-IF

Unroll the near future of this project into N branches, so the developer sees the failures
before the users do.

You are doing for them what an experienced engineer does automatically: mentally simulating
the plan against future conditions.

**This skill reads and reports. It never edits the project's code.** Every branch ends in an
action the user can choose to take — never in an edit you make on your own initiative. The one
file you may write is `.what-if.md`, this skill's own log at the repo root. Nothing else.

**Default N is 3**, and N is capped by the lens table below: **at most 10**. N is the number of
*distinct lenses*, not the number of paragraphs. If the user asks for more than 10, give 10 and
say why.

## The one rule that decides whether this is useful

Every branch must be anchored to something you verified **in this run**: a file and line you
re-read, a dependency and its version, a numbered plan item, a commit. **A branch you cannot
anchor gets deleted, not reworded.** Generic futures ("the database might not scale") fit any
project, so they inform about none.

## Procedure

### 1. Collect anchors

Read before you imagine. State the scope in one sentence first — "the checkout flow", "plan
items 1-6", "this week's diff" — and stay inside it.

**An anchor is anything you can point at and re-check later:** `file.ts:88`, a dependency and
its version, a numbered plan item, a commit sha, or a running process. Code is the sharpest
kind, but a plan with no code yet still anchors fine — that is the cheapest moment to run this.

**Budget: about 8 files or 1500 lines.** Prefer the diff and the files named in the
conversation. Stop once you have 5-6 anchors; more input does not buy more foresight.

**Check whether the thing is already running** (`ps`, a dev server, a cron job, a deploy). A
scanner that is live right now and a repo sitting idle need different advice, and a fix that
requires a restart may be impossible after a certain moment. Say which case you are in.

**If `.what-if.md` exists in the repo root, read it first.** Skip branches the user already
chose to ignore — repeating last week's dismissed findings is how this skill gets uninstalled.

But **re-check what those decisions rested on.** A dismissal is only as good as the condition
under it: "the table is small, pagination can wait" is correct at 30 rows and wrong at 30,000.
For each ignored branch, look at the one fact that justified ignoring it, and if that fact has
moved, raise the branch again and say what changed. Nothing you prune disappears; it only stops
being your problem while its condition holds.

Depending on what exists:

- the plan, spec, or TODO under discussion
- `git log --oneline -15` and the diff — what changed recently is where faults cluster
- the files named in the conversation, and what they import
- dependency manifest: versions, anything pre-1.0, anything unmaintained
- error paths: the `catch` blocks, external calls, and parses inside your scope
- what the user said they intend to add next

Write down concrete facts with addresses: *"no pagination in `feed.tsx:40`"*, *"`catch {}`
empty at `sync.ts:88`"*, *"plan item 4 adds payments"*.

**Fewer than three anchors is not a refusal.** Generate branches for the anchors you do have,
then state plainly what you read and name the two or three files (or the plan) that would
sharpen the next run. Never come back empty-handed with only a request for more input.

### 2. Fix what stays constant

Name the predetermined elements — facts true in *every* branch: the chosen stack, current
architecture, committed dependencies, the deadline, existing tech debt.

**Print them as one line above the branches:**

> **Constant in every branch:** Next.js 15, Supabase free tier, solo developer, ship by the 14th.

Then use that line in step 4: a branch that only varies something on it is scenery, not a
branch, and gets deleted. Branches must differ in what is genuinely uncertain.

### 3. Generate one branch per lens

Assign each branch a **different lens** before generating it. Never produce N branches from
one pass — they collapse into paraphrases of the same modal future.

| Lens | Hunt for |
|---|---|
| **Error paths** | what the code does when a call fails, times out, or returns a shape it did not expect |
| **Omissions** | what is absent: no rollback, no migration, no auth check, no backup, no rate limit |
| **Volume** | 100x the rows, files, users, or events |
| **Human behavior** | double-click, back button, closed tab, pasted emoji, wrong file, refresh mid-write |
| **External** | dependency breaks, changes its API, gets abandoned, rate-limits, raises prices |
| **Money** | quota exhausted, bill spikes, free tier ends, tokens burn faster than expected |
| **Time** | you return in 3 months; someone else reads this; today's shortcut taxes every later feature |
| **Concurrency** | two users, two tabs, two workers doing it at the same moment |
| **Access** | someone sees data that is not theirs |
| **Drift** | where the README, the comments or the config promise something the code no longer does |

Within a lens, apply deviation operators to each anchor rather than free-associating:

**NONE** (missing, empty, null) · **MORE** (too many, too big, too fast) · **LESS** (partial,
truncated) · **AS WELL AS** (duplicate, extra, unintended) · **PART OF** (half committed) ·
**REVERSE** (undo, rollback, out of order) · **OTHER THAN** (wrong type, wrong id, wrong user)
· **EARLY / LATE** (race, timeout, arrives after teardown)

Work this as a matrix — anchors down, operators across — and draft candidates before writing
anything final. Most cells are empty or absurd; that is expected. Keep the one strongest
surviving candidate per lens.

Two priorities, from failure data rather than intuition: **walk the error paths first** — the
overwhelming majority of catastrophic production failures come from mishandling errors the
software already signalled, and most are reachable in three or fewer events — and **hunt
absence as hard as presence**, because missing elements outnumber flawed present ones about
two to one in real architecture reviews.

### 4. Cull

A branch survives only if all four hold:

0. **Verified in this run** — before printing any `file:line`, re-read that line *now* and
   confirm it says what you claim. A remembered line number is not an anchor. For a presence
   claim the Anchor field carries a short verbatim excerpt; for an absence claim it carries
   the search you ran and its empty result.
1. **Anchored** — you can point at the file, dependency, plan item, or commit.
2. **Mechanical** — the causal chain is specific and at most 3-4 steps. "Might get slow" is
   not a mechanism. "Each row triggers a query, so 500 rows is 500 round trips" is.
3. **Proportionate** — plausible for *this* project at *this* stage. A 100k-user branch for a
   personal script is noise.

Delete what fails. **If fewer than N survive, say so plainly** — "2 real ones; the rest would
be padding." Never invent a branch to hit the number. A padded list teaches the user to
distrust the whole list.

### 5. Order honestly

**Order branches by irreversibility of the consequence:** lost data → money moved → time
burned → annoyance. Worst first.

**Attach no probability at all** — neither percentages nor words like *likely* or *long-shot*.
Estimated likelihoods do not track real incident rates, and composite risk scores
(severity × likelihood × detectability) are mathematically broken. If likelihood matters for a
branch, it belongs in the **Early signal** field as something observable, not as a guess.

You are biased toward predicting that an asked-about plan succeeds. Correct for it in the
**search**, not in the verdict: if every branch came out benign, you probably picked scenery
lenses — re-run step 3 once with two lenses you did not use. **If the second pass is also
benign, say so.** "I looked for X, Y and Z; they are guarded here" is a legitimate result, and
manufacturing doom for a 200-line weekend project is not.

### 6. Write each branch as an accomplished fact

Past tense. It already happened. This framing — not hedged "this could fail if" language —
is what makes the causes concrete and deflates overconfidence.

**Do not invent a date or a duration in the headline.** "Three weeks in" is an unearned claim
about both timing and likelihood, sitting in the position the reader trusts most. Name the
failure instead. Time belongs in a headline only when it comes from a real anchor — a trial
that ends on the 14th, a certificate expiring, a rate limit that resets hourly.

```
### The same order was charged twice

**Anchor** `checkout.ts:88` — `<button onClick={submit}>` with no disabled state
**Lens / Deviation** Human behavior / AS WELL AS
**How** Two requests left before the first response returned, so two rows were
       written and the card was charged twice.
**Cost** Customer's money, a manual refund, and a support conversation.
**Early signal** Orders table shows pairs with near-identical timestamps —
       but nothing watches that table today, so nobody would see it.
**Window** Cheap while the button is one component. After the first real
       charge it also costs a refund and a support conversation.
**Action** Disable the button until the response lands, and send an
       idempotency key with the request.
```

Three of these fields carry weight the others do not:

**Lens / Deviation** is the only way the reader can check that the branch came from systematic
enumeration rather than from a plausible story.

**Early signal must name a watcher, not just an observable.** "Errors appear in the log" is
worthless if nobody reads that log. Say who or what would actually notice — a person watching,
an alert, a failing test — and **if the answer is nobody, say that**, because an unwatched
signal is itself a finding worth more than the branch it belongs to.

**Window** is when the fix is still cheap, and it is often the most actionable line in the
whole report. Some fixes stay cheap indefinitely; others have a hard edge — a launch, a
migration, a deploy, a process already running that a restart would disturb. Name the edge if
one exists, and say plainly when a window is closing today.

### 7. Close the output

End every run with three buckets and one honest line:

- **Fix now** — at most 1-2. More than that and nothing gets fixed.
- **Write down, revisit** — real, not urgent.
- **Consciously ignore** — each with the **condition** that makes it fine, not just a reason:
  "fine *while* this table stays under a few hundred rows", "fine *while* you are the only
  user". A condition can be re-checked on the next run; an opinion cannot. This bucket is not
  filler — it teaches that not every risk deserves work, and it keeps the output from reading
  as doom.

Then, always:

> **Not shown:** this was one pass with N lenses. When two different review methods are run
> over the same system, only about a third of their findings overlap — a different set of
> lenses finds a largely different set of problems. Treat this as a sample, not an inventory.

That line is required. When a list of failure causes is displayed, people treat it as the
complete set and stop looking — and expertise does not protect against this. Saying it out
loud is the only correction.

**Then hand over the next move.** A report that ends at reading is a report nobody acts on, so
give each *fix now* item a line the user can say back verbatim:

> Say `fix the double-submit in checkout.ts:88` and I'll do it.

**Finally, append the run to `.what-if.md`** in the repo root (one dated section: the three
buckets, one line each). That file is what stops the next run from repeating what this user
already decided to ignore. Mention it once, in a single line, and do not paste its contents.

## Anti-sycophancy

The user's hopes contaminate the estimate. A stated belief pulls the model's judgment toward
it, and a wrong user suggestion measurably degrades accuracy.

- Before writing any branch, restate the plan in one neutral sentence stripped of the user's
  confidence language, and generate against that restatement.
- Never soften a branch because the user sounds attached to the plan. Softening it is the one
  thing that makes the whole exercise worthless.

## Horizon

Take the horizon from the task itself — the next sprint, the next release, or the next hour if
that is when the thing runs. Forecast skill decays hard with distance, error roughly doubles
across a forecast horizon, and long-range predictions are the least trustworthy output a
language model produces. Anything beyond the task's own horizon is labelled possibility, not
prediction.

Also: more context does not buy more foresight. Gains from additional input are logarithmic —
read what is relevant to the anchors and stop.

## What good and bad branches look like

**Bad — unanchored, could be any project:**
> What if the database can't handle the load? You should consider caching and indexes.

**Bad — vivid but hollow.** Detail makes a scenario *feel* more likely while making it
logically *less* likely, so a branch that reads like a short story is a warning sign:
> It's Black Friday. Traffic is 50x. The CDN buckles, the queue backs up, Redis evicts
> hot keys, and the on-call engineer is asleep...

**Bad — padding to hit N:**
> Branch 5: What if requirements change? Requirements often change.

**Good — anchored, mechanical, ends in an action:**
> ### Every dashboard load took 9 seconds
> **Anchor** `dashboard/page.tsx:40` — `orders.map(o => await getUser(o.userId))`
> **Lens / Deviation** Volume / MORE
> **How** One query per row. At 300 orders that is 300 sequential round trips.
> **Cost** The page feels broken; you rewrite the data layer under time pressure.
> **Early signal** It already takes ~1s with your 30 test rows — visible to you, unmonitored in prod.
> **Window** Cheap until other pages copy this query shape.
> **Action** Fetch users once with `IN (...)`, or join in the query.

**Good — an omission, which is the most common real risk:**
> ### A bad migration erased the products table and there was no way back
> **Anchor** `grep -r "rollback\|backup" supabase/migrations/` returns nothing; `0003` drops a column
> **Lens / Deviation** Omissions / NONE
> **How** The migration ran against production, the column was gone, and nothing captured
>       the prior state.
> **Cost** Data loss measured in whatever was not in a backup.
> **Early signal** None, and nothing watches for it — which is why it is worth fixing today.
> **Window** Closes the moment you run this migration against production.
> **Action** Take a snapshot before migrating; add the reverse statement to each migration.

Note what the second Anchor carries: an absence claim cites **the search that came back empty**,
not a bare directory name. "There is no X here" is only checkable if you show how you looked.

## What this skill promises

Wider coverage of concrete failure causes, and a nudge toward designs that keep options open.
Not prediction. Scenario methods reliably change what people *decide* — measurably shifting
choices toward flexible, reversible designs — while not improving forecast accuracy at all.
Say that plainly if the user asks how accurate this is.
