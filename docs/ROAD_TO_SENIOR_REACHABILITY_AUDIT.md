# ROAD TO SENIOR 180 — CROSS-DOMAIN REACHABILITY AUDIT

**Audit date**: 2026-10-05
**Rule applied (charter §30)**: a capability is only real if it traverses
`Implementation → Service → Route/UI/Workflow → Actual caller → Persistence → Tests → Evidence`.

**Status legend**: `ORPHANED` · `TEST_ONLY` · `UNREACHABLE` · `PARTIAL` · `REACHABLE` · `CERTIFIED`

---

## 1. Method

For every engine, data asset and route in the repository I traced the import graph
forward (who imports it) and backward (what the UI renders), then classified the result.

```bash
grep -rn "<module>" src/ --include="*.ts" --include="*.vue"
```

The shipped entry point is `src/vue/main.ts` (`index.html:18`). Anything reachable only from
`src/context/LearningContext.tsx` or `src/components/views/*.tsx` is **not shipped** — React is
migration reference per `AGENTS.md`.

---

## 2. Engine reachability

| Engine | LOC | Exports | Production callers | Test callers | Verdict |
|---|---:|---:|---|---|---|
| `src/engines/sm2.ts` | 86 | SM-2 API | `stores/learning.ts` (1) | `sm2.test.ts` | **REACHABLE** |
| `src/engines/competency.ts` | 170 | 5 | `stores/learning.ts` (1) | `competency.test.ts` | **REACHABLE** |
| `src/engines/microservices.ts` | 736 | 26 | **0** | `microservices.test.ts` | was **TEST_ONLY** → now **REACHABLE** |
| `src/engines/stateValidation.ts` | 118 | 2 | **0 in Vue** (2 in React `LearningContext.tsx`) | `stateValidation.test.ts` | **ORPHANED** |
| `src/engines/incidentEngine.ts` | **0** | 0 | 0 | 0 | **DEAD FILE** |

### 2.1 Detail — `microservices.ts` (the critical orphan)

The engine is the most sophisticated logic in the repository: 26 exported functions covering
module unlocking, 12-stage loop progress, 6-dimension competency, SM-2 review-card synthesis,
weakness detection, next-action selection and progress normalisation with backward compatibility.

```text
export const MS_LOOP_STAGES            export function selectMsNextAction
export function createEmptyProgressRecord export function buildMsReviewCard
export function normalizeMsProgressRecords export function findModulesForDimension
export function getModuleStatus        export function calculateMsCompetencies
export function isModuleUnlocked       export function findWeakestMsCompetency
export function computeTrackProgress   export function scoreMsAssessment
… 26 total
```

**Before remediation** the only importer was `src/engines/__tests__/microservices.test.ts`.
The navigation entry `Microservices → /learning/microservices` and the router entry
(`router/index.ts:56`) both rendered `PagePlaceholder.vue`. Six curriculum phases
(7,163 LOC, ~40 modules) were inert data.

**After remediation** (`R2S-REM-03`): `stores/learning.ts` owns the M1–M6 progress records and
exposes store actions that call the engine; `pages/MicroservicesPage.vue` renders the track;
`router/index.ts` lazy-loads it; progress persists under `SENIOR_JAVA_180_STATE_V1`.

---

## 3. Data-asset reachability

| Asset | LOC | Imported by | Rendered by | Verdict |
|---|---:|---|---|---|
| `data/microservices/phaseM1–M6.ts` | 7,163 | `stores/learning.ts` | `MicroservicesPage.vue` | **REACHABLE** (was ORPHANED) |
| `data/javaCoreCurriculum.ts` | 2,036 | `LearningJavaPage.vue` | `/learning/java` | **REACHABLE** |
| `data/aiSeniorJava.ts` | 683 | store + page | `/learning/ai` | **REACHABLE** |
| `data/technicalEnglish.ts` | 665 | store + page + quiz | `/english` | **REACHABLE** |
| `data/canonicalStandards.ts` | 298 | Java page | `/learning/java` | **REACHABLE** |
| `seedData.INITIAL_ROADMAP_DAYS` | 326 | store | `/learning/roadmap` | **REACHABLE** |
| `seedData.INITIAL_TASKS` | 89 | store | `/today`, `/` | **REACHABLE** |
| `seedData.INITIAL_KNOWLEDGE_TOPICS` | 180 | store | `/` (competencies) | **REACHABLE** |
| `seedData.INITIAL_REVIEW_CARDS` | 83 | store | `/review` | **REACHABLE** |
| `seedData.INITIAL_DSA_PROBLEMS` | 200 | store | store only — **no page** | **PARTIAL** |
| `seedData.INITIAL_PROJECT_FEATURES` | 84 | store | store only — **no page** | **PARTIAL** |
| `seedData.INITIAL_INCIDENTS` | 87 | store | store only (`nextAction` only) | **PARTIAL** |
| `seedData.INITIAL_INTERVIEW_QUESTIONS` | 50 | store | `/interview` | **REACHABLE** (thin) |
| `seedData.INITIAL_SYSTEM_DESIGN_PROBLEMS` | 161 | **nobody** | **nobody** | **ORPHANED** |
| `seedData.INITIAL_CLAUDE_CODE_EXERCISES` | 66 | **nobody** | **nobody** | **ORPHANED** |
| `seedData.INITIAL_ENGLISH_SESSIONS` | 39 | **nobody** | superseded by `technicalEnglish.ts` | **ORPHANED** |

