/**
 * PHASE M5 — Spring Cloud, Security, Polyglot Data & Resilience Engineering.
 *
 * M5 turns the runtime infrastructure, security boundaries, payment workflows,
 * polyglot storage, high-performance RPC and fault-tolerance into an authentic
 * Senior-level engineering apprenticeship. Every module carries a complete
 * 12-stage engineering framework:
 * LEARN → CODE → BREAK → OBSERVE → DEBUG → FIX → BENCHMARK → DESIGN
 *       → EXPLAIN → DEFEND → ASSESS → REVIEW
 *
 * Honesty contract:
 * - REAL_EXECUTABLE: labs with runnable Spring Boot / Docker / test code.
 * - SIMULATED: external identity providers, payment processors (Stripe), and
 *   specialized hardware benchmarks are simulated deterministically in this
 *   environment and explicitly labelled as such. No runtime result is ever faked.
 * - SPECIFICATION: architecture challenges and contract briefs.
 */
import type { MsCapstoneSnapshot, MsIncident, MsModule, MsPhaseMeta } from './types';
import { expandModule } from './compact';
import { debugEx } from './authoring';

export const MS_M5_PHASE: MsPhaseMeta = {
  id: 'M5',
  order: 5,
  title: 'Spring Cloud, Security, Polyglot Data & Resilience',
  subtitle: 'Perimeter routing, OAuth2/JWT zero-trust, payments & webhooks, polyglot persistence, low-latency gRPC, and fault tolerance',
  goal:
    'Master production-grade microservice infrastructure: build a secure API Gateway, validate stateless JWT claims, implement idempotent payment workflows and webhooks, model polyglot data across SQL/NoSQL/Search/Cache, engineer binary gRPC contracts, and protect distributed services from cascading failures using circuit breakers and bulkheads.',
  sessions: 'Source sessions 28–42',
  architectureMilestone:
    'API Gateway with correlation tracing and rate limiting, OAuth2 resource servers with scope validation, idempotent payment engine with webhook reconciliation, polyglot storage (PostgreSQL, MongoDB, Elasticsearch, Redis with stampede protection), internal gRPC service mesh with deadline propagation, and Resilience4j circuit breakers and bulkheads.',
};

