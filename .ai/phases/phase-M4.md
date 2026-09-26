# Phase M4 — Microservices Distributed‑System Foundations

**Objective**

Transform the curriculum foundations identified in the audit into a fully interactive senior‑level learning experience. This phase covers:

1. **M4.1 Architecture Foundations** – monolith, modular monolith, microservices, bounded contexts, service boundaries, coupling/cohesion, database‑per‑service, sync vs async, consistency/availability trade‑offs.
2. **M4.2 Service Foundation** – Spring Boot service template, configuration, profiles, health endpoints, structured JSON logging, optimistic locking, idempotency, audit trail.
3. **M4.3 DDD + Clean/Hexagonal Architecture** – entities, value objects, aggregates, domain/application services, repositories, domain events, bounded contexts, clean‑architecture layering.
4. **M4.4 Outbox Pattern** – transactional outbox, publisher, retry, duplicate handling, CDC basics.
5. **M4.5 Kafka Deep‑Dive** – broker, topics, partitions, offsets, producers, consumers, consumer groups, ordering, idempotency, DLQ, backpressure, transactions, schema evolution.

Each sub‑topic is expressed as a **module** with concept questions, coding labs, debugging exercises, failure labs and senior‑defense questions, all wired into the existing competency, SM‑2, Review and Today engines.

**Success Criteria**

- All modules are defined in `src/data/microservices/phaseM4.ts` using the existing `authoring` DSL.
- Corresponding UI routes display the labs without errors.
- TypeScript compiles (`npm run lint`, `npm run build`).
- Curriculum data is persisted via `SENIOR_JAVA_180_STATE_V1`.
- Governance files (`.ai/CURRENT.md`, `.ai/phase-status.md`, `task_on_progress.md`) are updated.
- A single atomic Git commit records the complete implementation.

- Status: **PASS**
- Verification:
  - `tsc --noEmit`: 0 errors
  - Vitest test suite: 17 files, 165 tests PASS
  - TypeScript types and phase structures verified
- Commits & Changes:
  - Updated `src/data/microservices/types.ts` with complete `MsFailureLabSpec` fields
  - Defined clean `phaseM4.ts` specifications
  - Ensured non-breaking persistence and engine normalisation in `src/engines/microservices.ts`
