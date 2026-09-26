/**
 * PHASE M4 — Microservices Distributed-System Foundations.
 *
 * M4 turns the boundary, service, domain, outbox and Kafka foundations into a
 * hands-on Senior experience: every module carries a full 12-stage explanation
 * framework, real code labs, debugging drills, failure labs that walk
 * BUG → REPRODUCE → OBSERVE → HYPOTHESIS → INVESTIGATE → DEBUG → FIX → VERIFY
 * → EXPLAIN, an architecture challenge and adversarial defense questions.
 *
 * Honesty contract: labs that a learner can really build and run locally are
 * REAL_EXECUTABLE; reasoning labs whose technology cannot run in this browser
 * are SIMULATED and labelled as such in the UI; design-only artefacts are
 * SPECIFICATION. No runtime result is ever fabricated.
 */
import type { MsCapstoneSnapshot, MsIncident, MsModule, MsPhaseMeta } from './types';
import { expandModule } from './compact';
import { debugEx } from './authoring';

export const MS_M4_PHASE: MsPhaseMeta = {
  id: 'M4',
  order: 4,
  title: 'Microservices Distributed-System Foundations',
  subtitle: 'Boundaries, service foundation, DDD, outbox and Kafka under real failure',
  goal:
    'Earn every remaining distributed-systems decision with evidence: draw boundaries that protect invariants, build services that behave under concurrency, model a domain that cannot be corrupted, publish events without the dual-write hole, and operate Kafka with idempotency and bounded lag.',
  sessions: 'Source sessions 18–27',
  architectureMilestone:
    'gateway + account/product/order/inventory/payment services with per-service schemas, a rich domain model, an outbox relay publishing versioned events, and Kafka consumers that are idempotent, bounded, observable and DLQ-backed.',
};

