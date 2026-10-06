# ROAD TO SENIOR 180 — FULL PROJECT AUDIT

**Audit date**: 2026-10-05
**Auditor role**: Principal Engineer / Senior Java Architect / Staff Code Reviewer / QA Lead / Learning-System Architect / Security Reviewer / Release Engineer
**Repository**: `SENIOR JAVA 180` (`https://github.com/ducmanh2802/road-to-senior.git`)
**Commit audited**: `90287fd` ("a") on `main`, branch 1 commit behind `origin/main`
**Method**: repository inspection + executed verification (not README claims)

---

## A. Executive Summary

`SENIOR JAVA 180` is a **Vue 3 + TypeScript single-page learning platform** that teaches senior Java engineering through a staged loop. The repository is *not* a backend system — there is no Java/Spring code, no database, no Docker, no CI. All "Spring Boot", "Kafka", "Redis", "PostgreSQL", "AWS" and "Distributed Systems" capability is delivered as **curriculum content and simulated labs inside a browser application**.

That is a legitimate product decision. It is also the single most important framing fact for this audit: the platform can certify *understanding and design reasoning*, but it **cannot** certify *production engineering execution*, because there is no runtime in which production engineering can be executed or verified.

### Baseline verification executed (before any change)

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | **FAIL** — 6 errors |
| Unit tests | `npm test` | **FAIL** — 10 failed / 176 (166 passed) |
| Build | `npm run build` | PASS |
| ESLint | `npm run lint:eslint` | **FAIL** — 6 errors, 144 warnings |
| Quality gate | `npm run quality:gate` | PASS (but 2 of 7 sub-gates are no-ops) |

The repository was committed in a **broken state**: commit `90287fd` truncated two source-of-truth files to 0 bytes.

### Post-remediation baseline (after R2S-REM-01 and the truncation recovery)

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | **PASS** — 0 errors |
| Unit tests | `npm test` | **PASS** — 176/176 |
| Build | `npm run build` | **PASS** |
| ESLint | `npm run lint:eslint` | **PASS** — 0 errors, 144 warnings |

### Headline findings

| Severity | Count | Summary |
|---|---:|---|
| **P0** | 4 | Repository committed broken; micros learning track fully orphaned; learner progress silently lost on reload; demo data presented as real progress |
| **P1** | 9 | Orphaned seed data, thin interview engine, sparse roadmap, no-op security gate, dead npm scripts, no CI, no README, state validation unreachable, empty engine file |
| **P2** | 7 | React residue, warnings, hardcoded counts, missing E2E, mojibake comment, no coverage threshold, duplicated content tracks |
| **P3** | 4 | Cosmetic/optional items |

### Verdict

**ROAD TO SENIOR 180 = NOT CERTIFIED.**

The project is a strong *knowledge and design-reasoning* platform with an unusually honest honesty-contract (`REAL_EXECUTABLE` / `SIMULATED` / `SPECIFICATION`). It is **not** a senior-engineering *certification*, because the two largest competency assets (Microservices M1–M6, System Design) are unreachable from the UI, and learner progress is not durably persisted.

---

## B. Current Architecture

### Runtime and build

| Aspect | Value | Evidence |
|---|---|---|
| Framework | Vue 3.5 (`<script setup>` SFC) | `src/vue/**` |
| Language | TypeScript 5.9.3, `strict` | `tsconfig.json`, `package.json` |
| Build | Vite 8 + `@vitejs/plugin-vue` + Tailwind 4 | `vite.config.ts` |
| Router | vue-router 4, `createWebHashHistory` | `src/vue/router/index.ts:184` |
| State | Pinia 3 (single store) | `src/vue/stores/learning.ts:42` |
| Persistence | `localStorage`, key `SENIOR_JAVA_180_STATE_V1` | `src/vue/stores/learning.ts:32` |
| Test | Vitest 5 + `@vue/test-utils` + jsdom | `vitest.config.ts` |
| Lint | ESLint 9 flat config (vue + typescript-eslint) | `eslint.config.js` |
| Entry point | `src/vue/main.ts` | `index.html:18` |
| CI | **none** | no `.github/` |
| Backend | **none** — `AGENTS.md` target Java 25 / Spring Boot 4.1.x is NOT started | `.ai/CURRENT.md:8` |

