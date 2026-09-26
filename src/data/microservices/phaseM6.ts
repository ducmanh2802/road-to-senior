/**
 * PHASE M6 — Observability & Production Incident Engineering.
 *
 * M6 turns the distributed microservices architecture into an observable,
 * debuggable, and production-hardened platform. Every module carries the full
 * 12-stage engineering framework:
 * LEARN → CODE → BREAK → OBSERVE → DEBUG → FIX → BENCHMARK → DESIGN
 *       → EXPLAIN → DEFEND → ASSESS → REVIEW
 *
 * Honesty contract:
 * - REAL_EXECUTABLE: structured logging, tracing interceptors, and Micrometer metrics.
 * - SIMULATED: high-scale telemetry streams, large multi-service traces, and cluster
 *   failures are simulated deterministically in this environment and clearly labelled.
 * - SPECIFICATION: postmortem reports and SLO contracts.
 */
import type { MsCapstoneSnapshot, MsIncident, MsModule, MsPhaseMeta } from './types';
import { expandModule } from './compact';
import { debugEx } from './authoring';

export const MS_M6_PHASE: MsPhaseMeta = {
  id: 'M6',
  order: 6,
  title: 'Observability & Production Incident Engineering',
  subtitle: 'Structured logging, distributed tracing, Golden Signals, SLI/SLO error budgets, and full-spectrum incident response',
  goal:
    'Master production observability and incident triaging: configure high-fidelity structured JSON logs, trace asynchronous requests across HTTP and Kafka seams, measure Golden Signals and SLI burn rates, and diagnose complex distributed incidents using correlated evidence without guesswork.',
  sessions: 'Source sessions 43–52',
  architectureMilestone:
    'Comprehensive telemetry mesh with OpenTelemetry/W3C context propagation, structured log sanitization, Prometheus/Micrometer Golden Signal metrics, Grafana/Tempo trace visualization, automated SLO alerting, and runbook-backed incident triage.',
};

