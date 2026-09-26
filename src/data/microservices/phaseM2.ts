import type { MsPhaseMeta } from './types';
import { expandModule } from './compact';
import { debugEx } from './authoring';

export const MS_M2_PHASE: MsPhaseMeta = {
  id: 'M2',
  order: 2,
  title: 'Service Foundation',
  subtitle: 'Eight deployable services: codebase, account, product and contracts',
  goal:
    'Build every capstone service with configuration, Docker, health endpoints, structured logs, contracts and integration tests before asynchronous messaging arrives.',
  sessions: 'Source sessions 5-10',
  architectureMilestone:
    'gateway + account + product services deployed from one compose stack with per-service databases and contract tests.',
};

/** PHASE M2 - SERVICE FOUNDATION. */
export const MS_M2_MODULES = [
  expandModule({
    id: 'M2.1',
    phase: 'M2',
    order: 1,
    title: 'Microservice Codebase',
    subtitle: 'Spring Boot structure, profiles, Docker, health endpoints, structured logs',
    minutes: 150,
    prerequisites: ['M1.3'],
    objective:
      'Stand up a production-shaped service template: explicit configuration, profiles, container image, liveness/readiness endpoints, structured JSON logs and a contract test.',
    stack: ['Spring Boot 4.1', 'Docker', 'Flyway', 'Micrometer', 'logback JSON'],
    why:
      'Every later lab assumes a working template. Without honest health endpoints, profiles and structured logs, Kubernetes probes, incident debugging and observability are impossible.',
    explanation: [
      'The shared skeleton of every service: layered packages, per-environment configuration, Dockerfile, health and metrics endpoints, structured logging.',
      'Copy-pasting services creates eight subtly different systems; one verified template keeps configuration, logging and health consistent.',
      'It removes ambiguity about ports, databases, log shape and the meaning of "healthy".',
      'Spring loads application.yml then the profile file with environment variables taking precedence; actuator exposes liveness/readiness; logback writes JSON with service, traceId and requestId.',
      'Container starts, Flyway migrates, readiness flips UP, the gateway routes. A failed migration keeps readiness DOWN and the instance out of rotation.',
      'A shared template speeds adoption but must not hide real differences: schemas, topics and timeouts stay per service.',
      'Missing environment variable, wrong port, migration failure, readiness UP before dependencies are checked, logs without correlation ids.',
      'Startup log with service name and version, /actuator/health state, migration history, restart counts, log volume per level.',
      'Read the last 50 startup lines, then health details, then the dependency readiness depends on. Never start by changing code.',
      'Validate required configuration at boot, keep readiness DOWN until dependencies answer, log profile and resolved ports, stamp every line with a correlation id.',
      'Never put business logic in the shared template: share infrastructure, own the domain inside each service.',
      'Your readiness probe reports UP while the database is unreachable. What does that prove about the probe, and what will Kubernetes do with the pod?',
    ],
    keys: [
      'Readiness reflects dependency health; liveness only reflects the process.',
      'Configuration comes from the environment with fail-fast validation at boot.',
      'Structured JSON logs with service, traceId and requestId are mandatory from service one.',
      'Flyway completes before readiness flips UP.',
    ],
    concepts: [
      ['Split the template contents into shared versus per-service responsibilities.', 'Shared: build, image, log shape, health endpoints, config loading, correlation ids. Per service: schema, topics, timeouts, business config and code.', 'implementation'],
      ['Define liveness and readiness when the database and Kafka are unreachable, and justify each.', 'Database down: readiness DOWN (writes impossible), liveness UP. Kafka down: readiness stays UP if the core API still works but the service reports degraded.', 'reliability'],
      ['Design the request log schema and say which two fields incident response needs first.', 'timestamp, level, service, version, traceId, requestId, event, durationMs, outcome. traceId and requestId correlate across services.', 'observability'],
      ['Name three configuration mistakes that are invisible locally and fatal in a cluster.', 'Wrong datasource host/port, missing profile activation, and a secret read from a file that exists only on the developer machine.', 'production-engineering'],
    ],
    labs: [
      {
        id: 'M2.1-L1',
        title: 'Service template with health, profiles and JSON logs',
        minutes: 90,
        objective: 'Create the reusable skeleton; verify readiness, config validation and structured logs.',
        context: 'Eleven services use this template; a mistake here multiplies eleven times.',
        architecture: 'Docker image -> Spring Boot -> actuator health -> Flyway -> Postgres; JSON logs to stdout',
        problem: 'Implement the template with local/docker/prod profiles, config validation and a correlation-id filter.',
        starter: `@SpringBootApplication class ServiceApplication
// application.yml: server.port, spring.datasource.url: \${DB_URL}`,
        lang: 'kotlin',
        requirements: ['Missing DB_URL fails startup naming the variable.', 'Readiness is DOWN while the database is unreachable.', 'Every log line carries service, traceId and requestId.'],
        constraints: ['No secrets in any committed file.'],
        expectedBehaviour: 'Healthy stack; broken DB_URL fails fast; killing Postgres flips readiness DOWN then UP.',
        testCases: [
          ['start with valid env', 'readiness UP and migration applied'],
          ['start without DB_URL', 'non-zero exit naming DB_URL']
        ],
        hiddenFailures: ['Readiness answers UP while the datasource is lazily initialised and never touched.'],
        output: 'Template runs, readiness reflects the database, logs are JSON.',
        hints: ['Register your own health indicator per dependency instead of trusting the default.'],
        explanation: 'The template is the contract with operations: predictable startup, honest readiness, machine-readable logs.',
        extension: 'Add a startup probe that stays DOWN until a deliberately slow migration completes.',
      },
      {
        id: 'M2.1-L2',
        title: 'Contract gate in CI',
        minutes: 45,
        objective: 'Fail the build when the published OpenAPI contract changes incompatibly.',
        context: 'Consumers depend on GET /api/accounts/{id}; accidental field removal must not reach main.',
        architecture: 'committed OpenAPI baseline -> contract test -> CI gate',
        problem: 'Diff the generated spec against the baseline and reject breaking changes.',
        starter: '@Test fun specIsBackwardCompatible() { /* compare to api/accounts-openapi.yaml */ }',
        lang: 'kotlin',
        requirements: ['Breaking changes fail the build.', 'Additive changes pass and update the baseline deliberately.'],
        constraints: ['The baseline changes only through an explicit commit.'],
        expectedBehaviour: 'Field removal fails CI naming the field; optional field addition passes.',
        testCases: [
          ['remove a required response field', 'build fails naming the field'],
          ['add an optional field', 'build passes'],
        ],
        hiddenFailures: ['Comparing only paths and ignoring schemas lets field removals through.'],
        output: 'CI fails on an incompatible change, passes on an additive one.',
        hints: ['Diff request and response schemas, not only path presence.'],
        explanation: 'Contracts are enforced by the pipeline; documents are not contracts.',
        extension: 'Publish the compatibility report as a build artefact so reviewers see the diff.',
      },
    ],
    debug: [
      debugEx(
        'M2.1-D1',
        'A new service starts locally and crash-loops in Kubernetes.',
        'Container restarts every 30 s with no application log lines.',
        ['migration fails only when the profile is not local', 'logs end at "starting migration"', 'the database host resolves but the port is wrong'],
        'Find the configuration difference and explain why the failure looked silent.',
        'The profile-specific datasource used a different port, so migration failed before the app could log readiness; only the migration line survived.',
        ['docker compose logs <service> | tail -50', 'kubectl describe pod to read the exit code and last state']
      ),
    ],
    failures: [
      {
        id: 'M2.1-F1',
        title: 'Ready while broken',
        minutes: 50,
        bug: 'Readiness answers UP unconditionally because only the default indicator is registered and the datasource is lazily initialised.',
        reproduce: ['docker compose up -d && curl :8081/actuator/health/readiness', 'docker compose stop postgres', 'curl :8081/actuator/health/readiness again'],
        observe: [
          'readiness stays UP after Postgres is stopped',
          'the gateway keeps routing traffic to the instance',
          'API calls fail with 500 while the platform believes the instance is healthy',
        ],
        hypotheses: [
          'The health endpoint is cached for 60 seconds.',
          'Readiness does not model any dependency, so it reports process liveness only.',
          'Postgres is reachable through a second connection pool.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: ['#1 rejected: waiting two minutes changes nothing.', '#3 rejected: exactly one datasource and pool are configured.'],
        investigate: [
          ['curl :8081/actuator/health after stopping Postgres', 'no db component in the health document', 'The indicator was never registered, so the failure is invisible to the platform.'],
          ['grep -rn "HealthIndicator" src/main/kotlin', 'no custom indicator present', 'Root cause confirmed in configuration, not in infrastructure.'],
        ],
        debugOptions: ['Readiness does not model dependency health, so the orchestrator cannot evict the instance.', 'Docker networking isolates Postgres from the service.'],
        correctRootCause: 0,
        fixOptions: [
          'Add a dependency health indicator so readiness fails when the database is unreachable, then verify eviction.',
          'Increase API timeouts so failures are less visible.',
        ],
        correctFix: 0,
        fixRejection: ['#2 rejected: masking failures keeps the instance in rotation and turns a partial outage into a full one.'],
        verify: [
          ['Stop Postgres and poll readiness', 'DOWN within one probe interval and traffic leaves the instance', 'The orchestrator can now protect users from an unhealthy instance.'],
        ],
        explainPrompt: 'Why is an optimistic readiness probe more dangerous than no probe at all?',
        modelExplanation:
          'An optimistic probe tells the platform to keep sending traffic to an instance that cannot serve requests, so failures reach users instead of being absorbed by eviction. Evidence: readiness UP with the database stopped and no db component in the health document. The fix models the dependency so readiness reflects the real ability to serve.',
        patterns: ['Readiness vs liveness', 'Dependency health indicators', 'Graceful capacity removal'],
        dimension: 'reliability',
      },
    ],
    defense: [
      ['Why does readiness need to check dependencies?', 'Readiness is the orchestrator signal for sending traffic; if it ignores dependencies, traffic keeps flowing into an instance that cannot serve, turning an internal failure into a user-visible one.', 'reliability', ['Defines readiness as a traffic signal', 'Connects it to user impact']],
      ['Why must configuration come from the environment?', 'The same artifact must run in every environment; baked values force a rebuild per change and hide environment differences that appear only in production.', 'production-engineering', ['Same artifact everywhere', 'Mentions rebuild cost']],
      ['What makes a log line useful during an incident?', 'A timestamp, service name and version, correlation id, stable event name and duration, so lines can be joined across services instead of grepped by eye.', 'observability', ['Names correlation id', 'Names structured fields']],
      ['How do you stop a bad migration from taking an instance live?', 'Run migrations before readiness flips UP and fail startup on migration errors, so an instance never enters rotation with a broken schema.', 'reliability', ['Migration precedes readiness', 'Fail-fast startup']],
      ['What belongs in the shared template, and what must not?', 'Build, logging shape, health wiring and configuration loading belong there; business rules must never be shared, because sharing them recreates coupling.', 'implementation', ['Lists template scope', 'Keeps the domain out']],
    ],
    english: [
      [
        ['readiness probe', 'the signal deciding whether an instance may receive traffic', 'A readiness probe that ignores the database keeps a broken instance in rotation.'],
        ['fail fast', 'stop immediately on a missing prerequisite instead of degrading silently', 'We fail fast when DB_URL is absent rather than starting in a broken state.'],
      ],
      ['The service reports ___ because ___, and the observable signal is ___.'],
      'Each service is a container with environment-driven configuration, a readiness probe that models its dependencies, JSON logs carrying a correlation id, and a contract test that blocks incompatible changes in CI.',
      [[
        'A teammate says the pod is up but the API returns 500',
        'The pod is liveness-healthy but not ready: a dependency is failing. Check /actuator/health for the db component before blaming the deployment.',
      ]],
      ['This probe reports UP without touching the database, which tells the platform to send traffic to an instance that cannot serve.'],
      ['If configuration is environment-driven, how do we stop environments drifting? We validate required keys at startup and fail loudly when one is missing.'],
      ['Walk me through what happens between container start and the first successful request.'],
      'The container starts with configuration from the environment, and a missing required key stops startup immediately instead of degrading silently. Flyway migrates the schema, and only then does readiness report UP, so the orchestrator never sends traffic to an instance that cannot serve. Every request logs JSON with a correlation id, and a contract test in CI rejects incompatible API changes.',
    ],
    ai: [
      'Ask an AI for a production-ready Spring Boot health setup and inspect what it actually checks.',
      '"Expose /actuator/health and set management.endpoint.health.show-details=always - that is production-ready."',
      ['The default aggregate does not verify whether critical dependencies are checked for readiness.', 'show-details=always can leak internal topology to unauthenticated callers.'],
      ['Stop the database and observe whether readiness changes', 'Check whether the health endpoint is reachable without authentication'],
      'The advice exposes health but not readiness semantics, and it can leak details. Correct version: dependency-specific readiness indicators plus a minimal unauthenticated liveness endpoint.',
    ],
    quiz: [
      ['conceptual', 'What must readiness reflect?', ['Process liveness', 'The ability to serve traffic including critical dependencies', 'Container CPU usage'], 1, 'Readiness is the traffic switch; it must model dependencies.'],
      ['conceptual', 'Why is fail-fast configuration validation valuable?', ['It hides problems', 'It converts a silent misconfiguration into an immediate, named failure', 'It only speeds startup'], 1, 'A named startup failure is cheaper than a degraded runtime.'],
      ['debugging', 'A service crash-loops with no application logs. First evidence to read?', ['kubectl describe for exit code and last state', 'Application metrics', 'The load balancer log'], 0, 'Read the platform view first when the app never got far enough to log.'],
      ['design', 'Which fields must every log line carry for cross-service correlation?', ['Message only', 'service, traceId, requestId, event, durationMs', 'Stack trace'], 1, 'Correlation fields make multi-service incidents tractable.'],
    ],
    // MODULES_END
  }),
  expandModule({
    id: 'M2.2',
    phase: 'M2',
    order: 2,
    title: 'Account Service',
    subtitle: 'CRUD, validation, transactions, optimistic locking, idempotency, audit fields',
    minutes: 150,
    prerequisites: ['M2.1'],
    objective:
      'Implement account-service end to end including concurrency-safe updates, idempotent write endpoints and audit fields, then reproduce and explain a concurrent-update race.',
    stack: ['Spring Boot 4.1', 'PostgreSQL', 'JPA optimistic locking', 'Testcontainers'],
    why:
      'Account is the first service with real invariants and concurrent writers. The locking and idempotency decisions made here are reused by inventory and payment later.',
    explanation: [
      'Account owns the customer profile: identity, credentials metadata, addresses and audit fields; it never stores order or payment state.',
      'Profiles are read and updated concurrently by the app, support tools and batch jobs, so an unguarded read-modify-write loses updates silently.',
      'It protects the invariant "one customer, one canonical email" while supporting concurrent profile edits without long-lived locks.',
      'Updates load the row with a version column, mutate through the aggregate, then commit with WHERE version = :loaded; a mismatch throws OptimisticLockingFailureException.',
      'Two concurrent updates that load version 7: the first commits as version 8, the second fails and must retry the whole use case, not just the write.',
      'Optimistic locking needs no lock during read, but it pushes retry logic into the caller and is wrong when contention is permanent and high.',
      'Lost updates, duplicate requests creating two accounts, audit fields updated by only one code path, and unbounded retries that amplify load during contention.',
      'Compare the version column across the two transactions in the database, look for OptimisticLockingFailureException counts and 409 retry rates in metrics.',
      'Reproduce with two concurrent requests on one account id, then read the row version before and after both commits to see who won and who was rejected.',
      'Add a version column, map the failure to 409 CONCURRENT_MODIFICATION with a retry hint, make write endpoints idempotent with a request key, and update audit fields in one place.',
      'Do not use optimistic locking for hot counters with constant contention - use an atomic database update or a queue; do not use pessimistic locks across user think time.',
      'Two identical PUT requests arrive 30 ms apart from a client retry. Which one creates the second account, and what stops it?',
    ],
    keys: [
      'A version column turns a silent lost update into an explicit conflict.',
      'Idempotency keys belong on write endpoints, stored with the result of the first attempt.',
      'Retry the whole use case, never only the UPDATE statement.',
      'Audit fields are written in one place so every entry point is consistent.',
    ],
    concepts: [
      ['Write the read-modify-write sequence that loses an update and mark the exact interleaving.', 'Both transactions read version 7; A commits 8; B commits 8 as well because its UPDATE has no version predicate, so A edits vanish.', 'data'],
      ['Design the idempotency contract for POST /accounts including storage and expiry.', 'Client sends Idempotency-Key; the service stores key plus response hash and returns the stored response on replay; keys expire after 24 h with a documented window.', 'implementation'],
      ['Decide the HTTP semantics for a detected concurrent modification and defend it.', '409 with a stable code and the current version so the client can re-read and retry; 412 is an alternative but 409 states the conflict more precisely.', 'implementation'],
    ],
    labs: [
      {
        id: 'M2.2-L1',
        title: 'Optimistic locking plus idempotent account update',
        minutes: 100,
        objective: 'Make concurrent profile updates safe and make repeated writes idempotent.',
        context: 'Support tooling and the customer app update the same profile; retries happen on flaky mobile networks.',
        architecture: 'client -> gateway -> account-service -> PostgreSQL (version column + idempotency table)',
        problem: 'Add @Version to the aggregate, map conflicts to 409, and store idempotency keys with the first response.',
        starter: `@Entity class AccountEntity(
  @Id val id: UUID, @Version var version: Long?, var email: String, var updatedAt: Instant)`,
        lang: 'kotlin',
        requirements: [
          'Concurrent updates never lose data: the loser receives 409.',
          'Repeating a write with the same Idempotency-Key returns the original response and creates no second row.',
          'Audit fields are set in one place.',
        ],
        constraints: ['No pessimistic lock held across the HTTP request.'],
        expectedBehaviour:
          'Two concurrent PUTs: one 200 and one 409; replay of the winner returns the stored 200 body.',
        testCases: [
          ['two interleaved PUTs on one account', 'one commit succeeds, the other rejects with 409'],
          ['same Idempotency-Key twice', 'identical response body, single account row'],
        ],
        hiddenFailures: ['Retrying only the UPDATE inside the same transaction succeeds against a stale entity and still loses concurrency safety.'],
        output: 'Concurrency test shows exactly one winner; idempotency replay returns the first response.',
        hints: ['Reload the aggregate inside the retry attempt, do not reuse the stale entity.'],
        explanation: 'Concurrency safety is a data-integrity feature: the database must be able to reject a stale write, and the client must be told why.',
        extension: 'Add jittered exponential backoff for retries and prove that a retry storm does not increase row conflicts.',
      },
    ],
    debug: [
      debugEx(
        'M2.2-D1',
        'Two concurrent account updates both returned HTTP 200 but the stored balance is the second writer’s value only.',
        'The balance change of the first request is silently gone; no error was returned to either client.',
        [
          'both responses contain 200 with different bodies',
          'the accounts table has no @Version column in the migration',
          'audit_log shows two updates for the same account id within 40 ms',
        ],
        'Decide which mechanism allowed a silent lost update and where it must live.',
        'Without an optimistic-locking column the last commit wins: the version must live in the database row and the API must translate the conflict into 409, never into a silent overwrite.',
        ['\\d accounts (check for the version column)', 'SELECT id, version, updated_at FROM accounts WHERE id = <id>']
      ),
      debugEx(
        'M2.2-D2',
        'A client retry during a network timeout created two accounts with the same email address.',
        'One logical signup produced two account rows and two confirmation emails.',
        [
          'two rows share the same email but different ids',
          'the request log shows the same Idempotency-Key on both attempts',
          'the idempotency record was inserted after the account transaction committed',
        ],
        'Explain why a recorded idempotency key did not prevent the duplicate and fix the ordering.',
        'Idempotency only works when the key row and the business effect commit in one transaction with a unique constraint on the key: writing it afterwards reopens the duplicate window.',
        ['SELECT key, response_body, created_at FROM idempotency_keys WHERE key = <uuid>', 'SELECT id, email, created_at FROM accounts WHERE email = <email>']
      ),
    ],
    failures: [
      {
        id: 'M2.2-F1',
        title: 'Two concurrent account updates',
        minutes: 50,
        bug: 'The update endpoint loads the account, mutates it and saves without a version predicate, so the second commit overwrites the first.',
        reproduce: ['./scripts/concurrent-account-update.sh --id <uuid> --parallel 2', 'SELECT version, email, updated_at FROM account WHERE id = <uuid>'],
        observe: [
          'both requests return 200',
          'the final row contains only the second request changes',
          'the first request audit entry references a value that no longer exists',
        ],
        hypotheses: [
          'PostgreSQL lost one transaction because of a failed fsync.',
          'Both transactions read the same version and wrote without a version predicate, producing a lost update.',
          'The gateway serialised the requests but returned a stale body.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: ['#1 rejected: both commits appear in the WAL; nothing was lost at the storage layer.', '#3 rejected: the gateway forwards concurrently and both service logs show their own commit.'],
        investigate: [
          ['SELECT version, updated_at FROM account WHERE id = <uuid>', 'version stays at 7 although two updates were applied', 'No version increment: the entity has no @Version mapping, so the database cannot reject the stale write.'],
          ['grep -rn "@Version" src/main/kotlin', 'no occurrence', 'Root cause confirmed at the mapping level, before touching business code.'],
        ],
        debugOptions: ['Missing optimistic concurrency control: the update has no version predicate.', 'A missing unique index on email.'],
        correctRootCause: 0,
        fixOptions: [
          'Map a version column, reject stale writes with 409 and retry the whole use case with a bounded jittered policy.',
          'Switch to SELECT FOR UPDATE for every read so nothing else can change the row.',
        ],
        correctFix: 0,
        fixRejection: ['#2 rejected: it removes the race by holding locks across request time, lowering throughput and still needing a retry policy on timeout.'],
        verify: [
          ['Re-run the concurrency script', 'exactly one 200 and one 409, winner data intact', 'Conflicting writes are now detected instead of silently discarded.'],
        ],
        explainPrompt: 'Explain the difference between a lost update and a rejected write, and why the second is acceptable while the first is not.',
        modelExplanation:
          'A lost update silently discards committed user input, which is a data-integrity breach; a rejected write tells the caller the state moved and lets the client re-read and decide. The version column is what lets the database reject the stale write; without it the second writer wins by accident.',
        patterns: ['Optimistic concurrency control', 'Lost update', 'Idempotency key', 'Bounded retry with backoff'],
        dimension: 'data',
      },
    ],
    defense: [
      ['Why optimistically lock instead of pessimistically?', 'Reads stay lock-free and short and profile conflicts are rare; pessimistic locking would hold row locks across network and think time, reducing throughput and creating lock waits.', 'data', ['Explains read behaviour', 'Mentions contention profile']],
      ['How do you make a write endpoint idempotent?', 'The client sends an idempotency key, the service stores the key with the resulting response, and a replay returns that stored response instead of repeating the side effect.', 'implementation', ['Names the key', 'Stores the result', 'Avoids repeating side effects']],
      ['What must the caller do on 409?', 'Re-read the current representation, re-apply the intent to the new version and retry with bounded jittered backoff; if it keeps failing, surface the conflict rather than looping.', 'reliability', ['Re-read then retry', 'Bounded backoff']],
    ],
    english: [
      [
        ['lost update', 'a committed write silently overwritten by a concurrent one', 'Without a version column the second update silently erases the first.'],
        ['optimistic locking', 'detecting a conflict at commit time instead of blocking readers', 'Optimistic locking keeps reads lock-free and rejects only the stale writer.'],
      ],
      ['The race is between ___ and ___, and the invariant that would be violated is ___.'],
      'The update loads the account with its version, mutates through the aggregate and commits with a version predicate. A stale commit is rejected with 409 so the client can re-read, and write endpoints accept an idempotency key so a retry creates no second effect.',
      [[
        'A tester reports that one of two parallel edits disappeared',
        'That is a lost update: both requests read the same version and the second commit overwrote the first. We are adding a version predicate and returning 409 so the loser retries deliberately.',
      ]],
      ['Both requests return 200 while one change disappears - the write path has no concurrency control, so let us add a version predicate.'],
      ['If conflicts become frequent, optimistic locking degrades into retry churn, so at that point I would evaluate an atomic database update instead.'],
      ['How do you prevent duplicate accounts when a mobile client retries a POST?', 'What happens when two users edit the same profile at the same time?'],
      'Two requests read the same row version and both commit, so the later one silently overwrites the earlier - a lost update. We add a version column so the database rejects the stale commit, return 409 so the client can re-read and decide, and make write endpoints idempotent with a request key so a network retry never creates a second effect.',
    ],
    ai: [
      'Ask an AI how to prevent lost updates in JPA and test whether the answer survives concurrent requests.',
      '"Add synchronized to the service method - that serialises the updates and fixes the race."',
      ['synchronized only serialises threads inside one JVM, so two instances still race.', 'The database still has no version predicate, so the lost update persists across pods.'],
      ['Run two service instances and repeat the concurrent update test', 'Verify the version column increments in the database'],
      'The advice works only for a single instance. Correct version: optimistic locking enforced by the database plus bounded retry, which holds for any number of instances.',
    ],
    quiz: [
      ['conceptual', 'What makes a lost update possible?', ['Missing index', 'A read-modify-write with no concurrency predicate', 'Slow disk'], 1, 'Without a predicate the database cannot detect the stale write.'],
      ['scenario', 'Two concurrent PUTs with optimistic locking. Expected outcome?', ['Both succeed', 'One succeeds and one receives a conflict', 'One silently overwrites the other'], 1, 'The version predicate rejects the stale commit.'],
      ['design', 'Where does an idempotency key belong?', ['In every GET', 'On write endpoints, persisted with the first result', 'As the database primary key'], 1, 'Keys protect side-effecting operations and must be stored with their result.'],
    ],
    // MODULES_END
  }),
  expandModule({
    id: 'M2.3',
    phase: 'M2',
    order: 3,
    title: 'Product Service and API Contract Engineering',
    subtitle: 'Catalogue model, pagination, indexes, versioning, DTO evolution, correlation ids',
    minutes: 150,
    prerequisites: ['M2.2'],
    objective:
      'Build the catalogue service with search-ready modelling and indexed queries, then evolve its API without breaking an existing consumer.',
    stack: ['Spring Boot 4.1', 'PostgreSQL', 'Flyway', 'OpenAPI', 'Composite indexes'],
    why:
      'Catalogue is the highest-read service in the capstone; its API is consumed by the storefront, the order service and later the search indexer, so contract discipline starts here.',
    explanation: [
      'Product service owns products, categories and price, and publishes a read API plus change events; it never owns stock or orders.',
      'Catalogue reads dominate traffic and its consumers are multiple services plus a front end, so query shape and contract stability are load-bearing.',
      'It provides fast filtered reads without table scans and lets the API change without breaking deployed consumers.',
      'Queries are served from a composite index matching the filter and sort order; DTOs are versioned per route with additive-only changes and a committed OpenAPI baseline.',
      'A filtered list query hits the composite index and stops at LIMIT; an unfiltered sort on a missing column falls back to a sequential scan that grows linearly with catalogue size.',
      'Indexes speed reads and slow writes and consume space; version-per-route multiplies surface area, so version only when semantics truly change.',
      'Missing indexes causing sequential scans, offset pagination degrading with depth, breaking DTO changes, and correlation ids dropped between hops.',
      'Query plans with EXPLAIN ANALYZE, slow-query logs, index usage statistics, consumer-side contract test results, correlation id coverage in logs.',
      'Compare EXPLAIN output before and after index changes, then check whether the plan changed from sequential scan to index scan without a sort.',
      'Add a composite index matching the filter and ordering, switch deep offset paging to keyset pagination, and introduce a new route version while keeping the old one in place.',
      'Do not add an index per query variant - every index costs writes; do not version an API for cosmetic changes, and never remove a field in a minor version.',
      'Your list endpoint is fast in dev with 1,000 rows. What is the specific plan change that will make it slow with 10 million, and which index prevents it?',
    ],
    keys: [
      'The index must match filter plus sort order, not just the filter.',
      'Deep offset pagination degrades with depth; keyset pagination stays constant.',
      'Additive changes are safe; removals and semantic changes need a new version.',
      'Every response echoes the correlation id it received.',
    ],
    concepts: [
      ['Design the product table plus the indexes for "active products in category, sorted by price".', 'Composite index on (category_id, status, price) so the filter and ordering are both served, avoiding a sort node in the plan.', 'data'],
      ['Plan the migration of a DTO field rename with zero downtime for existing consumers.', 'Add the new field, dual-write both, keep the old field deprecated for one release, migrate consumers, then remove after the deprecation window.', 'implementation'],
      ['Decide what belongs in an error contract and why correlation ids are mandatory in it.', 'code, message, correlationId, optional field violations; without the correlation id an incident report cannot be joined to logs.', 'observability'],
    ],
    labs: [
      {
        id: 'M2.3-L1',
        title: 'Indexed, paged catalogue API with a compatibility contract',
        minutes: 100,
        objective: 'Serve filtered catalogue reads from an index and evolve the response without breaking a consumer.',
        context: 'The storefront pages by category and price; the order service resolves prices during checkout.',
        architecture: 'client -> gateway -> product-service -> PostgreSQL (composite index, keyset pagination)',
        problem: 'Implement GET /api/v1/products with category, status and price filters, keyset pagination and an additive DTO change.',
        starter: `@GetMapping("/api/v1/products")
fun list(@RequestParam category: String, @RequestParam(required = false) cursor: String?): ProductPage`,
        lang: 'kotlin',
        requirements: [
          'Filtered list query uses an index scan with no sort node.',
          'Pagination is keyset-based and stable under concurrent inserts.',
          'A renamed field is added additively while the old field remains.',
        ],
        constraints: ['No breaking change to the existing /api/v1 response within this release.'],
        expectedBehaviour:
          'EXPLAIN shows Index Scan instead of Seq Scan plus Sort; replaying the cursor returns the next page deterministically.',
        testCases: [
          ['list with 50k rows, category filter, price sort', 'Index Scan, no Sort node, stable p95'],
          ['insert a product between two page reads', 'no duplicated or skipped rows with keyset paging'],
        ],
        hiddenFailures: ['Offset-based paging returns duplicates when rows are inserted between page requests.'],
        output: 'EXPLAIN plan before/after, stable pagination test, additive DTO change with both fields present.',
        hints: ['Read the EXPLAIN plan first and only then add an index - plans tell you which column order matters.'],
        explanation: 'Query performance is decided by the access path the planner chooses, and contract safety is decided by what you are allowed to change.',
        extension: 'Add price-history events to feed Elasticsearch in M3 and publish the change event after commit.',
      },
    ],
    debug: [
      debugEx(
        'M2.3-D1',
        'The catalogue list endpoint p95 doubled after a release added a status filter to the product query.',
        'Latency grows with table size even though the query returns only 20 rows.',
        [
          'EXPLAIN shows Seq Scan on products followed by a Sort node',
          'the new WHERE clause filters on status',
          'the existing index covers (category_id) only',
          'the endpoint still uses deep OFFSET pagination',
        ],
        'Identify the access-path change that caused the regression and the index that removes it.',
        'A filter without a matching index forces a sequential scan; the index must cover filter plus sort order, and OFFSET must be replaced by keyset pagination for deep pages.',
        [
          'EXPLAIN ANALYZE SELECT ... FROM products WHERE category_id = ? AND status = ? ORDER BY price LIMIT 20',
          "SELECT indexdef FROM pg_indexes WHERE tablename = 'products'",
        ]
      ),
      debugEx(
        'M2.3-D2',
        'Support cannot join a customer complaint to the request that failed: one hop logs a different correlation id.',
        'The correlation id changes between the gateway log, the product-service log and the error response.',
        [
          'the gateway generates a new id instead of honouring the inbound header',
          'no component writes the id into MDC',
          'the error contract body has no correlationId field',
        ],
        'Trace the correlation id through the hops and decide where it must be created, propagated and exposed.',
        'One id is created at the edge, propagated through every hop via header and MDC, echoed in every response and logged: correlation is a contract, not a logging convenience.',
        [
          "curl -i -H 'X-Correlation-Id: <uuid>' .../api/v1/products?category=books",
          'grep <uuid> logs/product-service.log',
        ]
      ),
    ],
    failures: [
      {
        id: 'M2.3-F1',
        title: 'The API change that broke a consumer',
        minutes: 45,
        bug: 'A developer renamed productName to name and dropped the old field, deploying provider and storefront separately.',
        reproduce: ['Deploy product-service 2.0 alone', 'Load the storefront catalogue page during the rollout'],
        observe: [
          'storefront renders empty product titles during rollout',
          'order-service price lookup logs NullPointerException on the missing field',
          'contract tests exist but only run inside the provider build',
        ],
        hypotheses: [
          'The storefront has a caching bug.',
          'A field was removed in a non-major version, so deployed consumers break during the rollout window.',
          'The gateway stripped the response field.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: ['#1 rejected: a hard refresh reproduces the failure.', '#3 rejected: the gateway log shows the field absent in the upstream payload.'],
        investigate: [
          ['git diff HEAD~1 -- api/products-openapi.yaml', 'productName removed and name added at once', 'The contract changed incompatibly in a minor release.'],
          ['Run the consumer contract test in order-service against the new provider', 'test fails on the removed field', 'A consumer-side contract test would have caught this before deploy.'],
        ],
        debugOptions: ['A breaking contract change shipped without a compatibility window or consumer-side contract test.', 'A stale CDN cache.'],
        correctRootCause: 0,
        fixOptions: [
          'Restore the old field as deprecated, add the new field alongside it, run consumer contract tests in CI, then remove after the deprecation window.',
          'Ask both consumers to upgrade in the same release.',
        ],
        correctFix: 0,
        fixRejection: ['#2 rejected: coordinated releases reintroduce monolith deployment coupling - exactly what the boundary removed.'],
        verify: [
          ['Roll out provider then consumers independently', 'no consumer errors during the window and contract tests green in both pipelines', 'Independent deployability is restored with a documented deprecation path.'],
        ],
        explainPrompt: 'Explain why "we can deploy any time as long as we deploy everything together" is not independent deployability.',
        modelExplanation:
          'Independent deployability means a consumer keeps working while the provider is one version ahead. Removing a field breaks that promise, so the failure is a contract violation rather than a coordination problem. The remedy is additive change with a deprecation window plus consumer-side contract tests in CI.',
        patterns: ['Additive-only API evolution', 'Consumer-driven contract tests', 'Deprecation window'],
        dimension: 'implementation',
      },
    ],
    defense: [
      ['When do you introduce a new API version?', 'When semantics change or something must be removed; additive changes do not need a version. Versioning costs surface area and duplicated documentation, so it must be justified by a breaking need.', 'implementation', ['Distinguishes additive vs breaking', 'Names the cost of versioning']],
      ['Why keyset pagination over offset for deep paging?', 'Offset scans and discards rows so cost grows with depth, and concurrent inserts shift pages; keyset seeks directly after the last seen key and stays stable.', 'performance', ['Explains offset cost', 'Explains stability']],
      ['How do you know an index is actually used?', 'From the query plan and index usage statistics; an index that never appears in plans or usage counters is pure write cost.', 'data', ['Plan evidence', 'Usage counters']],
    ],
    english: [
      [
        ['backward compatible', 'a change that does not break existing consumers', 'Adding an optional field is backward compatible; removing one is not.'],
        ['keyset pagination', 'paging by the last seen key instead of an offset', 'Keyset pagination stays stable when rows are inserted mid-traversal.'],
      ],
      ['We can add ___ safely, but ___ requires a new version because ___.'],
      'The catalogue API serves filtered reads from a composite index and pages by keyset. Contract changes are additive with a deprecation window, consumer contract tests run in both pipelines, and every response echoes the correlation id.',
      [[
        'A reviewer suggests renaming a field because it reads better',
        'Renaming is a breaking change for deployed consumers. We can add the better name alongside the old one, deprecate the old one for a release, and remove it once consumers have migrated.',
      ]],
      ['Removing this field breaks deployed consumers during rollout; let us add the new field and keep the old one for a deprecation window.'],
      ['The index only helps if the plan uses it, so I would compare EXPLAIN output before claiming an improvement.'],
      ['How do you evolve an API without coordinating releases?', 'How do you page a large catalogue efficiently and stably?'],
      'A rename is a breaking change, so we never ship it in place. We add the new field alongside the old one, mark the old one deprecated with a removal date, and run consumer contract tests in both pipelines so the provider learns immediately when it breaks a consumer. Reads are served by a composite index matching filter and sort, and deep paging uses keyset pagination because offset cost grows with depth and shifts under concurrent inserts.',
    ],
    ai: [
      'Ask an AI to "optimise" a slow catalogue query and check whether its claim is measurable.',
      '"Add an index on every column used in the WHERE clause and increase the connection pool - that will fix the latency."',
      ['An index per column multiplies write cost and may not serve filter plus ordering.', 'A larger pool can amplify database load instead of reducing latency.'],
      ['Read the query plan before and after any change', 'Measure p95 and write throughput, not only the single query time'],
      'Unverified advice. Correct approach: read the plan, add the composite index matching filter plus ordering, then prove it with before/after p95 and write-rate measurements.',
    ],
    quiz: [
      ['conceptual', 'Which change is safe for a deployed consumer?', ['Removing a field', 'Adding an optional field', 'Renaming a field in place'], 1, 'Additive changes keep consumers working.'],
      ['conceptual', 'Why does deep offset paging degrade?', ['The database reconnects', 'It scans and discards offset rows, and concurrent inserts shift pages', 'JSON becomes larger'], 1, 'Both cost and stability degrade with offset depth.'],
      ['debugging', 'Titles vanish only during a rollout. First hypothesis?', ['CDN cache', 'A breaking contract change shipped before consumers migrated', 'Gateway misrouting'], 1, 'Rollout-scoped failures usually mean contract incompatibility.'],
    ],
    // MODULES_END
  }),
];