### Layering (as-built)

```text
index.html → src/vue/main.ts → App.vue → layouts/AppShell.vue
                                          ├── layouts/Sidebar.vue   (config/navigation.ts)
                                          ├── layouts/TopBar.vue
                                          └── components/CommandPalette.vue
                                                    │
                                          router/index.ts  (26 routes)
                                                    │
                          ┌─────────────────────────┴──────────────────────┐
                          │ 11 real pages                                │ 15 PagePlaceholder
                          └─────────────────────────┬──────────────────────┘
                                                    │
                                          stores/learning.ts  (single Pinia store)
                                                    │
                    ┌───────────────────────────────┼────────────────────────────┐
              engines/sm2.ts              engines/competency.ts        engines/microservices.ts
                    │                              │                       (TEST-ONLY — see §30)
                    └──────────────────────────────┴────────────────────────────┘
                                                    │
                                          localStorage SENIOR_JAVA_180_STATE_V1
```

### Framework-agnostic engines (protected per `AGENTS.md`)

| File | LOC | Exports | Production callers |
|---|---:|---:|---|
| `src/engines/sm2.ts` | 86 | SM-2 spaced repetition | `stores/learning.ts` |
| `src/engines/competency.ts` | 170 | 6-dimension competency | `stores/learning.ts` |
| `src/engines/microservices.ts` | 736 | 26 functions | **NONE** (P0) |
| `src/engines/stateValidation.ts` | 118 | backup/incident validation | **NONE in Vue** (React reference only) |
| `src/engines/incidentEngine.ts` | 0 | — | **EMPTY FILE** |

### Data assets

| File | LOC | Reachable from UI |
|---|---:|---|
| `src/data/microservices/phaseM1–M6.ts` | 7,163 | **NO** (P0) |
| `src/data/javaCoreCurriculum.ts` | 2,036 | yes (`/learning/java`) |
| `src/data/seedData.ts` | 1,379 | partially (3 of 12 exports orphaned, P1) |
| `src/data/aiSeniorJava.ts` | 683 | yes (`/learning/ai`) |
| `src/data/technicalEnglish.ts` | 665 | yes (`/english`) |
| `src/data/canonicalStandards.ts` | 298 | yes (via Java page) |

### Route table (26 routes)

- **Real pages (11)**: `/`, `/today`, `/learning/roadmap`, `/learning/java`, `/learning/ai`, `/interview`, `/review`, `/settings`, `/english`, plus lazy `/review` duplicate and catch-all.
- **Placeholders (15)**: `/learning/spring`, `/learning/microservices`, `/learning/kafka`, `/learning/redis`, `/learning/databases`, `/learning/system-design`, `/build`, `/build/projects`, `/build/break-debug`, `/architecture`, `/architecture/aws-patterns`, `/architecture/decisions`, `/certifications`, `/certifications/aws/aif-c01`, `/review/mistakes`, `/review/flashcards`, `/review/progress`.

---

## C. Current Roadmap

Source of truth: `.ai/ROADMAP.md`, `.ai/CURRENT.md`, `.ai/phases/` (18 phase records).

### Phase ledger (validated against code, not documentation)

