# WHAT-IF

**Before your AI agent gets production access: what could it delete, expose or spend — and what could you get back?**

A skill for Claude Code. It reads your actual repo — agent instructions, credentials, migrations
and grants, policies, paid-API calls, webhooks, backup scripts — and answers four questions about
*this* project:

1. **Delete** — what data could be destroyed, and by whom?
2. **Expose** — who could read or change data that is not theirs?
3. **Spend** — what could run up a bill, or move money wrongly?
4. **Recover** — when one of those happens, what can actually be restored?

Every finding is traced through the lines it re-read, says in one sentence what it means for a
person who never opened a terminal, and gives one step to confirm it yourself. It reports; it
never edits your code.

**0.2.2:** Findings name what the agent CAN do, not an incident that happened — about a third fewer unsupported findings in blind eval, completeness unchanged. ([eval report](evals/measurement-2026-10-headlines.md))

**0.2.1:** The skill can write only its own `.what-if.md` log; the unused `ps` permission was removed.

---

## What it looks like

```
> /what-if
```

```
### The "read-only" agent can delete a customer

Status             Confirmed
Axis               Delete
Evidence           CLAUDE.md — "the agent role is read-only"
                   migrations/007_ops.sql — `grant ops_writer to support_bot;`
                   migrations/002_roles.sql — `grant select, insert, update, delete … to ops_writer;`
How                A later migration quietly gave the agent's role a writer role.
In plain words     The note says your assistant can only look; the database lets it delete.
Check it yourself  Search the migrations for `to support_bot` — every line is a permission it holds.
Fix                Revoke ops_writer from support_bot; give the agent a role with SELECT only.
```

```
## If it happens: what you can get back
Database     — nightly dump, but `--schema-only`: it contains no rows
Code         — no git remote: only on this machine
Money/keys   — keys rotate in the dashboard; no spend alert set
Weakest link — the backup has no data, so a delete is permanent
Check it yourself — open the latest dump: if there are no INSERT/COPY lines, there is nothing to restore
```

Findings are labelled **Confirmed** (every step is in quoted lines) or **Check** (holds only if one
fact it cannot see is true — it names that fact). Only Confirmed items go into **Fix now**, at
most two. A **Fine as is** list says what it looked at and found guarded, so you know which alarms
*not* to raise.

There is no target count. Three confirmed findings beat eight plausible ones, and "nothing serious
here" is a legitimate answer.

---

## Why not just ask Claude?

We measured it. Blind, two independent judges (Claude Sonnet and Codex), hidden answer keys,
answers normalised to one neutral format so the judges could not tell which tool wrote what.
Four sides: this skill (v2), its previous version (v1), a plain "do a premortem" prompt, and the
built-in `/security-review`. Eight small repos with planted delete / expose / spend / recover
defects — four of them **holdout** repos built by a separate agent that never saw this skill.

Average rank of four (lower is better), mean of the two judges:

| | v1 | **v2** | plain prompt | /security-review |
|---|---|---|---|---|
| training repos | 3.63 | **1.75** | 2.75 | 1.88 |
| holdout repos | 2.38 | **2.00** | 2.88 | 2.75 |

- **Recovery:** v2 scored the maximum in every cell — the only side that did.
- **Clear to a beginner:** v2 rated highest throughout.
- **Cost:** about half of v1 per run.
- **Honest limit:** finding the planted defects was a **tie** — a capable model finds most of them
  with any prompt. What this skill adds is *not* more findings; it is fewer invented ones, a real
  answer to "what can I get back", and wording a beginner can act on. One run per cell; the judges
  disagreed about `/security-review` on the holdout set.

---

## Install

**With the skills CLI:**

```bash
npx skills add K0m04ek/what-if
```

**As a Claude Code plugin** (updates included):

```
/plugin marketplace add K0m04ek/what-if
/plugin install what-if@what-if
```

**As a plain skill** — copy the one file:

```bash
git clone https://github.com/K0m04ek/what-if
mkdir -p ~/.claude/skills
cp -r what-if/skills/what-if ~/.claude/skills/
```

(Without `mkdir -p`, `cp` on a machine with no `~/.claude/skills` directory yet will quietly
copy the folder *as* `skills`, and the skill will never load.)

`SKILL.md` is the product; there is no runtime, no dependency, and nothing to configure.

---

## Use it

```
/what-if
```

Best moments to run it:

- **before you hand an agent a production database URL or deploy rights;**
- **before you add a database, payments or a paid API** — on the plan, before any code, is cheapest;
- **before a launch or a big migration.**

Say `fix <item>` afterwards and it makes the change **and adds a small test that fails if the bug
comes back.** It keeps a short log in `.what-if.md`, so things you chose to ignore are not raised
again — unless the condition you ignored them under has changed.

---

## The mental model

If you have seen a certain show about a time-variance bureaucracy, the vocabulary fits:
**your plan is the sacred timeline** — the one future where everything goes as intended. A
**nexus point** is a specific line where something deviates: a grant nobody noticed, a retry that
multiplies, a backup that holds no rows. **Deviation operators** (nothing, more, extra, partial,
reversed, wrong-thing, too-early-or-late) are how those points are found rather than imagined, and
**pruning** is the step that throws out anything not traced to a real line — including scary
patterns that turn out to be guarded. The metaphor stops there: nothing here monitors you. It
reports, you decide.