/** PHASE M6 MODULES */
export const MS_M6_MODULES: MsModule[] = [
  expandModule({
    id: 'M6.1',
    phase: 'M6',
    order: 1,
    title: 'Structured Logging & Telemetry Hygiene',
    subtitle:
      'JSON log formatting, Logback encoders, MDC context propagation, sensitive data masking, high-cardinality pitfalls, and boundary event logging',
    minutes: 190,
    prerequisites: ['M5.1'],
    objective:
      'Design and configure a production-grade structured logging pipeline in Spring Boot: emit standardized JSON logs with MDC context (traceId, spanId, userId, tenantId), enforce PII/PCI masking, and eliminate high-cardinality log anti-patterns.',
    stack: ['Logback', 'Logstash Logback Encoder', 'SLF4J', 'Micrometer Tracing', 'Jackson'],
    mode: 'REAL_EXECUTABLE',
    why:
      'Unstructured plain-text logs cannot be parsed or indexed reliably at scale. When an incident occurs across dozens of nodes, grep is useless. Structured JSON with correlation IDs enables distributed log aggregation, precise filtering, and rapid anomaly detection.',
    explanation: [
      'Structured logging emits log records as typed machine-readable JSON objects containing fixed contextual fields (timestamp, level, service, traceId, event, durationMs) alongside domain payloads.',
      'Plain-text string interpolation (logger.info("Order " + id + " created")) requires brittle regular expressions to parse, leaks memory through string concatenation, and cannot be searched by specific fields in Elasticsearch or Loki.',
      'Enables fast querying across billions of log lines by specific dimensions (service=order-service AND status=FAILED AND latencyMs > 500), automated PII scrubbing at the encoder level, and trace-to-log cross-linking.',
      'SLF4J delegates to Logback; LogstashEncoder formats events into JSON; MDC (Mapped Diagnostic Context) stores thread-local key-value pairs (traceId, tenantId) automatically injected into every log line emitted on that thread.',
      'Incoming HTTP request -> Filter extracts X-Correlation-Id and traceparent -> writes to MDC -> Business code logs -> Encoder serializes to stdout in JSON -> Daemon/Sidecar (FluentBit/Promtail) ships to aggregator.',
      'Structured logging consumes 20-30% more disk/network bandwidth due to JSON key redundancy (mitigated by compression); requires strict governance over field naming to avoid index mapping explosion.',
      'High-cardinality keys in log index mappings crashing Elasticsearch; logging sensitive secrets (passwords, credit cards, JWTs); thread pool thread reuse leaking stale MDC context to subsequent requests; logging inside tight loops destroying I/O performance.',
      'Log indexing throughput, log drop rate (queue saturation in async appenders), disk I/O wait percent, and Elasticsearch mapping field count.',
      'Inspect raw JSON output via terminal; verify MDC cleanup in finally blocks; audit regex masking rules against test payloads; check AsyncAppender queue size and discardThreshold.',
      'Use LogstashEncoder with CompositeJsonEncoder; wrap request filters in try-finally { MDC.clear(); }; configure ReplaceEvaluatingMarker for sensitive field redaction; use AsyncAppender with neverBlock=true.',
      'Do not use synchronous console appenders in high-throughput production (always use AsyncAppender); do not log full request/response bodies on high-frequency health checks or streaming endpoints.',
      'A developer logs full request payloads including Authorization headers and credit card numbers "for easier local debugging". How do you enforce automated PII redaction before log records reach disk or network?',
    ],
    keys: [
      'Every production log entry must be valid, parseable JSON with timestamp, service, level, and trace context.',
      'MDC is backed by ThreadLocal: always clear MDC in a finally block to prevent context leakage across pooled threads.',
      'Never log plaintext PII, credentials, or session tokens; sanitize at the Logback appender level.',
      'Use asynchronous log appenders to decouple application request threads from disk and network I/O.',
      'Distinguish log levels: ERROR for actionable failures, WARN for expected transient degradation, INFO for lifecycle state transitions.',
      'Avoid high-cardinality field explosion: do not index arbitrary client-generated strings as discrete Elasticsearch keys.',
    ],
    concepts: [
      [
        'Explain why ThreadLocal MDC context leaks occur in thread-pooled web servers (like Tomcat or Netty).',
        'Web servers reuse worker threads across requests. If a request handler populates MDC with userId="alice" and fails to clear it upon completion, the next request processed by that thread will inherit alice identity in its logs until overwritten.',
        'observability',
      ],
      [
        'How does Logback AsyncAppender prevent application threads from blocking on disk I/O?',
        'AsyncAppender wraps standard appenders with an internal blocking ring buffer (ArrayBlockingQueue). Worker threads offer log events to the buffer in nanoseconds, while a background daemon thread drains the queue and writes to disk or network.',
        'performance',
      ],
      [
        'Analyze the danger of high-cardinality field names in Elasticsearch/Loki log aggregation.',
        'Dynamic mapping in Elasticsearch creates a new index mapping for every unique JSON field key. If developers log dynamic keys like `fields.put(uuid, value)`, the cluster exceeds the `index.mapping.total_fields.limit` (default 1000) and rejects all logs.',
        'production-engineering',
      ],
      [
        'Design an automated PII masking rule for credit card numbers and passwords in Logback.',
        'Configure a custom ValueMaskingJsonProvider or regex pattern replacement in logback.xml that detects PAN credit card patterns (16 digits) and sensitive field keys ("password", "cvv") and replaces them with [REDACTED] before serialization.',
        'reliability',
      ],
      [
        'When should a microservice log at ERROR level vs WARN level?',
        'ERROR level must be reserved for unexpected system failures that require immediate engineer action (e.g. database down, unhandled exception). WARN is for expected, handled transient anomalies (e.g. circuit breaker open, fallback executed, 401 client error).',
        'architecture',
      ],
      [
        'How do structured boundary logs differ from internal algorithmic debug logs?',
        'Boundary logs capture requests and responses at network seams (HTTP controllers, Feign clients, Kafka listeners) with duration, status, and correlation IDs. Internal debug logs trace code execution within a single method and should be disabled in production.',
        'implementation',
      ],
    ],
    labs: [
      {
        id: 'M6.1-L1',
        title: 'Configure production JSON logging with MDC trace injection and PII masking',
        minutes: 110,
        mode: 'REAL_EXECUTABLE',
        objective:
          'Configure Spring Boot with Logstash Logback Encoder to produce standardized JSON logs containing service, environment, correlationId, traceId, and automated redaction for sensitive fields.',
        context:
          'Logs are currently emitted in plain text without trace IDs. Security auditors flagged unmasked credit cards and email addresses in production log files.',
        architecture:
          'Spring Boot Application -> SLF4J / MDC -> Logback -> LogstashEncoder (PII Masking Provider) -> stdout (JSON Stream)',
        problem:
          'Create logback-spring.xml configuring LogstashEncoder with standard metadata (service_name, env). Implement an MDCFilter that extracts X-Correlation-Id into MDC.key("correlationId") and clears it in finally. Add a custom masking regex that replaces 16-digit card numbers with "****-****-****-XXXX".',
        starter: `<!-- src/main/resources/logback-spring.xml -->
<configuration>
  <appender name="JSON_CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <!-- TODO: Configure custom providers, fields, and masking -->
    </encoder>
  </appender>
  <root level="INFO">
    <appender-ref ref="JSON_CONSOLE" />
  </root>
</configuration>`,
        lang: 'xml',
        requirements: [
          'Log output is strictly single-line valid JSON per event.',
          'Every log record contains timestamp, level, logger, service="senior-java-capstone", and traceId.',
          'MDCFilter injects correlationId and clears it in a finally block.',
          'Sensitive fields (PAN, CVV, password) are automatically replaced with "[REDACTED]".',
        ],
        constraints: [
          'No external network logging dependencies inside the test harness.',
          'Logback initialization must not throw warnings or un-escaped XML errors.',
        ],
        expectedBehaviour:
          'Logging logger.info("Order processed for card 4111222233334444") outputs valid JSON containing "message":"Order processed for card ****-****-****-4444" and valid "traceId".',
        testCases: [
          ['Log with card number 4111222233334444', 'JSON message field contains masked card with last 4 digits visible'],
          ['Inbound request with X-Correlation-Id: test-corr-999', 'JSON contains "correlationId":"test-corr-999"'],
          ['Subsequent request without correlation header', 'MDC does not retain test-corr-999 (zero leak)'],
        ],
        hiddenFailures: [
          'Failing to clear MDC in finally causes context leakage across threads in the connection pool.',
          'Regex masking with catastrophic backtracking freezes the logging thread under long input.',
        ],
        output:
          'Single-line JSON log lines verified by JSON schema validation and zero PII leakage.',
        hints: [
          'Use <customFields>{"service":"order-service"}</customFields> in LogstashEncoder.',
          'Use <includeMdcKeyName>correlationId</includeMdcKeyName> to include MDC keys.',
        ],
        verification:
          'Execute unit test emitting 100 log lines; parse stdout with Jackson; assert every line is valid JSON with mandatory fields.',
        explanation:
          'Standardized JSON logs enable ingestion by ELK, Grafana Loki, or Datadog, while automated masking guarantees compliance without relying on developer discipline.',
        extension:
          'Wrap the ConsoleAppender in AsyncAppender with queueSize=1024 and discardingThreshold=0.',
      },
    ],
    debug: [
      debugEx(
        'M6.1-D1',
        'Tomcat worker threads intermittently log wrong tenantId and userId for requests belonging to other users.',
        'Security alert: Tenant A logs show operations tagged with Tenant B tenantId under high concurrency.',
        [
          'TenantContextFilter sets MDC.put("tenantId", tenant) at beginning of request',
          'Controller throws an unhandled RuntimeException during execution',
          'Filter was missing try-finally block around chain.doFilter()',
          'Worker thread returns to pool with stale MDC context and serves next request',
        ],
        'Diagnose the MDC context leak and wrap request filter in guaranteed try-finally cleanup.',
        'MDC relies on ThreadLocal storage. When worker threads are pooled, failing to clear MDC in a finally block allows state to persist into subsequent unrelated requests. The fix is strictly executing MDC.clear() inside a finally block.',
        ['grep "tenantId" logs/application.log | grep "TenantA" | grep "order_tenant_b"', 'curl -s http://localhost:8080/api/v1/trigger-error']
      ),
    ],
    failures: [
      {
        id: 'M6.1-F1',
        title: 'Synchronous console logging causes 10x throughput collapse under load',
        minutes: 60,
        mode: 'REAL_EXECUTABLE',
        bug: 'A service used standard ConsoleAppender with synchronous stdout output. Under 5,000 req/sec, Linux kernel tty mutex contention blocked all Tomcat threads, causing p99 latency to explode from 8ms to 850ms.',
        reproduce: [
          './scripts/load-test.sh --concurrency 50 --rps 2000',
          'curl -w "%{time_total}\n" http://localhost:8080/api/v1/orders',
        ],
        observe: [
          'Application throughput drops from 2,500 req/sec to 210 req/sec.',
          'CPU usage is low, but all Tomcat worker threads are in BLOCKED or WAITING state.',
          'jstack shows threads blocked on `java.io.PrintStream.write` and `ch.qos.logback.core.ConsoleAppender.write`.',
        ],
        hypotheses: [
          'The database ran out of connections.',
          'Synchronous stdout console logging caused OS-level mutex contention across threads.',
          'Garbage collection full pause.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: database connection pool is 90% idle.',
          '#2 rejected: GC logs show pauses under 4ms.',
        ],
        investigate: [
          ['jstack $(pgrep -f order-service) | grep -A 5 "ConsoleAppender"', 'Found 48 threads waiting on lock <0x00000007> held by thread-12', 'System.out lock contention verified.'],
          ['grep -A 10 "appender name=\"CONSOLE\"" src/main/resources/logback.xml', 'ConsoleAppender is not wrapped in AsyncAppender', 'Synchronous logging confirmed.'],
        ],
        debugOptions: [
          'Synchronous stdout logging blocks application threads on OS I/O locks.',
          'Log level was set to DEBUG in production.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Wrap ConsoleAppender in ch.qos.logback.classic.AsyncAppender with bounded ring buffer and neverBlock=true.',
          'Delete all log statements from the codebase.',
        ],
        correctFix: 0,
        fixRejection: [
          'Deleting logs removes all operational visibility and makes incident triage impossible.',
        ],
        verify: [
          ['./scripts/load-test.sh --concurrency 50 --rps 2000', 'p99 latency returns to 7ms, zero threads blocked on ConsoleAppender', 'Asynchronous appender decouples request processing.'],
        ],
        explainPrompt:
          'Explain why synchronous System.out logging creates thread contention in multi-threaded JVM applications.',
        modelExplanation:
          'In Java, System.out is backed by a PrintStream which synchronizes on an internal monitor lock for every single print() or write() call. Under high concurrency with dozens of worker threads writing log lines simultaneously, all threads serialize behind this single lock. In containerized environments, writing to stdout also involves Linux pipe and tty buffer operations, which block threads when the OS buffer fills, collapsing application throughput.',
        patterns: ['Asynchronous Logging', 'Thread Contention', 'I/O Blocking', 'Ring Buffer'],
        dimension: 'performance',
      },
    ],
    design: {
      id: 'M6.1-AC1',
      title: 'Design high-volume log pipeline for 50-service fintech microservices',
      scenario:
        'A banking architecture generates 40,000 log events/sec across 50 microservices running on Kubernetes. Security compliance requires 1-year retention, sub-10s queryability, PII masking, and zero impact on payment latency.',
      requirements: [
        'Define standardized JSON schema for all service logs (mandatory and optional fields).',
        'Design local node log collection architecture (FluentBit daemonset vs sidecar).',
        'Specify PII masking rules and compliance validation.',
        'Define index lifecycle management (hot, warm, cold storage tiers) in Elasticsearch/Loki.',
      ],
      constraints: [
        'Application log overhead must add < 0.2ms to p99 request latency.',
        'Zero cleartext credit card PAN or customer passwords may reach central log store.',
      ],
      deliverables: [
        'JSON schema specification with strict type validation.',
        'DaemonSet log forwarding architecture diagram with backpressure handling.',
        'Retention and storage cost optimization strategy.',
      ],
      failureModes: [
        'Elasticsearch cluster becomes read-only due to disk watermark breach (95% disk usage).',
        'Log shipping daemon consumes 100% node CPU parsing un-structured multiline stack traces.',
      ],
      tradeoffQuestions: [
        {
          question: 'Should log shipping be implemented as a Kubernetes DaemonSet or as a pod Sidecar?',
          modelAnswer:
            'A DaemonSet (one collector per node reading /var/log/pods) is vastly superior for resource efficiency: running 500 microservice pods with sidecars requires 500 separate logging agents consuming gigabytes of duplicate RAM. A DaemonSet shares one agent per physical node. Sidecars are only justified if individual pods require isolated TLS certificates or custom network egress routing.',
        },
        {
          question: 'What happens when the central log aggregator suffers an outage?',
          modelAnswer:
            'The local collector (FluentBit) buffers logs in local disk or memory buffers. If the buffer limit is reached, the application must drop logs rather than blocking request threads (never block the transaction path for telemetry). The loss of telemetry during an aggregator outage is preferable to taking down the entire banking platform.',
        },
      ],
    },
    defense: [
      [
        'A developer wants to log full request and response JSON payloads for all endpoints in production. Defend your rejection.',
        'Logging full payloads in production creates massive disk saturation, multiplies network I/O, increases cloud logging costs by orders of magnitude, and guarantees that sensitive PII and authentication tokens will eventually leak into logs. Instead, we log high-level boundary events with metadata (endpoint, status, duration, item count) and capture detailed payloads only in pre-production or via targeted dynamic trace sampling.',
        'production-engineering',
        ['Highlights cost and I/O impact.', 'Cites security and PII leakage risks.', 'Proposes metadata logging and sampling.'],
      ],
      [
        'Why mandate structured JSON over human-readable plain text logs if developers prefer reading text in terminal?',
        'In a distributed system with millions of daily requests across dozens of services, humans cannot read raw log streams in a terminal. Centralized aggregators (Elasticsearch, Loki) require structured JSON keys to index, filter, and correlate events across machines. Developers can still use CLI tools like `jq` or aggregator dashboards to view formatted, human-readable representations on demand.',
        'observability',
        ['Explains scale limitation of text.', 'Emphasizes indexing and query capabilities.', 'Offers CLI tools like jq as alternative.'],
      ],
    ],
    english: [
      [
        ['structured logging', 'Logging data in an organized, machine-readable format like JSON.', 'Structured logging allows us to query logs by specific transaction IDs.'],
        ['Mapped Diagnostic Context', 'A thread-local map that provides contextual data to loggers.', 'We store the correlation ID in the MDC at the start of each request.'],
        ['PII masking', 'The process of obfuscating personally identifiable information in telemetry.', 'Automated PII masking prevents credit card numbers from leaking into log files.'],
        ['high cardinality', 'A condition where a dataset field contains a huge number of unique values.', 'Indexing high-cardinality keys directly into Elasticsearch crashes the cluster mapping.'],
        ['log retention', 'The period of time log data is stored before being archived or purged.', 'Compliance standards mandate a 365-day log retention policy for audit trails.'],
      ],
      [
        'Always clean up the Mapped Diagnostic Context inside a finally block.',
        'Never permit synchronous stdout writes on high-concurrency request paths.',
        'Structured logs bridge the gap between human inspection and automated telemetry aggregation.',
      ],
      'Our observability framework mandates structured JSON logging across all microservices. Every log record carries standardized metadata including timestamp, service name, environment, and W3C trace identifiers extracted via MDC. Automated masking providers sanitize sensitive payment and user information at the Logback appender level before bytes touch disk. Asynchronous logging ensures that telemetry operations never contend with transaction processing threads.',
      [
        ['Logs are missing correlation IDs after an async task hop', 'The ThreadLocal MDC was not transferred to the CompletableFuture worker thread. We implemented an MDC-aware task decorator.'],
        ['Elasticsearch rejected logs due to field mapping limit', 'A service was logging dynamic user IDs as top-level JSON keys. We refactored the payload to use a structured nested array.'],
      ],
      [
        'Wrap this filter logic in a try-finally block and execute MDC.clear() upon completion.',
        'Please replace this plain-text string concatenation with parameterized structured logging.',
        'Ensure this console appender is wrapped in an AsyncAppender to prevent I/O blocking.',
      ],
      [
        'How does your logging architecture protect against PII and credential leakage?',
        'What is the operational impact of logging inside tight computational loops?',
        'How do you correlate log statements generated across multiple asynchronous thread pools?',
      ],
      [
        'Why is ThreadLocal cleanup critical when using MDC in thread-pooled servers?',
        'How do you balance log verbosity against storage cost and I/O overhead?',
        'What strategies prevent high-cardinality field explosion in log search clusters?',
      ],
      'Production logging requires strict architectural hygiene. By replacing arbitrary plain-text messages with strongly-typed, schema-compliant JSON, we transform raw logs into an indexed, queryable data stream. Automated redaction safeguards customer privacy, while asynchronous non-blocking appenders protect application throughput. Coupled with correlation context in the MDC, structured logging turns distributed needles in haystacks into targeted, one-click investigations.',
    ],
    ai: [
      'Ask an AI to write a Spring Boot filter that logs all incoming HTTP requests and responses.',
      'The AI suggests creating an HttpLoggingFilter that reads `request.getInputStream()` and writes the raw bytes to `System.out.println()`, then logs `response.getOutputStream()`.',
      [
        'Reading `request.getInputStream()` directly consumes the servlet request body stream, causing subsequent controller handlers to throw an EOFException or empty body error.',
        'Using `System.out.println()` introduces synchronous thread blocking on the console monitor lock.',
        'Logging raw request and response bodies blindly leaks passwords, credit card numbers, and authorization headers in plaintext.',
        'The solution breaks Spring MVC request handling and violates security standards.',
      ],
      [
        'Ask the AI what happens when the controller tries to read `@RequestBody` after the filter read the stream.',
        'Ask how Spring ContentCachingRequestWrapper solves the stream consumption problem.',
        'Ask why `System.out.println` should never be used in enterprise server applications.',
      ],
      'Correct outcome: Reject naive stream reading and console printing. Use Spring `ContentCachingRequestWrapper` with size limits, mask sensitive JSON fields, and emit structured JSON via asynchronous SLF4J loggers.',
    ],
    quiz: [
      ['conceptual', 'What is the primary benefit of structured JSON logging over plain text?', ['JSON logs use less disk space', 'JSON logs can be indexed, filtered, and queried by specific field keys in centralized log aggregators', 'JSON logs bypass the operating system', 'JSON logs execute faster than Java code'], 1, 'Structured fields enable fast indexed search and filtering.'],
      ['scenario', 'A worker thread in Tomcat processes Request A for User 1, then Request B for User 2. Request B logs show User 1 ID. Why?', ['The user hacked the server', 'MDC was populated during Request A and never cleared in a finally block, leaking to the reused thread', 'Tomcat is running in single-user mode', 'The database has a duplicate key'], 1, 'MDC ThreadLocal persists across reused pool threads if not cleared.'],
      ['performance', 'Why should production applications use AsyncAppender in Logback?', ['It translates Java to C++', 'It offloads disk and network writes to a background thread, preventing request threads from blocking on I/O', 'It compresses files with ZIP', 'It makes log files invisible to hackers'], 1, 'AsyncAppender prevents I/O blocking on request threads.'],
      ['design', 'What is the best practice for handling sensitive PII (like credit card numbers) in logs?', ['Delete all logs every hour', 'Redact or mask sensitive patterns automatically at the logging framework appender level before emission', 'Trust developers not to log them', 'Store logs in encrypted zip files only'], 1, 'Automated redaction at the appender guarantees compliance.'],
      ['debugging', 'Elasticsearch throws "Limit of total fields [1000] has been exceeded" and drops logs. Root cause?', ['Disk is 100% full', 'Application is logging dynamic high-cardinality keys as top-level JSON fields, causing mapping explosion', 'Network cable is unplugged', 'Java version is outdated'], 1, 'Dynamic JSON keys explode Elasticsearch index mappings.'],
    ],
  }),

  expandModule({
    id: 'M6.2',
    phase: 'M6',
    order: 2,
    title: 'Distributed Tracing & W3C Context Propagation',
    subtitle:
      'W3C traceparent headers, spans, parent-child hierarchies, Micrometer Tracing, OpenTelemetry, asynchronous boundaries, and Kafka trace injection',
    minutes: 200,
    prerequisites: ['M6.1', 'M5.1'],
    objective:
      'Implement end-to-end distributed tracing across synchronous HTTP and asynchronous Kafka message boundaries: propagate W3C traceparent headers, inject span baggage, diagnose broken traces, and trace complete multi-service user journeys.',
    stack: ['Micrometer Tracing', 'OpenTelemetry', 'Brave / OTel Bridge', 'W3C TraceContext', 'Spring Kafka'],
    mode: 'REAL_EXECUTABLE',
    why:
      'In a microservice call chain (Client -> Gateway -> Order -> Inventory -> Payment -> Notification), an error or latency spike at the end of the chain is impossible to diagnose without distributed tracing. Tracing connects isolated logs into a unified end-to-end transaction timeline.',
    explanation: [
      'Distributed tracing records the end-to-end execution path of a transaction across distributed processes; a Trace is a directed acyclic graph (DAG) of Spans, where each Span represents an individual unit of contiguous work with start time, duration, and metadata.',
      'Microservice requests hop across networks, thread pools, and messaging queues. Without a unified trace ID carried across process boundaries, developers cannot determine which downstream service caused an upstream timeout.',
      'Allows visualizing the entire lifecycle of a request, pinpoints exact service and database query latency bottlenecks, proves where network latency occurred, and links all disparate service logs to a single trace.',
      'W3C Trace Context standardizes the `traceparent` header (version-traceId-parentId-traceFlags); Micrometer Tracing intercepts inbound and outbound HTTP/Kafka calls, creating child spans and injecting/extracting headers automatically.',
      'Inbound HTTP request -> Gateway starts root span (traceId=abc, spanId=001) -> forwards traceparent to OrderService -> Order creates child span (spanId=002, parentId=001) -> Order publishes Kafka record -> Kafka header interceptor injects traceparent -> Consumer extracts and continues trace.',
      'Tracing provides invaluable operational transparency; the trade-off is minor CPU/network overhead (header serialization) and massive storage requirements for high-volume span collectors (solved by head-based or tail-based sampling).',
      'Broken trace context across asynchronous thread pools (ExecutorService without trace decoration); missing Kafka header propagation; un-instrumented HTTP clients dropping traceparent; clock skew making child spans appear before parent spans.',
      'Trace completion rate (spans with matching root traces), span duration percentiles by service, trace storage ingestion rate, and sampling rate ratios.',
      'Inspect HTTP request headers using curl -v, check Kafka record headers using kafka-console-consumer, verify Micrometer Tracing bean configurations, and check Zipkin/Jaeger span waterfall charts.',
      'Use ContextSnapshot or DelegatingSecurityContextAsyncTaskExecutor for async thread boundaries; configure Spring Kafka RecordMessageConverter with trace support; enforce W3C traceparent standard across all clients.',
      'Do not instrument ultra-tight in-memory loops with individual spans (creates extreme allocation overhead); do not configure 100% trace sampling on multi-billion request/day production clusters without dedicated storage.',
      'A request travels Gateway -> OrderService -> Kafka -> NotificationService. In Zipkin, OrderService and NotificationService appear as two completely separate traces. Where did context propagation break, and how do you fix it?',
    ],
    keys: [
      'W3C traceparent header format: `00-{traceId}-{spanId}-{flags}` is the universal standard.',
      'A Trace is a collection of Spans forming a call tree; every Span has a name, start time, duration, and tags.',
      'Asynchronous thread pools destroy ThreadLocal trace context unless wrapped in trace-aware executors.',
      'Kafka message headers must carry the traceparent across message broker seams.',
      'Span tags (attributes) provide searchable metadata (e.g. http.status_code, order.id, error=true).',
      'Sampling strategies (head vs tail) balance observability fidelity against collector storage costs.',
    ],
    concepts: [
      [
        'Deconstruct the W3C traceparent header: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01.',
        '00 is the specification version; 4bf9... is the 16-byte hex Trace ID; 00f0... is the 8-byte hex Parent Span ID; 01 is the trace flags (01 means recorded/sampled).',
        'observability',
      ],
      [
        'Why does standard Java CompletableFuture.supplyAsync() break distributed trace propagation?',
        'Tracing context (traceId, spanId) is stored in ThreadLocal memory. supplyAsync() executes work on the ForkJoinPool commonPool, which runs on a different thread that does not inherit the caller ThreadLocal, severing the trace.',
        'distributed-systems',
      ],
      [
        'How does Kafka trace propagation work across producer and consumer boundaries?',
        'The Spring Kafka producer interceptor serializes the active traceparent into byte arrays inside the Kafka ProducerRecord headers. The consumer interceptor reads the record headers and creates a child span linked to the producer trace.',
        'implementation',
      ],
      [
        'Compare Head-based Sampling vs Tail-based Sampling in distributed tracing.',
        'Head-based sampling decides whether to sample at the ingress gateway when the request begins (e.g. 5% sample rate). Tail-based sampling evaluates the trace after it completes, guaranteeing that 100% of errors and high-latency traces are stored while sampling boring 200 OK traces.',
        'architecture',
      ],
      [
        'What is Span Baggage and how does it differ from Span Tags?',
        'Span Tags are local to a single span and not transmitted downstream. Span Baggage consists of key-value pairs (e.g. customer-tier=VIP) that are serialized into HTTP/Kafka headers and propagated across the entire downstream call chain.',
        'system-design',
      ],
    ],
    labs: [
      {
        id: 'M6.2-L1',
        title: 'End-to-end W3C trace propagation across HTTP and Kafka boundaries',
        minutes: 110,
        mode: 'REAL_EXECUTABLE',
        objective:
          'Implement W3C trace context propagation across a multi-tier flow: Gateway -> OrderService (HTTP) -> Kafka -> InventoryService (Consumer), verifying traceId continuity across all tiers.',
        context:
          'Asynchronous events published to Kafka currently lose trace context, making it impossible to correlate background inventory updates with the customer checkout transaction.',
        architecture:
          'OrderService (Micrometer Tracing, KafkaTemplate) --[Kafka Topic: orders.v1]--> InventoryConsumer (Tracing Kafka Listener)',
        problem:
          'Configure KafkaTemplate with a ProducerPostProcessor that injects W3C traceparent into Kafka record headers. Configure the KafkaListener container to extract the traceparent and restore the active TraceContext before invoking the listener method.',
        starter: `@Configuration
class KafkaTracingConfig {
  @Bean
  fun kafkaTemplate(producerFactory: ProducerFactory<String, Any>, tracer: Tracer): KafkaTemplate<String, Any> {
    val template = KafkaTemplate(producerFactory)
    // TODO: Configure trace header propagation
    return template
  }
}

@Service
class InventoryEventListener {
  @KafkaListener(topics = ["orders.v1"])
  fun onOrderCreated(record: ConsumerRecord<String, OrderCreatedEvent>) {
    // TODO: Verify current span matches producer traceId
  }
}`,
        lang: 'kotlin',
        requirements: [
          'Producer writes W3C traceparent header to every published Kafka record.',
          'Consumer extracts traceparent and creates child span with matching traceId.',
          'MDC logger in consumer outputs matching traceId in log output.',
          'If no traceparent header exists, consumer initiates a new root trace cleanly.',
        ],
        constraints: [
          'No third-party proprietary APM agents; use open-source Micrometer Tracing.',
        ],
        expectedBehaviour:
          'A trace initiated on OrderService with traceId `9a8b7c` continues inside InventoryConsumer with the identical traceId `9a8b7c` and a new child spanId.',
        testCases: [
          ['Publish order event with active trace', 'Kafka consumer receives record with matching traceId in headers'],
          ['Publish event with span baggage: "tier=gold"', 'Consumer reads baggage key "tier" with value "gold"'],
          ['Publish message without headers', 'Consumer creates new valid traceId and processes normally'],
        ],
        hiddenFailures: [
          'Headers serialized in wrong character encoding (must be UTF-8 string bytes).',
          'Listener failing to close child span leaks memory in tracer active span stack.',
        ],
        output:
          'End-to-end trace waterfall showing OrderService HTTP span, Kafka producer span, and Kafka consumer span.',
        hints: [
          'Use micrometer-tracing-bridge-otel and opentelemetry-extension-trace-propagators.',
          'Spring Kafka automatically supports observation if micrometer-tracing is on the classpath.',
        ],
        verification:
          'Run embedded Kafka integration test; publish message within active span; assert consumer span parentId equals producer spanId.',
        explanation:
          'Bridging distributed trace context across message brokers turns disparate event logs into continuous, coherent distributed transaction graphs.',
        extension:
          'Add custom span events recording business milestones (e.g. "inventory.reserved").',
      },
    ],
    debug: [
      debugEx(
        'M6.2-D1',
        'Distributed traces terminate abruptly at asynchronous @Async service methods.',
        'Zipkin waterfall stops at OrderService.checkout(); background fraud check and email notifications appear as orphaned root traces.',
        [
          'OrderService uses @Async on FraudCheckService.evaluate()',
          'Spring default SimpleAsyncTaskExecutor or ThreadPoolTaskExecutor does not propagate ThreadLocal context',
          'Active span on the caller thread was not captured before task handoff',
          'Background thread generates a brand new traceId with parentId=null',
        ],
        'Diagnose the async trace loss and wrap the task executor in a ContextPropagatingTaskDecorator.',
        'Thread pool handoffs lose ThreadLocal state by default. Configure ThreadPoolTaskExecutor with a ContextPropagatingTaskDecorator or enable Micrometer Tracing ContextSnapshot to capture and restore trace state across thread boundaries.',
        ['grep "@Async" services/order-service/src', 'curl -s http://localhost:9411/api/v2/trace/<traceId>']
      ),
    ],
    failures: [
      {
        id: 'M6.2-F1',
        title: 'Broken trace header propagation in OpenFeign client fractures transaction waterfall',
        minutes: 60,
        mode: 'REAL_EXECUTABLE',
        bug: 'A custom Feign RequestInterceptor cleared and rebuilt all outbound headers, omitting the W3C `traceparent` and `b3` headers. Downstream InventoryService received bare HTTP calls and started new root traces, splitting every user transaction into disconnected pieces.',
        reproduce: [
          'curl -H "traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01" http://localhost:8080/api/v1/orders',
          'curl -s http://localhost:9411/api/v2/traces?serviceName=inventory-service',
        ],
        observe: [
          'Zipkin UI shows 10,000 independent single-span traces instead of unified multi-service waterfalls.',
          'OrderService trace duration does not reflect the time spent inside InventoryService.',
          'Tracing dashboard cannot calculate inter-service network latency.',
        ],
        hypotheses: [
          'Zipkin database index corruption.',
          'OpenFeign client is stripping or failing to propagate W3C traceparent headers.',
          'Network firewall dropping HTTP headers.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: Zipkin logs show normal span ingestion without errors.',
          '#2 rejected: direct curl headers pass through proxy unhindered.',
        ],
        investigate: [
          ['tcpdump -A -i any port 8082 | grep -i "traceparent"', 'Outbound HTTP request to inventory-service has no traceparent header', 'Header omission confirmed on wire.'],
          ['grep -A 10 "apply(RequestTemplate" services/order-service', 'Custom interceptor does template.headers(null) to sanitize headers', 'Custom interceptor accidentally stripped tracing headers.'],
        ],
        debugOptions: [
          'Custom Feign interceptor stripped W3C traceparent propagation headers.',
          'Micrometer Tracing library was disabled.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Refactor Feign interceptor to retain traceparent and baggage headers, or rely on Spring Cloud OpenFeign auto-configured tracing interceptor.',
          'Hardcode a static traceId in all Feign requests.',
        ],
        correctFix: 0,
        fixRejection: [
          'Hardcoding a static traceId causes all global user requests to collide under one single trace.',
        ],
        verify: [
          ['curl -H "traceparent: 00-4bf9...-01" http://localhost:8080/api/v1/orders', 'Zipkin displays continuous 3-span tree (Gateway -> Order -> Inventory) with single traceId', 'Distributed trace context restored.'],
        ],
        explainPrompt:
          'Explain how W3C traceparent propagation works and what occurs when an intermediate HTTP proxy strips the header.',
        modelExplanation:
          'When a service receives a request with a valid W3C traceparent header, it uses that traceId and sets the incoming spanId as its parentId. When calling a downstream service, the HTTP client must inject a mutated traceparent containing the same traceId and its own new spanId. If an intermediary strips this header, the downstream service has no link to the caller and is forced to initiate an independent root trace, fracturing the distributed trace graph.',
        patterns: ['Context Propagation', 'W3C TraceContext', 'Trace Fracturing', 'Feign Interceptors'],
        dimension: 'distributed-systems',
      },
    ],
    design: {
      id: 'M6.2-AC1',
      title: 'Design tail-based trace sampling architecture for 100,000 req/sec platform',
      scenario:
        'A high-volume streaming service handles 100,000 req/sec (8.6 billion spans/day). Storing 100% of traces would require 40 terabytes of storage per day and millions in cloud fees. Requirements: retain 100% of HTTP 5xx errors, 100% of requests exceeding p95 latency (> 500ms), but only 0.1% of healthy 200 OK traces.',
      requirements: [
        'Design OpenTelemetry Collector deployment topology with tail-based sampling processors.',
        'Configure routing rules based on span attributes (http.status_code >= 500 or duration > 500ms).',
        'Specify memory buffer sizing and cluster scaling to hold traces while decisions are evaluated.',
        'Ensure trace baggage (customer_tier=VIP) forces 100% sampling regardless of outcome.',
      ],
      constraints: [
        'Memory usage on OpenTelemetry Collector nodes must not exceed 8GB.',
        'Decision wait duration must accommodate slow traces up to 10 seconds.',
      ],
      deliverables: [
        'OpenTelemetry Collector pipeline configuration YAML with tail_sampling processor.',
        'Load balancer configuration ensuring all spans of a trace route to the same collector instance.',
        'Cost reduction calculation comparing head vs tail sampling.',
      ],
      failureModes: [
        'Spans of the same trace arrive at different collector pods, causing partial traces to be evaluated and dropped.',
        'Collector OOM crash when a traffic spike fills memory buffers during slow trace evaluation.',
      ],
      tradeoffQuestions: [
        {
          question: 'Why does tail-based sampling require trace-ID-aware routing load balancers?',
          modelAnswer:
            'In tail-based sampling, the decision to retain or drop a trace is made after the trace completes. If spans from the same trace are distributed randomly across 5 collector pods, no single pod has the complete picture to evaluate whether an error occurred. A trace-aware load balancer (like OTel Load-Balancing Exporter) hashes the trace ID to ensure all spans for that trace arrive at the exact same collector instance.',
        },
        {
          question: 'What is the trade-off of Tail-based sampling compared to Head-based sampling?',
          modelAnswer:
            'Tail-based sampling guarantees that 100% of errors and slow requests are captured, providing near-perfect diagnostic utility at 1/10th the storage cost. However, it requires running complex stateful collector clusters with large in-memory buffers and routing proxies, whereas head-based sampling is stateless and executes entirely within the application runtime.',
        },
      ],
    },
    defense: [
      [
        'Why not sample 100% of all production traces if storage is cheap?',
        'Storage is never truly cheap at enterprise scale: 100,000 req/sec generates billions of spans daily, costing tens of thousands of dollars in cloud database and network egress fees. Furthermore, querying billions of healthy traces degrades search performance for on-call engineers during an outage. Intelligent tail-based sampling captures 100% of high-value diagnostic data (errors and outliers) while discarding repetitive noise.',
        'architecture',
        ['Calculates scale cost.', 'Highlights query degradation for on-call teams.', 'Advocates intelligent sampling.'],
      ],
      [
        'How do you handle trace context propagation when integrating with legacy third-party systems that reject custom HTTP headers?',
        'If an external system strips or rejects custom headers, we treat the boundary as an asynchronous edge: we log a structured event containing the external reference ID (e.g. bank transaction reference) before the call, and correlate it upon response receipt using span attributes or custom database mapping tables.',
        'system-design',
        ['Recognizes external constraints.', 'Proposes reference-based correlation.', 'Avoids breaking legacy callers.'],
      ],
    ],
    english: [
      [
        ['traceparent', 'The standard HTTP header defined by W3C to propagate distributed trace context.', 'The gateway injected the traceparent header before calling the order service.'],
        ['span waterfall', 'A visual Gantt chart representation of nested spans across a transaction timeline.', 'The span waterfall revealed that database lock acquisition took eighty percent of the request time.'],
        ['tail-based sampling', 'Evaluating whether to retain a trace after all its spans have finished executing.', 'Tail-based sampling guarantees that all HTTP 500 errors are permanently stored.'],
        ['span baggage', 'Contextual key-value pairs propagated across all downstream spans in a trace.', 'We store the customer subscription tier in span baggage to prioritize processing.'],
        ['trace fracturing', 'The condition where a single distributed transaction is split into disconnected traces.', 'A missing Feign interceptor caused trace fracturing between our services.'],
      ],
      [
        'The W3C traceparent header ensures vendor-neutral distributed trace propagation.',
        'Asynchronous thread pools require explicit context decoration to prevent trace loss.',
        'Distributed tracing transforms isolated logs into a coherent end-to-end request narrative.',
      ],
      'Our distributed tracing architecture adheres strictly to the W3C Trace Context standard. Micrometer Tracing intercepts all synchronous HTTP and asynchronous Kafka boundaries, creating child spans with microsecond-precision timestamps. Context is propagated across asynchronous thread pools using task decorators. By collecting spans in OpenTelemetry and visualizing waterfalls in Tempo, our engineering teams can pinpoint latency bottlenecks across twenty microservices in seconds.',
      [
        ['Downstream service spans appear detached in Zipkin', 'The HTTP client was not instrumented to forward trace headers. We registered the standard Micrometer client interceptor.'],
        ['Trace collector ran out of memory during traffic surge', 'Memory buffers were undersized for the tail-based sampling window. We tuned the decision wait time and scaled collector replicas.'],
      ],
      [
        'Ensure this Kafka consumer extracts the traceparent from record headers before logging.',
        'Attach the database query duration as a span attribute for query latency tracking.',
        'Wrap this ExecutorService in a ContextPropagatingTaskDecorator to preserve the active span.',
      ],
      [
        'How does distributed tracing help identify latency bottlenecks in asynchronous architectures?',
        'What is the difference between head-based sampling and tail-based sampling?',
        'How do you propagate trace context across non-HTTP messaging protocols?',
      ],
      [
        'Why does standard Java thread pool execution break distributed tracing context?',
        'How do you troubleshoot a broken trace context in a multi-tier microservice chain?',
        'What are the storage and performance trade-offs of distributed trace retention?',
      ],
      'Distributed tracing is the cornerstone of microservice observability. By stamping every user interaction with a globally unique W3C trace identifier and propagating parent-child span relationships across network and process seams, tracing reconstructs the full distributed call tree. Coupled with structured logging and span attributes, it allows engineers to transition seamlessly from a high-level system failure down to the exact offending line of code.',
    ],
    ai: [
      'Ask an AI to propagate trace context to a separate background thread in Spring Boot.',
      'The AI suggests manually setting `MDC.put("traceId", "custom-123")` inside the new thread runnable, hardcoding the ID or passing it as a method parameter.',
      [
        'Manually setting a string in MDC does not update the underlying Tracer context or OpenTelemetry span context.',
        'Any downstream Feign calls, database queries, or Kafka emissions made from that thread will not carry the span context.',
        'Passing trace IDs as explicit method parameters pollutes clean domain models with infrastructure concerns.',
        'The correct solution is wrapping the ExecutorService using `ContextExecutorService.wrap()` or Spring `TaskDecorator`.',
      ],
      [
        'Ask the AI how its manual solution updates the Tracer span hierarchy.',
        'Ask how downstream HTTP clients know what spanId to use as their parent.',
        'Ask why framework-level task decorators are preferred over polluting business methods.',
      ],
      'Correct outcome: Do not pass trace IDs manually in method signatures. Use Spring `TaskDecorator` with Micrometer `ContextSnapshot` to automatically propagate TraceContext and MDC across asynchronous thread boundaries.',
    ],
    quiz: [
      ['conceptual', 'What is the structure of the W3C traceparent header?', ['version-traceId-parentId-traceFlags', 'userId:orderId:timestamp', 'http://tracer.internal/id', 'base64(sessionId)'], 0, 'W3C traceparent is 4 hyphen-separated fields.'],
      ['scenario', 'A request goes from Service A to Service B via Kafka. How is the trace context passed?', ['In the Kafka message key', 'In the Kafka record headers as byte arrays', 'By querying a shared Redis instance', 'Via email notification'], 1, 'Trace context is propagated in Kafka message headers.'],
      ['debugging', 'Zipkin shows a gap of 400ms between Service A sending a request and Service B receiving it. Most likely cause?', ['Zipkin is running slow', 'Network transit latency, intermediate gateway queuing, or clock skew between servers', 'Linux kernel memory corruption', 'The database dropped an index'], 1, 'Network transit, gateway queuing, or clock skew cause span gaps.'],
      ['design', 'What is the main advantage of Tail-based sampling over Head-based sampling?', ['Tail-based sampling uses no memory', 'Tail-based sampling can inspect the entire trace outcome, capturing 100% of errors and latency outliers', 'Tail-based sampling works without OpenTelemetry', 'Tail-based sampling is only for Python'], 1, 'Tail sampling makes decisions after knowing if the trace failed or was slow.'],
      ['code-tracing', 'What happens if a child span is started with Tracer.nextSpan() but never closed with span.end()?', ['The computer reboots', 'The span is never recorded, and memory leaks in the tracer active scope stack', 'Java throws a compilation error', 'The HTTP connection terminates'], 1, 'Unclosed spans leak memory and fail to emit telemetry.'],
    ],
  }),

  expandModule({
    id: 'M6.3',
    phase: 'M6',
    order: 3,
    title: 'Production Metrics & Golden Signals Monitoring',
    subtitle:
      'Latency, traffic, errors, saturation (Four Golden Signals), Micrometer meter types (Counter, Gauge, Timer, DistributionSummary), percentiles, and PromQL',
    minutes: 200,
    prerequisites: ['M6.1', 'M5.1'],
    objective:
      'Instrument and monitor microservice health using the Four Golden Signals: implement Micrometer Counters, Gauges, and Timers with percentiles (p50, p95, p99), expose Prometheus metrics via Actuator, and construct operational PromQL queries.',
    stack: ['Micrometer', 'Spring Boot Actuator', 'Prometheus', 'Grafana', 'HikariCP Metrics'],
    mode: 'REAL_EXECUTABLE',
    why:
      'Logs explain what happened to individual requests; metrics explain how the system as a whole is behaving over time. Without Golden Signal metrics (Latency, Traffic, Errors, Saturation), teams have zero warning before cascading service degradation causes customer-visible downtime.',
    explanation: [
      'Metrics are numerically aggregated telemetry data points measured over time intervals; the Four Golden Signals (Google SRE) represent the essential health indicators: Latency, Traffic, Errors, and Saturation.',
      'Logs are too voluminous and expensive to query continuously for real-time alerting. Metrics are compact (time, value, labels), enabling sub-second alerting, capacity trend forecasting, and high-frequency dashboard visualization.',
      'Enables proactive anomaly detection (e.g. p99 latency climbing before errors occur), resource saturation warnings (connection pools at 90%), automated horizontal pod autoscaling (HPA), and immediate alerting when error rates spike.',
      'Micrometer acts as a facade (like SLF4J for metrics); applications record to MeterRegistry; Prometheus scrapes `/actuator/prometheus` periodically; Prometheus server evaluates PromQL rules and stores time-series data.',
      'Order request arrives -> Timer.Sample starts -> request finishes -> sample.stop(timer) records duration -> Prometheus scrapes -> computes histogram percentiles (histogram_quantile(0.99, rate(...))) -> alert triggers if p99 > threshold.',
      'Metrics provide instant high-altitude system health visibility at very low CPU/network cost; the trade-off is loss of individual transaction detail (you see a 5% error rate, but need logs/traces to see which user failed).',
      'High-cardinality label explosion (putting userId or orderId into Prometheus tags crashes the Prometheus TSDB); Gauge measuring instantaneous spikes instead of sustained saturation; measuring average latency instead of p95/p99 (masking severe outlier suffering).',
      'Prometheus scraping success (`up`), scrape duration (`scrape_duration_seconds`), JVM memory and GC pause meters, and HikariCP connection pool acquisition timers.',
      'Inspect raw metrics at `/actuator/prometheus`, verify label names and cardinality, run PromQL rate and histogram queries in Prometheus UI, and check Grafana dashboard refresh rates.',
      'Always publish latency percentiles (p95, p99) via SLA buckets or client-side percentiles; restrict tags to low-cardinality enums (status, method, route); monitor saturation (thread pool, DB pool, memory) alongside errors.',
      'Do not put dynamic IDs (UUID, email, IP address) into Micrometer metric tags; do not use averages for latency (averages hide the 99th percentile catastrophic tail latency).',
      'Your dashboard shows average checkout latency is a healthy 45ms, but customer complaints about frozen checkout screens are flooding support. Why did average latency hide the problem, and what percentile metric would have alerted you?',
    ],
    keys: [
      'The Four Golden Signals of monitoring: Latency, Traffic, Errors, and Saturation.',
      'Never use average latency for SLAs: averages hide severe tail latency experienced by the 99th percentile.',
      'Meter types: Counter (monotonically increasing count), Gauge (instantaneous value), Timer (duration + count).',
      'High cardinality kills metric servers: never put user IDs, order IDs, or timestamps into metric tags.',
      'Monitor Saturation proactively (DB pool busy connections, thread queue depth) to catch bottlenecks before errors manifest.',
      'PromQL `rate()` function calculates per-second average rate of increase over a specified time window.',
    ],
    concepts: [
      [
        'Explain why average latency is fundamentally misleading in distributed web systems.',
        'If 95 requests take 10ms and 5 requests hang for 10,000ms, the average is 509ms (which looks like a minor blip). But 5% of users experienced a catastrophic 10-second freeze. Percentiles (p95, p99) reveal the exact experience of the slowest users.',
        'observability',
      ],
      [
        'Contrast Micrometer Counter vs Gauge and explain when each must be used.',
        'A Counter only increases (or resets to 0 on restart) and is used to measure event occurrences (e.g. orders_placed_total, errors_total). A Gauge measures an instantaneous value that can go up and down (e.g. active_threads, cpu_usage, pool_connections).',
        'implementation',
      ],
      [
        'What happens to Prometheus when an engineer adds `tag("user_id", userId)` to a metric?',
        'If the platform has 1,000,000 users, Prometheus creates 1,000,000 separate time-series streams in memory. The Prometheus TSDB RAM explodes, query performance degrades to zero, and the monitoring server crashes from an OutOfMemoryError.',
        'performance',
      ],
      [
        'Define Saturation in the Four Golden Signals and give three concrete examples.',
        'Saturation measures how full a service or resource is: 1) HikariCP active connections / maximum pool size; 2) Tomcat worker thread pool utilization; 3) Kafka consumer lag (unconsumed messages). Saturation predicts imminent latency explosion.',
        'reliability',
      ],
      [
        'Explain the PromQL expression: `histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))`',
        'It calculates the 99th percentile (p99) latency over the last 5 minutes by aggregating request rate across predefined bucket bounds (`le`), revealing the response time below which 99% of requests completed.',
        'system-design',
      ],
    ],
    labs: [
      {
        id: 'M6.3-L1',
        title: 'Instrument custom business metrics and Golden Signals with Micrometer',
        minutes: 110,
        mode: 'REAL_EXECUTABLE',
        objective:
          'Instrument OrderService with custom Micrometer meters: measure order creation count by tier, record payment latency percentiles, and expose connection pool saturation via Spring Boot Actuator.',
        context:
          'Management has no visibility into how long payment processing takes at the 99th percentile, nor what percentage of orders fail by payment method.',
        architecture:
          'OrderService (Spring Boot) -> MeterRegistry (PrometheusMeterRegistry) -> /actuator/prometheus -> Prometheus Scraper',
        problem:
          'Create an OrderMetricsService: 1) Counter `orders.created.total` with tags `payment_method` and `status`; 2) Timer `payment.processing.duration` configured with publishPercentiles(0.5, 0.95, 0.99); 3) Gauge `inventory.reservation.queue.size` tracking pending reservations.',
        starter: `@Service
class OrderMetricsService(private val meterRegistry: MeterRegistry) {
  // TODO: Define Counter, Timer with percentiles, and Gauge
  fun recordOrderCreated(paymentMethod: String, status: String) {
  }

  fun <T> recordPaymentDuration(action: () -> T): T {
    return action()
  }
}`,
        lang: 'kotlin',
        requirements: [
          'Counter `orders.created.total` records counts with low-cardinality tags.',
          'Timer `payment.processing.duration` records execution time and publishes p50, p95, p99.',
          'Gauge tracks integer queue size dynamically without memory leaks.',
          'All metrics are formatted and accessible via GET `/actuator/prometheus`.',
        ],
        constraints: [
          'Tags must have fixed low-cardinality values (e.g. payment_method: "CARD", "PAYPAL").',
          'Zero dynamic IDs in metric tag keys or values.',
        ],
        expectedBehaviour:
          'Executing 100 simulated orders outputs Prometheus text format showing `orders_created_total`, histogram buckets, and gauge values accurately.',
        testCases: [
          ['Record 10 successful card orders', 'Counter orders_created_total{payment_method="CARD",status="SUCCESS"} equals 10'],
          ['Record payment duration of 250ms', 'Timer reflects 0.25 seconds count=1'],
          ['Queue size changes from 5 to 2', 'Gauge reflects current value 2.0'],
        ],
        hiddenFailures: [
          'Using Timer without percentiles or SLA buckets makes it impossible to query p99 in Prometheus.',
          'Creating new Counter instances on every request leaks memory; meters must be cached or registered once.',
        ],
        output:
          'Prometheus scrape output containing properly tagged Golden Signals metrics.',
        hints: [
          'Use Counter.builder("orders.created.total").tags(...).register(meterRegistry).',
          'Use Timer.builder("payment.processing.duration").publishPercentiles(0.5, 0.95, 0.99).register(meterRegistry).',
        ],
        verification:
          'Query actuator endpoint and verify Prometheus exposition format includes `# TYPE orders_created_total counter` and percentiles.',
        explanation:
          'Standardized Micrometer metrics provide the mathematical foundation for real-time alerting, autoscaling policies, and SLA verification.',
        extension:
          'Add an alert rule triggering when error rate exceeds 1% for 3 consecutive minutes.',
      },
    ],
    debug: [
      debugEx(
        'M6.3-D1',
        'Prometheus scraping crashes with OutOfMemoryError after a release that added user tracking tags.',
        'Prometheus server RAM usage climbed from 4GB to 64GB in 6 hours; scraping `/actuator/prometheus` times out.',
        [
          'Developer added `registry.counter("user.logins", "user_id", userId).increment()`',
          '500,000 active users logged in during the morning peak',
          'Application created 500,000 distinct Prometheus metric series for that single meter',
          'Scrape payload size grew from 150KB to 120MB per scrape',
        ],
        'Diagnose the metric cardinality explosion and refactor the tag to low-cardinality user tier.',
        'Prometheus creates a distinct time series for every unique combination of tag keys and values. Adding high-cardinality identifiers (userId, orderId, email) creates millions of series, exhausting monitoring memory. Replace userId with low-cardinality tags like `user_tier: FREE|VIP`.',
        ['curl -s http://localhost:8080/actuator/prometheus | grep "user_logins" | head -n 30', 'curl -s http://localhost:8080/actuator/prometheus | wc -c']
      ),
    ],
    failures: [
      {
        id: 'M6.3-F1',
        title: 'Hidden tail latency outage masked by misleading average latency dashboard',
        minutes: 60,
        mode: 'REAL_EXECUTABLE',
        bug: 'The checkout team monitored `rate(http_server_requests_seconds_sum) / rate(http_server_requests_seconds_count)` (average latency). An external payment gateway began timing out after 10s for 3% of users. The average latency only rose from 40ms to 340ms (below the 500ms alert threshold), while 3% of customers suffered complete checkout lockouts.',
        reproduce: [
          './scripts/simulate-tail-latency.sh --concurrency 50 --slow-percent 3 --delay 10s',
          'curl -s http://localhost:8080/actuator/prometheus | grep "http_server_requests_seconds"',
        ],
        observe: [
          'Average latency dashboard shows 340ms (alert did not fire).',
          'p99 latency is 10,050ms (catastrophic customer experience).',
          'Customer churn and support complaints spike, but engineering believes the system is green.',
        ],
        hypotheses: [
          'The metrics server stopped receiving data.',
          'Average latency smoothed out severe 99th percentile tail latency, hiding the outage from alerts.',
          'Customers are reporting fake complaints.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: Prometheus scrape status is healthy and up=1.',
          '#2 rejected: database shows abandoned carts climbing by 300%.',
        ],
        investigate: [
          ['curl -s http://localhost:8080/actuator/prometheus | grep "quantile=\"0.99\""', 'p99 quantile is 10.02 seconds', 'Tail latency explosion confirmed.'],
          ['grep -A 3 "expr: " alerts/checkout-latency.yml', 'Alert rule evaluates `rate(sum) / rate(count) > 0.5`', 'Alert is mathematically blind to outliers.'],
        ],
        debugOptions: [
          'Monitoring average latency hides severe tail latency spikes experienced by a minority of users.',
          'Prometheus scrape interval is too long.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Configure Micrometer Timer to publish percentiles or histogram buckets, and update Prometheus alert rule to trigger on `histogram_quantile(0.99, ...) > 1.0`.',
          'Increase the average latency alert threshold to 1000ms.',
        ],
        correctFix: 0,
        fixRejection: [
          'Increasing the average threshold makes the alert even more blind to tail latency.',
        ],
        verify: [
          ['./scripts/test-alert-rule.sh --p99 10s', 'Alert CheckoutP99LatencyBreach fires within 60 seconds', 'Percentile alert reliably flags tail degradation.'],
        ],
        explainPrompt:
          'Explain why percentiles are mathematically mandatory for service latency monitoring compared to arithmetic averages.',
        modelExplanation:
          'Arithmetic average divides total time by total requests. In high-throughput systems, the overwhelming volume of fast requests (e.g. 97% taking 10ms) mathematically drowns out slow outliers (e.g. 3% taking 10,000ms). But in distributed e-commerce, the users experiencing the 10-second wait are active paying customers at checkout. Percentiles rank every request in order; p99 reflects the worst experience among 99 out of 100 users, giving immediate visibility into customer pain.',
        patterns: ['Golden Signals', 'Tail Latency', 'Percentiles vs Averages', 'SLO Monitoring'],
        dimension: 'observability',
      },
    ],
    design: {
      id: 'M6.3-AC1',
      title: 'Design production monitoring & alerting topology for 10M-user e-commerce',
      scenario:
        'Design a comprehensive monitoring and alerting infrastructure for an international e-commerce platform. Requirements: monitor Golden Signals across all services, detect database connection pool exhaustion before requests fail, and establish automated multi-tier PagerDuty escalation policies.',
      requirements: [
        'Specify Golden Signal metrics and alert thresholds for Gateway, Order, and Payment services.',
        'Define Saturation early-warning metrics for HikariCP, JVM GC, and Kafka Consumer Lag.',
        'Design multi-window multi-burn-rate alert strategy to avoid alert fatigue.',
        'Establish automated runbook link integration inside every alert notification.',
      ],
      constraints: [
        'Alerts must page on-call engineers only for actionable user-facing degradation.',
        'Transient blips lasting < 30 seconds must not trigger emergency pages.',
      ],
      deliverables: [
        'Prometheus alert rule configuration file (alerts.yml) covering Latency, Errors, and Saturation.',
        'Grafana Golden Signals dashboard layout specification.',
        'PagerDuty on-call escalation policy matrix with severity definitions (P0, P1, P2).',
      ],
      failureModes: [
        'Alert fatigue: 50 alerts fire simultaneously for a single root cause, overwhelming the engineer.',
        'Missing alert on Kafka consumer lag allows order processing backlog to grow by 500,000 events silently.',
      ],
      tradeoffQuestions: [
        {
          question: 'How do you prevent alert storms when a core downstream dependency fails?',
          modelAnswer:
            'Use Prometheus alert inhibition rules (alertmanager `inhibit_rules`). If an alert fires declaring `ServiceDown{service="payment-service"}`, Alertmanager automatically silences downstream derivative alerts (e.g. `HighLatency{caller="order-service"}` or `CircuitBreakerOpen`). This delivers a single root-cause page to the on-call engineer instead of 40 cascaded pages.',
        },
        {
          question: 'Why should error alerts be based on error rate percentage rather than raw error count?',
          modelAnswer:
            'Raw error counts cause false alarms during peak traffic (10 errors in 100,000 requests is a 0.01% error rate — totally healthy) and miss outages during low traffic (10 errors in 10 requests at 3 AM is a 100% outage, but a count-based alert of > 50 would stay silent). Percentage rates adapt accurately to traffic fluctuations.',
        },
      ],
    },
    defense: [
      [
        'A team member wants to alert on CPU usage exceeding 80% on any pod. Critique this strategy.',
        'Alerting on CPU usage is a classic anti-pattern: CPU usage is an internal resource metric, not a customer symptom. A pod at 85% CPU can be serving requests flawlessly with sub-10ms latency. Paging an engineer at 3 AM for 85% CPU causes alert fatigue. We should alert on user-visible symptoms (Latency, Error Rate) and use CPU metrics to trigger automated horizontal pod autoscaling (HPA), reserving pages for when scaling fails.',
        'reliability',
        ['Distinguishes symptom from cause.', 'Warns against alert fatigue.', 'Delegates resource metrics to autoscaling.'],
      ],
      [
        'How do you establish alert thresholds for p99 latency without triggering false alarms during routine deployment restarts?',
        'Use duration windows and percentage thresholds: require p99 latency to exceed the threshold for a sustained window (e.g. `for: 5m`) rather than an instantaneous scrape. Furthermore, exclude pods during their startup readiness probe period, and correlate latency with traffic volume.',
        'observability',
        ['Uses sustained duration windows.', 'Considers readiness probe filtering.', 'Prevents transient false alarms.'],
      ],
    ],
    english: [
      [
        ['Golden Signals', 'The four key metrics of system health: latency, traffic, errors, and saturation.', 'The dashboard tracks the Four Golden Signals to provide an instant overview of cluster health.'],
        ['tail latency', 'The small percentage of response times that take significantly longer than the rest.', 'Our optimization efforts cut tail latency by fifty percent at the ninety-ninth percentile.'],
        ['PromQL', 'The query language used to extract and aggregate time-series data in Prometheus.', 'We wrote a PromQL query to compute the five-minute rolling error rate.']
      ],
      [
        'Always evaluate latency percentiles rather than misleading arithmetic averages.',
        'Saturation metrics provide early warning before errors begin affecting users.',
        'High-cardinality tags must never be introduced into time-series metric streams.'
      ],
      'Our metrics architecture instruments the Four Golden Signals using Micrometer and Prometheus. We record request counts, error rates, and histogram percentiles across all public endpoints, giving immediate visibility into both median performance and tail latency outliers. Saturation metrics across database connection pools, JVM garbage collection pauses, and Kafka consumer groups allow us to catch bottlenecks before they degrade customer checkout experiences.',
      [
        ['Prometheus server crashed due to out of memory', 'A recent commit added user IDs as metric tags. We removed the high-cardinality tags and restored the low-cardinality user tier.'],
        ['On-call engineers overwhelmed by simultaneous alerts during outage', 'Alertmanager was missing inhibition rules. We configured alert suppression so downstream symptoms do not fire when a root service is down.']
      ],
      [
        'Please replace this average calculation with histogram_quantile(0.99, ...).',
        'Remove this dynamic transaction ID from the Micrometer meter tag.',
        'Add an alert on database connection pool saturation when busy connections exceed eighty percent.'
      ],
      [
        'Why are percentiles essential when evaluating microservice latency?',
        'How does high cardinality impact time-series metric storage engines?',
        'What is the difference between symptom-based alerting and cause-based alerting?'
      ],
      [
        'What metrics constitute the Four Golden Signals of monitoring?',
        'How do you design alert rules that prevent alert fatigue for on-call engineers?',
        'How do you measure Kafka consumer lag and when does it indicate an incident?'
      ],
      'Metrics provide the real-time heartbeat of production microservices. By tracking the Four Golden Signals—Latency, Traffic, Errors, and Saturation—engineering teams maintain a continuous, quantified assessment of system health. Shifting focus from misleading averages to p99 percentiles exposes hidden tail latency, while proactive saturation monitoring catches resource exhaustion before customer transactions fail.',
    ],
    ai: [
      'Ask an AI to write a Prometheus alert rule for a slow microservice.',
      'The AI suggests `alert: HighLatency, expr: http_server_requests_seconds_sum > 100, for: 0m, labels: { severity: "critical" }`.',
      [
        '`http_server_requests_seconds_sum` is a monotonically increasing counter representing the cumulative sum of all request durations since the pod started.',
        'Comparing this counter directly to a static number (100) means the alert will fire permanently a few seconds after the service boots and never resolve.',
        'The expression fails to calculate rate or percentiles.',
        '`for: 0m` triggers an immediate page on any transient 1-millisecond spike.',
      ],
      [
        'Ask the AI how `http_server_requests_seconds_sum` behaves over time after 100,000 requests.',
        'Ask why `rate()` and `histogram_quantile()` are mandatory when evaluating Prometheus timers.',
        'Ask why a duration window (`for: 5m`) is essential to prevent false alarms.',
      ],
      'Correct outcome: Reject comparing cumulative counters to static constants. Use `histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le)) > 1.0` with `for: 3m`.',
    ],
    quiz: [
      ['conceptual', 'What are the Four Golden Signals defined in Google SRE handbook?', ['CPU, Disk, Memory, Network', 'Latency, Traffic, Errors, Saturation', 'Sprint, Standup, Review, Retrospective', 'Build, Test, Package, Deploy'], 1, 'Latency, Traffic, Errors, and Saturation.'],
      ['scenario', 'A dashboard shows average latency is 50ms, but p99 latency is 8,000ms. What does this mean?', ['Everything is fast for everyone', '99% of requests take under 8s, but up to 1% of users suffer a catastrophic 8-second delay, which was hidden by the average', 'The server has no memory', 'Prometheus has a bug'], 1, 'Tail latency affects a minority severely but is masked by averages.'],
      ['debugging', 'What causes a High Cardinality explosion in Prometheus?', ['Scraping metrics too frequently', 'Adding unique values like user IDs or order IDs into metric tag/label dimensions', 'Running more than 2 microservices', 'Using Java 21'], 1, 'Unique IDs explode the number of active time-series streams.'],
      ['design', 'Which meter type should be used to track the number of currently active database connections in a pool?', ['Counter', 'Gauge', 'Timer', 'DistributionSummary'], 1, 'Gauges track values that fluctuate up and down.'],
      ['code-tracing', 'What does the PromQL expression `rate(orders_total[5m])` calculate?', ['The total number of orders placed in 5 months', 'The per-second average rate of order creation over the last 5 minutes', 'The price of all orders combined', 'The latency of order requests'], 1, 'rate() computes per-second rate of increase over a time window.'],
    ],
  }),

  expandModule({
    id: 'M6.4',
    phase: 'M6',
    order: 4,
    title: 'Service Level Objectives (SLI / SLO) & Error Budget Burn',
    subtitle:
      'SLI vs SLO vs SLA, availability math (the nines), latency objectives, error budget calculation, burn rate alerting, and release gate integration',
    minutes: 190,
    prerequisites: ['M6.3'],
    objective:
      'Formulate and enforce measurable Service Level Objectives: calculate availability and latency SLIs, quantify error budget depletion, configure multi-window burn rate alerts, and integrate error budget health into automated CI/CD deployment gates.',
    stack: ['Prometheus', 'Grafana', 'Sloth', 'Alertmanager', 'SLO Math'],
    mode: 'REAL_EXECUTABLE',
    why:
      'Engineers argue emotionally about reliability without clear quantitative contracts. SLIs and SLOs provide the shared, mathematical contract between product and engineering: they define how reliable a service needs to be, when to ship new features, and when to halt deployments to stabilize the platform.',
    explanation: [
      'An SLI (Service Level Indicator) is a quantifiable metric of service performance; an SLO (Service Level Objective) is the target reliability goal agreed upon by the business (e.g. 99.9% of requests successful over 30 days); an SLA (Service Level Agreement) is the legal contract with financial penalties for failing the SLO.',
      'Teams either over-engineer for impossible 100% uptime (bankrupting the company) or deploy unstable features recklessly. The Error Budget (100% - SLO) represents the allowable unreliability that can be spent on innovation and deployment velocity.',
      'Removes emotional debate from release decisions: if the Error Budget is intact, teams deploy rapidly; if the Error Budget is depleted, all feature work halts and engineering focuses exclusively on stability and tech debt.',
      'SLI = (Good Events / Total Events) * 100. Error Budget = 100% - SLO. Burn Rate measures how fast the budget is consumed (Burn Rate 1 = budget empties in exactly the window period, e.g. 30 days; Burn Rate 14.4 = budget empties in 2 days).',
      'Prometheus continuously computes SLI compliance -> multi-window multi-burn-rate rules evaluate consumption -> if Burn Rate > 14.4 over 1h and 5m windows, Alertmanager triggers an emergency page -> deployment pipeline pauses.',
      'SLOs align incentives between product velocity and system reliability; the trade-off is organizational discipline required to actually halt product releases when an error budget is exhausted.',
      'Setting unachievable SLOs (99.999% on dependencies that only provide 99.5%); single-window burn rate alerting causing false alarms on short spikes; measuring internal synthetic probes instead of user-facing transactions; neglecting latency in availability SLOs.',
      'Current SLI percentage, remaining error budget percentage, 1-hour and 6-hour burn rates, and time-to-exhaustion forecasts.',
      'Inspect PromQL SLI recording rules, verify good vs total event filters, compare 30-day rolling compliance against monthly targets, and check deployment gate status.',
      'Formulate SLIs from the customer perspective (e.g. successful HTTP responses < 300ms); implement multi-window multi-burn-rate alerting (Google SRE recommendation); automate deployment freeze when budget is burned.',
      'Do not set internal SLOs higher than your cloud provider infrastructure SLA; do not tie developer compensation to arbitrary uptime numbers (encourages hiding incidents).',
      'Your checkout service has an availability SLO of 99.9% over a 30-day rolling window. During a Black Friday deployment, 5,000 out of 500,000 checkout requests fail in 30 minutes. Did you breach your monthly Error Budget? What is the burn rate?',
    ],
    keys: [
      'SLI is what you measure; SLO is what you target; SLA is what legal signs.',
      'Error Budget = 100% - SLO. 99.9% uptime allows 0.1% unreliability (43.2 minutes of downtime/month).',
      'Multi-window multi-burn-rate alerts page only when the error budget is burning fast enough to threaten the SLO.',
      'SLIs must measure user happiness: a request that returns 200 OK after 15 seconds is NOT a successful request.',
      'When the Error Budget is depleted, feature releases freeze and engineering focuses on reliability.',
      'You cannot have a 99.99% service running on top of a 99.9% cloud infrastructure without multi-region redundancy.',
    ],
    concepts: [
      [
        'Calculate downtime allowance for 99.9% ("three nines") vs 99.99% ("four nines") over a 30-day month.',
        'At 99.9%, allowed downtime is 0.001 * 30 * 24 * 60 = 43.2 minutes per month. At 99.99%, allowed downtime is 0.0001 * 30 * 24 * 60 = 4.32 minutes per month. Achieving four nines requires fully automated failover with zero human intervention.',
        'observability',
      ],
      [
        'Why does Google SRE recommend Multi-Window Multi-Burn-Rate alerting over simple threshold alerts?',
        'Simple alerts on "error rate > 1%" page on tiny 10-second traffic blips that burn almost no budget. Multi-window alerts verify both a short window (e.g. 5m) and a longer window (e.g. 1h) to confirm sustained burn, catching 100% of real threats with near-zero false alarms.',
        'reliability',
      ],
      [
        'Differentiate between an Availability SLI and a Latency SLI.',
        'Availability SLI measures correctness: (HTTP non-5xx requests / total requests). Latency SLI measures responsiveness: (Requests completed in < 300ms / total requests). A service can have 100% availability but 0% latency compliance if all requests take 10 seconds.',
        'system-design',
      ],
      [
        'What policy should an engineering organization enforce when an Error Budget is 100% consumed?',
        'An automated release gate freezes non-essential feature deployments. All developer capacity shifts to bug fixing, test automation, infrastructure hardening, and addressing the root causes identified in recent postmortems until the rolling budget recovers.',
        'production-engineering',
      ],
      [
        'Explain why internal microservices should not promise a higher SLO than their underlying dependencies.',
        'The composite availability of a synchronous chain is the mathematical product of its parts (e.g. 0.999 * 0.999 ≈ 0.998). If OrderService calls a 99.5% Payment gateway synchronously, OrderService cannot honestly promise 99.9% availability without caching or async decoupling.',
        'architecture',
      ],
    ],
    labs: [
      {
        id: 'M6.4-L1',
        title: 'Implement PromQL SLI recording rules and multi-burn-rate alert policies',
        minutes: 110,
        mode: 'REAL_EXECUTABLE',
        objective:
          'Formulate PromQL recording rules for a 99.9% availability and latency SLI, calculate error budget consumption, and configure a multi-window burn rate alert in Prometheus.',
        context:
          'The checkout team has no mathematical definition of uptime. Alertmanager pages on random spikes while severe 2-hour slow burns go unnoticed until customers complain.',
        architecture:
          'Prometheus -> Recording Rules (SLI calculation) -> Alertmanager (Multi-Window Burn Rate Alerts) -> On-Call Notification',
        problem:
          'Write prometheus-rules.yml: 1) Recording rule `job:checkout_sli_good:rate5m` measuring requests with status < 500 and latency < 400ms; 2) Recording rule `job:checkout_sli_total:rate5m`; 3) Alert `CheckoutErrorBudgetBurningFast` that fires when Burn Rate > 14.4 over both 1-hour and 5-minute windows (consuming 2% of budget in 1 hour).',
        starter: `# prometheus-rules.yml
groups:
  - name: checkout-slo
    rules:
      - record: job:checkout_sli_good:rate5m
        expr: # TODO: Rate of requests with status !~ "5.." and duration <= 0.4s
      - record: job:checkout_sli_total:rate5m
        expr: # TODO: Total request rate
      - alert: CheckoutErrorBudgetBurnRateFast
        expr: # TODO: Multi-window multi-burn-rate expression (burn rate > 14.4)
        for: 2m
        labels:
          severity: critical
`,
        lang: 'yaml',
        requirements: [
          'SLI strictly combines both error status and latency threshold (< 400ms).',
          'Burn rate alert triggers when error rate threatens to consume 2% of 30-day budget in 1 hour (burn rate 14.4).',
          'Alert verifies both 1-hour window and 5-minute window to eliminate transient noise.',
          'Rule passes `promtool check rules` syntax validation.',
        ],
        constraints: [
          'Target SLO is 99.9% over a 30-day rolling period.',
        ],
        expectedBehaviour:
          'Under normal traffic, burn rate is < 1.0 (no alert). When simulated error rate reaches 1.5%, burn rate reaches 15.0 and alert fires within 2 minutes.',
        testCases: [
          ['Normal traffic (0.02% errors)', 'Burn rate is ~0.2, zero alerts triggered'],
          ['Sustained 2% error rate for 5 minutes', 'Burn rate 20.0 triggers CheckoutErrorBudgetBurnRateFast alert'],
          ['Brief 10-second error blip', 'Short window spikes but 1-hour window suppresses alert (zero false page)'],
        ],
        hiddenFailures: [
          'Ignoring latency in the SLI counts 10-second hanging requests as "good" events.',
          'Using a single window causes false pages on brief restarts or misses slow burns.',
        ],
        output:
          'Validated Prometheus rule definitions demonstrating multi-burn-rate alerting.',
        hints: [
          'Burn rate = (1 - (good / total)) / (1 - 0.999). At 99.9%, (1 - 0.999) = 0.001.',
          'Burn rate 14.4 means an error rate of 14.4 * 0.001 = 0.0144 (1.44%).',
        ],
        verification:
          'Run promtool test rules against mock time-series data simulating 2% error rate; verify alert transitions to FIRING.',
        explanation:
          'Multi-window multi-burn-rate alerting is the industry benchmark for SRE reliability, translating high-level business SLOs into precise, noise-free operational alerts.',
        extension:
          'Add a slow-burn alert (Burn rate 6.0 over 6h and 30m windows, paging low-priority ticket).',
      },
    ],
    debug: [
      debugEx(
        'M6.4-D1',
        'Product team and engineering team dispute whether the 99.9% checkout SLO was violated after an incident.',
        'Engineers claim uptime was 99.95% based on server uptime; Product claims uptime was 94% because users experienced 10-second spinners.',
        [
          'Engineering measured pod process uptime (systemd/k8s running without crash)',
          'Product measured customer completed checkouts in browser',
          'A database lock caused checkout requests to take 12 seconds without throwing 500 errors',
          'Current SLI was defined solely as `rate(http_5xx) == 0` without latency threshold',
        ],
        'Reconcile the dispute by redefining the SLI to include latency response thresholds.',
        'A process that is running but taking 12 seconds to respond is broken from the user perspective. Server uptime is a vanity metric. The SLI must be updated to: percentage of requests returning 2xx/3xx in LESS THAN 500ms. Under this definition, both teams share a single truth.',
        ['promtool query instant http://localhost:9090 "job:checkout_sli_good:rate5m / job:checkout_sli_total:rate5m"']
      ),
    ],
    failures: [
      {
        id: 'M6.4-F1',
        title: 'Flawed single-window alert causes alert fatigue by firing on harmless 15-second blips',
        minutes: 60,
        mode: 'REAL_EXECUTABLE',
        bug: 'The operations team configured an alert: `sum(rate(errors[1m])) > 0`. Every routine pod deployment caused 2 or 3 retried connection drops lasting 5 seconds, triggering emergency high-priority phone calls to on-call engineers 14 times a week.',
        reproduce: [
          './scripts/simulate-pod-restart.sh',
          'cat /var/log/alerts.log | grep "EmergencyPage"',
        ],
        observe: [
          'Engineers receive 14 pages a week during routine deployments with zero customer impact.',
          'Engineers start ignoring alerts or muting their phones (alert fatigue).',
          'When a genuine P0 database outage occurs at 2 AM, the on-call engineer assumes it is another blip and sleeps through it.',
        ],
        hypotheses: [
          'The deployment script is broken.',
          'The alert rule evaluates an overly sensitive 1-minute window without burn rate or duration dampening.',
          'The monitoring server is sending duplicate emails.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: deployments succeed and all canary checks pass.',
          '#2 rejected: Alertmanager deduplication is operating correctly.',
        ],
        investigate: [
          ['grep -A 5 "alert: AnyErrors" alerts/rules.yml', 'Found expr: rate(errors[1m]) > 0 with for: 0m', 'Zero duration threshold on 1m rate.'],
          ['grep "budget_consumed" logs/slo_audit.log', 'The 15-second blip consumed 0.0001% of the monthly error budget', 'Zero threat to the SLO.'],
        ],
        debugOptions: [
          'Single-window zero-duration error alerts trigger on harmless transient blips, causing alert fatigue.',
          'The application should never produce any error under any circumstances.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Replace the raw error trigger with a multi-window burn rate alert that pages only if budget consumption threatens the monthly SLO over sustained windows.',
          'Delete the alert and rely on user bug reports.',
        ],
        correctFix: 0,
        fixRejection: [
          'Relying on user bug reports is an abdication of engineering responsibility that destroys user trust.',
        ],
        verify: [
          ['./scripts/simulate-pod-restart.sh', 'Zero emergency pages triggered during routine restart; alert fires only on sustained 2% error rate', 'Alert fatigue completely eliminated.'],
        ],
        explainPrompt:
          'Explain why alert fatigue is one of the most dangerous operational risks in software engineering.',
        modelExplanation:
          'Human attention is a finite resource. When engineers are repeatedly woken up or interrupted by non-actionable, transient alerts that require no remediation, the brain adapts by treating all alerts as noise. Over time, engineers delay responding, silence notifications, or acknowledge alerts without reading them. When a catastrophic, revenue-threatening outage inevitably occurs, the alert is ignored until executive escalation, causing catastrophic downtime.',
        patterns: ['Alert Fatigue', 'SRE Best Practices', 'Multi-Window Alerting', 'Error Budgeting'],
        dimension: 'reliability',
      },
    ],
    design: {
      id: 'M6.4-AC1',
      title: 'Design enterprise SLO framework and release freeze governance for tier-1 bank',
      scenario:
        'A financial institution runs 80 microservices with competing feature demands from 12 product managers. Deployments frequently destabilize payment settlement. Leadership mandates an objective SLO and Error Budget governance policy that automatically gates CI/CD deployments.',
      requirements: [
        'Formulate Availability and Latency SLOs for Tier-1 (Payments), Tier-2 (Accounts), and Tier-3 (Reports).',
        'Specify mathematical Error Budget calculation over a rolling 30-day window.',
        'Define CI/CD automated deployment gate logic: block pipeline if remaining error budget < 10%.',
        'Create exception protocol allowing emergency security patches to bypass feature release freezes.',
      ],
      constraints: [
        'Payment settlement SLO must target 99.99% availability.',
        'Release gate decisions must be fully automated based on Prometheus PromQL queries.',
      ],
      deliverables: [
        'Service Level Objective matrix document defining SLI, SLO, and SLA per service tier.',
        'GitLab/GitHub Actions deployment gate script querying Prometheus API for budget health.',
        'Executive Error Budget policy document defining engineering obligations during budget depletion.',
      ],
      failureModes: [
        'Release gate script times out or fails open, allowing buggy deployment during an active outage.',
        'Product managers attempt to redefine SLI metrics to artificially inflate budget numbers.',
      ],
      tradeoffQuestions: [
        {
          question: 'What is the consequence of setting an unrealistic 99.999% ("five nines") SLO on an e-commerce checkout service?',
          modelAnswer:
            'Five nines allows only 26 seconds of downtime per MONTH. At that level, routine zero-downtime rolling deployments, database schema migrations, and cloud network blips breach the budget constantly. Engineering would be permanently locked in feature freeze, developer velocity would grind to a halt, and infrastructure costs would multiply tenfold for redundant multi-region active-active clusters that provide little business value over 99.95%.',
        },
        {
          question: 'How do you handle a situation where a security vulnerability (CVE) must be patched but the service has 0% error budget remaining?',
          modelAnswer:
            'The governance policy must explicitly distinguish Feature Deployments from Emergency Security/Reliability Fixes. When the error budget is exhausted, feature releases are strictly frozen, but hotfixes that improve stability or patch critical CVEs are permitted with VP of Engineering approval and post-deployment canary observation.',
        },
      ],
    },
    defense: [
      [
        'A product director demands 100% uptime for all services. How do you respond?',
        '100% uptime is a mathematical and economic impossibility in distributed systems. Hardware fails, networks partition, cloud providers reboot hypervisors, and submarine cables get cut. Even Google and AWS do not offer 100% SLAs. Demanding 100% uptime means never deploying code, never upgrading libraries, and spending millions on redundant infrastructure for diminishing returns. Instead, we target an evidence-based SLO like 99.9% and use the 0.1% Error Budget to innovate rapidly.',
        'communication',
        ['Explains physical impossibility of 100%.', 'Frames error budget as innovation enabler.', 'Advocates realistic, cost-effective targets.'],
      ],
      [
        'Why should the CI/CD pipeline query Prometheus before allowing a production deployment?',
        'Automated release gates remove human bias from deployment decisions. If a service has already burned 95% of its monthly error budget due to recent instability, deploying risky new feature code threatens to breach customer SLAs. Checking budget health in CI/CD enforces the rule: stabilize first, ship new features second.',
        'production-engineering',
        ['Removes human bias.', 'Enforces stabilization priority.', 'Protects customer SLA compliance.'],
      ],
    ],
    english: [
      [
        ['Service Level Indicator', 'A quantified metric that measures service performance in real time.', 'Our primary latency SLI measures the percentage of requests completed within 400 milliseconds.'],
        ['Service Level Objective', 'The agreed target reliability level for a service over a rolling window.', 'The team committed to a ninety-nine point nine percent availability SLO.'],
        ['error budget', 'The allowable percentage of failures over a given period before the SLO is breached.', 'We have consumed seventy percent of our monthly error budget following yesterday incident.'],
        ['burn rate', 'The rate at which the error budget is consumed relative to normal time.', 'A burn rate of fourteen point four will exhaust our monthly budget in two days.'],
        ['release freeze', 'A temporary halt on feature deployments to prioritize system stability.', 'The automated gate initiated a release freeze because the error budget was depleted.'],
      ],
      [
        'The error budget represents the formal contract between product velocity and platform stability.',
        'Multi-window burn rate alerts eliminate false alarms without missing genuine threats.',
        'Never promise an SLO that exceeds the availability of your underlying cloud infrastructure.',
      ],
      'Our reliability engineering model is governed by formal Service Level Objectives. We define customer-centric SLIs measuring both request correctness and latency thresholds. Error budgets establish the objective threshold for feature deployment gates: when budgets are healthy, teams ship with high velocity; when budgets are depleted, automated CI/CD controls enforce release freezes to prioritize stability and debt remediation.',
      [
        ['Feature releases deployed during an active instability period', 'The CI/CD pipeline was missing the error budget check. We added an automated Prometheus query gate to block deploys when budget is under ten percent.'],
        ['Dispute between teams regarding uptime numbers', 'Teams were using different definitions of availability. We unified all parties under a single mathematically recorded PromQL SLI.']
      ],
      [
        'Incorporate the latency threshold into this SLI definition to reflect user responsiveness.',
        'Configure the burn rate alert to monitor both short-term and medium-term windows.',
        'Halt feature deployment on this service until the rolling thirty-day error budget recovers.'
      ],
      [
        'What is the difference between an SLI, an SLO, and an SLA?',
        'How does an error budget balance feature innovation against operational stability?',
        'How do you calculate the burn rate of an error budget?'
      ],
      [
        'What governance policies should be enforced when an error budget is completely exhausted?',
        'Why are multi-burn-rate alerts superior to traditional static threshold alerts?',
        'How do you handle critical security patches during a feature release freeze?'
      ],
      'Service Level Objectives establish a shared, objective language for reliability. By quantifying user happiness through precise indicators and managing failure tolerance through error budgets, organizations eliminate emotional disputes over release cadence. Multi-burn-rate alerting safeguards customer trust by paging only when threats are genuine, creating a resilient, high-velocity engineering culture.',
    ],
    ai: [
      'Ask an AI to calculate how much downtime is permitted for a 99.9% availability SLO in a 30-day month.',
      'The AI claims that 99.9% availability allows "approximately 7.2 hours of downtime per month."',
      [
        '99.9% means 0.1% unreliability (0.001).',
        'In a 30-day month, total minutes = 30 * 24 * 60 = 43,200 minutes.',
        'Allowed downtime is 43,200 * 0.001 = 43.2 minutes, NOT 7.2 hours.',
        '7.2 hours corresponds to ~99.0% uptime (two nines), a massive ten-fold mathematical error.',
        'Believing this calculation would cause teams to grossly violate customer contracts.',
      ],
      [
        'Ask the AI to show its arithmetic step by step (30 days * 24 hours * 60 minutes * 0.001).',
        'Ask what percentage of downtime 7.2 hours represents in a 720-hour month (7.2 / 720 = 1.0% = 99.0%).',
        'Ask why mathematical precision is essential when signing customer SLAs.',
      ],
      'Correct outcome: 99.9% availability permits exactly 43.2 minutes of downtime per 30-day month (or 8.76 hours per year). Always verify availability calculations using fundamental arithmetic.',
    ],
    quiz: [
      ['conceptual', 'What is the mathematical difference between an SLI, an SLO, and an SLA?', ['They are three names for the exact same document', 'SLI is what you measure; SLO is the internal target; SLA is the legal contract with financial penalties', 'SLI is for managers; SLO is for developers; SLA is for customers', 'SLI is measured in bytes; SLO is measured in seconds'], 1, 'Indicator (measurement) -> Objective (target) -> Agreement (legal contract).'],
      ['scenario', 'In a 30-day month (43,200 minutes), how much total downtime is permitted by a 99.9% availability SLO?', ['43.2 minutes', '7.2 hours', '24 seconds', '3 days'], 0, '43,200 minutes * 0.001 = 43.2 minutes.'],
      ['design', 'What is the primary purpose of an Error Budget in SRE philosophy?', ['To fine developers when code crashes', 'To balance reliability with deployment velocity by defining an acceptable budget of unreliability', 'To purchase faster servers', 'To pay for cloud storage'], 1, 'Error budgets represent the acceptable failure threshold for innovation.'],
      ['code-tracing', 'If an error budget is scheduled to last 30 days, what does a Burn Rate of 14.4 mean?', ['The budget is already empty', 'The budget is burning at 14.4x normal speed, meaning it will be completely consumed in approximately 2 days', 'The service is running 14.4 times faster', 'Only 14.4% of users are active'], 1, 'Burn rate 14.4 consumes the entire 30-day budget in ~2 days (30 / 14.4 ≈ 2.08 days).'],
      ['debugging', 'Why should an availability SLI include a latency threshold (e.g. status < 500 AND duration < 500ms)?', ['Because Prometheus cannot count 500 errors', 'Because a response that takes 30 seconds to return HTTP 200 is effectively broken from the user perspective', 'To make the dashboard look more colorful', 'To increase memory usage'], 1, 'Extremely slow responses degrade user experience just as severely as errors.'],
    ],
  }),

  expandModule({
    id: 'M6.5',
    phase: 'M6',
    order: 5,
    title: 'Multi-Signal Correlation & Root-Cause Triangulation',
    subtitle:
      'Triangulating Trace -> Service -> Log -> Metric -> Event, cross-signal jump navigation, flame graphs, and distinguishing root causes from symptoms',
    minutes: 200,
    prerequisites: ['M6.1', 'M6.2', 'M6.3', 'M6.4'],
    objective:
      'Master the full-spectrum investigative loop: jump seamlessly between Grafana metrics, Tempo traces, Loki/Elasticsearch logs, and Kafka events using unified correlation IDs to isolate true root causes from misleading downstream symptoms.',
    stack: ['Grafana', 'Prometheus', 'Tempo', 'Loki', 'Elasticsearch', 'Micrometer'],
    mode: 'REAL_EXECUTABLE',
    why:
      'Engineers fail during production incidents because they look at isolated signals in silos: checking logs without trace context, or staring at a CPU metric without knowing which query caused it. Mastering multi-signal correlation enables finding root causes in minutes instead of hours.',
    explanation: [
      'Multi-signal correlation is the unified synthesis of the three pillars of observability (Metrics, Logs, Traces) joined by common contextual anchors: Trace ID, Span ID, Service Name, and Timestamp.',
      'During an incident, looking at a single telemetry pillar produces misleading conclusions. A high-CPU metric tells you the server is burning, but not why; an error log tells you what crashed, but not what triggered it; a trace tells you where time was spent, but not the error message.',
      'Enables rapid root-cause triangulation: an alert fires on a Metric (p99 latency) -> engineer clicks directly to exemplar Trace -> trace isolates the slowest Span (PaymentService) -> clicks directly to Log filtered by that exact Trace ID -> log reveals the database deadlock exception.',
      'Grafana links Prometheus metric exemplars directly to Tempo traces; Tempo trace spans contain structured tags (`service.name`, `trace_id`); clicking a span queries Loki/Elasticsearch with `{service="payment-service"} |= "trace_id"` in the exact millisecond window.',
      'Alert fires: CheckoutLatencySpike -> Open Grafana -> Click exemplar trace dot on latency graph -> Tempo opens waterfall showing 8-second delay in inventory-service -> Click "Logs for this span" -> Loki displays exact log: "ConnectionTimeoutException: HikariPool-1" -> Root cause proven in < 45 seconds.',
      'Drastically slashes Mean Time to Resolution (MTTR) and eliminates speculation; requires disciplined tagging standards across all telemetry collectors and unified UI integration.',
      'Misaligned timestamps between services causing trace-to-log mismatch; un-indexed trace IDs in log search; jumping to conclusions on the first error found (confusing a symptom with the true root cause); alert storms obscuring root signals.',
      'Mean Time to Detect (MTTD), Mean Time to Acknowledge (MTTA), Mean Time to Resolve (MTTR), and trace-to-log navigation success rate.',
      'Verify Grafana data source links (Derived Fields in Loki mapping to Tempo; Exemplars in Prometheus mapping to Tempo); verify NTP synchronization across all cluster nodes.',
      'Configure W3C trace IDs in all log encoders; enable Prometheus OpenMetrics exemplars; configure Grafana data link derived fields; establish runbooks with explicit multi-signal triage checklists.',
      'Do not perform root-cause analysis by guessing or restarting random pods; do not stop investigating at the first symptom (ask the 5 Whys until the systemic trigger is identified).',
      'During a checkout outage, PaymentService logs are clean, but Gateway returns 504. Trace waterfall shows the request hung for 15 seconds inside OrderService, but OrderService CPU is 2%. How do you correlate metrics, traces, and logs to identify what OrderService was waiting for?',
    ],
    keys: [
      'The Observability Trinity: Metrics show WHERE to look; Traces show WHICH HOP is slow; Logs show WHY it failed.',
      'Exemplars bridge metrics to traces by attaching specific trace IDs directly to histogram metric samples.',
      'Root Cause ≠ Symptom ≠ Contributing Factor: downstream database lock is a symptom; connection leak is the root cause.',
      'Time synchronization (NTP) across all nodes is a strict prerequisite for cross-signal correlation.',
      'Follow the evidence trail: Alert -> Metric Spike -> Exemplar Trace -> Slow Span -> Correlated Logs -> Proven Cause.',
      'Never restart a degraded pod without first capturing thread dumps, heap dumps, or connection pool metrics.',
    ],
    concepts: [
      [
        'Explain the role of Metric Exemplars in Grafana and how they accelerate triage.',
        'An exemplar is a specific trace ID attached to an individual measurement point in a Prometheus latency metric. In Grafana, clicking the dot on a latency spike immediately opens the exact trace that caused that specific spike, bypassing manual search.',
        'observability',
      ],
      [
        'Distinguish between Root Cause, Symptom, and Contributing Factor using a real outage example.',
        'Symptom: Gateway returns 504 Gateway Timeout to checkout users. Contributing Factor: Heavy marketing flash sale doubled traffic. Root Cause: An unindexed SQL query in OrderService caused a table scan, holding database row locks for 5 seconds.',
        'debugging',
      ],
      [
        'How do Derived Fields in Grafana Loki link log lines to distributed traces in Tempo?',
        'Derived Fields use regex to extract a `trace_id` from structured log text and convert it into a clickable hyperlink that automatically queries Tempo for that trace ID, bridging log aggregation directly to distributed trace visualization.',
        'system-design',
      ],
      [
        'Why do clock drift and NTP synchronization failures destroy multi-signal correlation?',
        'If Service A clock is 200ms behind Service B, distributed trace spans will show negative durations or child spans finishing before parent spans started, and log correlation queries will search the wrong time windows, rendering evidence useless.',
        'distributed-systems',
      ],
      [
        'Explain the "5 Whys" methodology in incident postmortem root-cause analysis.',
        'Repeatedly asking "Why?" moves past superficial symptoms to systemic defects: Why did checkout fail? -> Threads exhausted. -> Why? -> Waiting on payment. -> Why? -> Connection pool empty. -> Why? -> Connection leak in error handler. -> Why? -> Missing try-with-resources. Fix: code refactor + static analysis check.',
        'architecture',
      ],
    ],
    labs: [
      {
        id: 'M6.5-L1',
        title: 'Triangulate production incident using correlated Metrics, Traces, and Logs',
        minutes: 110,
        mode: 'REAL_EXECUTABLE',
        objective:
          'Execute the complete investigative loop on a simulated degraded system: detect metric anomaly, navigate to exemplar trace, isolate the failing span, and extract root-cause exception from correlated logs.',
        context:
          'A background batch job triggered sudden latency spikes on checkout. Multiple alerts are firing simultaneously across Order, Inventory, and Database services.',
        architecture:
          'Prometheus Alert -> Grafana Metric Exemplar -> Tempo Distributed Trace -> Loki Correlated Logs -> Root Cause Confirmation',
        problem:
          'Given a simulated telemetry dataset: 1) Query metric `http_server_requests_seconds` to identify the route with p99 > 5s; 2) Extract the exemplar traceId from the metric; 3) Inspect the trace waterfall to identify the slowest span; 4) Query logs using that traceId to retrieve the exact stack trace and root cause.',
        starter: `@Component
class TelemetryTriangulator(
  private val metricsClient: MockMetricsClient,
  private val traceClient: MockTraceClient,
  private val logClient: MockLogClient
) {
  fun diagnoseIncident(): IncidentDiagnosis {
    // TODO: 1. Identify failing endpoint via metrics
    // TODO: 2. Fetch exemplar traceId
    // TODO: 3. Isolate slow span name
    // TODO: 4. Extract root cause log message
    return IncidentDiagnosis(endpoint = "", traceId = "", failingSpan = "", rootCause = "")
  }
}`,
        lang: 'kotlin',
        requirements: [
          'Correctly identifies the route exceeding p99 latency threshold.',
          'Extracts valid W3C traceId associated with the metric exemplar.',
          'Isolates the specific downstream microservice span responsible for the delay.',
          'Extracts the exact root cause exception message from the correlated log line.',
        ],
        constraints: [
          'Diagnosis must be derived strictly from telemetry evidence, not hardcoded strings.',
        ],
        expectedBehaviour:
          'Automated diagnostic runner inspects telemetry and reports: endpoint="/api/v1/checkout", failingSpan="inventory-service:reserveStock", rootCause="PSQLException: Lock acquisition timeout on sku_stock table".',
        testCases: [
          ['Execute automated triage on dataset A', 'Identifies database row lock timeout in inventory service'],
          ['Execute triage on dataset B (circuit breaker tripped)', 'Identifies CallNotPermittedException in payment client'],
          ['Correlate trace without logs', 'Flags missing log telemetry cleanly without crashing'],
        ],
        hiddenFailures: [
          'Stopping at the first error log found on the gateway instead of tracing down to the originating service.',
          'Assuming high CPU on a service indicates it is the root cause when it is merely spinning on retries.',
        ],
        output:
          'Complete incident diagnosis report linking metric anomaly, trace waterfall, and root-cause log.',
        hints: [
          'Follow the traceparent from Gateway to find the leaf span with the largest self-time duration.',
          'Filter logs by traceId AND level=ERROR to find the fatal exception.',
        ],
        verification:
          'Assert diagnostic output matches seeded telemetry ground truth with 100% precision.',
        explanation:
          'Correlating metrics, traces, and logs transforms scattered incident noise into a deterministic, reproducible path to root-cause resolution.',
        extension:
          'Generate a draft postmortem markdown document automatically from the diagnostic findings.',
      },
    ],
    debug: [
      debugEx(
        'M6.5-D1',
        'On-call engineer spends 3 hours investigating payment service during an outage when the actual fault was DNS resolution.',
        'Payment calls were failing with 504 Gateway Timeout; engineer assumed payment gateway was down, but external provider status was 100% green.',
        [
          'Engineer looked only at Gateway HTTP 504 logs',
          'Did not inspect DNS lookup duration metrics (`jvm.dns.lookup.duration`)',
          'Did not inspect trace waterfall to see where the 5 seconds was spent',
          'Kubernetes CoreDNS pod was crash-looping, delaying domain resolution by 5000ms',
        ],
        'Diagnose the cognitive bias and formulate a multi-signal triage procedure to catch infrastructure bottlenecks.',
        'Looking only at high-level HTTP status codes causes engineers to blame the target service. The trace waterfall clearly showed 5000ms spent in `DNS resolution` before any TCP SYN packet was transmitted. The fix is strictly inspecting trace span breakdown before hypothesizing application code defects.',
        ['promtool query instant http://localhost:9090 "coredns_dns_request_duration_seconds_bucket"', 'curl -s http://localhost:9411/api/v2/trace/<traceId>']
      ),
    ],
    failures: [
      {
        id: 'M6.5-F1',
        title: 'Misleading downstream error masks upstream thread pool leak as root cause',
        minutes: 65,
        mode: 'REAL_EXECUTABLE',
        bug: 'OrderService suffered a slow thread leak in an unclosed SSE connection handler. When worker threads exhausted, queued requests timed out before reaching InventoryService. Gateway logs showed "504 Gateway Timeout: InventoryService unreachable", leading engineers to troubleshoot the healthy inventory service for hours.',
        reproduce: [
          './scripts/simulate-thread-leak.sh --service order-service',
          'curl -w "%{http_code}\n" http://localhost:8080/api/v1/checkout',
        ],
        observe: [
          'Gateway logs blame downstream InventoryService: "Read timed out calling inventory-service".',
          'InventoryService metrics show 0% CPU, 0 errors, and zero queued requests.',
          'OrderService `tomcat.threads.busy` is at 100% (200/200 threads saturated).',
        ],
        hypotheses: [
          'InventoryService crashed silently.',
          'OrderService worker thread pool starvation prevented requests from ever being dispatched to inventory.',
          'Network switch failure between the two pods.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: health check direct to inventory-service responds in 3ms.',
          '#2 rejected: ping and traceroute between pods show 0% packet loss.',
        ],
        investigate: [
          ['curl -s http://localhost:8081/actuator/metrics/tomcat.threads.busy', 'Value is 200.0 (maximum pool capacity)', 'Thread starvation in OrderService verified.'],
          ['jstack $(pgrep -f order-service) | grep "SSEConnectionHandler"', '185 threads parked indefinitely waiting on client disconnect', 'Thread leak identified in OrderService.'],
        ],
        debugOptions: [
          'Upstream thread starvation in OrderService prevented calls from being made, producing misleading downstream timeout errors.',
          'Inventory service connection pool was exhausted.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Fix SSE handler to register timeout listener and close expired emitters; tune Tomcat max-threads and add thread pool saturation alerting.',
          'Restart inventory-service repeatedly.',
        ],
        correctFix: 0,
        fixRejection: [
          'Restarting a healthy downstream service does nothing to fix the thread leak in the upstream caller.',
        ],
        verify: [
          ['./scripts/simulate-thread-leak.sh --with-fix', 'Busy threads remain < 15, checkout p99 latency < 25ms', 'Root cause thread leak eliminated.'],
        ],
        explainPrompt:
          'Explain why upstream thread exhaustion frequently generates misleading downstream timeout error messages.',
        modelExplanation:
          'In microservice architectures, when Service A runs out of worker threads, incoming requests sit in an internal operating system TCP backlog queue. By the time a thread finally picks up the queued request, the overall client timeout has almost expired. When Service A makes a 100ms call to Service B, the remaining budget expires immediately, throwing a SocketTimeoutException that blames Service B, even though Service B responded perfectly and the real delay was the time spent waiting in Service A thread queue.',
        patterns: ['Upstream Starvation', 'Misleading Error Attribution', 'Thread Leak', 'Queue Delay'],
        dimension: 'debugging',
      },
    ],
    design: {
      id: 'M6.5-AC1',
      title: 'Design automated Root-Cause Analysis (RCA) and postmortem incident pipeline',
      scenario:
        'An enterprise platform experiences an average of 4 major incidents per month across 60 microservices. Executive leadership requires an automated incident response workflow that captures telemetry snapshots at the moment of failure, assists on-call engineers with correlated evidence, and generates standardized postmortems.',
      requirements: [
        'Design automated telemetry snapshot trigger: when a P0 alert fires, capture thread dumps, connection pool states, and active traces.',
        'Define the cross-signal triage runbook (Metric -> Trace -> Log -> Database query).',
        'Specify the mandatory postmortem document structure distinguishing Root Cause from Symptoms and Contributing Factors.',
        'Design automated prevention tracking: convert postmortem action items into tracked Jira/GitHub issues with SLO deadlines.',
      ],
      constraints: [
        'Snapshot capture must not freeze or crash already degraded production JVMs.',
        'Postmortem must be published within 48 hours of incident resolution.',
      ],
      deliverables: [
        'Automated incident triage decision tree flowchart.',
        'Standardized blameless postmortem template (Markdown).',
        'Telemetry correlation architecture diagram connecting Prometheus, Tempo, and Loki in Grafana.',
      ],
      failureModes: [
        'Running full heap dumps on degraded 64GB JVMs causes a 45-second "stop the world" freeze, exacerbating the outage.',
        'Postmortem degenerates into blaming individual developers instead of identifying systemic architectural flaws.',
      ],
      tradeoffQuestions: [
        {
          question: 'Why must postmortems be strictly "blameless"?',
          modelAnswer:
            'If an organization punishes or blames individuals for outages, engineers naturally hide mistakes, conceal risky changes, delay reporting incidents, and refuse to touch complex legacy systems. A blameless culture recognizes that humans will always make errors; the objective of a postmortem is to identify systemic architectural, operational, and testing safeguards that make it impossible for a single human mistake to cause catastrophic downtime.',
        },
        {
          question: 'Why should full JVM heap dumps NOT be automated during an active P0 production incident?',
          modelAnswer:
            'Capturing a heap dump on a production JVM with 32GB+ of memory pauses the entire JVM process ("stop-the-world") for tens of seconds while memory pages are written to disk. Doing this during an active incident worsens the outage and causes upstream circuit breakers to trip. Instead, capture thread dumps (`jstack`) and lightweight OS metrics, and use memory leak canaries in pre-production staging.',
        },
      ],
    },
    defense: [
      [
        'During an incident, a junior engineer immediately suggests restarting the database and all microservices. How do you respond?',
        'I would firmly halt the reboot: restarting everything blindly destroys ephemeral volatile evidence (memory thread states, connection queues, deadlocked locks, in-memory buffers) without fixing the root cause. As soon as the services reboot and traffic returns, the exact same condition will trigger the exact same collapse. We must capture thread dumps and connection metrics first, identify the bottleneck, apply a targeted mitigation (like shedding load or opening a circuit breaker), and resolve the systemic issue.',
        'debugging',
        ['Halts destructive premature reboot.', 'Protects ephemeral diagnostic evidence.', 'Focuses on targeted mitigation over blind restarts.'],
      ],
      [
        'How do you explain to business stakeholders why a slow query in a non-critical recommendation service took down the core checkout API?',
        'I explain the mechanism of cascading failure: while recommendations are non-critical, OrderService was calling it synchronously without an isolated thread pool (bulkhead) or strict timeout. When the recommendation query slowed down, OrderService threads piled up waiting for recommendations, leaving zero threads to process customer checkouts. We are implementing a bulkhead to isolate resources and making the recommendation call strictly asynchronous and optional.',
        'communication',
        ['Explains cascading failure clearly.', 'Uses non-defensive, plain language.', 'Outlines permanent structural mitigation.'],
      ],
    ],
    english: [
      [
        ['root cause', 'The fundamental, systemic reason that triggered an incident.', 'The root cause was an unindexed query on the inventory table, not a network failure.'],
        ['symptom', 'The observable manifestation of an underlying problem.', 'The 504 Gateway Timeout was merely a symptom of upstream thread pool exhaustion.'],
        ['contributing factor', 'A condition that exacerbated or accelerated the incident without directly causing it.', 'The marketing email surge was a contributing factor that hastened the thread exhaustion.'],
        ['postmortem', 'A formal retrospective analysis of an incident to prevent future recurrence.', 'We published a blameless postmortem within forty-eight hours of resolving the outage.'],
        ['Mean Time to Resolution', 'The average time required to resolve a system failure and restore full service.', 'Implementing cross-signal correlation reduced our Mean Time to Resolution to nine minutes.']
      ],
      [
        'Never confuse the observable symptom with the underlying root cause.',
        'Blameless postmortems identify systemic vulnerabilities rather than assigning personal fault.',
        'Cross-signal correlation allows engineers to transition from high-level alerts to the exact line of code.'
      ],
      'Our incident response methodology relies on systematic multi-signal correlation rather than intuitive guesswork. When an alert signals an anomaly in Prometheus metrics, on-call engineers jump directly to exemplar traces in Tempo to isolate the degraded service hop. Correlated logs in Loki, linked by W3C trace identifiers, reveal the precise underlying exception within seconds. Following incident resolution, teams conduct blameless postmortems to formulate permanent structural safeguards.',
      [
        ['On-call team spent hours chasing the wrong service', 'The engineer mistook a downstream timeout symptom for the root cause. We conducted a postmortem review emphasizing trace waterfall inspection.'],
        ['Action items from previous outages were never completed', 'Postmortem action items were not tracked in the main backlog. We integrated postmortem tasks directly into sprint planning with SLO deadlines.']
      ],
      [
        'Trace this transaction down to the leaf span before proposing a hypothesis.',
        'Distinguish the contributing traffic factor from the structural root cause in this report.',
        'Capture a thread dump before recycling this degraded container to preserve evidence.'
      ],
      [
        'What is the difference between a root cause and a contributing factor?',
        'How do you navigate from a Prometheus metric anomaly down to a specific line in a log file?',
        'Why is a blameless postmortem culture essential for engineering reliability?'
      ],
      [
        'How do you prevent alert storms from obscuring the primary root cause during a major outage?',
        'What steps should an on-call engineer take before deciding to restart a degraded production service?',
        'How do you calculate and improve Mean Time to Resolution across a distributed architecture?'
      ],
      'Mastering incident engineering requires navigating the full spectrum of telemetry with rigorous analytical discipline. By correlating Golden Signal metrics, distributed trace waterfalls, and structured logs into a single continuous workflow, engineers eliminate guesswork and isolate root causes in minutes. Blameless postmortems translate painful operational outages into durable architectural improvements, forging a resilient, continuously improving engineering organization.',
    ],
    ai: [
      'Ask an AI to analyze an outage report where checkout is failing with HTTP 500 errors and CPU is 100% on the database.',
      'The AI suggests: "The database CPU is 100%, so the database server is under-provisioned. You should immediately upgrade to a larger database instance with more vCPUs and RAM."',
      [
        'Jumping to "upgrade the database hardware" is a superficial and expensive knee-jerk reaction.',
        'High database CPU is almost always caused by a missing index triggering sequential table scans, a runaway un-paginated query, or a connection storm.',
        'Upgrading hardware on an unindexed table scan of 100M rows simply burns money while the database remains saturated.',
        'The correct engineering response is checking `pg_stat_statements` to find the specific slow query, analyzing its execution plan (`EXPLAIN ANALYZE`), and adding the missing index.',
      ],
      [
        'Ask the AI how an unindexed query behaves under load even on a 64-core database server.',
        'Ask how to identify the specific query consuming the most CPU time using `pg_stat_statements`.',
        'Ask why scaling up hardware before optimizing query execution plans is considered an anti-pattern.',
      ],
      'Correct outcome: Reject premature hardware upgrades. Investigate the database slow query log and `pg_stat_statements`, identify missing indexes or un-paginated full table scans, and optimize the data access pattern first.',
    ],
    quiz: [
      ['conceptual', 'What is the fundamental difference between a Root Cause and a Symptom?', ['There is no difference', 'A symptom is the visible effect of the problem (e.g. 504 timeout); the root cause is the fundamental defect that triggered it (e.g. unindexed query)', 'Symptoms only occur in hardware; root causes only occur in software', 'Root causes are always caused by junior developers'], 1, 'Symptoms are visible effects; root causes are the underlying triggers.'],
      ['debugging', 'During an incident, Grafana shows p99 latency spiked on /checkout. What is the fastest way to find the exact trace?', ['Search all logs in terminal with grep', 'Click the Metric Exemplar dot directly on the Grafana latency graph to open the trace in Tempo', 'Restart the server and wait for it to happen again', 'Ask the user to email their browser history'], 1, 'Exemplars link metric spikes directly to the representative trace.'],
      ['scenario', 'A downstream service is slow. Upstream service worker threads exhaust, and its own callers time out. What is this phenomenon?', ['Cascading Failure', 'Thread Optimization', 'Binary Search', 'Kubernetes Ingress'], 0, 'Cascading failure spreads resource exhaustion upstream.'],
      ['design', 'Why are postmortems conducted "blamelessly" in high-performing engineering cultures?', ['To avoid firing people', 'Because blaming individuals incentivizes hiding errors and discourages open discussion, whereas blameless postmortems identify systemic design fixes', 'Because managers are not allowed to attend', 'It is required by Java syntax'], 1, 'Blameless cultures encourage transparency and systemic fixes.'],
      ['code-tracing', 'What telemetry data links a Grafana Loki log entry to a Tempo distributed trace?', ['The `trace_id` (or `traceId`) field extracted via derived field regex', 'The server CPU model', 'The color of the terminal', 'The line number of the code'], 0, 'The trace_id links logs to trace waterfalls.'],
    ],
  }),
];

