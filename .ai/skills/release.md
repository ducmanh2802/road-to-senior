# SKILL: release

## When To Use
End of every phase.

## Inputs Required
Green quality gates.

## Preflight
Typecheck + relevant tests + build PASS.

## Procedure

### Step 1
`git status` / `git diff --stat` / `git diff --check` — review changed files.

### Step 2
Update `.ai/CURRENT.md` (facts only, never invented PASS).

### Step 3
Create `.ai/phases/phase-XXX.md` (immutable after phase completion).

### Step 4
Commit `phase(XXX): <short description>` — no unrelated commits.

### Step 5
Report COMMIT hash + NEXT; STOP.

## Verification
Commit contains only in-scope files.

## Failure Handling
Unrelated files in diff → unstage; fix scope first.

## Stop Conditions
Never auto-start the next phase.

## Output
Short phase completion report.

## Token Rules
- Summarize; do not output full diffs.
