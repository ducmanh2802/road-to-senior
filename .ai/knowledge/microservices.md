# Microservices (agent knowledge)

## Purpose
Distributed-systems track: services, Kafka, Redis, data consistency.

## Core concepts (track scope)
Service boundaries · Transactional Outbox & CDC · Sagas · Idempotency · Kafka
(partitions, rebalance, exactly-once) · Redis (cache, locks, fencing) · Resilience
(timeouts, bulkheads, circuit breakers) · Observability.

## Project conventions
- E-commerce 7-service build lab: seedData INITIAL_PROJECT_FEATURES (canonical).
- Incident labs (HikariCP exhaustion, Kafka rebalance storm): seedData INITIAL_INCIDENTS —
  the BREAK/DEBUG pattern.

## Current relevance
/learning/microservices, /build/* are placeholders until slices migrate.

## Related
Skills: architecture-lab, backend-spring · Knowledge: spring.md, aws.md