/** PHASE M5 MODULES */
export const MS_M5_MODULES: MsModule[] = [
  expandModule({
    id: 'M5.1',
    phase: 'M5',
    order: 1,
    title: 'Spring Cloud: API Gateway, Discovery & Service Communication',
    subtitle:
      'Reactive gateway routing, service discovery, centralized configuration, OpenFeign declarative clients, load balancing, and request-scoped correlation tracing',
    minutes: 190,
    prerequisites: ['M4.1', 'M4.2'],
    objective:
      'Design and operate resilient cross-service communication: build a non-blocking Spring Cloud Gateway, configure OpenFeign with client-side load balancing, enforce request-scoped correlation ID propagation, and manage backward-compatible API contracts.',
    stack: ['Spring Cloud Gateway', 'OpenFeign', 'Spring Cloud LoadBalancer', 'Micrometer Tracing', 'Spring Cloud Config'],
    mode: 'REAL_EXECUTABLE',
    why:
      'An API Gateway is the single front door that protects internal topology, terminates transport security and coordinates cross-cutting concerns like correlation tracing and rate limiting. Without explicit contract boundaries and trace propagation, microservice networks devolve into untraceable distributed monoliths.',
    explanation: [
      'Spring Cloud Gateway acts as a non-blocking reactive reverse proxy and ingress entry point; OpenFeign provides declarative HTTP client bindings with client-side load balancing; correlation propagation stamps every inbound request with a trace ID forwarded down the hop chain.',
      'Internal microservices should not be exposed directly to external clients; endpoints change, security protocols differ, and client-side traffic needs routing, rate limiting, and centralized authentication before hitting domain services.',
      'Solves client coupling to internal hostnames and ports, eliminates duplicated cross-cutting filters across services, and enables zero-downtime traffic rerouting and versioned API deprecation.',
      'Spring Cloud Gateway runs on Netty with reactive RouteLocator predicates and gateway filters; OpenFeign compiles interface annotations into HTTP requests executed through a dynamic proxy backed by Spring Cloud LoadBalancer.',
      'Inbound HTTP request hits Netty event loop -> Gateway filters execute pre-filters (inject X-Correlation-Id, validate JWT) -> proxied to target downstream service instance selected by round-robin/health from discovery registry -> post-filters capture latency and metrics.',
      'Central gateway simplifies client access and observability but introduces a potential single point of failure and extra network hop (typically 1-3ms); centralized config eases dynamic adjustments but creates runtime drift risk if refresh events fail.',
      'Gateway filter chain blocking (using blocking I/O on Netty worker thread halts thousands of concurrent requests); Feign client header loss dropping correlation IDs; configuration refresh race conditions; stale discovery cache routing to dead pods.',
      'Gateway route metrics (spring.cloud.gateway.requests), route error rates (502 Bad Gateway vs 504 Gateway Timeout), OpenFeign client timer percentiles, and W3C traceparent header continuity in distributed trace logs.',
      'Check gateway actuator (/actuator/gateway/routes), verify downstream connection pool exhaustion, inspect Feign Logger.Level.FULL logs in staging, and grep correlation IDs across service boundaries.',
      'Ensure all gateway filters are non-blocking (Mono/Flux); register RequestInterceptor in Feign to propagate headers; configure finite connection and read timeouts on every HTTP client; enforce contract versioning (v1, v2) with backward-compatible deprecation windows.',
      'Do not use Spring Cloud Gateway as an internal orchestrator or business logic aggregation layer; do not use OpenFeign for high-throughput, low-latency binary streaming where gRPC or asynchronous messaging is required.',
      'You notice 504 Gateway Timeout spikes at the gateway during peak traffic, but downstream service CPU is only 15%. How do you diagnose whether the bottleneck is Netty worker thread starvation, downstream connection pool exhaustion, or DNS resolution latency?',
    ],
    keys: [
      'The API Gateway is a reverse proxy and security perimeter, never a business logic aggregator.',
      'Blocking calls on Gateway Netty worker threads will freeze the entire ingress pipeline.',
      'Correlation IDs must be propagated through all OpenFeign headers using a RequestInterceptor.',
      'Client-side load balancing requires healthy instance lists and deterministic timeouts.',
      'Centralized configuration requires explicit @RefreshScope boundaries and fail-fast validation.',
      'API versioning must preserve backward compatibility for at least one major lifecycle.',
    ],
    concepts: [
      [
        'Compare API Gateway vs Backend-For-Frontend (BFF) pattern: when does a client need a dedicated BFF?',
        'A BFF tailors payloads and protocol aggregation for specific client form factors (mobile vs web), whereas a gateway handles shared infrastructure concerns like rate limiting, routing, and TLS termination.',
        'architecture',
      ],
      [
        'Why is blocking the Netty thread in a Spring Cloud Gateway filter fatal to system throughput?',
        'Spring Cloud Gateway uses reactive Netty with a small thread pool (typically 1 per CPU core). A single Thread.sleep() or blocking JDBC/HTTP call starves the event loop, queuing thousands of concurrent connections.',
        'performance',
      ],
      [
        'Trace correlation propagation across Feign: explain what happens if a RequestInterceptor is missing.',
        'Without a Feign RequestInterceptor transferring MDC / baggage items to outbound HTTP headers, downstream services generate new trace IDs, breaking the distributed trace into disconnected spans.',
        'observability',
      ],
      [
        'Design backward-compatible API evolution for OrderService: how to deprecate a field without breaking existing Feign clients.',
        'Treat contracts as additive-only: never remove or rename existing JSON fields. Introduce new optional fields, use @Deprecated, publish deprecation headers, and support old payload formats for a sunset period.',
        'system-design',
      ],
      [
        'Evaluate Eureka/Consul service discovery vs Kubernetes native DNS discovery.',
        'In Kubernetes, kube-dns and ClusterIP services provide transparent, language-agnostic load balancing, making application-level discovery agents (Eureka) redundant overhead.',
        'production-engineering',
      ],
      [
        'Analyze Gateway anti-pattern: embedding cross-service data aggregation (e.g. joining User + Order in Gateway).',
        'Embedding domain aggregation creates a bloated gateway bottleneck, coupling infrastructure deployments to multiple domain schemas and multiplying memory overhead.',
        'distributed-systems',
      ],
    ],
    labs: [
      {
        id: 'M5.1-L1',
        title: 'Non-blocking Gateway routing with correlation tracing and Feign propagation',
        minutes: 110,
        objective:
          'Configure Spring Cloud Gateway route predicates with custom reactive GlobalFilter for correlation ID injection, and build a Feign client with header-forwarding RequestInterceptor.',
        context:
          'Requests arriving at the gateway lack distributed tracing headers. Downstream Feign calls drop incoming headers, making production debugging impossible across services.',
        architecture:
          'Client -> Spring Cloud Gateway (Netty, CorrelationFilter) -> OrderService (Spring Boot 4.1) -> OpenFeign (TraceInterceptor) -> InventoryService',
        problem:
          'Implement a reactive CorrelationHeaderFilter that preserves or generates X-Correlation-Id and injects it into mutated ServerWebExchange request headers. Then configure Feign RequestInterceptor in OrderService to forward X-Correlation-Id to InventoryService.',
        starter: `@Component
class CorrelationHeaderFilter : GlobalFilter, Ordered {
  override fun filter(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
    // TODO: Extract or generate UUID, mutate request headers, log, forward
    return chain.filter(exchange)
  }
  override fun getOrder(): Int = Ordered.HIGHEST_PRECEDENCE
}

@Configuration
class FeignConfig {
  @Bean
  fun correlationRequestInterceptor(): RequestInterceptor = RequestInterceptor { template ->
    // TODO: Read MDC or request attributes and forward X-Correlation-Id
  }
}`,
        lang: 'kotlin',
        requirements: [
          'If inbound request contains X-Correlation-Id, preserve it; otherwise generate a new UUIDv4.',
          'Mutate ServerWebExchange request headers non-blockingly without thread-blocking operations.',
          'Feign client forwards X-Correlation-Id on every outbound request.',
          'Actuator route /actuator/gateway/routes returns configured order-service and inventory-service routes.',
        ],
        constraints: [
          'Zero blocking calls in GatewayFilter (no Thread.sleep, no blocking RestTemplate).',
          'Feign connect timeout must be <= 1000ms and read timeout <= 3000ms.',
        ],
        expectedBehaviour:
          'Gateway stamps or preserves X-Correlation-Id, downstream OrderService receives it, and Feign call to InventoryService carries the identical X-Correlation-Id header.',
        testCases: [
          ['Inbound request without X-Correlation-Id', 'Gateway generates UUID, downstream logs same UUID'],
          ['Inbound request with X-Correlation-Id: test-abc-123', 'Preserves test-abc-123 through Gateway and Feign hop'],
          ['Concurrent 50 requests', '50 distinct trace IDs logged without cross-talk'],
        ],
        hiddenFailures: [
          'Calling block() or RestTemplate inside reactive filter deadlocks Netty event loop.',
          'Failing to mutate exchange request leaves original un-stamped request in pipeline.',
        ],
        output:
          'Distributed trace logs in Order and Inventory services showing matching X-Correlation-Id across all hops.',
        hints: [
          'Use exchange.mutate().request(builder.build()).build() to create modified exchange.',
          'Access Spring MVC RequestContextHolder in Feign RequestInterceptor safely.',
        ],
        verification:
          'Send curl -H "X-Correlation-Id: TRACE-999" to gateway and grep TRACE-999 in both order-service and inventory-service logs.',
        explanation:
          'Trace context continuity relies on immutable request mutation in reactive filters and explicit thread-to-header bridging in Feign client interceptors.',
        extension:
          'Add rate limiting filter using Redis token-bucket algorithm at Gateway route level.',
      },
    ],
    debug: [
      debugEx(
        'M5.1-D1',
        'OpenFeign client connections leak under load, throwing java.net.SocketTimeoutException after 20 minutes.',
        'OrderService threads hang on Feign calls to InventoryService until HTTP connection pool exhausts and all worker threads block.',
        [
          'Default Feign client uses HttpURLConnection without connection pooling',
          'Read timeout is set to default infinity or 60 seconds',
          'Downstream inventory-service had a 5-second database lock spike',
          'Actuator metrics show tomcat.threads.busy at 100%',
        ],
        'Identify root cause of connection starvation and reconfigure OpenFeign with connection pool and explicit timeouts.',
        'Default Feign client creates new unpooled connections and blocks indefinitely on stalled responses. The fix is configuring Apache HttpClient5 or OkHttp with pooling and strict connect/read timeouts (1s connect, 2s read).',
        ['jstack <pid> | grep "feign.SynchronousMethodHandler.executeAndDecode"', 'curl -s http://localhost:8081/actuator/metrics/http.client.requests']
      ),
    ],
    failures: [
      {
        id: 'M5.1-F1',
        title: 'Blocking I/O inside Gateway GlobalFilter freezes ingress traffic',
        minutes: 60,
        mode: 'REAL_EXECUTABLE',
        bug: 'A developer added a database lookup inside Gateway GlobalFilter using a blocking JDBC repository call, starving Netty worker threads and causing 504 Gateway Timeout for all routes under 10 req/sec.',
        reproduce: [
          './scripts/load-gateway.sh --concurrency 20 --duration 10s',
          'curl -w "%{http_code} %{time_total}\n" http://localhost:8080/api/v1/orders',
        ],
        observe: [
          'All gateway routes stop responding with HTTP 200 and return 504 Gateway Timeout.',
          'CPU usage is near 0%, but memory and active socket connections climb continuously.',
          'jstack shows Netty event loop threads parked in java.lang.Thread.sleep or socketRead0.',
        ],
        hypotheses: [
          'The downstream order-service crashed.',
          'Netty event loop worker threads are blocked by synchronous blocking I/O in a gateway filter.',
          'Operating system ran out of file descriptors.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: direct curl to order-service on port 8081 responds in 8ms.',
          '#2 rejected: ulimit -n is 65535 and socket count is under 200.',
        ],
        investigate: [
          ['jstack $(pgrep -f gateway) | grep -A 10 "reactor-http-epoll"', 'Netty thread stuck in TokenValidatorJdbc.lookupUser()', 'Blocking JDBC call found on reactive event loop thread.'],
          ['curl -s http://localhost:8080/actuator/health', 'Gateway actuator hangs or times out after 10s', 'Event loop starvation prevents even health check responses.'],
        ],
        debugOptions: [
          'The Netty event loop is blocked by synchronous JDBC call inside the gateway filter chain.',
          'The gateway needs more CPU cores allocated to Netty.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Replace blocking JDBC lookup with reactive R2DBC repository, or delegate validation to non-blocking Redis/JWT signature check, or offload blocking call to Schedulers.boundedElastic().',
          'Increase server.tomcat.threads.max in application.yml.',
        ],
        correctFix: 0,
        fixRejection: [
          'Spring Cloud Gateway runs on Netty, not Tomcat. Adjusting tomcat threads has zero effect.',
        ],
        verify: [
          ['./scripts/load-gateway.sh --concurrency 50 --duration 10s', '100% HTTP 200 responses, p99 latency < 25ms', 'Non-blocking reactive filter handles load without queuing.'],
        ],
        explainPrompt:
          'Explain why blocking calls in reactive Netty filters destroy gateway throughput compared to traditional thread-per-request Tomcat.',
        modelExplanation:
          'Netty operates on an event-loop architecture with typically only 1 or 2 threads per CPU core. In thread-per-request servers like Tomcat, blocking one thread affects only 1 concurrent user among 200 worker threads. In Netty, blocking one event loop thread freezes hundreds or thousands of interleaved multiplexed connections assigned to that core, stalling the entire ingress pipeline.',
        patterns: ['Reactive Event Loop', 'Non-blocking I/O', 'Thread Starvation', 'Gateway Perimeter'],
        dimension: 'performance',
      },
    ],
    design: {
      id: 'M5.1-AC1',
      title: 'Design high-throughput ingress gateway for multi-tenant e-commerce',
      scenario:
        'A retail platform handles 25,000 req/sec across 14 downstream microservices. External clients include web SPAs, native mobile apps, and third-party partner webhooks. Requirements: TLS termination, token verification, tenant-aware rate limiting, canary routing, and zero internal topology leakage.',
      requirements: [
        'Route requests based on path and Host header with tenant context extraction.',
        'Implement distributed token-bucket rate limiting (e.g. 100 req/sec for free, 2000 req/sec for enterprise).',
        'Canary routing rule: route 10% of /api/v1/checkout to order-service-v2 based on header or cookie.',
        'Strict header sanitization: strip internal authorization headers before forwarding to external response.',
      ],
      constraints: [
        'p99 gateway overhead must remain below 4ms.',
        'Zero downstream topology or server header disclosed in error responses.',
      ],
      deliverables: [
        'Gateway route predicate and filter configuration specification.',
        'Rate-limiting architecture using Redis Cluster with fallback on cache outage.',
        'Canary routing strategy with rollback trigger thresholds.',
      ],
      failureModes: [
        'Rate-limiter Redis outage blocks all incoming traffic instead of failing open or degraded.',
        'Gateway filter memory leak buffering large request bodies in memory before forwarding.',
      ],
      tradeoffQuestions: [
        {
          question: 'Should authentication validation occur at the Gateway or inside each downstream service?',
          modelAnswer:
            'Both, following defense-in-depth: the Gateway authenticates the token, enforces rate limits, and rejects malformed/expired JWTs at the perimeter. Downstream services still re-validate the cryptographic signature and enforce domain-level authorization/scopes so internal network pivoting is prevented.',
        },
        {
          question: 'When Redis rate limiter fails, should the gateway fail-open or fail-closed?',
          modelAnswer:
            'Fail-open with high-priority alerting for standard customer routes to avoid catastrophic revenue loss; fail-closed on sensitive public endpoints (like login or payment confirmation) to protect against credential stuffing and brute force attacks.',
        },
      ],
    },
    defense: [
      [
        'Why choose Spring Cloud Gateway over a cloud-managed API gateway (like AWS API Gateway or Kong)?',
        'Spring Cloud Gateway provides deep programmatic integration with Spring Security, Eureka/Consul discovery, Micrometer metrics, and custom Java filter pipelines within the team’s existing JVM deployment lifecycle. However, managed cloud gateways eliminate operating infrastructure, offer native WAF integration, and scale automatically without JVM tuning.',
        'architecture',
        ['Compares operational complexity.', 'Considers team skillset and tech stack.', 'Acknowledges trade-offs honestly.'],
      ],
      [
        'A colleague wants to implement order-total calculation in a Gateway GlobalFilter to save an internal hop. Defend your rejection.',
        'An API Gateway must remain a dumb pipe with smart endpoints. Putting business calculations in the gateway couples gateway deployments to order domain rules, bloats gateway CPU/memory, breaks domain boundaries, and turns the gateway into an unmaintainable distributed monolith.',
        'distributed-systems',
        ['Enforces bounded context separation.', 'Identifies coupling risk.', 'Rejects premature optimization.'],
      ],
    ],
    english: [
      [
        ['reverse proxy', 'A server that sits in front of web servers and forwards client requests to those web servers.', 'The API gateway operates as a non-blocking reverse proxy.'],
        ['client-side load balancing', 'Load balancing where the client queries discovery to select an available instance.', 'OpenFeign uses client-side load balancing via Spring Cloud LoadBalancer.'],
        ['correlation ID', 'A unique identifier passed through every service hop to correlate log entries.', 'We propagate the correlation ID in the X-Correlation-Id header.'],
        ['Netty event loop', 'A single-threaded loop that handles asynchronous events for many concurrent channels.', 'Never execute blocking database queries on the Netty event loop.'],
        ['backward compatibility', 'The ability of a system to accept input produced by older versions of clients.', 'We preserve backward compatibility by keeping deprecated fields additive.'],
      ],
      [
        'The gateway terminates client TLS and inspects the token before forwarding the request.',
        'Missing correlation headers break distributed trace continuity across microservice seams.',
        'We enforce strict timeouts on all Feign declarative HTTP clients.',
      ],
      'Our ingress architecture uses Spring Cloud Gateway on Netty to terminate transport security, stamp W3C correlation IDs, and evaluate token-bucket rate limits before routing. Downstream communication uses OpenFeign with client-side load balancing and explicit connect and read timeouts. We enforce backward compatibility across all public contracts so mobile clients never experience breaking changes during phased deployments.',
      [
        ['Gateway latency spikes under load', 'We verified that a blocking call was introduced into a GlobalFilter, stalling the Netty event loop. We have refactored the filter to be fully reactive.'],
        ['Distributed traces show disconnected spans', 'The Feign client was missing a RequestInterceptor to copy correlation headers from the incoming context to outbound requests.'],
      ],
      [
        'This gateway filter calls a blocking repository; it will starve the Netty event loop.',
        'Please specify explicit connect-timeout and read-timeout on this FeignClient.',
        'This contract change renames a field; please mark the old field as deprecated instead.',
      ],
      [
        'What criteria decide whether logic belongs in the Gateway or a microservice?',
        'How does client-side load balancing handle an instance that terminates unexpectedly?',
        'What is your strategy for canary deployments through the gateway?',
      ],
      [
        'Why is Spring Cloud Gateway built on Netty instead of Tomcat?',
        'How do you propagate security credentials and correlation IDs through Feign?',
        'What are the failure modes of client-side load balancing?',
      ],
      'Spring Cloud Gateway provides an asynchronous, non-blocking ingress layer built on Netty. It routes external traffic to internal microservices based on declarative path and host predicates while enforcing cross-cutting concerns like token validation, rate limiting, and correlation ID injection. By pairing it with OpenFeign and client-side load balancing, we achieve decoupled routing and transparent service communication with end-to-end distributed observability.',
    ],
    ai: [
      'Ask an AI to implement order and user data aggregation inside a Spring Cloud Gateway filter to reduce client latency.',
      'The AI suggests creating an AggregationGatewayFilter that calls UserService and OrderService synchronously using RestTemplate, combines JSON nodes, and writes the response directly.',
      [
        'Using RestTemplate blocks the Netty event loop thread, causing severe throughput collapse.',
        'Aggregating domain data violates gateway responsibilities and couples gateway deployment to both Order and User schemas.',
        'No timeouts or fallback mechanisms are configured for either downstream call.',
        'Error handling is absent: a single downstream failure crashes the combined response.',
      ],
      [
        'Ask how the AI handles 5,000 concurrent requests when RestTemplate blocks on a slow downstream response.',
        'Ask what happens to gateway deployment cadence when OrderService changes its domain schema.',
        'Ask why a dedicated BFF or GraphQL gateway is preferred over putting business logic in an ingress proxy.',
      ],
      'Correct outcome: Reject domain aggregation in the API Gateway. Implement a dedicated Backend-For-Frontend (BFF) service or asynchronous event-driven read model for aggregated views, preserving the Gateway as a lightweight, non-blocking routing and security perimeter.',
    ],
    quiz: [
      ['conceptual', 'What is the primary role of an API Gateway in microservices architecture?', ['Database connection pooling', 'Perimeter routing, security termination, and cross-cutting request filtering', 'Running background batch jobs', 'Executing distributed ACID transactions'], 1, 'The Gateway acts as reverse proxy and security perimeter.'],
      ['code-tracing', 'What happens if Thread.sleep(1000) is called inside a Spring Cloud Gateway GlobalFilter?', ['Only that single request is delayed 1 second', 'The Netty event loop worker thread blocks, delaying all concurrent connections assigned to that thread', 'Tomcat automatically allocates a new thread from the pool', 'The request is diverted to a fallback instance'], 1, 'Netty threads must never be blocked.'],
      ['scenario', 'A downstream service experiences a network partition. Which Feign configuration prevents cascading thread exhaustion?', ['@EnableFeignClients(autoRetry = true)', 'feign.client.config.default.connectTimeout and readTimeout set to low finite values', 'Increasing tomcat max-threads to 10000', 'Disabling SSL validation'], 1, 'Strict timeouts bound resource exhaustion.'],
      ['debugging', 'Distributed tracing in Zipkin shows each service call as an independent root trace. Most likely cause?', ['Zipkin database is full', 'OpenFeign client is missing a RequestInterceptor to propagate correlation / W3C traceparent headers', 'Gateway is running on HTTP/2', 'Kafka partitions are unbalanced'], 1, 'Header propagation is required to stitch trace spans together.'],
      ['design', 'How should a public REST API field be deprecated without breaking existing mobile clients?', ['Delete the field in the next sprint', 'Keep the existing field, add the new field alongside it, and mark the old field deprecated in documentation and response headers', 'Throw HTTP 410 Gone immediately', 'Redirect mobile clients to an external URL'], 1, 'Additive changes preserve backward compatibility.'],
      ['conceptual', 'What advantage does client-side load balancing provide over traditional hardware load balancers?', ['Eliminates the intermediate network hop and hardware load balancer bottleneck', 'Requires zero CPU on client services', 'Guarantees 100% server uptime', 'Automatically patches Linux kernels'], 0, 'Client-side balancing eliminates intermediate hardware proxy hops.'],
      ['code-tracing', 'A Feign client interface is defined without explicit configuration. What is its default retry behavior in Spring Cloud?', ['Infinite retries with exponential backoff', 'Default Retryer.NEVER_RETRY (no retry) or limited retry depending on configuration', 'Retries exactly 10 times on 500 Internal Server Error', 'Switches automatically to UDP'], 1, 'Spring Cloud OpenFeign defaults to Retryer.NEVER_RETRY to avoid retry storms.'],
      ['scenario', 'Why should an API Gateway never query the product database directly?', ['Database queries are illegal in Java', 'It couples the gateway to internal database schemas and breaks service autonomy', 'PostgreSQL does not support gateways', 'Gateway Netty cannot speak TCP'], 1, 'Direct database access destroys service data ownership.'],
      ['conceptual', 'What header is universally recognized by modern distributed tracing tools (W3C standard)?', ['X-Unique-User', 'traceparent', 'X-Session-Token', 'Cookie-Trace'], 1, 'W3C traceparent is the open standard for trace propagation.'],
      ['design', 'When should a team choose a Backend-For-Frontend (BFF) over a generic API Gateway?', ['When the company has fewer than 3 developers', 'When diverse clients (mobile, web, IoT) require radically different payload shapes and protocol aggregations', 'When using MySQL instead of PostgreSQL', 'When all traffic is internal'], 1, 'BFF tailors responses to specific client form-factor needs.'],
    ],
  }),

  expandModule({
    id: 'M5.2',
    phase: 'M5',
    order: 2,
    title: 'Microservices Security: OAuth2, JWT & Identity Propagation',
    subtitle:
      'Stateless asymmetric JWT verification, OAuth2 Resource Server, role/scope-based access control, secure service-to-service communication, and token propagation pitfalls',
    minutes: 200,
    prerequisites: ['M5.1'],
    objective:
      'Implement defense-in-depth microservice security: authenticate at API Gateway, validate asymmetric JWT signatures locally at Resource Servers, enforce method-level @PreAuthorize scopes, and propagate verified claims safely downstream.',
    stack: ['Spring Security 6.4', 'Spring Authorization Server', 'OAuth2 Resource Server', 'Nimbus JOSE JWT', 'OpenFeign'],
    mode: 'SIMULATED',
    why:
      'Microservices without hardened perimeter and internal authorization leak customer data through internal network pivoting. Perimeter authentication at the Gateway alone is insufficient; internal services must enforce zero-trust token validation and granular scope authorization.',
    explanation: [
      'Microservice security relies on OAuth2 and OpenID Connect: the Identity Provider issues digitally signed JSON Web Tokens (JWT); the Gateway verifies and relays tokens; downstream Resource Servers validate signatures via JWKS public keys without calling the IdP on every request.',
      'Traditional stateful session cookies do not scale across dozens of distributed services and require centralized session replication stores. Stateless asymmetric JWTs carry claims and scopes that any service can verify in-memory.',
      'Eliminates session clustering bottlenecks, allows decoupled identity verification, enforces fine-grained authorization (scopes like order:write, user:read), and protects internal endpoints against unauthorized service-to-service access.',
      'The Authorization Server signs JWTs with a private key (RS256); Resource Servers fetch the public key set (/oauth2/jwks) once and cache it; Spring Security NimbusJwtDecoder parses headers, verifies signature, evaluates expiry (exp), and maps claims to GrantedAuthority.',
      'Client requests token with credentials -> IdP issues signed JWT -> Client sends Authorization: Bearer <jwt> to Gateway -> Gateway inspects and forwards -> Resource Server checks signature against cached JWKS -> @PreAuthorize checks hasAuthority("SCOPE_order:write") -> Request executes.',
      'Stateless JWTs provide high throughput and zero session-store lookups; the trade-off is revocation difficulty (cannot invalidate token before exp expires without maintaining a distributed revocation blocklist).',
      'Expired token clock skew rejections; secret key leakage with symmetric algorithms; token replay attacks; missing scope propagation in Feign calls causing unexpected 403 Forbidden; trusting client-supplied headers without signature verification.',
      'Security audit logs, HTTP 401 Unauthorized vs 403 Forbidden ratios, JWKS cache refresh frequency, and token expiration distribution metrics.',
      'Inspect JWT payload using jwt.io (or local CLI debugger), verify exp timestamp against server UTC clock, check Spring Security SecurityContextHolder debug logs, and verify JWKS endpoint connectivity.',
      'Use asymmetric RS256/ES256 with short-lived access tokens (15 mins) and refresh tokens; configure JWT decoder with small clock-skew leeway (e.g. 60s); inject Bearer token into Feign interceptors; enforce method-level @PreAuthorize on all mutating endpoints.',
      'Do not store sensitive data (credit cards, passwords) inside JWT payload (payload is Base64Url encoded, readable by anyone with the token); do not use JWT for simple monolith applications where HTTP-only secure cookies provide superior CSRF protection.',
      'If an attacker compromises an internal microservice, what prevents them from calling the PaymentService and draining user balances without a valid user token?',
    ],
    keys: [
      'Defense-in-depth: Never trust the internal network; validate tokens at every service hop.',
      'Asymmetric signing (RS256) ensures only the IdP holds the private key; resource servers verify with public keys.',
      'JWT payloads are visible to anyone: never place secrets, passwords, or PII in claims.',
      'Short token lifetimes (5–15 minutes) mitigate the lack of instant revocation in stateless JWTs.',
      'Scopes represent permissions granted by the user; roles represent user categorization inside the system.',
      'Service-to-service calls without a user context must use OAuth2 Client Credentials grant.',
    ],
    concepts: [
      [
        'Explain why symmetric signing (HS256) is dangerous in a multi-service architecture.',
        'With HS256, every microservice must possess the shared secret to verify tokens. If a single low-security service is compromised, the attacker gains the secret and can forge administrator tokens for the entire ecosystem.',
        'reliability',
      ],
      [
        'How does an OAuth2 Resource Server verify JWT authenticity without contacting the Authorization Server on every request?',
        'The Resource Server downloads the IdP public JSON Web Key Set (JWKS) at startup, caches the public keys, and verifies the cryptographic signature locally using in-memory CPU calculations.',
        'implementation',
      ],
      [
        'Distinguish OAuth2 Scopes from Application Roles in microservice authorization.',
        'Scopes (e.g., read:orders, write:payments) represent permissions delegated by the user to the client application. Roles (e.g., ROLE_ADMIN, ROLE_CUSTOMER) represent internal identity attributes of the user.',
        'architecture',
      ],
      [
        'Describe the Token Relay pattern in Spring Cloud Gateway.',
        'The Token Relay filter extracts the Authorization: Bearer token from the incoming client request and automatically attaches it to the downstream proxied request headers, preserving identity context across tiers.',
        'system-design',
      ],
      [
        'How should service-to-service background batch jobs authenticate when no human user is present?',
        'Use the OAuth2 Client Credentials Grant (machine-to-machine flow). The service authenticates with its own clientId and clientSecret to obtain a service-scoped access token.',
        'production-engineering',
      ],
      [
        'Analyze the security risk of forwarding user identity via unverified custom headers (e.g., X-User-Id: 12345).',
        'If an internal service trusts X-User-Id without verifying a signed JWT, any compromised service or internal attacker can spoof arbitrary user IDs and access unauthorized resources.',
        'distributed-systems',
      ],
    ],
    labs: [
      {
        id: 'M5.2-L1',
        title: 'Stateless OAuth2 Resource Server configuration and Feign token relay',
        minutes: 110,
        mode: 'SIMULATED',
        objective:
          'Configure a Spring Security 6.4 OAuth2 Resource Server with JWT validation, scope-based method security, and a Feign RequestInterceptor that relays incoming Bearer tokens.',
        context:
          'SIMULATION — Deterministic local JWT verification: The order service needs to accept JWTs signed by an identity provider, enforce order:write scope on creation, and relay the token to inventory-service.',
        architecture:
          'Client (Bearer JWT) -> OrderService (Resource Server, NimbusJwtDecoder) -> FeignClient (TokenRelayInterceptor) -> InventoryService',
        problem:
          'Implement SecurityFilterChain authorizing /api/v1/orders only with SCOPE_order:write. Implement a Feign RequestInterceptor that extracts the Bearer token from the current SecurityContextHolder and injects it into outbound requests.',
        starter: `@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig {
  @Bean
  fun filterChain(http: HttpSecurity): SecurityFilterChain {
    // TODO: Configure stateless session, jwt resource server, and authorizeHttpRequests
    return http.build()
  }
}

@Component
class FeignTokenRelayInterceptor : RequestInterceptor {
  override fun apply(template: RequestTemplate) {
    // TODO: Extract JwtAuthenticationToken from SecurityContext and attach Authorization header
  }
}`,
        lang: 'kotlin',
        requirements: [
          'Session creation policy must be STATELESS (no JSESSIONID cookie).',
          'POST /api/v1/orders requires authority SCOPE_order:write.',
          'GET /actuator/health is publicly accessible without authentication.',
          'FeignTokenRelayInterceptor forwards the incoming Bearer token to all downstream Feign calls.',
        ],
        constraints: [
          'Never store raw JWT in static variables or un-cleared ThreadLocals.',
          'Throw HTTP 401 on missing/invalid token and HTTP 403 on valid token with missing scope.',
        ],
        expectedBehaviour:
          'Valid token with order:write returns 201; valid token with only order:read returns 403 Forbidden; downstream inventory call receives identical Bearer token.',
        testCases: [
          ['Request without Authorization header', 'Returns 401 Unauthorized'],
          ['Request with valid JWT containing scope "order:read"', 'Returns 403 Forbidden on POST /api/v1/orders'],
          ['Request with valid JWT containing scope "order:write"', 'Returns 201 Created and Feign header contains Bearer token'],
        ],
        hiddenFailures: [
          'Using default session management creates server-side HTTP sessions, violating statelessness.',
          'Extracting token from RequestContextHolder fails in asynchronous @Async or reactive threads.',
        ],
        output:
          'Protected API rejecting unauthorized requests and successfully relaying verified claims downstream.',
        hints: [
          'Use http.oauth2ResourceServer { it.jwt { ... } } in Spring Security DSL.',
          'Cast SecurityContextHolder.getContext().authentication to JwtAuthenticationToken.',
        ],
        verification:
          'Execute simulated test suite verifying 401 on empty token, 403 on insufficient scope, and 201 on valid token.',
        explanation:
          'Local JWT signature validation eliminates IdP latency bottlenecks while method-level security ensures fine-grained least-privilege access control.',
        extension:
          'Add custom JwtAuthenticationConverter to map custom claims (roles, tenant_id) to Spring Security authorities.',
      },
    ],
    debug: [
      debugEx(
        'M5.2-D1',
        'Valid JWT tokens are intermittently rejected with 401 Unauthorized due to clock skew between server nodes.',
        'Production users report intermittent login session drops every few hours across load-balanced instances.',
        [
          'Resource server clock drifted 45 seconds ahead of the Authorization Server',
          'Tokens issued with nbf (Not Before) or exp (Expiration) fail validation during the drift window',
          'Default NimbusJwtDecoder has 0 seconds clock skew tolerance',
          'Error log: JwtValidationException: Jwt is not yet active or has expired',
        ],
        'Diagnose the intermittent JWT rejection and configure clock skew tolerance in JwtTimestampValidator.',
        'Clock drift between distributed hosts causes tokens with valid timestamps on one host to be considered not-yet-valid or expired on another. Configure OAuth2TokenValidator with a 60-second clock skew tolerance and synchronize system clocks via NTP.',
        ['ntpdate -q pool.ntp.org', 'curl -v -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/v1/orders']
      ),
    ],
    failures: [
      {
        id: 'M5.2-F1',
        title: 'Unvalidated internal header allows cross-tenant privilege escalation',
        minutes: 60,
        mode: 'SIMULATED',
        bug: 'OrderService reads tenant identity from client-submitted X-Tenant-Id header instead of extracting it from the cryptographically verified JWT claims, allowing any user to view other tenants orders by altering the header.',
        reproduce: [
          'curl -H "Authorization: Bearer <valid-tenant-A-jwt>" -H "X-Tenant-Id: tenant-B" http://localhost:8080/api/v1/orders',
        ],
        observe: [
          'API returns HTTP 200 with sensitive order records belonging to Tenant B.',
          'Audit logs attribute the request to Tenant B despite the JWT being issued for Tenant A.',
          'Security vulnerability reported: Broken Object Level Authorization (BOLA / IDOR).',
        ],
        hypotheses: [
          'The database tenant filter has a SQL injection bug.',
          'The service trusts unverified HTTP request headers over cryptographically signed JWT claims.',
          'The API gateway routed the request to the wrong microservice.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: SQL queries use parameterized JPA repositories.',
          '#2 rejected: Gateway routing table is static and verified.',
        ],
        investigate: [
          ['grep -rn "getHeader(\"X-Tenant-Id\")" services/order-service', 'Found tenantId = request.getHeader("X-Tenant-Id")', 'Unverified header directly feeds database query.'],
          ['grep -rn "SecurityContextHolder" services/order-service', 'SecurityContext is inspected for authentication but claims are ignored', 'Authentication succeeds but authorization uses spoofable input.'],
        ],
        debugOptions: [
          'The controller retrieves tenant identity from spoofable HTTP header instead of verified JWT claims.',
          'The Authorization server issued the wrong tenant claim.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Extract tenant_id exclusively from @AuthenticationPrincipal Jwt jwt.getClaimAsString("tenant_id") and strip client-supplied X-Tenant-Id headers at the gateway.',
          'Add an MD5 hash check on the header value.',
        ],
        correctFix: 0,
        fixRejection: [
          'Hashing client input does not prevent identity spoofing if the client can supply the value.',
        ],
        verify: [
          ['curl -H "Authorization: Bearer <tenant-A-jwt>" -H "X-Tenant-Id: tenant-B" ...', 'Returns only Tenant A orders, ignoring the spoofed header', 'Tenant isolation enforced by cryptographic signature.'],
        ],
        explainPrompt:
          'Explain why internal microservices must derive identity from signed token claims rather than arbitrary HTTP headers.',
        modelExplanation:
          'HTTP headers can be set by any external client unless explicitly stripped by an edge proxy. When microservices rely on custom headers like X-Tenant-Id or X-User-Id, a failure in edge sanitization or an internal network breach allows attackers to impersonate any user. Signed JWT claims cannot be tampered with without invalidating the cryptographic signature.',
        patterns: ['Zero Trust', 'Defense in Depth', 'BOLA / IDOR Prevention', 'Cryptographic Claims'],
        dimension: 'reliability',
      },
    ],
    design: {
      id: 'M5.2-AC1',
      title: 'Design zero-trust microservice security for fintech payment processing',
      scenario:
        'A digital banking platform handles fund transfers, card issuing, and loan applications. Regulators mandate zero-trust architecture: perimeter gateway TLS, mutual TLS (mTLS) between internal pods, short-lived JWTs, automated token revocation, and strict audit logging.',
      requirements: [
        'Design external user authentication flow (OIDC with MFA).',
        'Specify internal service-to-service authentication using OAuth2 Client Credentials + mTLS.',
        'Define strategy for instant token revocation (e.g. lost phone) despite stateless JWTs.',
        'Ensure PCI-DSS compliance: sensitive payment data must never appear in JWT claims or log files.',
      ],
      constraints: [
        'Internal token verification latency must remain under 0.5ms.',
        'Token revocation must take effect globally across all services in less than 5 seconds.',
      ],
      deliverables: [
        'Architecture sequence diagram showing Token Relay and Machine-to-Machine flows.',
        'Stateless JWT vs distributed blacklist trade-off evaluation.',
        'Key rotation protocol for public JWKS without service downtime.',
      ],
      failureModes: [
        'JWKS endpoint outage blocks all internal token verification if keys are not cached with stale-while-revalidate.',
        'Distributed revocation list Redis cluster failure causes either total outage (fail-closed) or security bypass (fail-open).',
      ],
      tradeoffQuestions: [
        {
          question: 'How do you reconcile stateless JWTs with the requirement for instant token revocation?',
          modelAnswer:
            'Use very short-lived access tokens (e.g., 5 minutes) paired with a high-performance distributed Redis bloom filter / blacklist for revoked tokens (e.g. on logout or password change). When a token is revoked, its jti (JWT ID) is written to Redis with a TTL matching the token remaining lifespan. Services check the blacklist only during critical money-moving transactions.',
        },
        {
          question: 'Why combine mTLS with OAuth2 JWT instead of using mTLS alone?',
          modelAnswer:
            'mTLS authenticates the caller machine/service identity (Service A is talking to Service B) and encrypts wire traffic, but it conveys no user context. OAuth2 JWT conveys the user identity and delegated permissions (Alice is executing transfer:create). Combining both provides mutual authentication of both the infrastructure node and the human user.',
        },
      ],
    },
    defense: [
      [
        'A team proposes using 24-hour JWT access tokens to minimize load on the Authorization Server. Argue against.',
        'A 24-hour access token represents a 24-hour window of vulnerability if leaked. Because stateless JWTs cannot be revoked without maintaining a centralized revocation list (which negates the stateless benefit), compromised tokens remain valid for a full day. The industry standard is 5–15 minute access tokens with refresh tokens rotated on every use.',
        'reliability',
        ['Highlights security blast radius.', 'Explains stateless revocation limits.', 'Proposes short-lived tokens + refresh tokens.'],
      ],
      [
        'Why not have every microservice call the Authorization Server /oauth2/introspect endpoint on every request?',
        'Calling /oauth2/introspect on every request converts the Authorization Server into a massive single point of failure and bottleneck, multiplying latency and halving system availability (chain availability drops). Local asymmetric JWT signature verification provides identical security with microsecond in-memory performance.',
        'architecture',
        ['Identifies availability risk.', 'Quantifies latency cost.', 'Defends local cryptographic verification.'],
      ],
    ],
    english: [
      [
        ['asymmetric encryption', 'A cryptographic system using a public key for verification and a private key for signing.', 'We sign JWTs with a private key and verify them asymmetrically with public JWKS keys.'],
        ['token relay', 'The pattern of forwarding an incoming authentication token to downstream services.', 'The gateway implements the token relay pattern to propagate user identity.'],
        ['clock skew', 'The time difference between two computer clocks across a network.', 'We configure a sixty-second clock skew tolerance to prevent premature token expiration.'],
        ['least privilege', 'The security concept of granting only the minimum necessary permissions.', 'We enforce least privilege by requiring granular scopes like order:write instead of full admin rights.'],
        ['identity propagation', 'Carrying the verified caller context through multi-tier microservice chains.', 'Identity propagation ensures downstream services know which user initiated the action.'],
      ],
      [
        'Resource servers validate the cryptographic signature locally without contacting the identity provider.',
        'Never trust client-supplied headers without validating the underlying signed claims.',
        'Short-lived access tokens limit the blast radius of credential compromise.',
      ],
      'Our security model implements defense-in-depth: the API Gateway authenticates users via OAuth2 OpenID Connect and relays signed JWT tokens downstream. Each microservice operates as an independent Resource Server, validating token signatures locally using cached JWKS public keys and enforcing method-level scope authorization with @PreAuthorize. Service-to-service calls use client credentials with mTLS to guarantee zero-trust communication across the cluster.',
      [
        ['Users experience sudden 401 errors across clusters', 'We identified clock drift on three worker nodes exceeding the token expiration boundary. We synchronized NTP and added clock skew tolerance.'],
        ['Downstream service returns 403 Forbidden on valid user token', 'The OpenFeign client was not configured with a RequestInterceptor, dropping the Bearer token before the outbound hop.'],
      ],
      [
        'This endpoint lacks method security; please add @PreAuthorize with the appropriate scope.',
        'Extract tenant identity from the JWT claims, not the unverified request header.',
        'Ensure the token expiration is under fifteen minutes to comply with security standards.',
      ],
      [
        'How does your architecture handle token revocation for stateless JWTs?',
        'What is the difference between OAuth2 scopes and RBAC roles?',
        'How do you secure background jobs that run without an active user session?',
      ],
      [
        'Why is local JWT signature verification preferred over remote token introspection?',
        'How do you prevent broken object level authorization (BOLA) in microservices?',
        'What security risks arise when microservices trust internal network traffic blindly?',
      ],
      'Microservice security demands defense-in-depth and zero-trust verification at every architectural seam. We authenticate users at the ingress gateway and propagate stateless, asymmetrically signed JWTs containing immutable claims and granular scopes. Resource servers verify signatures in-memory using cached public keys, enforcing method-level authorization while eliminating centralized bottlenecks. By combining short-lived tokens, token relay, and machine-to-machine mTLS, we maintain robust security without sacrificing performance.',
    ],
    ai: [
      'Ask an AI to secure an internal microservice that receives requests from an API Gateway.',
      'The AI suggests disabling Spring Security on the internal service, arguing that "the API gateway already authenticated the user, so internal network traffic is completely safe and disabling security improves performance."',
      [
        'Disabling security violates the core Zero-Trust principle and exposes internal APIs to lateral movement attacks.',
        'Any compromised internal pod, developer laptop with VPN access, or rogue container can execute unauthenticated mutations.',
        'Internal services lose the ability to perform fine-grained authorization (e.g. checking user roles or tenant bounds).',
        'Compliance standards (SOC2, PCI-DSS, HIPAA) strictly forbid unauthenticated internal network segments.',
      ],
      [
        'Ask the AI what happens if an attacker exploits an SSRF vulnerability in a public-facing service to query an unsecured internal service.',
        'Ask how the internal service determines which tenant or user is executing a request if security is disabled.',
        'Ask how local in-memory JWT validation impacts latency compared to network latency.',
      ],
      'Correct outcome: Reject perimeter-only security. Enforce defense-in-depth with local stateless JWT verification and method-level @PreAuthorize on all internal microservices.',
    ],
    quiz: [
      ['conceptual', 'Why are stateless JWTs preferred over session cookies in distributed microservices?', ['JWTs can be stored in browser bookmarks', 'They allow services to verify identity independently without a shared session database', 'JWTs are automatically encrypted so nobody can read them', 'Session cookies are deprecated by HTTP/2'], 1, 'Stateless JWTs eliminate centralized session clustering.'],
      ['conceptual', 'Which signing algorithm allows resource servers to verify tokens using only a public key?', ['HS256 (HMAC with SHA-256)', 'RS256 (RSA with SHA-256)', 'Base64Url', 'MD5'], 1, 'RS256 is asymmetric: private key signs, public key verifies.'],
      ['scenario', 'A user logs out, but their JWT access token is valid for 10 more minutes. In a purely stateless system, what happens?', ['The token is immediately deleted from all resource servers', 'The token remains valid until its exp timestamp passes unless a revocation list is checked', 'The user password is automatically changed', 'The browser crashes'], 1, 'Stateless tokens remain valid until expiration.'],
      ['debugging', 'A microservice returns 401 Unauthorized for all tokens issued within the last 30 seconds. Most likely cause?', ['The Authorization Server is down', 'Clock skew between servers causing the token "nbf" (not before) time to be in the future', 'The user has too many roles', 'The token was signed with SHA-1'], 1, 'Server clock drift causes premature token rejections.'],
      ['design', 'How should microservices communicate identity when Service A calls Service B on behalf of a user?', ['Pass user password in header', 'Relay the original verified Authorization: Bearer <jwt> token', 'Send unverified X-User-Id header', 'Create a new database user for every request'], 1, 'Token Relay pattern preserves user context and signature integrity.'],
      ['code-tracing', 'What does @PreAuthorize("hasAuthority(\'SCOPE_order:write\')") check in Spring Security?', ['That the user has the database role SCOPE_order:write', 'That the JWT contains the string "order:write" in its "scope" or "scp" claim', 'That the request method is HTTP POST', 'That the client IP is whitelisted'], 1, 'Spring Security maps OAuth2 scopes to GrantedAuthority with the SCOPE_ prefix.'],
      ['conceptual', 'What is the purpose of the OAuth2 Client Credentials grant?', ['User login via Google or GitHub', 'Machine-to-machine authentication between services without human user context', 'Resetting lost passwords', 'Refreshing expired user tokens'], 1, 'Client Credentials grant is used for service-to-service automation.'],
      ['conceptual', 'What information should NEVER be placed in a standard JWT payload?', ['User ID', 'Token expiration timestamp', 'Plaintext credit card numbers or user passwords', 'Assigned permission scopes'], 2, 'JWT payloads are only Base64 encoded and visible to anyone.'],
      ['design', 'What is the defense-in-depth approach to microservice security?', ['Protect the gateway with a firewall and leave internal services open', 'Authenticate at the gateway AND validate signatures and permissions at every internal service hop', 'Change passwords daily', 'Disable HTTP and only use FTP'], 1, 'Defense in depth requires security validation at every tier.'],
      ['scenario', 'A rogue internal service sends a request to PaymentService with header X-User-Id: admin. What should PaymentService do?', ['Execute the request as admin immediately', 'Ignore or reject unverified headers and derive identity exclusively from verified JWT claims', 'Email the user for confirmation', 'Log the user in with a cookie'], 1, 'Derive identity only from verified cryptographic claims.'],
    ],
  }),

  expandModule({
    id: 'M5.3',
    phase: 'M5',
    order: 3,
    title: 'Payment Processing: Idempotency Keys, Webhook State Machine & Reconciliation',
    subtitle:
      'Order-to-payment lifecycle, deterministic idempotency keys, out-of-order webhook delivery, state transition invariants, and background reconciliation',
    minutes: 210,
    prerequisites: ['M5.2', 'M4.4'],
    objective:
      'Engineer a hardened payment processing workflow: generate deterministic idempotency keys, execute two-phase payment intent creation, handle duplicate and out-of-order webhook events safely, and run reconciliation audits.',
    stack: ['Spring Boot 4.1', 'PostgreSQL', 'Stripe API Simulator', 'Redis Idempotency Store', 'Flyway'],
    mode: 'SIMULATED',
    why:
      'Payments involve asynchronous third-party providers where network timeouts, retries, and duplicate webhooks are daily realities. A system that cannot guarantee idempotency or handle out-of-order state transitions will double-charge customers or deliver orders without payment.',
    explanation: [
      'A payment flow is a distributed state machine spanning the client, internal services, and an external payment provider (PSP): Order -> Payment Intent -> PSP processing -> Asynchronous Webhook -> Internal State Transition -> Order Confirmation.',
      'Synchronous payment requests can time out while the provider actually charged the card. Webhooks deliver asynchronous proof of payment, but webhooks can arrive duplicated, out of order, or delayed by minutes.',
      'Guarantees that a retried checkout never double-charges, ensures duplicate or reordered webhooks do not corrupt the order status, and provides reconciliation jobs to resolve orphan payments.',
      'Client initiates checkout with Idempotency-Key header -> PaymentService records PENDING intent in database in same transaction -> PSP is called with idempotency key -> PSP returns client secret -> Client completes payment -> PSP emits payment_intent.succeeded webhook -> Webhook handler verifies HMAC signature, checks idempotency record, and updates payment state atomically.',
      'If webhook arrives twice: second execution finds state already SUCCEEDED or sees idempotency record, acknowledges with HTTP 200, and takes no action. If network times out: background sweeper polls PSP reconciliation API to resolve UNKNOWN intents.',
      'Idempotency tables and webhook signature checks add a database write per intent, but they provide absolute mathematical safety against double-charging and race conditions.',
      'Webhook arrives before intent commit completes (race condition); duplicate webhook triggers duplicate fulfillment; out-of-order webhook (FAILED arrives after SUCCEEDED); network timeout leaves payment in ambiguous state; forged webhook payload.',
      'Payment transition latency, webhook delivery retry counts, orphan intent counts (stuck in PENDING > 15m), and reconciliation divergence discrepancies.',
      'Query payment_intents table by order_id and idempotency_key, inspect PSP webhook delivery event logs, compare PSP ledger with database rows, and verify HMAC secret configuration.',
      'Store idempotency keys in PostgreSQL with a UNIQUE constraint; verify webhook HMAC-SHA256 signature before processing; enforce strict state machine transitions (PENDING -> SUCCEEDED cannot transition to FAILED); write reconciliation job.',
      'Do not rely solely on in-memory or Redis caches for payment idempotency without durable database backing; Redis eviction can delete keys and reopen double-charge windows.',
      'A customer clicks Pay, the connection drops after 5 seconds, and your payment-service received a timeout. Was the customer charged? What state do you set in the database, and what does the UI show?',
    ],
    keys: [
      'SIMULATION — NOT REAL STRIPE EXECUTION: All payment and webhook behaviors are deterministic simulations.',
      'Every payment request must carry a client-generated or order-derived Idempotency-Key.',
      'Webhooks are untrusted until verified using cryptographic HMAC signatures.',
      'Payment state transitions must follow a strict, one-way state machine; illegal transitions are rejected.',
      'Duplicate webhooks must return HTTP 200 immediately without re-triggering business side-effects.',
      'An automated reconciliation job is mandatory to resolve ambiguous or orphaned payment intents.',
    ],
    concepts: [
      [
        'Explain why an Idempotency-Key must be stored in the same ACID transaction as the state mutation.',
        'If the idempotency record is saved in a separate transaction (or Redis) after the payment effect, a crash between the two leaves the effect committed but unrecorded, allowing a retried request to execute a second duplicate charge.',
        'data',
      ],
      [
        'How does a webhook signature verify that the payload originated from the legitimate payment gateway?',
        'The provider computes an HMAC-SHA256 hash using the raw payload body, a timestamp, and a shared webhook signing secret. The receiver recomputes the HMAC and verifies that it matches the signature header.',
        'reliability',
      ],
      [
        'Describe the out-of-order webhook dilemma: payment_intent.succeeded arrives before payment_intent.created is committed.',
        'Network jitter can deliver events out of chronological sequence. The receiver must handle missing preliminary states gracefully, using upserts or locking until the intent record exists, never discarding valid success proofs.',
        'distributed-systems',
      ],
      [
        'Why must a webhook endpoint always return HTTP 200 even for duplicate events?',
        'Payment providers retry webhooks with exponential backoff on any non-2xx status. If your endpoint returns 409 or 500 for a duplicate event, the provider will repeatedly hammer your server for days.',
        'implementation',
      ],
      [
        'Design a background reconciliation worker for payments stuck in UNKNOWN status.',
        'A scheduled worker queries payment records stuck in PENDING or PROCESSING for longer than 15 minutes, calls the provider retrieval API to fetch authoritative status, updates local state, and compensates or confirms.',
        'system-design',
      ],
      [
        'What is the risk of using auto-incrementing integer IDs as payment references with third-party providers?',
        'Sequential IDs leak transaction volume and business velocity to competitors and can be guessed by attackers. Always use UUIDv4 or structured random prefixes (e.g., pi_ord_8f9a2b).',
        'architecture',
      ],
    ],
    labs: [
      {
        id: 'M5.3-L1',
        title: 'Idempotent webhook handler with signature validation and state transitions',
        minutes: 120,
        mode: 'SIMULATED',
        objective:
          'SIMULATION: Build an idempotent payment webhook controller in Spring Boot that validates HMAC signatures, ignores duplicate deliveries, and transitions order state safely.',
        context:
          'Payment providers deliver webhooks at-least-once. Network glitches and retries mean identical webhooks hit the endpoint concurrently. Duplicate processing triggers duplicate order fulfillment.',
        architecture:
          'PSP Simulator (Webhook POST) -> WebhookController (HMAC Verification) -> PaymentService (Idempotency + State Machine) -> PostgreSQL',
        problem:
          'Implement processWebhook(signature, payload): verify the HMAC-SHA256 signature against webhookSecret. If signature fails, return 400. If valid, check if the event ID was already processed. If already processed, return 200 immediately without updating order. Otherwise, update payment to SUCCEEDED and publish payment-succeeded event atomically.',
        starter: `@RestController
@RequestMapping("/api/v1/webhooks/payments")
class PaymentWebhookController(
  private val paymentService: PaymentService,
  @Value("\${payment.webhook.secret}") private val webhookSecret: String
) {
  @PostMapping
  fun handleWebhook(
    @RequestHeader("Stripe-Signature") signature: String,
    @RequestBody payload: String
  ): ResponseEntity<String> {
    // TODO: Verify HMAC signature, process idempotently, return 200
    return ResponseEntity.ok("Received")
  }
}`,
        lang: 'kotlin',
        requirements: [
          'Verify HMAC-SHA256 signature; return 400 Bad Request on signature mismatch.',
          'Enforce idempotency on event.id: duplicate event returns HTTP 200 with zero side effects.',
          'Transition payment state from PENDING to SUCCEEDED atomically; reject illegal transitions.',
          'Return HTTP 200 within 2000ms to avoid provider delivery timeout.',
        ],
        constraints: [
          'No external calls inside database transaction.',
          'Idempotency check and state transition must execute within one database transaction.',
        ],
        expectedBehaviour:
          'First webhook execution updates payment to SUCCEEDED; second identical webhook execution returns HTTP 200 and leaves database state unchanged.',
        testCases: [
          ['Webhook with invalid signature', 'Returns 400 Bad Request'],
          ['Valid payment_intent.succeeded webhook', 'Returns 200 OK, payment becomes SUCCEEDED'],
          ['Replay identical webhook 100ms later', 'Returns 200 OK, event processed count remains 1'],
        ],
        hiddenFailures: [
          'Checking idempotency without a database row lock or unique constraint allows concurrent duplicate webhooks to both pass.',
          'Parsing JSON before verifying signature exposes endpoint to JSON parser denial of service.',
        ],
        output:
          'Simulated test execution verifying signature validation, successful state transition, and duplicate replay suppression.',
        hints: [
          'Use Mac.getInstance("HmacSHA256") to compute expected signature over raw payload bytes.',
          'Use PostgreSQL ON CONFLICT DO NOTHING on processed_events table.',
        ],
        verification:
          'Run test suite executing 20 parallel webhook deliveries with the same event ID; verify exactly one fulfillment triggered.',
        explanation:
          'Idempotent webhook ingestion relies on cryptographic authentication of source, atomic deduplication at the datastore, and monotonic state machine transitions.',
        extension:
          'Add a dead-letter queue (DLQ) for unparseable or unrecognized webhook event types.',
      },
    ],
    debug: [
      debugEx(
        'M5.3-D1',
        'Customer reports double credit card charge after clicking Checkout button twice during a network delay.',
        'Payment gateway shows two distinct charges for the same order, but internal database only recorded one order row.',
        [
          'Frontend generates a new Idempotency-Key on every button click instead of per checkout intent',
          'First request timed out after 4 seconds; user clicked button again',
          'Payment service received two distinct idempotency keys from client',
          'PSP treated the two requests as independent charges',
        ],
        'Identify where the idempotency key derivation broke and fix the key lifecycle.',
        'Idempotency keys must be tied to the checkout session or order ID, not generated randomly per HTTP button click attempt. When retrying a failed or timed-out checkout, the client must resend the original idempotency key so the PSP deduplicates the charge.',
        ['grep "Idempotency-Key" services/payment-service/src/main/resources/logs', 'SELECT * FROM payment_intents WHERE order_id = ?']
      ),
    ],
    failures: [
      {
        id: 'M5.3-F1',
        title: 'Webhook arrives twice in parallel race condition double-delivering order',
        minutes: 65,
        mode: 'SIMULATED',
        bug: 'The webhook processing code performed a SELECT to check if event was processed, followed by an INSERT, without a unique constraint or row lock. Two concurrent deliveries both found no record and executed order fulfillment twice.',
        reproduce: [
          './scripts/simulate-parallel-webhooks.sh --event-id evt_test_123 --threads 2',
          'SELECT count(*) FROM order_fulfillments WHERE event_id = \'evt_test_123\'',
        ],
        observe: [
          'Two fulfillment warehouse jobs created for the single payment event.',
          'Database shows two duplicate payment settlement records with identical transaction IDs.',
          'Customer inventory decremented twice.',
        ],
        hypotheses: [
          'Stripe sent two different payments for the order.',
          'Check-then-act race condition in webhook deduplication logic allowed concurrent threads to both proceed.',
          'Kafka consumer group partition rebalance duplicated the message.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: both webhooks have identical event_id and payment_intent_id.',
          '#2 rejected: webhooks are received over HTTP before any Kafka message is published.',
        ],
        investigate: [
          ['grep -A 5 "findProcessedEvent" services/payment-service', 'Found if (!repo.existsById(id)) { repo.save(new ProcessedEvent(id)); fulfill(); }', 'Classic check-then-act concurrency flaw.'],
          ['SELECT conname FROM pg_constraint WHERE conrelid = \'processed_events\'::regclass', 'No UNIQUE constraint on event_id column', 'Database was missing the enforcement mechanism.'],
        ],
        debugOptions: [
          'Check-then-act concurrency race condition without database unique constraint.',
          'Webhook secret was configured incorrectly.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Add a UNIQUE constraint on processed_events(event_id) and use atomic INSERT ON CONFLICT DO NOTHING inside a transactional boundary.',
          'Add a Java synchronized block to the controller method.',
        ],
        correctFix: 0,
        fixRejection: [
          'Java synchronized only protects a single JVM instance and fails completely across multi-pod deployments.',
        ],
        verify: [
          ['./scripts/simulate-parallel-webhooks.sh --event-id evt_test_999 --threads 10', 'Exactly 1 fulfillment job created, 9 duplicates return 200 without effect', 'Database constraint safely collapses concurrent replays.'],
        ],
        explainPrompt:
          'Explain why application-level deduplication without database constraints fails in multi-instance microservices.',
        modelExplanation:
          'In a cloud deployment running multiple service replicas, application-level checks like "if (!exists) { save(); }" are separated by network and database roundtrips. When two identical requests hit two different pods simultaneously, both pods execute the select query before either has committed the insert. Only an atomic database-level unique constraint or lock can serialize concurrent writers and guarantee idempotency.',
        patterns: ['Idempotency Consumer', 'Check-Then-Act Flaw', 'Atomic Deduplication', 'Payment State Machine'],
        dimension: 'data',
      },
    ],
    design: {
      id: 'M5.3-AC1',
      title: 'Design resilient multi-PSP payment orchestrator with automated reconciliation',
      scenario:
        'An enterprise platform processes $50M/month across two payment providers (Stripe and Adyen) for failover. The system must support smart routing, seamless failover on provider degradation, idempotent retries, zero double-charges, and a daily automated reconciliation engine.',
      requirements: [
        'Model the payment state machine: CREATED -> INTENT_STORED -> ROUTED -> AUTHORIZED -> CAPTURED | FAILED | REFUNDED.',
        'Design an abstraction layer decoupling business code from vendor-specific webhook structures.',
        'Specify an automated nightly reconciliation workflow that balances internal ledgers against provider settlement files (CSV/JSON).',
        'Handle ambiguous timeout states (e.g. HTTP 504 from PSP on charge request).',
      ],
      constraints: [
        'Zero tolerance for double-charging under any retry or failover circumstance.',
        'Reconciliation must flag ledger discrepancies within 24 hours of settlement.',
      ],
      deliverables: [
        'State transition diagram with guards against backwards transitions.',
        'PSP failover strategy ensuring a timed-out request on Provider A is never blindly retried on Provider B without verification.',
        'Reconciliation audit algorithm detecting missing webhooks or orphaned intents.',
      ],
      failureModes: [
        'Blind failover: Provider A times out, orchestrator charges customer on Provider B, but Provider A actually processed the charge, resulting in a double-charge.',
        'Reconciliation job fails silently on currency rounding discrepancies.',
      ],
      tradeoffQuestions: [
        {
          question: 'If Provider A times out during charge execution, why can you NOT immediately retry on Provider B?',
          modelAnswer:
            'A network timeout means the request outcome is UNKNOWN: Provider A may have charged the card before the response was lost. Retrying immediately on Provider B guarantees a double-charge if Provider A succeeded. The orchestrator must query Provider A using the original idempotency key or reverse the authorization before attempting Provider B.',
        },
        {
          question: 'How does the system recover if a webhook is permanently dropped by network issues?',
          modelAnswer:
            'A background reconciliation sweeper queries all payment intents stuck in PENDING or PROCESSING status after 15 minutes and polls the provider API directly. Additionally, nightly settlement report ingestion reconciles all transactions against the provider authoritative financial ledger.',
        },
      ],
    },
    defense: [
      [
        'Why not use Two-Phase Commit (2PC) between the order database and the payment provider?',
        'External third-party payment providers do not support 2PC or distributed XA transactions, and 2PC couples availability to the slowest participant across the public Internet. Instead, we use local transactions, deterministic idempotency keys, asynchronous webhooks, and compensating transactions (refunds/cancellations).',
        'distributed-systems',
        ['Explains why 2PC is technically impossible with external APIs.', 'Highlights availability coupling.', 'Proposes SAGA and compensation.'],
      ],
      [
        'Why should the webhook handler respond with HTTP 200 before executing expensive downstream order fulfillment logic?',
        'Payment providers enforce strict HTTP response timeouts (typically 5 seconds) and retry aggressively if exceeded. The webhook endpoint must verify the signature, record the event in the database, publish an internal event, and return HTTP 200 immediately. Heavy business logic is executed asynchronously by event consumers.',
        'architecture',
        ['Recognizes webhook timeout constraints.', 'Decouples ingestion from execution.', 'Prevents retry floods.'],
      ],
    ],
    english: [
      [
        ['idempotency key', 'A unique token sent with a request to ensure identical requests execute only once.', 'The client sends an idempotency key to prevent accidental duplicate payments.'],
        ['webhook', 'An automated HTTP callback sent by an external service when an event occurs.', 'Stripe delivers a payment_intent.succeeded webhook when the payment is confirmed.'],
        ['reconciliation', 'The process of comparing internal database records against external financial statements.', 'Our nightly reconciliation sweeper identifies orphan intents.'],
        ['HMAC signature', 'A cryptographic hash used to verify both the data integrity and authenticity of a message.', 'We verify the HMAC signature before processing any webhook payload.'],
        ['settlement', 'The final transfer of funds from the customer bank to the merchant account.', 'The order is marked as settled once the payment webhook confirms the charge.'],
      ],
      [
        'Every mutating payment request must include a deterministic idempotency key.',
        'Webhooks are inherently asynchronous and can arrive out of order or duplicated.',
        'A network timeout does not mean the payment failed; it means the outcome is unknown.',
      ],
      'Our payment architecture models payments as a formal state machine spanning intent creation, authorization, and asynchronous webhook confirmation. All payment requests carry an idempotency key derived from the order session to prevent double-charging on network retries. Inbound webhooks are authenticated via HMAC-SHA256 signatures, deduplicated through atomic database constraints, and processed within strict timeout budgets. A nightly reconciliation worker compares internal ledgers against provider settlement files to catch any dropped events.',
      [
        ['Customer reports duplicate charges on their credit card', 'The frontend regenerated the idempotency key on retry. We fixed the key derivation so retries reuse the original session key.'],
        ['Webhook endpoint returns 500 during high traffic', 'The webhook handler was executing synchronous inventory reservation inside the HTTP thread. We moved fulfillment to an asynchronous Kafka consumer.'],
      ],
      [
        'Ensure the idempotency key is persisted atomically with the payment intent record.',
        'Verify the HMAC signature on the raw payload before parsing the JSON body.',
        'Reject any state transition from SUCCEEDED back to PENDING.',
      ],
      [
        'How do you handle a payment timeout when calling an external provider?',
        'What prevents duplicate processing when two identical webhooks arrive simultaneously?',
        'How does your system reconcile lost webhooks?',
      ],
      [
        'Why are distributed transactions impossible with external payment gateways?',
        'How do you design a payment state machine that survives out-of-order webhook delivery?',
        'What is your recovery strategy when a payment provider suffers an extended outage?',
      ],
      'Payment engineering requires absolute determinism under network instability. We treat all external provider calls as potentially ambiguous and eliminate duplicate mutations through client-generated idempotency keys. Webhooks are cryptographically authenticated via HMAC, ingested idempotently using atomic database constraints, and decoupled from heavy downstream fulfillment. By combining an explicit payment state machine with automated reconciliation sweepers, we ensure financial consistency without distributed transactions.',
    ],
    ai: [
      'Ask an AI to implement payment retry logic when a credit card charge times out after 10 seconds.',
      'The AI proposes a retry loop that immediately calls the payment provider charge endpoint 3 times in a for-loop, generating a random UUID as the payment ID on each iteration.',
      [
        'Generating a new UUID on each retry converts a single charge attempt into 3 separate charges, guaranteeing that the customer is billed multiple times.',
        'Immediate retries without exponential backoff or jitter overwhelm the provider during downstream latency spikes.',
        'The solution assumes a timeout means the charge failed, ignoring the reality that the provider may have already captured funds.',
        'No idempotency key is reused across attempts.',
      ],
      [
        'Ask the AI what happens if attempt 1 succeeded on the provider but the response timed out over the network.',
        'Ask how the payment gateway distinguishes a retried request from a second deliberate purchase.',
        'Ask why financial systems require stable idempotency keys across all retries of the same intent.',
      ],
      'Correct outcome: Retries must always reuse the original stable Idempotency-Key. If a charge request times out, query the provider retrieval API to inspect the existing intent status before attempting any new execution.',
    ],
    quiz: [
      ['conceptual', 'What is the primary function of an Idempotency-Key in payment processing?', ['Encrypting the customer credit card number', 'Allowing safe request retries without executing duplicate financial transactions', 'Speeding up database queries', 'Bypassing 3D-Secure authentication'], 1, 'Idempotency keys prevent duplicate charges on retries.'],
      ['conceptual', 'Why must webhook payloads be verified using HMAC-SHA256 signatures?', ['To compress the payload size', 'To prove the webhook was sent by the legitimate provider and was not forged or tampered with by an attacker', 'To enable SSL encryption', 'To format the JSON correctly'], 1, 'HMAC verifies authenticity and payload integrity.'],
      ['scenario', 'A payment intent is in PENDING status. A webhook arrives reporting SUCCEEDED. What is the correct database action?', ['Delete the payment intent row', 'Update payment status to SUCCEEDED and trigger fulfillment atomically inside a transaction', 'Do nothing and wait for user to refresh browser', 'Send an email to support'], 1, 'Transition state and record fulfillment atomically.'],
      ['code-tracing', 'Two identical payment webhooks arrive simultaneously at two separate service pods. What prevents duplicate fulfillment?', ['A Java synchronized method', 'A database UNIQUE constraint on the processed_events(event_id) column with atomic insert', 'Restarting both pods', 'Relying on Linux file locks'], 1, 'Database constraints enforce uniqueness across distributed pods.'],
      ['scenario', 'When a payment provider call times out after 10 seconds, what is the immediate status of the transaction?', ['FAILED (safe to refund)', 'UNKNOWN (must be verified via retrieval API or reconciliation before taking action)', 'CANCELLED', 'SUCCEEDED'], 1, 'A timeout represents an unknown distributed outcome.'],
      ['design', 'Why should a webhook controller return HTTP 200 before executing heavy downstream inventory logic?', ['HTTP 200 is required by the HTML standard', 'To prevent the payment provider from timing out and re-delivering duplicate webhooks in an aggressive retry loop', 'Because Spring Boot cannot run background tasks', 'To clear the browser cookies'], 1, 'Quick 200 responses prevent provider retry loops.'],
      ['code-tracing', 'What happens if a webhook handler returns HTTP 500 when it encounters a duplicate event?', ['The provider considers the webhook failed and retries repeatedly with exponential backoff', 'The provider cancels the user credit card', 'The database drops the table', 'The user is logged out'], 0, 'Non-2xx codes trigger provider redelivery.'],
      ['scenario', 'What is the purpose of an automated payment reconciliation job?', ['Mining cryptocurrency', 'Detecting discrepancies between internal payment records and provider settlement ledgers', 'Generating marketing emails', 'Testing network cable latency'], 1, 'Reconciliation detects missing or dropped transactions.'],
      ['conceptual', 'Why is Two-Phase Commit (2PC) rarely used with third-party payment gateways?', ['External gateways do not participate in XA transactions, and 2PC couples availability to the public network', '2PC is deprecated in Java 21', 'Credit cards only support UDP', 'PostgreSQL does not support transactions'], 0, 'External APIs do not support distributed XA locking.'],
      ['design', 'Where should the idempotency key be generated for a customer checkout flow?', ['On the database server after the order is saved', 'On the client or checkout session coordinator prior to the first payment attempt', 'By the credit card chip', 'By the DNS server'], 1, 'The key must be established before the first attempt to enable retries.'],
    ],
  }),

  expandModule({
    id: 'M5.4',
    phase: 'M5',
    order: 4,
    title: 'Polyglot Persistence: Relational, Document, Search & Cache-Aside Invalidation',
    subtitle:
      'PostgreSQL ACID guarantees, MongoDB document aggregates, Elasticsearch full-text projections, and Redis cache-aside invalidation patterns',
    minutes: 200,
    prerequisites: ['M4.1', 'M4.2'],
    objective:
      'Select, model, and operate the right datastore for each access pattern: relational PostgreSQL for transactional orders, MongoDB for variable-schema product catalogues, Elasticsearch for search, and Redis with cache-aside and mutex locking against cache stampede.',
    stack: ['PostgreSQL 17', 'MongoDB 7', 'Elasticsearch 8', 'Redis 7', 'Spring Data'],
    mode: 'REAL_EXECUTABLE',
    why:
      'No single database optimizes for relational transactional invariants, deeply nested polymorphic aggregates, full-text inverted index searches, and sub-millisecond key-value lookups simultaneously. Misapplying datastores leads to database sprawl, consistency lag, and operational nightmares.',
    explanation: [
      'Polyglot persistence assigns each business capability to a datastore matching its access pattern: PostgreSQL for ACID transactions and relational constraints; MongoDB for dynamic document aggregates; Elasticsearch for faceted search; Redis for cache-aside and rate limiting.',
      'Relational databases struggle with polymorphic schemas and unbounded joins; document stores struggle with cross-collection relational integrity; search engines cannot guarantee immediate ACID durability; in-memory caches lose data on eviction.',
      'Enables high-throughput sub-millisecond reads via caching, rich full-text querying without table scans, schema flexibility for polymorphic catalogues, and ironclad transactional consistency for financial mutations.',
      'PostgreSQL uses MVCC with WAL logging; MongoDB uses WiredTiger document store with B-trees; Elasticsearch builds Lucene inverted indexes with segment merging; Redis runs an in-memory single-threaded event loop with asynchronous persistence.',
      'Order creation writes to PostgreSQL -> Outbox publishes OrderCreated -> CDC / Kafka updates Elasticsearch projection and invalidates Redis cache -> Read requests check Redis cache-aside -> on miss, read from PostgreSQL/MongoDB and populate Redis with TTL.',
      'You buy optimized latency, rich search, and decoupled scaling; you pay with eventual consistency, dual-write challenges, distributed data sync pipelines, and operational burden of managing multiple clusters.',
      'Cache stampede (thundering herd on key expiry); cache penetration (querying non-existent IDs); cache avalanche (simultaneous TTL expiration); dual-write inconsistency (database succeeds, cache invalidation fails); Elasticsearch projection lag.',
      'Cache hit/miss ratios, Redis memory usage (eviction policy metrics), Elasticsearch indexing lag, and database slow-query logs.',
      'Check Redis TTLs with TTL key, monitor Redis slowlog, inspect PostgreSQL pg_stat_activity and lock waits, and check Elasticsearch cluster health (/ _cluster/health).',
      'Use Cache-Aside with probabilistic early expiration or distributed mutex locks (SingleFlight) to prevent stampede; set randomized jitter on TTLs; invalidate caches transactionally using CDC outbox; use Bloom filters to prevent cache penetration.',
      'Do not use Redis as a primary system of record; do not use Elasticsearch for primary transaction commits; do not use MongoDB if data is heavily relational with foreign keys spanning collections; do not adopt polyglot persistence without dedicated ops capacity.',
      'A product price changes in PostgreSQL, but Redis serves the old price for 10 minutes and Elasticsearch shows the old price in search. How do you guarantee cache invalidation and bounded projection lag without distributed transactions?',
    ],
    keys: [
      'Choose the datastore for the query pattern, not because of industry hype.',
      'PostgreSQL is the source of truth for transactional money and order state.',
      'Redis cache-aside must handle cache stampede, penetration, and avalanche.',
      'Elasticsearch is a derived read model, rebuildable at any time from the primary database.',
      'Never update a database and cache in two separate uncoordinated steps (dual-write problem).',
      'Every cache key must carry an explicit Time-To-Live (TTL) with jitter.',
    ],
    concepts: [
      [
        'Explain the Cache Stampede (Thundering Herd) problem and how a distributed mutex solves it.',
        'When a hot cache key expires under 1,000 req/sec, all 1,000 concurrent requests miss the cache and hit the database simultaneously, causing a database crash. A distributed mutex allows only one worker to query the database and repopulate the cache, while others wait.',
        'reliability',
      ],
      [
        'Why is deleting a cache key on update safer than updating the cached value directly?',
        'Updating the cache directly can cause stale data under concurrent writes: if Thread 1 writes to DB then pauses, Thread 2 writes to DB and updates cache, and Thread 1 then updates cache, the cache holds Thread 1 stale value indefinitely. Deleting the key guarantees the next read fetches fresh data.',
        'data',
      ],
      [
        'When is MongoDB the WRONG choice for an e-commerce microservice?',
        'When the domain requires multi-entity ACID transactions across different aggregate boundaries, strict foreign key referential integrity, or when relations are many-to-many. Relational models fit PostgreSQL far better.',
        'architecture',
      ],
      [
        'How does Change Data Capture (CDC) with Debezium eliminate the dual-write problem between PostgreSQL and Elasticsearch?',
        'Instead of application code writing to PostgreSQL and then making an HTTP call to Elasticsearch (which can fail), CDC tails the PostgreSQL WAL log and streams committed mutations to Kafka, guaranteeing eventual consistency without dual writes.',
        'distributed-systems',
      ],
      [
        'Differentiate Cache Penetration from Cache Avalanche.',
        'Cache Penetration occurs when requests query keys that do not exist in the database (bypassing cache and hitting DB every time). Cache Avalanche occurs when hundreds of cached keys share the exact same TTL and expire simultaneously.',
        'performance',
      ],
      [
        'Analyze when Redis is inappropriate as a message broker compared to Apache Kafka.',
        'Redis Pub/Sub has no persistent offset tracking, message durability, or consumer replay; messages sent when a subscriber is down are permanently lost. Kafka provides durable partition logs, replayability, and consumer group offset management.',
        'system-design',
      ],
    ],
    labs: [
      {
        id: 'M5.4-L1',
        title: 'Redis Cache-Aside with Mutex Locking against Cache Stampede',
        minutes: 110,
        objective:
          'Implement a production-grade Cache-Aside service in Spring Boot using Redis: fetch from cache, on cache miss acquire a Redis distributed lock to query PostgreSQL and populate cache with jittered TTL.',
        context:
          'A flash sale product page receives 5,000 req/sec. When the cache expires, all 5,000 requests hammer PostgreSQL simultaneously, exhausting the database connection pool.',
        architecture:
          'Client -> ProductService (Spring Boot) -> Redis (Cache + Distributed Lock) -> PostgreSQL (Source of Truth)',
        problem:
          'Implement getProduct(id): check Redis key "product:{id}". If present, return. If missing, acquire distributed lock "lock:product:{id}" with 3s TTL. Only the lock winner queries PostgreSQL and writes to Redis with a TTL of 300s + random jitter. Other threads poll with backoff or return stale fallback.',
        starter: `@Service
class CachedProductService(
  private val redisTemplate: StringRedisTemplate,
  private val productRepo: ProductRepository,
  private val objectMapper: ObjectMapper
) {
  fun getProduct(id: UUID): ProductDto? {
    // TODO: Cache lookup -> Mutex lock on miss -> DB query -> Cache write with TTL + jitter
    return null
  }
}`,
        lang: 'kotlin',
        requirements: [
          'Return cached JSON if key exists in Redis (sub-millisecond latency).',
          'On cache miss, only one thread acquires Redis lock (SET NX PX 3000) and queries PostgreSQL.',
          'Add randomized TTL jitter (e.g., 300s + rand(0..60)s) to prevent simultaneous expiration.',
          'Release the distributed lock safely using a Lua script matching the lock token.',
        ],
        constraints: [
          'PostgreSQL must never receive more than 1 concurrent query for the same product ID during a miss.',
          'Lock must auto-expire in 3000ms if the holding node crashes.',
        ],
        expectedBehaviour:
          'Under 100 concurrent requests for an uncached product, exactly 1 query executes on PostgreSQL; all 100 callers receive the valid product.',
        testCases: [
          ['Warm cache request', 'Returns in < 2ms, zero database queries executed'],
          ['Cold cache 50 concurrent requests', 'Exactly 1 database query executed, 50 callers receive product'],
          ['Product update executes', 'Deletes Redis key; subsequent read re-populates cache'],
        ],
        hiddenFailures: [
          'Releasing lock without checking token allows slow thread to release another thread lock.',
          'Hardcoded identical TTL on all products causes cache avalanche at T+TTL.',
        ],
        output:
          'Benchmark metrics showing single database query under concurrent stampede condition.',
        hints: [
          'Use redisTemplate.opsForValue().setIfAbsent(lockKey, token, Duration.ofMillis(3000)).',
          'Use Lua script: if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end.',
        ],
        verification:
          'Simulate 100 concurrent requests against uncached key; verify pg_stat_statements records exactly 1 select.',
        explanation:
          'Cache-aside with mutex locking serializes database queries on cache misses, transforming potential thundering-herd outages into bounded, predictable latency.',
        extension:
          'Add a Bloom filter check before checking cache to prevent cache penetration for invalid product IDs.',
      },
    ],
    debug: [
      debugEx(
        'M5.4-D1',
        'Redis memory reaches maxmemory limit, triggering OOM command not allowed errors across all services.',
        'Production Redis cluster begins throwing OOM errors on write operations; cache writes fail and session logins drop.',
        [
          'Redis maxmemory-policy was left at default "noeviction"',
          'Application wrote search query caches without explicit TTLs',
          'Keys accumulated over 6 months until 16GB RAM was exhausted',
          'Info memory shows used_memory: 17179869184, evicted_keys: 0',
        ],
        'Diagnose the eviction failure, configure appropriate eviction policy (allkeys-lru or volatile-lru), and enforce TTLs.',
        'With noeviction policy, Redis returns errors on mutating commands when memory is full. Configure maxmemory-policy volatile-lru or allkeys-lru and audit the application to ensure all cache writes specify a finite TTL.',
        ['redis-cli INFO memory', 'redis-cli CONFIG GET maxmemory-policy']
      ),
    ],
    failures: [
      {
        id: 'M5.4-F1',
        title: 'Cache Stampede crashes PostgreSQL during high-traffic product flash sale',
        minutes: 60,
        mode: 'REAL_EXECUTABLE',
        bug: 'A product cache key expired at 10:00:00 AM with 2,000 concurrent active users. Every thread missed cache and executed an un-cached database query with three JOINs, exhausting the PostgreSQL connection pool and taking down the checkout API.',
        reproduce: [
          './scripts/load-test.sh --endpoint /api/v1/products/flash-deal --concurrency 100',
          'redis-cli DEL product:flash-deal',
        ],
        observe: [
          'PostgreSQL connection pool exhausted: HikariPool-1 - Connection is not available, request timed out after 30000ms.',
          'API latency spikes from 3ms to 30,000ms, followed by HTTP 500 errors.',
          'Database CPU reaches 100% with dozens of active queries for the same product ID.',
        ],
        hypotheses: [
          'PostgreSQL server suffered disk corruption.',
          'Cache stampede occurred because cache-miss logic had no mutex lock to coordinate database reads.',
          'The application has a memory leak.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: PostgreSQL error log shows no disk or WAL errors.',
          '#2 rejected: JVM heap usage is stable at 25%.',
        ],
        investigate: [
          ['SELECT count(*), query FROM pg_stat_activity GROUP BY query', 'Found 95 identical queries: SELECT * FROM products WHERE id = ?', '95 threads querying identical record simultaneously.'],
          ['grep -A 8 "getProduct" services/catalogue-service', 'Found if (cached == null) { return db.findById(id); }', 'No locking or synchronization on cache miss.'],
        ],
        debugOptions: [
          'Uncoordinated cache miss causes thundering herd database contention.',
          'Hikari connection pool size is too small.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Implement distributed lock (Redis SET NX) or singleflight pattern on cache miss so only one thread queries the database, while others wait.',
          'Increase Hikari maximum-pool-size to 5,000.',
        ],
        correctFix: 0,
        fixRejection: [
          'Increasing connection pool to 5,000 would cause catastrophic PostgreSQL context-switching thrashing and kernel CPU starvation.',
        ],
        verify: [
          ['./scripts/load-test.sh --endpoint /api/v1/products/flash-deal --concurrency 200', 'p99 latency < 15ms, database sees exactly 1 query during cache refresh', 'Cache stampede completely mitigated.'],
        ],
        explainPrompt:
          'Explain the physics of cache stampede and why increasing database connection pool size makes the problem worse.',
        modelExplanation:
          'When thousands of requests miss the cache simultaneously, increasing the database connection pool allows hundreds of heavy queries to run concurrently. PostgreSQL processes each connection in a separate OS process; hundreds of concurrent queries cause severe CPU thrashing, lock contention, and disk I/O saturation, turning a temporary cache miss into a complete database outage. The correct solution is concurrency control at the cache layer using mutex locks.',
        patterns: ['Cache Stampede', 'SingleFlight Pattern', 'Distributed Mutex', 'Pool Sizing'],
        dimension: 'performance',
      },
    ],
    design: {
      id: 'M5.4-AC1',
      title: 'Design polyglot persistence architecture for 10M product e-commerce catalogue',
      scenario:
        'An international e-commerce catalogue features 10 million products with polymorphic attributes (electronics, clothing, groceries), multi-lingual full-text search, sub-millisecond price/stock queries, and transactional order checkout. Requirements: no cross-database distributed transactions, bounded eventual consistency, and zero data loss on primary writes.',
      requirements: [
        'Assign product catalogue, search index, shopping cart, and order transactions to appropriate datastores.',
        'Design data synchronization pipeline from PostgreSQL (system of record) to Elasticsearch and Redis.',
        'Define the caching invalidation strategy and SLA for price updates.',
        'Detail disaster recovery and reindexing strategy for Elasticsearch from scratch.',
      ],
      constraints: [
        'Checkout must read authoritative stock from transactional store.',
        'Elasticsearch projection lag must remain below 3 seconds under 500 writes/sec.',
      ],
      deliverables: [
        'Data store architecture matrix matching data types to storage engines.',
        'Change Data Capture (CDC) pipeline diagram with Kafka and Debezium.',
        'Zero-downtime Elasticsearch index alias rotation and reindexing plan.',
      ],
      failureModes: [
        'Dual-write failure: PostgreSQL commits product price update, but application crashes before updating Redis and Elasticsearch, leaving stale data permanently.',
        'Elasticsearch cluster red state halts product search globally.',
      ],
      tradeoffQuestions: [
        {
          question: 'Why not write directly to both PostgreSQL and Elasticsearch inside the application service method?',
          modelAnswer:
            'Dual-writing inside the application cannot guarantee atomicity: if the database commits but the network call to Elasticsearch times out (or the JVM crashes between the two), the search index diverges permanently from the database. Using Transactional Outbox or CDC (Debezium) guarantees that only committed database mutations are published to Kafka and projected to Elasticsearch.',
        },
        {
          question: 'When is MongoDB preferred over PostgreSQL for product catalogue storage?',
          modelAnswer:
            'When products have deeply polymorphic, unstructured attributes (e.g. clothing has size/color/fabric, laptops have CPU/RAM/ports, food has ingredients/expiry) that change frequently. Storing this in PostgreSQL requires complex JSONB indexing or unwieldy EAV (Entity-Attribute-Value) anti-patterns, whereas MongoDB natively models dynamic document aggregates.',
        },
      ],
    },
    defense: [
      [
        'A junior engineer suggests caching entire database tables in Redis to speed up all queries. Your answer?',
        'Caching is not a substitute for proper indexing and database design. Caching entire tables introduces severe cache invalidation complexity, burns expensive RAM, risks stale reads, and creates catastrophic failure modes when the cache empties. We only cache high-frequency, read-heavy query access patterns with explicit TTLs and measured cache-hit utility.',
        'architecture',
        ['Rejects indiscriminate caching.', 'Emphasizes RAM cost and invalidation burden.', 'Prioritizes database indexing.'],
      ],
      [
        'Your team lead wants to make Elasticsearch the primary system of record for products to avoid running PostgreSQL. Argue for or against.',
        'I strongly advise against making Elasticsearch the primary system of record. Elasticsearch is a search engine optimized for full-text querying and aggregations, not transactional ACID consistency. It does not support multi-document transactions, foreign key constraints, or immediate read-your-writes guarantees (it has a default 1-second refresh interval). A primary database like PostgreSQL must remain the authoritative source of truth, with Elasticsearch treated as a derived read projection.',
        'data',
        ['Distinguishes search engine from system of record.', 'Cites ACID and refresh interval constraints.', 'Protects data integrity.'],
      ],
    ],
    english: [
      [
        ['cache stampede', 'A condition where simultaneous cache misses overwhelm the underlying database.', 'We applied a distributed mutex to protect the database from a cache stampede.'],
        ['cache aside', 'A caching pattern where the application code coordinates cache lookups and database reads.', 'The service implements cache-aside with a 5-minute TTL.'],
        ['time to live', 'The duration for which a cached entry remains valid before being expired.', 'We added randomized jitter to the time-to-live to prevent simultaneous expiration.'],
        ['change data capture', 'The process of capturing committed changes from a database transaction log.', 'Debezium captures PostgreSQL mutations and streams them to Kafka.'],
        ['inverted index', 'A database data structure mapping words to their locations in document collections.', 'Elasticsearch uses an inverted index to deliver sub-second text search.'],
      ],
      [
        'PostgreSQL serves as our authoritative system of record for all transactional mutations.',
        'Every cached entity must specify an explicit Time-To-Live with randomized jitter.',
        'Search indices are derived read projections and must be deterministically rebuildable.',
      ],
      'Our polyglot persistence architecture assigns each workload to its optimal storage engine: PostgreSQL provides ACID consistency for orders and financial balances, MongoDB stores polymorphic product specifications as documents, and Elasticsearch provides full-text search. We manage caching using Redis cache-aside with distributed mutex locking to prevent cache stampedes under high concurrency. Projections are kept consistent using asynchronous Change Data Capture rather than error-prone dual writes.',
      [
        ['Database crashed during flash sale product launch', 'All threads missed cache simultaneously upon key expiration. We resolved this by implementing distributed mutex locks on cache misses.'],
        ['Search results display stale product prices', 'The application was using dual writes that failed intermittently. We migrated to an automated Debezium CDC pipeline reading PostgreSQL WAL logs.'],
      ],
      [
        'Apply randomized jitter to this TTL to prevent a cache avalanche.',
        'Do not update the cache directly here; delete the key and let cache-aside repopulate it.',
        'Ensure the Elasticsearch mapping is versioned with an alias for zero-downtime reindexing.',
      ],
      [
        'How do you prevent cache stampedes when a critical cache key expires?',
        'Why are dual writes considered an anti-pattern in distributed data architectures?',
        'What criteria determine whether data belongs in PostgreSQL or MongoDB?',
      ],
      [
        'How does Change Data Capture guarantee eventual consistency across polyglot stores?',
        'What are the trade-offs between cache invalidation and cache expiration?',
        'How do you rebuild an Elasticsearch cluster from scratch in production without downtime?',
      ],
      'Polyglot persistence matches specific data access characteristics to specialized storage engines without compromising data integrity. PostgreSQL provides transactional durability for core business invariants, MongoDB handles polymorphic document aggregates, and Elasticsearch serves full-text and faceted queries. To prevent the notorious dual-write vulnerability, we synchronize derived stores through asynchronous Change Data Capture pipelines while protecting read layers with mutex-guarded Redis cache-aside patterns.',
    ],
    ai: [
      'Ask an AI to update a product price in PostgreSQL and immediately update Elasticsearch and Redis.',
      'The AI suggests writing code inside a single @Transactional method that calls productRepository.save(), then elasticsearchTemplate.save(), and then redisTemplate.opsForValue().set(), claiming it guarantees full consistency.',
      [
        'Spring @Transactional only manages the PostgreSQL database connection; it has zero transactional control over Elasticsearch or Redis.',
        'If the Elasticsearch call fails or times out, the database transaction might still commit, leaving Elasticsearch out of sync.',
        'If the method throws an exception after the DB save, Redis and Elasticsearch remain in inconsistent states.',
        'Dual-writing inside application logic is a fundamental distributed systems anti-pattern.',
      ],
      [
        'Ask the AI what happens if the JVM crashes immediately after productRepository.save() commits.',
        'Ask how Spring @Transactional rolls back a network call already sent to Elasticsearch.',
        'Ask why the Outbox pattern or Change Data Capture is required for multi-store synchronization.',
      ],
      'Correct outcome: Reject application-level dual-writing across heterogeneous datastores. Commit mutations exclusively to the primary PostgreSQL store and propagate changes to Redis (invalidation) and Elasticsearch (projection) via Transactional Outbox or Debezium CDC.',
    ],
    quiz: [
      ['conceptual', 'What is the primary danger of the Dual-Write pattern across different databases?', ['It takes twice as much disk space', 'Network or process failures cause partial writes, leaving databases permanently out of sync', 'Databases require the same password', 'Dual writes are only supported in Python'], 1, 'Dual writes lack atomicity and cause data divergence.'],
      ['conceptual', 'How does adding randomized jitter to cache TTLs improve system resilience?', ['It compresses cache entries in memory', 'It prevents all cached keys from expiring at the exact same second (cache avalanche)', 'It encrypts the cached data', 'It speeds up Redis network sockets'], 1, 'Jitter spreads out cache expirations over time.'],
      ['scenario', 'A product cache key expires. 500 requests arrive at the same millisecond. What pattern protects the database?', ['Creating 500 new database threads', 'Cache-aside with a distributed mutex lock (SingleFlight) so only 1 request queries the DB', 'Restarting Redis', 'Deleting the product record'], 1, 'Mutex locks serialize cache misses.'],
      ['conceptual', 'Why is Elasticsearch considered a derived read model rather than a system of record?', ['It cannot run on Linux', 'It is optimized for search with eventual consistency and can be rebuilt from the primary database', 'It only stores numbers', 'It requires daily reformatting'], 1, 'Elasticsearch is a rebuildable query projection.'],
      ['debugging', 'Redis throws "OOM command not allowed when used memory > maxmemory". First fix?', ['Add more RAM immediately and do nothing else', 'Configure an eviction policy (e.g. volatile-lru) and ensure all cache keys have explicit TTLs', 'Disable Redis password', 'Delete all database tables'], 1, 'Eviction policies and TTLs prevent unbounded RAM growth.'],
      ['conceptual', 'Why should an application delete a cache key on update instead of setting the new value directly?', ['Deleting is faster than writing', 'It prevents concurrent write race conditions where older data overwrites newer data', 'Redis forbids updating keys', 'JSON cannot be modified in place'], 1, 'Deletion avoids stale concurrent overwrite races.'],
      ['design', 'Which database is best suited for storing financial transaction ledgers requiring strict ACID compliance?', ['MongoDB without replica set', 'PostgreSQL with relational constraints and transactional isolation', 'Redis without persistence', 'Elasticsearch with 1 shard'], 1, 'Relational ACID databases guarantee financial consistency.'],
      ['design', 'What technology allows streaming PostgreSQL committed mutations to Kafka without application dual-writes?', ['Debezium Change Data Capture (CDC)', 'Spring MVC interceptor', 'Cron job running SELECT every second', 'Log4j file appender'], 0, 'Debezium tails the WAL log to capture changes reliably.'],
      ['conceptual', 'What is Cache Penetration?', ['The cache is too fast for the CPU', 'Requests for non-existent keys bypass the cache and repeatedly hit the database', 'A hacker stealing Redis passwords', 'Writing cache keys to disk'], 1, 'Querying non-existent IDs repeatedly hits the DB.'],
      ['scenario', 'When should a team avoid using MongoDB for a microservice?', ['When data consists of polymorphic JSON documents', 'When the business logic requires strict cross-collection relational joins and ACID constraints across entities', 'When using JavaScript', 'When traffic is higher than 10 req/sec'], 1, 'Relational dependencies are better modeled in SQL.'],
    ],
  }),

  expandModule({
    id: 'M5.5',
    phase: 'M5',
    order: 5,
    title: 'High-Performance gRPC: Protobuf Contracts & Low-Latency Internal RPC',
    subtitle:
      'Protocol Buffers schema definition, HTTP/2 multiplexing, streaming RPCs, deadline propagation, error mapping, and REST vs gRPC performance benchmarks',
    minutes: 190,
    prerequisites: ['M5.1'],
    objective:
      'Implement low-latency internal microservice communication using gRPC and Protobuf: define strict binary contracts, configure deadline propagation, handle status codes, and benchmark throughput/serialization efficiency against JSON/REST.',
    stack: ['gRPC 1.68', 'Protocol Buffers v3', 'HTTP/2', 'Netty', 'Order & Inventory Services'],
    mode: 'SIMULATED',
    why:
      'Internal synchronous calls over HTTP/1.1 JSON suffer from text parsing overhead, head-of-line blocking, and lack of typed contract enforcement. gRPC provides compact binary serialization, persistent multiplexed HTTP/2 streams, and built-in cancellation deadlines.',
    explanation: [
      'gRPC is an open-source high-performance RPC framework developed by Google; it uses Protocol Buffers (protobuf) as its interface definition language and binary serialization mechanism, running over multiplexed HTTP/2 transport.',
      'REST over HTTP/1.1 JSON requires repetitive textual serialization, large payload overhead, and one TCP connection per concurrent request (or connection head-of-line blocking). gRPC enables multiplexed streams, strongly-typed contracts, and built-in cancellation.',
      'Dramatically reduces CPU overhead of JSON parsing, cuts network bandwidth by 4x–10x with binary encoding, eliminates TCP connection thrashing via HTTP/2 multiplexing, and prevents runaway cascades using deadline propagation.',
      'Protobuf compiler (protoc) generates strongly typed stubs; client invokes stub method like a local call; payload is serialized to binary protobuf; HTTP/2 frames (HEADERS, DATA) multiplex across single persistent TCP socket; server Netty handler decodes and invokes implementation.',
      'Client creates ManagedChannel -> makes stub call with deadline (withDeadlineAfter(500, MILLISECONDS)) -> HTTP/2 stream opened -> binary protobuf payload sent -> server checks deadline context -> executes logic -> returns binary response or io.grpc.Status error.',
      'You buy sub-millisecond serialization, multiplexed connections, and strict compile-time contracts; you pay with loss of human-readable JSON payloads, difficulty in browser-direct invocation, and complex L7 load balancing requirements.',
      'HTTP/2 L4 proxy load balancing pitfall (all requests pinned to single pod because TCP connection stays open); deadline exceeded cascades; changing protobuf field numbers breaking backward compatibility; unhandled StatusRuntimeException crashing threads.',
      'gRPC client and server metrics (grpc.server.processing.duration, grpc.server.call.started), HTTP/2 connection count, and gRPC status code distribution (OK, DEADLINE_EXCEEDED, NOT_FOUND).',
      'Use grpc_cli or postman gRPC client to query reflection API (/grpc.reflection.v1alpha.ServerReflection), inspect protobuf wire bytes, and check deadline propagation headers (grpc-timeout).',
      'Deploy L7 load balancers (Envoy, Kube service mesh) to balance individual HTTP/2 streams across pods; always attach deadlines to Context; map domain exceptions to canonical io.grpc.Status codes; never change existing protobuf field tags.',
      'Do not use gRPC for public-facing web clients where browser HTTP/2 gRPC-web support is awkward; do not use gRPC when human-readable JSON and standard REST toolchains (Swagger/Postman) are essential for third-party developer ecosystems.',
      'A gRPC client connects to a Kubernetes Service with 5 replicas, but all traffic hits only 1 pod. Why does standard Kubernetes ClusterIP load balancing fail with gRPC, and how do you fix it?',
    ],
    keys: [
      'SIMULATION — Executable Protobuf contract models and deterministic latency simulations.',
      'Protobuf field tags (numbers) define binary wire format: NEVER change or reuse an existing field tag.',
      'gRPC runs over HTTP/2: multiple concurrent requests multiplex over a single long-lived TCP connection.',
      'Standard Kubernetes L4 load balancers fail with gRPC; you must use L7 proxies (Envoy) or client-side balancing.',
      'Deadlines must be propagated across service chains; when a client cancels, downstream work must abort.',
      'Map domain exceptions to standard gRPC Status codes (NOT_FOUND, ALREADY_EXISTS, DEADLINE_EXCEEDED).',
    ],
    concepts: [
      [
        'Explain why standard Kubernetes ClusterIP (L4) load balancing fails to distribute gRPC requests across multiple pods.',
        'Kubernetes ClusterIP operates at Layer 4 (TCP). Because gRPC opens a single persistent HTTP/2 TCP connection and multiplexes all requests over it, the L4 proxy routes the entire connection to one pod, starving other replicas. An L7 proxy (like Envoy) is required to balance individual HTTP/2 streams.',
        'production-engineering',
      ],
      [
        'How does Protocol Buffers achieve backward and forward compatibility without sending field names over the wire?',
        'Protobuf identifies fields exclusively by numerical tags (e.g., string sku = 1). When new fields are added with new tags, older clients simply skip unrecognized tags. If a field tag is changed or reused, binary parsing corrupts silently.',
        'system-design',
      ],
      [
        'Describe Deadline Propagation and how it prevents wasted computation in microservice chains.',
        'When a client initiates a request with a 500ms deadline, that deadline is passed in headers (grpc-timeout) down the entire call chain. If 400ms has elapsed by the time Service C is called, Service C knows it only has 100ms remaining, and aborts immediately if the deadline expires.',
        'distributed-systems',
      ],
      [
        'Compare Protobuf binary serialization vs JSON text serialization in terms of CPU and memory.',
        'Protobuf encodes fields using varints and binary offsets with zero string parsing or float-to-text formatting. JSON requires extensive string parsing, quotation parsing, and character escaping, consuming up to 6x more CPU and generating significant garbage collection churn.',
        'performance',
      ],
      [
        'What are the four communication patterns supported by gRPC?',
        'Unary RPC (single request, single response), Server Streaming (single request, stream of responses), Client Streaming (stream of requests, single response), and Bidirectional Streaming (stream of requests and responses concurrently).',
        'architecture',
      ],
      [
        'How should domain errors like "Resource Not Found" be represented in gRPC?',
        'Never return HTTP 200 with an error object inside the protobuf body. Throw or return io.grpc.Status.NOT_FOUND.asRuntimeException() with descriptive metadata so the client receives a standardized status code.',
        'implementation',
      ],
    ],
    labs: [
      {
        id: 'M5.5-L1',
        title: 'Order to Inventory gRPC service with Deadline Propagation and Error Mapping',
        minutes: 110,
        mode: 'SIMULATED',
        objective:
          'SIMULATION: Define a Protobuf inventory reservation contract, implement the gRPC server service with canonical error mapping, and build a client with deadline propagation.',
        context:
          'SIMULATED LAB: High-volume checkout needs low-latency synchronous inventory reservation. REST/JSON consumes excessive CPU on serialized line items. Implement a typed gRPC service.',
        architecture:
          'OrderService (gRPC Client with Deadline) --[HTTP/2 Protobuf]--> InventoryService (gRPC Server with Netty)',
        problem:
          'Define InventoryService.proto: rpc ReserveStock(ReserveRequest) returns (ReserveResponse). Implement the InventoryGrpcService: if stock is insufficient, return Status.FAILED_PRECONDITION. If SKU is unknown, return Status.NOT_FOUND. On client side, execute the call with a 1000ms deadline and catch StatusRuntimeException.',
        starter: `// proto/inventory.proto
syntax = "proto3";
package inventory.v1;

message ReserveRequest {
  string order_id = 1;
  string sku = 2;
  int32 quantity = 3;
}

message ReserveResponse {
  string reservation_id = 1;
  bool success = 2;
}

service InventoryService {
  rpc ReserveStock (ReserveRequest) returns (ReserveResponse);
}`,
        lang: 'protobuf',
        requirements: [
          'Protobuf definition defines ReserveStock unary RPC with explicit field tags 1, 2, 3.',
          'Server implementation returns Status.NOT_FOUND for invalid SKU.',
          'Server implementation returns Status.FAILED_PRECONDITION if available stock < quantity.',
          'Client configures stub withDeadlineAfter(1000, TimeUnit.MILLISECONDS).',
        ],
        constraints: [
          'Never catch general Exception and return empty response; propagate StatusRuntimeException.',
          'Field tags must never be renumbered in revisions.',
        ],
        expectedBehaviour:
          'Valid reservation returns binary ReserveResponse with reservation_id in < 5ms; out of stock throws Status.FAILED_PRECONDITION; expired deadline throws Status.DEADLINE_EXCEEDED.',
        testCases: [
          ['Reserve 2 units of available SKU', 'Returns ReserveResponse with success=true and reservation_id'],
          ['Reserve SKU with zero stock', 'Throws StatusRuntimeException with code FAILED_PRECONDITION'],
          ['Server simulated delay of 1500ms against 1000ms deadline', 'Client receives DEADLINE_EXCEEDED within 1005ms'],
        ],
        hiddenFailures: [
          'Reusing field tag 1 for a new field breaks wire decoding for existing deployed services.',
          'Omitting deadline allows client threads to hang indefinitely if inventory service stalls.',
        ],
        output:
          'Simulated gRPC client execution demonstrating unary call, deadline enforcement, and error mapping.',
        hints: [
          'Use responseObserver.onNext(response) followed by responseObserver.onCompleted().',
          'For errors use responseObserver.onError(Status.NOT_FOUND.withDescription("SKU not found").asRuntimeException()).',
        ],
        verification:
          'Execute deterministic benchmark comparing gRPC protobuf serialization vs JSON serialization for 1,000 items.',
        explanation:
          'gRPC pairs strict binary schemas with HTTP/2 transport to deliver typed, low-latency inter-service calls with native cancellation semantics.',
        extension:
          'Add a server streaming RPC rpc StreamStockUpdates(StockQuery) returns (stream StockUpdate).',
      },
    ],
    debug: [
      debugEx(
        'M5.5-D1',
        'gRPC client throws io.grpc.StatusRuntimeException: DEADLINE_EXCEEDED after downstream database slows down.',
        'OrderService checkout transactions fail with DEADLINE_EXCEEDED during inventory check; logs show downstream completed 20ms after client aborted.',
        [
          'Client deadline was set to tight 200ms',
          'Downstream inventory database experienced 220ms garbage collection pause',
          'Downstream service continued executing the database write even though client had already cancelled the call',
          'OrderService aborted, but inventory committed reservation, creating orphaned stock reservations',
        ],
        'Diagnose the uncoordinated cancellation and attach Context cancellation listener on the server side.',
        'When a client deadline expires, the client cancels the HTTP/2 stream. The server must check Context.current().isCancelled() or register a cancellation listener to immediately abort ongoing database transactions and prevent orphaned mutations.',
        ['grep "DEADLINE_EXCEEDED" services/order-service/logs', 'jstat -gcutil <inventory_pid> 1000']
      ),
    ],
    failures: [
      {
        id: 'M5.5-F1',
        title: 'Protobuf field tag collision silently corrupts stock reservation quantities',
        minutes: 65,
        mode: 'SIMULATED',
        bug: 'A developer renumbered protobuf field tags in InventoryService.proto (changing "quantity" from tag 3 to tag 2, and "sku" to tag 3) without updating all clients simultaneously. The server parsed incoming SKU strings as integer quantities, causing zero reservations and silent data corruption.',
        reproduce: [
          './scripts/simulate-proto-drift.sh --client-proto-v1 --server-proto-v2',
        ],
        observe: [
          'Inventory reservations succeed with quantity = 0 regardless of requested amount.',
          'Stock quantities do not decrement, allowing massive overselling.',
          'No exceptions or error codes thrown; Protobuf wire deserialization succeeded silently.',
        ],
        hypotheses: [
          'The database trigger was disabled.',
          'Field tag numbers were reordered in the .proto contract, corrupting wire deserialization between client and server.',
          'A malicious SQL injection attack reset quantities to zero.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: database triggers are verified active.',
          '#2 rejected: database audit logs show parameterized queries with value 0.',
        ],
        investigate: [
          ['diff client/proto/inventory.proto server/proto/inventory.proto', 'Found client has sku=2, quantity=3; server has quantity=2, sku=3', 'Field tags were renumbered.'],
          ['protoc --decode_raw < sample_wire.bin', 'Tag 2 contains string instead of expected varint', 'Binary wire format mismatch confirmed.'],
        ],
        debugOptions: [
          'Field tag renumbering broke Protobuf wire backward compatibility.',
          'Network packet corruption altered the payload bytes.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Restore original field tag numbers (sku = 2, quantity = 3), use `reserved` keyword for deprecated fields, and add a CI proto-breaking-change check (e.g. Buf).',
          'Switch back to JSON REST everywhere.',
        ],
        correctFix: 0,
        fixRejection: [
          'Switching architectures avoids learning contract hygiene and does not fix the deployed corrupted state.',
        ],
        verify: [
          ['buf breaking --against .git#branch=main', 'CI passes: zero breaking changes detected', 'Proto compatibility enforced by linter.'],
        ],
        explainPrompt:
          'Explain why Protocol Buffers relies on field numbers instead of field names and what rules govern safe schema evolution.',
        modelExplanation:
          'Protocol Buffers achieves extreme speed and small payload size by omitting field names from the binary wire format entirely. Data is encoded solely as (field_number << 3 | wire_type) followed by the value. If field numbers change, the parser assigns data to the wrong fields without error. Safe evolution rules mandate: never change an existing field tag, never reuse a deleted tag (use the `reserved` keyword), and make all new fields optional.',
        patterns: ['Protobuf Wire Format', 'Contract Evolution', 'Backward Compatibility', 'Buf Linter'],
        dimension: 'system-design',
      },
    ],
    design: {
      id: 'M5.5-AC1',
      title: 'Design hybrid public REST and internal gRPC architecture for financial trading',
      scenario:
        'A financial platform provides a public REST/JSON API for third-party mobile and web developers, but executes internal trade execution, risk checks, and ledger mutations via gRPC over an internal Envoy-managed service mesh. Requirements: sub-5ms internal execution, strict deadline budgets, end-to-end tracing, and seamless error translation from gRPC to RFC-7807 Problem Details.',
      requirements: [
        'Design Gateway translation layer converting external REST HTTP requests to internal gRPC calls.',
        'Establish an error mapping table translating io.grpc.Status codes to HTTP status codes and RFC-7807 problem details.',
        'Define a deadline budget allocation strategy across 3 internal service hops (Gateway -> Order -> Risk -> Ledger).',
        'Configure L7 Envoy load balancing for HTTP/2 gRPC streaming.',
      ],
      constraints: [
        'Total end-to-end latency budget is 50ms.',
        'If Risk service times out, Ledger must never execute.',
      ],
      deliverables: [
        'Architecture topology diagram highlighting the REST-to-gRPC boundary.',
        'Complete gRPC-to-HTTP status code translation specification.',
        'Proto contract repository structure with automated CI breaking change detection.',
      ],
      failureModes: [
        'REST Gateway translates gRPC DEADLINE_EXCEEDED to HTTP 500 instead of HTTP 504 Gateway Timeout, misleading client retry logic.',
        'Missing context cancellation listener causes Ledger service to complete trades after user cancelled.',
      ],
      tradeoffQuestions: [
        {
          question: 'Why not expose gRPC directly to public web browsers instead of using REST at the perimeter?',
          modelAnswer:
            'Web browsers cannot natively initiate arbitrary HTTP/2 framing required by standard gRPC without an intermediary proxy (like gRPC-Web) and specialized client libraries. Furthermore, public third-party developers expect familiar JSON REST semantics, OpenAPI/Swagger documentation, and standard curl testability.',
        },
        {
          question: 'How do you allocate deadline budgets across a multi-hop microservice chain?',
          modelAnswer:
            'Use deadline subtraction: if the external client has a 2000ms timeout, the gateway allocates 1800ms to OrderService (retaining 200ms for network/serialization overhead). OrderService sets a 1200ms deadline on RiskService, which in turn sets an 800ms deadline on Ledger. Each service subtracts its own processing budget and propagates the remaining time.',
        },
      ],
    },
    defense: [
      [
        'A team member argues that JSON over HTTP/1.1 is "fast enough" and gRPC adds unnecessary complexity. How do you respond?',
        'For simple CRUD applications with low traffic, JSON REST is indeed sufficient. But at scale (thousands of requests/sec), JSON text serialization consumes 30–50% of CPU cycles and creates significant garbage collection pauses. gRPC cuts CPU overhead by 5x, reduces network bandwidth by up to 80%, and provides compile-time contract enforcement and native deadline propagation. We adopt gRPC specifically for high-throughput, low-latency internal service-to-service communication.',
        'performance',
        ['Acknowledges validity of REST for simple systems.', 'Quantifies CPU, bandwidth, and GC benefits.', 'Targets gRPC to appropriate internal boundaries.'],
      ],
      [
        'How do you debug a production gRPC issue if you cannot inspect the payload in plaintext using standard tools like tcpdump?',
        'Modern debugging tools easily handle gRPC: we enable gRPC Server Reflection in staging to inspect schemas via grpc_cli; we use Wireshark or Envoy access logs configured with protobuf decoders; and we rely on distributed tracing (Micrometer / OpenTelemetry) to inspect structured span attributes and status codes without needing to inspect raw binary packets.',
        'debugging',
        ['Cites reflection tools.', 'Mentions Envoy and Wireshark decoding.', 'Relies on distributed tracing.'],
      ],
    ],
    english: [
      [
        ['Protocol Buffers', 'A language-neutral, platform-neutral extensible mechanism for serializing structured data.', 'We define our service interfaces using Protocol Buffers version 3.'],
        ['deadline propagation', 'The mechanism where request time limits are forwarded across distributed hops.', 'Deadline propagation prevents downstream services from processing expired requests.'],
        ['HTTP/2 multiplexing', 'Interleaving multiple bidirectional request and response streams over a single TCP connection.', 'HTTP/2 multiplexing eliminates the head-of-line blocking found in HTTP/1.1.'],
        ['status code mapping', 'Translating canonical RPC status codes to equivalent transport or domain codes.', 'We map io.grpc.Status.NOT_FOUND to HTTP 404 Not Found at the gateway.'],
        ['field tag', 'The unique integer identifying a field in the binary protobuf wire format.', 'Never change an existing field tag in a production protobuf contract.'],
      ],
      [
        'Protobuf contracts enforce compile-time safety and eliminate runtime schema ambiguity.',
        'Always configure explicit deadlines to prevent runaway downstream execution.',
        'Kubernetes ClusterIP cannot balance gRPC traffic without an L7 proxy like Envoy.',
      ],
      'Our internal inter-service communication utilizes gRPC over HTTP/2 to achieve high-throughput, low-latency data exchange with minimal CPU serialization overhead. Service contracts are strictly defined in Protocol Buffers with automated CI checks to prevent breaking changes. We enforce end-to-end deadline propagation across all unary calls, ensuring that cancelled or timed-out requests immediately abort downstream processing. Layer 7 Envoy proxies balance individual HTTP/2 streams across cluster pods.',
      [
        ['Downstream service continues working after client timeout', 'The service was not checking Context cancellation. We added a cancellation listener to abort ongoing database queries.'],
        ['All gRPC traffic routed to a single Kubernetes pod', 'The cluster was using L4 load balancing on a single HTTP/2 connection. We deployed Envoy as an L7 ingress proxy.'],
      ],
      [
        'Mark this deleted protobuf field as reserved so its tag is never accidentally reused.',
        'Attach withDeadlineAfter to this gRPC stub to bound execution time.',
        'Translate this domain exception to io.grpc.Status.FAILED_PRECONDITION before calling onError.',
      ],
      [
        'Why does standard Kubernetes load balancing fail when applied to gRPC services?',
        'How does Protocol Buffers achieve backward and forward compatibility?',
        'What is the difference between gRPC unary RPC and bidirectional streaming?',
      ],
      [
        'Why is deadline propagation essential in microservice call graphs?',
        'How do you implement schema evolution without breaking existing gRPC clients?',
        'What are the trade-offs of using gRPC compared to REST over JSON?',
      ],
      'High-performance distributed systems require strongly-typed, binary communication protocols. gRPC replaces verbose JSON parsing with compact Protocol Buffers, multiplexing concurrent requests over persistent HTTP/2 connections. By integrating native deadline propagation and canonical status codes, gRPC prevents cascading resource exhaustion and enforces strict contract discipline across internal microservice boundaries.',
    ],
    ai: [
      'Ask an AI to refactor an InventoryService protobuf definition by removing an unused field.',
      'The AI suggests deleting `string old_code = 2;` from the .proto file and assigning the number 2 to a newly added field `int32 warehouse_id = 2;`.',
      [
        'Reusing an existing field tag (tag 2) is a catastrophic violation of Protocol Buffers compatibility rules.',
        'Any existing deployed client sending the old string field will cause the server to fail deserialization or parse garbage integer values.',
        'Deleted fields must be marked as `reserved 2; reserved "old_code";` to prevent future developers from reusing the tag.',
        'The AI demonstrates a fundamental misunderstanding of protobuf binary wire encoding.',
      ],
      [
        'Ask the AI how protobuf identifies fields in the binary byte stream.',
        'Ask what happens when an older client sends string data for tag 2 to a server expecting an integer.',
        'Ask how the `reserved` keyword protects against silent data corruption.',
      ],
      'Correct outcome: Never reuse a field number. Mark deprecated or removed fields as `reserved` in the .proto contract to permanently retire the tag number and name.',
    ],
    quiz: [
      ['conceptual', 'How does Protocol Buffers identify fields in its binary wire format?', ['By JSON key names in quotes', 'By unique integer field tags (numbers)', 'By alphabetical order', 'By XML attribute tags'], 1, 'Field numbers identify values on the wire.'],
      ['conceptual', 'Why is gRPC significantly faster than REST over HTTP/1.1 JSON?', ['It uses binary serialization and multiplexes requests over persistent HTTP/2 connections', 'It runs without an operating system', 'It compresses data with ZIP', 'It bypasses the network card'], 0, 'Binary protobuf + HTTP/2 multiplexing yields high performance.'],
      ['scenario', 'Why does Kubernetes ClusterIP (L4) load balancing fail with gRPC?', ['Kubernetes does not support port numbers over 1000', 'gRPC multiplexes all requests over a single persistent TCP connection, pinning traffic to 1 pod', 'gRPC only works on AWS', 'HTTP/2 is forbidden by Linux'], 1, 'L4 proxies balance connections, not streams.'],
      ['conceptual', 'What is the purpose of gRPC Deadline Propagation?', ['Setting the server system clock', 'Carrying remaining request timeout budgets across downstream hops to abort expired work', 'Scheduling cron jobs', 'Formatting log dates'], 1, 'Deadlines abort work when remaining time expires.'],
      ['design', 'What must you do if you permanently deprecate field number 4 in a Protobuf message?', ['Delete the line and assign tag 4 to a new field tomorrow', 'Mark tag 4 and its name as `reserved` so it can never be reused', 'Change the syntax to proto2', 'Rename the package'], 1, 'The reserved keyword permanently retires tags.'],
      ['debugging', 'What canonical gRPC status code corresponds to HTTP 404 Not Found?', ['Status.INTERNAL', 'Status.NOT_FOUND', 'Status.CANCELLED', 'Status.UNAUTHENTICATED'], 1, 'io.grpc.Status.NOT_FOUND maps to 404.'],
      ['design', 'Which gRPC pattern allows a client to send a continuous stream of GPS coordinates and receive a single summary?', ['Unary RPC', 'Client Streaming RPC', 'Server Streaming RPC', 'Bidirectional Streaming RPC'], 1, 'Client streaming sends a stream and receives one response.'],
      ['code-tracing', 'What happens if a gRPC client sets a 500ms deadline and the server takes 800ms?', ['The client receives io.grpc.Status.DEADLINE_EXCEEDED at approximately 500ms', 'The client waits 800ms and returns success', 'The server restarts', 'The database drops the connection'], 0, 'The call aborts when deadline expires.'],
      ['conceptual', 'What is the difference between gRPC-Web and standard gRPC?', ['gRPC-Web is written in Python', 'gRPC-Web allows browser JavaScript clients to invoke gRPC services through a translation proxy', 'gRPC-Web does not support Protobuf', 'gRPC-Web uses UDP'], 1, 'gRPC-Web bridges browser limitations via a proxy.'],
      ['conceptual', 'How is transport encryption established in standard production gRPC?', ['Using proprietary Google tokens', 'Using Transport Layer Security (TLS) over HTTP/2', 'Using Base64 encoding', 'Encrypting hard drives'], 1, 'gRPC natively runs over TLS on HTTP/2.'],
    ],
  }),

  expandModule({
    id: 'M5.6',
    phase: 'M5',
    order: 6,
    title: 'Resilience Engineering: Circuit Breakers, Bulkheads & Fault Tolerance',
    subtitle:
      'Resilience4j state transitions (CLOSED, OPEN, HALF_OPEN), concurrency bulkheads, exponential backoff with jitter, rate limiting, and mitigating self-inflicted retry storms',
    minutes: 220,
    prerequisites: ['M5.1', 'M5.5'],
    objective:
      'Isolate faults and prevent cascading cluster outages: configure Resilience4j circuit breakers, thread pool/semaphore bulkheads, exponential backoff with full jitter, and deterministic fallbacks when dependencies degrade.',
    stack: ['Resilience4j 2.2', 'Spring Cloud CircuitBreaker', 'Micrometer', 'Virtual Threads / Bulkhead'],
    mode: 'REAL_EXECUTABLE',
    why:
      'In a distributed network, downstream latency or failures propagate exponentially upstream. Unbounded retries turn minor glitches into catastrophic retry storms that crash entire service tiers; bulkheads and circuit breakers contain blast radiuses and preserve partial system availability.',
    explanation: [
      'Resilience engineering prevents partial failures from escalating into total system outages; Resilience4j provides fault-tolerance primitives including Circuit Breaker, Bulkhead, RateLimiter, TimeLimiter, and Retry.',
      'A slow downstream service causes upstream threads to block waiting for responses; worker thread pools saturate, incoming requests queue, memory exhausts, and the failure cascades up to the ingress gateway.',
      'Trips the circuit open when failure or slow-call rates breach thresholds, failing fast without hitting the dead dependency; isolates resource pools via bulkheads; prevents thundering retry storms using exponential backoff with full jitter.',
      'Circuit Breaker maintains a sliding window of recent calls (count-based or time-based); in CLOSED state calls pass; if failure rate exceeds threshold (e.g. 50%), state transitions to OPEN; all calls fail fast (CallNotPermittedException); after wait duration, transitions to HALF_OPEN to test canary calls.',
      'Caller invokes annotated method (@CircuitBreaker) -> CircuitBreaker checks state -> if OPEN, executes fallback immediately -> if CLOSED, executes via Bulkhead -> if call fails or times out, records failure in sliding window -> if threshold breached, trips to OPEN.',
      'You gain fault isolation, fast recovery, and system survivability during partial outages; the trade-off is configuration complexity (tuning thresholds, windows, timeouts) and the risk of serving stale or degraded fallback data.',
      'Circuit breaker oscillating (flapping between OPEN and HALF_OPEN due to tiny sample size); retry storms (retrying non-idempotent mutations or retrying without jitter, magnifying load by 3x); bulkhead thread starvation; fallback hiding critical errors.',
      'Resilience4j Micrometer metrics (resilience4j.circuitbreaker.state, failure.rate, slow.call.rate, buffered.calls), bulkhead available concurrent calls, and retry attempt counters.',
      'Check circuit breaker actuator endpoint (/actuator/circuitbreakers), monitor state transitions in logs, inspect error distributions, and verify sliding window configuration.',
      'Tune minimumNumberOfCalls to prevent premature tripping on small samples; implement Exponential Backoff with Full Jitter; define bounded Bulkheads; provide safe degraded fallbacks; never retry non-idempotent POST requests blindly.',
      'Do not wrap fast in-memory operations in circuit breakers; do not configure retries on business validation errors (400, 401, 404); do not set waitDurationInOpenState to zero.',
      'Service B response time degrades from 20ms to 2,000ms under load. Upstream Service A has a 5-second timeout and 3 retries. What happens to Service A throughput and connection pool, and why is retry making the outage worse?',
    ],
    keys: [
      'Fast failure is superior to slow failure: fail fast when a downstream dependency is broken.',
      'Circuit Breaker states: CLOSED (normal) -> OPEN (fail fast) -> HALF_OPEN (probing recovery).',
      'Never retry without exponential backoff and randomized jitter to prevent retry storms.',
      'Bulkheads partition thread pools or semaphores so one failing dependency cannot exhaust all resources.',
      'Fallbacks must be safe, degraded representations; never return fake successful transactions.',
      'Never retry non-idempotent mutating calls (like charges) without verified idempotency keys.',
    ],
    concepts: [
      [
        'Explain how unbounded client retries cause a catastrophic Retry Storm during a service slowdown.',
        'When a service slows down under high load, requests begin timing out. If clients automatically retry 3 times without backoff/jitter, total traffic to the struggling service quadruples (1 initial + 3 retries = 4x load), pushing CPU from 90% to 100% and completely collapsing the service.',
        'reliability',
      ],
      [
        'Differentiate Count-Based vs Time-Based sliding windows in Resilience4j.',
        'A count-based sliding window evaluates the last N calls (e.g. last 100 calls). A time-based sliding window evaluates calls over the last N seconds (e.g. last 60 seconds). Time-based windows adapt better to variable traffic patterns.',
        'implementation',
      ],
      [
        'Why is Exponential Backoff with Full Jitter mathematically superior to fixed retry intervals?',
        'Fixed intervals cause all retrying clients to re-hit the server in synchronized wave crests (spikes). Full Jitter randomizes the sleep interval: sleep = rand(0, base * 2^attempt), flattening traffic spikes into a smooth, manageable arrival rate.',
        'performance',
      ],
      [
        'Compare Semaphore Bulkhead vs ThreadPool Bulkhead.',
        'A Semaphore Bulkhead limits the number of concurrent executions on the current thread without thread context switching overhead. A ThreadPool Bulkhead runs calls on a separate dedicated thread pool, isolating memory and CPU completely at the cost of thread handoff overhead.',
        'architecture',
      ],
      [
        'Describe the Half-Open canary state in a Circuit Breaker.',
        'In HALF_OPEN state, the circuit breaker allows a small, configurable number of test requests (permittedNumberOfCallsInHalfOpenState) to hit the dependency. If those succeed, it closes the circuit; if they fail, it trips back to OPEN.',
        'distributed-systems',
      ],
      [
        'Analyze when a Fallback method is dangerous to business integrity.',
        'Fallbacks that silently return mock success or empty lists for write operations (e.g., returning "Payment Accepted" when the payment failed) corrupt financial ledgers. Fallbacks should only be used for optional read models or safe queued intents.',
        'system-design',
      ],
    ],
    labs: [
      {
        id: 'M5.6-L1',
        title: 'Resilience4j Circuit Breaker, Retry with Jitter, and Degraded Fallback',
        minutes: 120,
        mode: 'REAL_EXECUTABLE',
        objective:
          'Protect the checkout payment flow using Resilience4j: configure CircuitBreaker with sliding window, Retry with exponential backoff and full jitter, Bulkhead concurrency limiting, and a safe degraded fallback.',
        context:
          'The external payment provider experiences periodic latency spikes and 503 Service Unavailable errors. Unbounded calls freeze checkout threads, causing cascading gateway timeouts.',
        architecture:
          'CheckoutService -> @CircuitBreaker @Retry @Bulkhead -> PaymentClient -> External Payment Gateway',
        problem:
          'Configure Resilience4j annotations on PaymentClient.processPayment(): failureRateThreshold = 50%, slidingWindowSize = 10, waitDurationInOpenState = 5000ms. Retry maxAttempts = 3 with exponential backoff and jitter. Implement fallbackPayment() returning a DEFERRED_PROCESSING payment status.',
        starter: `@Service
class PaymentGatewayClient {
  @CircuitBreaker(name = "paymentService", fallbackMethod = "fallbackPayment")
  @Retry(name = "paymentService")
  @Bulkhead(name = "paymentService", type = Bulkhead.Type.SEMAPHORE)
  fun executePayment(request: PaymentRequest): PaymentResponse {
    // Calls external provider...
    return PaymentResponse(id = "pay_123", status = "SUCCESS")
  }

  fun fallbackPayment(request: PaymentRequest, ex: Throwable): PaymentResponse {
    // TODO: Return degraded DEFERRED status safely without faking capture
    return PaymentResponse(id = "none", status = "FAILED")
  }
}`,
        lang: 'kotlin',
        requirements: [
          'CircuitBreaker trips to OPEN when 5 out of 10 calls fail or time out.',
          'When OPEN, subsequent calls immediately invoke fallbackPayment() in < 1ms without calling provider.',
          'Retry executes only on transient exceptions (SocketTimeoutException, 503) with backoff and jitter.',
          'Bulkhead limits concurrent calls to payment provider to 20.',
          'Fallback returns status DEFERRED_REVIEW, logging exception type and correlation ID.',
        ],
        constraints: [
          'Never retry on business 400 Bad Request or 402 Card Declined exceptions.',
          'Circuit breaker fallback signature must match target method plus Throwable argument.',
        ],
        expectedBehaviour:
          'When downstream fails, circuit trips to OPEN; requests immediately return fallback; after 5 seconds canary calls test recovery in HALF_OPEN; once provider recovers, circuit resets to CLOSED.',
        testCases: [
          ['Provider fails 6 consecutive calls', 'Circuit transitions to OPEN; 7th call returns fallback in 0ms'],
          ['Circuit is OPEN, 5 seconds elapse', 'Transitions to HALF_OPEN; 3 successful canary calls reset circuit to CLOSED'],
          ['Concurrency reaches 21 requests', '21st call rejected by Bulkhead with BulkheadFullException'],
        ],
        hiddenFailures: [
          'Retrying non-idempotent payment requests double-charges customer when timeout occurred after provider commit.',
          'Fallback catching Throwable hides OutOfMemoryError and JVM errors.',
        ],
        output:
          'Verified circuit state transitions and zero-overhead fast failure when downstream dependency is degraded.',
        hints: [
          'Configure resilience4j.circuitbreaker.instances.paymentService.slidingWindowSize=10 in application.yml.',
          'Ensure @Retry is evaluated before @CircuitBreaker or vice versa per Resilience4j aspect order.',
        ],
        verification:
          'Run automated test simulating downstream latency spike; observe circuit transition to OPEN via /actuator/circuitbreakerevents.',
        explanation:
          'Circuit breakers and bulkheads protect thread resources from exhaustion by failing fast at the first sign of sustained dependency failure.',
        extension:
          'Wire Micrometer alerts firing when circuit breaker state transitions from CLOSED to OPEN.',
      },
    ],
    debug: [
      debugEx(
        'M5.6-D1',
        'Circuit breaker flaps continuously between OPEN and HALF_OPEN, never stabilizing in CLOSED state.',
        'Payment service circuit breaker trips OPEN, waits 10s, enters HALF_OPEN, immediately trips OPEN again on the first request, repeating indefinitely.',
        [
          'permittedNumberOfCallsInHalfOpenState was set to 1',
          'Downstream service has a 5% baseline error rate',
          'A single random failure in HALF_OPEN immediately trips the circuit back to OPEN for another 10s',
          'Failure threshold was set to 10% on a sample of 1 call',
        ],
        'Diagnose the flapping circuit breaker and tune the half-open canary sample size and thresholds.',
        'A permittedNumberOfCallsInHalfOpenState of 1 means any single transient error in half-open state immediately trips the circuit open again. Configure permittedNumberOfCallsInHalfOpenState = 10 and slidingWindowSize = 20 so the circuit evaluates a representative statistical sample before deciding.',
        ['curl -s http://localhost:8080/actuator/circuitbreakerevents/paymentService', 'grep "HALF_OPEN" logs/application.log']
      ),
    ],
    failures: [
      {
        id: 'M5.6-F1',
        title: 'Cascading failure and retry storm collapses entire microservice cluster',
        minutes: 70,
        mode: 'REAL_EXECUTABLE',
        bug: 'NotificationService slowed down due to email provider rate-limiting. Upstream OrderService had 5-second timeouts with 4 immediate retries and no circuit breaker. OrderService Tomcat threads exhausted within 30 seconds, taking down the entire storefront.',
        reproduce: [
          './scripts/inject-latency.sh --service notification-service --delay 4500ms',
          './scripts/load-test.sh --endpoint /api/v1/orders --concurrency 50',
        ],
        observe: [
          'NotificationService CPU low, but OrderService CPU reaches 100% and tomcat.threads.busy reaches max.',
          'API Gateway returns 504 Gateway Timeout for all routes, including unrelated product searches.',
          'Total traffic on NotificationService amplified by 500% due to aggressive client retries.',
        ],
        hypotheses: [
          'Hardware power failure on database cluster.',
          'Cascading thread starvation and retry storm caused by slow dependency without circuit breaker or bulkhead isolation.',
          'DDoS attack from external botnet.',
        ],
        correctHypothesis: 1,
        hypothesisRejection: [
          '#0 rejected: database is healthy and responding in 2ms.',
          '#2 rejected: access logs show internal service-to-service retries originating from OrderService.',
        ],
        investigate: [
          ['jstack $(pgrep -f order-service) | grep "NotificationClient"', '190 of 200 Tomcat worker threads blocked waiting for NotificationService response', 'Thread pool exhaustion verified.'],
          ['grep "Retry attempt" services/order-service/logs', 'Found thousands of retries executing every 50ms', 'Retry storm amplifying latency.'],
        ],
        debugOptions: [
          'Unbounded timeouts and immediate retries created a cascading retry storm that exhausted server threads.',
          'The email provider credentials expired.',
        ],
        correctRootCause: 0,
        fixOptions: [
          'Decouple email notifications asynchronously via Kafka, wrap remaining synchronous calls in a Resilience4j Circuit Breaker + Bulkhead, and add exponential backoff with full jitter to retries.',
          'Double Tomcat max worker threads from 200 to 2,000.',
        ],
        correctFix: 0,
        fixRejection: [
          'Increasing threads multiplies memory overhead and worsens context-switching contention; it delays the collapse by 10 seconds without solving the root cause.',
        ],
        verify: [
          ['./scripts/inject-latency.sh --service notification-service --delay 4500ms', 'OrderService stays 100% available with < 10ms response times, circuit breaker trips OPEN', 'System survives total downstream failure.'],
        ],
        explainPrompt:
          'Explain why slow services are more dangerous to microservice availability than completely crashed services.',
        modelExplanation:
          'When a downstream service crashes and closes its TCP socket (ECONNREFUSED), callers fail immediately in milliseconds without holding resources. When a downstream service becomes slow (high latency), callers hold TCP connections, thread pool slots, and memory buffers open for the full timeout duration. Under high concurrency, worker threads exhaust within seconds, propagating thread starvation upstream and collapsing the entire cluster.',
        patterns: ['Cascading Failure', 'Retry Storm', 'Bulkhead Isolation', 'Fail-Fast Principle'],
        dimension: 'reliability',
      },
    ],
    design: {
      id: 'M5.6-AC1',
      title: 'Design multi-tier fault tolerance architecture for high-concurrency flash sale',
      scenario:
        'A retail platform anticipates 50,000 req/sec during Black Friday. Core components: API Gateway, Catalogue, Inventory, Checkout, Payment, Fraud, and Notification. Third-party Fraud detection service has an SLA of 99.0% and known p99 latency spikes of up to 4 seconds.',
      requirements: [
        'Design circuit breaker, timeout, and bulkhead topology across all inter-service boundaries.',
        'Define degraded mode operation: if Fraud detection is down or slow, how does Checkout behave?',
        'Specify rate limiting and queue-shedding strategy at the Gateway level.',
        'Design automated health check and canary recovery protocol.',
      ],
      constraints: [
        'Total checkout latency must remain under 1,500ms under any dependency degradation.',
        'Fraud check outage must not halt VIP customer purchases.',
      ],
      deliverables: [
        'Service dependency graph marking timeout, bulkhead, and circuit breaker settings per hop.',
        'Degraded fallback policy detailing which business features are disabled under load.',
        'Metrics dashboard specification monitoring circuit breaker states and shed requests.',
      ],
      failureModes: [
        'Fraud service degradation cascades back to Gateway, exhausting gateway worker threads.',
        'Circuit breaker trips on Fraud service, but fallback allows high-risk fraudulent transactions without limit.',
      ],
      tradeoffQuestions: [
        {
          question: 'If the Fraud detection service is down, do you fail open (allow orders) or fail closed (block orders)?',
          modelAnswer:
            'A hybrid risk-tiered fallback: for low-value orders (< $100) or verified long-time customers, fail open and flag the order for asynchronous post-payment audit. For high-value orders or brand-new accounts with high risk, fail closed or require additional multi-factor authentication. Failing completely closed destroys revenue; failing completely open invites catastrophic fraud.',
        },
        {
          question: 'Why must time limits (TimeLimiter) be configured alongside CircuitBreakers in Resilience4j?',
          modelAnswer:
            'A CircuitBreaker alone only tracks the outcome (success or failure) of completed calls. If a downstream call hangs for 60 seconds, the CircuitBreaker does not know it failed until the full 60 seconds elapses. A TimeLimiter forces the call to abort after a set threshold (e.g. 1000ms), turning a slow call into an immediate failure that can trip the circuit breaker.',
        },
      ],
    },
    defense: [
      [
        'Why not configure 5 retries on every service call just to be safe?',
        'Configuring aggressive retries across multiple microservice hops creates exponential retry amplification. If Service A calls B with 3 retries, and B calls C with 3 retries, a single user request can generate 3 x 3 = 9 calls to C. Under failure, this creates an internal Distributed Denial of Service (DDoS) attack that prevents C from ever recovering. Retries must be strictly bounded (max 1 or 2), backed with exponential jitter, and applied only to idempotent operations.',
        'reliability',
        ['Explains retry amplification factor.', 'Identifies retry storm risk.', 'Restricts retries to idempotent calls with backoff.'],
      ],
      [
        'A developer wants to return an empty array as a fallback when the Inventory Service is down. Defend your approval or rejection.',
        'Rejection for checkout flows; approval for read-only catalogue browsing. In a checkout flow, returning an empty list makes it appear that zero items are in stock, rejecting legitimate purchases. In a search browsing flow, returning an empty list with a "Temporarily unable to fetch live stock" banner is an acceptable degraded experience. Fallbacks must match the business criticality of the operation.',
        'system-design',
        ['Distinguishes read vs write context.', 'Evaluates business impact honestly.', 'Rejects blind empty fallback on critical path.'],
      ],
    ],
    english: [
      [
        ['circuit breaker', 'A design pattern used to detect failures and encapsulate the logic of preventing a failure from constantly recurring.', 'The circuit breaker tripped to open after the downstream service latency exceeded the threshold.'],
        ['bulkhead', 'An isolation pattern that partitions resource pools to prevent one failure from taking down the entire system.', 'We assigned a dedicated thread pool bulkhead to the payment service.'],
        ['retry storm', 'A cascading overload caused by automated retries hitting a struggling service simultaneously.', 'Adding exponential backoff with full jitter eliminated the retry storm.'],
        ['fail-fast', 'Immediately reporting a failure without attempting slow or futile processing.', 'When the circuit is open, requests fail-fast in less than one millisecond.'],
        ['cascading failure', 'A failure in one component that triggers successive failures in interconnected components.', 'Without bulkhead isolation, the notification outage caused a cascading failure across the cluster.'],
      ],
      [
        'Slow dependencies are more dangerous to system availability than dead dependencies.',
        'Never retry non-idempotent operations without verified idempotency keys.',
        'Circuit breakers must evaluate representative statistical sample sizes to avoid flapping.',
      ],
      'Our resilience engineering strategy applies defense-in-depth against distributed network failures. We protect synchronous inter-service calls using Resilience4j circuit breakers paired with finite time limiters and concurrency bulkheads. When downstream latency spikes, the circuit breaker trips open and fails fast, executing deterministic fallbacks to preserve partial availability. All retries incorporate exponential backoff with full jitter to eliminate self-inflicted retry storms.',
      [
        ['All gateway threads exhausted during downstream slowdown', 'A downstream dependency became slow, blocking upstream worker threads. We installed a Resilience4j circuit breaker with a 1000ms timeout.'],
        ['Circuit breaker oscillates continuously between open and half-open', 'The sample size in half-open state was set to 1 call. We increased the canary sample size to ten calls to stabilize evaluation.'],
      ],
      [
        'Configure exponential backoff with jitter on this retry policy.',
        'Separate the payment gateway client into a dedicated bulkhead thread pool.',
        'Ensure this fallback does not return fake success for a failed mutating operation.',
      ],
      [
        'What criteria determine whether a failed operation should be retried?',
        'How does a circuit breaker transition from open back to closed?',
        'What is the difference between a semaphore bulkhead and a thread pool bulkhead?',
      ],
      [
        'Why does a slow service cause more damage than an unavailable service?',
        'How do you prevent retry amplification in a deep microservice call chain?',
        'When is a fallback response appropriate and when should the call fail honestly?',
      ],
      'Resilience engineering is the science of graceful degradation under partial system failure. We isolate distributed components using Resilience4j circuit breakers, strict timeouts, and bulkhead resource partitions. By failing fast when dependencies degrade, preventing retry storms with randomized jitter, and providing safe fallback mechanisms, we ensure that an outage in one microservice cannot cascade into a catastrophic platform failure.',
    ],
    ai: [
      'Ask an AI to make a slow payment client resilient by configuring retries.',
      'The AI suggests adding `@Retryable(maxAttempts = 5, backoff = @Backoff(delay = 100))` on the `chargeCustomer(CreditCard card, BigDecimal amount)` method without idempotency keys or circuit breakers.',
      [
        'Retrying a charge method 5 times with a 100ms fixed delay can charge the customer card up to 5 times if timeouts were network-related.',
        'A fixed delay of 100ms creates a severe retry storm, hitting the struggling provider 5 times in half a second.',
        'No circuit breaker is configured, so worker threads remain blocked on slow responses.',
        'The solution demonstrates dangerous ignorance of financial idempotency and retry physics.',
      ],
      [
        'Ask the AI what happens if the payment provider captures the charge but the network times out before the response arrives.',
        'Ask how the provider handles 5 rapid retries under heavy load without backoff jitter.',
        'Ask why circuit breakers and idempotency keys are mandatory prerequisites before adding retries to write operations.',
      ],
      'Correct outcome: Never blindly retry financial mutations. Implement stable idempotency keys, wrap the client in a Circuit Breaker with finite timeouts, and apply exponential backoff with full jitter.',
    ],
    quiz: [
      ['conceptual', 'What is the primary purpose of a Circuit Breaker in microservices?', ['To encrypt network packets', 'To detect failures and fail fast without overloading degraded downstream dependencies', 'To balance database connections', 'To compile Java code'], 1, 'Circuit breakers fail fast to isolate failures.'],
      ['conceptual', 'What are the three core states of a standard Circuit Breaker?', ['UP, DOWN, UNKNOWN', 'CLOSED, OPEN, HALF_OPEN', 'START, RUN, STOP', 'READ, WRITE, EXECUTE'], 1, 'CLOSED (normal), OPEN (fail fast), HALF_OPEN (probing).'],
      ['conceptual', 'Why is Full Jitter recommended for retry backoff algorithms?', ['It makes retries run on GPU', 'It breaks up synchronized retry waves, smoothing traffic spikes into a flat distribution', 'It increases TCP socket buffer size', 'It disables HTTP headers'], 1, 'Jitter randomizes delays to avoid spikes.'],
      ['scenario', 'What happens when a call is made to a Resilience4j Circuit Breaker in the OPEN state?', ['It executes the call normally', 'It immediately throws CallNotPermittedException or invokes the fallback in < 1ms', 'It restarts the JVM', 'It sleeps for 60 seconds'], 1, 'OPEN circuits fail fast immediately.'],
      ['scenario', 'A downstream service is experiencing 99% CPU and 4-second latency. What makes the situation WORSE?', ['Applying a circuit breaker', 'Clients automatically retrying failed requests multiple times without backoff', 'Failing fast with HTTP 503', 'Scaling up consumer pods'], 1, 'Unbounded retries create a catastrophic retry storm.'],
      ['design', 'What is the role of a Bulkhead in resilience engineering?', ['Formatting JSON logs', 'Partitioning resource pools (threads or semaphores) so one failing dependency cannot exhaust all resources', 'Creating database backups', 'Routing DNS queries'], 1, 'Bulkheads isolate resource pools.'],
      ['debugging', 'A circuit breaker trips OPEN on a single error even though failureRateThreshold is 50%. Most likely cause?', ['The server has no memory', 'minimumNumberOfCalls is set to 1 or 2, making a single failure exceed 50%', 'The circuit breaker is broken', 'Java version is too old'], 1, 'Small sample sizes cause premature tripping.'],
      ['code-tracing', 'What exception does Resilience4j throw when a Semaphore Bulkhead is fully saturated?', ['NullPointerException', 'BulkheadFullException', 'IOException', 'IndexOutOfBoundsException'], 1, 'BulkheadFullException indicates concurrency saturation.'],
      ['conceptual', 'Why is a slow downstream service more dangerous than an unavailable (dead) service?', ['Slow services consume thread pools, connections, and memory for the full timeout duration, cascading upstream', 'Unavailable services cost more money', 'Slow services are harder to ping', 'Linux disables slow services automatically'], 0, 'Slow services tie up threads and resources.'],
      ['design', 'When is it SAFE to use an empty-result fallback method?', ['On a financial fund transfer endpoint', 'On a non-critical read-only search or recommendation listing', 'On an order cancellation endpoint', 'On user password reset'], 1, 'Non-critical reads can degrade gracefully.'],
    ],
  }),
];

