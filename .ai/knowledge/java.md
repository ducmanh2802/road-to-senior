# Java (agent knowledge)

## Purpose
Learning track core: language features, JVM internals, concurrency. Target Java 25 LTS
(platform target — no Java code exists in repo yet).

## Core concepts (track scope)
Memory model (JMM, volatile, happens-before) · Collections internals (HashMap, treeify) ·
Generics (PECS, erasure) · Streams/Spliterator · GC (G1/ZGC) · Executors & ThreadPool
tuning · CompletableFuture pipelines · Records & pattern matching.

## Project conventions
- Canonical slice shape = LEARN→IMPLEMENT→BREAK→DEBUG→EXPLAIN→INTERVIEW tabs
  (reference: src/components/views/JavaView.tsx, migration source).
- Curriculum content lives in src/data/seedData.ts — pages reference it, never invent.
- Vue slice pattern: .ai/phases/phase-002.md (LearningJavaPage).

## Current relevance
/learning/java is the representative vertical slice (skeleton only).

## Related
Skills: frontend-vue, architecture-lab · Knowledge: spring.md, interview.md
