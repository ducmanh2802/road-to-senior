# SKILL: testing

## When To Use
Before/while implementing any change.

## Inputs Required
Scope of change.

## Preflight
None.

## Procedure

### Step 1
Determine minimum relevant layer: unit → component → integration → e2e.

### Step 2
Run smallest relevant test scope first (single file / grep filter).

### Step 3
Typecheck (`npx tsc --noEmit`).

### Step 4
Build only when appropriate for the change.

### Step 5
Full suite only at milestone boundaries.

## Verification
All touched-scope tests pass; no test deleted to make build pass.

## Failure Handling
Red baseline → fix or report BLOCKED; never disable checks.

## Stop Conditions
Test requires redesign beyond scope → stop and report.

## Output
N tests run / N passed summary.

## Token Rules
- Do not run full suite for tiny changes.
- Do not paste full test output; summarize.
