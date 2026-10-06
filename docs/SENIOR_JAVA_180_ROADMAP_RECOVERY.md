# SENIOR JAVA 180 — ROADMAP RECOVERY (P10/P11)

Date: 2026-10-06 · Scope: forensic audit + recovery + integration + real-browser validation.
Spec: `docs/SENIOR JAVA 180 — P10P11 FULL ROADMAP RECOVERY → CONNECT ALL PHASES → REAL BROWSER GOLDEN PATH → AUTO-FIX → PASS.md`

## 1. CURRENT STATE (verified in repo, no invented content)

| Registry | Canonical source | Count | State |
|---|---|---|---|
| 180-day roadmap days | `src/data/seedData.ts` → `INITIAL_ROADMAP_DAYS` → Pinia `roadmapDays` | **24 curated day specs** (Days 1–10, 15, 30, 31, 37, 45, 60, 65, 75, 85, 95, 105, 115, 130, 160) | REAL, sparse |
| Java Core modules | `src/data/javaCoreCurriculum.ts` → `JAVA_CORE_MODULES_METADATA` | **20 modules** (Pillar 1: 7 Language, Pillar 2: 6 JVM, Pillar 3: 7 Concurrency). **1.1/1.2/1.3 active** (full 11-stage content + assessment + failure lab); **1.4–3.7 LOCKED** with prerequisites + learning objectives | REAL |
| Microservices modules | `src/data/microservices/{phaseM1..M6}.ts` → `ALL_MS_MODULES` | **22 modules** (M1: 3, M2: 3, M3: 3, M4: 2, M5: 6, M6: 5) + 8 open incidents | REAL |
| Judgment scenarios | `src/data/judgmentScenarios.ts` | 8 scenarios | REAL |
| incidentEngine / sm2 / competency / certificationEngine | `src/engines/*` | deterministic, evidence-gated | REAL |
| Unimplemented tracks | router `PagePlaceholder` (Spring, Kafka, Redis, Databases, System Design, Build, Architecture, AWS AIF-C01, Review sub-pages) | 12 honest placeholders | HONEST, no fake data |

## 2. ROADMAP GRAPH

```
CommandCenter (/) ── nextAction ─▶ /learning/microservices | /review | /learning/java | /interview
Roadmap (/learning/roadmap + alias /senior-java-180)
 ├── 6 phase filters P1–P6 ─▶ 24 day cards ─▶ day-detail drawer ─▶ Switch Workspace ─▶ /today
Java (/learning/java): 20 modules ─▶ 11-stage loop (learn→…→assess) ─▶ failure lab + assessment(≥80% + break) ─▶ persisted
Microservices (/learning/microservices): 22 modules, prereq chain M1.1→…→M6.5 ─▶ loop stages + incidents ─▶ persisted
Judgment (/engineering/judgment) ─▶ persisted judgmentRecords
Certification (/certifications/senior-engineering) ─▶ pure derivation, never stored
Review (/review, SM-2) · Interview (/interview) · English (/english) · AI (/learning/ai) · Settings (/settings)
```

Node identity: stable string IDs everywhere (`dayNumber`, `1.1`, `M5.3`, `card-1`); no array-index identity.

## 3. PHASE INVENTORY (Technical-Core-First classification)

- **CORE:** Java Core P0 (20 modules) → Spring/DB/REST/Concurrency via 180-day days 1–60 + Java pillars. Completed first, never blocked by infra.
- **ADVANCED:** Microservices M1–M6 (22 modules), incident lab, judgment lab, system-design days 101–125, DSA 126–150, interview 151–180.
- **OPTIONAL:** English track (E01 done), AI Knowledge track (done).
- **INFRASTRUCTURE (not blocking core):** Kubernetes/Cloud content lives *inside* the MS capstone narrative only. **No `phaseM7.ts`, no `MS_M7_*`, no `KubernetesCloudPage.vue` exist** — `MsPhaseId` admits `'M7'|'M8'` as future extension, but `ALL_MS_*` aggregates M1–M6 only, so nothing depends on M7. M7 = PLANNED, explicitly non-blocking.

## 4. LESSON INVENTORY — see §1. MISSING_CURRICULUM (honest, not synthetic)

156 of 180 day-slots have no curated spec; Java 1.4–3.7 are LOCKED roadmap entries (objectives + prereqs, no content). Per spec §2 these are recorded as **MISSING_CURRICULUM**, surfaced in-UI by `curriculum-coverage-note` on the roadmap. Nothing was invented to fill them.

## 5. BROKEN LINKS FOUND → ROOT CAUSES → FIXES

