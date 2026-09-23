# Phase E01 — Technical English for Senior Java

## Objective

Build the first independent English-learning slice for Senior Java 180.
The goal is to equip a Senior Java engineer to read, explain, discuss, debug, design, and defend Java, Spring Boot, and distributed systems in fluent technical English.

At the Senior and Staff level, technical competence is inseparable from communication competence:
- Articulating architectural trade-offs to cross-functional teams
- Leading incident triage and blameless post-mortems in English
- Writing constructive, high-signal pull request reviews
- Defending system design decisions under scrutiny from Principal Architects
- Answering behavioral and system architecture interview questions using the STAR framework

> **Explicit Boundary Statement:** Phase E01 is strictly independent from the React-to-Vue migration. It does not modify, remove, or destabilize existing React or Vue infrastructure, and uses existing Pinia persistence patterns.

---

## Scope & Implementation

### 1. Data Module: `src/data/technicalEnglish.ts`
- **10 Practical Curriculum Sections**:
  1. `java-core`: Java Core Precision (Virtual Threads, Carrier Pinning, JMM & happens-before, ZGC vs G1)
  2. `spring-boot`: Spring Boot & IoC (ApplicationContext lifecycle, AOP proxying, CGLIB self-invocation)
  3. `rest-distributed`: REST & Distributed Systems (Idempotency keys, Circuit breakers, Fallback routing)
  4. `database-jpa`: Database, Transactions & JPA (N+1 queries, Dirty reads, Read Committed isolation)
  5. `kafka-redis`: Event-Driven Architecture & Cache (Partition rebalancing, Exactly-once semantics, Cache stampede)
  6. `debugging-incident`: Incident Management & Triage (Out-of-Memory triage, Flame graphs, Blameless RCA)
  7. `system-design`: Architecture Trade-offs & Defense (CQRS with Event Sourcing, CAP theorem, P99 latency SLA)
  8. `code-review`: Constructive Code Review (High-signal PR review phrasing, non-blocking suggestions)
  9. `senior-interview`: Senior Technical Interview & STAR (Situation-Task-Action-Result structure)
  10. `daily-drill`: Daily Engineering Fluency (Standup updates, unblocking teammates, cross-functional alignment)
- **Key Fields per Item**:
  - `id`: Unique identifier (e.g., `eng-java-01`, `eng-incident-01`)
  - `section`: Target section ID
  - `term`: Exact technical English term/phrase
  - `topic`: Domain topic
  - `difficulty`: Seniority level (`MID` | `SENIOR` | `STAFF`)
  - `plainEnglishExplanation`: Accessible technical definition
  - `seniorExplanation`: In-depth senior engineering rationale
  - `exampleSentence`: Real-world engineering meeting usage sentence
  - `keyPhrases`: Curated collocations and professional vocabulary
  - `speakingPrompt`: Hands-on verbal drill prompt (60–90 second challenge)
  - `commonMistake`: Misconception vs engineering reality
  - `vietnameseSupportNote`: Precision bilingual engineering note
  - `codeSnippet` (optional): Architectural pattern code reference
  - `relatedStage`: Mapping to 10-stage learning loop (LEARN, DESIGN, BUILD, BREAK, DEBUG, OPTIMIZE, EXPLAIN, DEFEND, REVIEW, INTERVIEW)

### 2. Vue Component: `src/vue/pages/EnglishPage.vue`
- Route: `/english`
- Multi-dimensional filtering:
  - **Section tabs**: ALL (total items) + 10 domain section tabs with domain-specific Lucide icons
  - **Difficulty selector**: ALL LEVELS, MID TIER, SENIOR TIER, STAFF / PRINCIPAL
  - **Search input**: Full-text search across term, topic, plain explanation, senior explanation, speaking prompt, and tags
  - **Empty state**: Clean reset mechanism when no items match
- **Interactive Expandable Cards**:
  - Card header: Term, difficulty badge, loop stage tag, topic, plain definition, toggle button, and completion status
  - 4 interactive drill tabs per item:
    1. *Senior Java Explanation*: Deep technical rationale and production meeting context sentence
    2. *Practice Speaking Prompt*: 60–90s verbal speaking challenge with drill guidance
    3. *Common Mistake & Reality*: Highlighting common misconceptions
    4. *Vietnamese Support Note*: Bilingual nuance note for Vietnamese engineers
  - Code snippet display via `CodeBlock.vue` where applicable
- **State & Persistence**:
  - Bound to `learningStore.completedEnglishItemIds`
  - Integrated in `saveToStorage`, `loadFromStorage`, `resetToDemo`, and `exportDataAsJson`
  - Top header displays dynamic completion count and percentage progress badge

### 3. Route & Navigation Integration
- Registered in `src/vue/router/index.ts` under `/english` (`name: 'english'`)
- Added to `src/vue/config/navigation.ts` in LEARNING section with `Languages` icon
- Added to `src/vue/components/CommandPalette.vue` as `"Go to Technical English"`

### 4. Test Coverage: `src/vue/__tests__/english.test.ts`
- 11 comprehensive tests:
  - Route registration and metadata verification
  - Page header, progress badge, and track badge rendering
  - Rendering of all 10 section tabs + ALL tab
  - Section tab filtering
  - Difficulty selection filtering
  - Real-time search query filtering
  - Empty state rendering and filter resetting
  - Card expansion and collapse behavior
  - 4 drill tabs rendering and content verification
  - Store completion toggle persistence
  - Accessibility attributes on interactive controls

---

## Verification & Quality Gate

- `npm run test -- src/vue/__tests__/english.test.ts`: PASS (11/11 tests)
- Pinia persistence integration: PASS
- Non-destructive integration with existing React and Vue slices: PASS

---

## Incremental Enhancement: Interactive Quiz Mode

- **5-question dynamic quiz**: Random sampling from `TECHNICAL_ENGLISH_ITEMS`
- **4-choice MCQ**: Exactly 4 unique options with authentic curriculum distractors
- **Question styles**:
  - Definition → Term
  - Term → Definition
- **Senior explanation**: Deep architectural reality and meeting context quotes
- **Production meeting context**: Instant drill feedback on correct/incorrect answers
- **Pinia completion synchronization**: Correct answers update `completedEnglishItemIds` in `useLearningStore`
- **Retake/result flow**: Score, percentage, performance tier, and per-question breakdown summary
- **Tests**: `src/vue/__tests__/englishQuiz.test.ts` (11/11 tests PASS)

