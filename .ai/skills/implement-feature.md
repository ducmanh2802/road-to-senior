# SKILL: implement-feature

## When To Use
Any feature/phase implementation task.

## Inputs Required
Approved phase/task scope; .ai/CURRENT.md.

## Preflight
Typecheck + relevant tests pass at baseline (never start from red).

## Procedure

### Step 1
READ — inspect only affected modules (skill: inspect-repo).

### Step 2
PLAN — list files to change + tests to add; keep to scope; no unrelated fixes.

### Step 3
IMPLEMENT smallest change that satisfies scope. No `any`; no mock data.

### Step 4
TEST — smallest relevant layer (unit → component → build). Full suite at milestones.

### Step 5
VERIFY — typecheck, tests, build; review `git diff --stat` for unrelated changes.

### Step 6
DOCUMENT — update .ai/CURRENT.md + phase record.

### Step 7
COMMIT `phase(XXX): <desc>`; STOP.

## Verification
Quality gates green; diff contains only in-scope files.

## Failure Handling
> 20 unrelated errors → MIGRATION BLOCKED report; stop.

## Stop Conditions
Scope expansion required → ask, don't assume.

## Output
STATUS / CHANGES / TESTS / BUILD / FILES / COMMIT / NEXT — then STOP.

## Token Rules
- Summarize diffs; never paste full files.
- Read only referenced source.
