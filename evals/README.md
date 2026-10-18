# Eval fixtures

Seven fixtures that catch this skill degrading.

## How to run

No test framework. Two kinds of fixture:

- **Scenario fixtures** (`*.md` with a `setup` block): build the tiny repo exactly as described,
  run the invocation at the end of `setup`, save the full response, then walk `must_do` and
  `must_not_do`. Any single `must_not_do` hit fails the fixture.
- **Repo fixtures** (`repos/<name>/` plus `<name>.md` with a hidden-defect key): copy the folder to
  a temp directory, `git init`, run `/what-if` with the prompt given in the `.md`, and score each
  key item `found` only if the review names the actual mechanism. The `guarded-control` repo looks
  dangerous but is guarded throughout — every alarm raised there is a false finding.

Cheap pre-screens with grep before the human pass: `grep -i 'Not shown:'` and
`grep -i 'what you can get back'` (both required in every run), `grep -ciE 'likely|[0-9]+ ?%'`
(must be 0). The substantive checks — a mechanism traced through its guard, an honest *Check*
label instead of *Confirmed*, a recovery answer that matches the backup scripts — need a person
reading the output.

Run every fixture against the current `SKILL.md` for a baseline, then re-run after any edit and
diff which ones newly fail.

## The fixtures

- [`hidden-delete-recover.md`](hidden-delete-recover.md) — an agent role documented as read-only that a later migration made a writer, cascades that erase payment history, and a nightly backup that contains no data.
- [`hidden-spend.md`](hidden-spend.md) — "capped" AI spend that is not: anonymous sign-ins past a per-user limit, credits never enforced, retries that multiply billed calls, double credit on first purchase, a public cron.
- [`guarded-control.md`](guarded-control.md) — destructive scripts, broad-looking policies and powerful keys that are all guarded. Tests false alarms.
- [`plan-only-project-branches.md`](plan-only-project-branches.md) — only a plan document, zero source files: findings must anchor to plan items, not invented code.
- [`tiny-healthy-script-clean-result.md`](tiny-healthy-script-clean-result.md) — a small, well-handled local script: the skill must be allowed to say "nothing serious here".
- [`stale-dismissal-resurfaces.md`](stale-dismissal-resurfaces.md) — a second run where a past "fine as is" condition has changed: it must come back.
- [`anchor-honesty-no-fabrication.md`](anchor-honesty-no-fabrication.md) — a checkout button that already has the double-submit guard: the skill must not report it as missing.

The comparative numbers in the main README (v2 vs v1 vs a plain prompt vs `/security-review`) come
from a larger blind run with two judges and a separate holdout set that is deliberately **not**
published here — a holdout that ships with the skill stops being one.

## The check every fixture needs

Each fixture below scores one behaviour. But the first real run of these fixtures taught us
that passing all of them is not enough: a run can cap N correctly, refuse to pad correctly,
print every required field — and still slip a fabricated detail into an `Anchor` line.

So after grading any fixture, do one more pass that the fixture itself does not ask for:

**Take every factual claim in the output and check it against the repo.** Re-run each grep the
output quotes and compare the result character by character. Open every file the output names,
including files mentioned only in passing. Any claim that survives contact with the actual
files is real; any that does not is a defect in the skill, no matter how well the run scored
on its own criteria.

That pass is what caught the two fabrications recorded in an early run: an
invented second grep hit, and a cross-file comparison to a file that contained nothing of the
kind. Both were bolted onto branches whose substance was otherwise correct, which is exactly
why they are easy to miss.
