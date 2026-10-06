# SENIOR_ENGINEERING_REACHABILITY_AUDIT

Mission §11 requires every capability to have:
`implementation → service/domain → actual production caller → UI/API/workflow → persistence → test → evidence`
and states that **test-only callers, documentation and dead code do not count**.

Audit date: 2026-10-05

---

## 1. THE FINDING THAT MATTERED

Before this execution, `src/vue/router/index.ts` mapped:

```ts
{ path: '/learning/microservices', component: PagePlaceholder, meta: { title: 'Microservices' } }
```

That single line made **7,163 lines** of senior-level curriculum (`src/data/microservices/phaseM1..M6.ts`)
and a **736-line deterministic engine** (`src/engines/microservices.ts`) unreachable. The engine's
`selectMsNextAction()` returned `targetRoute: '/learning/microservices'` on seven of its eight branches —
so the one production-quality recommendation engine in the repository routed every learner into a
"Coming next" placeholder.

Its only caller was `src/engines/__tests__/microservices.test.ts` — which §11 explicitly disqualifies.

---

## 2. PER-CAPABILITY REACHABILITY AFTER REMEDIATION

Legend: ✔ implementation · S service/domain · C production caller · U UI · P persistence · T test · E evidence

| Capability | ✔ | S | C | U | P | T | E |
|---|---|---|---|---|---|---|---|
| Microservices curriculum M1–M6 (7,163 lines) | ✔ | `src/data/microservices/*` | `MicroservicesPage.vue` | `/learning/microservices` | `msProgress` on `SENIOR_JAVA_180_STATE_V1` | `microservicesTrack.test.ts` | stages, code labs, failure labs, benchmarks, designs, assessments, self-scores, AI challenges |
| Microservices engine (736 lines) | ✔ | `src/engines/microservices.ts` | store actions `recordMs*` + page getters | derived on the page | same record | `microservices.test.ts` + track tests | derived status / competency / track progress |
| Failure labs (BREAK stage) | ✔ | `MsFailureLabSpec` | `MicroservicesPage.vue` BREAK tab | `ms-open-lab-*` → `ms-lab-runner` | `failureLabsPassed` | failure-lab walkthrough test | passed lab ids + attempt count |
| Production incidents + triage | ✔ | `engines/incidentEngine.ts` + `MsIncident` | same page, INCIDENTS tab | `ms-open-incident-*` → `ms-triage-runner` | `incidentsResolved` | `incidentEngine.test.ts` (21 tests) + 2 page tests | resolved incident ids |
| Postmortem capture | ✔ | `gradeIncidentTriage` + `MsIncident.postmortem` | same page, POSTMORTEM step | `ms-postmortem-note` → `ms-postmortem-submit` | resolution persisted | `incidentEngine.test.ts` | incident resolution record |
| Code labs (CODE stage) | ✔ | `MsCodeLab` | LABS tab | `ms-complete-lab-*` | `codeLabCompletions` | track tests | completed lab ids |
| Benchmarks (OPTIMIZE) | ✔ | `MsBenchmarkSpec` | LABS tab | `ms-complete-benchmark` | `benchmarksCompleted` | typecheck + store persistence tests | completed benchmark titles |
| Architecture challenges (DESIGN) | ✔ | `MsArchitectureChallenge` | DESIGN tab | `ms-submit-design` | `designsCompleted` | certification design test | completed challenge ids |
| Assessments (ASSESS) | ✔ | `scoreMsAssessment` | ASSESS tab | `ms-submit-assessment` | `assessmentScore` | deterministic grading via engine tests | graded percent |
| Senior defense (DEFEND) | ✔ | `MsDefenseQuestion.rubric` | DEFEND tab | `ms-defense-score-*` | `defenseScore` | typecheck + certification test | self-score ≥ 80 counted as defense evidence |
| AI-assisted review | ✔ | `MsAiReviewTask` | AI REVIEW tab | `ms-ai-verified` | `aiChallengesCompleted` | page render test | verified-challenge count |
| Competency matrix (12 dimensions) | ✔ | `calculateMsCompetencies` | page | `ms-competency-*` | derived | page render test | derived from module evidence |
| Phase A — Engineering Judgment | ✔ | `src/engines/judgmentEngine.ts` | `EngineeringJudgmentPage.vue` | `/engineering/judgment` | `judgmentRecords` | `judgmentLab.test.ts` (20 tests incl. the 4-level ladder) | per-scenario level, score, calibration |
| Phase Z — Certification (13 dimensions) | ✔ | `src/engines/certificationEngine.ts` | `CertificationPage.vue` | `/certifications/senior-engineering` | derived (never stored) | `certification.test.ts` | recorded ÷ available per dimension |
| Java Core track | ✔ | `javaCoreCurriculum.ts` | `LearningJavaPage.vue` | `/learning/java` | **fixed** — now persisted | `learningJava.test.ts` + new persistence tests | stage progress + scores |
| AI track | ✔ | `aiSeniorJava.ts` | `AIKnowledgePage.vue` | `/learning/ai` | **fixed** — now persisted | `aiKnowledge.test.ts` + persistence test | completed topic ids |
| Technical English | ✔ | `technicalEnglish.ts` | `EnglishPage.vue` | `/english` | **fixed** — now persisted | `english.test.ts` + persistence test | completed item ids |
| SM-2 spaced review | ✔ | `src/engines/sm2.ts` | `ReviewPage.vue` | `/review` | `reviewCards` | `sm2.test.ts` | SM-2 intervals |
| Competency engine | ✔ | `src/engines/competency.ts` | store `competencies` | Command Center | `knowledgeTopics` | `competency.test.ts` | dimension scores |