---

## 4. Route reachability

| Route | Component | Verdict |
|---|---|---|
| `/` | `CommandCenterPage.vue` | REACHABLE |
| `/today` | `TodayViewPage.vue` | REACHABLE |
| `/learning/roadmap` | `RoadmapPage.vue` | REACHABLE |
| `/learning/java` | `LearningJavaPage.vue` | REACHABLE |
| `/learning/ai` | `AIKnowledgePage.vue` | REACHABLE |
| `/learning/microservices` | `MicroservicesPage.vue` | REACHABLE (was PLACEHOLDER) |
| `/interview` | `InterviewPage.vue` | REACHABLE (3 questions only) |
| `/review` | `ReviewPage.vue` | REACHABLE |
| `/settings` | `SettingsPage.vue` | REACHABLE |
| `/english` | `EnglishPage.vue` | REACHABLE |
| `/learning/spring` | `PagePlaceholder.vue` | UNREACHABLE — honest placeholder |
| `/learning/kafka` | `PagePlaceholder.vue` | UNREACHABLE — honest placeholder |
| `/learning/redis` | `PagePlaceholder.vue` | UNREACHABLE — honest placeholder |
| `/learning/databases` | `PagePlaceholder.vue` | UNREACHABLE — honest placeholder |
| `/learning/system-design` | `PagePlaceholder.vue` | UNREACHABLE — **orphaned seed data exists** |
| `/build`, `/build/projects`, `/build/break-debug` | `PagePlaceholder.vue` | UNREACHABLE — **incident + project seed data exist** |
| `/architecture/*` | `PagePlaceholder.vue` | UNREACHABLE |
| `/certifications/aws/aif-c01` | `PagePlaceholder.vue` | UNREACHABLE |
| `/review/mistakes`, `/review/flashcards`, `/review/progress` | `PagePlaceholder.vue` | UNREACHABLE |

**Honesty note**: placeholders that admit "not built" are *correct* under `AGENTS.md`
("missing real data renders 'No data yet', never synthetic records"). Placeholders that hide
existing data are the defect. `/learning/system-design`, `/build/*` are the latter.

---

## 5. Persistence chain (the second critical defect)

`SENIOR_JAVA_180_STATE_V1` write path, before remediation:

```ts
// src/vue/stores/learning.ts:69
const payload = {
  currentDay, streak, studyTimeMinutes,
  tasks, roadmapDays, knowledgeTopics, reviewCards,
  dsaProblems, projectFeatures, incidents, interviewQuestions,
};
```

Fields **written but never read back**, and never persisted:

| Field | Persisted | Restored on reload | Result |
|---|---|---|---|
| `completedAiTopicIds` | no | no | **progress lost** |
| `completedEnglishItemIds` | no | no | **progress lost** |
| `completedJavaModuleIds` | no | no | **progress lost** |
| `javaModuleStageProgress` | no | no | **progress lost** |
| `javaModuleAssessmentScores` | no | no | **progress lost** |

`loadFromStorage()` never restores these five fields, so every AI topic, English item and Java
module marked complete reverted to incomplete on refresh — silently, with no error.

It survived because `aiKnowledge.test.ts:170` is named
*"tracks and persists topic completion in Pinia store"* but never reloads the store; it toggles
the same item twice and asserts it returns to `0/9`. The test name claims coverage the body
does not provide — the exact defect charter §17 rejects.

**After remediation** all eleven progress fields round-trip, the M6 microservices records
round-trip through `normalizeMsProgressRecords`, and `isDemoState` is persisted so a demo-seeded
workspace stays labelled as demo instead of masquerading as learner evidence.

---

## 6. Critical-capability verdicts

| Capability | Chain | Verdict |
|---|---|---|
| Spaced repetition | `sm2.ts` → `recordReviewAnswer` → `/review` → localStorage → `sm2.test.ts` | **CERTIFIED** |
| Competency model | `competency.ts` → `competencies` computed → `CommandCenterPage` → localStorage → `competency.test.ts` | **REACHABLE** |
| Task management | store actions → `TodayViewPage` → localStorage → `todayView.test.ts` | **CERTIFIED** |
| Java Core track | curriculum → `LearningJavaPage` → store → localStorage → `learningJava.test.ts` | **REACHABLE** (loop only for M1.1–M1.3) |
| **Microservices track** | curriculum → `MicroservicesPage` → store → localStorage → `microservicesView.test.ts` | **REACHABLE** (was TEST_ONLY) |
| AI track | `aiSeniorJava.ts` → `AIKnowledgePage` → store → localStorage → `aiKnowledge.test.ts` | **REACHABLE** (persistence now real) |
| Technical English | `technicalEnglish.ts` → `EnglishPage` → store → localStorage → `english.test.ts` | **REACHABLE** |
| Incident drills | seed + M6 data → **no UI** | **UNREACHABLE** |
| System design | seed data → **no UI** | **UNREACHABLE** |
| Project-based learning | seed `ProjectFeature` → store → **no UI** | **UNREACHABLE** |
| Interview defense | 3 questions → `InterviewPage` | **PARTIAL** |

---

## 7. Rule for future phases (charter §30 enforcement)

> Every engine and curriculum asset added in a future phase MUST have at least one
> legitimate **non-test production caller** in the same commit that introduces it,
> or the phase is not certifiable.

This rule is what `R2S-REM-01 → R2S-REM-03` exists to repair: four consecutive microservice
phases (M3–M6) were certified on file existence alone.
