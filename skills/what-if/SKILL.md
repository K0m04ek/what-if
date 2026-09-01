---
name: what-if
description: Use when the user wants to know what could go wrong with a plan or with code they just wrote - "what if", "what am I missing", "will this break", "is this ready", "what could go wrong", before shipping, before a big refactor, or when a plan is about to be executed. Unrolls N branches of the project's near future, each anchored to real code or a real plan item, each ending in one concrete fix.
---

# WHAT-IF

Unroll the near future of this project into N branches, so the developer sees the failures
before the users do.

You are doing for them what an experienced engineer does automatically: mentally simulating
the plan against future conditions. That habit - not years of tenure - is what separates
expert anticipation from novice anticipation.

**Default N is 3.** The user may ask for more (`/what-if 5`). N is the number of *distinct
lenses*, not the number of paragraphs.

## The one rule that decides whether this is useful

Every branch must be anchored to something real in this project: a file and line, a named
dependency, a specific plan item, a commit. **A branch you cannot anchor gets deleted, not
reworded.** Generic futures ("the database might not scale") are what makes this kind of tool
worthless - they fit any project, so they inform about none.

## Procedure

### 1. Collect anchors

Read before you imagine. Depending on what exists:

- the plan, spec, or TODO under discussion
- `git log --oneline -15` and `git diff` - what changed recently is where faults cluster
- the files named in the conversation, and what they import
- dependency manifest: versions, anything pre-1.0, anything unmaintained
- error paths: every `catch`, every external call, every parse of untrusted input
- what the user said they intend to add next

Write down concrete facts with addresses: *"no pagination in `feed.tsx:40`"*, *"`catch {}`
empty at `sync.ts:88`"*, *"plan item 4 adds payments"*, *"auth.ts changed in 6 of the last
10 commits"*.

**If you cannot find at least 3 anchors, stop.** Say what you looked at, and ask for the plan
or the relevant files. Do not proceed on imagination - that is the failure mode this skill
exists to prevent.

### 2. Fix what stays constant

Name the predetermined elements - facts true in *every* branch: the chosen stack, current
architecture, committed dependencies, the deadline, existing tech debt. Branches must differ
in what is genuinely uncertain, not in scenery.

### 3. Generate one branch per lens

Assign each branch a **different lens** before generating it. Never produce N branches from
one pass - they collapse into paraphrases of the same modal future. Pick the N lenses that
best fit the anchors:

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

Within a lens, apply deviation operators to each anchor rather than free-associating:

**NONE** (missing, empty, null) · **MORE** (too many, too big, too fast) · **LESS** (partial,
truncated) · **AS WELL AS** (duplicate, extra, unintended) · **PART OF** (half committed) ·
**REVERSE** (undo, rollback, out of order) · **OTHER THAN** (wrong type, wrong id, wrong user)
· **EARLY / LATE** (race, timeout, arrives after teardown)

Two priorities, from failure data rather than intuition: **walk the error paths first** - the
overwhelming majority of catastrophic production failures come from mishandling errors the
software already signalled, and most are reachable in three or fewer events - and **hunt
absence as hard as presence**, because missing elements outnumber flawed present ones about
two to one in real architecture reviews.

### 4. Cull

A branch survives only if all three hold:

1. **Anchored** - you can point at the file, line, dependency, or plan item.
2. **Mechanical** - the causal chain is specific and at most 3-4 steps. "Might get slow" is
   not a mechanism. "Each row triggers a query, so 500 rows is 500 round trips" is.
3. **Proportionate** - plausible for *this* project at *this* stage. A 100k-user branch for a
   personal script is noise.

Delete what fails. **If fewer than N survive, say so plainly** - "3 real ones; the rest would
be padding." Never invent branch N to hit the number. A padded list teaches the user to
distrust the whole list.

### 5. Weight honestly

Do not print percentages. Estimated likelihoods do not track real incident rates, and
composite risk scores (severity x likelihood x detectability) are mathematically broken.
Rank by **severity of consequence** instead, and use coarse words: *likely / plausible /
long-shot*.

