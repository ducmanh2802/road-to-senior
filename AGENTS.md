# AGENTS.md — Senior Java 180

You are working on **Senior Java 180** — a Developer / Cloud Engineering Learning Platform.
Final path: Senior Java Engineer → Cloud-native Developer → AWS Solution Architect → AI/GenAI Architect.

## Mission

The platform teaches through one loop:

```
LEARN → DESIGN → BUILD → BREAK → DEBUG → OPTIMIZE
      → EXPLAIN → DEFEND → REVIEW → INTERVIEW
```

Focus domains: Java · Spring Boot · Microservices · Kafka · Redis · PostgreSQL ·
System Design · AWS · AI/GenAI · Solution Architecture · Technical Interview.

## Source of truth (read in this order)

```
AGENTS.md → .ai/CURRENT.md → .ai/PROJECT.md → .ai/STACK.md
→ current .ai/phases/phase-XXX.md → ONE relevant .ai/skills/*.md
→ relevant source files
```

Never scan the whole repository. Search symbols first; read only needed context.

## Hard rules

- inspect before edit; smallest safe change; no unrelated refactor
- no silent architecture change; no production mocks; no fake data —
  missing real data renders "No data yet", never zeros or synthetic records
  (synthetic fixtures allowed only if explicitly documented as test fixtures)
- preserve API contracts, DB/localStorage contracts, auth/security semantics
- test before commit; run the smallest relevant verification first
- after a completed phase: update `.ai/CURRENT.md`, create phase record,
  commit phase changes separately, then **STOP** — never auto-start the next phase
- never label generated exam questions as real AWS exam questions
- TypeScript: strict, no `any` in new code (`unknown` + narrowing if required)
- fail closed: if migration/change creates >20 unrelated errors → report BLOCKED

## Frontend

```
Target:   Vue 3 · TypeScript · Vite · Vue Router · Pinia · Vitest · Playwright
Strategy: hard cutover, React → Vue 3, vertical slices (see .ai/skills/frontend-vue.md)
React is temporary migration source only. Final architecture: Vue 3 only.
```

## Backend (target platform)

```
Java 25 LTS · Spring Boot 4.1.x · Spring Framework 7.x
PostgreSQL · Redis · Kafka · Testcontainers · Micrometer / OpenTelemetry
```

No backend exists yet — do not claim it does. "Latest" = latest STABLE compatible
version, never alpha/beta/milestone/snapshot. Do not silently upgrade versions.

## Agent behavior loop

```
inspect → identify scope → plan minimally → implement → test
→ update state (.ai/CURRENT.md + phase record) → commit → STOP
```

## Token priority

P0 AGENTS.md → P1 .ai/CURRENT.md → P2 .ai/PROJECT.md → P3 current phase file
→ P4 one required skill → P5 relevant source files → P6 knowledge → P7 other docs

