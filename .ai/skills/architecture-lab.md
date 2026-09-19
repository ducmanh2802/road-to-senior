# SKILL: architecture-lab

## When To Use
Creating/grading an architecture exercise (labs, ADRs, interview defense content).

## Required Reads
.ai/ROADMAP.md (track position) · relevant knowledge file.

## Execution steps

### Step 1 — frame
Problem → functional requirements → non-functional requirements → traffic estimation.

### Step 2 — design
Data model → API → architecture → AWS services → Java/Spring components →
security → reliability → observability → cost.

### Step 3 — defend
Trade-offs (explicit WHY; never "Kafka because it scales") → failure modes →
interview defense script.

### Step 4 — store
Content goes to the app content system (seed structure), versioned; page renders it.
No fake scores.

## Verification
Every claim has a WHY; every AWS service has use-case mapping; ADR-style decisions
logged in .ai/DECISIONS.md only if they bind the project architecture.

## Failure conditions
Hand-wavy rationale → reject. Missing failure modes → incomplete.

## STOP condition
Lab complete → commit content → STOP.

## Output
Lab record (frame/design/defense) + tests if stored as structured content.

## Token Rules
One lab per phase; no generic textbook text.
