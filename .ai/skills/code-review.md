# SKILL: code-review

## When To Use
Reviewing changed code (self or other).

## Inputs Required
Diff / changed files.

## Preflight
None.

## Procedure

### Step 1
Review in order: correctness → security → architecture → maintainability →
performance → observability → tests → UX → accessibility → dependency risk.

### Step 2
Classify each finding: BLOCKER / HIGH / MEDIUM / LOW.

## Verification
Every finding has severity + one-line reason.

## Failure Handling
BLOCKER found → implementation must stop and fix before commit.

## Stop Conditions
Do not rewrite code unless explicitly requested.

## Output
Severity-tagged findings only.

## Token Rules
- No lengthy prose; one line per finding.