| Phase | Record | Claimed | Verified status | Evidence |
|---|---|---|---|---|
| 001 | `phase-001.md` | governance + ADRs 1–3 | CERTIFIED | `.ai/DECISIONS.md`, ADR-004/005 recorded |
| 002 | `phase-002.md` | Vue shell, 22 routes | CERTIFIED | 26 routes now (grew), shell tests pass |
| 003 | `phase-003.md` | Command Center slice | CERTIFIED | `CommandCenterPage.vue` + tests |
| 004 | `phase-004.md` | Today View slice | CERTIFIED | `TodayViewPage.vue` + tests |
| 005 | `phase-005.md` | Review slice | CERTIFIED | `ReviewPage.vue` + SM-2 wired |
| 006 | `phase-006.md` | migration batch planning | CERTIFIED (planning) | 6 batches defined |
| 006.1 | `phase-006.1.md` | SonarQube + quality gate | **PARTIAL** | SonarQube NOT CONFIGURED; Gitleaks NOT INSTALLED (P1) |
| 007 | `phase-007.md` | Settings & backup slice | CERTIFIED | `SettingsPage.vue` + tests |
| 008 | `phase-008.md` | Roadmap Explorer slice | CERTIFIED | `RoadmapPage.vue` + tests |
| 009 | `phase-009.md` | CodeBlock + Java 25 / Spring Boot 4.1 | PARTIAL | CodeBlock real; **no Spring Boot 4.1 curriculum** |
| P0-1.1 | `phase-p0-1.1.md` | Java Core foundation | TESTED | 20 modules, 11-stage loop on M1.1 |
| P0-1.2 | `phase-p0-1.2.md` | Sealed classes / pattern matching | TESTED | M1.2 full loop |
| E01 | `phase-e01.md` | Technical English | TESTED | `EnglishPage.vue` + `EnglishQuiz.vue` |
| AI-SJ | `phase-ai-sj.md` | AI knowledge foundation | TESTED | `AIKnowledgePage.vue`, 9 tracks |
| M3 | `phase-M3.md` | Microservices enrichment | IMPLEMENTED | `phaseM3.ts` — **UI-unreachable** |
| M4 | `phase-M4.md` | Distributed foundations | IMPLEMENTED | `phaseM4.ts` — **UI-unreachable** |
| M5 | `phase-M5.md` | Spring Cloud / security / resilience | IMPLEMENTED | `phaseM5.ts` — **UI-unreachable** |
| M6 | `phase-M6.md` | Observability & incident engineering | IMPLEMENTED | `phaseM6.ts` — **UI-unreachable** |

### Assessment of the roadmap

The phase ledger is **honest but incomplete**. Four microservices phases (M3–M6) plus M1/M2 are marked complete while being entirely unreachable from the product. This is the definition of "files exist ⇒ phase complete" that §7 of the audit charter explicitly rejects.

---

## D. Completed Phases

Verified by execution, not by record:

- Platform baseline, ADRs, npm lockfile, TS 5.9.3 pin.
- Vue shell: AppShell, Sidebar (route-derived), TopBar, CommandPalette, 26 routes, state components.
- Nine working vertical slices with behavioural tests: Command Center, Today, Review, Settings, Roadmap, Java Core, AI Knowledge, Technical English, Interview.
- SM-2 spaced repetition and 6-dimension competency engines wired into the store.
- Quality pipeline (`quality:scan`, `quality:gate`, `quality`) with honest SonarQube reporting.

## E. Incomplete Phases

| Phase | Missing competency |
|---|---|
| 006.1 | Gitleaks not installed (security gate is a no-op); no coverage threshold |
| 009 | Spring Boot 4.1 curriculum does not exist — only a Java page and code blocks |
| M1–M6 | No UI, no store slice, no persistence, no route wiring |
| P0-1.1 | Only M1.1 has the full 11-stage loop; M1.2/M1.3 partially; M1.4–M2.6, M3.1–M3.7 have data but no loop UI |
| — | No capstone, no incident lab UI, no AWS AIF-C01 curriculum, no system design UI |

---

## F. Missing Capabilities

