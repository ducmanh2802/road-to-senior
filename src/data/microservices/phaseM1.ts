import type { MsModule, MsPhaseMeta } from './types';
import { aiReview, concept, debugEx, defense, defineModule, english, failure, lab, quiz } from './authoring';
import { RUN_INFRA_COMPOSE, RESET_STANDARD, VERIFY_INTEGRATION } from './shared';

export const MS_M1_PHASE: MsPhaseMeta = {
  id: 'M1',
  order: 1,
  title: 'Microservices Architecture',
  subtitle: 'Boundaries, layers and infrastructure topology for the E-commerce capstone',
  goal:
    'Decide, implement and defend service boundaries, application layering and the production topology of the capstone before a single service is deployed.',
  sessions: 'Source sessions 1–4',
  architectureMilestone:
    'Monolith seams measured → product-service extracted with its own database → documented topology with gateway, services and shared infrastructure.',
};

/**
 * PHASE M1 — MICROSERVICES ARCHITECTURE.
 * The learner starts from a monolith and earns every boundary with evidence.
 */
export const MS_M1_MODULES: MsModule[] = [
  defineModule({
    id: 'M1.1',
    phase: 'M1',
    order: 1,
    title: 'Microservices Fundamentals',
    subtitle: 'Monolith → modular monolith → services: cohesion, coupling, data ownership',
    estimatedMinutes: 150,
    prerequisites: [],
    learningObjective:
      'Distinguish monolith, modular monolith and microservices on measurable criteria (deployability, data ownership, failure isolation, team autonomy) and defend a boundary with evidence instead of fashion.',
    stackFocus: ['Spring Boot 4.1', 'PostgreSQL', 'Docker Compose', 'ADR'],
    executionMode: 'REAL_EXECUTABLE',
    whyItMatters:
      'Every later phase (Kafka, Saga, resilience, Kubernetes, incidents) inherits these boundary decisions. A boundary drawn for the wrong reason cannot be rescued by adding Kafka or a service mesh.',
    explanation: {
      whatItIs:
        'Microservices = independently deployable services that own their data and expose explicit contracts. A monolith is one deployable unit; a modular monolith is one deployable unit with enforced internal modules. The distinction is deployability and data ownership, not code volume.',
      whyItExists:
        'Large systems broke the monolith for organisational reasons first: many teams, one release train. Services let teams deploy independently — and charge that freedom against network calls, partial failure and eventual consistency.',
      problemSolved:
        'Independent scaling and deployment of capabilities with genuinely different load and change profiles: checkout vs catalogue search vs notifications.',
      internals:
        'No framework magic: a service is a process, a contract, a bounded-context datastore and a pipeline. Coordination moves from in-process calls and ACID transactions to network calls, retries, idempotency and compensation.',
      runtimeBehaviour:
        'A request crosses processes: serialisation, latency, timeouts, partial failure, duplicate delivery and clock skew become normal. Any call can fail after the remote side already committed.',
      tradeoffs:
        'You buy autonomy, isolated scaling and failure isolation; you pay with distributed transactions, observability cost, duplicated infrastructure, versioned contracts and heavier on-call duty.',
      whatCanFail:
        'Chatty boundaries (N+1 network calls), shared databases (hidden coupling), distributed monoliths (must deploy together), cyclic dependencies, and read models that lag the write behind them.',
      howToObserve:
        'Per-service rate/error/latency plus the dependency graph; deploy history per service; synchronous hops per business transaction; count of services released together.',
      howToDebug:
        'Trace one business transaction end to end and count hops. Any synchronous, non-idempotent hop is your first blocker. Then diff data ownership — a table read by two services is the real coupling.',
      howToFix:
        'Re-draw the boundary around the invariant that must stay consistent, give the owner exclusive write access to its tables, and replace read coupling with events or an owned read API.',
      whenNotToUse:
        'Not for a small team, an undistributed domain, or an unknown domain. Start modular monolith while boundaries are being discovered; extract only what has a proven load, change or compliance reason.',
      seniorQuestion:
        'You cannot name one team, scaling or compliance reason for this boundary. Why does this service exist at all?',
    },
    keyPoints: [
      'A boundary is defined by the invariant it protects, not by an entity name in the schema.',
      'Database-per-service is the enforcement mechanism: shared tables mean a shared release.',
      'Every synchronous hop multiplies downtime probability.',
      'Eventual consistency is a product decision — the UI must be able to say "processing".',
      'A distributed monolith is worse than a monolith: same coupling plus network failure modes.',
    ],
    conceptExercises: [
      concept(
        'M1.1-C1',
        'Assign every capstone entity (user, product, stock, cart, order, payment, invoice, notification) to exactly one owning service, justified by the invariant it protects.',
        'Order owns the order state machine, Inventory owns stock reservation, Payment owns payment-intent state; the customer appears in Account and Order, but only Account may write the canonical profile.',
        'architecture'
      ),
      concept(
        'M1.1-C2',
        'Rewrite the monolith schema into per-service schemas and list every cross-schema JOIN it currently uses.',
        'Each JOIN is a hidden synchronous dependency that must become an API call, a replicated read model, or a deliberately duplicated denormalised field.',
        'data'
      ),
      concept(
        'M1.1-C3',
        'Score Product, Inventory and Order boundaries 1–5 on cohesion, coupling, data ownership and failure isolation. Which is weakest, and why?',
        'Inventory is usually weakest: stock is touched by order creation, checkout, cancellation and warehouse sync — high coupling, low autonomy.',
        'architecture'
      ),
      concept(
        'M1.1-C4',
        'Draw the checkout happy path with all synchronous calls and compute chain availability when each service is 99.9% available.',
        '0.999^5 ≈ 99.5%: the chain is less available than any single service — the argument for async steps, timeouts and circuit breakers.',
        'distributed-systems'
      ),
      concept(
        'M1.1-C5',
        'Identify five distributed failure points that do not exist in the monolith version of the same system.',
        'Partial commit, duplicate delivery, out-of-order events, partition between services, and the lost-response case where the caller times out although the callee committed.',
        'distributed-systems'
      ),
    ],
    codeLabs: [
      lab({
        id: 'M1.1-L1',
        title: 'Carve product-service out of the monolith',
        minutes: 90,
        objective:
          'Extract catalogue read/write endpoints from the monolith into an independently deployable product-service with its own PostgreSQL schema and no shared tables.',
        context:
          'The monolith exposes /api/products from a single schema shared with orders. Two teams now block each other: catalogue releases are blocked by checkout migrations 5×/week.',
        architecture: 'client → monolith (legacy) → product-service (new, own schema) → PostgreSQL',
        problem:
          'Create product-service with Product/Category aggregates, its own Flyway migrations, and a REST contract identical to the monolith endpoint so clients need no change.',
        starter: `@RestController
@RequestMapping("/api/products")
class ProductController(private val service: ProductApplicationService) {
  @GetMapping("/{sku}") fun bySku(@PathVariable sku: String): ProductResponse = service.bySku(sku)
}`,
        lang: 'kotlin',
        requirements: [
          'product-service owns schema products_service; no cross-schema foreign keys.',
          'Flyway migration V1 creates product, category, product_category_link.',
          'Contract preserved: same path, same JSON field names, same 404 semantics.',
          'Health endpoint and structured startup log with service name and version.',
        ],
        constraints: [
          'No shared database user between monolith and product-service.',
          'No change to existing client payloads (additive-only DTO evolution).',
        ],
        expectedBehaviour:
          'GET /api/products/{sku} returns an identical payload from the new service; unknown SKU returns 404 with an error contract body.',
        testCases: [
          ['GET existing SKU against both old and new endpoints', 'byte-identical JSON (excluding timestamp fields)'],
          ['GET unknown SKU', '404 with {code:"PRODUCT_NOT_FOUND", correlationId}'],
        ],
        hiddenFailures: [
          'Startup fails because the service still points at the monolith schema — fix the datasource and migrations.',
          'Controller returns a lazy JPA entity and fails serialisation after the session closes.',
        ],
        output: 'product-service boots on :8082, Flyway applies V1, both contract tests pass.',
        hints: [
          'Keep the DTO in a shared contract module compiled by both sides — not a shared entity.',
          'Use Testcontainers PostgreSQL so the migration is verified against a real engine.',
        ],
        explanation:
          'The extraction is only real when the data is owned: the new service must be able to migrate its schema without coordinating a monolith release.',
        extension: 'Delete the monolith endpoint behind a feature flag and measure client error rate during the switch.',
      }),
      lab({
        id: 'M1.1-L2',
        title: 'Enforce the boundary with an architecture test',
        minutes: 45,
        objective:
          'Prove the boundary is enforced by the build, not by convention, using an ArchUnit rule over packages and the persistence module.',
        context: 'A developer can still import the monolith repository classes from product-service and the compiler will not complain.',
        architecture: 'module boundary → ArchUnit rule → CI failure on violation',
        problem:
          'Add an ArchUnit test that fails when any class under domain/ imports infrastructure, JPA, Kafka or web packages.',
        starter: `class HexagonalArchitectureTest {
  @Test fun domainDoesNotDependOnInfrastructure() { /* TODO */ }
}`,
        requirements: [
          'Rule fails the build on violation (no warning-only rules).',
          'Rule covers domain → application and application → infrastructure directions.',
        ],
        constraints: ['Test must run in the normal verify lifecycle, not as a manual check.'],
        expectedBehaviour: 'Adding an illegal import breaks ./mvnw verify with a readable violation message.',
        testCases: [
          ['Illegal import added deliberately', './mvnw verify fails with the offending class name'],
          ['Clean tree', './mvnw verify passes'],
        ],
        hiddenFailures: ['Rules that are accidentally satisfied by package naming only — assert on imported types, not names.'],
        output: 'verify fails on the seeded violation and passes after removal.',
        hints: ['ArchUnit ships `noClasses().that().resideInAPackage(...).should().dependOnClassesThat()`.'],
        explanation:
          'A boundary that only exists in a diagram is a suggestion. A boundary enforced by CI is an architectural constraint.',
        extension: 'Publish the violation report as a build artefact so reviewers see the illegal dependency.',
      }),
    ],
    debuggingExercises: [
      debugEx(
        'M1.1-D1',
        'After extraction, checkout latency tripled although product-service response time is 12 ms.',
        'p99 on /api/checkout rose from 180 ms to 520 ms.',
        ['product-service p99 = 12 ms', 'checkout calls /api/products 41 times per request', 'no caching layer'],
        'Find the network amplification and reduce hops per business transaction.',
        'The boundary is chatty: a per-item call inside a loop. Batch retrieval with a list endpoint or cache the catalogue snapshot.',
        ['grep the call graph for the products client', 'count calls per checkout in the trace', 'compare hop count before/after batching']
      ),
    ],
    failureLabs: [
      failure({
        id: 'M1.1-F1',
        title: 'The shared-database boundary',
        minutes: 60,
        bug:
          'product-service and order-service both write products_schema.stock so "the numbers always agree".',
        reproduce: [
          'docker compose up -d postgres && ./scripts/seed-demo-catalog.sh',
          './scripts/place-orders.sh --count 50 --concurrency 10',
          'GET :8082/products/SKU-100/stock and GET :8083/orders/stock/SKU-100',
        ],
        observe: [
          'order-service reads 47 while product-service reports 52 for the same SKU',
          'SELECT usename, query FROM pg_stat_activity — two service users on one table',
          'the last 4 order-service releases each required a product-service migration',
        ],
        hypotheses: [
          'Replication lag between two copies that has not converged yet.',
          'Two writers on one table: order-service commits outside product-service transaction boundaries, so each writer overwrites the other’s stale row.',
          'A DTO field-mapping bug in the stock response.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#1 rejected: there is no replication — both point at one table; lag would converge in milliseconds and never does here.',
          '#3 rejected: the mapping is unit-tested and the divergence exists in the stored row, not the response.',
        ],
        investigate: [
          [
            "SELECT xact_start, usename, query FROM pg_stat_activity WHERE query ILIKE '%stock%';",
            'two long transactions on the same row from different service users',
            'Lost update: the later commit overwrites the earlier one; nothing in the database prevents it.',
          ],
          [
            'git log --oneline -- services/order-service/src/main/resources/db/migration',
            'order-service ships V7__stock_index.sql against products_schema',
            'One service migrates another service’s schema — coupling proven from the repository, not from a diagram.',
          ],
        ],
        debugOptions: [
          'Shared mutable state disguised as a boundary: one table, two writers, two release trains.',
          'PostgreSQL lost a committed transaction because fsync is unreliable here.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Inventory becomes the only writer of stock; order-service requests a reservation via API/event and product-service reads a stock projection.',
          'Add SELECT FOR UPDATE in order-service so its write wins more often.',
        ],
        correctFix: 0,
        fixRejection: [
          '#2 rejected: locking narrows the race window but leaves two writers, two migrations and the same coupling.',
        ],
        verify: [
          [
            'POST /orders/{id}/reserve (Inventory only) then inspect grants on products_schema',
            'single writer; no service user except Inventory holds INSERT/UPDATE on stock',
            'Ownership is now enforced by the database, not by convention.',
          ],
        ],
        explainPrompt:
          'In five sentences: why does a shared table make two services one deployable unit? What evidence proved it here, and what changed structurally after the fix?',
        modelExplanation:
          'Two writers on one row across two transactions means the second commit overwrites the first — a lost update — and every schema change becomes a coordinated release. The evidence was two service users in pg_stat_activity plus migration files owned by the wrong service. The fix assigns a single writer, converts the read path to a projection, and enforces ownership with grants.',
        patterns: ['Database-per-service', 'Single writer principle', 'Lost update', 'Read projection'],
        dimension: 'data',
      }),
    ],
    defenseQuestions: [
      defense(
        'M1.1-D1',
        'When should you NOT use microservices?',
        'When the domain is still unknown, the team is small, or no independent scaling, compliance or team-autonomy driver exists. A modular monolith keeps deployment simple while boundaries mature; extract later with evidence.',
        'architecture',
        ['Names two falsifiable conditions', 'Allows later extraction', 'No fashion-based reasoning']
      ),
      defense(
        'M1.1-D2',
        'Why is database-per-service important?',
        'The schema is the real interface: a shared table lets one team break another team’s release and turns every read into an untracked contract. Ownership enables independent migration, scaling and failure isolation.',
        'data',
        ['Calls the schema a contract', 'Explains release coupling', 'Mentions enforcement by grants/ownership']
      ),
      defense(
        'M1.1-D3',
        'What makes a service boundary good?',
        'One invariant inside, one writer for its data, one reason to change, and the ability to deploy, scale and fail alone — measured by hops per transaction and shared tables, not by package names.',
        'architecture',
        ['Names the invariant', 'Single writer', 'Measurable criteria']
      ),
      defense(
        'M1.1-D4',
        'Why can microservices increase complexity?',
        'Compiler-checked calls and ACID transactions become network calls, retries, idempotency and compensation, plus tracing, contract versioning and on-call load. The cost is recurring and operational.',
        'production-engineering',
        ['Lists distributed failure modes', 'Mentions operational cost', 'Ties to observability/on-call']
      ),
      defense(
        'M1.1-D5',
        'How do you choose between synchronous and asynchronous communication?',
        'Synchronous when the caller needs the answer to continue and the callee is a hard dependency; asynchronous when the caller only announces a fact and the reaction may lag. Decide with an availability and latency budget.',
        'distributed-systems',
        ['Uses the needs-the-answer test', 'Mentions availability/latency budget', 'Allows mixed patterns']
      ),
    ],
    english: english(
      [
        ['coupling', 'how much one component must change when another changes', 'Shared tables create tight coupling between two release trains.'],
        ['bounded context', 'the explicit boundary inside which a domain model is consistent', 'Inventory is a bounded context; stock semantics do not leak into Checkout.'],
      ],
      [
        'The reason we draw this boundary is ___, and the trade-off we accept is ___.',
        'We keep these two steps asynchronous so that ___ cannot take down ___.',
      ],
      'Product-service is independently deployable: it owns the products schema, exposes a versioned REST contract, and no other service may write those tables. Catalogue therefore deploys on its own cadence, at the cost of a network hop and a stock projection for reads.',
      [
        ['A stakeholder asks why releases are still coupled', 'Two services share one database owner, so their migrations are effectively one release. We are moving stock writes to Inventory and expect to decouple within two sprints.'],
      ],
      [
        'This service reads another service’s table. The compiler will not stop us, so let us make ownership explicit before this ships.',
      ],
      [
        'If we keep this boundary, chain availability becomes the product of the hops; I would cache the catalogue read before adding a sixth service.',
      ],
      [
        'Why did you split this service, and what did you measure before and after?',
        'Describe a boundary you drew that turned out wrong. What did you change, and what did it cost?',
      ],
      'Microservices buy independent deployability and isolated scaling, but they convert in-process calls into network calls, so you inherit partial failure, duplicates and eventual consistency. A boundary only works when one service owns the data and the invariant; otherwise you have a distributed monolith that is harder to operate than the original. I extract only when I can name the load, change or compliance reason — and then I measure hops and availability afterwards.'
    ),
    aiReview: aiReview(
      'Ask an AI assistant to split this monolith into microservices, then inspect the answer before accepting it.',
      '"Extract UserService, ProductService, OrderService and PaymentService, and share one PostgreSQL database to keep transactions simple."',
      [
        'The suggestion shares one database: which service owns each table, and can one migrate without the other?',
        'No failure semantics: what happens during checkout when Payment is unavailable?',
        'No contract strategy: how does the API evolve when Order changes its DTO?',
      ],
      [
        'Write the entity → owner table and mark every conflict',
        'Check every cross-service call for a timeout and a defined failure path',
      ],
      'Directionally right, structurally wrong: one shared database makes it a distributed monolith. The corrected version uses per-service schemas with explicit owners plus documented failure behaviour per call.'
    ),
    assessment: [
      quiz(
        'M1.1-A1',
        'conceptual',
        'Which single criterion best proves a boundary is real?',
        ['One module per service in the build', 'Only one service may write the tables behind the boundary', 'The service has its own Docker image'],
        1,
        'Deployability follows ownership; without a single writer the boundary is decorative.'
      ),
      quiz(
        'M1.1-A2',
        'conceptual',
        'Five services in a synchronous chain are each 99.9% available. What is the composed availability?',
        ['99.9%', '≈99.5%', '≈95%'],
        1,
        '0.999^5 ≈ 0.995: availability multiplies along a synchronous chain, so every hop costs availability.'
      ),
      quiz(
        'M1.1-A3',
        'scenario',
        'Catalogue deploys 5×/week and blocks checkout releases. Best first move?',
        ['Rewrite both services in another language', 'Measure the coupling, then assign data ownership and split the release trains', 'Add Kafka between them'],
        1,
        'Technology cannot fix a boundary problem; ownership and deployment independence can.'
      ),
      quiz(
        'M1.1-A4',
        'debugging',
        'Two services report different stock values for one SKU with no replication configured. Most likely cause?',
        ['Clock skew between pods', 'Two writers on one table producing a lost update', 'JSON serialisation rounding'],
        1,
        'Concurrent commits on one row overwrite each other; the later writer wins regardless of business correctness.'
      ),
      quiz(
        'M1.1-A5',
        'design',
        'For "notify the customer after the order is placed", which communication style do you choose first?',
        ['Synchronous call inside the checkout transaction', 'Asynchronous event published after the order commits', 'Synchronous call with a 30-second timeout'],
        1,
        'Notification is a reaction to a fact; making it synchronous adds a failure dependency the business does not need.'
      ),
    ],
    // MODULES_END
  }),
  defineModule({
    id: 'M1.2',
    phase: 'M1',
    order: 2,
    title: 'Application Architecture',
    subtitle: 'Controller · Application Service · Domain · Repository · Infrastructure · DTO',
    estimatedMinutes: 120,
    prerequisites: ['M1.1'],
    learningObjective:
      'Implement one capstone service with explicit layers and transaction/error boundaries, then refactor a controller that reaches directly into repositories, Kafka, Stripe and external APIs.',
    stackFocus: ['Spring Boot 4.1', 'Spring Data JPA', 'KafkaTemplate', 'RFC 9457 Problem Details'],
    executionMode: 'REAL_EXECUTABLE',
    whyItMatters:
      'Layering is what keeps a service testable and replaceable once Kafka, Stripe and caching arrive in later phases. A controller that owns business logic becomes unrefactorable the moment a second consumer appears.',
    explanation: {
      whatItIs:
        'Five responsibilities with one dependency direction: controllers translate transport, application services orchestrate a use case and own the transaction boundary, domain holds invariants, repositories persist aggregates, infrastructure adapts the outside world.',
      whyItExists:
        'Without layers, transport concerns, business rules and integration details merge; every change touches everything and nothing can be tested without a live database.',
      problemSolved:
        'The domain stays independent of Spring, JPA, Kafka and Stripe, so invariants are testable in milliseconds and integrations are swappable.',
      internals:
        'The application service validates the command, loads an aggregate, invokes domain behaviour, persists, then publishes events after commit. DTOs cross the boundary; domain objects never leave.',
      runtimeBehaviour:
        'Spring proxies the application service: the transaction starts on entry and commits on return. Publishing before commit lets a consumer observe a write that can still roll back.',
      tradeoffs:
        'Indirection and mapping boilerplate. Overhead for a pure CRUD endpoint; cheap insurance for anything with invariants, transactions and side effects.',
      whatCanFail:
        'Leaked entities (LazyInitializationException after commit), @Transactional self-invocation bypassing the proxy, business logic in controllers, events published mid-transaction.',
      howToObserve:
        'ArchUnit violations in CI; trace spans showing multiple transaction boundaries per request; domain errors logged as 500 instead of a 4xx error contract.',
      howToDebug:
        'Follow controller → service → domain → repository, count transaction boundaries, and check whether integration calls happen inside a transaction.',
      howToFix:
        'Move orchestration into the application service, keep controllers to mapping, publish integration events after commit, map domain exceptions centrally.',
      whenNotToUse:
        'Do not wrap five layers around a read-only lookup; a query endpoint may go controller → query service. Consistency of rules matters more than symmetry of packages.',
      seniorQuestion:
        'If the domain imports Spring, JPA or Kafka, which invariant can you still test without booting the framework?',
    },
    keyPoints: [
      'The application service owns the transaction boundary; the controller owns transport only.',
      'Domain objects never cross the transport boundary — DTOs do.',
      'Publish integration events after commit, never mid-transaction.',
      'Self-invocation bypasses Spring proxies, so @Transactional silently does nothing.',
      'One place maps domain exceptions to the error contract.',
    ],
    conceptExercises: [
      concept(
        'M1.2-C1',
        'Draw the dependency direction for account-service and mark any arrow pointing inwards.',
        'Controller → application service → domain ← repository port; infrastructure implements the port. An arrow from domain to Spring/JPA destroys testability.',
        'implementation'
      ),
      concept(
        'M1.2-C2',
        'For the use case "change email", assign responsibilities to domain, application service and controller.',
        'Domain: format/uniqueness invariant and state transition. Service: load, invoke, persist, publish AccountEmailChanged. Controller: transport validation, mapping, status codes.',
        'architecture'
      ),
      concept(
        'M1.2-C3',
        'List the risks of calling an external HTTP API inside a database transaction.',
        'Connection and lock hold time grows with network latency; the transaction may time out after the remote side already committed, producing a lost-response divergence.',
        'implementation'
      ),
    ],
    codeLabs: [
      lab({
        id: 'M1.2-L1',
        title: 'Account service with clean boundaries',
        minutes: 75,
        objective: 'Implement change-email: controller -> application service (tx) -> aggregate -> repository port.',
        context: 'AccountEmailChanged will later go to Kafka and trigger a verification mail without touching domain rules.',
        architecture: 'controller -> application service (tx) -> Account aggregate -> repository port -> JPA adapter',
        problem: 'Implement ChangeEmailUseCase with invariants, errors AccountNotFound/EmailAlreadyInUse and a DTO response.',
        starter: `class ChangeAccountEmailService(private val accounts: AccountRepository) {
  fun handle(command: ChangeEmailCommand): AccountResponse { TODO() }
}`,
        lang: 'kotlin',
        requirements: [
          'Controller has no business logic and no repository dependency.',
          'The application service method is the transaction boundary.',
          'Domain errors map to RFC 9457 Problem Details with stable codes.',
        ],
        constraints: ['Domain tests must run as plain JUnit without Spring.'],
        expectedBehaviour: '200 DTO / 404 ACCOUNT_NOT_FOUND / 409 EMAIL_ALREADY_IN_USE / 400 invalid payload.',
        testCases: [['existing account, unused email', '200 with updated audit fields'], ['email owned elsewhere', '409 EMAIL_ALREADY_IN_USE']],
        hiddenFailures: ['Returning the entity causes LazyInitializationException after commit.'],
        output: 'Aggregate unit tests pass without Spring; Testcontainers integration test passes.',
        hints: ['Map to a DTO before returning; assert one transaction per use case.'],
        explanation: 'Layering is proven by fast tests: if an invariant needs a database to verify, the boundary leaked.',
        extension: 'Publish AccountEmailChanged after commit and prove no event fires on rollback; then move the gateway call out of the payment transaction and measure lock wait time.',
      }),
    ],
    debuggingExercises: [
      debugEx(
        'M1.2-D1',
        'Accounts are charged while the order stays PENDING after a gateway timeout.',
        '5% of payments raise DOUBLE_CHARGE_ALERT with the order still PENDING.',
        ['two charge attempts 400 ms apart', 'the order transaction rolled back', 'the client retried after a 504'],
        'Explain how rollback plus retry produce a double charge.',
        'The remote effect committed while the local transaction rolled back; the retry charged again with no idempotency key - the lost-response problem.',
        ['grep the payment client retry configuration', 'inspect gateway request ids for idempotency keys']
      ),
    ],
    failureLabs: [
      failure({
        id: 'M1.2-F1',
        title: 'The fat controller',
        minutes: 60,
        bug: 'AccountController owns validation, persistence, event emission and gateway calls with @Transactional on the endpoint.',
        reproduce: ['POST /api/accounts/{id}/email with a duplicate email', './scripts/run-account-concurrency-test.sh --threads 20'],
        observe: [
          'the same rule exists in the controller and in a batch job',
          'audit fields update on the HTTP path but not on the batch path',
          'the gateway span nests inside the HTTP transaction span',
        ],
        hypotheses: [
          'A missing @Valid on the request DTO lets duplicates through.',
          'Business logic lives in the transport layer, so rules drift between entry points and the transaction spans external I/O.',
          'The isolation level is too low for concurrent updates.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#1 rejected: validation does run (400 is returned); duplicated logic is the defect.',
          '#3 rejected: READ_COMMITTED is intended and divergence also appears in sequential batch runs.',
        ],
        investigate: [
          [
            'grep -rn "changeEmail" src/main/kotlin | grep -v test',
            'two implementations: AccountController and AccountBatchJob',
            'Two writers of one invariant: rules drift and only one path maintains audit fields.',
          ],
          ['Inspect the endpoint trace', 'gateway.connect nested inside the jdbc transaction span', 'External I/O inside the transaction inflates lock time.'],
        ],
        debugOptions: ['Missing layering: transport code owns invariants and the transaction boundary.', 'A missing index on email.'],
        correctRootCause: 0,
        fixOptions: [
          'Extract the use case into an application service shared by both entry points; keep the controller to mapping; move the gateway call outside the transaction.',
          'Add an index on email and keep both implementations in sync manually.',
        ],
        correctFix: 0,
        fixRejection: ['#2 rejected: speed improves but two rule implementations and I/O inside the transaction remain.'],
        verify: [
          ['Run the concurrency script and the batch job against the same command', 'identical rule outcome and audit fields from both entry points', 'One implementation enforces the invariant for every caller.'],
        ],
        explainPrompt: 'Why is duplicated business logic in a controller a data-consistency bug rather than a code-style issue?',
        modelExplanation:
          'Two entry points with two implementations of one invariant diverge as soon as either is edited, and only one maintains audit fields. Evidence: a second implementation found by grep plus a gateway span inside the transaction. Fix: one shared application service with external I/O moved out of the transaction.',
        patterns: ['Layered architecture', 'Single source of truth for invariants', 'Transaction boundary'],
        dimension: 'implementation',
      }),
    ],
    defenseQuestions: [
      defense(
        'M1.2-D1',
        'Why must the transaction boundary live in the application service?',
        'The atomic unit is the business operation, not the transport entry point; putting it in the service lets a batch job or consumer reuse the same atomic use case.',
        'implementation',
        ['Names the use case as the unit', 'Mentions reuse by other entry points', 'Rejects transaction-per-endpoint']
      ),
      defense(
        'M1.2-D2',
        'Why not expose JPA entities from the controller?',
        'The entity is a persistence detail: lazy proxies fail outside the session and the JSON shape becomes an accidental contract that schema refactors break.',
        'implementation',
        ['Mentions lazy loading', 'Contract stability', 'Separates persistence from transport']
      ),
      defense(
        'M1.2-D3',
        'Where do integration events get published, and why?',
        'After commit, because a consumer must never observe state that can still roll back. The reliable mechanism is an outbox row written in the transaction and relayed after commit.',
        'distributed-systems',
        ['States after commit', 'Explains the phantom-state risk', 'Mentions outbox']
      ),
      defense(
        'M1.2-D4',
        'How do you map domain exceptions to HTTP responses?',
        'One central handler maps typed domain errors to stable problem-detail codes; controllers never catch business errors and unknown exceptions return 500 without leaking internals.',
        'implementation',
        ['Central mapping', 'Stable codes', 'No internals leaked']
      ),
      defense(
        'M1.2-D5',
        'When would you skip strict layering?',
        'Read-only projections may use a thin controller -> query service path. Every rule and every write still lives where it is enforced once and tested fast.',
        'architecture',
        ['Allows legitimate shortcuts', 'Keeps one enforcement point', 'Avoids ceremony on reads']
      ),
    ],
    english: english(
      [
        ['transaction boundary', 'the span in which writes commit or roll back as one unit', 'The application service defines the transaction boundary.'],
        ['DTO', 'an explicit data shape crossing the transport layer', 'We return a DTO so the entity never becomes our API.'],
      ],
      [
        'I keep orchestration in the application service so the domain stays free of ___.',
        'The failure we avoid is ___, which is why the gateway call sits outside the transaction.',
      ],
      'Requests enter through the controller, which only maps transport; the application service owns the transaction and orchestrates domain behaviour; the domain enforces invariants; repository ports are implemented by infrastructure adapters. Events are published only after commit.',
      [
        ['Code review: a colleague charges Stripe from a controller', 'Charging inside the transport layer puts network I/O inside the request and hides the invariant. Let us move it into the payment use case with an idempotency key.'],
      ],
      ['This controller is doing three jobs; let us keep it to mapping and move the use case into an application service.'],
      ['Publishing this event inside the transaction lets a consumer act on state we may roll back, so I publish after commit via an outbox.'],
      ['Walk me through a request across your layers, and how a consumer only sees committed state.'],
      'The controller translates transport and nothing else. The application service owns the use case and the transaction, invokes domain behaviour that enforces the invariant, persists through a repository port and returns a DTO. Integration events are published after commit, normally via an outbox, so a consumer can never observe state that rolls back.'
    ),
    aiReview: aiReview(
      'Ask an AI to review AccountController and verify its claims before applying them.',
      '"Add @Transactional to the controller and call the repository directly - simpler, fewer classes."',
      [
        'Transport-level transactions make the request the atomic unit; a batch job reusing the rule gets different semantics.',
        'Direct repository access duplicates invariants across entry points.',
      ],
      ['Ask which invariant the annotation protects and where it is tested', 'Run the batch-job path and compare audit fields'],
      'The advice removes indirection but breaks the boundary. Keep the transaction on the shared application service.'
    ),
    assessment: [
      quiz('M1.2-A1', 'conceptual', 'What defines the transaction boundary?', ['The REST controller method', 'The application service use case', 'The repository save call'], 1, 'The atomic unit is the business operation, not the entry point.'),
      quiz('M1.2-A2', 'conceptual', 'Why publish integration events after commit?', ['Kafka requires it', 'A consumer must never observe state that can still roll back', 'It reduces latency'], 1, 'Mid-transaction publishing exposes phantom state.'),
      quiz('M1.2-A3', 'code-tracing', 'A @Transactional method calls another @Transactional method of the same class. Result?', ['Both share one transaction', 'The inner call bypasses the proxy and no new transaction starts', 'Spring throws an exception'], 1, 'Self-invocation never crosses the proxy.'),
      quiz('M1.2-A4', 'debugging', 'An endpoint returns 409 for a case business considers valid. First place to look?', ['Status-code mapping', 'Whether the invariant is implemented twice', 'The email index'], 1, 'Duplicated invariants drift; compare implementations first.'),
      quiz('M1.2-A5', 'design', 'A read-only product listing endpoint: which architecture?', ['Five-layer stack with domain objects', 'Controller -> query service -> read model', 'Controller -> repository exposing entities'], 1, 'Read paths need no invariant enforcement but must not leak entities.'),
    ],
    // MODULES_END
  }),
  defineModule({
    id: 'M1.3',
    phase: 'M1',
    order: 3,
    title: 'Infrastructure Architecture',
    subtitle: 'Gateway, discovery, configuration, secrets, messaging, topology and failure modes',
    estimatedMinutes: 120,
    prerequisites: ['M1.2'],
    learningObjective:
      'Design the initial production topology of the capstone, then explain every component, its configuration source and its failure mode without reading a diagram back.',
    stackFocus: ['Spring Cloud Gateway', 'Docker Compose', 'PostgreSQL', 'Kafka', 'Config/Secret injection'],
    executionMode: 'REAL_EXECUTABLE',
    whyItMatters:
      'Infrastructure decides what can fail independently. If the gateway, database or broker is a single shared dependency for everything, service boundaries buy nothing in production.',
    explanation: {
      whatItIs:
        'The runtime substrate: an edge gateway, service instances with health endpoints, a routing/discovery mechanism, configuration and secret sources, datastores, a broker and observability collectors.',
      whyItExists:
        'A service is deployable only if it can be addressed, configured, secured and observed. Infrastructure is the contract between code and operations.',
      problemSolved:
        'Stable entry points, environment-specific configuration without rebuilds, secrets outside the repository, and one place to observe and throttle traffic.',
      internals:
        'The gateway matches routes by path/host, applies filters (auth, correlation id, rate limit, timeout) and forwards to a resolved instance. Configuration is resolved at boot from the environment; secrets are injected at runtime and never baked into images.',
      runtimeBehaviour:
        'Instance resolution happens per request, so a stale instance list causes 502s until health checks evict it. A missing route timeout looks like a hang at the edge while downstream work continues.',
      tradeoffs:
        'A gateway centralises cross-cutting concerns but becomes a shared failure point and a potential bottleneck; discovery adds indirection; a config server adds a boot-time dependency.',
      whatCanFail:
        'Gateway single point of failure, stale registry entries, secret rotation without restart, database connection-pool exhaustion, broker unavailability, clock skew between hosts.',
      howToObserve:
        'Edge rate/error/latency, gateway 502/504 rate, health transitions, config reload events, pool saturation, broker under-replicated partitions.',
      howToDebug:
        'Start at the edge: route matched? instance healthy? request reached the service? dependency reachable? Move one layer at a time, edge log then service log.',
      howToFix:
        'Redundant gateway instances, health-based eviction, explicit per-route timeouts, environment-sourced configuration validated at startup, bounded connection pools.',
      whenNotToUse:
        'No gateway for a single service; no service mesh before you have many services and a real traffic-management need.',
      seniorQuestion:
        'Remove the gateway from your diagram. Which of its jobs was essential, and where would that job live otherwise?',
    },
    keyPoints: [
      'Every shared infrastructure component is a shared failure domain.',
      'Configuration comes from the environment; secrets never enter an image or the repository.',
      'Per-route timeouts plus health-based eviction stop the edge amplifying failures.',
      'Stale instance lists are a common 502 source; health checks are the eviction mechanism.',
      'Failed startup must be loud: validate configuration at boot, not on first request.',
    ],
    conceptExercises: [
      concept(
        'M1.3-C1',
        'Draw the capstone topology with traffic direction and mark every component whose failure stops checkout.',
        'Gateway, order-service, inventory-service, payment provider and PostgreSQL are critical path; notification, mail and search are not.',
        'architecture'
      ),
      concept(
        'M1.3-C2',
        'For each component, name its failure mode and the observable signal that detects it.',
        'Gateway down -> 5xx at the load balancer with zero upstream traffic; DB pool exhaustion -> rising wait time then 503; broker down -> producer send failures plus consumer lag.',
        'observability'
      ),
      concept(
        'M1.3-C3',
        'Classify every configuration key as public, config or secret and state its source.',
        'Public: log level, flags. Config: datasource URL, topics, timeouts. Secret: DB password, Stripe key, webhook signing secret - injected at runtime, never committed, rotated without rebuild.',
        'production-engineering'
      ),
    ],
    codeLabs: [
      lab({
        id: 'M1.3-L1',
        title: 'Compose the topology and route through the gateway',
        minutes: 90,
        objective: 'Bring up gateway + account/product services with per-route timeout, correlation id and health-based routing.',
        context: 'The client must have one entry point and no knowledge of service ports or instance counts.',
        architecture: 'client -> compose network (gateway :8080) -> account-service :8081 | product-service :8082 -> postgres',
        problem: 'Add routes for /api/accounts/** and /api/products/**, attach correlation-id and timeout filters, expose health.',
        starter: `spring:
  cloud:
    gateway:
      routes:
        - id: accounts
          uri: http://account-service:8081
          predicates: [ Path=/api/accounts/** ]
`,
        lang: 'yaml',
        requirements: [
          'The client only ever talks to the gateway port.',
          'Every response carries the correlation id it received or generated.',
          'Per-route timeout is explicit - no unbounded wait.',
        ],
        constraints: ['No secrets in compose files; substitute from the environment.'],
        expectedBehaviour: 'GET :8080/api/products/SKU-100 returns the payload; stopping product-service yields 503/504 within the timeout instead of a hang.',
        testCases: [
          ['gateway up, service up', '200 through the gateway'],
          ['product-service stopped', 'bounded error within the timeout plus a clear edge log line'],
        ],
        hiddenFailures: ['Route points at the compose service name while the app listens on a different port.'],
        output: 'Stack healthy, curl through :8080 works, the failure path is bounded.',
        hints: ['Read the edge log first: it tells you whether the request ever left the gateway.'],
        explanation: 'The gateway is the only place for edge concerns: routing, correlation, timeouts, auth and rate limiting.',
        extension: 'Add per-route rate limiting and prove a burst is rejected with 429 instead of queueing indefinitely.',
      }),
    ],
    debuggingExercises: [
      debugEx(
        'M1.3-D1',
        'After a rolling restart, 3% of requests return 502 for 40 seconds.',
        'Edge 502 spike correlated with service restarts.',
        ['instance list refreshed every 30 s', 'shutdown takes 20 s', 'health-check interval 10 s'],
        'Explain the 502 window and choose the cheapest fix.',
        'Stale instance list plus slow deregistration: the gateway keeps routing to an instance that is stopping. Fix with fast health-based eviction plus graceful draining.',
        ['correlate 502 timestamps with instance start/stop events', 'check health interval and eviction delay']
      ),
    ],
    failureLabs: [
      failure({
        id: 'M1.3-F1',
        title: 'The gateway that hides a dead dependency',
        minutes: 60,
        bug: 'Gateway routes have no timeouts and no health-based eviction, and the product route points at a service that is stopped.',
        reproduce: ['docker compose stop product-service', 'curl -m 30 http://localhost:8080/api/products/SKU-100'],
        observe: [
          'curl waits the full 30 s instead of failing fast',
          'gateway logs show the request as "pending" with no upstream response',
          'client-side threads pile up while the gateway holds connections',
        ],
        hypotheses: [
          'The gateway module is broken and needs a restart.',
          'No route timeout and no instance eviction: the edge waits on a dead upstream and converts one failure into many.',
          'PostgreSQL is refusing connections.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#1 rejected: restarting changes nothing; the behaviour is deterministic on a stopped upstream.',
          '#3 rejected: the product route never reaches the database - no SQL appears in the service log.',
        ],
        investigate: [
          ['curl -w "%{time_total}" through the gateway vs directly to the stopped port', 'gateway waits seconds; direct call fails immediately', 'The delay is introduced by the edge, not by the service.'],
          ['Inspect gateway route configuration for timeout and health parameters', 'no response-timeout, no eviction setting', 'Missing defaults are the root configuration defect.'],
        ],
        debugOptions: ['Missing edge failure configuration: unbounded wait and no eviction.', 'Network partition between Docker networks.'],
        correctRootCause: 0,
        fixOptions: [
          'Set an explicit per-route response timeout below the client budget and enable health-based eviction so dead instances are removed quickly.',
          'Increase the client timeout to 60 s so the request eventually succeeds.',
        ],
        correctFix: 0,
        fixRejection: ['#2 rejected: that hides the failure and multiplies resource usage - it proves the opposite of resilience.'],
        verify: [
          ['Repeat the stopped-upstream test', 'fast failure within the configured timeout plus an edge log naming the upstream', 'The failure is now bounded and attributable.'],
        ],
        explainPrompt: 'Why does an unbounded timeout at the edge turn one failing dependency into a platform-wide incident?',
        modelExplanation:
          'Without a timeout the edge holds each request until the client gives up, so threads, connections and client retries accumulate; one dead upstream then exhausts the shared edge resources. The fix bounds the wait and evicts unhealthy instances so capacity is released.',
        patterns: ['Timeout budgeting', 'Health-based eviction', 'Fail fast', 'Bulkhead'],
        dimension: 'reliability',
      }),
    ],
    defenseQuestions: [
      defense(
        'M1.3-D1',
        'Why put a gateway in front of the capstone?',
        'One entry point for clients, plus one place for cross-cutting edge policy: routing, correlation ids, authn termination, rate limiting and timeout budgets. Without it each service re-implements the same edge concerns inconsistently.',
        'architecture',
        ['Names concrete edge responsibilities', 'Mentions consistency', 'Acknowledges shared failure risk']
      ),
      defense(
        'M1.3-D2',
        'Why must secrets never be baked into images?',
        'Images are copied, cached and pushed to registries; a baked secret leaks on every pull and cannot be rotated without a rebuild. Runtime injection keeps rotation cheap and audit possible.',
        'production-engineering',
        ['Mentions image distribution', 'Rotation cost', 'Auditability']
      ),
      defense(
        'M1.3-D3',
        'How do you decide the timeout of an edge route?',
        'Work backwards from the user-facing budget: subtract the client retry allowance and downstream hops; the edge timeout must be shorter than the caller expects, and each service sets its own dependency timeouts below its own.',
        'reliability',
        ['Timeout budget reasoning', 'Hierarchy of timeouts', 'Avoids unbounded waits']
      ),
      defense(
        'M1.3-D4',
        'What is the failure mode of service discovery, and how do you reduce its blast radius?',
        'A stale instance list routes traffic to dead or stopping instances, producing 502s. Reduce it with short health intervals, fast eviction, graceful shutdown draining and client-side retry with idempotency.',
        'distributed-systems',
        ['Names staleness', 'Eviction/draining', 'Safe retry']
      ),
      defense(
        'M1.3-D5',
        'Which infrastructure component would you make redundant first?',
        'The gateway and the database writer path, because both are shared dependencies on the checkout critical path; redundancy is chosen by blast radius, not by component popularity.',
        'architecture',
        ['Prioritises by blast radius', 'Names shared dependencies', 'Acceptable alternative with justification']
      ),
    ],
    english: english(
      [
        ['blast radius', 'the scope of impact when a component fails', 'A shared gateway failure has a platform-wide blast radius.'],
        ['timeout budget', 'the time allocation each hop may consume inside the caller expectation', 'The edge timeout must sit inside the client timeout budget.'],
      ],
      [
        'The critical path for checkout is ___, so the first redundancy investment is ___.',
        'We bound this hop at ___ ms because the caller allows only ___ ms in total.',
      ],
      'Clients talk only to the gateway, which terminates auth, adds a correlation id and applies a timeout to each route. Services are stateless, configured from the environment, own their schemas and expose a health endpoint. Kafka carries asynchronous facts, and logs and metrics are collected centrally.',
      [
        ['Stakeholder asks about a 502 spike during deployments', 'During rolling restarts the edge briefly routed to instances that were already stopping. We shortened health eviction and enabled graceful draining; the window is now under five seconds.'],
      ],
      ['This route has no timeout, so a single dead upstream can hold edge threads indefinitely - let us bound it inside the client budget.'],
      ['If the gateway is a shared dependency, what is the blast radius if it fails, and what redundancy do we buy first?'],
      ['Walk me through the request path from the client to the database.', 'Which component on that path is your biggest shared failure domain, and why?'],
      'The client talks only to the gateway. The gateway terminates authentication, stamps a correlation id and enforces a per-route timeout inside the client budget. Each service is stateless, configured from the environment, owns its schema and reports health so the edge can evict unhealthy instances. Kafka carries asynchronous facts, and all logs and metrics are centralised. The biggest shared failure domains are the gateway and the database writer, so those get redundancy first.'
    ),
    aiReview: aiReview(
      'Ask an AI to design the production topology for the capstone and inspect the result for shared failure domains.',
      '"Use one gateway, one PostgreSQL instance for all services and one Kafka cluster; add Kong and a service mesh for security."',
      [
        'One PostgreSQL instance for all services contradicts database-per-service and recreates a shared release.',
        'The mesh is recommended before any measured traffic-management need exists.',
      ],
      ['Ask which component is on the checkout critical path and what happens when it fails', 'Check whether each service has its own schema owner'],
      'Partly usable: the single entry point is right, but the shared database reintroduces coupling and the mesh is premature. Correct design: per-service schemas, redundant gateway, and only add a mesh when routing/security needs are measured.'
    ),
    architectureChallenge: {
      id: 'M1.3-AC1',
      title: 'Design the initial production topology',
      scenario:
        'You must hand over a topology that a platform team can implement without asking you questions: environments, entry point, services, data stores, broker, configuration and secrets, plus the failure mode of every element.',
      requirements: [
        'Client -> gateway -> services with per-route timeout and correlation id.',
        'Each service owns its schema; document the owner of every table.',
        'Configuration and secret sources named per environment (local, staging, production).',
        'For every component: failure mode, blast radius, detection signal and mitigation.',
      ],
      constraints: [
        'No component may be added without a named problem it solves.',
        'Budget: the topology must run on three nodes in staging.',
      ],
      deliverables: [
        'Topology diagram with traffic direction and hops per business transaction.',
        'Failure-mode table (component, mode, blast radius, signal, mitigation).',
        'Configuration inventory classified public/config/secret with its source.',
      ],
      failureModes: [
        'Gateway single point of failure',
        'Database connection-pool exhaustion',
        'Kafka unavailable while the checkout path still writes synchronously',
        'Secret rotation without application restart',
      ],
      tradeoffQuestions: [
        { question: 'Why not route clients directly to services?', modelAnswer: 'Cross-cutting edge policy would be duplicated per service and clients would need to know topology, which changes on every scale event.' },
        { question: 'Why is a service mesh not in this design?', modelAnswer: 'No measured need: with a handful of services, explicit client configuration and the gateway cover routing, retries and correlation. A mesh adds a control plane and latency before the requirement exists.' },
      ],
    },
    assessment: [
      quiz('M1.3-A1', 'conceptual', 'Why is a shared database the most dangerous shared infrastructure component?', ['It is slow', 'It couples releases and turns schema changes into coordinated deployments', 'It costs more'], 1, 'Schema is a contract; sharing it recreates monolith coupling.'),
      quiz('M1.3-A2', 'scenario', 'A route has no timeout. A stopped upstream causes what at the edge?', ['An immediate 503', 'Requests wait until the client gives up, consuming edge threads and connections', 'Automatic failover'], 1, 'Without a bound, one dead upstream becomes a shared resource exhaustion event.'),
      quiz('M1.3-A3', 'design', 'Where should the Stripe secret live?', ['application.yml committed to the repo', 'Baked into the Docker image', 'Injected at runtime from a secret store'], 2, 'Secrets are injected at runtime so rotation needs no rebuild and audit stays possible.'),
      quiz('M1.3-A4', 'debugging', 'A 502 spike lasts exactly as long as service restarts. Most likely cause?', ['PostgreSQL failover', 'Stale instance list plus slow deregistration', 'DNS TTL of one hour'], 1, 'The edge keeps routing to stopping instances until health eviction catches up.'),
    ],
    // MODULES_END
  }),
];
