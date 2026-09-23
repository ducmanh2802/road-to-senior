/**
 * Canonical Standards & Content Conventions for Senior Java 180.
 *
 * Source of truth:
 * - Java 25 LTS: Language features, JVM internals, virtual threads, JMM.
 * - Spring Boot 4.1.x / Spring Framework 7.x: Cloud-native backend architecture,
 *   AOP proxies, transaction boundaries, Testcontainers with @ServiceConnection.
 *
 * All code snippets and conventions in this file support the Senior Engineering Loop:
 * LEARN → DESIGN → BUILD → BREAK → DEBUG → OPTIMIZE → EXPLAIN → DEFEND → REVIEW → INTERVIEW
 */

export const CANONICAL_JAVA_VERSION = 'Java 25' as const;
export const CANONICAL_SPRING_BOOT_VERSION = 'Spring Boot 4.1' as const;
export const CANONICAL_SPRING_FRAMEWORK_VERSION = 'Spring Framework 7.x' as const;

export interface VersionMetadata {
  name: string;
  version: string;
  runtimeTarget: string;
  supportPolicy: string;
  architecturalBaseline: string[];
}

export const JAVA_VERSION_METADATA: VersionMetadata = {
  name: 'Core Java',
  version: CANONICAL_JAVA_VERSION,
  runtimeTarget: 'Java 25 LTS (HotSpot / GraalVM)',
  supportPolicy: 'Production LTS Learning Target',
  architecturalBaseline: [
    'Virtual Threads (M:N user-mode scheduling without carrier thread pinning)',
    'Structured Concurrency & Scoped Values',
    'Flexible Constructor Bodies (statements before super(...))',
    'Record Patterns & Exhaustive Switch Pattern Matching',
    'Java Memory Model (JMM) happens-before & volatile memory barriers',
  ],
};

export const SPRING_BOOT_VERSION_METADATA: VersionMetadata = {
  name: 'Spring Boot',
  version: CANONICAL_SPRING_BOOT_VERSION,
  runtimeTarget: `${CANONICAL_SPRING_BOOT_VERSION} on ${CANONICAL_SPRING_FRAMEWORK_VERSION} (Java 25 Baseline)`,
  supportPolicy: 'Cloud-Native Backend Production Target',
  architecturalBaseline: [
    'Declarative Transaction Boundaries & CGLIB proxy mechanics',
    'Hibernate ORM & Spring Data: N+1 elimination & batch fetch optimization',
    'Modern Testcontainers integration via @ServiceConnection',
    'Virtual thread support on Tomcat/Jetty web servers',
    'Observability with Micrometer and OpenTelemetry distributed tracing',
  ],
};

export interface CurriculumCodeExample {
  id: string;
  title: string;
  category: string;
  versionTarget: string;
  description: string;
  filename: string;
  codeSnippet: string;
  breakScenario: string;
  debugFix: string;
  explainPrompt: string;
  interviewAnswer: string;
  keyConcepts: string[];
}