---

## 3. DEAD-END ROUTES ELIMINATED

| Route | Before | After |
|---|---|---|
| `store.nextAction` → `/build/break-debug` | PagePlaceholder | `/learning/microservices` (INCIDENTS tab) |
| `store.nextAction` → `/learning/system-design` | PagePlaceholder | `/interview` (a real page) |

`selectMsNextAction()` in the microservices engine also routes to `/learning/microservices`; that route is
now real, so all eight of its branches terminate.

---

## 4. EVIDENCE-INTEGRITY DEFECT (the deepest reachability problem)

Reachability is worthless if evidence does not survive a reload. Verified defect, now fixed:

`src/vue/stores/learning.ts` `saveToStorage()` persisted 11 fields and **omitted every evidence field**:
`completedJavaModuleIds`, `completedAiTopicIds`, `completedEnglishItemIds`,
`javaModuleStageProgress`, `javaModuleAssessmentScores`. `loadFromStorage()` restored the same 11.

Consequence: completing a Java module, an AI item or an English item was **lost on page refresh**, while
the in-memory array still drove unlock gating — the learner watched progress disappear.

`.ai/CURRENT.md` claimed "persisted to localStorage". Verified false. Documentation corrected.

Fix: **additive** keys on the same `SENIOR_JAVA_180_STATE_V1` record (no version bump, no destructive
migration), tolerant readers that coerce a corrupted field to "no evidence" rather than taking down the
state, and export/import coverage for the Java evidence that was previously dropped on both paths.

Verified by test:
`preserves previously unpersisted Java/AI/English evidence across reloads`.

---

## 5. REMAINING UNREACHABLE CAPABILITIES (honest list)

These are **not** claimed as complete. Each still renders `PagePlaceholder`:

| Route | Missing capability | Gap |
|---|---|---|
| `/learning/spring` | Spring Boot track | GAP-21-class content gap |
| `/learning/kafka` | Kafka runtime lab (consumer-group / rebalance simulator) | GAP-24 |
| `/learning/redis` | Redis cache-stampede lab | GAP-25 |
| `/learning/databases` | Database track | content gap |
| `/learning/system-design` | System Design Defense round (Phase M) | GAP-11 |
| `/build`, `/build/projects` | Project system | content gap |
| `/build/break-debug` | Break & Debug hub (superseded by Microservices INCIDENTS tab) | merged into the microservices route |
| `/architecture` | Architecture Labs hub | content gap |
| `/architecture/aws-patterns` | AWS Engineering (Phase R) | GAP-21 |
| `/architecture/decisions` | ADR engine (Phase N) | GAP-14 |
| `/certifications/aws/aif-c01` | AWS certification prep | GAP-21 |
| `/review/mistakes`, `/review/flashcards`, `/review/progress` | Review sub-views | content gap |

`PagePlaceholder` remains the honest state for these: it says "Coming next" and shows no data. That is the
correct behaviour and it is preserved deliberately.

---

## 6. VERDICT

**PASS for every capability claimed as complete.** Each row in §2 has a production caller in the Vue UI,
persisted evidence, and tests. Nothing in this document is satisfied by a test-only caller, a documentation
sentence, or an unused registry entry.

**NOT claimed:** the routes in §5. They remain honest placeholders and are enumerated as gaps in
`docs/SENIOR_ENGINEERING_MASTERY_FULL_AUDIT.md`.