/** Architecture snapshots of the continuous capstone, phase by phase. */
export const MS_M6_SNAPSHOTS: MsCapstoneSnapshot[] = [
  {
    phase: 'M6',
    label: 'M6 Architecture Milestone: Full-Spectrum Observability & Production Telemetry Mesh',
    services: [
      'api-gateway (W3C traceparent injection, structured JSON, Netty metrics)',
      'auth-service (OAuth2/JWT, audit logs, token latency metrics)',
      'account-service (Resource Server, JDBC connection metrics, MDC logging)',
      'product-service (Redis cache-aside metrics, Elasticsearch index lag monitoring)',
      'order-service (OpenTelemetry distributed tracing, Kafka header propagation, Outbox metrics)',
      'inventory-service (gRPC metrics, Netty worker thread monitoring, Lock contention meters)',
      'payment-service (Idempotency metrics, Webhook audit logging, PSP latency percentiles)',
      'notification-service (Kafka consumer lag tracking, async trace propagation)',
    ],
    infrastructure: [
      'Prometheus (time-series metrics engine, SLI/SLO recording rules)',
      'Grafana (unified Golden Signals dashboards, metric exemplars, Loki/Tempo integration)',
      'Grafana Tempo / Zipkin (distributed trace storage and waterfall visualization)',
      'Grafana Loki / Elasticsearch (structured JSON log ingestion and PII redaction)',
      'Alertmanager (multi-window multi-burn-rate alerting, alert inhibition rules)',
    ],
    flows: [
      'Client -> Gateway (stamps traceparent) -> OrderService -> gRPC Inventory -> Payment -> Kafka -> Notification',
      'Telemetry Flow: Application -> Micrometer/Logback -> Prometheus Scrape / OpenTelemetry OTLP -> Grafana',
      'Incident Triage Flow: Alert -> Metric Spike -> Exemplar Trace -> Span Breakdown -> Filtered Log -> Root Cause',
    ],
    newInThisPhase: [
      'Standardized structured JSON logging with MDC trace injection and automated PII masking',
      'End-to-end W3C traceparent propagation across HTTP clients and Kafka message headers',
      'The Four Golden Signals (Latency, Traffic, Errors, Saturation) with p95/p99 percentiles',
      'Service Level Objectives (SLIs/SLOs) with 30-day rolling error budget burn rate alerting',
      'Cross-signal correlation connecting Prometheus exemplars, Tempo traces, and Loki logs',
    ],
    knownWeaknesses: [
      'Container orchestration and automated pod self-healing not yet unified (targeted for M7 Kubernetes)',
      'GitOps deployment pipelines and declarative Helm charts pending (targeted for M7)',
      'Multi-region active-active disaster recovery pending (targeted for M8)',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },
];

/** Production-style incidents authored for Phase M6 (7 mandatory scenarios). */
export const MS_M6_INCIDENTS: MsIncident[] = [
  {
    id: 'M6-INC-01',
    title: 'P0 Incident: Checkout Latency Explosion via Downstream Database Lock Contention',
    moduleId: 'M6.5',
    severity: 'P0',
    environment: 'production',
    symptomSummary:
      'Checkout API p99 latency exploded from 45ms to 9,800ms. Inbound gateway requests are queuing, error budget is burning at 25x normal rate, and customers report frozen payment screens.',
    alerts: [
      'CRITICAL: CheckoutP99LatencyBreach (p99 > 5s for 3m)',
      'CRITICAL: ErrorBudgetBurnRateFast (burn rate > 14.4)',
      'WARNING: OrderServiceTomcatThreadsBusy > 85%',
    ],
    hypothesisOptions: [
      'The API gateway is suffering from a DDoS attack on its SSL port.',
      'InventoryService is executing unindexed table scans on the stock table, holding row locks and causing downstream thread starvation in OrderService.',
      'Kafka broker ran out of disk space.',
    ],
    correctHypothesisIndex: 1,
    metrics: [
      { name: 'Gateway checkout p99 latency', value: '9850ms', baseline: '45ms', interpretation: 'Severe tail latency spike' },
      { name: 'Inventory DB lock wait time', value: '8400ms', baseline: '2ms', interpretation: 'Severe database row lock contention' },
      { name: 'OrderService busy threads', value: '185 / 200', baseline: '22 / 200', interpretation: 'Tomcat worker threads approaching exhaustion' },
      { name: 'Kafka broker disk usage', value: '42%', baseline: '40%', interpretation: 'Kafka is completely healthy' },
    ],
    logs: [
      '2026-09-26T22:30:12.102Z WARN [order-service,trace-a1b2,span-01] o.s.w.c.RestTemplate: Response took 8412ms from http://inventory-service',
      '2026-09-26T22:30:15.301Z ERROR [inventory-service,trace-a1b2,span-02] org.hibernate.engine.jdbc.spi.SqlExceptionHelper: Lock wait timeout exceeded; try restarting transaction',
      '2026-09-26T22:30:18.402Z INFO [api-gateway,trace-a1b2] o.s.c.g.f.NettyRoutingFilter: 504 Gateway Timeout route=checkout',
    ],
    trace: [
      'client -> api-gateway [9850ms]',
      'api-gateway -> order-service [9845ms]',
      'order-service -> inventory-service:reserveStock [8410ms - BOTTLENECK]',
      'inventory-service -> postgresql:UPDATE stock [8400ms - LOCK WAIT]',
    ],
    rootCauseOptions: [
      'A concurrent warehouse stock import job was running massive un-paginated UPDATEs inside a single long-lived transaction, holding exclusive row locks on popular SKUs and blocking checkout reservations.',
      'The API gateway CPU was throttled by Kubernetes cgroups.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Immediately kill the blocking warehouse import database transaction (pg_terminate_backend).',
      'Refactor the warehouse import script to batch updates into micro-transactions of 50 records with explicit row-level locking.',
      'Configure a strict lock_timeout of 1000ms on the inventory database session to fail fast rather than hanging indefinitely.',
    ],
    verification: [
      'Checkout p99 latency returns to 38ms within 60 seconds of terminating the blocking query.',
      'OrderService busy threads drop from 185 to 19.',
      'Error budget burn rate drops to 0.1.',
    ],
    explainPrompt:
      'Explain the exact chain of failure that allowed a background warehouse batch job to take down the user-facing checkout API.',
    postmortem: {
      impact: '100% of checkout transactions degraded for 22 minutes; 1,400 orders failed; $85,000 lost revenue.',
      detection: 'Alertmanager fired on CheckoutP99LatencyBreach within 3 minutes of lock contention spike.',
      rootCause:
        'A background warehouse catalog sync job initiated an un-chunked UPDATE on 250,000 stock rows inside a single database transaction. This held exclusive row-level locks on the `stock` table. Checkout transactions attempting to reserve stock blocked behind these locks until hitting the 8-second HTTP timeout, exhausting upstream OrderService worker threads.',
      resolution:
        'Terminated the locking PostgreSQL PID; updated inventory session settings to enforce a 1000ms lock timeout; split the batch import into 50-row chunks.',
      prevention:
        'Add architectural rule: batch database operations must never share transactional tables with real-time checkout paths without chunking; implement strict lock timeouts across all services.',
    },
    defenseQuestions: [
      'Why was the database lock wait timeout not set to a low value initially?',
      'How does a bulkhead pattern prevent background batch jobs from starving real-time customer APIs?',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },

  {
    id: 'M6-INC-02',
    title: 'P1 Incident: Kafka Consumer Lag Spike via Serialization Poison Pill',
    moduleId: 'M6.2',
    severity: 'P1',
    environment: 'production',
    symptomSummary:
      'Order confirmation notifications and invoices stopped sending. Kafka consumer lag on topic `orders.v1` is climbing by 1,200 messages per minute. NotificationService CPU is 100% but 0 emails are dispatched.',
    alerts: [
      'CRITICAL: KafkaConsumerLagHigh (topic: orders.v1, lag > 10000)',
      'WARNING: NotificationServiceDeliveryRateDropped (drop > 90%)',
    ],
    hypothesisOptions: [
      'The SendGrid email provider API is completely down.',
      'A malformed message (poison pill) is causing a DeserializationException in the consumer loop, which retries infinitely in a tight loop and blocks the partition offset from advancing.',
      'Kafka broker partition leader rebalance failure.',
    ],
    correctHypothesisIndex: 1,
    metrics: [
      { name: 'Kafka consumer lag (orders.v1)', value: '14,250', baseline: '12', interpretation: 'Massive unconsumed message backlog' },
      { name: 'NotificationService CPU', value: '100%', baseline: '15%', interpretation: 'Consumer thread pegged in infinite retry loop' },
      { name: 'Outgoing email requests to SendGrid', value: '0 / sec', baseline: '45 / sec', interpretation: 'Zero work reaching provider' },
      { name: 'Kafka broker health', value: '3 / 3 in-sync', baseline: '3 / 3', interpretation: 'Broker cluster healthy' },
    ],
    logs: [
      '2026-09-26T22:35:01.002Z ERROR [notification-service] o.a.k.c.c.i.ConsumerCoordinator: Error processing message at partition 2, offset 84912',
      '2026-09-26T22:35:01.003Z ERROR [notification-service] o.s.k.l.KafkaListener: org.springframework.kafka.support.serializer.DeserializationException: failed to deserialize; Caused by: com.fasterxml.jackson.core.JsonParseException: Unexpected character (\'<\' (code 60)): expected a valid value',
      '2026-09-26T22:35:01.005Z INFO [notification-service] o.s.k.l.DefaultErrorHandler: Seeking to current offset 84912 to retry...',
    ],
    trace: [
      'kafka-consumer -> poll() [offset: 84912]',
      'deserializer: OrderCreatedEvent -> JsonParseException [0ms - ERROR]',
      'error-handler -> seek(offset: 84912) [retry loop]',
    ],
    rootCauseOptions: [
      'A legacy internal service published raw HTML error text instead of JSON into the Kafka topic. The Spring Kafka consumer lacked an ErrorHandlingDeserializer and Dead Letter Queue (DLQ), causing it to crash and retry the exact same offset indefinitely, stalling partition 2.',
      'The consumer group ID was duplicated across two different applications.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Configure Spring Kafka `ErrorHandlingDeserializer` with a `DeadLetterPublishingRecoverer` to route unparseable messages to `orders.v1.DLQ` after 3 failed attempts.',
      'Manually commit consumer offset past offset 84912 to immediately drain the backlogged queue.',
      'Add schema validation filter on the producer side to prevent non-JSON payloads.',
    ],
    verification: [
      'Consumer lag drains from 14,250 down to 0 in 3 minutes.',
      'NotificationService CPU drops from 100% to 14%.',
      'Backlogged order confirmation emails are delivered to customers.',
    ],
    explainPrompt:
      'Explain what a Kafka poison pill is and why standard consumer retry loops fail catastrophically when encountering deserialization errors.',
    postmortem: {
      impact: '14,250 order emails delayed by 45 minutes; zero orders lost; support ticket volume increased 300%.',
      detection: 'Alertmanager fired on KafkaConsumerLagHigh after lag exceeded 10,000.',
      rootCause:
        'An upstream internal tool published an HTML 502 error page into the Kafka topic instead of valid JSON. NotificationService default error handler attempted to deserialize the record, failed with JsonParseException, and sought the partition offset back to the same offset to retry. Because the payload will never become valid JSON, the consumer stalled in an infinite loop on that partition.',
      resolution:
        'Configured Spring Kafka ErrorHandlingDeserializer and DeadLetterPublishingRecoverer to route deserialization failures to an error topic (DLQ) and advance the offset.',
      prevention:
        'Adopt Avro/Protobuf with Schema Registry or strictly configure ErrorHandlingDeserializer on all Kafka consumer configurations across the company.',
    },
    defenseQuestions: [
      'Why does advancing the offset manually carry operational risk?',
      'How does a Dead Letter Queue preserve evidence without stalling consumer processing?',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },

  {
    id: 'M6-INC-03',
    title: 'P0 Incident: Cascading Payment Timeout & Self-Inflicted Retry Storm',
    moduleId: 'M6.3',
    severity: 'P0',
    environment: 'production',
    symptomSummary:
      'Checkout transactions are failing globally with 504 Gateway Timeout. External payment provider latency rose from 300ms to 2,800ms. In response, internal client retries amplified traffic by 400%, exhausting server connection pools.',
    alerts: [
      'CRITICAL: PaymentGatewayErrorRateHigh (> 25%)',
      'CRITICAL: ApiGatewayHttp504Rate (> 30%)',
      'WARNING: OrderServiceTomcatThreadsBusy (100%)',
    ],
    hypothesisOptions: [
      'External payment provider is completely dead and returning 500 Internal Server Error.',
      'External provider experienced elevated latency; lack of circuit breaker and aggressive client retries with zero backoff generated an internal retry storm that exhausted OrderService thread pools.',
      'The TLS certificates on the gateway expired.',
    ],
    correctHypothesisIndex: 1,
    metrics: [
      { name: 'External PSP response time', value: '2800ms', baseline: '300ms', interpretation: 'Provider is slow but not dead' },
      { name: 'Payment requests per second (RPS)', value: '1,200 rps', baseline: '250 rps', interpretation: '400% traffic amplification from retries' },
      { name: 'OrderService busy threads', value: '200 / 200', baseline: '15 / 200', interpretation: 'Worker thread pool completely saturated' },
      { name: 'Client checkout errors', value: '38%', baseline: '0.1%', interpretation: 'Catastrophic checkout failure rate' },
    ],
    logs: [
      '2026-09-26T22:40:02.102Z WARN [payment-client] c.s.p.PaymentClient: Attempt 1 timed out after 2000ms; retrying immediately...',
      '2026-09-26T22:40:04.104Z WARN [payment-client] c.s.p.PaymentClient: Attempt 2 timed out after 2000ms; retrying immediately...',
      '2026-09-26T22:40:06.105Z WARN [payment-client] c.s.p.PaymentClient: Attempt 3 timed out after 2000ms; failing...',
      '2026-09-26T22:40:07.001Z ERROR [api-gateway] o.s.c.g.f.NettyRoutingFilter: 504 Gateway Timeout',
    ],
    trace: [
      'client -> gateway -> order-service [6005ms - TIMEOUT]',
      'order-service -> payment-client:charge [2000ms - timeout]',
      'order-service -> payment-client:retry1 [2000ms - timeout]',
      'order-service -> payment-client:retry2 [2000ms - timeout]',
    ],
    rootCauseOptions: [
      'PaymentClient was configured with a tight 2000ms timeout and 3 immediate retries without exponential backoff, jitter, or a Circuit Breaker. When provider latency spiked to 2800ms, every request timed out and executed 3 immediate retries, quadrupling load and locking Tomcat worker threads for 6 seconds per user.',
      'The database query in PaymentService was missing an index on the user_id column.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Hotfix: Disable automatic retries on PaymentClient; deploy Resilience4j CircuitBreaker with 3500ms timeout and slidingWindowSize=20.',
      'Add Exponential Backoff with Full Jitter to any subsequent retry policies.',
      'Configure degraded checkout fallback returning DEFERRED_REVIEW status.',
    ],
    verification: [
      'Traffic drops from 1,200 RPS back to normal 250 RPS as retries cease.',
      'OrderService worker threads drop from 200 to 18.',
      'Transactions completing within 2800ms succeed, and p99 restores to healthy levels.',
    ],
    explainPrompt:
      'Explain how a minor latency increase in an external dependency transforms into a catastrophic total outage through client-side retry storms.',
    postmortem: {
      impact: 'Global checkout unavailable for 16 minutes; estimated 2,100 lost orders.',
      detection: 'Alertmanager triggered on ApiGatewayHttp504Rate within 2 minutes of cascade.',
      rootCause:
        'Payment provider latency degraded to 2800ms during an infrastructure migration. Because internal PaymentClient had a 2000ms timeout and 3 immediate retries with zero delay, every request generated 4 total attempts, ballooning traffic from 250 RPS to 1,200 RPS. This exhausted all 200 worker threads in OrderService, causing gateway timeouts across all checkout calls.',
      resolution:
        'Disabled blind retries; wrapped the client in a Resilience4j Circuit Breaker with 3500ms timeout and bulkhead concurrency limits.',
      prevention:
        'Enforce mandatory SRE rule: zero retries on mutating payment calls without verified idempotency keys, exponential backoff, and full jitter.',
    },
    defenseQuestions: [
      'Why is exponential backoff with full jitter mathematically superior to fixed-interval retries?',
      'How does a circuit breaker protect both your application and the downstream struggling dependency?',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },

  {
    id: 'M6-INC-04',
    title: 'P1 Incident: Flash Deal Redis Cache Stampede Collapses PostgreSQL',
    moduleId: 'M6.4',
    severity: 'P1',
    environment: 'production',
    symptomSummary:
      'Product catalogue and checkout are failing. PostgreSQL database CPU surged to 100%, and HikariCP connection pool acquisition is timing out. Redis CPU is near 0%, and cache hit ratio collapsed from 99.2% to 12%.',
    alerts: [
      'CRITICAL: DatabaseConnectionPoolExhausted (HikariPool-1)',
      'CRITICAL: CacheHitRatioCollapsed (hit ratio < 30%)',
      'WARNING: ProductServiceP99LatencyBreach (p99 > 8s)',
    ],
    hypothesisOptions: [
      'PostgreSQL server suffered physical NVMe drive failure.',
      'A popular flash deal product cache key expired simultaneously with a traffic surge, causing thousands of concurrent requests to miss cache and hit PostgreSQL simultaneously (Cache Stampede).',
      'Redis cluster ran out of memory and crashed.',
    ],
    correctHypothesisIndex: 1,
    metrics: [
      { name: 'Redis Cache Hit Ratio', value: '12.4%', baseline: '99.2%', interpretation: 'Catastrophic cache bypass' },
      { name: 'PostgreSQL CPU Utilization', value: '100%', baseline: '18%', interpretation: 'Database CPU completely pinned' },
      { name: 'HikariCP Active Connections', value: '50 / 50', baseline: '8 / 50', interpretation: 'Connection pool fully saturated' },
      { name: 'Redis Memory Usage', value: '1.2 GB / 8 GB', baseline: '1.1 GB', interpretation: 'Redis healthy with ample memory' },
    ],
    logs: [
      '2026-09-26T22:45:10.102Z WARN [product-service] com.zaxxer.hikari.pool.HikariPool: HikariPool-1 - Connection is not available, request timed out after 30000ms',
      '2026-09-26T22:45:12.301Z ERROR [product-service] c.s.p.ProductService: Failed to fetch product 8f9a2b; Caused by: ConnectionTimeoutException',
      '2026-09-26T22:45:15.004Z INFO [postgresql] postgres[9182]: [3-1] user=app,db=catalog LOG: duration: 8412.102 ms statement: SELECT p.*, c.* FROM products p JOIN categories c ... WHERE p.id = \'8f9a2b\'',
    ],
    trace: [
      'client -> product-service [30002ms - ERROR]',
      'product-service -> redis:GET product:8f9a2b [1ms - MISS]',
      'product-service -> postgresql:SELECT [30000ms - POOL TIMEOUT]',
    ],
    rootCauseOptions: [
      'The product cache key for the flash sale item expired with a fixed TTL and lacked a mutex lock on cache miss. 4,000 concurrent requests all missed cache at the exact same millisecond and hammered PostgreSQL with identical heavy relational queries, exhausting the database connection pool.',
      'The PostgreSQL max_connections setting was lowered to 5.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Pre-warm the cache key in Redis with a 24-hour TTL.',
      'Implement Cache-Aside with distributed mutex locking (Redis SET NX PX 3000) so only 1 thread queries PostgreSQL on cache miss, while others wait.',
      'Add randomized TTL jitter (+ rand(0..300)s) to prevent simultaneous key expiration.',
    ],
    verification: [
      'Cache hit ratio restores to 99.4%.',
      'PostgreSQL CPU utilization drops from 100% to 14%.',
      'HikariCP active connections drop to 6 / 50.',
    ],
    explainPrompt:
      'Explain the mechanics of a cache stampede and why simply increasing the database connection pool size worsens the outage.',
    postmortem: {
      impact: 'Catalogue search and product pages unavailable for 14 minutes; 6,000 users affected.',
      detection: 'Alertmanager triggered on DatabaseConnectionPoolExhausted within 60 seconds.',
      rootCause:
        'A promotional email was sent to 500,000 customers highlighting a single SKU. The product cache key had a fixed 10-minute TTL with zero jitter. When the key expired, 4,000 concurrent requests missed the cache simultaneously. Because the service lacked concurrency control on cache misses, all 4,000 threads executed complex multi-join SQL queries against PostgreSQL, saturating HikariCP and pinning database CPU.',
      resolution:
        'Pre-warmed the expired key; implemented singleflight mutex locking on cache misses; added randomized TTL jitter.',
      prevention:
        'Enforce architectural pattern: all cache-aside code must use distributed locks on cache miss for high-traffic entities; mandate TTL jitter on all cache keys.',
    },
    defenseQuestions: [
      'Why does increasing the database connection pool size make PostgreSQL CPU thrashing worse?',
      'How does probabilistic early expiration (XFetch) prevent cache stampedes before keys expire?',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },

  {
    id: 'M6-INC-05',
    title: 'P0 Incident: Database Connection Exhaustion via Leaked Transaction in Error Path',
    moduleId: 'M6.5',
    severity: 'P0',
    environment: 'production',
    symptomSummary:
      'OrderService is completely unresponsive and returning 500 errors. HikariCP active connections reached 100% capacity and never recover, even after traffic drops to 0.',
    alerts: [
      'CRITICAL: HikariPoolExhaustion (pool: HikariPool-1, active: 50/50 for 5m)',
      'CRITICAL: OrderService500RateHigh (> 50%)',
    ],
    hypothesisOptions: [
      'A traffic spike overwhelmed the database capacity.',
      'A code change introduced a database connection leak: a third-party REST call inside an open transaction throws an exception that bypasses connection closing, permanently leaking connections from the pool.',
      'PostgreSQL deadlocked on auto-vacuuming.',
    ],
    correctHypothesisIndex: 1,
    metrics: [
      { name: 'HikariCP Active Connections', value: '50 / 50 (flatlined)', baseline: '8 / 50', interpretation: 'Connections permanently leaked' },
      { name: 'PostgreSQL Active Queries', value: '0', baseline: '12', interpretation: 'Database server is completely idle' },
      { name: 'Application Incoming RPS', value: '2 rps', baseline: '200 rps', interpretation: 'Connections remain held despite zero traffic' },
      { name: 'OrderService JVM Memory', value: '45%', baseline: '40%', interpretation: 'Memory is normal' },
    ],
    logs: [
      '2026-09-26T22:50:01.102Z WARN [order-service] c.s.o.OrderService: Remote address verification failed with SocketTimeoutException',
      '2026-09-26T22:50:01.103Z ERROR [order-service] c.z.h.p.ProxyConnection: Connection leak detection triggered for connection [HikariProxyConnection@18a9f2] held for 31402ms',
      '2026-09-26T22:50:31.201Z WARN [order-service] c.z.h.p.HikariPool: Connection is not available, request timed out after 30000ms',
    ],
    trace: [
      'client -> order-service:createOrder [30005ms - ERROR]',
      'order-service -> hikari:getConnection [30000ms - TIMEOUT]',
    ],
    rootCauseOptions: [
      'A newly deployed feature acquired a database Connection manually without a `try-with-resources` block and executed an HTTP call inside the method. When the HTTP call timed out, the exception aborted the method before `connection.close()` was invoked, permanently stranding the connection outside the pool.',
      'The PostgreSQL max_connections parameter was exceeded on the database server.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Deploy hotfix wrapping the connection acquisition in a strict `try-with-resources` block (or refactoring to Spring `@Transactional` declarative management).',
      'Move the external HTTP address verification call outside of the database transaction boundary.',
      'Configure HikariCP `leakDetectionThreshold = 5000` to log stack traces of any connection held longer than 5 seconds.',
    ],
    verification: [
      'Active connections drop back to 4 / 50.',
      'Simulated HTTP timeout exceptions in error paths properly release connections back to HikariCP.',
      'Checkout success rate restores to 100%.',
    ],
    explainPrompt:
      'Explain how a connection leak occurs in Java JDBC applications and how connection pool leak detection works.',
    postmortem: {
      impact: 'OrderService 100% down for 19 minutes; 820 checkout attempts failed.',
      detection: 'Alertmanager triggered on HikariPoolExhaustion after pool was saturated for 5 minutes.',
      rootCause:
        'A developer used manual JDBC connection handling instead of Spring Data JPA for a raw SQL query. An external HTTP geocoding lookup was executed after opening the connection. When the geocoding service experienced a 30-second timeout, the exception un-wound the stack before `conn.close()` was executed. Over 50 failed calls, all 50 connections in the pool were permanently orphaned, locking out all subsequent database operations.',
      resolution:
        'Refactored the method to use try-with-resources and moved external HTTP calls strictly outside database blocks; enabled HikariCP leakDetectionThreshold.',
      prevention:
        'Add architectural rule: direct JDBC Connection acquisition is forbidden outside approved framework adapters; add SonarQube lint check detecting unclosed AutoCloseable resources.',
    },
    defenseQuestions: [
      'Why should external network calls NEVER be made inside an open database transaction?',
      'How does HikariCP leak detection pinpoint the exact line of code that leaked the connection?',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },

  {
    id: 'M6-INC-06',
    title: 'P1 Incident: Pod CrashLoopBackOff via Kubernetes cgroup OOMKilled',
    moduleId: 'M6.3',
    severity: 'P1',
    environment: 'production',
    symptomSummary:
      'OrderService pods are repeatedly crashing and restarting with Exit Code 137. Intermittent 502 Bad Gateway errors occur as Kubernetes endpoints point to dead pods.',
    alerts: [
      'CRITICAL: KubernetesPodCrashLooping (service: order-service)',
      'WARNING: ApiGatewayHttp502Rate (> 15%)',
    ],
    hypothesisOptions: [
      'The Linux kernel panicked due to hardware RAM failure.',
      'The JVM heap was configured without awareness of container memory limits; JVM total process memory exceeded the Kubernetes container memory limit (cgroup limit), causing the Linux kernel OOM killer to send SIGKILL (Exit Code 137).',
      'The application has a stack overflow error.',
    ],
    correctHypothesisIndex: 1,
    metrics: [
      { name: 'Kubernetes Pod Restart Count', value: '18 restarts / hour', baseline: '0', interpretation: 'Continuous crash loop' },
      { name: 'Container Memory Usage', value: '1024 MB / 1024 MB (Limit)', baseline: '450 MB', interpretation: 'Slamming against hard cgroup limit' },
      { name: 'JVM -Xmx setting', value: '800 MB', baseline: '800 MB', interpretation: 'Heap alone is 80% of container limit' },
      { name: 'JVM Metaspace + Direct Memory', value: '350 MB', baseline: '150 MB', interpretation: 'Total JVM memory = 800 + 350 = 1150MB > 1024MB limit' },
    ],
    logs: [
      '2026-09-26T22:55:01.002Z INFO [order-service] c.s.o.OrderApplication: Starting OrderApplication v1.4.2...',
      '2026-09-26T22:55:18.401Z INFO [order-service] c.s.o.OrderApplication: Started OrderApplication in 12.4 seconds',
      '2026-09-26T22:56:02.102Z WARN [k8s-kubelet] kubelet: Pod order-service-7f8a-9b was OOMKilled (Exit Code 137)',
    ],
    trace: [
      'kubelet -> container engine: SIGKILL (cgroup limit exceeded: 1024MiB)',
      'pod status -> Terminated (ExitCode: 137, Reason: OOMKilled)',
    ],
    rootCauseOptions: [
      'The container memory limit was set to 1024MiB while JVM `-Xmx` was set to 800MiB. The team forgot that the JVM allocates off-heap memory (Metaspace, thread stacks, Netty DirectByteBuffers, and JIT compiler cache). Total JVM footprint exceeded 1024MiB, causing the Linux kernel to send SIGKILL.',
      'OrderService had an unhandled NullPointerException in its main method.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Remove hardcoded `-Xmx` and use container-aware JVM ergonomics: `-XX:MaxRAMPercentage=75.0`.',
      'Increase Kubernetes container memory limit from 1024MiB to 1536MiB to provide adequate headroom for Metaspace, thread stacks, and native buffers.',
      'Configure Prometheus alert on `container_memory_working_set_bytes / container_spec_memory_limit_bytes > 0.85`.',
    ],
    verification: [
      'Pod restart count drops to 0; uptime exceeds 24 hours continuously.',
      'Container memory working set stabilizes at 950MiB within the 1536MiB limit.',
      'Exit Code 137 completely disappears from cluster events.',
    ],
    explainPrompt:
      'Explain why setting JVM `-Xmx` equal to or near the container memory limit guarantees an OOMKilled crash.',
    postmortem: {
      impact: '15% of checkout requests intermittently failed with 502 for 35 minutes during crash loops.',
      detection: 'Alertmanager triggered on KubernetesPodCrashLooping after 3 pod restarts.',
      rootCause:
        'The Kubernetes deployment manifest configured `resources.limits.memory: 1024Mi`. The JVM options specified `-Xmx800m`. When load increased, the JVM allocated 800MB of heap PLUS 220MB of off-heap memory (Metaspace for dynamic proxies, thread stacks for 200 threads, and DirectByteBuffers for Netty). The total process memory reached 1035MB, breaching the Linux cgroup limit and triggering the kernel OOM killer.',
      resolution:
        'Increased pod memory limit to 1536Mi; configured `-XX:MaxRAMPercentage=70.0` so heap scales proportionally with container boundaries.',
      prevention:
        'Standardize JVM container base images with `-XX:MaxRAMPercentage=70.0` and mandate that container memory limits must be at least 1.3x the heap size.',
    },
    defenseQuestions: [
      'What is the difference between a Java OutOfMemoryError and a Linux kernel OOMKilled event?',
      'Why is `-XX:MaxRAMPercentage` preferred over hardcoded `-Xmx` in Kubernetes?',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },

  {
    id: 'M6-INC-07',
    title: 'P0 Incident: Duplicate Payment Webhook State Machine Inversion',
    moduleId: 'M6.5',
    severity: 'P0',
    environment: 'production',
    symptomSummary:
      'Customers are receiving double shipments and duplicate order confirmation emails for single purchases. Payment webhook handler logs show multiple concurrent webhook deliveries for identical payment intent IDs.',
    alerts: [
      'CRITICAL: DuplicateOrderFulfillmentDetected (event count > 1)',
      'WARNING: WebhookConcurrencyConflictRate (> 5%)',
    ],
    hypothesisOptions: [
      'Stripe charged the customer credit card twice.',
      'A check-then-act race condition in the webhook consumer allowed two concurrent webhook deliveries to both transition the order state machine and trigger duplicate fulfillment.',
      'The customer clicked the checkout button twice.',
    ],
    correctHypothesisIndex: 1,
    metrics: [
      { name: 'Duplicate fulfillment count', value: '42 orders', baseline: '0', interpretation: 'Severe financial and inventory error' },
      { name: 'Concurrent webhook delivery rate', value: '18 pairs / min', baseline: '0.1', interpretation: 'Provider retrying aggressively' },
      { name: 'Payment gateway actual charges', value: '1 per order', baseline: '1', interpretation: 'Card was only charged once' },
      { name: 'Processed events table rows', value: '84 rows (2 per event)', baseline: '42', interpretation: 'Deduplication failed to enforce uniqueness' },
    ],
    logs: [
      '2026-09-26T22:58:01.101Z INFO [webhook-worker-1] c.s.p.w.WebhookHandler: Processing event evt_pay_8912 for order ord_999',
      '2026-09-26T22:58:01.102Z INFO [webhook-worker-2] c.s.p.w.WebhookHandler: Processing event evt_pay_8912 for order ord_999',
      '2026-09-26T22:58:01.120Z INFO [webhook-worker-1] c.s.p.w.WebhookHandler: Order ord_999 status is PENDING; transitioning to SUCCEEDED',
      '2026-09-26T22:58:01.121Z INFO [webhook-worker-2] c.s.p.w.WebhookHandler: Order ord_999 status is PENDING; transitioning to SUCCEEDED',
      '2026-09-26T22:58:01.150Z INFO [webhook-worker-1] c.s.o.OrderFulfillmentService: Triggering warehouse shipment for ord_999',
      '2026-09-26T22:58:01.152Z INFO [webhook-worker-2] c.s.o.OrderFulfillmentService: Triggering warehouse shipment for ord_999',
    ],
    trace: [
      'webhook-pod-A: POST /webhooks/payments [evt_pay_8912] -> SELECT exists -> false -> UPDATE order -> fulfill()',
      'webhook-pod-B: POST /webhooks/payments [evt_pay_8912] -> SELECT exists -> false -> UPDATE order -> fulfill()',
    ],
    rootCauseOptions: [
      'The webhook consumer used an application-level check `if (!repo.existsById(eventId))` followed by `repo.save()` across multi-pod replicas without a database UNIQUE constraint on `event_id`. When Stripe delivered duplicate webhooks within 5ms, both pods executed the SELECT before either had committed the INSERT, causing dual fulfillment.',
      'The webhook signature was invalid.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Add a strict database `UNIQUE CONSTRAINT uq_processed_event_id ON processed_events(event_id)`.',
      'Refactor the insert to atomic SQL: `INSERT INTO processed_events (event_id, status) VALUES (?, ?) ON CONFLICT (event_id) DO NOTHING`.',
      'Only trigger downstream fulfillment if the atomic insert affected exactly 1 row; if 0 rows were affected, acknowledge with HTTP 200 immediately without taking action.',
    ],
    verification: [
      'Simulate 50 parallel identical webhook deliveries; exactly 1 fulfillment event is triggered.',
      'Duplicate deliveries return HTTP 200 immediately with zero database mutations.',
      'Duplicate fulfillment metric drops to 0 permanently.',
    ],
    explainPrompt:
      'Explain how check-then-act concurrency flaws in distributed webhooks bypass application-level deduplication.',
    postmortem: {
      impact: '42 customer orders were fulfilled twice, resulting in duplicate warehouse shipments valued at $9,400.',
      detection: 'Warehouse inventory reconciliation alert flagged negative inventory discrepancies.',
      rootCause:
        'Stripe webhooks are delivered with at-least-once semantics. When network jitter occurred, Stripe re-delivered identical webhook payloads to two separate Kubernetes pods within 3 milliseconds. The application code checked if the event existed in the database (`existsById`), and finding no record, proceeded to trigger fulfillment. Because the check and insert were not atomic and lacked a database UNIQUE constraint, both threads evaluated the check as false and dispatched two fulfillment orders.',
      resolution:
        'Added a PostgreSQL UNIQUE constraint on `event_id` and switched to atomic `INSERT ON CONFLICT DO NOTHING`; fulfillment is only triggered when the insert returns row_count = 1.',
      prevention:
        'Mandate atomic database-enforced deduplication for all webhook endpoints and event consumers across the enterprise.',
    },
    defenseQuestions: [
      'Why is Java synchronization completely useless for preventing duplicate webhook processing across a Kubernetes cluster?',
      'Why must a duplicate webhook return HTTP 200 rather than HTTP 409 Conflict?',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },
];
