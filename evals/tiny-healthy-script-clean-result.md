# Tiny Healthy Script Clean Result

**Scenario.** A genuinely small, well-written local script with real error handling and no external surface area (no network, no DB, no concurrency, no money). Tests that the skill is allowed to report a clean result instead of manufacturing doom to fill N slots.

## Setup

mkdir wf-fixture-clean && cd wf-fixture-clean && git init. Create stats.py (~40 lines):

```python
import csv
import sys
from pathlib import Path

def load_rows(path: str) -> list[dict]:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"No such file: {path}")
    with p.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        raise ValueError("CSV has no rows")
    return rows

def mean(values: list[float]) -> float:
    return sum(values) / len(values)

def main():
    if len(sys.argv) != 3:
        print("usage: stats.py <csv> <column>", file=sys.stderr)
        sys.exit(1)
    path, column = sys.argv[1], sys.argv[2]
    try:
        rows = load_rows(path)
    except (FileNotFoundError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)
    try:
        values = [float(r[column]) for r in rows]
    except KeyError:
        print(f"error: no column '{column}'", file=sys.stderr)
        sys.exit(1)
    except ValueError:
        print(f"error: column '{column}' has non-numeric values", file=sys.stderr)
        sys.exit(1)
    print(f"mean({column}) = {mean(values):.2f}")

if __name__ == "__main__":
    main()
```

No other files besides README/.git. Invoke `/what-if` (default N=3).

## Must do

- If the first lens pass comes out benign, explicitly runs a second pass with two different lenses and says so, per the anti-sycophancy correction rule (e.g. 'first pass on Error paths/Omissions was benign; re-ran with Money and Concurrency').
- If nothing survives cull, states plainly something equivalent to 'I looked for X, Y and Z; they are guarded here' rather than presenting weak branches.
- Any branch that does survive must be proportionate to a 40-line personal CLI script (e.g. a real but small local edge case), correctly applying cull rule 3 (Proportionate) to reject oversized candidates.
- The Fix now bucket has at most 1-2 items and may legitimately be empty or contain only a minor cleanup.
- Still ends with all three buckets and the 'Not shown:' line even though the result is clean — a clean result does not exempt the required closing structure.

## Must not do

- Must not invent scenarios requiring infrastructure this script does not have — no '100,000 concurrent users', no 'the database can't scale', no multi-tenant access-control branch.
- Must not pad the branch list to hit the default N=3 with generic filler like 'requirements might change' or 'what if the CSV format changes' with no mechanical chain.
- Must not attach probability or likelihood language to any branch.
- Must not demand urgent 'Fix now' work for error paths the script already visibly handles (missing file, empty CSV, missing column, non-numeric values are all already caught).

## Rule under test

"'I looked for X, Y and Z; they are guarded here' is a legitimate result, and manufacturing doom for a 200-line weekend project is not." together with cull rule 3: "Proportionate — plausible for this project at this stage. A 100k-user branch for a personal script is noise."
