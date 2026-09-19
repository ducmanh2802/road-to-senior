# SKILL: inspect-repo

## When To Use
Start of any task before reading source.

## Inputs Required
Task description.

## Preflight
None.

## Procedure

### Step 1
Read AGENTS.md (if not already in context).

### Step 2
Read .ai/CURRENT.md — identify current phase + protected areas.

### Step 3
If needed for orientation, read .ai/PROJECT.md and the current phase file.

### Step 4
Search symbols (grep/regex) before reading files. Read only surrounding context.

### Step 5
Inspect relevant tests + build config if the task touches them. Stop inspection.

## Verification
You can state: current phase, files to change, tests to run.

## Failure Handling
If CURRENT.md contradicts the repo, trust the repo, then update CURRENT.md at phase end.

## Stop Conditions
Never scan node_modules, dist, target, lockfiles, generated files.

## Output
A short inspection summary (≤ 15 lines).

## Token Rules
- Never repeat info already in CURRENT.md.
- Prefer grep over full-file reads.
