# SKILL: aws-aif-c01

## When To Use
Building/validating AIF-C01 certification content (domains, objectives, questions,
mock exams, weak areas).

## Required Reads
.ai/knowledge/aws.md · relevant phase file · (once built) content validation engine.

## Execution steps

### Step 1 — baseline
AIF-C01 Revision 1.1 (April 30, 2026). Five domains, weights 20/24/28/14/14.
AWS official docs = only authoritative source for objectives/services.

### Step 2 — content model
Certification → ExamVersion → Domain → Task → Objective → Topic.
Every question: certification, examVersion, domain, objective, topic, difficulty,
type, question, options, correctAnswers, explanation, whyCorrect/whyIncorrect,
examTrap, memoryRule, awsServices, sourceReferences, lastVerified.

### Step 3 — question generation (original content policy)
External material → identify concept → pattern → distractor strategy → map objective
→ generate ORIGINAL question → validate against AWS source.
Label: "Original practice question aligned to AIF-C01 Revision 1.1".
NEVER "real AWS exam question". No dumps/proprietary banks.

### Step 4 — fail-closed validation
Reject: unknown objective · missing source · unverified service claim · ambiguous
answer · multiple-accidentally-correct · explanation contradicting question ·
blog-only sources. Never silently fill gaps.

### Step 5 — batches
Generate → validate → map → dedupe → ambiguity check → source check → tests → commit.
STOP after each batch.

## Verification
Every objective has topics; every question maps to objective + source;
weights sum to 100; exam version valid; no duplicate IDs.

## Failure conditions
Any validation failure → reject item, log reason.

## STOP condition
Batch/phase complete → commit → STOP.

## Output
Batch stats (created/validated/rejected + reasons).

## Token Rules
Never scrape proprietary banks; summarize validation instead of dumping content.
