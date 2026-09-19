import { 
  RoadmapDay, 
  LearningTask, 
  KnowledgeTopic, 
  ReviewCard, 
  DSAProblem, 
  SystemDesignProblem, 
  ClaudeCodeExercise, 
  EnglishSession, 
  ProjectFeature, 
  IncidentScenario, 
  InterviewQuestion 
} from '../types';

export const INITIAL_ROADMAP_DAYS: RoadmapDay[] = [
  // Phase 1: Core Java (Days 1 - 30)
  {
    dayNumber: 1,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Java Memory Model, Stack vs Heap & Big-O',
    coreConcepts: ['JMM Architecture', 'Stack vs Heap allocation', 'Object Header & Memory Layout', 'Escape Analysis'],
    handsOnGoal: 'Inspect Object Layout using JOL (Java Object Layout) and analyze memory footprint',
    dsaFocus: 'Arrays & Two Pointers (Two Sum, Valid Palindrome)',
    systemDesignFocus: 'Latency Numbers Every Programmer Should Know (RAM vs SSD vs Network)',
    englishFocus: 'Self Introduction as Senior Java Engineer & 5 Core Tech Sentences',
    claudeCodeFocus: 'Claude Code CLI Setup, CLAUDE.md baseline structure',
    completed: true
  },
  {
    dayNumber: 2,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Deep Dive into HashMap & Hash Collisions',
    coreConcepts: ['HashMap internal table resizing', 'Treeify threshold (Red-Black Tree)', 'equals() & hashCode() contract', 'Bit manipulation in hash()'],
    handsOnGoal: 'Build a custom thread-unsafe HashMap from scratch and benchmark resize spikes',
    dsaFocus: 'Hashing (Group Anagrams, Longest Consecutive Sequence)',
    systemDesignFocus: 'Consistent Hashing concept & ring distribution',
    englishFocus: 'Explain how HashMap works under the hood in 2 minutes',
    claudeCodeFocus: 'Repository exploration with /search and architectural indexing',
    completed: true
  },
  {
    dayNumber: 3,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Java Generics, Type Erasure & Wildcards',
    coreConcepts: ['PECS (Producer Extends, Consumer Super)', 'Type Erasure runtime implications', 'Bridge methods', 'Reifiable vs Non-reifiable types'],
    handsOnGoal: 'Implement generic EventBus with type-safe subscription and covariance handling',
    dsaFocus: 'Sliding Window (Best Time to Buy and Sell Stock)',
    systemDesignFocus: 'Event-driven architecture primitives',
    englishFocus: 'Explain Type Erasure trade-offs in JVM bytecode',
    claudeCodeFocus: 'Using Plan mode vs Act mode for multi-file refactoring',
    completed: false
  },
  {
    dayNumber: 4,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Java Streams Internals & Spliterator',
    coreConcepts: ['Stream pipeline stages (Head, StatelessOp, StatefulOp)', 'Spliterator splitting logic', 'Parallel Streams ForkJoinPool commonPool caveats', 'Lazy evaluation bytecode'],
    handsOnGoal: 'Write a custom high-performance chunked Spliterator for memory-mapped file reading',
    dsaFocus: 'Sliding Window (Longest Substring Without Repeating Characters)',
    systemDesignFocus: 'Stream processing vs Batch processing tradeoffs',
    englishFocus: 'Why parallelStream() in web requests can starve the thread pool',
    claudeCodeFocus: 'Creating unit tests with Claude Code subagents',
    completed: false
  },
  {
    dayNumber: 5,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'JVM Garbage Collection (G1, ZGC, Shenandoah)',
    coreConcepts: ['Generational hypothesis', 'Card Table & Remembered Sets', 'ZGC Color Pointers & Load Barriers', 'GC Pause times tuning (-XX:+UseG1GC, -XX:MaxGCPauseMillis)'],
    handsOnGoal: 'Generate OutOfMemoryError and analyze Heap Dump using Eclipse Memory Analyzer (MAT)',
    dsaFocus: 'Stack (Valid Parentheses, Min Stack)',
    systemDesignFocus: 'Garbage Collection impact on 99th percentile (p99) API latency',
    englishFocus: 'How to diagnose a Memory Leak in a live production environment',
    claudeCodeFocus: 'CLAUDE.md custom commands and rules setup',
    completed: false
  },
  {
    dayNumber: 6,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Threads, Synchronization & JMM Happens-Before',
    coreConcepts: ['volatile semantics & CPU Memory Barriers', 'Happens-before order rules', 'synchronized monitor enter/exit', 'Deadlock, Livelock & Thread Starvation'],
    handsOnGoal: 'Simulate a classic Bank Transfer Deadlock and write deterministic detection algorithm',
    dsaFocus: 'Stack (Evaluate Reverse Polish Notation, Daily Temperatures)',
    systemDesignFocus: 'Distributed Deadlocks in two-phase locking databases',
    englishFocus: 'Explain volatile keyword vs atomic variables in Java',
    claudeCodeFocus: 'Prompt engineering for precise concurrency bug finding',
    completed: false
  },
  {
    dayNumber: 7,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Executors, ThreadPoolExecutor Tuning & Thread Pools',
    coreConcepts: ['corePoolSize vs maxPoolSize vs queueCapacity', 'RejectedExecutionHandler policies (CallerRuns, Abort, Discard)', 'ThreadLocal memory leak mechanics', 'Thread factory & MDC context propagation'],
    handsOnGoal: 'Build custom ResilientThreadPoolExecutor with dynamic runtime metrics and MDC propagation',
    dsaFocus: 'Binary Search (Binary Search, Search a 2D Matrix)',
    systemDesignFocus: 'Worker Pool architecture and Backpressure handling',
    englishFocus: 'Walk through tuning thread pool parameters for I/O-heavy vs CPU-heavy loads',
    claudeCodeFocus: 'Writing architectural decision records (ADRs) with AI',
    completed: false
  },
  {
    dayNumber: 8,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'CompletableFuture & Reactive Asynchronous Pipelines',
    coreConcepts: ['supplyAsync, thenApplyAsync, thenCompose, thenCombine', 'allOf exception handling with exceptionally / handle', 'Custom Executor binding', 'Asynchronous timeout with orTimeout / completeOnTimeout'],
    handsOnGoal: 'Build Async Order Aggregator aggregating Catalog, Inventory, Shipping & Pricing services concurrently',
    dsaFocus: 'Binary Search (Find Minimum in Rotated Sorted Array, Search in Rotated Sorted Array)',
    systemDesignFocus: 'Fan-out / Fan-in patterns in API Gateways',
    englishFocus: 'Explain how CompletableFuture handles exceptions across chained stages',
    claudeCodeFocus: 'Refactoring synchronous legacy code to CompletableFuture with Claude',
    completed: false
  },
  {
    dayNumber: 9,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Java 21 Virtual Threads (Project Loom)',
    coreConcepts: ['Carrier Threads vs Virtual Threads', 'Continuation yielding mechanism', 'Thread pinning causes (synchronized blocks, native code)', 'Virtual Threads vs Reactive (WebFlux) performance comparison'],
    handsOnGoal: 'Benchmark 100,000 concurrent HTTP requests with Virtual Threads vs Platform Thread Pool',
    dsaFocus: 'Linked List (Reverse Linked List, Merge Two Sorted Lists)',
    systemDesignFocus: 'Thread-per-request scaling limit changes with Loom',
    englishFocus: 'Describe Virtual Threads internal scheduling and the pinning pitfall',
    claudeCodeFocus: 'Testing Virtual Thread pinning using JDK Flight Recorder',
    completed: false
  },
  {
    dayNumber: 10,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Lock-Free Programming, CAS & java.util.concurrent.atomic',
    coreConcepts: ['AtomicInteger, AtomicReference & Compare-And-Swap (CAS)', 'ABA Problem and AtomicStampedReference', 'LongAdder vs AtomicLong under high contention', 'False Sharing & @Contended'],
    handsOnGoal: 'Build a Lock-Free Ring Buffer (Disruptor pattern) for telemetry event queuing',
    dsaFocus: 'Linked List (Reorder List, Remove Nth Node From End of List)',
    systemDesignFocus: 'LMAX Disruptor architecture in High-Frequency Trading systems',
    englishFocus: 'Why CAS is faster than mutex locks and when CAS degrades',
    claudeCodeFocus: 'Benchmarking code with JMH (Java Microbenchmark Harness) + Claude Code',
    completed: false
  },
  {
    dayNumber: 15,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Advanced JVM Profiling, Async-Profiler & Flamegraphs',
    coreConcepts: ['CPU vs Wall-clock vs Allocation profiling', 'Safepoint bias in sampling profilers', 'Analyzing Flamegraphs for hot allocations', 'Off-heap memory analysis with Native Memory Tracking (NMT)'],
    handsOnGoal: 'Profile a high-throughput JSON processing service with async-profiler and eliminate hot allocations',
    dsaFocus: 'Trees (Invert Binary Tree, Maximum Depth of Binary Tree)',
    systemDesignFocus: 'Continuous profiling in production Kubernetes pods',
    englishFocus: 'Walkthrough reading an async-profiler Flamegraph in an incident triage',
    claudeCodeFocus: 'Automating profiler flamegraph analysis with prompt templates',
    completed: false
  },
  {
    dayNumber: 30,
    phaseNumber: 1,
    phaseName: 'Core Java & Concurrency',
    theme: 'Phase 1 Capstone: High-Throughput In-Memory Order Book',
    coreConcepts: ['Cache-friendly memory layouts', 'Lock-free queues', 'Disruptor ring buffers', 'Zero-GC serialization techniques'],
    handsOnGoal: 'Deliver fully tested in-memory matching engine supporting 500k ops/sec with < 50us p99',
    dsaFocus: 'Trees (Binary Tree Level Order Traversal, Lowest Common Ancestor)',
    systemDesignFocus: 'Stock exchange matching engine architecture',
    englishFocus: 'Phase 1 Mock Tech Screen on Core Java & Concurrency (45 mins)',
    claudeCodeFocus: 'Full project code review and benchmark verification suite',
    completed: false
  },

  // Phase 2: Spring Backend (Days 31 - 60)
  {
    dayNumber: 31,
    phaseNumber: 2,
    phaseName: 'Spring Boot 3 Deep Dive',
    theme: 'Spring IoC Container, Bean Lifecycle & Circular Dependencies',
    coreConcepts: ['BeanFactory vs ApplicationContext', 'BeanPostProcessor & BeanFactoryPostProcessor', 'Three-level Cache in DefaultSingletonBeanRegistry', 'Proxy-based injection with @Lazy'],
    handsOnGoal: 'Build custom @AuditLog annotation processed via custom BeanPostProcessor and CGLIB Proxy',
    dsaFocus: 'Trees (Validate Binary Search Tree, Kth Smallest Element in BST)',
    systemDesignFocus: 'Dependency Injection principles in massive monoliths',
    englishFocus: 'Explain the exact steps of Spring Bean Lifecycle from definition to destruction',
    claudeCodeFocus: 'Navigating Spring Boot autoconfiguration source code with Claude Code',
    completed: false
  },
  {
    dayNumber: 37,
    phaseNumber: 2,
    phaseName: 'Spring Boot 3 Deep Dive',
    theme: 'Spring @Transactional Pitfalls & Self-Invocation Proxy Mechanics',
    coreConcepts: ['AOP Proxy bypass on self-invocation (this.method())', 'Transaction propagation (REQUIRED vs REQUIRES_NEW vs NESTED)', 'Rollback rules on checked vs unchecked exceptions', 'Database connection holding duration and pool starvation'],
    handsOnGoal: 'Reproduce silent transaction failure on self-invocation and fix via ApplicationContext / Self-injection / TransactionTemplate',
    dsaFocus: 'Tries (Implement Trie Prefix Tree, Design Add and Search Words)',
    systemDesignFocus: 'Distributed Transaction failure patterns',
    englishFocus: 'Why does @Transactional fail when calling a private or internal method?',
    claudeCodeFocus: 'Writing integration tests asserting transaction rollbacks with Testcontainers',
    completed: false
  },
  {
    dayNumber: 45,
    phaseNumber: 2,
    phaseName: 'Spring Boot 3 Deep Dive',
    theme: 'Spring Data JPA / Hibernate N+1 & Query Optimization',
    coreConcepts: ['N+1 select problem and EntityGraphs (@EntityGraph, JOIN FETCH)', 'First-level & Second-level Hibernate Cache', 'Open Session in View (OSIV) anti-pattern in production', 'Batch fetching with hibernate.default_batch_fetch_size'],
    handsOnGoal: 'Eliminate N+1 queries in an order-item-customer relationship using QuickPerf & assert query count',
    dsaFocus: 'Heap & Priority Queue (Kth Largest Element in an Array, Top K Frequent Elements)',
    systemDesignFocus: 'Read vs Write replication lag in database architectures',
    englishFocus: 'Explain OSIV (Open Session In View) and why senior engineers disable it',
    claudeCodeFocus: 'Detecting JPA N+1 query patterns with automated static analysis prompts',
    completed: false
  },
  {
    dayNumber: 60,
    phaseNumber: 2,
    phaseName: 'Spring Boot 3 Deep Dive',
    theme: 'Phase 2 Capstone: Production-Grade REST Service with Observability',
    coreConcepts: ['Spring Security 6 with JWT & OAuth2 Resource Server', 'Micrometer & OpenTelemetry Tracing', 'Custom Actuator health indicators', 'Testcontainers with real PostgreSQL and Redis'],
    handsOnGoal: 'Ship production-ready Order API with OpenAPI Swagger, structured JSON logs, traceId propagation & 90% test coverage',
    dsaFocus: 'Graphs (Number of Islands, Clone Graph)',
    systemDesignFocus: 'Zero-downtime database schema migration strategy with Flyway',
    englishFocus: 'Spring Security 6 architecture & filter chain explanation in English',
    claudeCodeFocus: 'Generating complete Testcontainers test suites with Claude Code',
    completed: false
  },

  // Phase 3: Microservices & Event-Driven (Days 61 - 100)
  {
    dayNumber: 65,
    phaseNumber: 3,
    phaseName: 'Microservices & Distributed Systems',
    theme: 'Apache Kafka Architecture: Partitions, Offsets & Consumer Groups',
    coreConcepts: ['Log-structured storage & zero-copy transfer', 'Partition key hashing & ordering guarantees', 'Consumer group rebalance protocols (Eager vs Cooperative Sticky)', 'Consumer lag metrics & monitoring'],
    handsOnGoal: 'Build multi-partition Kafka producer/consumer with custom partitioner and monitor lag with Micrometer',
    dsaFocus: 'Graphs (Course Schedule, Pacific Atlantic Water Flow)',
    systemDesignFocus: 'Message Queue vs Log Broker (RabbitMQ vs Kafka vs Pulsar)',
    englishFocus: 'Describe Kafka partition ordering guarantees and what happens during a rebalance',
    claudeCodeFocus: 'Setting up local docker-compose Kafka test harness with Claude Code',
    completed: false
  },
  {
    dayNumber: 75,
    phaseNumber: 3,
    phaseName: 'Microservices & Distributed Systems',
    theme: 'Transactional Outbox Pattern & CDC with Debezium',
    coreConcepts: ['Dual write problem (DB update + Message Publish)', 'Transactional Outbox table schema', 'Poller vs Change Data Capture (Debezium)', 'At-least-once delivery and consumer idempotency'],
    handsOnGoal: 'Implement Transactional Outbox pattern with ShedLock poller and idempotent Kafka consumer with Redis deduplication',
    dsaFocus: 'Dynamic Programming (Climbing Stairs, Coin Change, Longest Increasing Subsequence)',
    systemDesignFocus: 'Exactly-Once Processing in distributed microservices',
    englishFocus: 'How do you solve the dual-write problem between PostgreSQL and Kafka?',
    claudeCodeFocus: 'Generating Outbox table migration scripts and event publishing pipelines',
    completed: false
  },
  {
    dayNumber: 85,
    phaseNumber: 3,
    phaseName: 'Microservices & Distributed Systems',
    theme: 'Distributed Locking with Redis (Redlock) & Cache Strategies',
    coreConcepts: ['SET key val NX PX mechanics', 'Redisson RLock with watchdog renewal', 'Redlock multi-node consensus & Martin Kleppmann critique', 'Cache stampede, Cache penetration, Cache breakdown solutions'],
    handsOnGoal: 'Implement inventory stock deduction with Redis distributed lock, fallback with Lua scripts and Bloom filters',
    dsaFocus: 'Dynamic Programming (Word Break, Unique Paths)',
    systemDesignFocus: 'Caching strategies: Cache-Aside, Write-Through, Write-Behind, Refresh-Ahead',
    englishFocus: 'Explain Redis Redlock safety guarantees and why clock drift is a risk',
    claudeCodeFocus: 'Writing Lua scripts for atomic Redis counters and inventory checks',
    completed: false
  },
  {
    dayNumber: 95,
    phaseNumber: 3,
    phaseName: 'Microservices & Distributed Systems',
    theme: 'Distributed Sagas: Orchestration vs Choreography',
    coreConcepts: ['Saga pattern for long-running transactions', 'Compensating transactions & idempotency', 'Temporal / Cadence workflow engine comparison', 'Out-of-order compensation events handling'],
    handsOnGoal: 'Build Order-Payment-Inventory-Shipment Saga Orchestrator with state machine and failure rollback',
    dsaFocus: 'Dynamic Programming (Longest Common Subsequence, Edit Distance)',
    systemDesignFocus: 'Distributed Saga vs Two-Phase Commit (2PC) tradeoffs',
    englishFocus: 'Explain the difference between Saga Choreography and Orchestration with real production examples',
    claudeCodeFocus: 'Designing Saga state machine diagrams and compensation handlers',
    completed: false
  },

  // Phase 4: System Design (Days 101 - 125)
  {
    dayNumber: 105,
    phaseNumber: 4,
    phaseName: 'System Design at Scale',
    theme: 'Distributed Rate Limiter & Token Bucket Algorithms',
    coreConcepts: ['Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log, Sliding Window Counter', 'Distributed Redis Rate Limiter with Lua scripts', 'Handling race conditions and network latency', 'Client-side backoff with jitter'],
    handsOnGoal: 'Design and implement a distributed Token Bucket rate limiter filter in Spring Cloud Gateway',
    dsaFocus: 'Greedy (Jump Game, Gas Station)',
    systemDesignFocus: 'Design a Global API Rate Limiter handling 100k QPS',
    englishFocus: 'System Design Mock: 45-min Walkthrough of API Rate Limiter',
    claudeCodeFocus: 'System design capacity estimation calculation script with Claude',
    completed: false
  },
  {
    dayNumber: 115,
    phaseNumber: 4,
    phaseName: 'System Design at Scale',
    theme: 'Design a Distributed Notification Engine (Push, SMS, Email)',
    coreConcepts: ['Multi-channel provider integration with circuit breakers', 'Priority queues for OTP vs Marketing campaigns', 'Deduplication and rate limiting per user', 'Template engine & dynamic localization'],
    handsOnGoal: 'Design Notification Service with Kafka priority topics, retry topics with exponential backoff & dead-letter queue (DLQ)',
    dsaFocus: 'Backtracking (Subsets, Permutations, Combination Sum)',
    systemDesignFocus: 'Design a Notification Service serving 50 million active users',
    englishFocus: 'Lead a System Design interview session on High-Availability Notification Service',
    claudeCodeFocus: 'Validating non-functional requirements and bottleneck identification',
    completed: false
  },

  // Phase 5: DSA Mastery (Days 126 - 150)
  {
    dayNumber: 130,
    phaseNumber: 5,
    phaseName: 'DSA Hard Patterns & Speed',
    theme: 'Monotonic Stack, Sliding Window Maximum & Trapping Rain Water',
    coreConcepts: ['Monotonic Increasing/Decreasing Stack invariant', 'Sliding Window Deque in O(n)', 'Two pointers trap water calculation', 'Space-time tradeoff analysis'],
    handsOnGoal: 'Solve 3 Hard problems in Java under 25 minutes each with zero syntax errors',
    dsaFocus: 'Monotonic Stack (Trapping Rain Water, Largest Rectangle in Histogram, Sliding Window Maximum)',
    systemDesignFocus: 'Time-series aggregation sliding windows in real-time monitoring',
    englishFocus: 'Explain optimal approach for Trapping Rain Water out loud with time complexity analysis',
    claudeCodeFocus: 'Generating edge-case unit test matrices for algorithmic code',
    completed: false
  },

  // Phase 6: Senior Interview Mastery (Days 151 - 180)
  {
    dayNumber: 160,
    phaseNumber: 6,
    phaseName: 'Senior Backend Interview Simulator',
    theme: 'Senior Architecture, Concurrency & Incident Simulation Mock',
    coreConcepts: ['Live System Design 60-min round', 'Deep Java Concurrency & Spring Internals 45-min round', 'Behavioral STAR methodology (Conflict, Failure, Leadership)', 'Live production incident triage and postmortem'],
    handsOnGoal: 'Complete full 4-round mock interview with rubric scoring and mistake auto-card conversion',
    dsaFocus: 'DSA Mock (LRU Cache, Merge k Sorted Lists)',
    systemDesignFocus: 'Design a Scalable Distributed Payment Gateway with Idempotency',
    englishFocus: 'English Behavioral: Tell me about a time a critical production incident occurred on your watch',
    claudeCodeFocus: 'Evaluating mock interview transcripts and identifying technical gaps',
    completed: false
  }
];

