# QUALITY GATES SPECIFICATION — SENIOR JAVA 180

## 1. Quality Philosophy

Senior Java 180 enforces strict, non-negotiable software craftsmanship standards:
- Zero fake passes
- Never bypass exit codes (`|| true` and `|| exit 0` are strictly forbidden)
- Zero suppressed compiler errors
- Zero secrets committed to version control
- Every production commit must pass the Master Quality Pipeline

---

## 2. Provider-Neutral Architecture

```
QUALITY GATE
├── SonarQube Provider (Enterprise / Hosted)
│   ├── Quality Profile: Java 25 & Vue 3 Strict
│   ├── Quality Gate Thresholds: 0 Vulnerabilities, 0 Bugs, Security Rating A
│   └── Trigger: Active when SONAR_HOST_URL is configured
└── Free Autonomous Quality Gate (Free OSS Provider)
    ├── TypeScript Strict Compiler (tsc --noEmit)
    ├── Vue SFC Compiler (vue-tsc --noEmit)
    ├── ESLint 9 (Vue 3, <script setup>, TypeScript rules)
    ├── Vitest Unit Testing Engine
    ├── Vitest v8 Coverage Engine
    ├── Semgrep SAST Scanner (when available in environment)
    └── Gitleaks Secret & Token Detection
```

---

## 3. Canonical Commands

| Command | Purpose |
|---|---|
| `npm run typecheck` | Validates TypeScript in TS/TSX and Vue SFC files |
| `npm run lint` | Runs ESLint and TypeScript compiler checks |
| `npm run test` | Runs the full Vitest unit test suite |
| `npm run test:coverage` | Collects real code coverage via Vitest v8 |
| `npm run quality:scan` | Runs all static security, lint, and secret scans |
| `npm run quality:gate` | Evaluates Quality Gate rules and prints pass/fail decision |
| `npm run quality` | Canonical master pipeline executing all checks sequentially |

---

## 4. Pipeline Stages

1. **TYPECHECK**: `tsc --noEmit`
2. **VUE TYPECHECK**: `vue-tsc --noEmit`
3. **LINT**: `eslint .`
4. **TEST**: `vitest run`
5. **COVERAGE**: `vitest run --coverage`
6. **BUILD**: `vite build`
7. **STATIC ANALYSIS**: Semgrep SAST scan (or honest classification)
8. **SECRET SCAN**: `gitleaks detect`
9. **QUALITY GATE**: `node scripts/quality/gate.js`
