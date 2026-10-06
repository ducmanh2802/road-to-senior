# Phase P0-W1 — Reachability Remediation & Evidence Integrity

Date: 2026-10-05
Type: P0 remediation wave (precedes Phases A–Z)
Status: COMPLETE

## Context

`docs/SENIOR_ENGINEERING_MASTERY_FULL_AUDIT.md` found that the repository's largest asset was
invisible. `src/vue/router/index.ts` mapped `/learning/microservices` to `PagePlaceholder`, which made
7,163 lines of six-phase senior curriculum (`src/data/microservices/phaseM1..M6.ts`) and a 736-line
deterministic engine (`src/engines/microservices.ts`) unreachable. The engine's only caller was a test —
which mission §11 explicitly disqualifies.

The audit also found a deeper defect: **evidence was destroyed on reload**.
`saveToStorage()` persisted 11 fields and omitted every evidence field.

## Scope

| # | Change | File |
|---|---|---|
| 1 | Persist all evidence fields additively; tolerant readers | `src/vue/stores/learning.ts` |
| 2 | Microservices store slice (14 actions, 6 getters) — the production caller of the engine | `src/vue/stores/learning.ts` |
| 3 | Microservices track page with the full engineering loop | `src/vue/pages/MicroservicesPage.vue` (new) |
| 4 | Wire the route | `src/vue/router/index.ts` |
| 5 | Repoint both dead `nextAction` routes | `src/vue/stores/learning.ts` |
| 6 | Replace 3 always-failing npm scripts; add `npm run verify` | `package.json` |
| 7 | Remove the false server capability declaration | `metadata.json` |
| 8 | Add `security` to the competency model and tag the M5 security material | `src/data/microservices/types.ts`, `src/engines/microservices.ts`, `src/data/microservices/phaseM5.ts` |
| 9 | 14 tests | `src/vue/__tests__/microservicesTrack.test.ts` (new) |

## Design decisions

- **Additive storage keys, no version bump.** A missing key means "no evidence", so existing
  `SENIOR_JAVA_180_STATE_V1` records load correctly without migration. No destructive change.
- **Tolerant readers separated from validation.** A corrupted evidence field coerces to "no evidence"
  rather than taking down the whole learner state.
- **`isModuleComplete` derives completion; nothing is stored twice.** Status is derived from the record.
- **`executionMode` honesty contract reused verbatim.** The page renders `REAL_EXECUTABLE` /
  `SIMULATED` / `SPECIFICATION` labels from the existing `MS_EXECUTION_LABELS`, and repeats the note that
  a simulation is not a recorded result.
- **Failure labs and incidents reveal nothing before a choice.** The root cause is only shown after the
  learner commits, then compared in a disclosure element.

## Defects found and fixed during this phase

1. Java/AI/English evidence never persisted while `.ai/CURRENT.md` claimed it was.
2. Export/import silently dropped Java module evidence on both paths.
3. `openTriage` reset the active tab away from the incident runner (caught by test).
4. The incident rail's "Triage" button navigated away from the triage runner (same root cause).
5. `phase-008`/`009`/`011` referenced a non-existent `backend/`, `test:e2e`, `docker:build`, `ci:deploy`.

## Verification

```text
npm run typecheck   PASS  (0 errors)
npx eslint .        PASS  (0 errors; 0 warnings in new files)
npx vitest run      PASS  (22 files / 245 tests)
npm run build       PASS  (8.42s)
vite preview        PASS  (HTTP 200)
vite dev            PASS  (HTTP 200)
```

## Acceptance criteria met

- [x] `/learning/microservices` resolves to a real component, not `PagePlaceholder`
- [x] All six phases of the track render with real content
- [x] Every module loop stage has a working affordance that records persisted evidence
- [x] Failure lab and incident flows grade deterministically and reveal nothing early
- [x] Evidence survives a reload for Java, AI, English and microservices records
- [x] `nextAction` has no dead routes
- [x] No new dependency
- [x] Google AI Studio compatible