export const INITIAL_TASKS: LearningTask[] = [
  {
    id: 'task-1',
    dayNumber: 37,
    title: 'Java: CompletableFuture Pipeline & Exception Isolation',
    category: 'JAVA',
    description: 'Study CompletableFuture exception propagation with handle(), exceptionally(), and custom ForkJoinPool isolation.',
    estimatedMinutes: 45,
    state: 'IN_PROGRESS',
    codeSnippet: `CompletableFuture.supplyAsync(() -> fetchOrder(orderId), customExecutor)
  .thenCompose(order -> fetchPayment(order.paymentId()))
  .handle((result, ex) -> {
    if (ex != null) {
      log.error("Pipeline failure", ex);
      return FallbackResponse.empty();
    }
    return result;
  });`
  },
  {
    id: 'task-2',
    dayNumber: 37,
    title: 'Hands-on: Build Async Order Processor with Spring Boot',
    category: 'HANDS_ON',
    description: 'Implement a non-blocking order checkout service calling 3 downstream services in parallel with 200ms timeout.',
    estimatedMinutes: 60,
    state: 'TODO',
    codeSnippet: `@Service
public class OrderCheckoutService {
  private final ExecutorService orderPool;
  
  public CompletableFuture<CheckoutSummary> processCheckout(CheckoutRequest req) {
    var invFuture = CompletableFuture.supplyAsync(() -> inventoryClient.reserve(req), orderPool);
    var payFuture = CompletableFuture.supplyAsync(() -> paymentClient.preAuth(req), orderPool);
    var couponFuture = CompletableFuture.supplyAsync(() -> couponClient.apply(req), orderPool);
    
    return CompletableFuture.allOf(invFuture, payFuture, couponFuture)
      .thenApply(v -> new CheckoutSummary(invFuture.join(), payFuture.join(), couponFuture.join()))
      .orTimeout(200, TimeUnit.MILLISECONDS);
  }
}`
  },
  {
    id: 'task-3',
    dayNumber: 37,
    title: 'DSA: Sliding Window Maximum & Longest Substring',
    category: 'DSA',
    description: 'Solve LeetCode 239 (Sliding Window Maximum) with Monotonic Deque and LeetCode 3 (Longest Substring Without Repeating Characters).',
    estimatedMinutes: 40,
    state: 'TODO'
  },
  {
    id: 'task-4',
    dayNumber: 37,
    title: 'System Design: Notification Service with Priority Queues',
    category: 'SYSTEM_DESIGN',
    description: 'Architect a notification system with SMS/Push/Email rate limiting per user and Kafka priority topics for OTP messages.',
    estimatedMinutes: 45,
    state: 'TODO'
  },
  {
    id: 'task-5',
    dayNumber: 37,
    title: 'English: Explain CompletableFuture & JMM to Interviewer',
    category: 'ENGLISH',
    description: 'Record a 3-minute technical explanation in English answering: "Why would you choose CompletableFuture over parallelStream in a Web API?"',
    estimatedMinutes: 20,
    state: 'TODO'
  },
  {
    id: 'task-6',
    dayNumber: 37,
    title: 'Claude Code: Repository Exploration & Automated Test Gen',
    category: 'CLAUDE_CODE',
    description: 'Practice context management: Use Plan Mode with Claude Code to explore an unfamiliar microservice repo and generate integration tests.',
    estimatedMinutes: 30,
    state: 'TODO'
  },
  {
    id: 'task-7',
    dayNumber: 37,
    title: 'Review: 12 Spaced Repetition Flashcards Due Today',
    category: 'REVIEW',
    description: 'Active recall review covering @Transactional self-invocation, Kafka consumer rebalance, and Redis Redlock pitfalls.',
    estimatedMinutes: 15,
    state: 'TODO'
  }
];