| ID | Capability | Required by charter | State |
|---|---|---|---|
| CAP-01 | Microservices learning surface | §9, §15 | **MISSING** (data exists, UI does not) |
| CAP-02 | System Design exercises (9 systems) | §16 | **MISSING** (seed data exists, orphaned) |
| CAP-03 | Incident lab / production debugging drills | §18 | **MISSING** (seed data + M6 data exist, no UI) |
| CAP-04 | AWS AIF-C01 preparation track | §22 | **MISSING** (nav + placeholder only) |
| CAP-05 | Senior capstone | §26, §41 | **MISSING** |
| CAP-06 | Senior Defense question bank | §40 | **THIN** — 3 questions, 100 required |
| CAP-07 | Full 180-day roadmap spec | §1 | **THIN** — 22 of 180 days specified |
| CAP-08 | Project-based learning progression L1–L7 | §25 | **PARTIAL** — seed `ProjectFeature` only, no UI |
| CAP-09 | Security exercises | §20 | **PARTIAL** — M5.2 curriculum, no UI |
| CAP-10 | E2E / regression UI tests | §17 | **MISSING** — no Playwright |
| CAP-11 | CI pipeline | §29 | **MISSING** |
| CAP-12 | Backend runtime | AGENTS.md | NOT STARTED (honestly documented) |

## G. Technical Debt

| ID | Debt | LOC / count |
|---|---|---:|
| DEBT-01 | React migration residue (`src/App.tsx`, `src/main.tsx`, `src/context/`, `src/components/**`) | 28 files |
| DEBT-02 | ESLint warnings (unused imports/vars) | 144 |
| DEBT-03 | Orphaned seed exports | 3 (`INITIAL_SYSTEM_DESIGN_PROBLEMS`, `INITIAL_CLAUDE_CODE_EXERCISES`, `INITIAL_ENGLISH_SESSIONS`) |
| DEBT-04 | Orphaned engines | 3 (`microservices`, `stateValidation`, `incidentEngine`) |
| DEBT-05 | Orphaned doc-comment stub in store (`addTask` doc orphaned above `recordReviewAnswer`) | 1 |
| DEBT-06 | Mojibake in `vite.config.ts` comment (`â€"`) | 1 |
| DEBT-07 | Indentation damage from a failed mid-write commit (store, router, navigation) | 3 files |
| DEBT-08 | Package identity still `react-example` | 1 |
| DEBT-09 | Empty engine file `src/engines/incidentEngine.ts` | 0 LOC |
| DEBT-10 | 4 dead npm phase scripts referencing non-existent paths/commands | 4 |

## H. Learning-System Audit

**Canonical loop**: `LEARN → DESIGN → BUILD → BREAK → DEBUG → OPTIMIZE → EXPLAIN → DEFEND → REVIEW → INTERVIEW`

| Loop stage | Implemented for Java M1.1 | Java M1.4–M3.7 | AI track | English | Microservices |
|---|---|---|---|---|---|
| LEARN | yes | data only | yes | yes | data only |
| DESIGN | yes | data only | yes | partial | data only |
| BUILD | yes (code blocks) | data only | partial | no | data only |
| BREAK | yes (JavaFailureLab) | data only | partial | no | data only |
| DEBUG | yes | data only | partial | no | data only |
| OPTIMIZE | yes | data only | no | no | data only |
| EXPLAIN | yes (12-part framework) | data only | yes | yes | data only |
| DEFEND | yes | data only | yes | yes | data only |
| REVIEW | yes (SM-2) | no | no | no | no (engine exists) |
| INTERVIEW | partial | no | yes | yes | no |

**Verdict**: the loop is genuinely implemented for **one** module (Java M1.1) and partially for two more. For 20 Java modules, 40 microservices modules, 9 AI tracks and 10 English sections the loop exists as *data only*.

## I. Java Core Audit

