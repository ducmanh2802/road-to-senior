/**
 * Technical English for Senior Java Engineers Curriculum Data.
 * 
 * Provides structured English learning modules across 10 essential sections:
 * 1. Java Core Vocabulary (memory model, immutability, garbage collection, concurrency)
 * 2. Spring Boot and Dependency Injection (inversion of control, scopes, proxying, transactions)
 * 3. REST API and Distributed Systems (idempotency, circuit breakers, rate limiting, payloads)
 * 4. Database, Transactions, and JPA (isolation levels, optimistic locking, connection pooling)
 * 5. Kafka, Redis, and Event-Driven Architecture (partitioning, consumer groups, cache eviction)
 * 6. Debugging and Incident Response (out-of-memory, thread contention, postmortem, root cause)
 * 7. System Design Discussion (trade-offs, scalability, backpressure, high availability)
 * 8. Code Review and Technical Leadership (constructive feedback, architectural alignment, refactoring)
 * 9. Senior Interview Answers (STAR method, trade-off defense, leadership, system failure)
 * 10. Daily Explanation Drill (concise elevator pitches, technical explanations under 60 seconds)
 *
 * Each item contains:
 * - Term or topic
 * - Plain-English explanation
 * - Senior-level explanation
 * - Example sentence
 * - Common mistake
 * - Short speaking prompt
 * - Vietnamese support note
 * - Difficulty level (MID | SENIOR | STAFF)
 * - Related learning loop stage (LEARN | DESIGN | BUILD | BREAK | DEBUG | OPTIMIZE | EXPLAIN | DEFEND | REVIEW | INTERVIEW)
 */

export type EnglishSectionId =
  | 'java-core'
  | 'spring-boot'
  | 'rest-distributed'
  | 'database-jpa'
  | 'kafka-redis'
  | 'debugging-incident'
  | 'system-design'
  | 'code-review'
  | 'senior-interview'
  | 'daily-drill';

export type EnglishDifficulty = 'MID' | 'SENIOR' | 'STAFF';

export type LearningLoopStage =
  | 'LEARN'
  | 'DESIGN'
  | 'BUILD'
  | 'BREAK'
  | 'DEBUG'
  | 'OPTIMIZE'
  | 'EXPLAIN'
  | 'DEFEND'
  | 'REVIEW'
  | 'INTERVIEW';

export interface EnglishSectionMeta {
  id: EnglishSectionId;
  title: string;
  shortLabel: string;
  description: string;
  iconName: string;
}

export interface TechnicalEnglishItem {
  id: string;
  section: EnglishSectionId;
  term: string;
  topic: string;
  plainEnglishExplanation: string;
  seniorExplanation: string;
  exampleSentence: string;
  commonMistake: string;
  speakingPrompt: string;
  vietnameseSupportNote: string;
  difficulty: EnglishDifficulty;
  relatedStage: LearningLoopStage;
  tags: string[];
  keyPhrases: string[];
  codeSnippet?: {
    language: string;
    code: string;
    description: string;
  };
}

export const ENGLISH_SECTIONS_META: EnglishSectionMeta[] = [
  {
    id: 'java-core',
    title: 'Java Core Vocabulary',
    shortLabel: 'Java Core',
    description: 'Precision vocabulary for memory models, virtual threads, immutability, and runtime internals.',
    iconName: 'Coffee',
  },
  {
    id: 'spring-boot',
    title: 'Spring Boot & Dependency Injection',
    shortLabel: 'Spring Boot',
    description: 'Articulate beans, inversion of control, proxies, transaction propagation, and context lifecycles.',
    iconName: 'Leaf',
  },
  {
    id: 'rest-distributed',
    title: 'REST API & Distributed Systems',
    shortLabel: 'REST & Dist.',
    description: 'Explain idempotency, HTTP contracts, circuit breakers, backpressure, and network partitions.',
    iconName: 'Network',
  },
  {
    id: 'database-jpa',
    title: 'Database, Transactions & JPA',
    shortLabel: 'DB & JPA',
    description: 'Discuss ACID guarantees, isolation levels, dirty reads, connection pools, and query plans.',
    iconName: 'Database',
  },
  {
    id: 'kafka-redis',
    title: 'Kafka, Redis & EDA',
    shortLabel: 'Kafka & Redis',
    description: 'Explain consumer lag, partitioning, idempotence, cache invalidation, and event streaming.',
    iconName: 'Layers',
  },
  {
    id: 'debugging-incident',
    title: 'Debugging & Incident Response',
    shortLabel: 'Incident & Debug',
    description: 'Lead war-room communications, explain thread dumps, OOM roots, and postmortem timelines.',
    iconName: 'AlertOctagon',
  },
  {
    id: 'system-design',
    title: 'System Design Discussion',
    shortLabel: 'System Design',
    description: 'Defend architectural decisions, trade-offs, capacity planning, and fault tolerance.',
    iconName: 'Cpu',
  },
  {
    id: 'code-review',
    title: 'Code Review & Technical Leadership',
    shortLabel: 'Code Review',
    description: 'Deliver actionable, empathetic, and rigorous feedback during PR discussions and RFC reviews.',
    iconName: 'GitPullRequest',
  },
  {
    id: 'senior-interview',
    title: 'Senior Interview Answers',
    shortLabel: 'Interview QA',
    description: 'Structure senior behavioral and system architecture answers using STAR and trade-off defense.',
    iconName: 'Award',
  },
  {
    id: 'daily-drill',
    title: 'Daily Explanation Drill',
    shortLabel: 'Daily Drill',
    description: '60-second verbal explanation challenges to build fluency and technical presence.',
    iconName: 'Mic',
  },
];