export const INITIAL_KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    id: 'topic-kafka-internals',
    title: 'Apache Kafka Consumer Groups & Partition Rebalancing',
    category: 'MICROSERVICES',
    subcategory: 'Event Streaming',
    description: 'Understanding partition assignment strategies, heartbeat threads, max.poll.interval.ms vs session.timeout.ms, and Cooperative Sticky Assignor.',
    difficulty: 'SENIOR',
    status: 'PRACTICING',
    confidence: 3,
    dimensions: {
      theory: 4,
      handsOn: 4,
      recall: 3,
      explanation: 4,
      debugging: 2, // Weakest!
      interview: 3
    },
    learned: true,
    implemented: true,
    explained: true,
    debugged: false,
    interviewReady: false,
    reviewCount: 5,
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-17T12:00:00Z',
    interviewQuestions: [
      'What causes a Kafka consumer rebalance loop in high-throughput consumers?',
      'How does the Cooperative Sticky Assignor reduce stop-the-world downtime during rebalance?',
      'What is the difference between max.poll.interval.ms and session.timeout.ms?'
    ],
    keyPitfalls: [
      'Performing long blocking I/O inside the poll() loop exceeding max.poll.interval.ms, causing Kafka coordinator to consider consumer dead.',
      'Assuming commitSync() guarantees zero message loss without idempotent consumer deduplication.'
    ],
    recommendedAction: 'Debug: Investigate consumer group rebalance loop in Incident Lab scenario.'
  },
  {
    id: 'topic-spring-transactional',
    title: 'Spring @Transactional Proxy Internals & Self-Invocation',
    category: 'SPRING',
    subcategory: 'AOP & Transactions',
    description: 'How Spring creates dynamic JDK / CGLIB proxies, interception mechanisms, why this.method() bypasses the proxy, and transaction propagation rules.',
    difficulty: 'SENIOR',
    status: 'MASTERED',
    confidence: 5,
    dimensions: {
      theory: 5,
      handsOn: 5,
      recall: 5,
      explanation: 5,
      debugging: 4,
      interview: 5
    },
    learned: true,
    implemented: true,
    explained: true,
    debugged: true,
    interviewReady: true,
    reviewCount: 9,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-09-15T14:30:00Z',
    interviewQuestions: [
      'Why does calling a @Transactional method from another method in the same class fail to start a transaction?',
      'What is the difference between Propagation.REQUIRES_NEW and Propagation.NESTED in terms of DB savepoints?',
      'Why does Spring @Transactional not roll back on checked exceptions by default?'
    ],
    keyPitfalls: [
      'Annotating private methods with @Transactional (silently ignored by CGLIB proxy).',
      'Holding database connections open during slow external HTTP calls inside a transaction.'
    ],
    recommendedAction: 'Review: Keep active recall sharp via weekly spaced repetition.'
  },
  {
    id: 'topic-java-memory-model',
    title: 'Java Memory Model (JMM) & Happens-Before Order',
    category: 'JAVA',
    subcategory: 'Concurrency & JVM',
    description: 'CPU instruction reordering, store buffers, volatile memory barriers (LoadLoad, StoreStore, LoadStore, StoreLoad), and JMM happens-before guarantees.',
    difficulty: 'SENIOR',
    status: 'UNDERSTOOD',
    confidence: 4,
    dimensions: {
      theory: 4,
      handsOn: 3,
      recall: 4,
      explanation: 4,
      debugging: 3,
      interview: 4
    },
    learned: true,
    implemented: true,
    explained: true,
    debugged: true,
    interviewReady: true,
    reviewCount: 6,
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-09-12T16:00:00Z',
    interviewQuestions: [
      'What is the happens-before relationship and why was it introduced in Java 5 JSR-133?',
      'How does volatile prevent instruction reordering at hardware CPU level?',
      'Why is double-checked locking broken without volatile?'
    ],
    keyPitfalls: [
      'Assuming volatile provides atomicity for compound operations like count++.'
    ],
    recommendedAction: 'Hands-on: Write a multithreaded test reproducing non-volatile memory visibility glitch.'
  },
  {
    id: 'topic-redis-distributed-lock',
    title: 'Distributed Locking with Redis (Redlock) & Fencing Tokens',
    category: 'DATABASE',
    subcategory: 'Caching & Coordination',
    description: 'Redlock multi-instance algorithm, TTL expiration race conditions, Redisson watchdog renewal, and Martin Kleppmann vs Salvatore Sanfilippo analysis.',
    difficulty: 'SENIOR',
    status: 'PRACTICING',
    confidence: 3,
    dimensions: {
      theory: 4,
      handsOn: 4,
      recall: 3,
      explanation: 3,
      debugging: 2, // Weakest
      interview: 3
    },
    learned: true,
    implemented: true,
    explained: true,
    debugged: false,
    interviewReady: false,
    reviewCount: 4,
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-09-14T09:00:00Z',
    interviewQuestions: [
      'Why is a single Redis instance lock insufficient in a network partition scenario?',
      'What is a fencing token and why is it necessary for strict storage correctness?',
      'How does Redisson implement the lock renewal watchdog thread?'
    ],
    keyPitfalls: [
      'GC pause exceeding lock TTL causing another node to acquire the same lock while the first node is still writing to DB.'
    ],
    recommendedAction: 'Debugging: Complete the Redis Lock Expiration & Dual Write incident scenario.'
  },
  {
    id: 'topic-outbox-pattern',
    title: 'Transactional Outbox & Change Data Capture (CDC)',
    category: 'MICROSERVICES',
    subcategory: 'Reliable Messaging',
    description: 'Atomic database write + outbox record creation in same local transaction, followed by Debezium CDC or poller pushing to Kafka.',
    difficulty: 'SENIOR',
    status: 'UNDERSTOOD',
    confidence: 4,
    dimensions: {
      theory: 4,
      handsOn: 4,
      recall: 4,
      explanation: 4,
      debugging: 3,
      interview: 4
    },
    learned: true,
    implemented: true,
    explained: true,
    debugged: true,
    interviewReady: true,
    reviewCount: 7,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-16T18:00:00Z',
    interviewQuestions: [
      'How does Transactional Outbox prevent phantom message publishes on DB transaction rollback?',
      'What are the tradeoffs between Polling Outbox Table vs Debezium CDC reading WAL?',
      'How do you guarantee downstream idempotent consumer handling?'
    ],
    keyPitfalls: [
      'Polling outbox table with SELECT ... FOR UPDATE causing table lock contention under high write volume.'
    ],
    recommendedAction: 'Interview: Practice drawing and explaining the complete CDC architecture.'
  }
];