Skew the set toward what actually happens to software projects: plans hold maybe one time in
five to ten, moderate overrun is the median outcome, and roughly one project in six goes badly
wrong. So if the user's plan looks fine in every branch you generated, you have not done the
job - regenerate. Note that the model you are running on has a measured bias toward predicting
that asked-about things will succeed; correct for it deliberately.

### 6. Write each branch as an accomplished fact

Past tense. It already happened. This framing - not hedged "this could fail if" language -
is what makes the causes concrete and deflates overconfidence.

```
### Three weeks in: the same order was charged twice

**Anchor** `checkout.ts:88` - no guard against a second submit
**How** Two requests left before the first response returned, so two rows were
       written and the card was charged twice.
**Cost** Customer's money, a manual refund, and a support conversation.
**Early signal** Orders table shows pairs with near-identical timestamps.
**Fix now** Disable the button until the response lands, and send an
       idempotency key with the request.
```

### 7. Close the output

End every run with three buckets and one honest line:

- **Fix now** - at most 1-2. More than that and nothing gets fixed.
- **Write down, revisit** - real, not urgent.
- **Consciously ignore** - with one line of why it is fine. This bucket is not filler; it
  teaches that not every risk deserves work, and it keeps the output from reading as doom.

Then, always:

> **Not shown:** one pass over a codebase surfaces roughly a third of what is really there.
> Different lenses find largely different problems. This is a sample, not an inventory.

That line is required. When a list of failure causes is displayed, people treat it as the
complete set and stop looking - and expertise does not protect against this. Saying it out
loud is the only correction.

## Anti-sycophancy

The user's hopes contaminate the estimate. A stated belief pulls the model's judgment toward
it, and a wrong user suggestion measurably degrades accuracy.

- Form your branches from the code and the plan **before** engaging with "I think this will be
  quick" or "this should be simple."
- If you need to phrase an internal probe, use third person: *"a developer ships this
  auth flow - what breaks?"* rather than *"will my auth flow work?"*
- Never soften a branch because the user sounds attached to the plan. Softening it is the one
  thing that makes the whole exercise worthless.

## Horizon

Keep branches inside the next cycle or two - the next sprint, the next release. Forecast skill
decays hard with distance, error roughly doubles across a forecast horizon, and long-range
probabilities from language models are the least trustworthy thing they produce. Anything
further out is labelled as possibility, not prediction, and gets no confidence word at all.

Also: more context does not buy more foresight. Gains from additional input are logarithmic -
read what is relevant to the anchors and stop.

## What good and bad branches look like

**Bad - unanchored, could be any project:**
> What if the database can't handle the load? You should consider caching and indexes.

**Bad - vivid but hollow.** Detail makes a scenario *feel* more likely while making it
logically *less* likely, so a branch that reads like a short story is a warning sign:
> It's Black Friday. Traffic is 50x. The CDN buckles, the queue backs up, Redis evicts
> hot keys, and the on-call engineer is asleep...

**Bad - padding to hit N:**
> Branch 5: What if requirements change? Requirements often change.

**Good - anchored, mechanical, ends in an action:**
> ### Day 4: every dashboard load took 9 seconds
> **Anchor** `dashboard/page.tsx:40` calls `getUser()` inside the `.map()` over orders
> **How** One query per row. At 300 orders that is 300 sequential round trips.
> **Cost** The page feels broken; you rewrite the data layer under time pressure.
> **Early signal** It already takes ~1s with your 30 test rows.
> **Fix now** Fetch users once with `IN (...)`, or join in the query.

**Good - an omission, which is the most common real risk:**
> ### Week 2: a bad migration erased the products table and there was no way back
> **Anchor** `supabase/migrations/` has no rollback and no backup step; `0003` drops a column
> **How** The migration ran against production, the column was gone, and nothing captured
>       the prior state.
> **Cost** Data loss measured in whatever was not in a backup.
> **Early signal** None - this one gives no warning, which is why it is worth fixing today.
> **Fix now** Take a snapshot before migrating; add the reverse statement to each migration.

## What this skill promises

Wider coverage of concrete failure causes, and a nudge toward designs that keep options open.
Not prediction. Scenario methods reliably change what people *decide* - measurably shifting
choices toward flexible, reversible designs - while not improving forecast accuracy at all.
Say that plainly if the user asks how accurate this is.