export const CANONICAL_JAVA_MODULES: CurriculumCodeExample[] = [
  {
    id: 'completablefuture',
    title: 'CompletableFuture & Non-Blocking Async Pipelines',
    category: 'Concurrency & Async',
    versionTarget: CANONICAL_JAVA_VERSION,
    description: 'Chaining supplyAsync, thenCompose, thenCombine with thread pool isolation, timeout bounds, and exception fallbacks.',
    filename: 'OrderAsyncPipeline.java',
    codeSnippet: `// 1. Dedicated bounded thread pool to prevent ForkJoinPool.commonPool() starvation
ExecutorService orderPool = Executors.newFixedThreadPool(16, new CustomizableThreadFactory("order-exec-"));

CompletableFuture<OrderSummary> future = CompletableFuture.supplyAsync(() -> orderService.fetchOrder(orderId), orderPool)
    .thenComposeAsync(order -> paymentService.verifyPayment(order.paymentId()), orderPool)
    .thenCombineAsync(
        CompletableFuture.supplyAsync(() -> inventoryService.checkStock(orderId), orderPool),
        (paymentResult, stockResult) -> new OrderSummary(paymentResult, stockResult),
        orderPool
    )
    .orTimeout(300, TimeUnit.MILLISECONDS)
    .exceptionally(ex -> {
        log.error("Order processing timed out or failed", ex);
        return OrderSummary.fallback();
    });`,
    breakScenario: `Calling .join() or .get() immediately after supplyAsync inside a servlet thread or Spring controller, converting the async pipeline into a blocking thread-per-request bottleneck and exhausting worker threads.`,
    debugFix: `Return CompletableFuture or DeferredResult directly from the controller, or chain callbacks asynchronously. Never call blocking .join() on the request handling thread.`,
    explainPrompt: `Why should you always supply a dedicated Executor to CompletableFuture rather than relying on ForkJoinPool.commonPool()?`,
    interviewAnswer: `CompletableFuture implements both Future and CompletionStage interfaces, enabling monadic composition of asynchronous tasks without callback hell.
Key Senior Architectural Nuances:
1. Always pass an explicit Executor to supplyAsync() and async stages. The default ForkJoinPool.commonPool() is shared JVM-wide; blocking I/O calls inside it starve parallel streams and GC worker helper tasks.
2. thenCompose (flatMap) vs thenCombine: thenCompose executes dependent sequential async stages, while thenCombine executes two independent parallel stages concurrently and merges their results.
3. Exception propagation: .exceptionally() handles failures at the tail, whereas .handle() intercepts both success payload and Throwable at intermediate stages.`,
    keyConcepts: [
      'Thread safety is fundamentally about state mutability management across CPU cache hierarchies.',
      'Never rely on default unconfigured executors for asynchronous workflows in production.',
      'Size thread pools based on mathematical concurrency formulas: N_cpu * (1 + Wait/Compute).',
    ],
  },
  {
    id: 'jmm',
    title: 'Java Memory Model (JMM), Volatile & Happens-Before',
    category: 'JVM Internals',
    versionTarget: CANONICAL_JAVA_VERSION,
    description: 'Hardware store buffers, CPU instruction reordering, volatile memory barriers, and safe publication guarantees.',
    filename: 'DoubleCheckedLockingSingleton.java',
    codeSnippet: `public class DoubleCheckedLockingSingleton {
    // volatile is CRITICAL: prevents instruction reordering between object allocation and reference assignment
    private static volatile DoubleCheckedLockingSingleton instance;

    public static DoubleCheckedLockingSingleton getInstance() {
        if (instance == null) { // 1st check (no lock)
            synchronized (DoubleCheckedLockingSingleton.class) {
                if (instance == null) { // 2nd check (with lock)
                    // Memory actions without volatile:
                    // 1. allocate memory -> 2. assign reference -> 3. init constructor (REORDERED!)
                    // Other threads could observe a partially initialized object!
                    instance = new DoubleCheckedLockingSingleton();
                }
            }
        }
        return instance;
    }
}`,
    breakScenario: `Omitting the 'volatile' keyword from the singleton field in Double-Checked Locking. Under multi-core CPU reordering, Thread B can observe a non-null instance whose constructor has not finished executing, throwing unexpected NullPointerExceptions or corrupted state.`,
    debugFix: `Add 'volatile' so the compiler and CPU emit a StoreStore / StoreLoad memory barrier, ensuring complete constructor initialization happens-before reference publication.`,
    explainPrompt: `Walk through the hardware memory architecture and explain why volatile is required for thread-safe double-checked locking.`,
    interviewAnswer: `The Java Memory Model (JSR-133) defines the visibility and ordering guarantees between concurrent threads.
volatile enforces two critical guarantees:
1. Visibility: Reads always fetch the most recent write directly from main memory rather than stale CPU L1/L2 caches.
2. Ordering: Prevents compiler and CPU instruction reordering across the volatile boundary by injecting memory barriers.
Happens-before guarantee: A write to a volatile variable happens-before every subsequent read of that same variable.`,
    keyConcepts: [
      'Volatile provides visibility and ordering, but NOT atomicity for compound operations (e.g., count++).',
      'Memory barriers (fences) flush processor store buffers and invalidate CPU cache lines.',
      'Safe publication requires either volatile reference, final fields, or proper lock synchronization.',
    ],
  },
  {
    id: 'virtual-threads',
    title: 'Java 25 Virtual Threads & Structured Concurrency',
    category: 'Modern Java Concurrency',
    versionTarget: CANONICAL_JAVA_VERSION,
    description: 'Lightweight user-mode threads managed by JVM runtime mapped M:N onto OS carrier threads with structured task scopes.',
    filename: 'VirtualThreadDemo.java',
    codeSnippet: `// Starting 10,000 Virtual Threads with minimal memory overhead on Java 25
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<UserResponse>> futures = IntStream.range(0, 10_000)
        .mapToObj(i -> executor.submit(() -> {
            // Virtual thread unmounts continuation on blocking I/O (yielding carrier thread)
            Thread.sleep(Duration.ofMillis(50));
            return fetchUserData(i);
        }))
        .toList();

    for (Future<UserResponse> future : futures) {
        processResponse(future.get());
    }
} // AutoCloseable executor joins and shuts down automatically`,
    breakScenario: `Performing blocking I/O calls inside 'synchronized' blocks or invoking native JNI methods, triggering Carrier Thread Pinning where the virtual thread cannot unmount from its underlying OS worker thread.`,
    debugFix: `Replace synchronized blocks with java.util.concurrent.locks.ReentrantLock, which fully supports virtual thread continuation unmounting without pinning carrier threads.`,
    explainPrompt: `How does the JVM unmount a virtual thread continuation during blocking I/O, and what causes thread pinning?`,
    interviewAnswer: `Virtual Threads decouple Java thread abstractions from 1:1 OS kernel threads by managing lightweight user-mode continuations on the Java heap.
When a Virtual Thread executes a blocking operation (Socket read, JDBC query, Thread.sleep), the JVM unmounts the continuation from its carrier thread (ForkJoinPool worker) and parks it on the heap. The carrier thread immediately picks up another virtual thread.
Senior Pitfall: Thread Pinning happens when blocking I/O occurs inside synchronized methods or native JNI calls, preventing unmounting. Run with -Djdk.tracePinnedThreads=full in dev/test to detect and replace with ReentrantLock.`,
    keyConcepts: [
      'Virtual threads are designed for high-throughput, I/O-bound workloads, not CPU-bound calculations.',
      'Never pool virtual threads; create them per-task on demand.',
      'Virtual thread memory footprint is ~few kilobytes compared to 1MB+ default OS thread stack.',
    ],
  },
];

