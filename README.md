# WHAT-IF

**Your code works on your machine. WHAT-IF shows you the week it stops working.**

A skill for Claude Code. It reads your actual plan and code, then unrolls N branches of your
project's near future — each one anchored to something it verified while you waited (a line it
re-read, a plan item, a search that came back empty), each one ending in a fix you can apply
today. It reports; it never edits your code.

It is the thing an experienced engineer does silently and a new developer cannot do yet:
run the plan forward and notice what breaks.

---

## What it looks like

```
> /what-if 3
```

```
### The same order was charged twice

Anchor            checkout.ts:88 — <button onClick={submit}> with no disabled state
Lens / Deviation  Human behavior / AS WELL AS
How               Two requests left before the first response returned, so two rows
                  were written and the card was charged twice.
Cost              Customer's money, a manual refund, a support conversation.
Early signal      Orders table shows pairs with near-identical timestamps —
                  but nothing watches that table today, so nobody would see it.
Window            Cheap while the button is one component. After the first real
                  charge it also costs a refund and a support conversation.
Action            Disable the button until the response lands, and send an
                  idempotency key with the request.
```

That `Lens / Deviation` line is the point. It says the branch came from walking a fixed set of
deviation operators across a real anchor — not from a language model free-associating about
what usually goes wrong. You can audit the coverage; with a story you cannot.

Three buckets at the end: **fix now** (one or two things, never a wall), **write down**, and
**consciously ignore** — with a reason. Plus one honest line saying how much was *not* covered.

---

## Install

**As a plugin** (updates included):

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

That is the whole thing. `SKILL.md` is the product; there is no runtime, no dependency, and
nothing to configure.

---

## Use it

```
/what-if            three branches
/what-if 5          five branches
```

Works at two moments, and the procedure is the same for both — only the source of anchors
changes:

- **On a plan, before any code.** Cheapest time to change your mind: you edit a sentence
  instead of a subsystem.
- **On code that already runs.** Sharper anchors, because the failure is already sitting in
  a specific line.

---

## The mental model

If you have seen a certain show about a time-variance bureaucracy, you already know how this
works, and the vocabulary is worth borrowing because it is genuinely accurate:

**Your plan is the sacred timeline** — the single future where everything goes as intended,
which is the only future most of us ever picture.

**A branch starts at a nexus point.** Somewhere specific, something deviates: a call returns
an error nobody handled, a user clicks twice, a table grows a hundredfold. That point has an
address in your repo, and the skill has to show it to you — that is the `Anchor` line. No
address, no branch.

**Deviation operators are how branches are found, not imagined.** Eight of them — nothing,
more, less, extra, partial, reversed, wrong-thing, too-early-or-late — get walked across every
anchor. The `Lens / Deviation` line on each branch tells you which one produced it, so you can
check the coverage instead of trusting a story.

**Then most branches get pruned.** A branch that cannot be traced to a real line, or whose
mechanism takes more than a few steps to explain, gets cut rather than reworded. What survives
is a small number of futures that actually reach from here.

**And what you deliberately keep, you keep on purpose.** The third bucket — *consciously
ignore* — exists because pruning everything risky is not a strategy either. Some branches you
look at, understand, and decide to live with. Those get written down with a reason, so the next
run does not re-litigate them.

The one place the metaphor stops: nothing here monitors you, and the skill has no authority
over your choices. It reports, you decide.

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
overlapped — each was mostly finding what the other missed. N branches are therefore N
*distinct lenses* — error paths, omissions, volume, human behavior, dependencies — not N
paragraphs from one prompt.
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