export const INITIAL_REVIEW_CARDS: ReviewCard[] = [
  {
    id: 'card-1',
    category: 'SPRING',
    question: 'Why does Spring @Transactional fail when a method is called via self-invocation (this.method())?',
    expectedAnswer: `Spring @Transactional is implemented via AOP Dynamic Proxies (CGLIB or JDK dynamic proxy).
When an external client calls the bean, it invokes the Proxy, which intercepts the call, starts a database transaction via PlatformTransactionManager, executes the target method, and commits/rolls back.
When calling this.method() internally, the call bypasses the Spring Proxy and invokes the target instance directly on 'this'. No proxy interception occurs, so no transaction is opened.`,
    codeExample: `// ❌ Transaction will NOT start:
public void processOrder() {
  this.saveOrder(); // Bypasses proxy!
}

@Transactional
public void saveOrder() { ... }

// ✅ Solutions:
// 1. Inject self: @Autowired private OrderService self; self.saveOrder();
// 2. Use TransactionTemplate: transactionTemplate.execute(status -> { ... });
// 3. Move saveOrder() to a separate service bean.`,
    intervalDays: 4,
    repetitionCount: 3,
    easeFactor: 2.5,
    nextReviewAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'card-2',
    category: 'JAVA',
    question: 'What is the Java Memory Model (JMM) "Happens-Before" relationship, and why does volatile establish it?',
    expectedAnswer: `Happens-before defines a partial ordering over memory actions. If action A happens-before action B, then the results of action A are guaranteed to be visible to action B, and execution order is preserved.
For volatile variables:
A write to a volatile variable happens-before every subsequent read of that same volatile variable.
Under the hood, the compiler inserts hardware CPU memory barriers (e.g. StoreLoad / StoreStore) to prevent reordering and flush CPU write buffers to main memory.`,
    intervalDays: 2,
    repetitionCount: 2,
    easeFactor: 2.4,
    nextReviewAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'card-3',
    category: 'MICROSERVICES',
    question: 'What is the difference between max.poll.interval.ms and session.timeout.ms in Apache Kafka Consumer?',
    expectedAnswer: `1. session.timeout.ms: Heartbeat timeout. Kafka consumer has a dedicated background heartbeat thread. If the broker coordinator does not receive a heartbeat within this window, it assumes the consumer process is dead (e.g. JVM crashed) and triggers a consumer group rebalance.
2. max.poll.interval.ms: Processing timeout for the application main thread. If the main thread takes longer than this interval between consecutive poll() calls (e.g. due to slow DB queries or thread blocking), the consumer is assumed to be stuck, leaves the group, and a rebalance is triggered.`,
    intervalDays: 1,
    repetitionCount: 1,
    easeFactor: 2.1,
    nextReviewAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'card-4',
    category: 'DATABASE',
    question: 'What is the Transactional Outbox Pattern and what problem does it solve?',
    expectedAnswer: `It solves the Dual Write Problem where an application must update a relational database AND publish an event to a message broker (e.g. Kafka) atomically.
If DB update succeeds but network fails before Kafka publish, data is inconsistent.
If Kafka publish succeeds but DB transaction rolls back, phantom messages exist.
Solution: Save the business state AND an Outbox event record into the same PostgreSQL database within a single ACID transaction. A separate process (Debezium CDC or poller) reads the Outbox table and publishes to Kafka with at-least-once guarantee.`,
    intervalDays: 8,
    repetitionCount: 4,
    easeFactor: 2.6,
    nextReviewAt: new Date(Date.now() + 86400000).toISOString(),
    history: []
  },
  {
    id: 'card-5',
    category: 'SYSTEM_DESIGN',
    question: 'Why does Consistent Hashing minimize data movement during node additions/removals compared to hash(key) % N?',
    expectedAnswer: `With standard modular hashing (hash(key) % N), adding or removing a single node changes N to N+1 or N-1, causing almost 100% of keys to re-map to different servers, resulting in massive cache stampedes and network congestion.
In Consistent Hashing:
Both nodes and keys are mapped onto a circular 2^32-1 hash ring.
When a node is added or removed, only keys between that node and its predecessor (1/N of the total keys) need to be migrated.
Virtual nodes (replicas on the ring) are used to ensure uniform load distribution and eliminate hotspots.`,
    intervalDays: 4,
    repetitionCount: 3,
    easeFactor: 2.5,
    nextReviewAt: new Date().toISOString(),
    history: []
  }
];

