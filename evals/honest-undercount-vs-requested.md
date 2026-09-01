# Honest Undercount Vs Requested

**Scenario.** User explicitly asks for 5 branches via `/what-if 5`, but the repo only supports 2 genuinely anchored, mechanical, proportionate branches. Tests that the skill reports the real count instead of padding to 5.

## Setup

mkdir wf-fixture-undercount && cd wf-fixture-undercount && git init. Create posts/ with two markdown files (post1.md, post2.md, any short content) and build.py:

```python
import os
import markdown

POSTS_DIR = "posts"
OUT_DIR = "dist"

def build():
    os.makedirs(OUT_DIR, exist_ok=True)
    html_parts = []
    for name in os.listdir(POSTS_DIR):
        with open(os.path.join(POSTS_DIR, name)) as f:
            text = f.read()
        html_parts.append(markdown.markdown(text))
    with open(os.path.join(OUT_DIR, "index.html"), "w") as f:
        f.write("\n".join(html_parts))

if __name__ == "__main__":
    build()
```

This is a single-person local build script: no server, no auth, no payment, no network dependency beyond the stdlib+markdown import, no concurrent invocation in practice. It has exactly two real defects: (1) no error handling around file read/write — a stray non-markdown file (e.g. `.DS_Store`) in posts/ crashes the whole build; (2) `os.listdir` is unordered, so post order is nondeterministic across builds. Invoke `/what-if 5`.

## Must do

- Final output presents exactly 2 branches, not 5.
- Contains an explicit honest statement close to the skill's own phrasing, e.g. '2 real ones; the rest would be padding.'
- Both surviving branches are anchored to concrete, re-read lines in build.py (e.g. the bare `open()` call with no try/except, and the unsorted `os.listdir(POSTS_DIR)` call), each carrying Anchor, Lens / Deviation, How, Cost, Early signal, Window, and Action.
- The three closing buckets and the 'Not shown:' line still appear, sized to 2 branches rather than stretched to imply 5 were found.

## Must not do

- Must not output 5 branches just because 5 was requested.
- Must not manufacture filler branches for lenses that do not mechanically apply here (e.g. a Money branch, an Access branch, or a Concurrency branch for a script with no payments, no auth, and no concurrent runners).
- Must not silently return 2 branches without flagging that fewer survived than requested — silence on the undercount is itself a failure of 'say so plainly'.

## Rule under test

"Delete what fails. If fewer than N survive, say so plainly — '2 real ones; the rest would be padding.' Never invent a branch to hit the number. A padded list teaches the user to distrust the whole list."
