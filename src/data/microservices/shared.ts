/**
 * Shared, real execution boilerplate for Microservices labs.
 *
 * Labs reference these constants instead of re-declaring identical commands.
 * They are the actual commands a learner runs locally (Docker Compose +
 * Maven wrapper + Testcontainers). Nothing here claims a result: commands are
 * run by the learner, and any simulated output in a lab is labelled SIMULATED.
 */
import type { MsExecutionMode } from './types';

export const RUN_SPRING_SERVICE: string[] = [
  'cd services/<service>',
  './mvnw -q clean verify',
  './mvnw spring-boot:run -Dspring-boot.run.profiles=local',
];

export const RUN_INFRA_COMPOSE: string[] = [
  'docker compose up -d postgres mongodb elasticsearch redis kafka',
  'docker compose ps',
];

export const RUN_KAFKA_TOPICS: string[] = [
  './scripts/kafka-create-topics.sh',
  'docker compose exec kafka kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic account.created.v1',
];

export function runKafkaConsume(topic: string, group: string): string[] {
  return [
    `docker compose exec kafka kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic ${topic} --group ${group} --from-beginning`,
    `docker compose exec kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group ${group}`,
  ];
}

export const RESET_STANDARD =
  'docker compose down -v && git checkout -- services/ infra/ && docker compose up -d postgres kafka redis';

export const VERIFY_INTEGRATION =
  './mvnw -q verify — unit tests plus Testcontainers integration tests against real Postgres/Kafka/Redis/Mongo/Elasticsearch (no infrastructure mocks).';

export const VERIFY_CONTRACT =
  'Run the consumer contract test in the calling service against the new provider build before merging.';

export const MS_EXECUTION_LABELS: Record<MsExecutionMode, string> = {
  REAL_EXECUTABLE: 'REAL EXECUTION — you build and run this locally',
  SIMULATED: 'SIMULATION — interactive reasoning lab, not a real runtime',
  SPECIFICATION: 'SPECIFICATION — executable design brief, no runtime here',
};

export const MS_EXECUTION_NOTES: Record<MsExecutionMode, string> = {
  REAL_EXECUTABLE:
    'Source and commands are real. Results are produced by your machine; nothing on this page is a recorded result.',
  SIMULATED:
    'This browser cannot run Kafka, Kubernetes, Stripe or a JVM benchmark. The lab teaches the reasoning with an explicit, labelled simulation; run the real system locally to obtain real evidence.',
  SPECIFICATION:
    'The environment cannot execute this technology here. You receive a complete, reviewable specification (topology, manifests, contracts) and the commands to execute it later; no results are fabricated.',
};