---

## Why it works this way

Every design decision here starts from a measured result rather than intuition. One caveat
first, because it matters: **none of these studies involved a language model.** They measured
people — clinicians enumerating hazards, engineers reviewing architectures, teams estimating
projects. Carrying their findings over to an AI assistant reading your repo is an
extrapolation, and it is mine, not theirs. What the research does establish is that structure
beats free association, that different lenses find different things, and that displayed lists
get mistaken for complete ones. Those failure modes are not species-specific. The short
version:

**Structured questioning beats free brainstorming.** In a direct controlled comparison, a
fixed four-question checklist identified hazards with an estimated success probability near
0.99, against 0.31 and 0.44 for open team brainstorming in the two domains tested. So branches
come from applying a small set of deviation operators to each element of your plan — never
from "imagine what could go wrong."
<sub>Kobo-Greenhut et al., *Int. J. for Quality in Health Care*, 2019</sub>

**Different methods find different problems, so lenses must differ.** When two structured
hazard methods were run over the same system on the same day, only 32–37% of their findings
overlapped — each was mostly finding what the other missed. That is why the skill walks a fixed
set of deviation operators across each credential, policy, route and script instead of asking a
model "what usually goes wrong" — and why its output ends with a "Not shown" line.
<sub>Potts et al., *BMC Health Services Research*, 2014</sub>

**Past tense, not conditional.** Framing an outcome as already-happened makes explanations
longer and raises the share of concrete, episodic causes people produce. In the one controlled
test of the technique, 178 participants planning an epidemic response dropped their confidence
about twice as much under a premortem as under listing pros and cons.
<sub>Mitchell, Russo & Pennington 1989; Veinott, Klein & Wiggins 2010</sub>

**Error paths first.** Of 198 catastrophic failures in production distributed systems, 92%
came from mishandling errors the software had already signalled, 58% would have been caught by
trivial error-path tests, and 90% were reachable in three or fewer events.
<sub>Yuan et al., *OSDI '14*</sub>

**Absence beats presence.** In architecture evaluations, risks of omission — no rollback, no
migration path, no auth check — outnumbered risks in what was actually built roughly two to
one.
<sub>Bass, Nord, Wood & Zubrow, *CMU/SEI-2006-TR-012*</sub>

**Anchored in your repo, because an anchor is checkable and a generality is not.** "Add
caching" cannot be verified or falsified by reading your code; "`dashboard/page.tsx:40` calls
`getUser()` inside a `.map()`" can be, in five seconds, by you. That is the whole argument —
no study required. Where your own history *is* useful: files that changed recently and broke
before are where the next faults cluster, which is why step 1 reads the git log.
<sub>Ostrand, Weyuker & Bell 2005, on within-project defect history</sub>

**No percentages, no risk scores.** Guessed likelihoods do not track real incident rates, and
the classic composite score (severity × occurrence × detectability) is mathematically invalid:
only 120 of its 1000 values are reachable, and identical numbers come from wildly different
situations.
<sub>Shebl, Franklin & Barber 2009; Bowles 2003</sub>

**"Not shown" is a required line.** When causes are displayed as a tree, people treat what is
shown as the whole space. In the classic experiment, three of a fault tree's seven branches
were removed; subjects' estimate of "everything else" rose from 7.8% only to about 16%, where
it should normatively have reached 46.8% — and expertise gave no protection.
<sub>Fischhoff, Slovic & Lichtenstein, *JEP:HPP*, 1978</sub>

---

## What it does not promise

**Not prediction.** Scenario methods have repeatedly failed to improve forecast accuracy in
direct tests. What they reliably do is change decisions — in one field experiment with
professionals, seeing multiple scenarios cut the least-flexible strategy choice from 65% to
50% and nearly doubled the flexible one.
<sub>Schnaars & Topol 1987; Phadnis, Caplice, Sheffi & Singh, *SMJ*, 2015</sub>

So the honest claim is: **wider coverage of concrete failure causes, and a nudge toward
designs that keep your options open.** Anyone selling you predicted futures for a codebase is
selling the myth this skill was built to avoid.

Three myths deliberately not used as justification here, because they do not survive checking:
the premortem's famous "30% improvement" (the study measured how many reasons people generated,
never whether they were right), Shell "predicting" the 1973 oil shock (the insider account
does not support the chronology), and the Standish CHAOS "189% average overrun" (irreproducible;
independent surveys put it at 30–40%).

---

## License

MIT

---

## References

Every study cited above, with a stable link. Where our phrasing had to be corrected against
the source, the correction is noted — the claim checks were run by a separate pass whose job
was to refute these numbers, and three of them needed fixing.