| Topic | Coverage |
|---|---|
| syntax / OOP / inheritance / composition | data (M1.1) |
| generics / collections | data (M1.4–M1.7) |
| equals/hashCode / immutability | data |
| records | data + full loop (M1.2 subject) |
| sealed classes | **full loop** (P0-1.2) |
| pattern matching | full loop (P0-1.3) |
| exceptions | data |
| functional / streams / Optional | data (M1.5) |
| I/O / NIO | data (M1.6) |
| JVM heap/stack/metaspace/GC/JIT/classloading | data (M2.1–M2.6) — **no GC/JFR/heap-dump lab** |
| JMM happens-before/volatile/CAS/atomics | data (M3.1–M3.7) — **no lab** |
| Virtual threads | data (M3.x) — **no lab** |
| Java 21→25 migration guidance | absent |

**Missing (P1)**: hands-on labs for JVM profiling (JFR, heap dumps, GC logs), JMM visibility/atomicity reproductions, virtual-thread pinning and carrier-starvation drills. These are exactly the §11 `REPRODUCE → OBSERVE → EXPLAIN → FIX → VERIFY` requirements.

## J. Spring Boot Audit

**No Spring Boot curriculum exists.** `.ai/CURRENT.md:9` claims Phase 009 delivered "Java 25 / Spring Boot 4.1", but `phase-009.md` records only `CodeBlock.vue`, `canonicalStandards.ts` and a 6-stage Java loop. The route `/learning/spring` is a placeholder.

Missing entirely: Spring Core, DI, bean lifecycle, configuration, profiles, validation, REST, exception handling, transactions, Spring Security, caching, scheduling, async, actuator, observability, testing. This is a **P1 capability gap** against the platform's stated target.

## K. Database / JPA Audit

No SQL/JPA curriculum. `/learning/databases` is a placeholder. Distributed-systems M1/M2 reference data stores but no SQL/indexing/transaction/isolation/MVCC/N+1 teaching. **P1 gap.**

## L. REST/API Audit

No dedicated REST curriculum. M4/M5 reference REST contracts. **P1 gap.**

## M. Concurrency Audit

Data exists in `phaseM1.ts` (M3.x modules). No labs, no reproductions, no UI. **P1 gap.**

## N. Distributed Systems Audit

Strongest content asset: `phaseM1.ts`–`phaseM6.ts` (7,163 LOC, ~40 modules) covering CAP, replication, outbox, saga, idempotency, circuit breakers, bulkheads, tracing, SLO/error budgets, incident response — with a `REAL_EXECUTABLE / SIMULATED / SPECIFICATION` honesty contract. **But entirely unreachable from the UI.** This is simultaneously the project's greatest strength and its greatest defect.

## O. Security Audit

| Control | State |
|---|---|
| Secret scanning | **NO-OP** — Gitleaks NOT INSTALLED, gate still reports PASS (P1) |
| AuthN/AuthZ teaching | M5.2 curriculum only, unreachable |
| CSRF/CORS/SQLi/XSS/SSRF/Path-traversal/Deserialization | no exercises (P1) |
| Dependency vulnerability scanning | absent |
| PII logging guidance | M6.1 curriculum, unreachable |
| Client-side secrets | none found in `src/` |

## P. Testing Audit

| Requirement | State |
|---|---|
| Unit tests | 176 across 18 files, all pass |
| Behavioural assertions | mostly yes |
| **Regression tests for the persistence bug** | **ABSENT** — the bug in §J survived because the test named "persists topic completion" never reloads (P0) |
| Integration / E2E | absent |
| Coverage collection | `@vitest/coverage-v8` installed, **never run**, no threshold (P2) |
| Concurrency tests | n/a (no backend) |
| Vacuous tests | ≥1 confirmed (`aiKnowledge.test.ts:170`); likely more of the same shape |

## Q. Performance Audit

M6 curriculum covers Golden Signals, quantiles, SLI/SLO. No measurement labs, no JMH. **P1 gap.**

## R. Observability Audit

M6 covers structured logging, W3C traceparent, Micrometer, Prometheus, error budgets. Unreachable. **P1 gap.**

## S. DevOps / AWS Audit