| # | Broken link | Root cause | Fix (file) |
|---|---|---|---|
| 1 | **M5.3 permanently LOCKED** — prerequisite `M4.4` references a module that does not exist (M4 ships only M4.1/M4.2). `getModuleStatus` requires *every* prereq in `completedModuleIds`, so M5.3 + everything downstream-gated could never unlock: orphan/dead-end graph node (§33/§34 violation) | Stale cross-ref to a planned-but-never-authored M4.4 Outbox module | `src/data/microservices/phaseM5.ts`: `['M5.2','M4.4']` → `['M5.2','M4.2']` (M4.2 is the latest real M4 foundation; payment idempotency builds on concurrency-correct services + M5.2 security). Regression test added in `src/engines/__tests__/microservices.test.ts` (all prereqs resolve; M5.3 unlocks) |
| 2 | Same stale `M4.4` ref inside an M4.1 Kotlin code-sample comment | Copy of the same planned-number reference | `src/data/microservices/phaseM4.ts`: comment → `(outbox relay)` |
| 3 | No discoverable `SENIOR JAVA 180` entry route (§12) | Router only had `/learning/roadmap` | `src/vue/router/index.ts`: added `/senior-java-180 → /learning/roadmap` redirect (pure alias, no duplicate page). Browser-verified |
| 4 | Roadmap header claims 180 days while store holds 24 curated specs (potential fake-progress reading) | Sparse seed presented without coverage disclosure | `src/vue/pages/RoadmapPage.vue`: additive `curriculum-coverage-note` (counts rendered days, names active/locked tracks, cites MISSING_CURRICULUM). No existing testid/text changed |
| 5 | Lint debt: unused `ReviewPage` static import in router; 10 unused icon imports + unused `ProgressBar` in LearningJavaPage; dead `statusLabel` in TodayViewPage | Leftover imports | Removed (12 fewer warnings: 145 → 133, 0 errors). No behavior change |

Not changed (audited, compliant as-is): Java stage tabs are content navigation — grading evidence comes only from failure lab + assessment (≥80 % + break required, no auto-PASS); MS stages record via store actions; certification is pure derivation; placeholders stay honest; `|| first-module` fallbacks are internal defaults, not user-facing silent substitution (invalid *routes* render the honest placeholder).

## 6. LEARNING FLOW (browser-verified)

Command Center (DAY 37, nextAction=Triage P0 incident) → Roadmap (24 day cards, P1 filter→12, search, day drawer, workspace switch→/today) → Java (20 modules, 1.1–1.3 content, 11 stages navigable, 1.4+ LOCKED) → Microservices (22 modules, 8 open incidents, competency from evidence, 0/22 honest start) → Judgment → Certification (NOT_CERTIFIED without evidence) → Review (SM-2) → Interview. Invalid route → honest placeholder, no crash.

## 7. PERSISTENCE FLOW

Single key `SENIOR_JAVA_180_STATE_V1`, additive evidence keys, version-tolerant readers (absent/corrupt ⇒ "no evidence", never fabricated). Verified: stage/assessment writes persist across reload; corrupted payload ⇒ app shell survives (graceful error state with retry, no blank crash); day-37 workspace switch persists.

## 8. CERTIFICATION FLOW

`certificationEngine.evaluateCertification` derives 13 dimensions from persisted evidence on every access; nothing stored, no UI-% shortcut. Current verdict NOT_CERTIFIED by design (Leadership has no evidence source — unchanged).

## 9. BROWSER EVIDENCE (real browser, headless patchright, dev server :5199)

- Golden-path script: open → roadmap (24 cards) → phase filter → day 37 → Java (LEARN+ASSESS present) → MS (22 modules) → judgment → certification → review → interview → invalid-route graceful → storage keys present. **0 console errors, 0 failed requests.**
- Lesson/persistence script: Java strict gate intact, MS track renders, reload preserves state.
- Alias/responsive/a11y/error script: `/senior-java-180` → `#/learning/roadmap` with coverage note; **0 horizontal overflow at 360/768/1440**; h1=1, all buttons named, 0 img missing alt; corrupted-state reload = no crash; navigation timing ~150 ms.

## 10. REGRESSION RESULTS

`typecheck` PASS · `vitest` **22 files / 247 tests PASS** (245 + 2 new prereq-integrity tests) · `eslint` 0 errors · `vite build` PASS.

## 11. REMAINING BLOCKERS (honest, non-P0)

- 156/180 day specs + Java 1.4–3.7 content + P10 Claude-Code-Labs slice + P11 Analytics slice = MISSING_CURRICULUM (planned, never faked).
- True CERTIFIED verdict blocked until a leadership evidence source exists (pre-existing, Phase S).
- None of these block the golden path: every implemented phase is reachable, graded on real evidence, and persists.
