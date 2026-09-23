# Phase AI-SJ — AI Knowledge Foundation for Senior Java

## Objective

Establish an enterprise-grade, structured AI knowledge module for Senior Java 180.
The goal is not to turn the learner into an AI researcher, but to make a Senior Java engineer capable of:
- Understanding modern AI systems (tokens, context windows, quantization, sampling mechanics).
- Integrating LLMs into Java enterprise services using Spring Boot 4.1, Virtual Threads, Ports & Adapters, and Resilience4j.
- Designing reliable RAG pipelines (chunking, embeddings, pgvector, hybrid search, cross-encoder rerankers, source citations).
- Implementing deterministic AI Agents with tool calling, JSON schemas, ReAct loops, and human-in-the-loop safety boundaries.
- Operating production AI with offline/online evaluations, golden datasets, observability, token cost accounting, and rate limiting.
- Hardening architectures against prompt injection, data exfiltration, and unauthorized tool calls.
- Defending senior and staff-level AI system design trade-offs in high-stakes technical interviews.

> **Explicit Boundary Statement:** Phase AI-SJ is strictly independent from Phase E01 (English Learning Track) and does not implement or trigger Phase E01. It is a standalone knowledge curriculum module for Senior Java.

---

## Curriculum Tracks

The module is organized across 9 comprehensive tracks in `src/data/aiSeniorJava.ts`:
1. **Track 1 — AI Fundamentals**: ML vs DL vs GenAI, tokens, context windows, FP16 vs AWQ/GPTQ quantization, temperature, top-p, and hallucinations.
2. **Track 2 — LLM Engineering**: Prompt anatomy, system/user/tool roles, strict JSON Schema constrained decoding, streaming responses, context pruning, and fallback routing.
3. **Track 3 — AI Integration with Java**: Ports and Adapters, Spring Boot 4.1 `RestClient`, Java 25 Virtual Threads (`Thread.ofVirtual()`), carrier thread safety, DTO validation, and Resilience4j circuit breakers/timeouts.
4. **Track 4 — RAG (Retrieval-Augmented Generation)**: 11-stage RAG lifecycle, dense vector embeddings, sparse lexical BM25, PostgreSQL pgvector with HNSW indices, reciprocal rank fusion, cross-encoder reranking, and citation grounding.
5. **Track 5 — AI Agents & Tool Calling**: ReAct loops, tool registries, Jackson JSON Schema parameter descriptors, state machines, iteration caps (MAX_ITERATIONS = 5), human-in-the-loop approvals for mutating actions, and audit logging.
6. **Track 6 — AI System Design**: Enterprise AI Gateway topology, model routing, Redis-backed semantic caching, tenant token quota accounting, and graceful degradation.
7. **Track 7 — Evaluation & Production Reliability**: Golden test datasets, RAG Triad (Context Relevance, Faithfulness, Answer Relevance), automated CI regression suites via JUnit 5, OpenTelemetry metric tracing.
8. **Track 8 — AI Security & Governance**: Direct/Indirect prompt injection defense, delimiter isolation, least-privilege tool execution, read-only transactions, sandboxing, and audit trails.
9. **Track 9 — Senior Interview Preparation**: Staff-level interview questions and structured defense frameworks (RAG vs Fine-Tuning trade-off matrix, provider outage handling, TCO defense).

---

## Data Model & Types

Defined in `src/data/aiSeniorJava.ts`:
- `AITrack`: `'fundamentals' | 'llm-engineering' | 'java-integration' | 'rag' | 'agents' | 'system-design' | 'evaluation' | 'security' | 'interview'`
- `AIDifficulty`: `'MID' | 'SENIOR' | 'STAFF'`
- `AIKnowledgeItem`:
  - `id`: Unique identifier (e.g. `ai-fund-01`, `ai-rag-01`)
  - `track`: Track classification
  - `title`: Enterprise engineering title
  - `summary`: Architectural executive summary
  - `seniorInsight`: Senior engineering mental model and deep technical explanation
  - `javaConnection`: Spring Boot and Java 25 implementation reality
  - `example`: `{ language: string, filename?: string, code: string, description: string }`
  - `failureModes`: Array of critical production failure modes and hazards
  - `interviewQuestion`: Staff technical interview question
  - `practicePrompt`: Hands-on architectural design drill prompt
  - `difficulty`: Seniority tier (`MID`, `SENIOR`, `STAFF`)
  - `tags`: Indexed searchable metadata tags
  - `relatedPhase`: Curriculum phase linkage
  - `sourceType`: Provenance (`CANONICAL_SPEC`, `ENTERPRISE_PATTERN`, `PRODUCTION_POSTMORTEM`, `STAFF_RUBRIC`)