export const INITIAL_DSA_PROBLEMS: DSAProblem[] = [
  {
    id: 'dsa-1',
    title: 'Sliding Window Maximum (LeetCode 239)',
    pattern: 'Sliding Window',
    difficulty: 'HARD',
    timeLimitMinutes: 25,
    sourceUrl: 'https://leetcode.com/problems/sliding-window-maximum/',
    attempts: 3,
    bestTimeMinutes: 18,
    solvedWithoutHelp: true,
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(K)',
    mastered: true,
    mistakes: 'Initially used PriorityQueue giving O(N log K), which timed out on large arrays. Switched to Monotonic Deque.',
    notes: 'Maintain a deque of indices storing values in strictly decreasing order. Remove elements outside window from front, and remove smaller elements from back before inserting new index.',
    optimalSolutionJava: `public int[] maxSlidingWindow(int[] nums, int k) {
    if (nums == null || k <= 0) return new int[0];
    int n = nums.length;
    int[] result = new int[n - k + 1];
    Deque<Integer> deque = new ArrayDeque<>(); // stores indices
    
    for (int i = 0; i < n; i++) {
        // 1. Remove elements outside current window [i - k + 1, i]
        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
            deque.pollFirst();
        }
        
        // 2. Maintain monotonic decreasing order (remove smaller elements from back)
        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
            deque.pollLast();
        }
        
        // 3. Add current element index
        deque.offerLast(i);
        
        // 4. Record maximum when first window is formed
        if (i >= k - 1) {
            result[i - k + 1] = nums[deque.peekFirst()];
        }
    }
    return result;
}`
  },
  {
    id: 'dsa-2',
    title: 'Trapping Rain Water (LeetCode 42)',
    pattern: 'Two Pointers',
    difficulty: 'HARD',
    timeLimitMinutes: 25,
    sourceUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    attempts: 4,
    bestTimeMinutes: 22,
    solvedWithoutHelp: true,
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    mastered: true,
    mistakes: 'Forgetting to update maxLeft and maxRight before calculating trapped water unit.',
    notes: 'Two pointers converging from left and right. The amount of water trapped is constrained by min(maxLeft, maxRight) - height[i]. Move the pointer with the smaller max height.',
    optimalSolutionJava: `public int trap(int[] height) {
    if (height == null || height.length == 0) return 0;
    int left = 0, right = height.length - 1;
    int maxLeft = 0, maxRight = 0;
    int totalWater = 0;
    
    while (left < right) {
        if (height[left] <= height[right]) {
            if (height[left] >= maxLeft) {
                maxLeft = height[left];
            } else {
                totalWater += maxLeft - height[left];
            }
            left++;
        } else {
            if (height[right] >= maxRight) {
                maxRight = height[right];
            } else {
                totalWater += maxRight - height[right];
            }
            right--;
        }
    }
    return totalWater;
}`
  },
  {
    id: 'dsa-3',
    title: 'LRU Cache (LeetCode 146)',
    pattern: 'HashMap',
    difficulty: 'MEDIUM',
    timeLimitMinutes: 25,
    sourceUrl: 'https://leetcode.com/problems/lru-cache/',
    attempts: 2,
    bestTimeMinutes: 19,
    solvedWithoutHelp: true,
    timeComplexity: 'O(1) get & put',
    spaceComplexity: 'O(Capacity)',
    mastered: true,
    notes: 'Combine HashMap<Integer, Node> with Doubly Linked List having dummy head and tail for clean O(1) removals and prepend.',
    optimalSolutionJava: `public class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { this.key = k; this.val = v; }
    }
    
    private final int capacity;
    private final Map<Integer, Node> map;
    private final Node head, tail;
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new HashMap<>();
        this.head = new Node(0, 0);
        this.tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }
    
    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insertToFront(node);
        return node.val;
    }
    
    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        }
        if (map.size() == capacity) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
        Node newNode = new Node(key, value);
        insertToFront(newNode);
        map.put(key, newNode);
    }
    
    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    private void insertToFront(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
}`
  },
  {
    id: 'dsa-4',
    title: 'Course Schedule - Cycle Detection (LeetCode 207)',
    pattern: 'Graph',
    difficulty: 'MEDIUM',
    timeLimitMinutes: 20,
    sourceUrl: 'https://leetcode.com/problems/course-schedule/',
    attempts: 2,
    bestTimeMinutes: 14,
    solvedWithoutHelp: true,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    mastered: true,
    notes: 'Kahn\'s Algorithm for Topological Sort using In-Degree array and BFS queue.',
    optimalSolutionJava: `public boolean canFinish(int numCourses, int[][] prerequisites) {
    int[] inDegree = new int[numCourses];
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    
    for (int[] pre : prerequisites) {
        int dest = pre[0], src = pre[1];
        adj.get(src).add(dest);
        inDegree[dest]++;
    }
    
    Queue<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) queue.offer(i);
    }
    
    int visited = 0;
    while (!queue.isEmpty()) {
        int curr = queue.poll();
        visited++;
        for (int neighbor : adj.get(curr)) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] == 0) {
                queue.offer(neighbor);
            }
        }
    }
    return visited == numCourses;
}`
  }
];

