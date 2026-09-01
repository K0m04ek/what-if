# WHAT-IF

**Your code works on your machine. WHAT-IF shows you the week it stops working.**

A skill for AI coding assistants. It reads your actual plan and code, then unrolls N branches
of your project's near future — each one anchored to a real file, each one ending in a fix you
can apply today.

It is the thing an experienced engineer does silently and a new developer cannot do yet:
run the plan forward and notice what breaks.

---

## What it looks like

```
> /what-if 3
```

```
### Three weeks in: the same order was charged twice

Anchor        checkout.ts:88 — no guard against a second submit
How           Two requests left before the first response returned, so two rows
              were written and the card was charged twice.
Cost          Customer's money, a manual refund, a support conversation.
Early signal  Orders table shows pairs with near-identical timestamps.
Fix now       Disable the button until the response lands, and send an
              idempotency key with the request.
```

Three buckets at the end: **fix now** (one or two things, never a wall), **write down**, and
**consciously ignore** — with a reason. Plus one honest line saying how much was *not* covered.

---

## Install

**As a plugin** (updates included):

```
/plugin marketplace add mdiyorl/what-if
/plugin install what-if@what-if
```

**As a plain skill** — copy the one file:

```bash
git clone https://github.com/mdiyorl/what-if
cp -r what-if/skills/what-if ~/.claude/skills/
```

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

## Why it works this way

Every design decision here comes from measured results rather than intuition. The short
version:

**Structured questioning beats free brainstorming.** In a direct controlled comparison, a
fixed question set found hazards at a rate of 0.99 against 0.31–0.44 for open team
brainstorming. So branches come from applying a small set of deviation operators to each
element of your plan — never from "imagine what could go wrong."
<sub>Kobo-Greenhut et al., *Int. J. for Quality in Health Care*, 2019</sub>

**One pass sees about a third of the picture, so lenses must differ.** Two different hazard
methods run on the same system overlapped by only 32–37% of their findings. N branches are
therefore N *distinct lenses* — error paths, omissions, volume, human behavior, dependencies —
not N paragraphs from one prompt.
<sub>Potts et al., *BMC Health Services Research*, 2014</sub>

**Past tense, not conditional.** Framing an outcome as already-happened roughly doubles the
share of concrete, specific causes people produce, and cuts plan overconfidence about twice as
much as listing pros and cons.
<sub>Mitchell, Russo & Pennington 1989; Veinott, Klein & Wiggins 2010; Keysor & Veinott 2020</sub>

**Error paths first.** Of 198 catastrophic failures in production distributed systems, 92%
came from mishandling errors the software had already signalled, 58% would have been caught by
trivial error-path tests, and 90% were reachable in three or fewer events.
<sub>Yuan et al., *OSDI '14*</sub>

**Absence beats presence.** In architecture evaluations, risks of omission — no rollback, no
migration path, no auth check — outnumbered risks in what was actually built roughly two to
one.
<sub>Bass, Nord, Wood & Zubrow, *CMU/SEI-2006-TR-012*</sub>

**Anchored in your repo, not in general lore.** Defect models trained on a project's own
history put ~83% of the next release's faults in the top 20% of files; the same models
transferred across projects succeeded in 3.4% of 622 attempts. Generic "risky code" advice
does not travel — yours does.
<sub>Ostrand, Weyuker & Bell 2005; Zimmermann et al. 2009</sub>

**No percentages, no risk scores.** Guessed likelihoods do not track real incident rates, and
the classic composite score (severity × occurrence × detectability) is mathematically invalid:
only 120 of its 1000 values are reachable, and identical numbers come from wildly different
situations.
<sub>Shebl, Franklin & Barber 2009; Bowles 2003</sub>

**"Not shown" is a required line.** When causes are displayed as a tree, people treat what is
shown as the whole space. In the classic experiment, pruning branches that accounted for 47%
of real failures raised subjects' estimate of "everything else" from 7.8% only to 14% — and
expertise gave no protection.
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
