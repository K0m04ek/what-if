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

No package.json, no src/, no .what-if.md. Invoke `/what-if` from this directory.

## Must do

- Produces at least 2 full findings (does not stop at 'not enough to analyze') — satisfies 'Fewer than three anchors is not a refusal... Never come back empty-handed.'
- At least one finding's Evidence field cites a plan item explicitly, e.g. 'plan item 2 — Zapier webhook' or 'plan item 3 — SendGrid', since there is no file:line to point at yet.
- Every finding printed carries Status (Confirmed/Check), Axis (Delete/Expose/Spend), Evidence, How, In plain words, Check it yourself, Fix.
- Prints the 'If it happens: what you can get back' section, answering it from the plan (e.g. where the waitlist emails would live and whether anything backs them up), and says plainly what cannot be known before code exists.
- Ends with the three buckets (Fix now / Check next / Fine as is) and the verbatim-in-substance 'Not shown:' disclaimer line. Plan-level findings that depend on a setting nobody has chosen yet are labelled Check, not Confirmed.
- Mentions in one line that the run was appended to `.what-if.md`.

## Must not do

- Must not say anything equivalent to 'there is no code to analyze yet, please implement something first and re-run' — that is a refusal, and the skill explicitly forbids coming back empty-handed.
- Must not fabricate a file:line in Evidence (e.g. inventing 'app.tsx:12') when no such file exists in the repo — anchors must be plan items, not invented code.
- Must not attach probability language (percentages, 'likely') to any finding.

## Rule under test

"Code is the sharpest kind, but a plan with no code yet still anchors fine — that is the cheapest moment to run this." combined with: "Fewer than three anchors is not a refusal... Never come back empty-handed with only a request for more input."