export const INITIAL_SYSTEM_DESIGN_PROBLEMS: SystemDesignProblem[] = [
  {
    id: 'sd-notification-service',
    title: 'Scalable Notification Engine (Push, SMS, Email)',
    difficulty: 'HARD',
    description: 'Design a distributed multi-channel notification platform handling 50M daily active users with priority delivery (OTP < 2s vs bulk newsletters).',
    requirements: {
      functional: [
        'Send notifications across 3 channels: Mobile Push (APNS/FCM), SMS (Twilio/AWS SNS), Email (SendGrid/SES).',
        'Support priority queues: High (OTP, 2FA, Fraud Alerts), Normal (Order status), Low (Marketing campaigns).',
        'Support user notification preferences and quiet hours (e.g. no SMS between 10 PM - 8 AM in user timezone).',
        'Per-user rate limiting (max 5 marketing notifications/day) and global deduplication to prevent duplicate sends.'
      ],
      nonFunctional: [
        'High availability (99.99%). Low latency for high priority (< 2s p99).',
        'Scalability: 100M notifications per day (~1,200 avg QPS, 10,000 peak QPS).',
        'At-least-once delivery with end-to-end delivery tracking and retry with exponential backoff.'
      ]
    },
    capacityEstimation: {
      dau: '50 Million Users',
      qps: 'Peak: 10,000 QPS (100M events / day)',
      storagePerDay: '100M records * 1KB payload = ~100 GB / day log storage',
      networkBandwidth: '10,000 QPS * 1 KB = 10 MB/sec incoming throughput'
    },
    apiDesign: [
      'POST /v1/notifications/send - payload: { userId, templateId, channel, priority, idempotencyKey, params }',
      'GET /v1/notifications/{notificationId}/status - returns current delivery lifecycle status (QUEUED, SENT, DELIVERED, FAILED)',
      'PUT /v1/users/{userId}/preferences - update channel opt-ins and quiet hours'
    ],
    dataModel: [
      'notifications (id UUID PK, user_id UUID, channel VARCHAR, template_id VARCHAR, priority VARCHAR, status VARCHAR, idempotency_key VARCHAR UNIQUE, created_at TIMESTAMP)',
      'notification_templates (id VARCHAR PK, channel VARCHAR, body_template TEXT, version INT)',
      'user_preferences (user_id UUID PK, push_enabled BOOL, sms_enabled BOOL, email_enabled BOOL, timezone VARCHAR, quiet_hours_start TIME, quiet_hours_end TIME)'
    ],
    architectureDiagramAscii: `
  [Client Apps / Internal Microservices]
                  │
                  ▼ (HTTPS / gRPC)
          [API Gateway & Rate Limiter]
                  │
                  ▼
         [Notification Ingestion Service]
          ├── Idempotency Check (Redis)
          └── User Preferences (Postgres Cache)
                  │
                  ▼ (Partition by userId)
         [Kafka Topic: notifications.priority]
         ├── High-Priority Partition
         ├── Normal-Priority Partition
         └── Bulk-Marketing Partition
                  │
                  ▼
         [Worker Consumers Pool]
          ├── Template Renderer Engine
          ├── Provider Dispatchers (Resilience4j Circuit Breaker)
          │    ├── APNs / FCM (Push)
          │    ├── Twilio / AWS SNS (SMS)
          │    └── SendGrid / SES (Email)
          └── Dead-Letter Queue (DLQ) & Retry Topic
                  │
                  ▼
        [ClickHouse / OpenTelemetry] (Delivery Tracking & Analytics)
    `,
    scalingTechniques: [
      'Kafka topic partitioning by userId so notifications for a single user process in order without cross-user contention.',
      'Separate worker pools for Push, SMS, and Email so slow third-party Email API rate limits do not block fast Push workers.',
      'Redis distributed rate limiter to enforce max 1 SMS per 60s per user for OTP.'
    ],
    failureModes: [
      'Third-party provider outage (e.g. Twilio downtime): Circuit breaker trips and routes to backup SMS provider (e.g. AWS SNS).',
      'Kafka consumer crash: Offset commit is only executed after successful provider dispatch or DLQ handoff.'
    ],
    tradeoffs: [
      'At-least-once delivery requires clients or provider SDKs to deduplicate on message UUID.',
      'Separate priority topics vs single topic with priority queue: Kafka does not support message priority natively, so 3 dedicated topics with weighted consumer pools are used.'
    ],
    rubricScores: {
      requirements: 5,
      architecture: 5,
      database: 4,
      scalability: 5,
      reliability: 4,
      tradeoffs: 5,
      communication: 4
    },
    completed: true,
    timeSpentMinutes: 42
  },
  {
    id: 'sd-distributed-rate-limiter',
    title: 'Distributed Rate Limiter Service (100k QPS)',
    difficulty: 'HARD',
    description: 'Design a resilient distributed rate limiting system that can be deployed as an API Gateway filter or standalone service across multiple geographic regions.',
    requirements: {
      functional: [
        'Rate limit requests based on client IP, authenticated User ID, or API Key.',
        'Support configurable rules (e.g. 100 req/min for free tier, 5,000 req/min for enterprise).',
        'Return standard HTTP 429 Too Many Requests with Retry-After headers.'
      ],
      nonFunctional: [
        'Ultra low latency (< 2ms p99 overhead on incoming API calls).',
        'High availability: If the rate limiter service or Redis cluster fails, fail-open to avoid taking down the whole company.'
      ]
    },
    capacityEstimation: {
      dau: '10 Million Active Clients',
      qps: '100,000 requests/sec',
      storagePerDay: '10M active keys * 64 bytes in Redis = ~640 MB memory footprint',
      networkBandwidth: '100k QPS * 100 bytes Redis payload = ~10 MB/sec'
    },
    apiDesign: [
      'Internal gRPC: CheckLimit(key, tokensRequested) -> { allowed: bool, remainingTokens: int, resetTimeMs: int }',
      'Admin REST: POST /api/v1/rules - update tier limits'
    ],
    dataModel: [
      'Redis Hash / String per key: { tokens: float, last_updated_timestamp: long }'
    ],
    architectureDiagramAscii: `
         [Inbound HTTP Request]
                  │
                  ▼
        [Envoy / Spring Cloud Gateway]
                  │
                  ▼ (Local In-Memory Cache Filter L1)
             [Hit? Allow]
                  │
                  ▼ (L2 Distributed Check)
        [Redis Cluster (Sliding Window Counter)]
          └── Lua Script Execution (Atomic)
                  │
          ┌───────┴───────┐
          ▼               ▼
      [Allowed]       [Exceeded (HTTP 429)]
          │               │
     [Route to API]   [Header: Retry-After: 45s]
    `,
    scalingTechniques: [
      'Local L1 token cache in Gateway memory (e.g. sync batches every 500ms) to reduce Redis network hops for high-volume endpoints.',
      'Consistent hashing on API key to distribute keys evenly across Redis shards.'
    ],
    failureModes: [
      'Redis cluster partition or unreachable: Rate Limiter filter catches timeout exception and fails open (logs warning, allows traffic).'
    ],
    tradeoffs: [
      'Sliding Window Log vs Sliding Window Counter: Counter uses O(1) memory per key while log uses O(Requests) memory.',
      'Fail-open vs Fail-closed: We choose fail-open for user-facing availability over strict billing enforcement.'
    ],
    rubricScores: {
      requirements: 5,
      architecture: 4,
      database: 4,
      scalability: 5,
      reliability: 5,
      tradeoffs: 4,
      communication: 4
    },
    completed: false
  }
];

export const INITIAL_CLAUDE_CODE_EXERCISES: ClaudeCodeExercise[] = [
  {
    id: 'cc-1',
    title: 'CLAUDE.md Engineering Standards & Architecture Indexing',
    topic: 'CLAUDE.md Structure',
    objective: 'Create a production-grade CLAUDE.md file for a Spring Boot microservice project that instructs Claude Code on build commands, code style, testing rules, and architectural constraints.',
    promptExample: `Please inspect the repository structure and create a concise CLAUDE.md file outlining:
1. Build & test commands (mvn clean verify, testcontainers flags)
2. Architecture rules (Never leak JPA entities in controllers, DTO mapping with MapStruct)
3. Concurrency standards (No parallelStream in web requests, prefer CompletableFuture with dedicated pools)
4. Git commit conventions and branch naming.`,
    expectedResult: 'A well-formatted CLAUDE.md file placed at repository root that guides subagents and future developer interactions without hallucinated commands.',
    aiMistakesToWatch: [
      'Generating verbose 500-line documentation that clogs the context window.',
      'Recommending deprecated Maven plugins or outdated JUnit 4 annotations instead of JUnit 5.'
    ],
    humanCorrections: [
      'Pruned unnecessary boilerplate to keep CLAUDE.md under 150 lines.',
      'Explicitly added rule forbidding raw System.out.println in favor of SLF4J loggers.'
    ],
    lessonsLearned: [
      'CLAUDE.md is loaded automatically into system instructions; keeping it concise and high-signal prevents prompt context dilution.'
    ],
    status: 'COMPLETED'
  },
  {
    id: 'cc-2',
    title: 'Context Management & Plan Mode for Multi-File Refactoring',
    topic: 'Plan vs Act Mode',
    objective: 'Use Plan Mode to map out the refactoring of a synchronous monolithic service into an event-driven Saga pattern before modifying any code.',
    promptExample: `Explore the OrderService and PaymentService classes. Do NOT write or edit any files yet.
Produce a step-by-step implementation plan for migrating from direct REST calls to an asynchronous Kafka Outbox pattern.
Identify all impacted classes, database schema migrations, and rollback procedures.`,
    expectedResult: 'A detailed 6-step execution plan identifying exact files to change and potential breaking changes.',
    aiMistakesToWatch: [
      'AI jumping directly into editing files without analyzing circular dependencies.',
      'Missing the Flyway migration file for the outbox table.'
    ],
    humanCorrections: [
      'Enforced Plan Mode first, reviewed and approved the plan before asking Claude to execute.'
    ],
    lessonsLearned: [
      'UNDERSTAND -> DELEGATE -> VERIFY is 10x more reliable than blind code generation.'
    ],
    status: 'IN_PROGRESS'
  },
  {
    id: 'cc-3',
    title: 'Custom MCP Server for Live Kafka & Postgres Introspection',
    topic: 'MCP Server Integration',
    objective: 'Configure a Model Context Protocol (MCP) server to allow Claude Code to inspect local Docker PostgreSQL tables and Kafka consumer lag directly from the CLI.',
    promptExample: `Configure the Postgres MCP server in .claude/config.json pointing to our local Testcontainers database so Claude can run SELECT queries and analyze query execution plans (EXPLAIN ANALYZE).`,
    expectedResult: 'Claude Code can execute read-only schema checks and analyze query plans to suggest B-Tree composite indexes.',
    aiMistakesToWatch: [
      'Allowing destructive DDL/DML operations in MCP config instead of read-only transactions.'
    ],
    humanCorrections: [
      'Configured read-only database credentials for MCP connection.'
    ],
    lessonsLearned: [
      'Tool safety is critical: giving agents read access to schema saves hours of manual schema copy-pasting.'
    ],
    status: 'TODO'
  }
];

