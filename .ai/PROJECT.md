# PROJECT — Senior Java 180

- **Purpose:** Developer / Cloud Engineering Learning Platform — structured learning OS for
  Senior Java backend, Spring, Microservices, System Design, AWS and AI/GenAI certification.
- **Target user:** the repository owner, studying for Java seniority and AWS AIF-C01
  (exam planned end of September 2026).
- **Major capabilities:** learning roadmap (180-day), spaced repetition (SM-2), knowledge
  mastery tracking, DSA practice, system design labs, incident labs, interview drills,
  analytics; planned: AWS AIF-C01 certification layer + solution architecture labs.
- **Architecture (current):** client-side single-page app. No backend at runtime.
  UI layer in `src/components` (views / ui / layout / modals), state in
  `src/context/LearningContext.tsx`, deterministic engines in `src/engines`
  (sm2, competency, stateValidation), content in `src/data/seedData.ts`,
  persistence via localStorage (`SENIOR_JAVA_180_STATE_V1`).
- **Canonical locations:**
  - Frontend app: `src/`
  - Engines (pure, framework-agnostic): `src/engines/`
  - Seed content: `src/data/`
  - Agent governance: `.ai/` (CURRENT = state, phases = history, skills = procedures)
- **Major milestone:** platform standardization (Phase 001/002) → AWS AIF-C01 content layer.
- **Hosting:** Google AI Studio applet (`metadata.json`); `GEMINI_API_KEY` injected at
  runtime — never committed.
