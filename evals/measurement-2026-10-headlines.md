# Measurement: finding headlines that name a capability, not an incident (0.2.1 → 0.2.2)

**Change.** One edit to `skills/what-if/SKILL.md`, step 5. Before: "Past-tense headline — it already happened."
After: the headline names the failure as something the repo *allows* ("can delete", "can charge"), never as an
incident; a thing is described as having happened only if a quoted line shows it did; **Confirmed** certifies
the mechanism, not that it has already run. The three example headings were reworded to match. Nothing else changed.

**Why.** In a blind comparison, most unsupported claims against 0.2.1 were not invented code but a confirmed
*capability* presented as a completed event ("wiped every table", "the database was deleted").

## Setup
- 7 new fixtures written independently of the skill by a second model: 5 hard (a grant chain across migrations, a webhook
  retry path, a backup that only looks working, docs that disagree with code, a "protected" preview deploy that shares the
  production database) and 2 clean ones where the honest answer is "almost nothing serious". Each hard fixture has a hidden
  answer key (real problems with quoted proof, plus decoys that look dangerous but are guarded). 27 planted problems, 24 decoys.
- Solver: Claude (Sonnet), each fixture twice per arm, fresh copy, read-only tools. 14 runs for the new text, compared against
  the 0.2.1 text re-judged in the same session as an anchor.
- Grader: a different model family (Codex), blind (labels shuffled per fixture), scoring each review against the key:
  found / partial / missed per planted problem, unsupported claims typed as *decoy reported as failure*, *false claim* or
  *overclaim* (labelled Confirmed or "already happened" although the mechanism needs a fact not in the repo), real extra
  problems, recovery 0–2, "check it yourself" 0–2, clarity 1–5.
- Part of the set was held out (two hard fixtures and one clean one): the edit was not tuned on them.

## Result (14 runs per arm)

| | 0.2.1 (anchor) | 0.2.2 |
|---|---|---|
| unsupported claims, total | 33 | 22 |
| of which overclaim ("Confirmed" without support) | 28 | 15 |
| of which false claim | 5 | 7 (noise) |
| completeness vs key, training / held-out | 95 % / 91 % | 92 % / 91 % |
| real findings per run, training / held-out | 5.4 / 5.0 | 5.6 / 5.0 |
| clean repos flagged alarmist (of 4 runs) | 3 | 2 |
| clarity (1–5) / recovery (0–2) / check-it (0–2) | 3.9 / 1.3 / 1.7 | 4.1 / 1.4 / 1.8 |

## How to read it
- Incident-style headlines disappeared. Every remaining overclaim is an absolute statement about recovery
  ("the only copy", "cannot be recovered") that the repo alone cannot prove.
- **Completeness did not change**: the differences (1–2 items out of 54) are within noise at two runs per cell.
  This release is about honesty of the report, not about finding more.
- Earlier in the same exercise, plain prompt and a generic security review scored 90 % and 87 % on the same key
  (0.2.1: 94 %). On this kind of fixture all three approaches find most planted problems; the gap that remains is
  how the finding is presented and how much it claims.

## Limits
Two runs per cell; one grader; the hidden keys were written by a model and can contain mistakes (the grader flagged
a couple); the generic security review ran with the author's global settings visible; the skill text was supplied in the
prompt rather than installed. Fixtures and keys are not published, so the held-out part stays held out.

## Not done / next
Absolute recovery claims remain the main source of unsupported findings. A candidate edit ("copies, version history and
permissions you cannot see are *unknown*, not absent") was tried together with other changes and not isolated; it is
the logical next measurement.