export const INITIAL_ENGLISH_SESSIONS: EnglishSession[] = [
  {
    id: 'eng-37',
    dayNumber: 37,
    category: 'Microservices',
    dailySentences: [
      '1. We mitigated the cascading failure by configuring a Resilience4j circuit breaker with a 50% slow-call rate threshold.',
      '2. The consumer group experienced severe lag because downstream database writes were bottlenecked on lock contention.',
      '3. By decoupling the inventory deduction via the Transactional Outbox pattern, we achieved eventual consistency without distributed 2PC locking.',
      '4. We tuned the HikariCP connection pool to match the maximum number of active worker threads, eliminating connection acquisition timeouts.',
      '5. Our p99 latency dropped by 65% after we introduced a Redis sliding window counter for API rate limiting.'
    ],
    technicalExplanationTopic: 'Explain how Spring Boot @Transactional works under the hood and why self-invocation fails.',
    technicalExplanationModelAnswer: `"Spring's @Transactional annotation relies fundamentally on Spring AOP and dynamic proxies. When Spring bootstraps the ApplicationContext, any bean with transactional methods is wrapped in a dynamic proxy—either via CGLIB subclassing or JDK dynamic interface proxies.
When an external caller invokes a transactional method, the call hits the proxy first. The TransactionInterceptor delegates to the PlatformTransactionManager to obtain or resume a database connection from the DataSource and start the transaction.
However, if a method within the bean calls another @Transactional method within the same bean using 'this.method()', this is a direct Java reference invocation. It completely bypasses the surrounding Spring proxy. Consequently, no transaction interceptor is triggered, and the method executes in the existing transaction context or none at all.
To resolve this, we can inject the self-bean, extract the transactional logic into a separate dedicated service component, or programmatically execute the operation via TransactionTemplate."`,
    behavioralQuestion: 'Tell me about a time when you had a technical disagreement with a teammate about system architecture. How did you resolve it?',
    behavioralStarAnswer: `"Situation: While architecting our payment processing pipeline, a teammate proposed using a distributed Two-Phase Commit (2PC) protocol across three microservices to maintain strict ACID consistency, whereas I advocated for an asynchronous Saga pattern with Transactional Outbox.
Task: I needed to evaluate both approaches objectively without stalling the sprint deadline.
Action: I organized an architectural trade-off spike. I demonstrated that 2PC holds database locks across network boundaries, introducing a severe availability bottleneck and high risk of coordinator failure. I presented a prototype of the Choreographed Saga with idempotent consumers and compensating transactions.
Result: The team unanimously agreed to adopt the Saga pattern. In production, the service achieved 99.99% availability and handled 5,000 transactions per second without distributed lock deadlocks."`,
    interviewQuestions: [
      'How do you explain the CAP theorem trade-offs to non-technical stakeholders?',
      'What steps do you take when investigating a memory leak in a JVM production pod?',
      'Why did you choose Kafka over RabbitMQ for this event-driven architecture?'
    ],
    practicedWritten: true,
    practicedSpoken: true,
    qualitativeDimensions: {
      technicalClarity: 5,
      fluency: 4,
      grammar: 4,
      vocabulary: 5,
      communication: 4
    }
  }
];

export const INITIAL_PROJECT_FEATURES: ProjectFeature[] = [
  {
    id: 'feat-1',
    title: 'Order Placement & Checkout Saga Orchestrator',
    service: 'ORDER_SERVICE',
    stages: {
      requirement: true,
      design: true,
      implementation: true,
      unitTest: true,
      integrationTest: true,
      loadTest: false,
      failureTest: false,
      observability: true,
      documentation: true
    },
    notes: 'Saga state machine built with Spring StateMachine. Integration tests verified with Testcontainers Kafka + Postgres.'
  },
  {
    id: 'feat-2',
    title: 'Transactional Outbox & Debezium CDC Publisher',
    service: 'ORDER_SERVICE',
    stages: {
      requirement: true,
      design: true,
      implementation: true,
      unitTest: true,
      integrationTest: true,
      loadTest: true,
      failureTest: true,
      observability: true,
      documentation: true
    }
  },
  {
    id: 'feat-3',
    title: 'Inventory Reservation with Redis Distributed Lock',
    service: 'INVENTORY_SERVICE',
    stages: {
      requirement: true,
      design: true,
      implementation: true,
      unitTest: true,
      integrationTest: true,
      loadTest: false,
      failureTest: false,
      observability: false,
      documentation: false
    }
  },
  {
    id: 'feat-4',
    title: 'Payment Gateway Integration with Idempotency Key',
    service: 'PAYMENT_SERVICE',
    stages: {
      requirement: true,
      design: true,
      implementation: true,
      unitTest: true,
      integrationTest: false,
      loadTest: false,
      failureTest: false,
      observability: false,
      documentation: false
    }
  },
  {
    id: 'feat-5',
    title: 'API Gateway Rate Limiting & JWT Validation',
    service: 'API_GATEWAY',
    stages: {
      requirement: true,
      design: true,
      implementation: true,
      unitTest: true,
      integrationTest: true,
      loadTest: true,
      failureTest: true,
      observability: true,
      documentation: true
    }
  }
];

