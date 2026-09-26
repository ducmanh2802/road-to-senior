# Audit Report – Existing Microservices Engineering Track

## Repository Overview
- **Frontend**: Vue 3 + TypeScript + Vite (full migration from React completed up to Phase 009).
- **Backend**: No Java/Spring Boot services exist yet – the platform currently only hosts client‑side learning UI.

## Existing Microservices‑related Curriculum Artefacts
| File | Description |
|------|-------------|
| `src/data/microservices/phaseM1.ts` | Defines **Phase M1 – Microservices Architecture** curriculum, concepts, labs, debugging and failure exercises.
| `src/data/microservices/phaseM2.ts` | Defines **Phase M2 – Service Foundation** curriculum, template service, health/readiness, contract testing, debugging, failure labs.
| `src/data/microservices/authoring.ts` | Helper functions to author labs, concepts, quizzes, AI prompts used across phases.
| `src/data/microservices/compact.ts` | Utility to expand/compress module definitions.
| `src/data/microservices/shared.ts` | Shared constants for infra compose, verification scripts, etc.
| `src/data/microservices/types.ts` | Type definitions (`MsPhaseMeta`, `MsModule`).
| `src/data/microservices/phaseM3.ts` | (currently empty – will host the enrichment plan).

## Existing Java Core Curriculum
- `src/data/javaCoreCurriculum.ts` – core Java language and concurrency curriculum (Phase P0‑1.1 / P0‑1.2).
- Tests under `src/vue/__tests__` covering Java learning pages.

## Existing Learning Engine Components
- **Competency Engine** – tracks skill dimensions (technical, SM‑2, etc.) (files under `src/engines/`).
- **SM‑2 Review** – spaced‑repetition review system integrated with learning pages.
- **Today / Review / Technical English / AI Senior Java** – vertical slices with Pinia stores, UI components, and full test coverage.
- **Router** – Vue Router configuration (`src/vue/router/index.ts`).
- **UI Primitives** – reusable components under `src/vue/components/ui/` (Button, Card, CodeBlock, etc.).

## Gaps Identified
1. **No actual Java Spring Boot microservice codebase** – only curriculum definitions exist.
2. **Missing deep‑dive labs** for DDD, Clean/Hexagonal Architecture, Outbox Pattern, Saga (orchestration vs choreography), Spring Cloud features (Gateway, Discovery, OpenFeign), Security (OAuth2/JWT), Kafka advanced topics, Resilience patterns, Observability, Kubernetes deployment, Helm charts, Benchmarking, Payment/Webhook workflows.
3. **Limited integration** of existing curriculum with competency dimensions for microservices topics.
4. **Review/SM‑2 linkage** for many new labs is absent.
5. **Today view** does not surface microservices competency gaps for learner prioritisation.

---

*Prepared by autonomous lead engineer (Phase M3 – IN PROGRESS).*
