# English Learning Track (Agent Knowledge & Architecture)

## 1. Vision & Product Positioning
Senior Java 180 is an engineering career OS:
```text
Senior Java Engineer → Cloud-native Developer → AWS Solution Architect → AI/GenAI Architect
```
The **English Learning Track** is not a generic language tool or casual vocabulary app. It is an integrated career capability designed to unlock global senior engineering roles, technical presentations, international team leadership, and certification readiness.

Three interconnected goals:
```text
TOEIC (Standardized Workplace Proficiency & Testing Mastery)
+
GENERAL / WORKPLACE COMMUNICATION (Standups, Meetings, Incidents, Collaboration)
+
TECHNICAL ENGLISH FOR SOFTWARE ENGINEERING (Concept Explanation, Architecture Defense)
```

---

## 2. Information Architecture

### Platform Navigation Hierarchy
```text
Learning
├── Java 25
├── Spring Boot
├── Microservices
├── Kafka
├── Redis
├── Databases
├── System Design
└── English
    ├── TOEIC
    │   ├── Vocabulary & Idioms
    │   ├── Grammar Essentials
    │   ├── Listening (Parts 1–4)
    │   ├── Reading (Parts 5–7)
    │   ├── Mini Tests
    │   └── Full Practice Tests
    ├── Communication
    │   ├── Daily Conversation & Workplace Basics
    │   ├── Agile Meetings & Standups
    │   ├── Explaining Incidents & Production Bugs
    │   ├── Asking Questions & Requesting Code Review
    │   ├── Explaining Architecture & Trade-offs
    │   ├── Written Communication (Email / Slack / RFCs)
    │   └── Negotiation & Manager 1-on-1s
    └── Technical English
        ├── Java & JVM Concurrency
        ├── Spring Ecosystem & Inversion of Control
        ├── Microservices & Distributed Patterns
        ├── Kafka & Event-Driven Architecture
        ├── Redis & Caching Strategies
        ├── Relational & NoSQL Databases
        ├── System Design & High Availability
        ├── AWS & Cloud Native Solutions
        └── AI / GenAI & Modern LLM Architecture

Interview
├── Java
├── Spring
├── Microservices
├── System Design
├── AWS
└── English (Technical Defense + Behavioral STAR Simulation)
```

---

## 3. The Three English Pillars

### Pillar A: TOEIC (Test of English for International Communication)
* **Goal:** Systematic preparation for international workplace proficiency exams.
* **Format:** Original practice questions only (strict anti-copyright infringement policy: no scraped or proprietary ETS questions).
* **Components:**
  - **Vocabulary:** High-frequency business and IT workplace collocations.
  - **Grammar:** Parts of speech, verb tenses, relative clauses, conditional statements, subject-verb agreement, participle clauses.
  - **Listening (Parts 1–4):** Photographs, Question-Response, Conversations, Talks (audio/text scenario prompts).
  - **Reading (Parts 5–7):** Incomplete Sentences, Text Completion, Reading Comprehension (single, double, triple passages).
  - **Assessments:** 20-question targeted Mini Tests and 200-question timed Full Practice Tests.
* **Score & Metric Boundaries:**
  - Practice Score (e.g. 85/100 correct).
  - Estimated Performance Range (e.g. Band 750–820).
  - Official Score: Explicitly marked as unverified until the user manually logs an official certificate result.

### Pillar B: Workplace & Practical Communication
* **Goal:** High-impact verbal and written communication in modern agile engineering teams.
* **Scenarios:**
  1. *Daily Standup:* "Yesterday I investigated the Kafka consumer lag; today I'm deploying the partition rebalance fix."
  2. *Explaining a Production Incident:* Escalating severity, summarizing symptoms, stating root cause hypotheses, outlining containment.
  3. *Joining a Technical Meeting:* Introducing oneself, proposing agenda adjustments, interjecting politely.
  4. *Asking for Assistance:* Framing questions with context, attempts made, and specific blocker areas.
  5. *Giving Constructive Code Review:* Suggesting optimizations without sounding confrontational.
  6. *Talking to Stakeholders:* Translating technical latency spikes into business transaction impacts.
