# Phase M5 — Spring Cloud, Security, Polyglot Data & Resilience

**Objective**

Implement the complete Senior-level Phase M5 curriculum covering perimeter ingress, zero-trust security, idempotent payments & webhooks, polyglot storage patterns, binary RPC with gRPC, and fault-tolerant resilience engineering.

Modules implemented:
1. **M5.1 Spring Cloud** — API Gateway, discovery, centralized configuration, OpenFeign, load balancing, request-scoped correlation tracing, backward-compatible contracts.
2. **M5.2 Microservices Security** — OAuth2, JWT asymmetric signature verification (RS256/JWKS), method-level @PreAuthorize scopes, Token Relay pattern, defense-in-depth security perimeter.
3. **M5.3 Payment Processing** — Idempotent payment intent lifecycle, HMAC-verified webhook state transitions, out-of-order webhook delivery handling, and background reconciliation sweepers. (Labelled SIMULATION — NOT REAL STRIPE EXECUTION).
4. **M5.4 Polyglot Persistence** — PostgreSQL relational ACID, MongoDB polymorphic document aggregates, Elasticsearch full-text projections, and Redis cache-aside with mutex locking against cache stampedes.
5. **M5.5 High-Performance gRPC** — Protocol Buffers v3 binary contracts, HTTP/2 multiplexing, deadline propagation, canonical status code error translation, and REST vs gRPC performance dynamics.
6. **M5.6 Resilience Engineering** — Resilience4j Circuit Breakers (CLOSED, OPEN, HALF_OPEN), concurrency bulkheads, exponential backoff with full jitter, degraded fallbacks, and preventing cascading retry storms.

Every module provides:
- Complete 12-part explanation framework (what, why, problem, internals, runtime, trade-offs, failures, observe, debug, fix, when-not, senior question).
- Practical code labs, debugging exercises, and 8-step failure labs (BUG → REPRODUCE → OBSERVE → HYPOTHESIS → INVESTIGATE → DEBUG → FIX → VERIFY → EXPLAIN).
- Architecture challenges and adversarial staff-level defense drills.
- Technical English vocabulary, collocations, incident dialogues, and 60-second pitches.
- AI Senior Java adversarial challenge tasks.
- 10-question deterministic assessment quizzes.
- M5 Capstone Architecture snapshot and P0 incident drill (`M5-INC-01`).

**Status**: **PASS**

**Verification**:
- `node_modules\.bin\tsc.cmd --noEmit`: 0 errors
- `npm.cmd test` (Vitest): 18 files, 176 tests PASS (including 11 new tests in `src/engines/__tests__/microservices.test.ts`)
- `npm.cmd run build` (Vite production build): PASS (exit code 0, 1831 modules transformed)
- Non-breaking persistence: verified via `normalizeMsProgressRecords` under `SENIOR_JAVA_180_STATE_V1`
