# Phase M3 – Microservices Curriculum Enrichment

## Objective
Upgrade the **Microservices Engineering Track** from a theory‑plus‑basic‑labs structure to a **Senior Microservices Engineering Apprenticeship** that drives learners through the full BUILD → BREAK → OBSERVE → DEBUG → FIX → BENCHMARK → DESIGN → EXPLAIN → DEFEND → ASSESS → REVIEW loop.

## Scope
1. **Audit** the existing repository for any micro‑services‑related artefacts.
2. **Map** concepts from the three external references (TayJava, English‑Microservices, Vietnamese‑Microservices) onto the current curriculum, identifying gaps.
3. Produce a **curriculum mapping table** summarising for each reference topic whether the platform already covers it and what is missing.
4. Draft the **high‑level curriculum outline** for the apprenticeship, including architecture, hands‑on labs, exercises, failure & debugging labs, design & defense labs, and integration with existing engines (competency, SM‑2, Review, Today, Technical English, AI‑Senior‑Java).
5. Create **artifacts** for the next phases (M4, M5…) that will flesh out the detailed labs, labs‑specific implementation code and assessments.

## Deliverables (Phase M3)
- `audit-report.md` – concise report of existing micro‑services modules, Java core modules, Spring Boot content, UI primitives, and the learning‑engine scaffolding.
- `reference‑mapping.md` – table answering the ten questions for every topic from the three external references.
- `curriculum‑outline.md` – high‑level module list, lab categories, exercise density targets, and integration points with the existing platform.
- Update `.ai/CURRENT.md` to record **Phase M3** as **IN PROGRESS**.

## Success Criteria
- All existing micro‑services artefacts are listed with file paths.
- The mapping table highlights **exactly** which topics need new labs, deeper explanations, or additional assessment components.
- The outline aligns with the platform’s existing loop (LEARN → DESIGN → … → REVIEW) and respects the token priority hierarchy.
- No code changes are made to production artefacts in this phase.

## Next Steps (to be performed in Phase M4)
- Implement the detailed labs for **Microservices Fundamentals** (M1 concepts) and **Service Foundation** (M2 concepts).
- Add **DDD & Clean Architecture** deep‑dive labs.
- Introduce **Outbox Pattern**, **Saga**, **Spring Cloud**, **Security**, **Kafka**, **Resilience**, **Observability**, **Kubernetes**, and **Benchmark** labs as per the curriculum outline.
- Wire each new lab into the competency engine, SM‑2 review flow, and the **Today** prioritisation engine.

---

*Prepared by the autonomous lead engineer – ready for review and commit.*