export const CANONICAL_SPRING_MODULES: CurriculumCodeExample[] = [
  {
    id: 'transaction-proxy',
    title: '@Transactional Self-Invocation & Proxy Bypass',
    category: 'Spring AOP & Transactions',
    versionTarget: CANONICAL_SPRING_BOOT_VERSION,
    description: 'Understanding Spring CGLIB proxies, interceptor chains, and why internal self-invocation bypasses transaction boundaries.',
    filename: 'OrderProcessingService.java',
    codeSnippet: `@Service
public class OrderProcessingService {

    private final OrderRepository orderRepository;
    private final OrderTxCollaborator txCollaborator;

    public OrderProcessingService(OrderRepository orderRepository, OrderTxCollaborator txCollaborator) {
        this.orderRepository = orderRepository;
        this.txCollaborator = txCollaborator;
    }

    // ❌ WRONG: Calling this.executeTransaction(orderId) directly bypasses Spring CGLIB proxy!
    public void processOrderUnsafe(Long orderId) {
        log.info("Processing order non-transactionally");
        // Direct method call on 'this' - TransactionInterceptor is NOT invoked!
        // this.executeTransaction(orderId);
    }

    // ✅ CORRECT ARCHITECTURE: Separate into a dedicated transaction collaborator bean
    public void processOrderSafe(Long orderId) {
        log.info("Delegating to transactional collaborator");
        txCollaborator.executeInTransaction(orderId);
    }
}`,
    breakScenario: `Invoking a @Transactional method directly from another method within the same bean (this.method()). The call targets the raw target instance, completely bypassing Spring's CGLIB proxy wrapper and TransactionInterceptor.`,
    debugFix: `Extract transactional operations into a separate Spring-managed collaborator service bean, or inject a self-reference via ObjectProvider / ApplicationContext.`,
    explainPrompt: `Explain how Spring AOP proxies intercept method calls and why self-invocation fails to trigger transactional advice.`,
    interviewAnswer: `Spring's declarative transaction management relies on dynamic proxies (CGLIB for class proxies, JDK dynamic proxies for interfaces).
When a client bean calls an @Autowired service, it interacts with the proxy wrapper. The proxy delegates to TransactionInterceptor, opens or joins a database transaction via PlatformTransactionManager, and invokes the target method.
Self-invocation flaw: When method A calls method B on 'this', the call does not pass through the proxy wrapper. Hence, no TransactionInterceptor is invoked, and no transaction is created.
Senior Nuance: By default, @Transactional only rolls back on unchecked exceptions (RuntimeException and Error). Always specify rollbackFor = Exception.class for checked exceptions.`,
    keyConcepts: [
      'Spring CGLIB proxies wrap beans by subclassing and intercepting external method calls.',
      'Self-invocation on "this" bypasses proxy interceptors entirely.',
      'Specify rollbackFor = Exception.class to handle checked business exceptions.',
    ],
  },
  {
    id: 'jpa-nplusone',
    title: 'Hibernate JPA N+1 Query Elimination & Batch Sizing',
    category: 'Data Access & ORM',
    versionTarget: CANONICAL_SPRING_BOOT_VERSION,
    description: 'Eliminating N+1 select queries using JPQL JOIN FETCH, EntityGraph, and default_batch_fetch_size configuration.',
    filename: 'OrderRepository.java',
    codeSnippet: `public interface OrderRepository extends JpaRepository<Order, Long> {

    // ❌ Flawed default: 1 query for Orders, then N individual queries for OrderItems
    // List<Order> findAllByCustomerId(Long customerId);

    // ✅ OPTION 1: JPQL JOIN FETCH (Eagerly loads child items in a single SQL JOIN)
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.customer WHERE o.customer.id = :customerId")
    List<Order> findAllWithItemsEager(@Param("customerId") Long customerId);

    // ✅ OPTION 2: Spring Data JPA EntityGraph
    @EntityGraph(attributePaths = {"items", "shippingAddress"})
    List<Order> findByStatus(OrderStatus status);
}`,
    breakScenario: `Fetching an entity collection with lazy relationships in a loop without join fetching. A table of 500 rows generates 1 initial query + 500 individual SELECT queries, saturating the database connection pool.`,
    debugFix: `Use JPQL 'JOIN FETCH' or @EntityGraph for eager query fetching, and configure 'hibernate.default_batch_fetch_size: 50' in application.yml to batch child fetches using SQL IN clauses.`,
    explainPrompt: `What is the N+1 select problem in Hibernate, and when would you prefer default_batch_fetch_size over JOIN FETCH?`,
    interviewAnswer: `The N+1 problem occurs when an initial query loads N entities, and accessing a lazy association on each entity triggers N secondary queries.
Solutions:
1. JOIN FETCH / @EntityGraph: Executes an eager SQL JOIN. Best for single collection relationships.
2. Caution with Multiple JOIN FETCH: Joining multiple @OneToMany collections creates a Cartesian product in memory and throws MultipleBagFetchException.
3. Batch Fetching: Setting hibernate.default_batch_fetch_size: 50 converts N queries into ceil(N/50) batched queries using SQL 'WHERE id IN (...)', effectively mitigating N+1 without Cartesian explosion.`,
    keyConcepts: [
      'JOIN FETCH causes SQL JOIN, ideal for 1-to-1 or single collection relationships.',
      'Never JOIN FETCH multiple collection associations simultaneously (Cartesian explosion).',
      'default_batch_fetch_size operates globally to bundle lazy collection loads via SQL IN.',
    ],
  },
  {
    id: 'testcontainers-spring',
    title: 'Integration Testing with Testcontainers & @ServiceConnection',
    category: 'Testing & Cloud Architecture',
    versionTarget: CANONICAL_SPRING_BOOT_VERSION,
    description: 'Modern Spring Boot integration testing using Testcontainers and @ServiceConnection for automated container datasource injection.',
    filename: 'OrderServiceIntegrationTest.java',
    codeSnippet: `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class OrderServiceIntegrationTest {

    // Modern Spring Boot: @ServiceConnection automatically discovers and configures JDBC properties
    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("orders_test")
        .withUsername("test")
        .withPassword("test");

    @Autowired
    private OrderProcessingService orderService;

    @Test
    void shouldExecuteOrderTransactionSafely() {
        Long orderId = 101L;
        assertDoesNotThrow(() -> orderService.processOrderSafe(orderId));
    }
}`,
    breakScenario: `Relying on in-memory H2 databases for integration testing that passes locally but fails in production due to PostgreSQL-specific SQL syntax, dialect differences, lock mechanics, and JSONB operators.`,
    debugFix: `Use Testcontainers with real production database images (e.g. PostgreSQL 16) and Spring Boot's @ServiceConnection to ensure identical runtime SQL semantics.`,
    explainPrompt: `Why is testing with real Testcontainers superior to in-memory databases like H2 for Spring Boot enterprise applications?`,
    interviewAnswer: `H2 or mock databases create a false sense of security because they do not replicate PostgreSQL concurrency locks (SELECT FOR UPDATE), transaction isolation levels, indexing behaviors, or proprietary SQL extensions (JSONB, CTEs).
Modern Spring Boot integration tests use Testcontainers to spin up disposable Docker instances.
The @ServiceConnection annotation automatically registers container connection details into the Spring Environment (dynamic datasource URL, username, password), eliminating brittle @DynamicPropertySource boilerplate.`,
    keyConcepts: [
      'In-memory databases hide dialect, constraint, and concurrency bugs.',
      '@ServiceConnection in modern Spring Boot configures connection properties automatically.',
      'Integration tests against real database engines guarantee production fidelity.',
    ],
  },
];
