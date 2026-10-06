# Phase Z — Senior Engineering Certification

Date: 2026-10-05
Priority: P0 (closes GAP-07)
Status: COMPLETE (engine + UI shipped; verdict is NOT_CERTIFIED — see below)

## Mission requirement

Extend the competency model to 13 dimensions. Do not hardcode scores. Every score must be backed by
evidence. Never implement `certified = true` without legitimate evidence. Never make the UI say
CERTIFIED simply because a page was opened.

## What shipped

| Artifact | Purpose |
|---|---|
| `src/engines/certificationEngine.ts` (new) | 13-dimension evidence derivation + verdict |
| `src/vue/pages/CertificationPage.vue` (new) | `/certifications/senior-engineering` |
| `src/vue/stores/learning.ts` | `certification` — a pure derivation, recomputed on access, never stored |
| `src/vue/__tests__/certification.test.ts` (new) | 14 tests, 8 of them anti-fake-completion proofs |

## The contract

1. Every dimension reads a field that only a real learner action can write.
2. A dimension the platform cannot record reports `NO_EVIDENCE_SOURCE` — never a `0`.
3. `evaluateCertification` returns `NOT_CERTIFIED` with an explicit list of unmet dimensions.
4. The overall percent is the mean of **scorable** dimensions only. Unscorable dimensions are excluded,
   never counted as zero.

## Dimension → evidence map

| Dimension | Evidence | Source |
|---|---|---|
| Knowledge | completed Java modules + mastered knowledge topics | `javaCoreCurriculum`, `knowledgeTopics` |
| Design | architecture challenges submitted | `MsArchitectureChallenge` |
| Implementation | code labs implemented | `MsCodeLab` |
| Debugging | failure labs passed + incidents resolved | `MsFailureLabSpec`, `MsIncident` |
| Optimization | benchmarks recorded | `MsBenchmarkSpec` |
| Communication | English + AI track items completed | `technicalEnglish`, `aiSeniorJava` |
| Architecture | challenges + 60-second explanation self-scored | `MsEnglishIntegration` |
| Production | M5/M6 modules completed | track phases |
| Security | security-dimension modules completed | `MsCompetencyDimension` (new `'security'`) |
| Reliability | reliability-dimension modules completed | `MsCompetencyDimension` |
| Judgment | Phase A decision at `EVIDENCE_DRIVEN`+ | `judgmentEngine` |
| **Leadership** | **none exists** | GAP-22 |
| Defense | defense self-score ≥80% | `MsDefenseQuestion.rubric` |

## Verdict: NOT_CERTIFIED — and that is correct

Two independent reasons, both structural rather than cosmetic:

1. No learner evidence is recorded in the repository.
2. **Leadership has no evidence source anywhere in `src/`.** Even maximum evidence on all 12 scorable
   dimensions cannot certify — proven directly by the test
   `never certifies, even with maximum recorded evidence on every scored dimension`.

The engine reports the missing source as a capability gap rather than a zero, because "you failed" and
"the platform never gave you a way to attempt this" are different claims and only one is true.

## Anti-fake-completion proofs (all test-enforced)

- NOT_CERTIFIED with zero evidence
- Leadership reported as `NO_EVIDENCE_SOURCE`, not 0%
- **Maximum evidence on every scorable dimension still does not certify**
- Unscorable dimensions excluded from the mean
- A `GUESS` judgment decision earns no judgment evidence
- Scores move only with recorded evidence
- The verdict derives from persisted state, not in-memory state
- The UI never renders a mastery claim

## Verification

```text
npm run typecheck              PASS
certification.test.ts          PASS (14/14)
full suite               PASS (22 files / 245 tests)
npm run build                  PASS
```

## Acceptance criteria met

- [x] 13 dimensions defined and derived
- [x] No hardcoded score anywhere
- [x] No code path can produce `certified === true` today
- [x] Missing capability reported honestly
- [x] Route, nav entry and palette entry exist
- [x] Verdict reproducible from persisted evidence

## Known blocker to a true CERTIFIED verdict

Phase S (Technical Leadership) must ship a capability that persists leadership evidence — an RFC or
design-doc review flow, an incident-commander drill, and a levelling rubric. Until then the verdict cannot
change. This is recorded as GAP-22, not worked around.