/** PHASE M4 — MICROSERVICES DISTRIBUTED-SYSTEM FOUNDATIONS. */
export const MS_M4_MODULES: MsModule[] = [
  expandModule({
    id: 'M4.1',
    phase: 'M4',
    order: 1,
    title: 'Architecture Foundations: Boundaries, Ownership, Trade-offs',
    subtitle:
      'Monolith vs modular monolith vs services, bounded context, coupling, cohesion, database-per-service, sync vs async, consistency and availability',
    minutes: 180,
    prerequisites: ['M3.3'],
    objective:
      'Decide and defend service boundaries, data ownership, communication mechanism and transaction boundaries on measurable criteria — and name the trade-off you accepted for each decision.',
    stack: ['Spring Boot 4.1', 'PostgreSQL', 'Docker Compose', 'ADR', 'Kafka'],
    why:
      'Every later decision in this track — outbox, Kafka, DDD, resilience, Kubernetes — inherits the boundary map. A boundary drawn for the wrong reason cannot be rescued by adding infrastructure.',
    explanation: [
      'A monolith is one deployable unit; a modular monolith is one deployable unit with enforced internal modules; microservices are independently deployable units that own their data. The distinction is deployability and data ownership, never code volume.',
      'The split exists for organisational and operational reasons: many teams needing independent release and independent scaling of capabilities with different load and change profiles. Nothing about "clean code" requires a network hop.',
      'It solves independent deployment and isolated scaling — and it creates partial failure, duplicate delivery, eventual consistency windows and versioned contracts that did not exist inside one process.',
      'A boundary is defined by the invariant it protects plus the team that owns it. Mechanically it is enforced by a separate schema, a separate migration history, a separate pipeline and an explicit contract; without those it is only a package name.',
      'A request crosses processes: serialisation, latency, timeouts, retries, duplicate delivery, clock skew and the lost-response ambiguity (the callee committed, the caller timed out). Any call can fail after the remote side already committed.',
      'You buy autonomy, isolated scaling, failure isolation and independent technology choices; you pay with distributed transactions, duplicated infrastructure, contract versioning, observability cost and heavier on-call duty.',
      'Chatty boundaries (N+1 network calls), shared tables (hidden coupling that re-creates the monolith), cyclic dependencies, distributed monoliths that must deploy together, and read models that lag the write they describe.',
      'Per-service rate/error/latency, the dependency graph, synchronous hops per business transaction, deploy history per service, and the number of services that must be released together.',
      'Ask "what must be released together?" — if the answer is "two services", the boundary is wrong; then measure chatty paths (call counts per request) and find shared-schema access in the query logs.',
      'Move one capability behind an explicit contract, give it its own schema, delete the code path that reached into the old tables, and add a contract test plus a deploy-history check that proves independence.',
      'Do not split when one team owns everything, when the invariant spans two services and needs a distributed transaction on every write, or when the capability has no independent scaling or change profile. A modular monolith with enforced modules is the correct answer surprisingly often.',
      'You extracted inventory-service and now every checkout needs a synchronous call to it. What is the availability of your checkout path now, and what did you actually buy with that boundary?',
    ],
    keys: [
      'A boundary is justified by the invariant it protects and the team that owns it, not by an entity name.',
      'Database-per-service is the enforcement mechanism: shared tables mean a shared release train.',
      'Every synchronous hop multiplies downtime probability; chain availability is the product of the hops.',
      'Eventual consistency is a product decision — the UI must be able to say "processing".',
      'Measure the trade-off: independent deployability versus partial failure and duplicated data.',
      'When one team owns the whole domain and invariants span it, a modular monolith is the honest answer.',
    ],
    concepts: [
      [
        'Assign every capstone entity (user, product, stock, cart, order, payment, invoice, notification) to exactly one owning service, justified by the invariant it protects.',
        'Order owns the order state machine, Inventory owns stock reservation, Payment owns payment-intent state; the customer appears in Order but only Account may write the canonical profile.',
        'architecture',
      ],
      [
        'Rewrite the monolith schema into per-service schemas and list every cross-schema JOIN currently used.',
        'Each JOIN is a hidden synchronous dependency that must become an API call, a replicated read model or a deliberately duplicated denormalised field — with the choice written down.',
        'data',
      ],
      [
        'Score Product, Inventory and Order boundaries 1–5 on cohesion, coupling, data ownership and failure isolation. Which is weakest and why?',
        'Inventory is usually weakest: stock is touched by order creation, checkout, cancellation and warehouse sync, so one invariant is shared by four flows and coupling is high.',
        'architecture',
      ],
      [
        'Draw the checkout happy path with all synchronous calls and compute chain availability when each service is 99.9% available.',
        '0.999^5 ≈ 99.5%: the chain is less available than any single service, which is the argument for async steps, timeouts and circuit breakers.',
        'distributed-systems',
      ],
      [
        'Name five distributed failure points that do not exist in the monolith version of the same system.',
        'Partial commit, duplicate delivery, out-of-order events, partition between services, and the lost-response case where the caller times out although the callee committed.',
        'distributed-systems',
      ],
      [
        'For checkout, decide synchronous versus asynchronous per step and justify it by the customer-visible promise.',
        'Price and stock reservation must answer before payment (synchronous with timeout and reservation TTL); invoicing, email and analytics are reactions after commit (asynchronous).',
        'system-design',
      ],
    ],
    labs: [
      {
        id: 'M4.1-L1',
        title: 'Extract a bounded context with its own schema and an ADR',
        minutes: 120,
        objective:
          'Split inventory out of the monolith into an independently deployable service that owns its schema, and record the boundary decision as an ADR with the invariant, the owner and the accepted trade-off.',
        context:
          'Order creation, checkout, cancellation and the warehouse sync job all write the stock table. One migration blocks five flows and no one can say who owns stock.',
        architecture:
          'monolith (order, cart, checkout) -> inventory-service (own schema inventory_service) -> PostgreSQL; synchronous reservation API + asynchronous stock-changed event',
        problem:
          'Create inventory-service with an explicit reservation contract (reserve, confirm, release, query), its own Flyway migrations, an idempotency key per reservation and an ADR documenting the boundary.',
        starter: `@RestController
@RequestMapping("/api/v1/inventory")
class InventoryController(private val reservations: ReservationApplicationService) {
  @PostMapping("/reservations")
  fun reserve(@RequestHeader("Idempotency-Key") key: String, @Valid @RequestBody request: ReserveRequest): ReservationResponse =
    reservations.reserve(key, request)   // TODO: TTL, idempotency, invariant
}`,
        lang: 'kotlin',
        requirements: [
          'inventory_service schema owns the stock table; no cross-schema foreign keys remain.',
          'Reserve is idempotent per Idempotency-Key and returns the original response on replay.',
          'Reservations carry a TTL and are released by a scheduled sweeper.',
          'Stock can never be reserved below zero, proven by a concurrency test.',
          'docs/adr/ADR-0xx-inventory-boundary.md records invariant, owner, contract and accepted trade-off.',
        ],
        constraints: [
          'The monolith must not keep a second write path to stock.',
          'No distributed transaction across order and inventory: reservation plus compensation only.',
        ],
        expectedBehaviour:
          'Checkout reserves stock through one API call; a concurrent oversell attempt is rejected; the monolith no longer contains stock writes.',
        testCases: [
          ['two checkouts race for the last unit', 'exactly one reservation succeeds, the other receives a conflict'],
          ['replay a reservation with the same Idempotency-Key', 'one row, identical response body'],
          ['let a reservation expire unused', 'the sweeper releases the stock and the quantity returns'],
        ],
        hiddenFailures: [
          'Reserving stock with a SELECT-then-UPDATE outside a single transaction oversells under concurrency.',
          'Writing the idempotency record after committing the reservation reopens the duplicate window.',
        ],
        output:
          'Reservation API deployed with its own schema, ADR merged, concurrency test proving the zero-overstock invariant.',
        hints: [
          'Enforce the invariant in the UPDATE predicate (available >= quantity) so the database rejects the oversell.',
          'Store the reservation key and the stock change in one transaction, then answer replays from the stored response.',
        ],
        verification:
          'Run the concurrency test with 50 parallel reservations on one unit; then answer the ADR question "what must be released together?" and confirm order-service can ship without inventory-service.',
        explanation:
          'A boundary is real only when ownership is enforced by a schema and an explicit contract; an ADR is the artefact that forces the invariant and the accepted trade-off to be written down before the code exists.',
        extension:
          'Publish stock.changed.v1 after commit and let the catalogue read model consume it; measure the propagation window and decide whether the storefront must say "processing".',
      },
      {
        id: 'M4.1-L2',
        title: 'Checkout survives a downstream outage: sync vs async decision',
        minutes: 100,
        objective:
          'Decide per checkout step whether it must be synchronous, then make the synchronous part fail fast and the asynchronous part retry until it succeeds.',
        context:
          'Checkout calls pricing, inventory, payment and notification in one chain. Payment latency is fine, the notification provider is not, and customers see 500s when email fails.',
        architecture:
          'client -> gateway -> checkout orchestrator -> (sync: pricing, inventory reserve, payment intent) and (async: Kafka checkout.completed.v1 -> notification, invoice, analytics)',
        problem:
          'Restructure the flow: bound every synchronous call with a timeout and an idempotency key, publish one checkout.completed.v1 event after commit, and make email/invoice failures invisible to the customer.',
        starter: `@Service
class CheckoutOrchestrator(
  private val inventory: InventoryClient,
  private val payments: PaymentClient,
  private val outbox: OutboxWriter,   // publish after commit (M4.4)
) {
  @Transactional
  fun checkout(command: CheckoutCommand): CheckoutResult { /* TODO: order the steps, bound the calls */ }
}`,
        lang: 'kotlin',
        requirements: [
          'No notification, invoice or analytics call happens inside the checkout transaction.',
          'Every synchronous call has a timeout, bounded retry with backoff and an idempotency key.',
          'Stopping the notification consumer leaves checkout functional; only the notification is delayed.',
          'A payment timeout that actually succeeded is never charged twice.',
        ],
        constraints: [
          'No distributed transaction and no two-phase commit.',
          'A failed payment must compensate the inventory reservation.',
        ],
        expectedBehaviour:
          'Checkout returns 200 and the event is published after commit; with the notification consumer stopped the customer result is unchanged while lag grows; after a timeout retry exactly one charge exists.',
        testCases: [
          ['stop the notification consumer, run 20 checkouts', 'all 20 succeed, notification lag grows, no checkout error'],
          ['payment times out after the charge succeeded, then retry', 'exactly one charge and one order'],
          ['fail the inventory reservation', 'no payment is attempted and no order is created'],
        ],
        hiddenFailures: [
          'Publishing inside the transaction sends events for orders that later roll back.',
          'Retrying a payment without the original idempotency key double-charges the customer.',
        ],
        output:
          'Async failure is invisible to the customer, synchronous hops are bounded, compensation restores the reservation.',
        hints: [
          'Write the compensation path (release reservation) as explicitly as the happy path.',
          'Derive the payment idempotency key from the order id so retries are naturally safe.',
        ],
        verification:
          'Stop one consumer, run the flow, verify checkout success with rising lag; start the consumer and verify lag returns to zero with no duplicate notification.',
        explanation:
          'Synchronous means the customer is waiting for the answer; if the customer is not waiting, the correct design is an event. Timeouts, bounded retries, idempotency keys and compensation are the price of the synchronous part.',
        extension:
          'Add a circuit breaker with a degraded-checkout fallback and measure the error budget when payment is 50% unavailable.',
      },
    ],
    debug: [
      debugEx(
        'M4.1-D1',
        'Two teams deploy independently but every release of order-service requires a matching release of inventory-service.',
        'Rolling back one service breaks the other in production; the release train is back, now with network hops.',
        [
          'both services read the same stock table through a shared database user',
          'order-service joins stock directly in its reporting query',
          'the contract between them is a database schema, not an API',
          'the deploy pipeline has a manual "release together" step',
        ],
        'Decide what actually keeps these two services coupled and remove the coupling mechanism.',
        'A shared database is a shared deployment: reading another service’s tables keeps the release trains welded together. Ownership must be enforced by schema plus contract, with the reporting query replaced by a read model fed by events.',
        ["SELECT * FROM pg_stat_user_tables WHERE schemaname = 'inventory_service'", 'grep -rn "inventory_service" services/order-service/src/main/resources/db']
      ),
      debugEx(
        'M4.1-D2',
        'Checkout latency tripled after a boundary refactor, and every business transaction now makes 9 cross-service calls.',
        'p95 grew from 180 ms to 640 ms without any change in business logic.',
        [
          'the order list endpoint resolves customer, price and stock per row (N+1 over HTTP)',
          'three of the nine calls exist only to enrich an email body',
          'one call repeats the same lookup for every line item',
        ],
        'Classify which calls must stay synchronous and which should become a projection, an event or a batched call.',
        'A chatty boundary is a design defect: enrichment nobody is waiting for belongs in an event consumer, repeated lookups must be batched or projected, and only calls that change the customer-visible answer stay on the request path.',
        ['grep -c "inventoryClient" logs/checkout-trace.json', 'curl -w "%{time_total}" -o /dev/null .../api/v1/orders?page=1']
      ),
    ],
    failures: [
      {
        id: 'M4.1-F1',
        title: 'The extraction that created a distributed monolith',
        minutes: 75,
        bug: 'Inventory was extracted into a service, but order-service kept the old stock write path "temporarily", so stock is written in two places and the writers disagree after every partial failure.',
        reproduce: [
          './scripts/checkout-race.sh --orders 30 --same-sku',
          'SELECT sku, quantity_on_hand FROM inventory_service.stock WHERE sku = <sku>',
          'SELECT sku, quantity_on_hand FROM order_service.stock WHERE sku = <sku>',
        ],
        observe: [
          'the two stock tables report different quantities for the same SKU',
          '30 orders were accepted while the stock table shows a negative quantity',
          'checkout p95 rose from 180 ms to 640 ms after the extraction',
          'both services must be released together, so the "independent" deployment never happened',
        ],
        hypotheses: [
          'The inventory service has a concurrency bug in its reservation logic.',
          'Two write paths to the same data exist: the boundary was drawn but never enforced, so the monolith still owns stock.',
          'Kafka replayed stock events and corrupted the counter.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#1 rejected: the reservation predicate is correct - the negative quantity appears in both tables, so two writers bypassed it.',
          '#3 rejected: there is no stock event consumer yet; the second writer is a direct database path inside the monolith.',
        ],
        investigate: [
          ['grep -rn "UPDATE stock" services/', 'the same UPDATE exists in order-service and inventory-service', 'Data ownership is not enforced: the boundary exists only in the diagram.'],
          ["SELECT count(*) FROM pg_stat_activity WHERE query LIKE '%stock%'", 'both services hold connections that touch stock', 'A shared schema is a shared release train, which is why both services deploy together.'],
        ],
        debugOptions: [
          'The boundary was not enforced: a second write path to stock still exists inside the monolith.',
          'The inventory service needs a stronger lock on the reservation row.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Delete the monolith write path, revoke cross-schema access, route every stock change through the reservation API and add a CI check that fails on cross-schema access.',
          'Add a database trigger that keeps the two stock tables in sync.',
        ],
        correctFix: 0,
        fixRejection: [
          'A trigger synchronises two copies of one invariant and hides the coupling; the ownership question stays unanswered.',
        ],
        verify: [
          ['./scripts/checkout-race.sh --orders 30 --same-sku', 'exactly one order per available unit, no negative quantity', 'One writer means one invariant.'],
          ['grep -rn "order_service" services/inventory-service/src || true', 'no cross-schema reference remains', 'Ownership is enforced by the schema, not by convention.'],
        ],
        explainPrompt:
          'Explain how a boundary can exist in the diagram and not in the system, and what really enforces it.',
        modelExplanation:
          'A boundary is enforced by ownership: one writer, one schema, one deploy pipeline, one contract. This extraction moved code but left the data shared, so nothing about failure isolation or independent deployment changed - the services still raced on the same rows and still had to be released together. Enforcing the boundary required deleting the second write path, revoking cross-schema access and adding a CI check so the coupling cannot silently return; the latency regression was a signal, not the disease.',
        patterns: ['Database-per-service', 'Shared database anti-pattern', 'Distributed monolith', 'CI-enforced ownership'],
        dimension: 'architecture',
      },
    ],
    design: {
      id: 'M4.1-AC1',
      title: 'Boundary challenge: design the checkout domain',
      scenario:
        'A retailer runs one Spring Boot monolith with 11 developers in 3 teams. Checkout, catalogue, stock and invoicing share one schema and one release train. Catalogue changes 40 times a month, stock code has never been touched in 8 months, checkout is released weekly, and invoicing is audited. Leadership wants "microservices" this quarter.',
      requirements: [
        'Decide service boundaries: name each service, its single owning invariant and the team that owns it.',
        'Decide ownership: who may write each entity, and which fields are deliberately duplicated instead of shared.',
        'Decide the communication mechanism per flow: synchronous call with timeout, or event after commit — and justify by what the customer is waiting for.',
        'Decide data ownership: one schema per service, plus the read models each consumer needs.',
        'Decide transaction boundaries: which invariants must stay in one ACID transaction and which become eventually consistent with compensation.',
        'State which capability you deliberately keep in the monolith and why.',
      ],
      constraints: [
        'No shared database between services and no distributed transactions.',
        'Three teams, one on-call rotation: total services must stay operable by those three teams.',
        'The invoicing audit trail must not lose a single event.',
        'Catalogue changes must not require a checkout release.',
      ],
      deliverables: [
        'A boundary map with invariants, owners and contracts per service.',
        'An ADR per boundary with the accepted trade-off written down.',
        'A sequence diagram of checkout marking every synchronous hop with a timeout.',
        'A list of deliberately duplicated fields with the reconciliation rule for each.',
      ],
      failureModes: [
        'Boundary split by technical layer instead of business capability, producing a distributed monolith.',
        'One invariant owned by two services, which guarantees divergence after the first partial failure.',
        'A synchronous chain of five hops with no timeout, which multiplies downtime instead of isolating it.',
        'Everything asynchronous including price and stock, which breaks the checkout promise to the customer.',
      ],
      tradeoffQuestions: [
        {
          question: 'Which boundary did you choose not to draw, and what convinced you?',
          modelAnswer:
            'Invoicing shares the order transaction and is audited, so splitting it would require a distributed transaction on every checkout; keeping it inside order-service while enforcing modules keeps the audit invariant in one ACID transaction. The cost is one larger deployable unit and a harder future extraction, which is a better trade than breaking an audited invariant.',
        },
        {
          question: 'Your stock service is called synchronously by checkout. What happens when it is down for 10 minutes?',
          modelAnswer:
            'Checkout fails fast with a bounded timeout and a retry budget; the customer sees an explicit "cannot confirm stock" state rather than a hung request, and the reservation attempt is idempotent so the retry cannot double-reserve. If stock availability is a hard requirement, a queued checkout with a deferred confirmation is the alternative — and that changes the product promise, so it is a business decision, not a technical one.',
        },
        {
          question: 'Which data are you willing to duplicate, and how does it stay correct?',
          modelAnswer:
            'I duplicate product name and price into the order line at checkout time, because the order must freeze the price the customer agreed to; reconciliation is not needed for that snapshot by design. I do not duplicate stock quantities, because two writers to one invariant guarantee divergence; instead I expose a projection refreshed from stock events with a measured lag.',
        },
      ],
    },
    defense: [
      [
        'You split a monolith into six services and the on-call burden tripled. Justify the architecture or change it.',
        'I would stop defending and start measuring: independent deploy frequency per service, number of incidents caused by cross-service interactions, and the count of changes that still require two services to ship together. If the split did not buy deploy independence or failure isolation, it bought cost only — so I would merge the boundaries that never deploy independently and keep the ones that do. Architecture change is justified by evidence, and that same evidence would have justified not splitting in the first place.',
        'architecture',
        ['Refuses to defend a decision with no measured benefit.', 'Names concrete metrics.', 'Accepts re-merging as a legitimate outcome.', 'Frames it as an evidence-driven decision.'],
      ],
      [
        'Your team wants to add Kafka to reduce coupling between services that already call each other synchronously. Argue for or against.',
        'Kafka does not remove coupling; it moves coupling from a call-time contract to an event-schema contract with a lag. If the requirement is "the caller must not wait", the event is correct; if the requirement is "the caller needs the answer now", Kafka adds a hop and an eventual-consistency window without removing the dependency. I would ask what the customer is waiting for, and only then choose the mechanism.',
        'distributed-systems',
        ['Distinguishes coupling in space from coupling in time.', 'States the criterion used.', 'Names the cost honestly.', 'Refuses a framework-of-the-month answer.'],
      ],
      [
        'A junior engineer says two services should share one database table "just for reporting". Your answer?',
        'Shared tables are shared deployments: that reporting query would make both services depend on the same schema and release together, which is exactly what the boundary was meant to remove. The correct answer is a read model — a replica, a materialised view owned by the reporting service, or an event-fed projection — with a measured staleness window. The cost is duplicated storage and a lag budget; the benefit is that neither service can break the other’s release.',
        'communication',
        ['Explains the real consequence, not just a rule.', 'Offers a workable alternative.', 'Names the cost of the alternative.', 'Keeps the tone actionable rather than authoritative.'],
      ],
    ],
    english: [
      [
        ['bounded context', 'A boundary inside which one model and one vocabulary are consistent and owned by one team.', 'Checkout and catalogue are separate bounded contexts: the word "product" does not mean the same thing in both.'],
        ['service boundary', 'The line that decides which invariant a service owns and who may write it.', 'We drew the service boundary around stock reservation, because that invariant must never be shared.'],
        ['coupling and cohesion', 'Coupling is how much a change leaks across a seam; cohesion is how strongly the parts inside it belong together.', 'High cohesion with low coupling is the goal; most refactors move code and leave both unchanged.'],
        ['database per service', 'Each service owns its schema, so no other service reads or writes its tables.', 'Database per service is what makes a boundary enforceable rather than aspirational.'],
        ['distributed transaction', 'A transaction spanning several services; in practice it is replaced by local transactions plus compensation.', 'We removed the distributed transaction and used a reservation with an explicit compensating release.'],
      ],
      [
        'A boundary is only real when ownership is enforced by a schema and a contract.',
        'We pay for autonomy with partial failure and eventual consistency — and we accepted that trade explicitly.',
        'If two services must be released together, they are one service with extra latency.',
      ],
      'We split the system by invariant and owner rather than by entity: each service owns its schema, exposes an explicit contract and can be released on its own. Checkout keeps the calls it must wait for — price, stock reservation and payment — with timeouts and idempotency keys; invoicing, email and analytics are reactions published after commit. The trade-off we accepted is partial failure and eventual consistency on the read side, and we chose it deliberately because the alternative was one release train for every capability.',
      [
        ['A downstream service outage degrades checkout', 'We are failing fast on the stock reservation with a bounded timeout instead of letting requests hang; customers get an explicit unavailable state and the reservation retries are idempotent.'],
        ['Two services drift after a partial failure', 'Both services were writing the same invariant, which means the boundary was never enforced; we are removing the second write path and adding a CI check so it cannot return.'],
      ],
      [
        'This reporting query reads another service’s table, so it couples the releases; a read model would remove it.',
        'This contract change removes a response field that existing consumers rely on.',
        'This call has no timeout, so one slow dependency can hold a request thread indefinitely.',
      ],
      [
        'Which invariant does this service own, and who else writes it?',
        'Is the customer waiting for the answer here, or only for the effect?',
        'What trade-off are we accepting, and how will we know it was wrong?',
      ],
      [
        'When would you deliberately choose a modular monolith over microservices?',
        'How do you decide what stays synchronous in a distributed flow?',
        'How do you defend a boundary you have drawn?',
      ],
      'A service boundary is decided by the invariant it protects and the team that owns it, and it is enforced by a separate schema, an explicit contract and its own pipeline. Splitting buys independent deployment and failure isolation but costs partial failure, eventual consistency and operational surface, so I split only where deployment really is independent. Everything the customer waits for stays synchronous with a timeout and an idempotency key; everything else becomes an event published after commit. If two services must be released together, the boundary was wrong and I would merge them.',
    ],
    ai: [
      'Ask an AI to review a proposal that splits a 4-service e-commerce backend further, and to justify each new boundary.',
      'The AI proposes 14 services, one per entity (customer, address, cart, cart-item, order, order-line, payment, invoice, notification, product, category, price, stock, review), each with its own database, communicating only through events.',
      [
        'Entity-per-service splits invariants: order and order-line cannot be one transaction, so the order state machine becomes unenforceable.',
        '14 services with one team means every incident now crosses three deployables and an on-call rotation of three people.',
        'All-events means checkout must wait for an eventual-consistency window before it can answer the customer.',
        'No boundary in the proposal names the invariant it protects, which is the symptom that produced the entity split.',
      ],
      [
        'Ask which invariant each proposed service owns, and what happens if two of them disagree.',
        'Ask what the customer is waiting for at checkout and whether the proposal can still answer synchronously.',
        'Ask how many services one on-call engineer can operate at 03:00, and which services would be merged first.',
      ],
      'The AI produced a boundary map by entity taxonomy rather than by invariant and ownership. Correct outcome: 4–6 services grouped by invariant and team, database-per-service with explicit contracts, synchronous only where the customer waits, and a written ADR per boundary naming the accepted trade-off.',
    ],
    quiz: [
      ['conceptual', 'What makes a service independently deployable in practice?', ['A separate repository', 'Its own schema, contract and pipeline with no shared tables', 'A separate programming language', 'A Docker image'], 1, 'Independence is enforced by ownership, not by packaging.'],
      ['conceptual', 'Chain availability with five synchronous 99.9% services is closest to:', ['99.9%', '99.5%', '99.99%', '95%'], 1, '0.999^5 ≈ 0.995 — every hop multiplies the failure probability.'],
      ['scenario', 'Catalogue changes 40×/month and stock code has been frozen for 8 months. Which extraction is justified first?', ['Stock', 'Invoicing', 'Catalogue', 'None'], 2, 'Change frequency plus independent scaling is the practical signal for extraction.'],
      ['scenario', 'Two services must always be released together. What is the cheapest correct action?', ['Add a service mesh', 'Merge them back into one deployable unit', 'Add more contract tests', 'Move them onto the same database'], 1, 'The coupling is real; merging removes the cost and the pretence.'],
      ['design', 'Which of these invariants must stay inside one ACID transaction?', ['Analytics counters', 'Search index freshness', 'Stock can never be reserved below zero', 'Email delivery'], 2, 'An invariant that must never be violated requires one writer and one transaction.'],
      ['conceptual', 'What is a distributed monolith?', ['A monolith deployed in containers', 'A system split into services that still share data and must deploy together', 'A monolith using Kafka', 'A service with two databases'], 1, 'Coupling in time (deploy) and space (data) is what makes it distributed but monolithic.'],
      ['debugging', 'Checkout p95 tripled with no logic change after an extraction. Most likely cause?', ['JVM warmup', 'An N+1 pattern of cross-service calls on the request path', 'Kafka retention', 'DNS resolution'], 1, 'Count the calls per request; chatty boundaries show up immediately.'],
      ['design', 'Which call should stay synchronous in checkout?', ['Invoice PDF generation', 'Loyalty-points accrual', 'Stock reservation before payment', 'Marketing event publishing'], 2, 'If the customer is waiting for the answer, the call is synchronous with a bounded timeout.'],
      ['scenario', 'A team proposes a distributed transaction (2PC) across order and inventory. Your response?', ['Approve it, it guarantees consistency', 'Use local transactions plus a reservation and a compensating release', 'Replace it with a longer timeout', 'Move both to one service only'], 1, 'Compensation is the distributed-systems answer; 2PC couples availability to the slowest participant.'],
      ['conceptual', 'When is a modular monolith the correct architecture?', ['Never, services are always better', 'When one team owns the domain and invariants span modules needing one transaction', 'Only for prototypes', 'When the codebase is under 10k lines'], 1, 'Patterns are chosen against constraints, not against fashion.'],
      ['code-tracing', 'An order-service query joins inventory_service.stock directly. What actually breaks first?', ['Query performance', 'Independent deployment and failure isolation', 'Kafka ordering', 'The read replica'], 1, 'A shared table welds the two release trains together — the boundary stops existing.'],
    ],
  }),
  expandModule({
    id: 'M4.2',
    phase: 'M4',
    order: 2,
    title: 'Service Foundation: A Service That Behaves Under Concurrency',
    subtitle:
      'Layers, DTOs, validation, exception contracts, transaction boundaries, profiles, health, structured logs, integration tests — plus optimistic locking, idempotency and audit trail',
    minutes: 210,
    prerequisites: ['M4.1'],
    objective:
      'Build the account/product/order service skeleton that every later lab depends on: explicit layering, validated input, a real error contract, correct transaction boundaries, honest health endpoints, structured logs with correlation ids and Testcontainers integration tests that prove concurrent behaviour.',
    stack: ['Spring Boot 4.1', 'PostgreSQL', 'Flyway', 'Testcontainers', 'Micrometer', 'logback JSON'],
    why:
      'Distributed patterns fail on top of a sloppy service. If transactions are too wide, if errors are ambiguous, if logs have no correlation id and if there is no integration test with real concurrency, every later M4 lab produces uninterpretable results.',
    explanation: [
      'The service skeleton is a contract with operations and with other teams: controller (transport), application service (use case and transaction boundary), domain (invariants), repository (persistence), infrastructure (external systems), DTOs at the edges.',
      'Without an explicit skeleton, business rules leak into controllers and persistence leaks into the domain, so every later change becomes a cross-cutting edit and every failure has three possible homes.',
      'It makes the transaction boundary a deliberate decision instead of an accident: one use case equals one transaction, and external calls sit outside it.',
      'Spring wires the layers; @Transactional opens a transaction around the application-service method using the datasource connection; optimistic locking is enforced by the @Version column; validation runs before the domain method; the exception handler maps domain failures to RFC-style problem responses with a correlation id.',
      'Under concurrency the version column makes one writer win and the loser receive a 409; an idempotency key table lets a retried request return the original response instead of repeating the effect; every state change appends an audit row with actor, correlation id and the changed fields.',
      'You gain predictable failure semantics, debuggability and safe retries; you pay with an extra column and retry handling, an idempotency store with a retention policy, and careful attention to which operations must be idempotent by design.',
      'A too-wide transaction holds locks while calling an external provider; a too-narrow one leaves partial state; a missing version column silently loses updates; an idempotency record outside the effect transaction reopens duplicates; ambiguous error bodies make correct client behaviour impossible.',
      'Per-endpoint latency, error rate by code (409 vs 500), transaction duration and lock waits, retry counts, audit row counts per entity, structured logs keyed by correlation id.',
      'Read the error contract first (is it 409 or 500?), then transaction/lock metrics, then the audit trail for the entity, and only then the code.',
      'Narrow the transaction to one use case, make stale writes fail with 409 instead of overwriting, write the idempotency record atomically with the effect, and add integration tests that run two concurrent writers against a real database.',
      'Do not put validation only in the controller, do not catch exceptions to return 200, do not use a database lock where a version check suffices, and do not make every field auditable — audit what an auditor would ask about.',
      'Your endpoint returned 200 to both of two concurrent updates and one change vanished. Which layer should have prevented that, and what evidence proves it is fixed?',
    ],
    keys: [
      'One use case = one transaction; external calls never run inside it.',
      'Optimistic locking turns a lost update into an explicit 409 instead of a silent overwrite.',
      'Idempotency is only real when the key record commits in the same transaction as the effect.',
      'Audit what an auditor asks about (who, what, when, why), not every column.',
      'Integration tests must run against a real database with real concurrency; mocks cannot prove a lock.',
      'Health endpoints answer honestly: liveness for the process, readiness for the dependencies it needs.',
    ],
    concepts: [
      [
        'Assign every responsibility (transport, use case, invariant, persistence, external provider) to exactly one layer and name what may not cross that line.',
        'Controllers translate and validate transport only; application services own the transaction and orchestration; the domain owns invariants; repositories persist; infrastructure talks to providers. Persistence types never leave the adapter.',
        'implementation',
      ],
      [
        'Decide the transaction boundary for "transfer funds between two accounts" and justify it by atomicity and lock duration.',
        'Both debit and credit belong in one local transaction because the invariant spans both rows; the notification is sent after commit and never inside it.',
        'data',
      ],
      [
        'Design the error contract and list which failures are 400, 404, 409, 422 and 503.',
        'Validation and malformed input are 400/422, missing resources 404, optimistic-lock and state conflicts 409, a dependency outage 503; every body carries a code, a message and the correlation id.',
        'implementation',
      ],
      [
        'Decide what goes into the audit trail for an account balance change and how it is written.',
        'Actor, entity, operation, before/after balance, reason, correlation id and timestamp — written in the same transaction as the change so an audit can never miss a committed mutation.',
        'data',
      ],
      [
        'Choose which operations must be idempotent by design and which only need validation.',
        'Payment, transfer, order placement and any retried write need idempotency keys; a PUT of a complete representation needs optimistic locking instead.',
        'reliability',
      ],
      [
        'List the configuration that must fail startup when missing and the configuration that may default.',
        'Datasource URL, credentials and broker bootstrap servers must fail fast at boot; pool sizes, timeouts and log levels may default per profile with documented values.',
        'production-engineering',
      ],
    ],
    labs: [
      {
        id: 'M4.2-L1',
        title: 'Account service skeleton with an honest contract',
        minutes: 120,
        objective:
          'Build the layered account service: validated DTOs, one transaction per use case, an error contract with correlation ids, profiles, honest health endpoints and structured logs.',
        context:
          'The account service is the template every capstone service copies; a defect here is copied eight times.',
        architecture:
          'client -> gateway -> account-service (controller → application service → domain → repository) -> PostgreSQL; actuator liveness/readiness; JSON logs',
        problem:
          'Implement create, read, update and list for accounts with bean validation, a problem-details error contract carrying the correlation id, fail-fast configuration validation, and structured logs identifying service, correlation id and use case.',
        starter: `@RestController
@RequestMapping("/api/v1/accounts")
class AccountController(private val accounts: AccountApplicationService) {
  @PutMapping("/{id}")
  fun update(@RequestHeader("X-Correlation-Id") correlationId: String,
             @PathVariable id: UUID,
             @Valid @RequestBody request: UpdateAccountRequest): AccountResponse =
    accounts.update(UpdateAccountCommand(id, request.expectedVersion, request.holder, request.status))
}`,
        lang: 'kotlin',
        requirements: [
          'Every use case is one @Transactional application-service method; no provider call inside it.',
          'Validation failures return 400/422 with field violations and the correlation id.',
          'Startup fails with a named message when a required configuration value is absent.',
          'Readiness is DOWN while the datasource is unreachable; liveness stays UP.',
          'Every log line carries service, correlation id and use case name.',
        ],
        constraints: [
          'No persistence entity may be returned from a controller.',
          'No exception may be swallowed to produce a 200 response.',
        ],
        expectedBehaviour:
          'Valid traffic returns 200/201 with the echoed correlation id; invalid traffic returns 422 with field violations; a stopped database flips readiness DOWN while the process stays alive.',
        testCases: [
          ['create with a blank holder name', '422 with a field violation and no account row inserted'],
          ['stop PostgreSQL and call /actuator/health/readiness', 'status DOWN while liveness stays UP'],
          ['correlate one request across layers', 'the same correlation id appears in logs and in the response body'],
        ],
        hiddenFailures: [
          'One fat @Transactional service class wraps the provider call and holds database locks during network latency.',
          'Returning a JPA entity from the controller leaks lazy-loading semantics into the transport contract.',
        ],
        output:
          'Layered service with a problem-details contract, honest probes, structured logs and green integration tests.',
        hints: [
          'Write the error contract before the endpoints; the contract shapes the exception handler.',
          'Use a correlation-id filter that puts the id into MDC so every log line is consistent without touching each class.',
        ],
        verification:
          './mvnw -q verify — Testcontainers integration tests cover the happy path, the validation path and the readiness transition against a real PostgreSQL container.',
        explanation:
          'The skeleton is the contract with operations: honest probes, unambiguous errors and machine-readable logs are what make every later incident debuggable in minutes instead of hours.',
        extension:
          'Add a per-endpoint timer plus 4xx/5xx counters, then build a dashboard panel that answers "is this service healthy?" without reading a single log line.',
      },
      {
        id: 'M4.2-L2',
        title: 'Concurrent transfers: optimistic locking, idempotency and the audit trail',
        minutes: 120,
        objective:
          'Make a money-moving endpoint correct under concurrency and safe under retry, with a complete audit trail written in the same transaction.',
        context:
          'Two clients edit the same account and a mobile client retries on timeout; the wrong answers are silent data loss and double payment.',
        architecture:
          'client (Idempotency-Key + expected version) -> account-service -> PostgreSQL (accounts.version, idempotency_keys unique key, audit_log)',
        problem:
          'Implement POST /api/v1/transfers with optimistic locking, an idempotency key that commits with the effect, a 409 error contract on stale versions and an audit row per committed mutation.',
        starter: `@Entity
class Account(
  @Id val id: UUID,
  var balance: BigDecimal,
  @Version var version: Long?,   // TODO: make stale writes fail instead of overwriting
)

@Transactional
fun transfer(key: String, command: TransferCommand): TransferResult {
  // TODO: idempotent replay, version-checked update, audit row, 409 mapping
}`,
        lang: 'kotlin',
        requirements: [
          'Two concurrent transfers never lose an update: one commits, the loser receives 409.',
          'Replaying the same Idempotency-Key returns the stored response and creates no second transfer.',
          'A replay after a version conflict returns the original outcome, not a new attempt.',
          'Every committed transfer writes exactly one audit row in the same transaction.',
          'A retry storm of 50 identical requests produces one transfer and one audit row.',
        ],
        constraints: [
          'No pessimistic lock held across the HTTP request.',
          'The idempotency record must never be written outside the effect transaction.',
        ],
        expectedBehaviour:
          'One winner and one explicit 409 under concurrency; identical response bodies on key replay; audit rows equal committed transfers, never more.',
        testCases: [
          ['run two interleaved transfers on one account', 'one 200 and one 409 returning the current version'],
          ['send the same Idempotency-Key 50 times in parallel', 'one transfer row, one audit row, identical bodies'],
          ['retry the loser of a 409 with the fresh version', 'the retry succeeds once and audits once'],
        ],
        hiddenFailures: [
          'Reloading the entity but reusing the stale version inside the retry attempt still overwrites.',
          'Storing the idempotency record after commit lets a crash in between duplicate the transfer.',
        ],
        output:
          'Concurrency test proves exactly one winner; replay test proves one effect; audit count equals committed transfers.',
        hints: [
          'Let the database do the work: UPDATE ... WHERE id = ? AND version = ? returning zero rows is a conflict.',
          'Insert the idempotency row with a unique constraint so parallel duplicates fail loudly instead of racing.',
        ],
        verification:
          './mvnw -q verify — Testcontainers runs the parallel test against real PostgreSQL, because an in-memory fake cannot reproduce lock and constraint behaviour.',
        explanation:
          'Concurrency safety is a data-integrity feature that belongs in the database, and idempotency is a durability feature that must commit with the effect; anything weaker returns success to requests that did not happen.',
        extension:
          'Add a reconciliation job that compares the audit trail with the transfers table, reports divergence, and runs on a schedule instead of as a manual query.',
      },
    ],
    benchmark: {
      title: 'Concurrency and transaction-cost benchmark for the write path',
      executionMode: 'SIMULATED',
      disclaimer:
        'This browser cannot run a JVM, PostgreSQL or a load generator, so no number here is a measurement. You receive the protocol, the metrics to capture and the trade-offs to reason about; run the provided script locally to obtain real figures and record them next to the expected behaviour.',
      baseline: [
        'Sequential single-threaded transfers: throughput and p99 as the reference.',
        '20 concurrent writers on disjoint accounts: the low-contention case.',
        '20 concurrent writers on one account: the contention case.',
      ],
      measurementProtocol: [
        'Fix the environment: same container limits, same pool size, warm JVM, no debug logging.',
        'Record p50/p95/p99 latency, successful writes per second, 409 rate and lock-wait time per attempt.',
        'Run each configuration three times and report the median, not the best run.',
      ],
      optimizations: [
        'Narrow the transaction to the single UPDATE plus the audit insert.',
        'Increase the connection pool only after proving the wait is on connections rather than on row locks.',
        'Batch audit inserts when one request mutates several entities.',
      ],
      decisions: [
        'Retry policy: bounded retries with jitter on 409, or fail fast and let the client re-read the entity.',
        'Whether a heavily contended balance needs a different model (append-only ledger instead of a mutable column).',
      ],
      falseImprovementWarnings: [
        'Throughput gains on disjoint accounts prove nothing about the contended path.',
        'Removing the audit insert makes the benchmark faster and the system un-auditable.',
        'Measuring with a warm pool but a cold JVM mixes two variables.',
      ],
      tradeoffQuestions: [
        'What changed, and why should it change the metric?',
        'Which bottleneck did you remove: CPU, lock wait, connection wait or network round trips?',
        'Which metric proves the improvement, and what is the p99 now?',
        'When would this optimisation make the system worse?',
      ],
    },
    debug: [
      debugEx(
        'M4.2-D1',
        'A transfer endpoint returned 200 to forty parallel requests but only three balances changed, and nobody reported an error.',
        'Money disappeared without a single failed response; the audit trail shows forty rows.',
        [
          'the entity is annotated with @Version but the update is executed with a JPQL bulk UPDATE that ignores the version',
          'the audit rows are written by an @Async listener after commit',
          'a retry helper re-executes the whole use case and reloads the balance',
        ],
        'Decide where the version check was bypassed and whether the audit trail can be trusted as evidence.',
        'A bulk UPDATE bypasses the entity version, so the database never rejects the stale write; the audit trail was written outside the transaction, so it recorded attempts rather than committed effects. Both must move back inside one version-checked, transaction-bound path.',
        ['grep -rnE "bulk|@Modifying" services/account-service/src', 'SELECT id, balance, version FROM accounts WHERE id = <id>']
      ),
      debugEx(
        'M4.2-D2',
        'Readiness reported UP while every request failed with a 503 from a downstream provider.',
        'The platform routed traffic to an instance that could not serve a single useful request.',
        [
          'the readiness group contains only the database',
          'the provider is called synchronously by every request',
          'provider failures are translated into 503 responses',
          'the provider has no circuit breaker and no health contribution',
        ],
        'Decide what readiness should mean here, and why the current definition is misleading.',
        'Readiness means "this instance can serve traffic": a hard runtime dependency must contribute to it, or the instance must be able to degrade without it. Claiming readiness while the dependency is down removes the platform’s ability to route around the fault and makes the 503 storm the operator’s whole incident.',
        ['curl -s .../actuator/health/readiness?show-details=always', 'curl -s -o /dev/null -w "%{http_code}" .../api/v1/accounts/<id>']
      ),
    ],
    failures: [
      {
        id: 'M4.2-F1',
        title: 'The double charge that retried cleanly',
        minutes: 60,
        bug: 'The payment call sits inside the transfer transaction and retries on timeout with a freshly generated idempotency key, so a slow-but-successful charge is submitted twice and both are captured.',
        reproduce: [
          './scripts/slow-provider.sh --latency 6000 --first-response-timeout',
          'curl -X POST .../api/v1/transfers -H "Idempotency-Key: t-1" -d @transfer.json',
          'SELECT count(*) FROM provider_charges WHERE transfer_ref = <transferId>',
        ],
        observe: [
          'the client saw a 504 after the timeout',
          'the provider recorded two charges for one transfer reference',
          'the local transaction rolled back, so the database shows no transfer while money moved',
          'the retry used a new key each attempt, visible in the provider request log',
        ],
        hypotheses: [
          'The provider is not idempotent and charged twice for the same request.',
          'The retry generated a new idempotency key each attempt, so the provider treated the retry as a new charge.',
          'The database lost the transfer row because of the rollback.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#1 rejected: the provider request log shows two different keys, so idempotency was never actually exercised.',
          '#3 rejected: the rollback is correct behaviour for a failed transaction; the loss of truth is that money moved outside it.',
        ],
        investigate: [
          ['grep "Idempotency-Key" logs/account-service.log | grep <transferId>', 'two different keys for one transfer', 'The key must be derived from the transfer reference, not generated per attempt.'],
          ['SELECT * FROM transfers WHERE reference = <transferId>', 'no row exists although the provider charged', 'The external effect happened outside the local transaction, with no compensating record.'],
        ],
        debugOptions: [
          'The money-moving external call runs inside a transaction that retries with a fresh idempotency key, so it is neither atomic nor idempotent.',
          'The provider timeout is too short and should be increased.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Derive a stable idempotency key from the transfer reference, call the provider outside the database transaction after a durable intent is committed, and reconcile unknown outcomes before retrying.',
          'Wrap the provider call in a longer transaction with a row lock.',
        ],
        correctFix: 0,
        fixRejection: [
          'A longer lock cannot fix an external effect that is not idempotent, and it holds database resources across network latency.',
        ],
        verify: [
          ['./scripts/slow-provider.sh --latency 6000 --first-response-timeout', 'exactly one charge and one transfer in state UNKNOWN then SETTLED', 'The intent is durable before the call, so an unknown outcome is recoverable.'],
          ['SELECT count(*) FROM provider_charges WHERE transfer_ref = <transferId>', 'exactly 1', 'The stable key makes retries harmless.'],
        ],
        explainPrompt:
          'Explain why a retry is only safe when both the durable intent and the external request are idempotent.',
        modelExplanation:
          'A retry is a second attempt at a state transition, so it is safe only when repeating it cannot change the outcome. Here the database rolled back while the provider charged: the local transaction could not undo the external effect, and the fresh idempotency key meant the provider saw a genuinely new request. The fix makes the intent durable first, derives one stable key from the transfer reference, performs the call outside the transaction, and treats an unknown outcome as a state to reconcile rather than a failure to retry.',
        patterns: ['Request idempotency key', 'Durable intent', 'Reconciliation of unknown outcomes', 'External call outside transaction'],
        dimension: 'reliability',
      },
      {
        id: 'M4.2-F2',
        title: 'Readiness that lied and kept a broken instance in rotation',
        minutes: 60,
        bug: 'Readiness checks only the database, while a synchronous provider call is required by every request, so a healthy-looking instance returns 503 to all traffic and the platform never routes around it.',
        reproduce: [
          './scripts/fail-provider.sh --down 10m',
          'curl -s .../actuator/health/readiness?show-details=always',
          'for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code}\\n" .../api/v1/accounts/<id>; done',
        ],
        observe: [
          'readiness returns UP with only the database in the group',
          'all twenty requests return 503',
          'the provider circuit is open but contributes nothing to health',
          'the load balancer keeps sending traffic to the instance',
        ],
        hypotheses: [
          'The provider outage is the only problem and readiness is irrelevant.',
          'Readiness does not include a hard runtime dependency, so the platform cannot remove the instance from rotation.',
          'The load balancer is misconfigured.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#1 rejected: an instance answering 503 to 100% of requests is not ready by any operational definition.',
          '#3 rejected: the load balancer is behaving exactly as instructed by the UP probe.',
        ],
        investigate: [
          ['curl -s .../actuator/health/readiness?show-details=always', 'components: db only', 'A hard dependency that every request needs must appear in the readiness group.'],
          ['./scripts/fail-provider.sh --status', 'provider circuit OPEN for 8 minutes', 'The application knows it cannot serve and still reports UP.'],
        ],
        debugOptions: [
          'Readiness omits a dependency that every request requires, so the instance advertises capacity it does not have.',
          'The 503 responses should be relaxed to 200 with a warning header.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Add the provider to the readiness group (or serve a degraded mode without it), keep liveness independent of dependencies, and alert on readiness flaps.',
          'Increase the load balancer health-check interval.',
        ],
        correctFix: 0,
        fixRejection: [
          'A slower health check delays detection without fixing the false signal.',
        ],
        verify: [
          ['./scripts/fail-provider.sh --down 10m && curl -s .../actuator/health/readiness', 'status DOWN while liveness stays UP', 'The platform can now route around the instance.'],
          ['curl -s .../actuator/health/liveness', 'still UP', 'Liveness must not restart a healthy process because a dependency is down.'],
        ],
        explainPrompt:
          'Explain the difference between liveness and readiness using this incident.',
        modelExplanation:
          'Liveness answers "is this process broken beyond recovery?" and readiness answers "should traffic be sent here right now?". The provider outage did not break the process, so restarting it would achieve nothing; but the instance could not serve a single request, so readiness should have gone DOWN and let the platform shift traffic. Mixing the two signals either restarts healthy processes or, as here, keeps useless ones in rotation - both turn a dependency outage into a customer-visible incident.',
        patterns: ['Liveness vs readiness', 'Health groups', 'Graceful degradation', 'Circuit breaker'],
        dimension: 'observability',
      },
    ],
    design: {
      id: 'M4.2-AC1',
      title: 'Service foundation challenge: money movement under concurrency and retry',
      scenario:
        'A payments platform must support transfers between internal accounts and calls to an external bank API. The mobile client retries aggressively on timeout, the bank API is slow (p99 4 s) and is not idempotent unless an idempotency key is supplied, and auditors require a complete trail of who changed which balance and why.',
      requirements: [
        'Decide the transaction boundary: what commits locally before the external call and what can never be inside a transaction.',
        'Decide the idempotency strategy: key derivation, storage, retention and behaviour on replay during an in-flight attempt.',
        'Decide the concurrency strategy: version-checked update, append-only ledger, or per-account queue — with the invariant it protects.',
        'Decide the error contract for stale versions, unknown external outcomes and provider outages.',
        'Decide the audit model: fields, write path, and how a reconciliation job detects divergence.',
        'Decide which configuration fails fast at startup and how readiness reflects the bank dependency.',
      ],
      constraints: [
        'No external call may run inside a database transaction.',
        'No distributed transaction and no two-phase commit.',
        'The API must never report success for a transfer that was not durably recorded.',
        'Audit records must survive the failure of any later step.',
      ],
      deliverables: [
        'A transfer state machine: RECEIVED → INTENT_PERSISTED → PROVIDER_CALLED → SETTLED | FAILED | UNKNOWN.',
        'The idempotency key derivation rule plus the retention and expiry policy.',
        'The reconciliation query that finds divergence between the local ledger and the provider.',
        'The readiness/liveness design with the dependency list for each.',
      ],
      failureModes: [
        'Generating a new idempotency key per retry, which converts retries into new charges.',
        'Holding a row lock while waiting on a slow provider, which converts provider latency into database contention.',
        'Treating an unknown outcome as a failure and retrying blindly.',
        'Writing the audit row asynchronously, so a crash loses the evidence of a committed change.',
      ],
      tradeoffQuestions: [
        {
          question: 'Why is the external call outside the transaction, and what problem does that create?',
          modelAnswer:
            'Holding a database transaction open across a 4-second network call consumes a connection and holds locks, so latency becomes contention. The cost of moving the call out is that local state and the external effect are not atomic, so an unknown outcome becomes a first-class state that a reconciliation job must resolve. I accept a reconciler and an UNKNOWN state rather than lock contention on the money path.',
        },
        {
          question: 'Optimistic locking or an append-only ledger for the balance?',
          modelAnswer:
            'Optimistic locking is simpler and correct for low-contention accounts: the version check turns lost updates into 409s. For a hot account the contention itself becomes the problem, so I switch to an append-only ledger with a derived balance, which removes read-modify-write contention and gives the auditor a native trail. The decision is driven by measured contention, not preference.',
        },
        {
          question: 'What should the client do when it receives 409?',
          modelAnswer:
            'Re-read the current representation, re-apply the intent if the business rule still allows it, and retry with the fresh version and the same idempotency key; after a bounded number of attempts return a conflict to the user rather than looping. The 409 is information, not an error to hide — retrying without re-reading is how updates get lost.',
        },
      ],
    },
    defense: [
      [
        'Your service returns 409 to a client that retries aggressively. Is that a design failure?',
        'No — 409 is the correct, honest answer for a stale write, and it is far better than the silent overwrite it replaces. What would be a design failure is a client loop that retries without re-reading, or a server that hides the conflict behind a 200. I would pair the 409 with the current version and entity state so the client can decide, and bound the retries so a conflict storm cannot become a self-inflicted outage.',
        'reliability',
        ['Defends the semantics of 409.', 'Names the failure mode it prevents.', 'Identifies the client obligation.', 'Adds a bounded-retry safeguard.'],
      ],
      [
        'Why do you insist on Testcontainers integration tests for concurrency instead of mocking the repository?',
        'Because the behaviour under test belongs to the database: a version check, a unique constraint and row locking do not exist in a mock. A mocked test would pass while production loses updates, which is worse than no test at all. Testcontainers gives real PostgreSQL with real isolation semantics, so the concurrency test is evidence rather than a rehearsal.',
        'implementation',
        ['Explains why a mock cannot represent the behaviour.', 'Names the mechanisms involved.', 'Links the choice to evidence.', 'Accepts the cost of slower tests.'],
      ],
      [
        'A product manager asks you to remove the audit trail to make writes faster. Your answer?',
        'I would show what the trail costs (one insert inside the same transaction, measurable in the benchmark) and what it buys (who changed what, when and why, plus the ability to reconcile divergence). Then I would offer the real optimisation: narrow or batch the audit payload, keep the insert transactional, and drop only fields the auditor has agreed are unnecessary. Removing the trail converts a performance question into an integrity and compliance problem.',
        'communication',
        ['Quantifies the cost instead of refusing emotionally.', 'Names what is gained.', 'Offers a genuine optimisation path.', 'Escalates the decision to the accountable owner.'],
      ],
    ],
    english: [
      [
        ['idempotency', 'Repeating the same request produces the same effect exactly once.', 'We derive the provider idempotency key from the transfer reference so a retry cannot double-charge.'],
        ['optimistic locking', 'A version check that makes a stale write fail instead of overwriting newer data.', 'Optimistic locking turned a silent lost update into an explicit 409.'],
        ['audit trail', 'An append-only record of who changed what, when and why.', 'The audit row is written in the same transaction as the change, so it can never miss a committed mutation.'],
        ['transaction boundary', 'The span that either commits or rolls back as one unit.', 'The transaction boundary is the single use case; the provider call sits outside it.'],
        ['correlation id', 'One identifier carried through every hop and every log line of a request.', 'Every error body carries the correlation id, so an incident report can be joined to logs in one query.'],
      ],
      [
        'One use case equals one transaction, and external calls never run inside it.',
        'The database enforces the invariant; the client receives an explicit conflict instead of a silent overwrite.',
        'Readiness reflects what the instance can serve; liveness reflects whether the process is broken.',
      ],
      'The service is layered so responsibilities cannot leak: the controller only translates transport, the application service owns the use case and its transaction, the domain enforces invariants, and infrastructure adapts external systems. Money movement uses a version-checked update so a stale write fails with 409, an idempotency key that commits with the effect so retries are harmless, and an audit row written in the same transaction so the trail matches committed reality. The provider is called outside the transaction with a stable key, and an unknown outcome becomes an explicit state that reconciliation resolves.',
      [
        ['A client duplicated a payment on retry', 'We are confirming the idempotency key derivation and the ordering of the key record relative to the effect; the client keeps sending the same key, so a duplicate means we wrote the key outside the transaction.'],
        ['An instance kept serving while a dependency was down', 'Readiness did not include a hard dependency, so the platform could not route around the instance; we are adding the dependency to the readiness group while keeping liveness independent.'],
      ],
      [
        'This bulk update bypasses the version column, so concurrent writers can still lose an update.',
        'The audit row is written after commit here; it must be part of the same transaction as the change.',
        'This endpoint has no timeout, so one slow dependency holds a request thread indefinitely.',
      ],
      [
        'Where is the transaction boundary in this use case?',
        'What happens on the second identical request, and what proves it?',
        'If this call fails after the remote side committed, how do we find out?',
      ],
      [
        'How do you make a write endpoint safe under concurrency and retries?',
        'Why can a database version column not be replaced by a retry loop?',
        'How do you decide what belongs in an audit trail?',
      ],
      'Concurrency and retry safety have to be designed, not hoped for. One use case is one transaction, and the database enforces invariants through a version column so a stale write fails with 409 instead of overwriting. Retried writes carry an idempotency key whose record commits together with the effect, so a repeat produces the original response and no second effect. Money-moving calls happen outside the transaction with a key derived from the business reference, and an unknown provider outcome becomes an explicit state that a reconciliation job resolves. The audit trail is written in the same transaction, because evidence that can be lost is not evidence.',
    ],
    ai: [
      'Ask an AI to make a transfer endpoint safe under concurrent retries, and to show where each guarantee is enforced.',
      'The AI answers with `@Transactional` around the controller method, a `synchronized` block on the account id, `synchronized` keyword on the service method, and a retry loop of five attempts with a 50 ms sleep, claiming it prevents double charges.',
      [
        'A synchronized block protects one JVM only; two instances defeat it entirely.',
        'Retrying without a stable idempotency key submits a new charge to the provider on every attempt.',
        'A transaction spanning the provider call holds locks for seconds and cannot roll back an external effect.',
        'Nothing in the answer states what happens when the request succeeds on the provider and fails afterwards.',
      ],
      [
        'Ask which guarantee must hold across two service instances, and how the proposed lock survives that.',
        'Ask what the provider receives on attempt two, and whether it can distinguish a retry from a new charge.',
        'Ask what the API returns when the provider outcome is unknown.',
      ],
      'The AI used JVM-local locking plus blind retries, which cannot survive horizontal scaling and cannot distinguish retries from new charges. Correct outcome: a version-checked database update for concurrency, an idempotency key derived from the business reference whose record commits with the effect, the provider call outside the transaction, and an explicit UNKNOWN state resolved by reconciliation.',
    ],
    quiz: [
      ['conceptual', 'What does optimistic locking guarantee?', ['Nobody can write concurrently', 'A stale write fails instead of overwriting newer data', 'Writes are faster', 'Locks are held across the request'], 1, 'It converts a silent lost update into an explicit conflict.'],
      ['scenario', 'Two concurrent PUTs with the same version value. Correct outcome?', ['Both 200', 'One 200, one 409', 'Both 409', 'One 200, one 500'], 1, 'One writer wins; the loser is told the truth and can re-read.'],
      ['scenario', 'A retried request must not double-charge. Where must the idempotency record be written?', ['After commit, in a second transaction', 'In the same transaction as the effect', 'In Redis only', 'In a log file'], 1, 'If the record and the effect are not atomic, a crash reopens the duplicate window.'],
      ['design', 'Which configuration should fail application startup?', ['Log level', 'Datasource credentials', 'Connection pool size', 'Feature flag defaults'], 1, 'Missing credentials cannot be defaulted safely; failing fast beats a runtime incident.'],
      ['debugging', 'Readiness is UP but every request returns 503 from a provider. First fix?', ['Increase provider timeout', 'Include the hard dependency in the readiness group or degrade gracefully', 'Restart the pod', 'Add a second load balancer'], 1, 'The platform must be able to route traffic away from an instance that cannot serve.'],
      ['code-tracing', 'Why does a JPQL bulk UPDATE break optimistic locking?', ['It deletes the version column', 'It bypasses the entity version check in the persistence context', 'It requires a second transaction', 'It locks the whole table'], 1, 'Bulk updates skip the read-modify-write cycle the version check depends on.'],
      ['conceptual', 'What belongs in an audit trail for a balance change?', ['Every byte of the request', 'Actor, entity, operation, before/after values, reason and correlation id', 'Only the new balance', 'Only the timestamp'], 1, 'Audit what an auditor asks about: who, what, when and why.'],
      ['scenario', 'A provider call times out after the charge succeeded. What is the correct immediate state?', ['FAILED', 'SETTLED', 'UNKNOWN, resolved by reconciliation', 'Retry immediately'], 2, 'An unknown outcome is a state, not a failure to retry blindly.'],
      ['design', 'Why must the external call stay outside the database transaction?', ['Because Spring forbids it', 'Because the transaction cannot undo the external effect and holds locks during network latency', 'Because it is faster', 'Because the provider requires it'], 1, 'Atomicity cannot span the call, and holding locks turns latency into contention.'],
      ['scenario', 'A retry storm of 50 identical requests hits one endpoint. What proves idempotency?', ['50 responses returned', 'One effect and one audit row, with identical response bodies', 'The endpoint returned 429', 'The queue drained'], 1, 'Evidence is a single effect, not a single response.'],
      ['conceptual', 'Why is a mock insufficient to test concurrency?', ['Mocks are slow', 'Row locks, unique constraints and isolation semantics do not exist in a mock', 'Mocks cannot return errors', 'Mocks cannot be configured'], 1, 'You must test against the component that enforces the guarantee.'],
    ],
  }),
];

/** Architecture snapshots of the continuous capstone, phase by phase. */
export const MS_M4_SNAPSHOTS: MsCapstoneSnapshot[] = [
  // SNAPSHOTS_END
];

/** Production-style incidents authored for this phase. */
export const MS_M4_INCIDENTS: MsIncident[] = [
  // INCIDENTS_END
];

