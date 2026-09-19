# STACK

## Current Stack (verified in repo)

| Layer | Tech |
|---|---|
| Frontend | React 19 → **migrating to Vue 3 + TypeScript (hard cutover, vertical slices)** |
| Build | Vite 8.3, Tailwind CSS v4 |
| State | React Context (→ Pinia after migration) |
| Router | none (→ Vue Router) |
| Testing | Vitest 5 + jsdom + @testing-library |
| Backend | none (runtime is client-side; localStorage persistence) |
| Hosting | Google AI Studio applet; Gemini key injected at runtime |

## Target Stack (engineering policy for later tracks)

- **Backend:** Java 25 LTS, Spring Boot 4.1.x, Spring Framework 7.x, Maven,
  Spring Web/Security/Data, PostgreSQL, Redis, Kafka, Testcontainers, JUnit,
  Micrometer, OpenTelemetry.
- **Frontend (final):** Vue 3.x (`<script setup lang="ts">`, Composition API),
  TypeScript strict, Vite, Vue Router, Pinia, Vitest, Tailwind CSS.

## Version policy

- "latest" = latest **stable** compatible with architecture and support policy.
  Never alpha/beta/milestone/snapshot unless explicitly requested.
- Java 25 is the production learning target (current LTS); Java 27 = separate feature track.
- Before any major dependency upgrade: inspect → compatibility → migration impact →
  propose → **wait for approval**. Do not silently upgrade.
