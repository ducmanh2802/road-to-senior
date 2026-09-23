# Phase P0-1.2: Java Core — Sealed Classes & Exhaustive Pattern Matching

## Executive Summary

Phase P0-1.2 implements Module 1.2 under the **P0: Java Core** learning track:
**Sealed Classes & Exhaustive Pattern Matching (Closed Type Unions, Permitted Subtypes & Algebraic Domain Modeling)**.

The module completes the full 11-stage Senior Engineering Loop:
```
LEARN → BUILD → BREAK → OBSERVE → DEBUG → FIX → BENCHMARK → DESIGN → EXPLAIN → DEFEND → ASSESS
```

---

## Deliverables

### 1. Curriculum Engine & Content (`src/data/javaCoreCurriculum.ts`)
- **Pillar 1 Roadmap Evolution**:
  - Module 1.2 unlocked (`status: 'NOT_STARTED'`).
  - Generalized `ModuleContent<T>` interface supporting domain model distinctions, algebraic models, and module-specific data.
- **Learn Stage**: Closed vs. open hierarchies, Algebraic Data Types (sum types vs product types), JLS modifiers (`final`, `sealed`, `non-sealed`), optionality of `permits` within a compilation unit, and compiler exhaustiveness proofs.
- **Build Lab (`PaymentResult.java`)**: Algebraic domain hierarchy defining a sealed interface with permitted record subtypes (`Success`, `Declined`, `GatewayError`) and an exhaustive pattern switch without `default:`.
- **Break Lab (`BrittlePaymentHandler.java`)**: The Silent Unhandled Variant Hazard (Default Branch Trap) demonstrating how adding `default:` defeats compiler alerts when domain models evolve.
- **Observe & Debug Stage**: 5-step trace demonstrating bytecode `PermittedSubclasses` inspection, javac compile-time exhaustiveness checking, compiler error reproduction upon variant addition, and remediation.
- **Fix Lab (`ExhaustivePaymentHandler.java`)**: Transition to pure exhaustive switch expressions yielding values directly without default branches.
- **Benchmark Stage**: JVM bytecode jump tables, `tableswitch`/`lookupswitch`, `PermittedSubclasses` verification during class linking, and HotSpot C2 type feedback devirtualization.
- **Design Challenge (`OrderState.java`)**: Financial order state machine (New, Validated, Executed, Settled, Rejected) enforcing the "Make Illegal States Unrepresentable" design pattern.
- **Explain (60s)**: Timed elevator explanation drill articulating sealed class architecture and why default branches are code smells.
- **Defend Stage**: 8 Staff-level defense Q&As covering subclass modifier rules, cross-package and module constraints, null handling semantics in pattern switch, and Visitor Pattern comparisons.
- **Deterministic Assessment**: 11 questions (5 conceptual, 2 code-tracing, 2 debugging, 2 design) enforcing the strict $\ge 80\%$ score AND interactive failure lab completion criteria.

### 2. UI Components & Interactivity
- `JavaFailureLab.vue`: Enhanced to dynamically adapt to `moduleId`, providing an interactive simulation of adding the `FraudSuspended` variant and demonstrating silent fall-through vs. compiler-verified exhaustiveness.
- `LearningJavaPage.vue`: Enhanced to dynamically resolve active module content (`MODULE_1_1_CONTENT` and `MODULE_1_2_CONTENT`), seamlessly rendering the 11-stage loop for unlocked modules while maintaining locked states for future curriculum.

---

## Verification & Quality Gate
- `tsc --noEmit`: PASS (0 errors)
- `vue-tsc --noEmit`: PASS (0 errors)
- `eslint .`: PASS (0 errors)
- `vitest run`: PASS (17 test files, 102/102 tests passed)
- `vite build`: PASS (production bundle built cleanly)