`.ai/knowledge/aws.md` exists as prose. `/certifications/aws/aif-c01` is a placeholder. No AWS curriculum data, no exam questions, no UI. `AGENTS.md` rule "never label generated exam questions as real AWS exam questions" is currently satisfied **by absence of questions**. **P1 gap.**

## T. System Design Audit

`INITIAL_SYSTEM_DESIGN_PROBLEMS` exists in `seedData.ts:893` with 2 problems, imported by nobody. `/learning/system-design` is a placeholder. Required: 9 systems with requirements → scale → architecture → API → data model → consistency → failure modes → security → observability → capacity → trade-offs → alternatives → ADR → defense. **P1 gap.**

## U. Code Quality Audit

| Check | Result |
|---|---|
| TypeScript strict | pass, 0 errors |
| `any` in new code | 3 warnings (`stateValidation.ts:91,115`, `sm2.test.ts:126`) |
| `as any` / `@ts-ignore` / `eslint-disable` | none found |
| TODO / FIXME / HACK | none found |
| Dead code | `incidentEngine.ts` (empty), orphaned doc-comment stub |
| Duplicated logic | `INITIAL_*` seed arrays copied by reference (`.filter` not used → shared mutation risk) |
| Dead links | `/learning/microservices` → placeholder while nav promises a track |

## V. Senior Interview Readiness

`INITIAL_INTERVIEW_QUESTIONS` = **3 questions** (G1 GC, REQUIRES_NEW vs NESTED, cache stampede). Charter §40 requires 100 with follow-ups. `/interview` renders these 3. **P1 major gap.**

## W. Technical English Readiness

`technicalEnglish.ts` (665 LOC) + `EnglishPage.vue` + `EnglishQuiz.vue` (5-question MCQ). Coverage of collocations, speaking prompts, misconceptions, Vietnamese notes. **Sufficient for its scope** — per §23, keep frozen. Do not expand blindly.

## X. Production Readiness

Not applicable in the conventional sense: there is no deployable service. The platform itself is a static Vite bundle. For a learning platform this is acceptable; what is **not** acceptable is presenting simulated telemetry as production evidence — the honesty contract already prevents this, which is good.

## Y. Architecture Risks

| Risk | Severity | Detail |
|---|---|---|
| R-1 | P0 | Microservices curriculum is a **content silo with no consumer**. Every future M-phase adds unreachable weight. |
| R-2 | P0 | Progress loss on reload destroys the learner's sense of progress and silently invalidates competency scores. |
| R-3 | P1 | Single 569-line store owns everything; adding microservices state inline will push it past 900 lines. |
| R-4 | P1 | React reference tree still compiles into the bundle graph (`@vitejs/plugin-react` active). Retired slices are not actually retired. |
| R-5 | P1 | Security gate silently passes with no scanner installed — false assurance. |
| R-6 | P2 | No CI: every regression like the truncated commit ships undetected. |
| R-7 | P2 | `package.json` identity and scripts contradict reality, so tooling reports wrong things. |

## Z. Recommended Execution Plan

```text
R2S-REM-01  [P0] Repository integrity recovery (truncated files, type error, lint errors)   DONE
R2S-REM-02  [P0] State integrity: persist all learner progress + honest DEMO labelling       DONE
R2S-REM-03  [P0] Microservices reachability: page + store slice + persistence + tests       DONE
R2S-REM-04  [P1] Orphaned data recovery: System Design surface on an existing route         PLANNED
R2S-REM-05  [P1] Interview engine expansion (100 questions with follow-ups)                  PLANNED
R2S-REM-06  [P1] Security gate honesty: fail closed when Gitleaks is absent                 PLANNED
R2S-REM-07  [P1] Dead scripts + package identity + README                                   PLANNED
R2S-REM-08  [P2] ESLint warning burn-down                                                   PLANNED
R2S-REM-09  [P1] CI workflow (typecheck/test/build on push)                                 PLANNED
R2S-REM-10  [P2] Coverage threshold                                                        PLANNED
```

---

## Appendix — Finding Register

