# Eval fixtures

Six scenarios that catch this skill degrading. No test framework: each is a small repo you
build by hand, an invocation to run, and a list of things that must and must not appear in
the output.

## How to run

No test framework needed — these are read-by-eye transcript checks. For each fixture: (1) build the tiny repo exactly as described in `setup` (each takes under five minutes — one or two files), (2) run the skill's invocation shown at the end of `setup` inside that repo, (3) save the model's full response to a text file, (4) walk the `must_do` list top to bottom confirming each item is visibly true in the transcript, then walk `must_not_do` confirming none of those phrases/behaviors appear — treat any single must_not_do hit as an automatic fail regardless of how many must_do items passed. A few items are cheap to pre-screen with grep before the human pass (e.g. `grep -c '^### '` to count branches for fixtures 3 and 4, `grep -i 'charged twice'` for fixture 6, `grep -i 'Not shown:'` and `grep -i 'Constant in every branch:'` for presence across all six), but the substantive checks — mechanical reasoning, honest culling, correct re-verification of anchors, naming a real watcher — require a human reading the branch text, since they test judgment the skill is supposed to exercise, not string matching. Run all six against the current skill version to get a baseline, then re-run after any SKILL.md edit and diff which fixtures newly fail.

## The fixtures

- [`plan-only-project-branches.md`](plan-only-project-branches.md) — A brand-new repo that contains only a plan document, zero source files.
- [`tiny-healthy-script-clean-result.md`](tiny-healthy-script-clean-result.md) — A genuinely small, well-written local script with real error handling and no external surface area (no network, no DB, no concurrency, no money).
- [`honest-undercount-vs-requested.md`](honest-undercount-vs-requested.md) — User explicitly asks for 5 branches via `/what-if 5`, but the repo only supports 2 genuinely anchored, mechanical, proportionate branches.
- [`n-cap-at-ten.md`](n-cap-at-ten.md) — User asks for far more branches than the lens table allows: `/what-if 25`.
- [`stale-dismissal-resurfaces.md`](stale-dismissal-resurfaces.md) — A second run on a repo that already has a `.
- [`anchor-honesty-no-fabrication.md`](anchor-honesty-no-fabrication.md) — A checkout button that already has the double-submit guard the SKILL's own worked example uses as its canonical 'bad' case.

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

That pass is what caught the two fabrications recorded in the log for `n-cap-at-ten`: an
invented second grep hit, and a cross-file comparison to a file that contained nothing of the
kind. Both were bolted onto branches whose substance was otherwise correct, which is exactly
why they are easy to miss.