- **Kobo-Greenhut A, Reuveni H, Ben Shlomo I, Magnezi R (2019)** — *Unstructured brainstorming is not enough: structured brainstorming based on four verification and validation questions yields better hazard identification in healthcare*. International Journal for Quality in Health Care, Volume 31, Issue 7, August 2019, Pages 16-21.
  https://doi.org/10.1093/intqhc/mzy208
  <sub>Our earlier draft quoted a flat "0.31–0.44 range"; the paper reports 0.3080 and 0.4444 for two separate domains.</sub>

- **Potts, Anderson, Colligan, Leach, Davis & Berman (2014)** — *Assessing the validity of prospective hazard analysis methods: a comparison of two techniques*. BMC Health Services Research, 14:41.
  https://doi.org/10.1186/1472-6963-14-41

- **Mitchell, D. J., Russo, J. E., & Pennington, N. (1989)** — *Back to the future: Temporal perspective in the explanation of events*. Journal of Behavioral Decision Making, Vol. 2, Issue 1, pp. 25–38.
  https://doi.org/10.1002/bdm.3960020103
  <sub>Full text is paywalled; the qualitative finding (longer explanations, higher share of episodic causes) is confirmed, the exact proportions are not independently verified here.</sub>

- **Veinott, B., Klein, G. A., & Wiggins, S. (2010); Keysor, E., Wojtyna, A., & Veinott, E. S. (2020)** — *1) "Evaluating the Effectiveness of the PreMortem Technique on Plan Confidence" — Veinott, Klein & Wiggins, 2010. 2) "Premortem: Evaluating Two Structured Analytic Techniques for Group Brainstorming" — Keysor, Wojtyna & Veinott, 2020*. 1) Proceedings of the 7th International ISCRAM Conference (Information Systems for Crisis Response and Management), Seattle, WA, May 2010. No volume/issue/page numbers (conference proceedings paper). 2) Poster presented at the Society for Judgment and Decision Making (SJDM) 2020 conference — not a peer-reviewed published paper, just a conference poster/PDF (Michigan Technological University, Applied Statistics Program / Cognitive and Learning Sciences)..
  <sub>ISCRAM conference paper, n=178. The often-quoted d=0.81 comes from a later SJDM poster (Keysor, Wojtyna & Veinott 2020), not from this paper.</sub>

- **Ding Yuan, Yu Luo, Xin Zhuang, Guilherme Renna Rodrigues, Xu Zhao, Yongle Zhang, Pranay U. Jain, Michael Stumm (2014)** — *Simple Testing Can Prevent Most Critical Failures: An Analysis of Production Failures in Distributed Data-Intensive Systems*. Proceedings of the 11th USENIX Symposium on Operating Systems Design and Implementation (OSDI '14), pp. 249–265.
  https://www.usenix.org/conference/osdi14/technical-sessions/presentation/yuan

- **Bass, L., Nord, R., Wood, W., & Zubrow, D. (2006)** — *Risk Themes Discovered Through Architecture Evaluations*. Technical Report CMU/SEI-2006-TR-012, Software Engineering Institute, Carnegie Mellon University (report, not a journal — no volume/issue/pages).
  https://doi.org/10.1184/R1/6583481.v1
  <sub>57 omission vs 25 commission risks across 18 evaluations — the authors describe this as "twice as many".</sub>

- **Thomas J. Ostrand, Elaine J. Weyuker, Robert M. Bell (2005)** — *Predicting the Location and Number of Faults in Large Software Systems*. IEEE Transactions on Software Engineering, Vol. 31, No. 4, pp. 340-355.
  https://doi.org/10.1109/TSE.2005.49

- **John B. Bowles (2003)** — *An Assessment of RPN Prioritization in a Failure Modes Effects and Criticality Analysis*. Annual Reliability and Maintainability Symposium (RAMS), 2003 Proceedings, Tampa, FL, pp. 380-386.
  https://doi.org/10.1109/RAMS.2003.1182019

- **Shebl, N.A., Franklin, B.D., Barber, N. (2012)** — *Failure mode and effects analysis outputs: are they valid?*. BMC Health Services Research, vol. 12, article 150 (open access, no page range — article number 150).
  https://doi.org/10.1186/1472-6963-12-150

- **Fischhoff, B., Slovic, P., & Lichtenstein, S. (1978)** — *Fault Trees: Sensitivity of Estimated Failure Probabilities to Problem Representation*. Journal of Experimental Psychology: Human Perception and Performance, Vol. 4, No. 2, pp. 330–344.
  https://doi.org/10.1037/0096-1523.4.2.330
  <sub>Our earlier draft misstated this: the catchall rose to roughly 16% (median), not 14%, against a normative 46.8%.</sub>

- **Phadnis, S., Caplice, C., Sheffi, Y., & Singh, M. (2015)** — *Effect of Scenario Planning on Field Experts' Judgment of Long-Range Investment Decisions*. Strategic Management Journal, Vol. 36, Issue 9, pp. 1401–1411.
  https://doi.org/10.1002/smj.2293

- **Schnaars, S. P. & Topol, M. T. (1987)** — *The use of multiple scenarios in sales forecasting: An empirical test*. International Journal of Forecasting, Vol. 3, Issues 3–4, pp. 405–419.
  https://doi.org/10.1016/0169-2070(87)90033-1