/** Architecture snapshots of the continuous capstone, phase by phase. */
export const MS_M5_SNAPSHOTS: MsCapstoneSnapshot[] = [
  {
    phase: 'M5',
    label: 'M5 Architecture Milestone: Cloud Ingress, Security, Polyglot Persistence & Resilience',
    services: [
      'api-gateway (Spring Cloud Gateway, Netty)',
      'auth-service (Spring Authorization Server, OAuth2/OIDC)',
      'account-service (PostgreSQL, Resource Server)',
      'product-service (MongoDB polymorphic specs, Redis cache-aside, Elasticsearch)',
      'order-service (PostgreSQL, Outbox, gRPC client)',
      'inventory-service (PostgreSQL, gRPC server, Protobuf)',
      'payment-service (PostgreSQL, Stripe simulator, Idempotency store, Webhooks)',
      'notification-service (Kafka consumer, SendGrid simulator)',
    ],
    infrastructure: [
      'PostgreSQL 17 (multi-schema per-service isolation)',
      'MongoDB 7 (document store for product specifications)',
      'Elasticsearch 8 (search index read projection)',
      'Redis 7 (cache-aside with mutex locking, rate limiting)',
      'Apache Kafka 3.9 (outbox event backbone)',
      'Resilience4j 2.2 (circuit breakers, bulkheads, rate limiters)',
    ],
    flows: [
      'Client -> Gateway (Token Relay + Correlation) -> OrderService -> gRPC InventoryService (Deadline)',
      'OrderService -> Outbox -> Kafka -> PaymentService -> Webhook (HMAC) -> Order Confirmed',
      'Client -> Gateway -> ProductService -> Redis (Mutex Cache-Aside) -> MongoDB',
      'PostgreSQL WAL -> CDC Debezium -> Kafka -> Elasticsearch product search projection',
      'Resilience: PaymentService failure -> Resilience4j trips OPEN -> Fallback deferred processing',
    ],
    newInThisPhase: [
      'Spring Cloud Gateway reactive routing and correlation header propagation',
      'Stateless OAuth2 JWT validation with asymmetric JWKS keys and scope security',
      'Idempotent payment workflow with HMAC-verified webhook state transitions',
      'Polyglot storage matrix with Redis cache-aside stampede prevention',
      'High-performance gRPC unary contracts with protobuf and deadline propagation',
      'Resilience4j circuit breakers, concurrency bulkheads, and exponential backoff with full jitter',
    ],
    knownWeaknesses: [
      'Kubernetes manifests and Helm charts not yet unified (targeted for M7)',
      'Distributed OpenTelemetry tracing and centralized Prometheus alerting (targeted for M6)',
      'Advanced multi-region active-active disaster recovery (targeted for M8)',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },
];

/** Production-style incidents authored for Phase M5. */
export const MS_M5_INCIDENTS: MsIncident[] = [
  {
    id: 'M5-INC-01',
    title: 'P0: Flash Sale Ingress Collapse — Cascading Thread Starvation via Slow Payment Provider',
    moduleId: 'M5.6',
    severity: 'P0',
    environment: 'production',
    symptomSummary:
      'API Gateway returns 504 Gateway Timeout on all routes. CPU usage on OrderService and Gateway is under 15%, but active connection counts and thread counts hit maximum limits. Customer checkout is 100% down.',
    alerts: [
      'CRITICAL: ApiGatewayHttp504Rate > 45% for 3m',
      'WARNING: OrderServiceTomcatThreadsBusy > 95%',
      'CRITICAL: CheckoutSuccessRate dropped to 0%',
    ],
    hypothesisOptions: [
      'PostgreSQL database crashed due to disk out of space.',
      'Payment provider latency degraded, causing upstream thread exhaustion across OrderService and Gateway due to missing circuit breaker and bulkhead isolation.',
      'DDoS attack targeting the gateway with malformed HTTP/2 frames.',
    ],
    correctHypothesisIndex: 1,
    metrics: [
      { name: 'Gateway p99 latency', value: '15000ms', baseline: '45ms', interpretation: 'Severe latency spike at ingress' },
      { name: 'Payment gateway latency', value: '8200ms', baseline: '350ms', interpretation: 'External provider degraded' },
      { name: 'OrderService busy threads', value: '200 / 200', baseline: '18 / 200', interpretation: 'Complete worker thread pool saturation' },
      { name: 'PostgreSQL active queries', value: '4', baseline: '12', interpretation: 'Database is idle and healthy' },
    ],
    logs: [
      '2026-09-26T22:15:02.102Z WARN [order-service,trace-8f91,span-02] org.apache.tomcat.util.threads.ThreadPoolExecutor: Pool exhausted',
      '2026-09-26T22:15:05.401Z ERROR [api-gateway,trace-8f91] o.s.c.g.f.NettyRoutingFilter: 504 Gateway Timeout on route order-service',
      '2026-09-26T22:15:08.882Z INFO [payment-client,trace-8f91] c.s.p.PaymentClient: Calling provider endpoint /v1/charges',
    ],
    trace: [
      'client -> api-gateway (15002ms)',
      'api-gateway -> order-service (15000ms - timeout)',
      'order-service -> payment-client (8200ms)',
      'payment-client -> external-psp (8198ms)',
    ],
    rootCauseOptions: [
      'PaymentClient lacked a circuit breaker, bulkhead, and tight timeout; slow provider responses held OrderService worker threads for 8 seconds, exhausting thread pools and cascading up to the gateway.',
      'The API gateway Netty buffer overflowed due to oversized JWT headers.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Deploy hotfix configuring Resilience4j CircuitBreaker with 1500ms TimeLimiter and Semaphore Bulkhead on PaymentClient.',
      'Configure degraded fallback returning DEFERRED_REVIEW status for orders under timeout.',
      'Verify circuit trips to OPEN within 10 calls, restoring OrderService worker threads and allowing normal gateway throughput.',
    ],
    verification: [
      'API Gateway HTTP 504 rate drops to 0%.',
      'OrderService busy threads drop from 200 to 14.',
      'Checkout success rate restores for non-degraded payment methods.',
    ],
    explainPrompt:
      'Explain the exact mechanism of cascading failure in this incident and why the circuit breaker was the correct operational remediation.',
    postmortem: {
      impact: '100% checkout downtime for 18 minutes; estimated revenue impact of $120,000.',
      detection: 'Automated PagerDuty alert triggered on ApiGatewayHttp504Rate > 45%.',
      rootCause:
        'A third-party payment provider latency regression from 350ms to 8.2s tied up OrderService worker threads. Because timeouts were set to 15s with 3 retries and no circuit breaker or bulkhead isolation, all 200 Tomcat worker threads saturated, queuing incoming requests and cascading failure to the ingress gateway.',
      resolution:
        'Enabled Resilience4j CircuitBreaker with 1500ms timeout and bulkhead concurrency limits; circuit tripped to OPEN and failed fast, restoring order service thread capacity.',
      prevention:
        'Enforce mandatory circuit breaker and bulkhead annotations on all external HTTP clients; implement automated chaos testing with latency injection in pre-production.',
    },
    defenseQuestions: [
      'Why did increasing Tomcat thread pool size not resolve the incident?',
      'How does a semaphore bulkhead prevent slow external calls from starving the rest of the service?',
    ],
    executionMode: 'REAL_EXECUTABLE',
  },
];
