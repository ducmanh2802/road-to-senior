# Phase C/D — Production Incident Lab & Postmortem

Date: 2026-10-05
Priority: P0 (closes GAP-04, GAP-10)
Status: COMPLETE

## Context

`src/engines/incidentEngine.ts` existed in the working tree as a **0-byte file** — an incident engine
presented as an engine, with nothing behind it. The audit recorded this as GAP-04: a false capability
surface. The microservices curriculum already contained rich `MsIncident` content in M4–M6, but no state
machine drove it.

## What shipped

| Artifact | Purpose |
|---|---|
| `src/engines/incidentEngine.ts` (was 0 bytes, now real) | Triage state machine, evidence gating, deterministic grading, severity ordering |
| `src/engines/__tests__/incidentEngine.test.ts` (new) | 21 tests |
| `src/vue/pages/MicroservicesPage.vue` | INCIDENTS tab consumes the engine; no inline state machine |
| `src/vue/stores/learning.ts` | `recordMsIncident` persists the resolution |

## The step machine

```text
OBSERVE → HYPOTHESIS → DEBUG → FIX → VERIFY → POSTMORTEM → RESOLVED
```

`canAdvanceFrom(step, submission)` gates every transition. A learner cannot read the investigation
evidence, then declare a hypothesis they could not have had — the hypothesis must be committed first.

## Evidence gating (`evidenceForStep`)

| Step | Released |
|---|---|
| `OBSERVE` | alerts only |
| `HYPOTHESIS` | metrics, logs, trace |
| `DEBUG` | investigation metrics |
| `FIX` | remediation steps |
| `VERIFY` | verification evidence |
| `POSTMORTEM` | reference postmortem + defense questions |

Test-enforced: `does not release metrics, logs or trace before a hypothesis is declared` and
`never leaks the reference postmortem before the postmortem step`.

## Grading — `gradeIncidentTriage`

Three commitments must all survive: the hypothesis, the root cause, and the applied fix.

| Outcome | Meaning | Evidence recorded |
|---|---|---|
| `RESOLVED` | correct triage **and** a postmortem ≥80 chars | yes |
| `POSTMORTEM` | correct triage, postmortem still owed | yes (triaged, not closed) |
| `OBSERVE` | any of the three failed | **no** |

Design properties:

1. **No partial credit.** A half-correct triage is not resolved. Test:
   `never awards partial credit for a half-correct triage`.
2. **Resolution ≠ explanation.** You can triage correctly and still owe a postmortem. The engine tracks
   both states separately.
3. **Uncommitted ≠ wrong.** An uncommitted stage returns `null`, not `false`. Test:
   `reports uncommitted stages as null rather than false`.
4. **A failed triage is visible.** The page returns to `OBSERVE` *and* renders the rejection reasons plus
   the full audit trail, so the learner can see exactly which stage the evidence rejected.
5. **Severity ordering is explicit.** `INCIDENT_SEVERITY_RANK` ranks P0 < P1 < P2;
   `selectOpenIncidents` filters by recorded resolutions and sorts by severity, so a P0 always leads the
   incident rail. `store.nextAction` promotes the first open incident above all other work.

## Verification

```text
npm run typecheck                  PASS
incidentEngine.test.ts             PASS (21/21)
microservicesTrack.test.ts         PASS (14/14)
full suite                         PASS (22 files / 245 tests)
eslint                             PASS (0 errors)
build                              PASS
```

## Acceptance criteria met

- [x] `src/engines/incidentEngine.ts` is no longer a 0-byte stub
- [x] Framework-agnostic engine, unit-testable without Vue
- [x] Evidence is gated behind committed hypotheses
- [x] Grading is deterministic with no partial credit
- [x] A wrong triage is an explicit, visible, retryable state
- [x] Postmortem is a separate obligation from triage
- [x] Unresolved incidents outrank study in `nextAction`
- [x] 21 tests

## Remaining limitation

The browser cannot execute Kafka, Kubernetes or a JVM, so `MsIncident.executionMode` distinguishes
`REAL_EXECUTABLE` / `SIMULATED` / `SPECIFICATION`. The triage engine grades the **learner's reasoning
against the scenario's declared evidence**; it does not observe a real production system. That boundary
is stated in the UI via the existing `MS_EXECUTION_NOTES` honesty contract and is not papered over.
