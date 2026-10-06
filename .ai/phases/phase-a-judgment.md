# Phase A — Engineering Judgment

Date: 2026-10-05
Priority: P0 (closes GAP-08)
Status: COMPLETE

## Mission requirement

> "The learner must not simply select a predefined answer… Assessment must distinguish
> guess → plausible reasoning → evidence-driven reasoning → senior-level reasoning."

## What shipped

| Artifact | Purpose |
|---|---|
| `src/engines/judgmentEngine.ts` (new) | Deterministic judgment evaluation — 4-level ladder, calibration, falsifier requirement, trap detection |
| `src/data/judgmentScenarios.ts` (new) | 8 senior scenarios, each with a documented tempting shortcut and 4–5 options |
| `src/vue/pages/EngineeringJudgmentPage.vue` (new) | `/engineering/judgment` — the Decision Lab |
| `src/vue/stores/learning.ts` | `judgmentRecords`, `judgmentProgress`, `judgmentRemediation`, `submitJudgment` |
| `src/vue/__tests__/judgmentLab.test.ts` (new) | 20 tests, including the full ladder |

## The scoring model

Grading is **deterministic and rubric-shaped**, never string-similarity against a model answer.
String matching would be gamed by keyword stuffing; an LLM grader would be non-reproducible and would
require a server this platform does not have.

Every score line is emitted in an audit trail the learner can read and contest:

```text
+35 chose the correct action
-20 chose the documented tempting shortcut
+12 evidence coverage (3/9 available signals cited)
-8  cited 2 signal(s) that are not available in this scenario
+10 named a concrete investigation plan
+10 wrote substantive reasoning
+13 stated what would disprove the decision
level=SENIOR (...)
calibration WELL_CALIBRATED (error 15 points, stated confidence 95%)
```

### The ladder

| Level | Requires |
|---|---|
| `SENIOR` | correct action + falsifier (≥40 chars) + calibration error ≤20 |
| `EVIDENCE_DRIVEN` | ≥2 credited signals from the scenario's available evidence |
| `PLAUSIBLE` | ≥1 cited signal, **or** a correct action that carries real reasoning/plan |
| `GUESS` | no signal, no plan, no substance — **even when the bare answer is the right one** |

A scenario passes only at `EVIDENCE_DRIVEN` or above. A lucky guess can never pass.

### Three properties worth calling out

1. **Signals are credited only if the scenario provides them.** The evaluated set is the *union* of
   available and claimed signals, so citing evidence you cannot read is detected and penalised (−8).
2. **Confidence is graded against objective quality.** Overconfidence is a `seniorGap`. Confidently wrong
   reasoning is worse than uncertain correct reasoning, and the engine says so.
3. **The trap is a first-class concept.** Each scenario declares `temptingShortcut`, which must be one of
   the offered options and must never be the correct answer. Taking it costs −20 and is flagged in the UI.

## The 8 scenarios

| ID | Domain | The trap |
|---|---|---|
| JUD-01 | performance | Add Redis for a latency regression |
| JUD-02 | distributed-systems | Increase `max.poll.records` for a rebalance storm |
| JUD-03 | data | Add a read replica for 92% primary CPU |
| JUD-04 | delivery | Bump the version, run tests, ship |
| JUD-05 | architecture | Let two services share one table |
| JUD-06 | security | Delete the file and force-push after a leaked secret |
| JUD-07 | architecture | Accept a plausible AI review finding unverified |
| JUD-08 | cost | Downsize instances for a 40% bill increase |

Each carries 4–5 options, a rejection reason for **every** wrong option, the senior decision, its cost, how
to verify it, and a falsifier.

## Verification

```text
npm run typecheck    PASS
npx eslint           PASS (0 errors, 0 warnings in new files)
judgmentLab.test.ts  PASS (20/20)
full suite               PASS (22 files / 245 tests)
```

## Acceptance criteria met

- [x] A scenario cannot be answered without a written decision
- [x] The four reasoning levels are distinguishable and test-enforced
- [x] A correct guess cannot reach a passing level
- [x] Confidently wrong reasoning is penalised below uncertain correct reasoning
- [x] Every scenario has a documented trap that is never correct
- [x] Route, nav entry and palette entry exist
- [x] Progress persists and survives a reload
- [x] Unattempted domains are shown as gaps, never filled