export const TECHNICAL_ENGLISH_ITEMS: TechnicalEnglishItem[] = [
  // 1. Java Core Vocabulary
  {
    id: 'eng-java-01',
    section: 'java-core',
    term: 'Virtual Threads & Carrier Thread Pinning',
    topic: 'JVM Concurrency & Project Loom',
    plainEnglishExplanation: 'Virtual threads are ultra-lightweight threads managed by the Java runtime instead of the operating system, allowing millions of concurrent tasks without crashing memory.',
    seniorExplanation: 'Virtual threads decouple Java execution from OS kernel threads using a small pool of carrier threads. Pinning occurs when a virtual thread performs a blocking operation inside a synchronized block or native method, preventing it from yielding the underlying carrier thread and causing thread starvation.',
    exampleSentence: 'To prevent carrier thread pinning in Java 25, we refactored legacy synchronized blocks to ReentrantLock before migrating our high-throughput payment webhook consumers.',
    commonMistake: 'Saying "Virtual threads make CPU-bound algorithms 10x faster." Reality: Virtual threads increase throughput for I/O-bound blocking calls, not raw CPU math calculations.',
    speakingPrompt: 'Explain carrier thread pinning to a junior engineer and describe how to detect it using JDK Flight Recorder (JFR).',
    vietnameseSupportNote: 'Lưu ý không dùng từ "block CPU". "Carrier thread pinning" có nghĩa là thread ảo bị "ghim chặt" vào thread OS thực khi nằm trong khối synchronized, khiến các thread ảo khác không được nhường CPU.',
    difficulty: 'SENIOR',
    relatedStage: 'OPTIMIZE',
    tags: ['virtual-threads', 'jvm', 'concurrency', 'pinning'],
    keyPhrases: [
      'decouples application threads from OS kernel threads',
      'carrier thread starvation',
      'yields on blocking I/O',
      'refactor synchronized to ReentrantLock',
    ],
    codeSnippet: {
      language: 'java',
      code: `// Preferred modern approach avoiding carrier pinning:
private final ReentrantLock lock = new ReentrantLock();

public void processPayment(String transactionId) {
    lock.lock();
    try {
        // Safe I/O blocking operation on virtual thread
        gatewayClient.authorize(transactionId);
    } finally {
        lock.unlock();
    }
}`,
      description: 'ReentrantLock allows virtual thread unmounting during blocking calls, unlike synchronized blocks.',
    },
  },
  {
    id: 'eng-java-02',
    section: 'java-core',
    term: 'Garbage Collection Generational Hypothesis & Stop-The-World Pauses',
    topic: 'JVM Memory Management',
    plainEnglishExplanation: 'The idea that most objects created in memory die very quickly, so the JVM organizes memory into age groups to clean up trash quickly without stopping everything for long.',
    seniorExplanation: 'The weak generational hypothesis posits that infant mortality in object allocation exceeds 90%. ZGC and G1 partition the heap to minimize stop-the-world (STW) phase duration by performing mark and relocate phases concurrently with application threads, capping pause times under 1 millisecond even on terabyte-scale heaps.',
    exampleSentence: 'Switching our low-latency order matching engine from G1GC to Generational ZGC reduced our p99.9 garbage collection pauses from 45 milliseconds to sub-millisecond levels.',
    commonMistake: 'Confusing "throughput" with "latency". High throughput means total work done over time; low latency means individual request pause time is minimized.',
    speakingPrompt: 'Describe the trade-off between throughput collector (Parallel GC) and concurrent low-latency collector (ZGC) during an architecture review.',
    vietnameseSupportNote: '"Stop-The-World (STW)" là hiện tượng toàn bộ application threads bị tạm dừng để GC dọn dẹp. Hãy nhấn mạnh "concurrent marking" và "concurrent evacuation".',
    difficulty: 'SENIOR',
    relatedStage: 'EXPLAIN',
    tags: ['gc', 'zgc', 'g1gc', 'memory', 'latency'],
    keyPhrases: [
      'weak generational hypothesis',
      'stop-the-world pause duration',
      'concurrent mark and relocate phases',
      'tail latency (p99/p99.9)',
    ],
  },
  {
    id: 'eng-java-03',
    section: 'java-core',
    term: 'Immutability & Defensive Copying',
    topic: 'Thread Safety & Data Integrity',
    plainEnglishExplanation: 'Making sure an object cannot be changed once created, and returning brand-new copies of internal collections so outside code cannot accidentally break your state.',
    seniorExplanation: 'Java records guarantee shallow immutability by producing final fields and canonical constructors. However, mutable reference types like List or Date necessitate defensive copying in both accessors and constructors to prevent reference leakage and state corruption across concurrent threads.',
    exampleSentence: 'Although the AccountRecord was declared with final components, we still performed defensive copying using List.copyOf() to prevent callers from modifying the active permissions list.',
    commonMistake: 'Assuming `Collections.unmodifiableList()` is deeply immutable. If the underlying backing list is mutated by the owner, the "unmodifiable" wrapper reflects the modification.',
    speakingPrompt: 'Explain how reference leakage breaks encapsulation and thread safety in a multithreaded order service.',
    vietnameseSupportNote: '"Reference leakage" (rò rỉ tham chiếu đối tượng) xảy ra khi ta trả trực tiếp mutable collection ra ngoài thay vì copy mới.',
    difficulty: 'MID',
    relatedStage: 'BUILD',
    tags: ['immutability', 'records', 'defensive-copy', 'thread-safety'],
    keyPhrases: [
      'shallow vs deep immutability',
      'defensive copying in canonical constructors',
      'prevent reference leakage',
      'thread-safe by design',
    ],
  },

  // 2. Spring Boot and Dependency Injection
  {
    id: 'eng-spring-01',
    section: 'spring-boot',
    term: 'Dynamic Proxying & Self-Invocation Trap in @Transactional',
    topic: 'Spring AOP & Proxy Architecture',
    plainEnglishExplanation: 'Spring wraps your classes in an invisible protective layer (a proxy) to start transactions. If one method in your class calls another method in the same class directly, it skips that invisible layer, so transactions do not work.',
    seniorExplanation: 'Spring AOP manages declarative concerns like @Transactional and @Async through CGLIB or JDK dynamic proxies. When a method performs self-invocation (this.helperMethod()), the call bypasses the proxy interceptor chain, causing the transactional aspect to be silently ignored.',
    exampleSentence: 'The audit logging bug occurred because the outer method invoked the transactional helper internally via self-invocation, bypassing the CGLIB proxy and failing to open an active transaction.',
    commonMistake: 'Expecting private methods to be transactional with @Transactional. Spring proxies can only intercept visible, public method invocations from external callers.',
    speakingPrompt: 'Explain how Spring AOP proxies work to an engineer who discovered that their `@Transactional(propagation = Propagation.REQUIRES_NEW)` method is not running in a new transaction.',
    vietnameseSupportNote: '"Self-invocation" (tự gọi nội bộ) bỏ qua CGLIB proxy. Giải pháp chuẩn là tách helper ra một bean riêng biệt hoặc inject chính bean đó (self-injection).',
    difficulty: 'SENIOR',
    relatedStage: 'DEBUG',
    tags: ['spring-boot', 'aop', 'transactional', 'cglib-proxy'],
    keyPhrases: [
      'bypasses the proxy interceptor chain',
      'self-invocation ignores transactional aspects',
      'extract to dedicated collaborator bean',
      'CGLIB subclass vs JDK interface proxy',
    ],
    codeSnippet: {
      language: 'java',
      code: `// BUG: Self-invocation bypasses proxy
@Service
public class OrderService {
    public void processOrder(Order order) {
        // Direct method call bypasses Spring CGLIB proxy!
        saveWithAudit(order); 
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveWithAudit(Order order) {
        orderRepository.save(order);
    }
}`,
      description: 'Self-invocation bypasses proxy interceptors; extract saveWithAudit to a dedicated collaborator service.',
    },
  },
  {
    id: 'eng-spring-02',
    section: 'spring-boot',
    term: 'Constructor Injection vs Field Injection',
    topic: 'Inversion of Control & Architectural Hygiene',
    plainEnglishExplanation: 'Passing dependencies directly into the class constructor instead of using @Autowired on top of fields, making classes easy to test and impossible to create in broken states.',
    seniorExplanation: 'Constructor injection enforces immutability via final references, guarantees that beans are never instantiated in an incomplete or half-initialized state, eliminates circular dependencies at compile/startup time, and enables straightforward unit testing without needing reflection or a heavy Spring context.',
    exampleSentence: 'Our team standards mandate constructor injection with Lombok @RequiredArgsConstructor or explicit records so that dependencies remain immutable and fail-fast during startup.',
    commonMistake: 'Saying field injection is better because "it saves lines of code". It hides dependencies, causes NullPointerExceptions in plain unit tests, and complicates mocking.',
    speakingPrompt: 'Defend why our engineering RFC bans `@Autowired private Service service;` in favor of constructor injection.',
    vietnameseSupportNote: 'Nhấn mạnh: "fail-fast", "prevents partially constructed objects", "pure unit testing without Mockito reflection".',
    difficulty: 'MID',
    relatedStage: 'DEFEND',
    tags: ['spring-boot', 'di', 'constructor-injection', 'testability'],
    keyPhrases: [
      'guarantees complete initialization',
      'enforces final immutable dependencies',
      'fail-fast circular dependency detection',
      'testable without reflection',
    ],
  },

  // 3. REST API and Distributed Systems
  {
    id: 'eng-rest-01',
    section: 'rest-distributed',
    term: 'Idempotency Keys & At-Least-Once Delivery Handling',
    topic: 'Distributed Transactions & Network Reliability',
    plainEnglishExplanation: 'An idempotency key is a unique ID sent with a request so that if the network drops and the user retries, the server recognizes it has already done the job and does not charge twice.',
    seniorExplanation: 'Due to network unreliability, distributed clients retry requests upon receiving 504 Gateway Timeouts. An idempotency key stored in Redis with an atomic SETNX lease guarantees that duplicate retries receive the original recorded outcome rather than triggering side-effect mutations such as double billing.',
    exampleSentence: 'To satisfy our zero-double-charge SLA, we implemented an idempotency filter that acquires a Redis distributed lock based on the X-Idempotency-Key header before executing the payment workflow.',
    commonMistake: 'Confusing "safe" HTTP methods (GET, HEAD) with "idempotent" methods (PUT, DELETE). Safe methods never mutate state; idempotent methods may mutate state, but repeating the request produces the identical system state.',
    speakingPrompt: 'Walk through how your microservice handles a network timeout when a client retries a payment request with the same idempotency key.',
    vietnameseSupportNote: '"Idempotency" (tính lũy thừa) nghĩa là thực hiện 1 lần hay n lần thì kết quả cuối cùng trên hệ thống là như nhau. Tuyệt đối tránh nhầm với Safe methods.',
    difficulty: 'SENIOR',
    relatedStage: 'DESIGN',
    tags: ['rest', 'idempotency', 'distributed-systems', 'redis-lease'],
    keyPhrases: [
      'network timeout retry storm',
      'atomic SETNX lease with TTL',
      'side-effect deduplication',
      'at-least-once delivery semantics',
    ],
    codeSnippet: {
      language: 'java',
      code: `// Idempotency check with Redis atomic operation
public PaymentResponse processPayment(String idempotencyKey, PaymentRequest request) {
    Boolean acquired = redisTemplate.opsForValue()
        .setIfAbsent("idemp:" + idempotencyKey, "IN_PROGRESS", Duration.ofMinutes(5));

    if (Boolean.FALSE.equals(acquired)) {
        return fetchExistingPaymentResult(idempotencyKey);
    }
    // Proceed with payment execution...
}`,
      description: 'Atomic setIfAbsent prevents concurrent duplicate execution across distributed instances.',
    },
  },
  {
    id: 'eng-rest-02',
    section: 'rest-distributed',
    term: 'Circuit Breaker State Transitions & Fallback Strategies',
    topic: 'Resilience & Fault Tolerance',
    plainEnglishExplanation: 'A circuit breaker stops your service from hammering a failing external service. It flips open when errors exceed a limit, fails fast to save time, and slowly tests the waters to see if it recovered.',
    seniorExplanation: 'A circuit breaker transitions from CLOSED to OPEN when error rates or slow-call percentages breach a defined sliding-window threshold. In the OPEN state, inbound calls fail fast or return cached fallbacks immediately. After a wait duration, it enters HALF-OPEN, routing a canary probe batch to evaluate downstream health.',
    exampleSentence: 'When the third-party credit score provider experienced severe latency spikes, our Resilience4j circuit breaker tripped OPEN within two seconds, shielding our worker threads from exhaustion.',
    commonMistake: 'Returning generic 500 errors in circuit breaker fallbacks. A senior engineer returns a graceful degradation response, such as cached data, queued offline reconciliation, or a clean 503 with Retry-After header.',
    speakingPrompt: 'Explain how you configure sliding-window size, failure-rate threshold, and half-open trial calls in Resilience4j for a mission-critical dependency.',
    vietnameseSupportNote: 'Ba trạng thái: CLOSED (bình thường), OPEN (ngắt mạch, fail fast ngay), HALF-OPEN (cho một vài request thử nghiệm đi qua để kiểm tra phục hồi).',
    difficulty: 'SENIOR',
    relatedStage: 'BREAK',
    tags: ['resilience4j', 'circuit-breaker', 'fault-tolerance', 'fallback'],
    keyPhrases: [
      'closed to open state transition',
      'sliding-window failure rate threshold',
      'half-open canary trial probe',
      'graceful degradation fallback',
    ],
  },

  // 4. Database, Transactions, and JPA
  {
    id: 'eng-db-01',
    section: 'database-jpa',
    term: 'Transaction Isolation Levels & Phantom Reads',
    topic: 'ACID Guarantees & Concurrency Control',
    plainEnglishExplanation: 'Rules determining whether running transactions can see each other\'s unfinished changes. Higher isolation prevents weird bugs like ghost rows appearing, but slows down database performance.',
    seniorExplanation: 'ANSI SQL defines four isolation levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable. In Read Committed (PostgreSQL default), each statement sees a snapshot of committed data at statement execution time, preventing dirty reads. Repeatable Read locks the snapshot to transaction start time, preventing non-repeatable reads and phantom rows via MVCC.',
    exampleSentence: 'Under high inventory contention, we elevated our checkout transaction isolation to Repeatable Read with optimistic locking (@Version) to eradicate phantom allocation anomalies without incurring table-level lock contention.',
    commonMistake: 'Assuming JPA @Version solves all race conditions. Optimistic locking catches conflicts on update of an existing entity, but does not prevent phantom inserts without unique database constraints.',
    speakingPrompt: 'Compare Pessimistic Locking (SELECT ... FOR UPDATE) versus Optimistic Locking (@Version) in terms of latency, database connection pool exhaustion, and deadlock frequency.',
    vietnameseSupportNote: 'Các hiện tượng: Dirty Read (đọc dữ liệu chưa commit), Non-repeatable Read (cùng câu query đọc 1 dòng ra 2 giá trị khác nhau), Phantom Read (query theo dải điều kiện thì xuất hiện dòng mới được chèn).',
    difficulty: 'SENIOR',
    relatedStage: 'DEFEND',
    tags: ['database', 'acid', 'isolation-levels', 'mvcc', 'optimistic-locking'],
    keyPhrases: [
      'multi-version concurrency control (MVCC)',
      'dirty reads, non-repeatable reads, phantom rows',
      'pessimistic row locking vs optimistic version check',
      'connection pool exhaustion under long locks',
    ],
  },
  {
    id: 'eng-db-02',
    section: 'database-jpa',
    term: 'The N+1 Query Problem & Fetch Join Optimization',
    topic: 'JPA Performance & Hibernate Internals',
    plainEnglishExplanation: 'When your code queries for a list of items (1 query), and then Hibernate makes a separate query for every single item\'s related details (N queries), causing hundreds of slow queries.',
    seniorExplanation: 'The N+1 select problem occurs when traversing lazy-loaded associations within a collection. Hibernate executes an initial query for the parent entities followed by N secondary queries for each associated child collection. We resolve this by applying JPQL fetch joins, EntityGraphs, or batch fetching (hibernate.default_batch_fetch_size) to collapse execution into a single join query.',
    exampleSentence: 'Profiling our customer dashboard revealed that loading fifty orders triggered fifty-one SQL queries; applying a single `JOIN FETCH o.items` eliminated ninety percent of database roundtrips.',
    commonMistake: 'Applying `FetchType.EAGER` everywhere to "fix" N+1. EAGER loading causes memory bloat, pulls unnecessary graphs on simple lookups, and still creates N+1 queries when using JPQL queries.',
    speakingPrompt: 'Explain how you detect N+1 queries in automated integration tests using datasource-proxy or Spring test assertions.',
    vietnameseSupportNote: 'Tránh dùng FetchType.EAGER. Luôn ưu tiên Lazy loading kết hợp `JOIN FETCH` trong JPQL hoặc `@EntityGraph` khi cần truy vấn cả cụm dữ liệu.',
    difficulty: 'MID',
    relatedStage: 'OPTIMIZE',
    tags: ['jpa', 'hibernate', 'n-plus-one', 'fetch-join', 'performance'],
    keyPhrases: [
      'lazy-loaded association traversal',
      'secondary queries per entity instance',
      'JPQL fetch join vs @EntityGraph',
      'batch size configuration reduces query count',
    ],
  },

  // 5. Kafka, Redis, and Event-Driven Architecture
  {
    id: 'eng-eda-01',
    section: 'kafka-redis',
    term: 'Kafka Consumer Lag, Rebalance Storms & Partition Keys',
    topic: 'Event Streaming & Scalability',
    plainEnglishExplanation: 'Consumer lag is how far behind your consumers are from the newest messages. A rebalance storm happens when consumers drop out, causing the group to pause and fight over who reads which partition.',
    seniorExplanation: 'Consumer lag measures the delta between the log-end offset and the consumer current committed offset. If consumer processing time exceeds `max.poll.interval.ms`, Kafka assumes the consumer has crashed and kicks it from the consumer group, triggering a partition rebalance storm that halts message consumption across all active instances.',
    exampleSentence: 'During Black Friday, our inventory consumer lagged by over two million records because a downstream third-party call blocked the main polling loop, exceeding the max.poll.interval.ms threshold and initiating repeated rebalances.',
    commonMistake: 'Increasing consumer instances beyond the number of topic partitions. Partitions are the unit of parallelism in Kafka; extra consumers beyond the partition count remain completely idle.',
    speakingPrompt: 'Explain how you design partition keys to preserve strict message ordering for a user account while avoiding hot partition skew in high-volume topics.',
    vietnameseSupportNote: '"Consumer lag" là số message bị tồn đọng chưa kịp xử lý. "Rebalance storm" là hiện tượng các worker liên tục bị ngắt kết nối và tái phân chia partition, làm tê liệt quá trình tiêu thụ message.',
    difficulty: 'SENIOR',
    relatedStage: 'DEBUG',
    tags: ['kafka', 'consumer-lag', 'rebalance', 'partition-key'],
    keyPhrases: [
      'delta between log-end and committed offset',
      'max.poll.interval.ms exceeded',
      'partition rebalance cascade',
      'unit of parallelism in topic partitions',
    ],
  },
  {
    id: 'eng-eda-02',
    section: 'kafka-redis',
    term: 'Cache Penetration, Breakdown, and Avalanche',
    topic: 'Redis Caching Topologies',
    plainEnglishExplanation: 'Three classic caching disasters: querying things that do not exist (penetration), one super-hot item expiring while millions request it (breakdown), and all items expiring at the same second (avalanche).',
    seniorExplanation: 'Cache Penetration occurs when requests query nonexistent keys, bypassing cache to hit the DB repeatedly; solved via Bloom filters or caching null objects with short TTL. Cache Breakdown happens when a high-traffic hot key expires, causing concurrent requests to stampede the DB; solved via mutex locks or background refreshing. Cache Avalanche occurs when mass keys expire simultaneously; mitigated by adding random jitter to TTLs.',
    exampleSentence: 'We prevented cache avalanche on our product catalogue by applying a randomized TTL jitter of plus or minus five minutes to our standard one-hour cache duration.',
    commonMistake: 'Failing to distinguish breakdown (single hot key expiring) from avalanche (widespread simultaneous mass expiration).',
    speakingPrompt: 'Differentiate between cache breakdown and cache avalanche and outline your architectural mitigation for each during a design review.',
    vietnameseSupportNote: 'Penetration = key không tồn tại cả ở cache lẫn DB; Breakdown = 1 hot key vừa hết hạn bị bão request đè xuống DB; Avalanche = hàng nghìn key cùng hết hạn 1 thời điểm gây sập DB.',
    difficulty: 'SENIOR',
    relatedStage: 'DESIGN',
    tags: ['redis', 'caching', 'bloom-filter', 'avalanche', 'ttl-jitter'],
    keyPhrases: [
      'cache penetration vs breakdown vs avalanche',
      'bloom filter for nonexistent key rejection',
      'mutex lock on hot key regeneration',
      'randomized TTL jitter avoids stampedes',
    ],
  },

  // 6. Debugging and Incident Response
  {
    id: 'eng-incident-01',
    section: 'debugging-incident',
    term: 'Root Cause Analysis (RCA) & Postmortem Communication',
    topic: 'Production Engineering & Blameless Culture',
    plainEnglishExplanation: 'Finding the real underlying reason why something broke in production, explaining it clearly to stakeholders, and putting safeguards in place without blaming individuals.',
    seniorExplanation: 'A blameless postmortem constructs a factual, second-by-second timeline of the incident, identifies contributing systemic factors rather than human error, evaluates time to detection (MTTD) and time to recovery (MTTR), and commits to verifiable remediation action items with assigned owners and deadlines.',
    exampleSentence: 'In the postmortem, we demonstrated that the root cause was not an operator typo, but a missing timeout on the internal connection pool that cascaded into thread exhaustion under high traffic.',
    commonMistake: 'Writing "human error" as the root cause. Senior engineers investigate why the system permitted the mistake, why safeguards failed to detect it, and why rollback was not instantaneous.',
    speakingPrompt: 'Lead a mock incident postmortem briefing explaining why our microservice suffered a 15-minute outage and what preventive guardrails have been deployed.',
    vietnameseSupportNote: 'Nguyên tắc "Blameless postmortem": Không chỉ trích cá nhân. Tập trung vào "systemic failure" (lỗi quy trình, thiếu guardrail) và "remediation action items" (hành động khắc phục cụ thể).',
    difficulty: 'SENIOR',
    relatedStage: 'EXPLAIN',
    tags: ['incident', 'rca', 'postmortem', 'blameless', 'mttr'],
    keyPhrases: [
      'blameless postmortem culture',
      'mean time to detection (MTTD) and recovery (MTTR)',
      'contributing systemic factors',
      'actionable remediation items with owners',
    ],
  },
  {
    id: 'eng-incident-02',
    section: 'debugging-incident',
    term: 'Analyzing Thread Dumps for Deadlocks & Thread Pool Saturation',
    topic: 'JVM Diagnostics & Troubleshooting',
    plainEnglishExplanation: 'Taking a snapshot of what every single worker inside the Java application is doing right now to catch threads waiting on each other forever or drowning in blocked calls.',
    seniorExplanation: 'A thread dump generated via `jcmd <pid> Thread.print` or visual tools reveals thread states: RUNNABLE, TIMED_WAITING, WAITING, and BLOCKED. A deadlock manifests as two or more threads each holding a lock while waiting to acquire a lock held by another thread, creating a cyclical wait dependency in the JVM monitor lock table.',
    exampleSentence: 'Inspecting the thread dump revealed that all two hundred Tomcat request worker threads were in the BLOCKED state, waiting on a synchronized block inside the legacy currency converter singleton.',
    commonMistake: 'Restarting production immediately without capturing diagnostics. A senior engineer captures a heap dump (`jcmd GC.heap_dump`) and thread dumps before initiating a graceful pod restart.',
    speakingPrompt: 'Explain how you triage a service that is unresponsive to health checks while CPU usage sits at near zero percent.',
    vietnameseSupportNote: 'CPU 0% mà app đơ là dấu hiệu kinh điển của Deadlock hoặc Connection Pool bị cạn kiệt (mọi thread đều ở trạng thái BLOCKED hoặc WAITING). Phải chụp thread dump trước khi restart pod!',
    difficulty: 'STAFF',
    relatedStage: 'DEBUG',
    tags: ['thread-dump', 'deadlock', 'jcmd', 'tomcat-saturation', 'jvm'],
    keyPhrases: [
      'cyclical wait dependency in monitor locks',
      'Tomcat worker thread pool exhaustion',
      'capture thread dump prior to pod restart',
      'triage zero-CPU unresponsiveness',
    ],
  },

  // 7. System Design Discussion
  {
    id: 'eng-sys-01',
    section: 'system-design',
    term: 'Backpressure & Rate Limiting (Token Bucket vs Leaky Bucket)',
    topic: 'Distributed Flow Control & System Defense',
    plainEnglishExplanation: 'Backpressure is how a system tells its callers "slow down, I cannot handle this much work right now." Rate limiting sets a speed limit so bad callers cannot overwhelm your servers.',
    seniorExplanation: 'Backpressure signals upstream producers to throttle data generation when downstream consumers approach buffer saturation. Rate limiting enforces traffic quotas at the API gateway: Token Bucket allows bursts up to bucket capacity while refilling at a steady rate; Leaky Bucket smoothens outbound traffic to a strictly constant rate.',
    exampleSentence: 'To protect our core payment database from flash sales spikes, we placed a token bucket rate limiter in our Kong API Gateway combined with reactive backpressure in our WebFlux event pipeline.',
    commonMistake: 'Assuming rate limiting and backpressure are identical. Rate limiting drops or delays client requests based on client identity; backpressure propagates load signals backwards through the system pipeline to slow upstream ingestion.',
    speakingPrompt: 'During a system design interview, compare Token Bucket versus Sliding Window Log for an enterprise API with strict per-minute quota tiers.',
    vietnameseSupportNote: '"Backpressure" (áp lực ngược) là cơ chế báo ngược cho bên gửi giảm tốc độ lại khi buffer của bên nhận sắp tràn. "Token bucket" cho phép gửi theo cụm (burst), "Leaky bucket" bắt buộc tốc độ đều tuyệt đối.',
    difficulty: 'STAFF',
    relatedStage: 'DESIGN',
    tags: ['system-design', 'backpressure', 'rate-limiting', 'token-bucket'],
    keyPhrases: [
      'buffer saturation prevention',
      'upstream flow throttling',
      'token bucket burst accommodation',
      'leaky bucket constant-rate smoothing',
    ],
  },
  {
    id: 'eng-sys-02',
    section: 'system-design',
    term: 'CAP Theorem & Eventual Consistency Trade-Offs',
    topic: 'Distributed Data Storage & Consensus',
    plainEnglishExplanation: 'When network connections between servers break, you must choose between staying completely accurate (Consistency) or staying open for business (Availability). You cannot have both during a network split.',
    seniorExplanation: 'The CAP theorem dictates that in the presence of a network partition (P), a distributed system must choose between strong consistency (C) or high availability (A). Financial ledger services typically favor CP by rejecting ambiguous writes during splits, whereas social media feeds choose AP with eventual consistency, resolving conflicts later using CRDTs or last-write-wins.',
    exampleSentence: 'Because double-spending carries immediate financial loss, we designed our checkout ledger as a CP system that fails fast during network partitions rather than accepting unverified optimistic writes.',
    commonMistake: 'Claiming a system "chooses CA (Consistency and Availability without Partition tolerance)". In physical networks, network partitions are an unavoidable physical reality; you cannot choose "no partitions".',
    speakingPrompt: 'Defend why your payment service chooses CP over AP, and explain how you handle eventual consistency in read-heavy reporting microservices.',
    vietnameseSupportNote: 'Trong thực tế mạng vật lý, "P" (Partition) luôn luôn có thể xảy ra. Do đó lựa chọn thực tế luôn là CP (chấp nhận từ chối một số request để bảo toàn tính đúng đắn) hoặc AP (vẫn trả lời nhưng dữ liệu có thể trễ/chưa đồng bộ).',
    difficulty: 'STAFF',
    relatedStage: 'DEFEND',
    tags: ['cap-theorem', 'eventual-consistency', 'distributed-systems', 'trade-offs'],
    keyPhrases: [
      'network partition is an inevitability',
      'strong consistency (CP) vs high availability (AP)',
      'eventual consistency and conflict resolution',
      'read repair and asynchronous replication lag',
    ],
  },

  // 8. Code Review and Technical Leadership
  {
    id: 'eng-cr-01',
    section: 'code-review',
    term: 'Constructive Pull Request Feedback & Architectural Guardrails',
    topic: 'Engineering Culture & Code Quality',
    plainEnglishExplanation: 'Writing review comments that are clear, polite, and educational, explaining the "why" behind changes instead of just saying "change this."',
    seniorExplanation: 'High-leverage code reviews distinguish between subjective stylistic preferences (automated via linters), local code improvements (suggested with code snippets), and blocking architectural risks (security vulnerabilities, missing transaction boundaries, unindexed database queries). Feedback is framed collaboratively with clear rationale.',
    exampleSentence: 'Instead of writing "Bad code, refactor this," the staff engineer wrote: "Nit: To avoid N+1 queries when loading user profiles, what do you think about using an @EntityGraph here? Here is a quick example."',
    commonMistake: 'Blocking pull requests on formatting or variable naming that should be enforced automatically by Spotless or Checkstyle in the CI pipeline.',
    speakingPrompt: 'Role-play giving feedback on a PR where a junior developer introduced a blocking synchronized block inside a high-throughput reactive WebFlux controller.',
    vietnameseSupportNote: 'Cách phân loại comment review chuẩn quốc tế: "Blocker" (lỗi nghiêm trọng bắt buộc sửa), "Suggestion" (gợi ý cải thiện), "Nit / Nitpick" (chi tiết nhỏ tùy ý), "Question" (cần làm rõ).',
    difficulty: 'MID',
    relatedStage: 'REVIEW',
    tags: ['code-review', 'leadership', 'communication', 'constructive-feedback'],
    keyPhrases: [
      'distinguish blocking architectural risks from stylistic nits',
      'provide rationale and code suggestions',
      'collaborative tone ("What do you think about...")',
      'automate style enforcement in CI',
    ],
  },
  {
    id: 'eng-cr-02',
    section: 'code-review',
    term: 'Driving Architectural Consensus via RFCs (Request for Comments)',
    topic: 'Staff Leadership & Technical Strategy',
    plainEnglishExplanation: 'Writing a short, clear document proposing a big change, listing the pros and cons, and inviting the team to debate and agree before writing code.',
    seniorExplanation: 'An RFC (Request for Comments) articulates a technical problem, outlines non-functional requirements, evaluates at least two alternative architectures with trade-off matrices, and seeks team consensus prior to code implementation, mitigating high-cost refactoring late in the delivery cycle.',
    exampleSentence: 'Before replacing our legacy REST polling architecture with Kafka CDC, we circulated an RFC evaluating Debezium versus custom application events, achieving unanimous approval across five squads.',
    commonMistake: 'Writing an RFC that only presents one solution. A rigorous senior RFC must evaluate rejected alternatives and explain why they were disqualified.',
    speakingPrompt: 'Present the executive summary of an RFC proposing the migration from a monolithic database to a schema-per-service microservice model.',
    vietnameseSupportNote: 'Tài liệu RFC bắt buộc phải có mục: "Alternatives Considered" (Các giải pháp thay thế đã xem xét) và "Trade-offs" (Cái giá phải trả / nhược điểm của giải pháp được chọn).',
    difficulty: 'STAFF',
    relatedStage: 'DEFEND',
    tags: ['rfc', 'architecture', 'consensus', 'leadership', 'trade-offs'],
    keyPhrases: [
      'evaluates alternative architectures with trade-off matrix',
      'aligns cross-functional engineering teams',
      'clarifies non-functional requirements upfront',
      'documents rejected options and rationale',
    ],
  },

  // 9. Senior Interview Answers
  {
    id: 'eng-interview-01',
    section: 'senior-interview',
    term: 'The STAR Method for Behavioral & System Incident Questions',
    topic: 'Senior Engineering Interview Technique',
    plainEnglishExplanation: 'A formula to answer interview questions smoothly: Situation (the background), Task (your goal), Action (what you actually did), and Result (the measurable outcome).',
    seniorExplanation: 'The STAR framework (Situation, Task, Action, Result) anchors behavioral answers in concrete leadership impact. Senior candidates spend 70% of their response on "Action" (technical rationale, trade-offs navigated, delegation, and guardrails built) and conclude with quantifiable "Result" (latency reduction, cost savings, zero recurrence).',
    exampleSentence: 'In my Amazon interview, I answered the high-severity outage question using STAR, highlighting how my quick heap dump analysis identified a memory leak within twelve minutes.',
    commonMistake: 'Using "We" for every sentence without clarifying your individual contribution. Interviewers want to know what YOU personally designed, decided, or coded.',
    speakingPrompt: 'Answer this prompt: "Tell me about a time you made an architectural decision that failed in production. How did you handle it?" using the STAR method.',
    vietnameseSupportNote: 'Khi phỏng vấn Senior tại các tập đoàn Global: Luôn nói rõ "I analyzed...", "I proposed...", "I implemented...". Kết thúc bằng con số định lượng (ví dụ: "reduced p99 latency by 35%").',
    difficulty: 'SENIOR',
    relatedStage: 'INTERVIEW',
    tags: ['star-method', 'behavioral', 'interview-qa', 'leadership'],
    keyPhrases: [
      'structure with Situation, Task, Action, Result',
      'emphasize personal technical contribution and rationale',
      'quantifiable business and engineering outcome',
      'lessons learned and preventive systemic changes',
    ],
  },
  {
    id: 'eng-interview-02',
    section: 'senior-interview',
    term: 'Defending Technology Selection Trade-Offs (PostgreSQL vs MongoDB)',
    topic: 'Architecture Defense & Evaluation Rubric',
    plainEnglishExplanation: 'Explaining why you chose a specific tool by being honest about its downsides and showing why its benefits won for your specific project requirements.',
    seniorExplanation: 'A staff-level technology defense never proclaims a single tool as universally superior. It contrasts explicit architectural dimensions: schema flexibility versus relational integrity, multi-document ACID transactions versus horizontal sharding simplicity, operational team familiarity, and backup recovery semantics.',
    exampleSentence: 'While MongoDB offered dynamic document schemas, we chose PostgreSQL with JSONB because our transactional domain required strict foreign key constraints and financial ledger guarantees that MongoDB could not guarantee without custom application validation.',
    commonMistake: 'Dismissing the unchosen technology as "slow" or "bad." Strong engineers acknowledge where the competitor shines and explain why their specific constraints disqualified it.',
    speakingPrompt: 'Defend choosing Kafka over RabbitMQ for an event-driven architecture that requires message replayability and multi-consumer independent offsets.',
    vietnameseSupportNote: 'Khi bảo vệ công nghệ: Không bao giờ nói "công nghệ kia tệ lắm". Hãy nói: "MongoDB rất tốt cho dynamic schema, tuy nhiên với bài toán tài chính này, chúng tôi cần strict ACID và foreign keys, vì vậy PostgreSQL là lựa chọn tối ưu hơn."',
    difficulty: 'STAFF',
    relatedStage: 'DEFEND',
    tags: ['trade-off-defense', 'interview-qa', 'database-selection', 'architecture'],
    keyPhrases: [
      'there are no solutions, only trade-offs',
      'contrast functional and operational dimensions',
      'acknowledge strengths of unchosen alternatives',
      'ground choice in domain constraints and SLAs',
    ],
  },

  // 10. Daily Explanation Drill
  {
    id: 'eng-drill-01',
    section: 'daily-drill',
    term: 'The 60-Second Senior Elevator Pitch: Microservices vs Monolith',
    topic: 'Verbal Fluency & Technical Conciseness',
    plainEnglishExplanation: 'Explaining a complex architectural choice in under one minute in plain, punchy English that both developers and managers immediately understand.',
    seniorExplanation: 'A modular monolith maximizes developer velocity through single-process deployment, zero network latency between modules, and ACID database transactions. We only decompose into microservices when independent team deployment cadence, distinct scaling bottlenecks, or strict fault domain isolation justify the substantial operational overhead of distributed tracing, eventual consistency, and network latency.',
    exampleSentence: 'In sixty seconds, the principal engineer articulated that our team size of twelve did not justify twenty microservices, convincing leadership to adopt a modular monolith instead.',
    commonMistake: 'Rambling past two minutes or diving straight into Kubernetes details before explaining the core business and organizational reasons.',
    speakingPrompt: 'Set a timer for 60 seconds. Explain why you would choose a modular monolith over microservices for an early-stage fintech product.',
    vietnameseSupportNote: 'Mẹo luyện nói 60s: Dùng cấu trúc 3 phần: 1. Core value của Monolith (tốc độ, 0 network hop) -> 2. Cái giá của Microservices (distributed tracing, eventual consistency) -> 3. Điều kiện cần để chuyển đổi (team size, scaling bottleneck).',
    difficulty: 'SENIOR',
    relatedStage: 'EXPLAIN',
    tags: ['elevator-pitch', 'monolith-vs-microservices', 'verbal-fluency', '60-second-drill'],
    keyPhrases: [
      'single-process deployment velocity',
      'zero network latency between domains',
      'independent deployment cadence justification',
      'operational tax of distributed systems',
    ],
  },
  {
    id: 'eng-drill-02',
    section: 'daily-drill',
    term: 'The 60-Second Senior Elevator Pitch: Why Kafka is Not a Message Queue',
    topic: 'Verbal Fluency & Distributed Systems Clarification',
    plainEnglishExplanation: 'Explaining clearly why Kafka is an append-only distributed commit log rather than a traditional broker like RabbitMQ or ActiveMQ in 60 seconds.',
    seniorExplanation: 'Traditional message queues like RabbitMQ store messages transiently and delete them once acknowledged by a consumer. In contrast, Kafka is a distributed, append-only commit log where immutable messages persist on disk according to a retention policy. This log architecture allows multiple independent consumer groups to read at their own pace, replay historical events from any arbitrary offset, and achieve massive sequential I/O throughput.',
    exampleSentence: 'The candidate stood out immediately by explaining in 45 seconds that Kafka is an immutable event log with rewindable offsets rather than a broker that removes messages upon consumption.',
    commonMistake: 'Saying Kafka is just "a faster RabbitMQ". Their architectures, retention models, and routing capabilities solve fundamentally distinct problems.',
    speakingPrompt: 'Record yourself explaining in under 60 seconds why an audit logging service needs Kafka\'s rewindable offsets instead of RabbitMQ.',
    vietnameseSupportNote: 'Điểm cốt lõi trong 60 giây: RabbitMQ xóa message sau khi consume; Kafka lưu log vĩnh viễn (hoặc theo TTL) trên đĩa, cho phép replay lại từ bất kỳ offset nào.',
    difficulty: 'SENIOR',
    relatedStage: 'EXPLAIN',
    tags: ['kafka', 'message-queue-vs-log', 'rewindable-offsets', '60-second-drill'],
    keyPhrases: [
      'append-only distributed commit log',
      'transient queues vs immutable persisted logs',
      'independent consumer groups with rewindable offsets',
      'high sequential disk I/O throughput',
    ],
  },
];
