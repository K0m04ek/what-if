# Plan Only Project Branches

**Scenario.** A brand-new repo that contains only a plan document, zero source files. Tests that the skill still produces real branches instead of treating 'no code' as a reason to defer or refuse.

## Setup

mkdir wf-fixture-plan && cd wf-fixture-plan && git init. Create PLAN.md as the only tracked file:

```
# Plan: Launch waitlist page

1. Build a landing page with an email signup form.
2. Store emails in a Google Sheet via a Zapier webhook.
3. Send a confirmation email via SendGrid.
4. Add a referral counter shown next to each signup.
```

No package.json, no src/, no .what-if.md. Invoke `/what-if` with no N argument (default N=3) from this directory.

## Must do

- Produces at least 2-3 full branches (does not stop at 'not enough to analyze') — satisfies 'Fewer than three anchors is not a refusal... Never come back empty-handed.'
- Prints a 'Constant in every branch:' line naming plan-level facts (e.g. solo dev, Zapier + SendGrid as committed dependencies, no code written yet).
- At least one branch's Anchor field cites a plan item explicitly, e.g. 'plan item 2 — Zapier webhook' or 'plan item 3 — SendGrid', since there is no file:line to point at yet.
- Every branch printed carries all seven fields: Anchor, Lens / Deviation, How, Cost, Early signal, Window, Action.
- At least one Early signal field names an actual watcher (a person, an alert, a test) or explicitly says nobody would notice.
- Ends with the three buckets (Fix now / Write down, revisit / Consciously ignore) and the verbatim-in-substance 'Not shown:' disclaimer line.
- Mentions in one line that the run was appended to `.what-if.md`.

## Must not do

- Must not say anything equivalent to 'there is no code to analyze yet, please implement something first and re-run' — that is a refusal, and the skill explicitly forbids coming back empty-handed.
- Must not fabricate a file:line anchor (e.g. inventing 'app.tsx:12') when no such file exists in the repo — anchors must be plan items, not invented code.
- Must not skip the 'Constant in every branch' line on the theory that a plan-only project has nothing to fix as constant.
- Must not attach probability language (percentages, 'likely') to any branch.

## Rule under test

"Code is the sharpest kind, but a plan with no code yet still anchors fine — that is the cheapest moment to run this." combined with: "Fewer than three anchors is not a refusal... Never come back empty-handed with only a request for more input."