| ID | Sev | Area | Finding | Status |
|---|---|---|---|---|
| R2S-001 | P0 | Repository integrity | `90287fd` truncated `src/data/microservices/index.ts` and `.ai/phases/phase-M5.md` to 0 bytes; committed broken | **REMEDIATED** |
| R2S-002 | P0 | Typecheck | `phaseM6.ts:339` used `'performance'`, not in `MsAssessmentQuestionType` | **REMEDIATED** |
| R2S-003 | P0 | Lint | 6 × `no-useless-escape` errors in `phaseM5.ts`/`phaseM6.ts` | **REMEDIATED** |
| R2S-004 | P0 | Reachability | `src/engines/microservices.ts` (736 LOC, 26 exports) + 7,163 LOC curriculum has zero production callers | **REMEDIATED** (R2S-REM-03) |
| R2S-005 | P0 | Persistence | `saveToStorage()` omitted `completedAiTopicIds`, `completedEnglishItemIds`, `completedJavaModuleIds`, `javaModuleStageProgress`, `javaModuleAssessmentScores` — all progress lost on reload | **REMEDIATED** (R2S-REM-02) |
| R2S-006 | P0 | Honesty | `currentDay=37`, `streak=14`, `studyTimeMinutes=142` rendered as real learner progress with no DEMO label | **REMEDIATED** (R2S-REM-02) |
| R2S-007 | P0 | Test quality | `aiKnowledge.test.ts:170` "persists topic completion" never reloads the store — the bug it claims to cover went undetected | **REMEDIATED** (R2S-REM-02) |
| R2S-008 | P1 | Orphaned data | `INITIAL_SYSTEM_DESIGN_PROBLEMS`, `INITIAL_CLAUDE_CODE_EXERCISES`, `INITIAL_ENGLISH_SESSIONS` imported by nobody | OPEN |
| R2S-009 | P1 | Orphaned engine | `stateValidation.ts` reachable only from React reference tree | OPEN |
| R2S-010 | P1 | Dead file | `src/engines/incidentEngine.ts` is 0 bytes | OPEN |
| R2S-011 | P1 | Security gate | Gitleaks NOT INSTALLED yet gate reports PASS | OPEN |
| R2S-012 | P1 | Interview | 3 questions vs 100 required | OPEN |
| R2S-013 | P1 | Roadmap | 22 of 180 days specified | OPEN |
| R2S-014 | P1 | Dead scripts | `phase-008` → nonexistent `backend/`; `phase-009` → nonexistent `test:e2e`; `phase-011` → nonexistent `docker:build`,`ci:deploy` | OPEN |
| R2S-015 | P1 | Docs | No README | OPEN |
| R2S-016 | P1 | CI | No `.github/workflows` | OPEN |
| R2S-017 | P1 | Curriculum | No Spring Boot / Database / REST / Kafka / Redis curriculum despite AGENTS.md focus domains | OPEN |
| R2S-018 | P1 | AWS | No AIF-C01 curriculum (nav + placeholder only) | OPEN |
| R2S-019 | P1 | Capstone | No senior capstone artifacts | OPEN |
| R2S-020 | P2 | React residue | `@vitejs/plugin-react` active; 28 React files in graph | OPEN |
| R2S-021 | P2 | Lint | 144 warnings | OPEN |
| R2S-022 | P2 | Coverage | No threshold, coverage never collected | OPEN |
| R2S-023 | P2 | E2E | No Playwright | OPEN |
| R2S-024 | P2 | Identity | `package.json` name `react-example` | OPEN |
| R2S-025 | P2 | Code health | Mojibake comment in `vite.config.ts` | OPEN |
| R2S-026 | P3 | Store | Orphaned doc-comment stub above `recordReviewAnswer` | OPEN |
| R2S-027 | P3 | Seed | `.filter` not used when copying seed arrays → shared-reference mutation risk | OPEN |
| R2S-028 | P3 | Routing | `/review` declared twice in route table (lint warning) | OPEN |