---

## Architecture Decisions

1. **State Persistence in Pinia**:
   - Reused existing `useLearningStore` in `src/vue/stores/learning.ts`.
   - Added `completedAiTopicIds: ref<string[]>([])` with localStorage persistence under key `SENIOR_JAVA_180_STATE_V1`.
   - Added reactive helpers: `aiCompletedCount`, `aiTotalCount`, `aiProgressPercent`, `isAiTopicCompleted(id)`, and `toggleAiTopicCompletion(id)`.
   - Zero modifications to existing trading, risk, or task schemas.

2. **UI & Interaction Design (`AIKnowledgePage.vue`)**:
   - **Track Filter Tabs**: 9 dedicated track tabs + ALL view with dynamic counts and Lucide icons.
   - **Difficulty Filter**: Dropdown filtering by Mid, Senior, and Staff tiers.
   - **Search Input**: Live search across title, summary, senior insights, and tags.
   - **Architectural Topology Visual**: Visual ASCII enterprise gateway diagram + 11-stage RAG lifecycle flow card grid.
   - **4-Stage Card Drills**:
     - *1. Explain Like Senior Java*: Senior mental model and Java enterprise connection.
     - *2. Code & Design Pattern*: Uses shared `CodeBlock` component with line numbers, copy-to-clipboard, and hands-on design prompts.
     - *3. Failure Mode Drill*: Highlighted production failure modes and postmortem hazards.
     - *4. Interview Question*: Staff-level question and evaluation rubric strategy.
   - **Empty State**: Fallback to `EmptyState.vue` with one-click filter reset when search yields no matches.

3. **Navigation & Command Palette Integration**:
   - Route `/learning/ai` registered in `src/vue/router/index.ts` with `meta: { section: 'LEARNING', title: 'AI Knowledge' }`.
   - Nav item added under `LEARNING` in `src/vue/config/navigation.ts` with Lucide `Bot` icon.
   - Added command `"Go to AI Knowledge"` to `src/vue/components/CommandPalette.vue`.

---

## Files Changed

- `src/data/aiSeniorJava.ts` (NEW: 9 curriculum tracks, type definitions, 11-step RAG flow, enterprise Java examples)
- `src/vue/pages/AIKnowledgePage.vue` (NEW: Vue 3 `<script setup>` page with filters, architecture diagrams, and drill tabs)
- `src/vue/__tests__/aiKnowledge.test.ts` (NEW: 11 tests verifying routing, filters, search, drill tabs, Pinia persistence, and a11y)
- `src/vue/router/index.ts` (Added `/learning/ai` route)
- `src/vue/config/navigation.ts` (Added `AI Knowledge` nav item under LEARNING)
- `src/vue/components/CommandPalette.vue` (Added `Go to AI Knowledge` command)
- `src/vue/stores/learning.ts` (Added `completedAiTopicIds` state, persistence, and helpers)
- `.ai/phases/phase-ai-sj.md` (NEW: This phase documentation record)
- `.ai/CURRENT.md` (Synchronized state)
- `.ai/ROADMAP.md` (Synchronized roadmap)

---

## Security Considerations

- **Educational-Only**: All code snippets are read-only templates. No `eval()`, no dynamic script execution, and no unvalidated DOM rendering (`v-html` is strictly avoided).
- **Zero Paid APIs / Zero Runtime Credentials**: No actual calls are made to external LLM providers or paid APIs.
- **Defensive Engineering**: Curriculum explicitly teaches defensive prompt delimiter guards, least privilege for tools, and sandboxed execution.

---

## Known Limitations

- Real backend Spring Boot and pgvector instances are target architecture platforms and will be implemented in subsequent phases.
- Runtime AI generation is simulated via structured static curriculum modules rather than live LLM inference in the browser.

---

## Completion & Verification Status

- `npx vitest run src/vue/__tests__/aiKnowledge.test.ts`: PASS (11/11 tests)
- Full quality gate and master pipeline pass with 0 errors.
- Working tree clean and ready for commit.
