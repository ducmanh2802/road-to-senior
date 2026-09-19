# STACK

Separation rule: CURRENT = verified in repo. TARGET = approved engineering policy.
PLANNED = intended but not installed. Never claim planned tech is installed.

## Current (verified)

- Frontend: Vue 3.5 (`<script setup lang="ts">`) + TypeScript 5.9.3 (downgraded from
  TS 7.0.2 preview — ADR-004); React 19 source retained as migration reference only
- Build: Vite 8.3, Tailwind CSS v4, @vitejs/plugin-vue; npm (package-lock.json — ADR-005)
- Router: Vue Router 4 (hash history); State: Pinia 3 registered (no store yet)
- Testing: Vitest 5 + jsdom + @testing-library/react + @vue/test-utils
- Persistence: localStorage (SENIOR_JAVA_180_STATE_V1); Backend: none
- Hosting: Google AI Studio applet (GEMINI_API_KEY injected at runtime)

## Target (approved policy)

- Backend: Java 25 LTS, Spring Boot 4.1.x, Spring Framework 7.x, Maven,
  Spring Web/Security/Data, PostgreSQL, Redis, Kafka, Testcontainers, JUnit,
  Micrometer, OpenTelemetry
- Frontend final: Vue 3 only (React removed when migration completes),
  Playwright E2E

## Planned (not installed)

- PostgreSQL, Redis, Kafka, Testcontainers, Micrometer, OpenTelemetry, Docker,
  GitHub Actions CI, Playwright

## Version policy

- "latest" = latest STABLE compatible with architecture/support policy.
  Never alpha/beta/milestone/snapshot unless explicitly requested.
- Java 25 = production learning target (current LTS); Java 27 = separate feature track.
- Major dependency upgrades: inspect → compatibility → impact → propose →
  wait for approval. No silent upgrades.
