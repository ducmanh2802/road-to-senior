# SKILL: backend-spring (target platform)

## When To Use
When an approved phase creates/modifies the Java backend (none exists yet).

## Required Reads
.ai/STACK.md (target versions) · .ai/DECISIONS.md · relevant phase file.

## Execution steps

### Step 1
Scaffold/module only per approved phase. Maven; Java 25; Spring Boot 4.1.x.
Layering: API → Application → Domain → Infrastructure (simplest that preserves boundaries).

### Step 2
Constructor injection; records where apt; validation at edges; centralized error
handling; no hidden magic; no silent fallbacks.

### Step 3
Config externalized (no secrets committed); profiles for env; observability
(Micrometer/OTel) when infrastructure exists.

## Verification
mvn compile → unit tests → integration (Testcontainers) → package.

## Failure conditions
Version incompatibility → record Dependency/Current/Required/Reason/Risk, choose
minimum compatible, ask if major.

## STOP condition
Phase scope complete → commit → STOP.

## Output
Endpoints/modules changed, tests, build result.

## Token Rules
Do not read unrelated services; one bounded context per phase.