* **Interaction Loop:**
  ```text
  Scenario & Context Briefing
  ↓
  Prompt / Question
  ↓
  User Response (Text draft)
  ↓
  Evaluation (Grammar, Clarity, Professional Tone, Vocabulary)
  ↓
  Recommended Better Phrasing & Natural Collocations
  ↓
  Retry
  ```

### Pillar C: Technical English for Software Engineering
* **Goal:** Deep mastery of terminology, spoken explanations, and written defenses of software systems.
* **Curriculum Coupling:**
  - *Java:* Immutability, thread safety, happens-before relationship, garbage collection pauses, virtual threads.
  - *Microservices:* Circuit breaking, bulkhead isolation, distributed tracing, eventual consistency, saga pattern.
  - *Kafka:* Consumer rebalancing, partition offset commit, exactly-once semantics, dead-letter queues.
  - *AWS:* Fault tolerance, multi-AZ deployment, shared responsibility model, cost allocation tags.
* **Exercise Model:**
  - *Define the Term:* Explain the concept in 2 concise English sentences.
  - *Analyze the Trade-off:* Compare two approaches (e.g. optimistic vs. pessimistic locking) in English.
  - *Storytelling:* Walk through a refactor or architectural migration using the STAR format.

---

## 4. Integration with the 10-Stage Learning Loop

English is woven into the standard Senior Java 180 loop:
```text
LEARN     → Study concept in technical English (vocabulary, definitions).
DESIGN    → Formulate architecture constraints & trade-offs in English RFC style.
BUILD     → Code implementation with English naming, comments, and commit messages.
BREAK     → Induce bugs and formulate incident hypotheses in English.
DEBUG     → Document root-cause analysis (RCA) and mitigation steps.
OPTIMIZE  → Profile performance and articulate bottlenecks.
EXPLAIN   → Deliver clear, structured English summaries of how the system operates.
DEFEND    → Defend architectural choices and trade-offs against peer review.
REVIEW    → Review spaced repetition cards (SM-2) for grammar, vocabulary, and terms.
INTERVIEW → Simulate senior engineering whiteboard / behavioral interviews in English.
```

---

## 5. Spaced Repetition Integration (SM-2)

