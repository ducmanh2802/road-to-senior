import type { MsPhaseMeta } from './types';
import { expandModule } from './compact';
import { debugEx } from './authoring';

export const MS_M3_PHASE: MsPhaseMeta = {
  id: 'M3',
  order: 3,
  title: 'Event-Driven Architecture',
  subtitle: 'Kafka, mail, Elasticsearch, MongoDB and polyglot persistence',
  goal:
    'Convert synchronous reactions into events: publish facts after commit, consume them idempotently, and give each service the datastore its access pattern deserves.',
  sessions: 'Source sessions 11-17',
  architectureMilestone:
    'account/product/order services publish events; mail, notification and search services consume them; order state lives in MongoDB.',
};

/** PHASE M3 - EVENT-DRIVEN ARCHITECTURE. */
export const MS_M3_MODULES = [
  expandModule({
    id: 'M3.1',
    phase: 'M3',
    order: 1,
    title: 'Kafka Fundamentals',
    subtitle: 'Broker, topic, partition, offset, consumer group, delivery semantics, DLQ, lag',
    minutes: 180,
    prerequisites: ['M2.3'],
    objective:
      'Publish AccountCreated after commit, consume it in notification-service idempotently, and reproduce duplicate, delayed, out-of-order and poison-message behaviour.',
    stack: ['Kafka', 'Spring for Apache Kafka', 'Docker Compose', 'Micrometer'],
    why:
      'Events are how the capstone stops coupling reactions to the checkout transaction; every later pattern (search indexing, mail, saga, outbox) is built on this module.',
    explanation: [
      'A topic is an append-only log split into partitions; a consumer group distributes partitions across members, and each partition is delivered in order to one consumer at a time.',
      'Synchronous fan-out makes every reaction a hard dependency of the write path; a log lets consumers attach, pause and replay without the producer knowing them.',
      'It decouples producer and consumer lifecycles, smooths load spikes, and gives a replayable history for rebuilding projections.',
      'Producers append to a partition chosen by key hash or round robin; consumers commit offsets per partition and can reset them; retention defines how long replay is possible.',
      'Duplicates arrive when a consumer processes a record but fails before committing the offset; ordering is guaranteed inside a partition only, so a re-keyed record can overtake its predecessor.',
      'You gain throughput and decoupling but accept at-least-once delivery, operational surface (partitions, retention, rebalancing) and the need for idempotent consumers.',
      'Duplicate delivery, consumer crash before commit, rebalance storms, unbounded lag when consumers are slower than producers, poison messages blocking a partition, and unbounded retries that stall progress.',
      'Consumer lag per group and partition, rebalance count, producer error rate, DLQ depth, and end-to-end latency from produced timestamp to processed timestamp.',
      'Check lag first: rising lag with healthy throughput means consumption is slow; then inspect the group assignment for hot partitions and the DLQ for a single blocking record.',
      'Make consumers idempotent (dedupe on event id), bound retries with backoff, route permanently failing records to a DLQ with the original payload and error, and scale consumers up to partition count.',
      'Do not use Kafka as a request/reply queue, do not key events when you need global ordering, and do not rely on exactly-once business semantics just because the broker supports transactions.',
      'Kafka guarantees order inside a partition. Your business invariant spans two keys. What is your ordering guarantee now, and how do you enforce it?',
    ],
    keys: [
      'Delivery is at-least-once by default: the consumer must be idempotent, not the broker.',
      'Ordering exists per partition; choosing a key chooses your ordering guarantee.',
      'Lag is the primary health metric of an event-driven system.',
      'A poison message must be routed to a DLQ, never retried forever in place.',
      'Consumers set values from events; they never trust stale local state.',
    ],
    concepts: [
      ['Choose the partition key for order events and justify the ordering guarantee it gives you.', 'Key by order id so all events for one order are ordered; keying by customer gives per-customer order but breaks assembly ordering inside one order.', 'distributed-systems'],
      ['Design the duplicate-handling strategy for a consumer that sends email on AccountCreated.', 'Store the processed event id in the consumer database in the same transaction as the side effect, and skip a replay whose id is already present.', 'reliability'],
      ['Decide topic count and partitions for the capstone and defend the number.', 'One topic per fact type (account.created.v1, order.placed.v1), partitions sized to consumer parallelism with headroom; too many topics multiplies operational overhead with no benefit.', 'architecture'],
      ['Describe what a consumer rebalance does to in-flight work and how to make it safe.', 'Partitions are revoked and reassigned, so records processed but not committed are redelivered; safety comes from idempotency plus committing only after the side effect succeeds.', 'reliability'],
    ],
    labs: [
      {
        id: 'M3.1-L1',
        title: 'AccountCreated to notification: idempotent consumer with lag',
        minutes: 120,
        objective: 'Publish AccountCreated after commit, consume it with exactly-one effect, and expose consumer lag.',
        context: 'Notifications must never block account creation and must never be sent twice for one event.',
        architecture: 'account-service (after commit) -> Kafka account.created.v1 -> notification-service -> processed_events',
        problem: 'Implement a keyed producer and a consumer with dedupe on event id, bounded retry and a DLQ.',
        starter: `@KafkaListener(topics = ["account.created.v1"], groupId = "notification-service")
fun onAccountCreated(event: AccountCreatedEvent) { /* TODO: idempotent handling */ }`,
        lang: 'kotlin',
        requirements: [
          'No event is published when the account transaction rolls back.',
          'A replayed event produces no second notification.',
          'A permanently failing record lands in account.created.v1.DLQ with its error.',
          'Consumer lag is visible per partition.',
        ],
        constraints: ['The consumer must not call back into account-service synchronously.'],
        expected: 'Duplicate replay leaves the notification count unchanged; stopping the consumer shows rising lag that returns to zero.',
        tests: [
          ['publish the same event twice', 'one notification and one processed_events row'],
          ['fail the handler for one record', 'record moves to the DLQ and the partition continues'],
        ],
        hidden: ['Committing the offset before the side effect loses notifications on crash; committing only after a failure loops forever without a DLQ.'],
        output: 'Lag metric visible, dedupe proven, DLQ populated, no publish on rollback.',
        hints: ['Write the dedupe row and the side effect in the same local transaction.'],
        explanation: 'The broker guarantees at-least-once; business-level exactly-once is the consumer job via a durable dedupe record.',
        extension: 'Add an outbox table so the publish survives a crash between commit and send, then prove no event is lost while the broker is down.',
      },
    ],
    debug: [
      debugEx(
        'M3.1-D1',
        'One partition shows permanent lag while five others are at zero.',
        'Lag on partition 2 grows linearly and never recovers.',
        ['the DLQ is empty', 'the consumer logs show repeated retries for the same offset', 'the record payload is malformed JSON'],
        'Explain why one record blocks a partition and choose the remediation.',
        'A poison message is retried in place forever so the partition cannot advance; route it to the DLQ after bounded retries.',
        ['kafka-consumer-groups.sh --describe for per-partition lag', 'grep the consumer log for the offset being retried']
      ),
    ],
    failures: [
      {
        id: 'M3.1-F1',
        title: 'Duplicate events, duplicate emails',
        minutes: 60,
        bug: 'The consumer sends the email and then commits the offset, so a crash in between produces a redelivery and a second email.',
        reproduce: ['./scripts/duplicate-event-test.sh --topic account.created.v1 --duplicates 3', 'SELECT count(*) FROM notification_log WHERE account_id = <uuid>'],
        observe: [
          'three emails sent for one account creation',
          'the DLQ is empty because the handler never throws',
          'offset commits appear after the SMTP send in the log timeline',
        ],
        hypotheses: [
          'Kafka delivered each event to three different partitions.',
          'The handler is not idempotent and the offset is committed after the side effect, so redelivery repeats the effect.',
          'The mail provider sent the message three times.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: ['#1 rejected: the key is the account id, so all records land in one partition and are consumed sequentially.', '#3 rejected: the provider request log shows three distinct submissions from our service.'],
        investigate: [
          ['SELECT event_id, count(*) FROM notification_log GROUP BY event_id HAVING count(*) > 1', 'one row per duplicate delivery', 'There is no dedupe record: every delivery is treated as new.'],
          ['Inspect the handler order: send then commit', 'side effect before offset commit', 'A crash in that window guarantees a duplicate, not a loss.'],
        ],
        debugOptions: ['Non-idempotent handler plus redelivery: dedupe on event id and record it atomically with the effect.', 'Kafka misconfigured with three partitions instead of one.'],
        correctRootCause: 0,
        fixOptions: [
          'Insert the event id into processed_events in the same transaction as the notification, skip duplicates, keep bounded retries with a DLQ.',
          'Set the consumer to at-most-once by committing the offset before handling.',
        ],
        correctFix: 0,
        fixRejection: ['#2 rejected: committing first trades duplicates for silent losses, which is worse for notification correctness.'],
        verify: [
          ['Replay the same event three times', 'exactly one notification per event id, duplicate counter stays zero', 'The consumer is now idempotent in effect.'],
        ],
        explainPrompt: 'Explain in five sentences why at-least-once delivery forces idempotency into the consumer rather than the broker.',
        modelExplanation:
          'The broker cannot know whether your side effect happened, so it guarantees at-least-once delivery and expects the consumer to make the effect repeatable. Evidence: three records sharing one event id produced three notifications and the offset commit came after the send. The fix records the event id atomically with the effect so a replay is a no-op.',
        patterns: ['Idempotent consumer', 'Dedupe table', 'DLQ', 'Bounded retry'],
        dimension: 'distributed-systems',
      },
    ],
    defense: [
      ['Does Kafka provide business-level exactly-once?', 'No. The broker can deduplicate inside a transactional producer scope, but the business effect lives in your database, so consumers must be idempotent.', 'distributed-systems', ['Separates broker semantics from business effect', 'Requires consumer idempotency']],
      ['What happens when a consumer crashes mid-batch?', 'Uncommitted offsets are redelivered to the reassigned consumer, so records are processed again; idempotency makes that safe and a DLQ keeps a poison record from blocking the partition.', 'reliability', ['Explains redelivery', 'Idempotency plus DLQ']],
      ['What does partition ordering actually guarantee?', 'Total order for one key inside one partition; across partitions there is no order, so a global ordering requirement forces either a single partition or a different design.', 'distributed-systems', ['Per-partition scope', 'Consequence for design']],
      ['How do you detect a consumer falling behind?', 'Consumer lag per group and partition, plus end-to-end latency from produced to processed timestamp, because lag alone hides slow-but-steady consumption.', 'observability', ['Names lag', 'Names end-to-end latency']],
    ],
    english: [
      [
        ['at-least-once', 'delivery that may repeat, but never silently drops, a record', 'At-least-once delivery means the consumer must be idempotent.'],
        ['consumer lag', 'records a consumer group has not processed yet', 'Rising lag on one partition points at a blocked or slow consumer.'],
      ],
      ['Kafka decouples producers and consumers, but it does not automatically make ___ idempotent.'],
      'AccountCreated is published after the account transaction commits. Notification service consumes it with a dedupe record written in the same transaction as the notification, bounded retries and a DLQ for permanent failures. Lag per partition tells us whether the consumer keeps up.',
      [[
        'A product manager asks why a customer received two emails',
        'The consumer is at-least-once: it sent the email, then crashed before committing the offset, so the record was redelivered. We are making the handler idempotent by recording the event id atomically with the notification.',
      ]],
      ['The handler must be idempotent because the broker only guarantees at-least-once - the offset commit cannot be part of the business transaction.'],
      ['If we need per-customer ordering we key by customer; if we need per-order ordering we key by order. One topic cannot give us both.'],
      ['What ordering guarantee does your topic provide, and why that key?', 'How do you handle a poison message without stopping the pipeline?'],
      'Kafka gives us decoupling and replay, but delivery is at least once, so the consumer must be idempotent. Events are keyed by order id, which orders everything for a single order inside one partition. The notification consumer records the event id in the same transaction as the notification, so a redelivery is a no-op. After bounded retries, a permanently failing record goes to the DLQ with its error so the partition keeps moving, and per-partition lag is the primary health signal.',
    ],
    ai: [
      'Ask an AI to fix a consumer that occasionally sends duplicate notifications, then verify the fix against a crash scenario.',
      '"Enable Kafka transactions with read_committed and produce with enable.idempotence=true - duplicates are solved."',
      ['Producer idempotence prevents duplicate writes to the log, not duplicate side effects after redelivery.', 'The suggestion never addresses a crash between the side effect and the offset commit.'],
      ['Crash the consumer between send and commit and count notifications', 'Check whether a dedupe record exists in the consumer database'],
      'Producer idempotence is necessary but insufficient. The consumer must dedupe on event id atomically with the side effect; only that makes redelivery harmless.',
    ],
    quiz: [
      ['conceptual', 'What does Kafka guarantee by default?', ['Exactly-once business effects', 'At-least-once delivery with per-partition ordering', 'Global ordering across partitions'], 1, 'Ordering is per partition and delivery may repeat.'],
      ['scenario', 'A consumer crashes after sending an email but before committing the offset. Result?', ['The email is lost', 'The record is redelivered, risking a duplicate email', 'Kafka blocks the partition'], 1, 'Redelivery is expected; idempotency makes it safe.'],
      ['debugging', 'One partition has permanent lag while the others are healthy. Most likely cause?', ['Broker disk failure', 'A poison message retried in place', 'Too few producers'], 1, 'Retrying in place prevents the partition from advancing.'],
      ['design', 'You need all events of one order processed in order. Which key?', ['customer id', 'order id', 'random'], 1, 'Keying by order id keeps one order history in one partition.'],
    ],
    // MODULES_END
  }),
  expandModule({
    id: 'M3.2',
    phase: 'M3',
    order: 2,
    title: 'Mail and Notification Services',
    subtitle: 'Async processing, provider failure isolation, retries, transactional boundaries',
    minutes: 120,
    prerequisites: ['M3.1'],
    objective:
      'Build mail-service and notification-service as isolated asynchronous consumers that survive a failing external provider without losing or duplicating messages.',
    stack: ['Kafka', 'Spring Boot 4.1', 'SendGrid HTTP API', 'Dead letter topics'],
    why:
      'Email delivery is the classic external dependency that fails slowly and unpredictably; isolating it proves the event-driven design actually protects the checkout path.',
    explanation: [
      'Mail service renders and sends provider messages; notification service decides what a customer should be told. Both consume events and never sit in the write path.',
      'Third-party providers have their own outages, rate limits and latency spikes, so putting them behind an event boundary keeps their failures out of core transactions.',
      'It keeps account and order writes fast and available while email delivery degrades independently.',
      'A consumer reads an event, renders a template, calls the provider with an idempotency key and records the attempt; failures are retried with backoff and then dead-lettered.',
      'When the provider returns 429 or times out, the consumer must not spin: bounded retries with jitter, then DLQ. A provider outage produces growing lag, not failed checkouts.',
      'Asynchronous delivery removes user-visible coupling but delays feedback and hides failures from the caller, so provider health must be monitored explicitly.',
      'Provider rate limiting, duplicate sends on retry, template rendering failures, missing i18n data, and unbounded retry loops that stall a partition.',
      'Send success and failure counters by provider status code, retry counts, DLQ depth, lag, and delivery latency from event to provider acknowledgement.',
      'Check DLQ depth and provider status codes first; a 401 means credentials, a 429 means throttling, a timeout means network or provider degradation.',
      'Use bounded retries with exponential backoff and jitter, idempotency keys on provider calls, per-provider rate limiting, and a DLQ plus alerting for permanent failures.',
      'Do not send email inside a database transaction, do not retry a permanent 4xx forever, and do not assume the provider is idempotent without a key.',
      'Your provider is down for two hours. What happens to lag, to user-visible behaviour, and to messages once it returns?',
    ],
    keys: [
      'Email delivery never blocks a business write path.',
      'Provider calls carry an idempotency key so retries do not double-send.',
      'Bounded retry with jitter, then DLQ with the original payload.',
      'Provider outages appear as lag, not as failed checkouts.',
    ],
    concepts: [
      ['Decide what notification-service owns versus mail-service and why the split matters.', 'Notification owns policy (who is told what, in which channel); mail owns transport and provider specifics, so provider changes never touch business policy.', 'architecture'],
      ['Design the retry policy for a provider returning 429 with a Retry-After header.', 'Respect the header as the minimum delay, add jitter, cap attempts, and reduce consumer concurrency per provider key to avoid amplifying throttling.', 'reliability'],
    ],
    labs: [
      {
        id: 'M3.2-L1',
        title: 'Resilient mail consumer',
        minutes: 100,
        objective: 'Send provider messages asynchronously with idempotency, bounded retries and a DLQ.',
        context: 'The provider is flaky: it intermittently returns 429 and sometimes takes 10 seconds.',
        architecture: 'account.created.v1 -> notification-service -> mail-service -> SendGrid',
        problem: 'Implement the consumer with an idempotency key, Retry-After aware backoff, DLQ routing and delivery metrics.',
        starter: `@KafkaListener(topics = ["mail.dispatch.v1"], groupId = "mail-service")
fun onDispatch(command: MailDispatch) { /* TODO: idempotent send with retry */ }`,
        lang: 'kotlin',
        requirements: [
          'A replay of one command sends one email.',
          'A 429 response delays the retry instead of failing the message.',
          'Permanent failures appear in mail.dispatch.v1.DLQ with the provider response.',
        ],
        constraints: ['No provider call inside a database transaction.'],
        expected: 'Provider stub returning 429 then 202 leads to one delivered message; a permanent 400 leads to one DLQ record and continued partition progress.',
        tests: [
          ['stub returns 429 then 202', 'one delivery, retry observed with delay'],
          ['stub returns 422 permanently', 'one DLQ record, consumer continues'],
        ],
        hidden: ['Retrying without the idempotency key double-sends when the provider accepted the first request but the response was lost.'],
        output: 'Delivery metrics, DLQ populated only for permanent failures, no duplicate sends on replay.',
        hints: ['Store the provider idempotency key derived from the event id, not a random value.'],
        explanation: 'External providers fail in ways you do not control; the only defence is a boundary, a key and bounded retries.',
        extension: 'Add per-provider rate limiting so a throttled quota cannot be exhausted by parallel consumers.',
      },
    ],
    failures: [
      {
        id: 'M3.2-F1',
        title: 'Provider outage stalls the partition',
        minutes: 45,
        bug: 'The consumer retries the provider indefinitely inside the handler with no backoff and no DLQ, so a 429 response blocks the partition.',
        reproduce: ['./scripts/provider-outage-stub.sh --fail-all', './scripts/publish-mail-batch.sh --count 500'],
        observe: [
          'mail.dispatch.v1 lag grows while the DLQ stays empty',
          'the consumer log shows thousands of provider 429 responses in one minute',
          'the provider dashboard shows throttling for our account',
        ],
        hypotheses: [
          'Kafka has too few partitions for the consumer count.',
          'Unbounded retries without backoff amplify provider throttling and block partition progress.',
          'The provider is permanently broken.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: ['#1 rejected: lag is self-inflicted - one consumer is stuck on one record.', '#3 rejected: the stub returns 429, a temporary condition the client is worsening.'],
        investigate: [
          ['Compare provider request rate during the outage with the normal rate', 'request rate is 40x normal during throttling', 'The client amplifies throttling instead of backing off.'],
          ['Inspect handler retry configuration', 'no max attempts, no backoff, no DLQ route', 'The record can never leave the partition.'],
        ],
        debugOptions: ['Retry amplification with no backoff and no terminal DLQ route.', 'A DNS problem between consumer and provider.'],
        correctRootCause: 0,
        fixOptions: [
          'Bound retries, respect Retry-After with jittered backoff, rate-limit per provider key and dead-letter permanent failures.',
          'Increase consumer concurrency so more records are retried in parallel.',
        ],
        correctFix: 0,
        fixRejection: ['#2 rejected: more concurrency increases the request storm and worsens throttling.'],
        verify: [
          ['Re-run the outage stub', 'bounded request rate, lag grows slowly and drains after recovery, no duplicate sends', 'The consumer now degrades gracefully under provider failure.'],
        ],
        explainPrompt: 'Explain why retry policy is a capacity decision, not just an error-handling detail.',
        modelExplanation:
          'Every retry is a new request to a struggling dependency; without backoff the client converts an outage into a request storm that delays recovery. Evidence: a 40x request rate during throttling with no terminal route for the record. The fix bounds attempts, backs off with jitter, throttles per provider key and dead-letters permanent failures.',
        patterns: ['Bounded retry with jitter', 'Provider rate limiting', 'DLQ', 'Retry amplification'],
        dimension: 'reliability',
      },
    ],
    defense: [
      ['Why is email delivery asynchronous?', 'The customer does not need the email to complete the purchase; synchronous delivery would add a third-party outage to the checkout critical path for no business benefit.', 'architecture', ['Names the user need', 'Mentions critical path']],
      ['How do you avoid double-sending when a provider response is lost?', 'Send a stable idempotency key derived from the event id so the provider can recognise the repeat, and record the attempt locally so replays become no-ops.', 'reliability', ['Stable key', 'Local attempt record']],
      ['How do you handle a permanent provider rejection?', 'Bounded attempts, then route the payload to a DLQ with the provider response and alert, so the partition keeps moving and the failure is visible.', 'reliability', ['Bounded attempts', 'DLQ with evidence', 'Alerting']],
    ],
    english: [
      [
        ['dead letter queue', 'a destination for messages that cannot be processed successfully', 'Permanent provider failures go to a dead letter queue with the response body.'],
        ['retry amplification', 'retries that increase load on an already failing dependency', 'Retrying without backoff turns an outage into retry amplification.'],
      ],
      ['We keep delivery asynchronous so that ___ cannot affect ___.'],
      'Mail service consumes dispatch commands, renders the template and calls the provider with a stable idempotency key. Retries are bounded and respect Retry-After with jitter, permanent failures go to a DLQ with the provider response, and provider health is monitored as lag plus status-code counters.',
      [[
        'A customer reports never receiving a password reset email',
        'Provider calls were throttled and our consumer retried without backoff, so lag grew instead of recovering. We bounded the retries, honoured Retry-After and added a DLQ.',
      ]],
      ['This provider call sits inside the transaction, so a slow provider would hold a database connection - let us move it behind the dispatch topic.'],
      ['The provider is a shared dependency with its own limits, so we rate-limit per key instead of letting every consumer retry freely.'],
      ['How do you guarantee a customer is not emailed twice for one event?', 'What happens to email delivery when the provider is unavailable for two hours?'],
      'Email is asynchronous because the purchase does not depend on it: a third-party call in the checkout path would add an outage we do not control. The dispatch consumer sends with a stable idempotency key derived from the event id, so a lost response does not cause a second email. Retries are bounded and honour the provider Retry-After header with jitter, and permanent rejections go to a DLQ with the response so the partition keeps moving. When the provider is down for two hours, lag grows and then drains after recovery - customers still check out.',
    ],
    ai: [
      'Ask an AI to make email sending reliable, then verify the retry behaviour it proposes.',
      '"Wrap the send in while(true) with catch(Exception) and log - that guarantees delivery."',
      ['An unbounded loop blocks the consumer and amplifies throttling.', 'Catching every exception hides permanent failures with no terminal route.'],
      ['Run the provider outage stub and watch request rate and lag', 'Confirm the DLQ receives permanent failures'],
      'Correct intent, unsafe implementation. Bounded attempts with jittered backoff plus a DLQ and provider rate limiting give reliability without amplifying the outage.',
    ],
    quiz: [
      ['conceptual', 'Why must email delivery be asynchronous?', ['Email is slow', 'To keep a third-party outage out of the business write path', 'Kafka policies require it'], 1, 'A reaction to a fact should not be a hard dependency of the write.'],
      ['scenario', 'The provider returns 429 with Retry-After: 30. Correct behaviour?', ['Retry immediately', 'Wait at least 30 seconds plus jitter and cap attempts', 'Drop the message'], 1, 'Honouring Retry-After prevents throttling amplification.'],
      ['debugging', 'Lag grows while the DLQ stays empty during provider throttling. Cause?', ['Partition count', 'Unbounded retries without backoff', 'Serialisation error'], 1, 'Records cannot leave the partition because they are retried in place.'],
    ],
    // MODULES_END
  }),
  expandModule({
    id: 'M3.3',
    phase: 'M3',
    order: 3,
    title: 'Elasticsearch Search, MongoDB Orders and Polyglot Persistence',
    subtitle: 'Indexing, reindexing, eventual consistency, document modelling, datastore trade-offs',
    minutes: 180,
    prerequisites: ['M3.2'],
    objective:
      'Index product events into Elasticsearch, model order documents in MongoDB, and reason about consistency, performance and failure modes per datastore.',
    stack: ['Elasticsearch', 'MongoDB', 'Kafka', 'Spring Data'],
    why:
      'Search and order documents have different access patterns from accounting data; choosing one database for everything means every workload pays the wrong cost.',
    explanation: [
      'Elasticsearch stores an inverted index for text search and aggregations; MongoDB stores flexible documents for order aggregates with variable line items.',
      'Catalogue SQL queries cannot serve ranked full-text search, and order documents change shape per promotion, so relational schemas fight both workloads.',
      'It gives each service a store shaped for its access pattern instead of forcing one engine to be mediocre at everything.',
      'Product change events are consumed and written into an Elasticsearch index with an external version for idempotent upserts; order documents embed line items and reference product ids.',
      'The index lags the database by the event propagation time, so a product edited now may not be searchable for a few hundred milliseconds - a visible eventual-consistency window.',
      'You gain relevance ranking, aggregations and schema flexibility, and you accept operational duplication, reindexing work, and cross-store consistency you must design.',
      'Index lag, dropped or duplicated indexing events, mapping conflicts, deep-pagination limits, and MongoDB documents growing past the 16 MB document limit.',
      'Index lag from event timestamp to indexed timestamp, indexing error counts, mapping conflicts, ES cluster health, Mongo document size and index usage.',
      'Compare the database row with the index document for one product id to expose lag or a missing event, then read the indexing consumer log for mapping rejections.',
      'Make indexing idempotent with an external version, add a reindex path from the source of truth, alert on lag, and monitor mapping conflicts before they break writes.',
      'Do not use Elasticsearch as the primary store, do not embed unbounded arrays in MongoDB documents, and do not treat a search index as a transactional record.',
      'Elasticsearch contains a product your database does not. Which system is wrong, and how do you prove it?',
    ],
    keys: [
      'A read model can lag; the source of truth cannot be the index.',
      'Index writes must be idempotent (external version) to survive redelivery.',
      'MongoDB documents are bounded: never embed unbounded growth.',
      'Every polyglot store needs an explicit reindex/rebuild procedure.',
    ],
    concepts: [
      ['Model an order document for MongoDB and justify embedding versus referencing.', 'Embed line items (bounded, always read with the order) and reference product ids for catalogue data that changes independently.', 'data'],
      ['Design the recovery plan when the search index is corrupted.', 'Rebuild from the database via a snapshot plus event replay from a known offset; never patch the index by hand.', 'data'],
    ],
    labs: [
      {
        id: 'M3.3-L1',
        title: 'Product events to search index with lag visibility',
        minutes: 120,
        objective: 'Index product changes idempotently and expose index lag.',
        context: 'The storefront must search text and filter facets, which SQL cannot do well at catalogue scale.',
        architecture: 'product-service -> Kafka product.changed.v1 -> search-indexer -> Elasticsearch',
        problem: 'Consume change events, upsert with an external version, expose lag and support a full reindex command.',
        starter: `@KafkaListener(topics = ["product.changed.v1"], groupId = "search-indexer")
fun onProductChanged(event: ProductChanged) { /* TODO: idempotent index upsert */ }`,
        lang: 'kotlin',
        requirements: ['Duplicate events produce one document version.', 'Index lag is measurable per product id.', 'A full reindex rebuilds the index from the database.'],
        constraints: ['The indexer must never write to the product database.'],
        expected: 'Replaying a product event leaves one document; a simulated out-of-order older event is ignored by version comparison.',
        tests: [['replay the same product event', 'one document, unchanged version'], ['send an older version after a newer one', 'index keeps the newer version']],
        hidden: ['Indexing without a version lets an out-of-order older event overwrite newer data.'],
        output: 'Lag metric per product, idempotent upserts, reindex procedure verified.',
        hints: ['Use the event version as an external version so the index rejects stale writes.'],
        explanation: 'The index is a derived read model: it must be rebuildable and idempotent, never authoritative.',
        extension: 'Add a MongoDB order document read path and confirm the order aggregate is loaded in a single query.',
      },
    ],
    // MODULES_END
  }),
];