export const INITIAL_INCIDENTS: IncidentScenario[] = [
  {
    id: 'inc-1',
    title: 'HikariCP Connection Pool Exhaustion on Flash Sale Spike',
    serviceAffected: 'ORDER_SERVICE',
    severity: 'P0 - CRITICAL',
    symptoms: [
      'HTTP 500 error rate spikes to 38% on /api/v1/orders/checkout.',
      'Application threads blocked on HikariCP connection acquisition.',
      'Database CPU utilization remains normal (< 15%), but connection pool wait times exceed 30,000ms.'
    ],
    liveLogs: [
      '2026-09-17 17:45:12.102 ERROR [http-nio-8080-exec-42] com.zaxxer.hikari.pool.HikariPool : HikariPool-1 - Connection is not available, request timed out after 30005ms.',
      '2026-09-17 17:45:12.105 ERROR [http-nio-8080-exec-42] o.s.t.i.TransactionInterceptor : Application exception overridden by rollback exception',
      '2026-09-17 17:45:13.411 WARN  [http-nio-8080-exec-19] com.seniorjava180.order.OrderService : Calling external payment gateway while holding @Transactional DB connection!',
      '2026-09-17 17:45:14.002 ERROR [http-nio-8080-exec-88] com.zaxxer.hikari.pool.HikariPool : Active connections: 50, Idle: 0, Waiting threads: 142'
    ],
    metrics: [
      { name: 'HikariCP Active Connections', currentValue: '50 / 50', normalValue: '12 / 50', status: 'CRITICAL' },
      { name: 'HikariCP Pending Threads', currentValue: '142 threads', normalValue: '0 threads', status: 'CRITICAL' },
      { name: 'PostgreSQL Server CPU', currentValue: '14%', normalValue: '25%', status: 'NORMAL' },
      { name: 'Payment Gateway Latency', currentValue: '4,850 ms', normalValue: '220 ms', status: 'WARNING' }
    ],
    hypothesisOptions: [
      'PostgreSQL database crashed and is not accepting TCP sockets.',
      'Slow external Payment HTTP call is executed inside @Transactional boundary, holding DB connections hostage for 5 seconds each.',
      'Kafka broker partition leader is offline causing thread deadlock in logging framework.',
      'HikariCP connection leak due to unclosed ResultSet in custom JDBC query.'
    ],
    correctHypothesisIndex: 1,
    rootCauseAnalysis: `The OrderService.checkout() method was annotated with @Transactional. Inside the transaction boundary, it made a synchronous REST call to an external payment processor that was experiencing a 4.8-second latency degradation.
Because the Spring @Transactional boundary opened a PostgreSQL connection at method entry, every thread held a precious DB connection while doing nothing but waiting for the network HTTP response. 50 concurrent requests exhausted the 50-connection pool, starving all other database operations.`,
    fixCommand: `1. Move external payment HTTP call OUTSIDE the @Transactional database method.
2. Use TransactionTemplate to wrap only the local order state update.
3. Configure HikariCP connectionTimeout = 2000ms and maxLifetime = 1800000ms.`,
    verificationSteps: [
      'Deploy hotfix with payment call decoupled from DB transaction.',
      'Run Apache JMeter load test simulating 500 concurrent checkout requests.',
      'Verify HikariCP active connections stabilize around 15 with zero pending threads.'
    ],
    preventionStrategy: 'Architectural rule: Never make network I/O or third-party HTTP calls inside a database transaction boundary. Enforce with ArchUnit tests.',
    status: 'UNRESOLVED'
  },
  {
    id: 'inc-2',
    title: 'Kafka Consumer Rebalance Storm & Duplicate Order Processing',
    serviceAffected: 'PAYMENT_SERVICE',
    severity: 'P1 - HIGH',
    symptoms: [
      'Payment consumer group continuously triggers rebalances every 5 minutes.',
      'Customers reported being charged multiple times for a single order.',
      'Kafka consumer lag increasing continuously.'
    ],
    liveLogs: [
      '2026-09-17 18:02:10.021 INFO  [kafka-consumer-1] o.a.k.c.c.i.ConsumerCoordinator : [Consumer clientId=payment-consumer-1] Giving away all assigned partitions as consumer left group.',
      '2026-09-17 18:02:10.045 WARN  [kafka-consumer-1] o.a.k.c.c.i.ConsumerCoordinator : [Consumer clientId=payment-consumer-1] max.poll.interval.ms (300000ms) exceeded. Consumer considered dead.',
      '2026-09-17 18:02:15.890 INFO  [kafka-consumer-2] o.a.k.c.c.i.ConsumerCoordinator : Revoking previous partitions, joining group for rebalance.',
      '2026-09-17 18:02:18.112 WARN  [kafka-consumer-2] com.seniorjava180.payment.PaymentConsumer : Processing uncommitted batch of 500 messages from offset 10240...'
    ],
    metrics: [
      { name: 'Kafka Consumer Group Lag', currentValue: '42,000 msgs', normalValue: '< 50 msgs', status: 'CRITICAL' },
      { name: 'Rebalance Events / Hour', currentValue: '14 rebalances', normalValue: '0 rebalances', status: 'CRITICAL' },
      { name: 'Batch Processing Time', currentValue: '380,000 ms', normalValue: '4,000 ms', status: 'CRITICAL' }
    ],
    hypothesisOptions: [
      'Kafka brokers ran out of disk space on /var/lib/kafka/data.',
      'Consumer batch size is too large (max.poll.records=5000) combined with synchronous fraud-check API calls taking > 300s, exceeding max.poll.interval.ms.',
      'Network switch dropped UDP packets between Kubernetes nodes.',
      'Zookeeper quorum lost leader election.'
    ],
    correctHypothesisIndex: 1,
    rootCauseAnalysis: `Consumer was configured with default max.poll.records=500 and max.poll.interval.ms=300000 (5 mins). When processing 500 records sequentially where each record executed a 1-second fraud check HTTP call, total batch time reached 500 seconds.
Because 500s > 300s, Kafka Coordinator assumed the consumer died and triggered a rebalance. The new consumer picked up the uncommitted offset and repeated the exact same batch, repeating the charges and failing again in an infinite rebalance storm.`,
    fixCommand: `1. Reduce max.poll.records = 50.
2. Increase max.poll.interval.ms = 600000 (10 mins).
3. Switch partition assignment strategy to CooperativeStickyAssignor.
4. Implement Redis idempotency key check before calling payment provider to prevent duplicate charges.`,
    verificationSteps: [
      'Verify consumer finishes poll batch within 15 seconds.',
      'Verify zero rebalances occur under 10x traffic injection.',
      'Verify duplicate event detection rejects re-sent message with 200 OK.'
    ],
    preventionStrategy: 'Enforce consumer idempotency on all financial transactions and monitor poll-to-poll duration with Micrometer timer.',
    status: 'UNRESOLVED'
  }
];

export const INITIAL_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'iq-1',
    category: 'JAVA',
    difficulty: 'HARD',
    question: 'How does the JVM Garbage Collector (G1 GC) achieve predictable pause time targets (-XX:MaxGCPauseMillis)?',
    keyPointsExpected: [
      'Divides Java Heap into 2048 equal-sized contiguous memory Regions (1MB - 32MB).',
      'Maintains Remembered Sets (R-Sets) and Card Tables to track cross-region object references without scanning the entire heap.',
      'Calculates Pause Time Prediction Model based on historical collection speed and garbage density.',
      'Selects a dynamic Collection Set (CSet) of regions with the highest garbage volume ("Garbage-First") that can be reclaimed within the target pause time.'
    ],
    idealSeniorAnswer: `G1 GC achieves predictable pause times by partitioning the heap into thousands of uniform regions rather than monolithic Young and Old generations.
It continuously gathers statistics on region reclamation cost and garbage density. During the concurrent marking cycle, G1 identifies which regions are mostly dead.
When a Mixed GC pause occurs, G1 selects the highest-yield regions (Collection Set) that fit mathematically within the user-specified -XX:MaxGCPauseMillis budget. Because it only evacuates this chosen subset rather than the whole Old generation, pause times remain bounded and predictable.`,
    confidence: 4
  },
  {
    id: 'iq-2',
    category: 'SPRING',
    difficulty: 'HARD',
    question: 'What is the difference between @Transactional(propagation = Propagation.REQUIRES_NEW) and Propagation.NESTED?',
    keyPointsExpected: [
      'REQUIRES_NEW completely suspends the outer transaction and starts an entirely independent physical database transaction with its own connection.',
      'NESTED participates in the same physical database connection using JDBC Savepoints.',
      'If REQUIRES_NEW rolls back, the outer transaction can catch the exception and commit its own work.',
      'If NESTED rolls back, it rolls back only to the Savepoint; if the outer transaction rolls back, it rolls back everything including the nested work.'
    ],
    idealSeniorAnswer: `Propagation.REQUIRES_NEW suspends the outer transaction, borrows a second connection from the connection pool, and executes as an independent transaction. An inner rollback does not automatically roll back the outer transaction if handled.
Propagation.NESTED uses the same physical connection and creates a database SAVEPOINT before executing. If the nested method fails, Hibernate executes ROLLBACK TO SAVEPOINT, allowing the outer transaction to continue and commit. However, if the outer transaction later rolls back, the nested work is also reverted. Note that NESTED requires JDBC driver savepoint support and does not work with all JPA dialect configurations.`,
    confidence: 5
  },
  {
    id: 'iq-3',
    category: 'MICROSERVICES',
    difficulty: 'STAFF',
    question: 'How do you prevent the Cache Stampede (Thundering Herd) problem in a distributed caching layer during high-traffic cache expiration?',
    keyPointsExpected: [
      'Probabilistic Early Expiration (XFetch algorithm).',
      'Mutual exclusion lock (Mutex / Redis SETNX) so only one thread queries the database and populates the cache while others wait or return stale data.',
      'Background asynchronous cache refresh before TTL expires (Refresh-Ahead).',
      'Adding random jitter to cache TTLs to avoid simultaneous expiration across thousands of keys.'
    ],
    idealSeniorAnswer: `To prevent cache stampede when a hot key expires under thousands of concurrent QPS, we employ three complementary techniques:
1. Mutex Locking: When a cache miss occurs, worker threads attempt to acquire a short-lived Redis distributed lock (e.g. key:lock). Only the lock winner queries PostgreSQL and updates Redis; all other threads sleep for 50ms and re-read from cache.
2. TTL Jitter: We add 10-20% randomized jitter (e.g. TTL = 300s + rand(60)) so clustered cache keys do not expire at the exact same second.
3. XFetch (Probabilistic Refresh): The client calculates an early refresh probability based on compute time and remaining TTL: delta * beta * ln(rand()) > (TTL - now). If true, a background worker proactively refreshes the cache before user requests ever experience a cold miss.`,
    confidence: 4
  }
];