No new review engine is needed. The existing deterministic SuperMemo-2 engine (`src/engines/sm2.ts`) is 100% reusable:
* **Item Types Supported:**
  - Vocabulary & Idioms (Term ↔ Definition, Collocation, Context Sentence).
  - Grammar Mistakes (User's past incorrect choices ↔ Correct rule explanation).
  - Technical Engineering Terms (Concept ↔ Concise 30-second explanation).
  - Interview Defense Prompts (Prompt ↔ Senior model answer key points).
* **Adapter Pattern:** Items map directly to the `ReviewCard` interface with `intervalDays`, `repetitionCount`, and `easeFactor`.

---

## 6. Conceptual Data Models (Planning)

```typescript
// Extended types for English Track

export type EnglishPillar = 'TOEIC' | 'COMMUNICATION' | 'TECHNICAL_ENGLISH';

export type ToeicSection = 'LISTENING' | 'READING';
export type ToeicPart = 'PART_1' | 'PART_2' | 'PART_3' | 'PART_4' | 'PART_5' | 'PART_6' | 'PART_7';

export interface EnglishQuestion {
  id: string;
  pillar: 'TOEIC';
  part: ToeicPart;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string; // e.g., 'Subject-Verb Agreement', 'Office Supplies Order'
  estimatedSeconds: number;
}

export interface CommunicationScenarioItem {
  id: string;
  title: string;
  category: 'STANDUP' | 'INCIDENT' | 'MEETING' | 'CODE_REVIEW' | 'ARCHITECTURE_DEFENSE' | 'ONE_ON_ONE';
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR' | 'STAFF';
  contextDescription: string;
  targetRole: string;
  prompt: string;
  keyPointsRequired: string[];
  exemplaryResponses: string[];
  vocabularyTips: string[];
  grammarPitfalls: string[];
}

export interface TechnicalEnglishTerm {
  id: string;
  technology: 'JAVA' | 'SPRING' | 'MICROSERVICES' | 'KAFKA' | 'REDIS' | 'DATABASE' | 'SYSTEM_DESIGN' | 'AWS';
  term: string;
  pronunciationIpa?: string;
  conciseDefinition: string;
  deepExplanation: string;
  sampleSentences: string[];
  interviewPrompt: string;
  modelAnswer: string;
}

export interface EnglishAttemptRecord {
  id: string;
  itemId: string;
  pillar: EnglishPillar;
  timestamp: string;
  score: number;
  timeSpentSeconds: number;
  userAnswer: string;
  feedback?: {
    technicalCorrectness?: number; // 1-5
    clarity?: number;              // 1-5
    grammarScore?: number;        // 1-5
    vocabularyScore?: number;     // 1-5
    notes?: string;
  };
}

export interface EnglishTrackProgress {
  toeic: {
    vocabularyMastered: number;
    grammarAccuracy: number;
    listeningAccuracy: number;
    readingAccuracy: number;
    miniTestsCompleted: number;
    fullTestsCompleted: number;
    estimatedScoreRange?: { min: number; max: number };
    officialScore?: { score: number; date: string };
  };
  communication: {
    scenariosAttempted: number;
    scenariosMastered: number;
    averageClarityRating: number;
  };
  technicalEnglish: {
    termsMasteredByTech: Record<string, number>;
    explanationsCompleted: number;
  };
}
```

---

## 7. UI Integration & Component Reuse

The English track adheres strictly to the existing Vue 3 Design System (`.ai/design-system.md`):
* **Palette:** Dark developer theme (`bg-[#0B0E14]`, `surface-[#111622]`, `border-[#1E293B]`, `primary-[#38BDF8]`).
* **Reused Components:**
  - `AppShell` (`Sidebar.vue`, `TopBar.vue`, `CommandPalette.vue`)
  - `PageHeader.vue` (Unified heading and action bar)
  - `StatCard.vue` (Accuracy, vocabulary counts, time per question)
  - `ProgressBar.vue` (Track progress, test countdown timer, completion rate)
  - `EmptyState.vue` ("No data yet" for unattempted sections)
  - `ErrorState.vue` (Network / loading resilience)
  - `LoadingSkeleton.vue` (Content loading transitions)
* **New Dedicated UI Components (Planned):**
  - `ScenarioConversationCard.vue` (Chat/dialogue scenario runner)
  - `QuestionOptionGroup.vue` (Accessible multiple-choice selector for TOEIC)
  - `RubricScoreCard.vue` (Breakdown of clarity, technical correctness, grammar)

---

## 8. Phased Implementation Roadmap

* **Phase E01 — English Foundation & Types:**
  - Define TypeScript schemas (`src/types/english.ts`), Pinia store extension, and route placeholders under `/learning/english` and `/interview/english`.
* **Phase E02 — TOEIC Practice Slice:**
  - Implement TOEIC Reading (Part 5 Incomplete Sentences) + Flashcard adapter connecting to the existing `sm2.ts` engine.
* **Phase E03 — Workplace Communication Scenarios:**
  - Implement scenario runner for standups, production incident communication, and code review discussions with structured feedback rubrics.
* **Phase E04 — Technical English & Cross-Curriculum Linking:**
  - Connect technical terminology cards to existing Java, Spring, Kafka, and AWS modules.
* **Phase E05 — English Interview Defense Engine:**
  - Implement senior technical interview simulator with defense rubric scoring (Technical correctness + English clarity).
* **Phase E06 — English Command Center Dashboard:**
  - Surface English metrics in Command Center with strict separation between practice estimates and official scores; honest empty states ("No data yet").
