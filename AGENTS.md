# AGENTS.md — Senior Java 180

You are working on **Senior Java 180** — a Developer / Cloud Engineering Learning Platform
(final path: Senior Java Engineer → Cloud-native Developer → AWS Solution Architect → AI/GenAI Architect).

## Read before acting (in order)

1. `.ai/PROJECT.md`
2. `.ai/CURRENT.md` ← most important; always answers WHERE ARE WE
3. the current `.ai/phases/phase-XXX.md` (history; never rewrite)
4. the ONE `.ai/skills/<skill>.md` relevant to the task

Do **not** scan the whole repository. Search first; read only surrounding context needed.

## Working rules

- inspect first, smallest change, no unrelated refactoring
- no mock/fake data, no fake progress/scores — "No data yet" if nothing real exists
- preserve architecture and existing behavior; never silently change contracts
- never label generated exam questions as real AWS exam questions
- TypeScript: strict, no `any` in new code (`unknown` + narrowing if required)
- run the smallest relevant verification first; full suite only at milestone boundaries
- after a phase: update `.ai/CURRENT.md`, create `.ai/phases/phase-XXX.md`, commit, **STOP**

## Token priority

P0 AGENTS.md → P1 .ai/CURRENT.md → P2 .ai/PROJECT.md → P3 current phase file
→ P4 one required skill → P5 relevant source files → P6 knowledge → P7 other docs
