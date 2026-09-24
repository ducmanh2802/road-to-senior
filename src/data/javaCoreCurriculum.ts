/**
 * P0 Java Core Curriculum & Roadmap Foundation.
 * 
 * Defines the 3-pillar architectural standard for Senior Java 180:
 * - Pillar 1: Language (1.1 - 1.7)
 * - Pillar 2: JVM (2.1 - 2.6)
 * - Pillar 3: Concurrency (3.1 - 3.7)
 *
 * Implements the mandatory 10-stage Senior Engineering Loop:
 * LEARN → BUILD → BREAK → OBSERVE → DEBUG → FIX → BENCHMARK → DESIGN → EXPLAIN → DEFEND → ASSESS
 */

export type JavaCorePillar = 'language' | 'jvm' | 'concurrency';

export type JavaModuleStatus = 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type EngineeringLoopStage =
  | 'learn'
  | 'build'
  | 'break'
  | 'observe'
  | 'debug'
  | 'fix'
  | 'benchmark'
  | 'design'
  | 'explain'
  | 'defend'
  | 'assess';

export interface AssessmentQuestion {
  id: string;
  type: 'conceptual' | 'code-tracing' | 'debugging' | 'design';
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface JavaCoreModuleMetadata {
  id: string; // e.g. '1.1', '1.2', '2.1', '3.1'
  pillar: JavaCorePillar;
  number: string;
  title: string;
  subtitle: string;
  versionTarget: string;
  status: JavaModuleStatus;
  estimatedMinutes: number;
  prerequisites: string[];
  learningObjective: string;
  stagesCompleted?: Partial<Record<EngineeringLoopStage, boolean>>;
}

export interface ModuleContent<T = Record<string, unknown>> {
  metadata: JavaCoreModuleMetadata;
  learn: {
    overview: string;
    keyPoints: string[];
    recordComponents?: string[];
    immutabilityDistinctions?: {
      shallow: string;
      deep: string;
      references: string;
      defensiveCopy: string;
    };
    domainModelDistinctions?: {
      openHierarchy: string;
      closedHierarchy: string;
      compilerCheck: string;
      patternExhaustiveness: string;
    };
    patternMatchingDistinctions?: {
      typePattern: string;
      recordPattern: string;
      whenGuards: string;
      nullHandling: string;
    };
    versionNotes: string;
    extraDetails?: T;
  };
  buildLab: {
    title: string;
    description: string;
    filename: string;
    code: string;
    architecturalNotes: string[];
  };
  breakLab: {
    title: string;
    hazard: string;
    filename: string;
    vulnerableCode: string;
    mutationExplanation: string;
  };
  observeDebug: {
    title: string;
    steps: {
      step: number;
      instruction: string;
      expectedObservation: string;
      codeSnippet?: string;
    }[];
    debugInvestigation: string;
  };
  fixLab: {
    title: string;
    remediation: string;
    filename: string;
    fixedCode: string;
    copyOfNuances: string[];
  };
  benchmark: {
    title: string;
    disclaimer: string;
    points: string[];
  };
  design: {
    title: string;
    scenario: string;
    requirements: string[];
    sampleDesignCode: string;
    architecturalQuestions: {
      question: string;
      answer: string;
    }[];
  };
  explain60s: {
    prompt: string;
    script: string;
  };
  staffDefense: {
    questions: {
      q: string;
      defense: string;
    }[];
  };
  interviewDrill: {
    questions: {
      question: string;
      rubric: string;
    }[];
  };
  assessment: AssessmentQuestion[];
}

export type ModuleContent1_1 = ModuleContent;
export type ModuleContent1_2 = ModuleContent;
export type ModuleContent1_3 = ModuleContent;

export const JAVA_CORE_MODULES_METADATA: JavaCoreModuleMetadata[] = [
  // Pillar 1: Language
  {
    id: '1.1',
    pillar: 'language',
    number: '1.1',
    title: 'Records, Immutability & Data-Oriented Programming',
    subtitle: 'Shallow vs Deep Immutability, Defensive Copying & Safe Publication',
    versionTarget: 'Java 21 → Java 25',
    status: 'NOT_STARTED',
    estimatedMinutes: 45,
    prerequisites: [],
    learningObjective:
      'Master what Java records guarantee, what they do NOT guarantee, and how mutable state can still leak through shallow immutability.',
  },
  {
    id: '1.2',
    pillar: 'language',
    number: '1.2',
    title: 'Sealed Classes & Exhaustive Pattern Matching',
    subtitle: 'Closed Type Unions, Permitted Subtypes & Algebraic Domain Modeling',
    versionTarget: 'Java 21 → Java 25',
    status: 'NOT_STARTED',
    estimatedMinutes: 40,
    prerequisites: ['1.1'],
    learningObjective:
      'Design exhaustive state machines using sealed interfaces, permits clauses, and compiler-verified pattern switches without default branches.',
  },
  {
    id: '1.3',
    pillar: 'language',
    number: '1.3',
    title: 'Pattern Matching & Record Deconstruction',
    subtitle: 'Guarded Patterns, Null Handling & Switch Jump Tables',
    versionTarget: 'Java 21 → Java 25',
    status: 'NOT_STARTED',
    estimatedMinutes: 40,
    prerequisites: ['1.2'],
    learningObjective:
      'Extract and transform nested polymorphic domain payloads using modern type patterns, record deconstruction, and guarded when clauses without unsafe casting or null pointer exceptions.',
  },
  {
    id: '1.4',
    pillar: 'language',
    number: '1.4',
    title: 'Generics, Type Erasure & PECS Contract',
    subtitle: 'Wildcard Bounds, Heap Pollution & Synthetic Bridge Methods',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 45,
    prerequisites: ['1.1'],
    learningObjective:
      'Architect robust generic frameworks using Producer-Extends Consumer-Super bounds, analyzing bytecode bridge methods and avoiding heap pollution.',
  },
  {
    id: '1.5',
    pillar: 'language',
    number: '1.5',
    title: 'Collections Internals: HashMap & ConcurrentHashMap',
    subtitle: 'Bitwise Hashing, Treeification, Load Factors & Lock Striping',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 50,
    prerequisites: ['1.1'],
    learningObjective:
      'Analyze the internal memory layout and collision behavior of Java Map implementations under HashDoS attacks and multi-threaded contention.',
  },
  {
    id: '1.6',
    pillar: 'language',
    number: '1.6',
    title: 'Streams, Spliterators & Functional Cost Model',
    subtitle: 'Pipeline Fusing, ForkJoinPool Pitfalls & Allocation Overhead',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 45,
    prerequisites: ['1.4'],
    learningObjective:
      'Evaluate stream pipeline evaluation mechanics, custom Spliterator partitioning, and identify when imperative loops out-perform stream abstractions.',
  },
  {
    id: '1.7',
    pillar: 'language',
    number: '1.7',
    title: 'Exception Safety, Stack Trace Cost & Control Flow',
    subtitle: 'fillInStackTrace Overhead, Result Monads & Exception Tax',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 35,
    prerequisites: ['1.1'],
    learningObjective:
      'Quantify the CPU overhead of JVM stack unwinding in hot paths and design zero-overhead domain error signaling pipelines.',
  },

  // Pillar 2: JVM
  {
    id: '2.1',
    pillar: 'jvm',
    number: '2.1',
    title: 'JVM Memory Architecture & Container Sizing',
    subtitle: 'Heap Generations, Thread Stacks, Metaspace & Native Memory',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 50,
    prerequisites: ['1.1'],
    learningObjective:
      'Diagnose out-of-memory variations and tune JVM boundaries against Linux cgroup limits in Kubernetes container environments.',
  },
  {
    id: '2.2',
    pillar: 'jvm',
    number: '2.2',
    title: 'Object Anatomy, Compressed OOPs & Cache Lines',
    subtitle: 'Mark Word, 8-Byte Alignment, 32GB Cliff & False Sharing',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 45,
    prerequisites: ['2.1'],
    learningObjective:
      'Inspect object layouts using JOL, calculate memory footprints, and avoid false sharing CPU cache line stalls.',
  },
  {
    id: '2.3',
    pillar: 'jvm',
    number: '2.3',
    title: 'JIT Compilation, Tiered Execution & Escape Analysis',
    subtitle: 'C1/C2 Compilers, Scalar Replacement & Megamorphic Vtables',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 50,
    prerequisites: ['2.2'],
    learningObjective:
      'Track JIT tiered compilation phases, verify escape analysis scalar replacement, and eliminate deoptimization traps.',
  },
  {
    id: '2.4',
    pillar: 'jvm',
    number: '2.4',
    title: 'Garbage Collection Deep Dive: G1 vs ZGC',
    subtitle: 'Humongous Regions, Colored Pointers & Concurrent Compaction',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 60,
    prerequisites: ['2.1'],
    learningObjective:
      'Select and tune garbage collectors between high-throughput G1 and ultra-low-latency Generational ZGC based on SLA latency budgets.',
  },
  {
    id: '2.5',
    pillar: 'jvm',
    number: '2.5',
    title: 'Class Loading Mechanics, Modules & Isolation',
    subtitle: 'Parent Delegation, Dynamic Proxies, JPMS & Metaspace Leaks',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 45,
    prerequisites: ['2.1'],
    learningObjective:
      'Resolve ClassNotFoundException vs NoClassDefFoundError, design isolated ClassLoader plugins, and audit Metaspace leak vectors.',
  },
  {
    id: '2.6',
    pillar: 'jvm',
    number: '2.6',
    title: 'Production Diagnostics & JVM Flight Recorder (JFR)',
    subtitle: 'Safe-Point Stalls (TTSP), Async Profiler & Continuous Recording',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 50,
    prerequisites: ['2.3', '2.4'],
    learningObjective:
      'Profile live production JVMs under <1% overhead using JFR event streaming to identify CPU hotspots and lock contention.',
  },

  // Pillar 3: Concurrency
  {
    id: '3.1',
    pillar: 'concurrency',
    number: '3.1',
    title: 'Platform Thread Lifecycle & OS Kernel Mapping',
    subtitle: '1:1 Thread Model, Context Switching Overhead & Pool Sizing',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 45,
    prerequisites: ['2.1'],
    learningObjective:
      'Mathematically size platform thread pools and manage state transitions from RUNNABLE to BLOCKED and WAITING without thread starvation.',
  },
  {
    id: '3.2',
    pillar: 'concurrency',
    number: '3.2',
    title: 'Java Memory Model (JMM) & Happens-Before',
    subtitle: 'CPU Store Buffers, Memory Barriers & Safe Publication',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 55,
    prerequisites: ['3.1'],
    learningObjective:
      'Eliminate instruction reordering data races by applying formal happens-before relationships and volatile memory barriers.',
  },
  {
    id: '3.3',
    pillar: 'concurrency',
    number: '3.3',
    title: 'Hardware Atomics, CAS & Lock-Free Data Structures',
    subtitle: 'AtomicLong vs LongAdder, Cell Striping & The ABA Problem',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 50,
    prerequisites: ['3.2'],
    learningObjective:
      'Construct lock-free non-blocking algorithms using Compare-And-Swap primitives while mitigating cache line bouncing.',
  },
  {
    id: '3.4',
    pillar: 'concurrency',
    number: '3.4',
    title: 'AbstractQueuedSynchronizer (AQS) & Explicit Locks',
    subtitle: 'ReentrantLock, StampedLock Optimistic Reads & Deadlock Avoidance',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 55,
    prerequisites: ['3.2', '3.3'],
    learningObjective:
      'Master AQS state node queueing, implement optimistic read locking with StampedLock, and eliminate cross-thread lock deadlocks.',
  },
  {
    id: '3.5',
    pillar: 'concurrency',
    number: '3.5',
    title: 'CompletableFuture & Non-Blocking Async Pipelines',
    subtitle: 'Monadic Composition, Pool Isolation & Async Exception Bubbling',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 50,
    prerequisites: ['3.1'],
    learningObjective:
      'Orchestrate resilient multi-stage asynchronous processing without starving the common ForkJoinPool or losing error context.',
  },
  {
    id: '3.6',
    pillar: 'concurrency',
    number: '3.6',
    title: 'Virtual Threads & Loom Mechanics',
    subtitle: 'Carrier Threads, Continuation Suspension & Pinning Hazards',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 55,
    prerequisites: ['3.1', '3.4'],
    learningObjective:
      'Scale to millions of concurrent user-mode threads, identify carrier thread pinning caused by synchronized blocks, and rewrite with ReentrantLock.',
  },
  {
    id: '3.7',
    pillar: 'concurrency',
    number: '3.7',
    title: 'Structured Concurrency & Scoped Values',
    subtitle: 'StructuredTaskScope, Task Encapsulation & ThreadLocal Replacement',
    versionTarget: 'Java 21 → Java 25',
    status: 'LOCKED',
    estimatedMinutes: 55,
    prerequisites: ['3.6'],
    learningObjective:
      'Coordinate concurrent subtasks as single atomic operational units and safely share immutable context across virtual threads without ThreadLocal leaks.',
  },
];

export const MODULE_1_1_CONTENT: ModuleContent1_1 = {
  metadata: JAVA_CORE_MODULES_METADATA[0],
  learn: {
    overview:
      'Java records (introduced in Java 14, finalized in Java 16, foundational across Java 21-25) are nominal data carriers. A record provides a concise syntax for declaring classes whose primary purpose is to store immutable data. However, a widespread and dangerous misconception among engineers is that declaring a record automatically makes the entire data graph deeply immutable.',
    keyPoints: [
      'Records are nominal tuples: state is defined completely and concisely in the record header.',
      'All record component fields are implicitly private final references.',
      'Records provide compiler-generated canonical constructors, accessors, equals(), hashCode(), and toString().',
      'Records cannot extend other classes (they implicitly extend java.lang.Record), but can implement interfaces.',
      'Shallow Immutability vs Deep Immutability: A record guarantees that its component references cannot be reassigned. It does NOT protect referenced mutable objects from internal structural mutation.',
      'Defensive copying is MANDATORY when accepting or returning mutable collections or date/buffer objects.',
    ],
    recordComponents: [
      'Canonical Constructor: Signature matching the record header exactly.',
      'Compact Constructor: No parameter list; runs validation and normalization before implicit field assignment.',
      'Accessors: Methods with names matching the components (e.g., id(), not getId()).',
      'Record Equality: Component-wise value equality based on component equals(), not object reference identity.',
    ],
    immutabilityDistinctions: {
      shallow:
        'The reference variable itself cannot be pointed to another object (enforced by the final keyword on record fields).',
      deep:
        'All objects reachable from the root reference are themselves completely immutable through all references.',
      references:
        'A final reference to an ArrayList prevents assigning items = new ArrayList<>(), but DOES NOT prevent items.add("MALICIOUS")!',
      defensiveCopy:
        'Creating an unmodifiable snapshot of the incoming collection during construction, and ensuring no reference to the original mutable source is retained.',
    },
    versionNotes:
      'Standardized in Java 16 LTS baseline; seamlessly integrates with Record Patterns in Java 21+ and Flexible Constructor Bodies in Java 22+ (JEP 447). Compatible across Java 21 LTS through Java 25 LTS.',
  },
  buildLab: {
    title: 'Production Immutable DTO: OrderSnapshot',
    description:
      'Demonstrates a hardened, production-grade record enforcing invariant validation, compact constructor defensive copies, and unmodifiable collection exposure.',
    filename: 'OrderSnapshot.java',
    code: `package com.seniorjava.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

/**
 * Production-grade immutable Order snapshot record.
 * Follows strict defensive copying to prevent state leakage.
 */
public record OrderSnapshot(
    String orderId,
    String customerId,
    BigDecimal totalAmount,
    List<String> itemSkus,
    Instant timestamp
) {
    // Compact constructor for validation invariants & defensive copying
    public OrderSnapshot {
        // 1. Invariant validation
        Objects.requireNonNull(orderId, "orderId cannot be null");
        Objects.requireNonNull(customerId, "customerId cannot be null");
        Objects.requireNonNull(totalAmount, "totalAmount cannot be null");
        Objects.requireNonNull(timestamp, "timestamp cannot be null");

        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("totalAmount cannot be negative: " + totalAmount);
        }

        // 2. DEFENSIVE COPY: List.copyOf creates an unmodifiable copy and rejects null elements
        // This isolates internal record state from any external caller holding a reference
        itemSkus = (itemSkus == null) ? List.of() : List.copyOf(itemSkus);
    }

    // Secondary convenience constructor
    public OrderSnapshot(String orderId, String customerId, BigDecimal totalAmount, List<String> itemSkus) {
        this(orderId, customerId, totalAmount, itemSkus, Instant.now());
    }

    // Accessor itemSkus() returns the unmodifiable List.copyOf instance safely.
}`,
    architecturalNotes: [
      'Compact constructor syntax eliminates duplicate field assignment boilerplate (this.x = x).',
      'List.copyOf(itemSkus) makes a shallow unmodifiable copy and checks for null elements.',
      'Validates all domain invariants before the object can be safely instantiated.',
      'Guarantees thread-safe safe publication because all fields are final and the collection is unmodifiable.',
    ],
  },
  breakLab: {
    title: 'Break Lab: The Shallow Immutability Vulnerability',
    hazard:
      'A naive record definition demonstrates the shallow immutability trap: it accepts a mutable collection and exposes it directly, enabling external callers to corrupt internal state after construction without throwing any compiler warning.',
    filename: 'VulnerableOrderRecord.java',
    vulnerableCode: `package com.seniorjava.domain.broken;

import java.util.ArrayList;
import java.util.List;

// ❌ VULNERABLE: Naive record with zero defensive copying
public record VulnerableOrderRecord(String orderId, List<String> items) {
    // Default canonical constructor implicitly executes: this.items = items;
    // Default accessor directly returns the caller-controlled items reference!
}

// ⚠️ PRODUCTION HAZARD SCENARIO:
class ExploitScenario {
    public static void main(String[] args) {
        List<String> mutableCart = new ArrayList<>();
        mutableCart.add("SKU-1001");
        mutableCart.add("SKU-1002");

        // Step 1: Create record believing it is "immutable"
        VulnerableOrderRecord order = new VulnerableOrderRecord("ORD-99", mutableCart);
        System.out.println("Initial items: " + order.items()); // [SKU-1001, SKU-1002]

        // Step 2: External caller modifies the original list!
        mutableCart.add("SKU-MALICIOUS-INJECTED");
        
        // 💥 OBSERVATION: The record's state has mutated under the hood!
        System.out.println("Compromised items: " + order.items()); 
        // Prints: [SKU-1001, SKU-1002, SKU-MALICIOUS-INJECTED]

        // Step 3: Reverse leak - accessor caller mutates internal list!
        order.items().clear();
        System.out.println("Wiped items: " + order.items()); // Prints: []
    }
}`,
    mutationExplanation:
      'Because `items` in `VulnerableOrderRecord` is simply a final reference pointing to the heap memory address of `mutableCart`, changing the contents of `mutableCart` mutates what `order.items()` observes. The reference did not change, but the object in heap memory did.',
  },
  observeDebug: {
    title: 'Observe & Debug: Guided Mutation Trace Lab',
    steps: [
      {
        step: 1,
        instruction: 'Inspect the incoming collection instantiation and the record initialization.',
        expectedObservation:
          'List<String> cart = new ArrayList<>() allocates a mutable collection in Eden heap space with reference @A1.',
        codeSnippet: 'List<String> cart = new ArrayList<>(); cart.add("SKU-100"); OrderRecord order = new OrderRecord("1", cart);',
      },
      {
        step: 2,
        instruction: 'Trace the reference stored in the record field.',
        expectedObservation:
          'order.items points directly to @A1. No new collection is allocated. Both `cart` and `order.items()` reference the exact same memory buffer.',
      },
      {
        step: 3,
        instruction: 'Simulate concurrent or downstream mutation on the original reference: cart.add("SKU-CORRUPTED").',
        expectedObservation:
          'Because @A1 was modified, calling order.items() now reflects [SKU-100, SKU-CORRUPTED]. Thread-safety and immutability invariants are completely destroyed.',
      },
      {
        step: 4,
        instruction: 'Apply the compact constructor fix using List.copyOf(items).',
        expectedObservation:
          'List.copyOf(cart) allocates an independent unmodifiable list at memory address @B2. order.items now points to @B2.',
        codeSnippet: 'public OrderRecord { items = List.copyOf(items); }',
      },
      {
        step: 5,
        instruction: 'Re-run the mutation experiment on `cart`.',
        expectedObservation:
          'cart.add("SKU-CORRUPTED") mutates @A1. order.items() points to @B2 and remains strictly [SKU-100]. Mutation blocked!',
      },
    ],
    debugInvestigation:
      'Senior Root Cause: Declaring a field `final` in Java only prevents re-assignment of the variable pointer; it provides ZERO structural immutability guarantees for the referenced instance. To achieve immutability of composite data structures, defensive copying at architectural entry points is required.',
  },
  fixLab: {
    title: 'Fix Lab: Defensive Copying via List.copyOf()',
    remediation:
      'Use the compact constructor to decouple incoming and internal collection references using List.copyOf().',
    filename: 'FixedOrderRecord.java',
    fixedCode: `package com.seniorjava.domain.fixed;

import java.util.List;
import java.util.Objects;

public record FixedOrderRecord(String orderId, List<String> items) {

    // Compact constructor - executed before fields are assigned
    public FixedOrderRecord {
        Objects.requireNonNull(orderId, "orderId cannot be null");
        
        // Fix: Defensive copy creates an unmodifiable List decoupling from caller
        items = (items == null) ? List.of() : List.copyOf(items);
    }

    // Accessor: Because items is guaranteed to be an unmodifiable List
    // created by List.copyOf, calling items() is safe because callers cannot
    // invoke .add() or .remove() without receiving UnsupportedOperationException.
}`,
    copyOfNuances: [
      'List.copyOf() returns an unmodifiable list containing the elements of the given Collection.',
      'If the given list is already an unmodifiable list produced by List.copyOf() or List.of(), List.copyOf() may return the same instance (efficient optimization).',
      'List.copyOf() rejects null elements immediately with NullPointerException.',
      'CRITICAL LIMITATION: List.copyOf() is a shallow copy. If the list contains mutable objects (e.g. List<CustomerAddress>), modifying customerAddress.setStreet() will still leak mutation! For complete deep immutability, list elements must themselves be immutable types (like records or Strings).',
    ],
  },
  benchmark: {
    title: 'Performance & JVM Optimization Characteristics',
    disclaimer:
      'JVM optimizations like inlining, escape analysis, and scalar replacement are workload-, JVM-version-, and runtime-dependent. Never claim records are magically faster than classes without JMH measurements.',
    points: [
      'Boilerplate & Maintenance: Eliminates hundreds of lines of brittle getters, equals(), hashCode(), and constructors without bytecode enhancement libraries (Lombok).',
      'Accessor Inlining: Record accessors are standard Java methods. The C2 JIT compiler inlines them identically to standard trivial getters (typical inline threshold < 325 bytecode bytes).',
      'Scalar Replacement & Escape Analysis: When a record is instantiated locally inside a method and does not escape, C2 can eliminate the heap allocation entirely and decompose the record into CPU registers/stack variables.',
      'Memory Footprint: A record instance has the exact same memory layout as an equivalent plain class (12/16-byte object header + compressed OOP references + primitive fields + padding). Records do not magically reduce heap byte size on current HotSpot versions (Project Valhalla value objects will address flattened memory layout in future releases).',
    ],
  },
  design: {
    title: 'Senior Design Challenge: Immutable CQRS Event DTO',
    scenario:
      'Design an immutable OrderCreatedEvent used in a high-throughput event-driven microservice system that must be safely published across threads, serialized to Kafka, and cached without data corruption.',
    requirements: [
      'Guaranteed immutability across multi-threaded thread pools.',
      'Rejection of null identifiers and negative amounts.',
      'Support for multiple line items without collection leakage.',
      'Stable value-based equals() and hashCode() for deduplication.',
    ],
    sampleDesignCode: `package com.seniorjava.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

public record OrderLineItem(String sku, int quantity, BigDecimal unitPrice) {
    public OrderLineItem {
        Objects.requireNonNull(sku, "sku must not be null");
        Objects.requireNonNull(unitPrice, "unitPrice must not be null");
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be > 0");
        if (unitPrice.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Price cannot be negative");
    }
}

public record OrderCreatedEvent(
    String eventId,
    String orderId,
    String customerId,
    List<OrderLineItem> items,
    BigDecimal totalAmount,
    Instant occurredOn
) {
    public OrderCreatedEvent {
        Objects.requireNonNull(eventId, "eventId required");
        Objects.requireNonNull(orderId, "orderId required");
        Objects.requireNonNull(customerId, "customerId required");
        Objects.requireNonNull(totalAmount, "totalAmount required");
        Objects.requireNonNull(occurredOn, "occurredOn required");

        // Defensive copy ensures list structure cannot be mutated
        // Notice: OrderLineItem is itself an immutable record, guaranteeing DEEP immutability!
        items = (items == null) ? List.of() : List.copyOf(items);
        if (items.isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one line item");
        }
    }
}`,
    architecturalQuestions: [
      {
        question: 'Which fields require defensive copying, and why is this design deeply immutable?',
        answer:
          '`items` requires a defensive copy via `List.copyOf`. Because the elements inside the list (`OrderLineItem`) are themselves immutable records with validated components, the entire object graph is deeply immutable.',
      },
      {
        question: 'What does "Safe Publication" mean in the Java Memory Model, and how do records satisfy it?',
        answer:
          'Under JMM (JSR-133), an object is safely published if its initialization finishes before any other thread observes its reference. Because all record component fields are implicitly `final`, the JVM guarantees that all field writes complete and are visible to other threads once the constructor finishes, without requiring volatile or explicit locks.',
      },
      {
        question: 'Does a record alone guarantee thread safety?',
        answer:
          'No! A record whose fields point to mutable objects (e.g. HashMap, Date, non-defensively copied List) is NOT thread-safe. Thread safety requires both safe publication and that all accessible referenced state is either immutable or properly synchronized.',
      },
    ],
  },
  explain60s: {
    prompt:
      'What is a Java record, and why does using a record NOT automatically make an object deeply immutable?',
    script:
      'A Java record is a nominal tuple: a transparent carrier for immutable data where all component fields are implicitly private final references with compiler-generated accessors, equals, and hashCode. However, a record only guarantees shallow immutability. While the record\'s component references cannot be reassigned to point to different objects, any mutable object referenced by the record—such as an ArrayList or Date—can still be mutated internally by external callers. To achieve true deep immutability, a senior engineer must explicitly enforce defensive copying in the constructor using mechanisms like List.copyOf, and ensure all nested objects in the graph are themselves immutable.',
  },
  staffDefense: {
    questions: [
      {
        q: "Why can't a record extend an arbitrary class?",
        defense:
          'Every record implicitly extends java.lang.Record. Because Java supports single class inheritance, records cannot extend another class. Conceptually, records are algebraic data carriers defined solely by their component state; allowing inheritance would introduce hidden mutable state, constructor chaining hazards, and violate component-based value equality.',
      },
      {
        q: 'What does a canonical constructor do versus a compact constructor?',
        defense:
          'The canonical constructor has a parameter list matching the record components exactly and handles field assignment. The compact constructor omits the parameter list entirely, allowing developers to execute validation, normalization, and defensive copies directly on parameters before the compiler implicitly assigns them to the final fields.',
      },
      {
        q: 'Are record components deeply immutable?',
        defense:
          'No. Record fields are implicitly final, meaning the reference is immutable (shallow immutability). If a component points to an ArrayList, HashMap, or any mutable object, the underlying instance can still be modified unless defensively copied into an unmodifiable collection.',
      },
      {
        q: 'Is a record automatically thread-safe?',
        defense:
          'Not automatically. A record provides safe publication for its component references thanks to final field semantics in the JMM. However, if any component refers to a mutable object, concurrent threads reading and writing that referenced object will suffer data races unless that object is immutable or externally synchronized.',
      },
      {
        q: 'When would you choose a normal class instead of a record?',
        defense:
          'Choose a normal class when: 1) The entity requires identity-based equality (e.g. JPA Hibernate entities with managed lifecycle and proxy requirements); 2) Internal state mutation is required (accumulators, state machines); 3) Encapsulated private helper state is needed that should not be exposed via public accessors; 4) Class inheritance hierarchies are required.',
      },
      {
        q: 'How does equality of records differ conceptually from identity-based equality?',
        defense:
          'Normal classes default to identity equality (System.identityHashCode / memory address pointer comparison). Records enforce structural value equality: two distinct record instances with identical components evaluate as equal. This makes them ideal for CQRS DTOs, cache keys, and value objects.',
      },
      {
        q: 'What are the serialization trade-offs and security semantics of records?',
        defense:
          'Record serialization cannot be bypassed using standard readObject() reflection tricks or gadget chains because record deserialization MUST invoke the canonical constructor using component extraction. However, records do not automatically solve all serialization issues; untrusted data can still trigger DoS or invalid states if validation is not strictly enforced in the constructor.',
      },
      {
        q: 'What should you consider when records contain nested collections?',
        defense:
          'Always use List.copyOf(), Set.copyOf(), or Map.copyOf() in the compact constructor. Remember that copyOf() is shallow; if the elements themselves are mutable, you must map them to immutable snapshot representations or deep copies.',
      },
    ],
  },
  interviewDrill: {
    questions: [
      {
        question:
          'Walk me through the difference between shallow and deep immutability in the context of Java records.',
        rubric:
          'Candidate must clearly distinguish reference immutability (final reference pointer) from structural object immutability. Must demonstrate how ArrayList.add() mutates record state unless defensive copy is applied.',
      },
      {
        question:
          'Explain why using a record as a JPA/Hibernate entity is generally considered an architectural anti-pattern.',
        rubric:
          'Candidate must explain that Hibernate requires no-arg constructors, proxying via subclassing (records are final and cannot be proxied), dirty checking via setter mutation, and identity-based equality (records enforce component equality). Records work well as JPA projection DTOs, not entities.',
      },
      {
        question:
          'How does Java serialization handle records differently from ordinary Serializable classes?',
        rubric:
          'Candidate must articulate that record deserialization always flows through the canonical constructor, respecting all invariant checks. Ordinary classes bypass constructors during serialization, creating known gadget vulnerabilities.',
      },
      {
        question:
          'What happens if you pass a null collection to List.copyOf() versus Collections.unmodifiableList()?',
        rubric:
          'Candidate must identify that List.copyOf() immediately throws NullPointerException if the input or any element is null, and creates a defensive copy. Collections.unmodifiableList() merely wraps the existing reference (allowing upstream mutations to leak through).',
      },
    ],
  },
  assessment: [
    {
      id: 'q1',
      type: 'conceptual',
      prompt:
        'Which statement accurately describes the immutability guarantee provided by a standard Java record declaration: record User(String id, List<String> roles)?',
      options: [
        'Both the record references and the elements within roles are deeply and recursively immutable.',
        'The id and roles references cannot be reassigned, but the List instance referenced by roles can be structurally modified if it is mutable.',
        'The compiler automatically wraps all List and Map components in Collections.unmodifiableList.',
        'Records cannot hold references to mutable types like java.util.List.',
      ],
      correctIndex: 1,
      explanation:
        'Records provide shallow immutability: the component fields are implicitly private final references. The referenced objects themselves remain mutable unless defensively copied.',
    },
    {
      id: 'q2',
      type: 'conceptual',
      prompt: 'Why cannot a Java record extend another abstract or concrete class?',
      options: [
        'Because records are interfaces in bytecode.',
        'Because all Java records implicitly extend java.lang.Record, and Java does not support multiple class inheritance.',
        'Because JVM classloaders cannot link records that have superclasses.',
        'Records can extend classes if the superclass has only final fields.',
      ],
      correctIndex: 1,
      explanation:
        'All records implicitly extend java.lang.Record. Since Java permits single class inheritance, records cannot extend any other class.',
    },
    {
      id: 'q3',
      type: 'conceptual',
      prompt: 'What is the primary architectural purpose of a compact constructor in a record?',
      options: [
        'To allow declaring mutable instance fields not present in the record header.',
        'To perform validation, normalization, and defensive copies before field assignment without repeating parameters.',
        'To bypass canonical field initialization for lazy loading.',
        'To automatically serialize the record to JSON.',
      ],
      correctIndex: 1,
      explanation:
        'The compact constructor (public RecordName { ... }) executes validation and defensive copies on constructor parameters before implicit assignment to final fields.',
    },
    {
      id: 'q4',
      type: 'conceptual',
      prompt: 'Under the Java Memory Model (JMM), why does a record provide safe publication for its fields?',
      options: [
        'Because all record fields are implicitly volatile.',
        'Because all record components are implicitly final, guaranteeing visibility once constructor completes under JMM final field rules.',
        'Because the JVM synchronizes on the record monitor during instantiation.',
        'Because records allocate memory directly on the thread execution stack.',
      ],
      correctIndex: 1,
      explanation:
        'JSR-133 guarantees that any object whose fields are final is safely published once the constructor finishes, ensuring all threads see initialized values without locks.',
    },
    {
      id: 'q5',
      type: 'conceptual',
      prompt:
        'Why is it generally recommended to avoid using records as JPA @Entity classes in Spring Boot / Hibernate?',
      options: [
        'JPA does not support records because records are not valid Java bytecode.',
        'Hibernate requires non-final classes for CGLIB/ByteBuddy lazy proxies, no-arg constructors, and mutable setters for dirty checking.',
        'Records cannot be annotated with @Id or @Column.',
        'Records cannot have database column mappings.',
      ],
      correctIndex: 1,
      explanation:
        'Hibernate requires mutable entities with zero-arg constructors and non-final classes to create dynamic proxies. Records are final and immutable; they are ideal for projection DTOs, not entities.',
    },
    {
      id: 'q6',
      type: 'code-tracing',
      prompt: 'Consider the code below. What is printed to stdout when main executes?',
      codeSnippet: `List<String> list = new ArrayList<>();
list.add("ALPHA");
record Container(List<String> items) {}
Container c = new Container(list);
list.add("BETA");
System.out.println(c.items().size());`,
      options: ['1', '2', 'Throws UnsupportedOperationException', 'Throws NullPointerException'],
      correctIndex: 1,
      explanation:
        'Because Container uses the default canonical constructor without defensive copying, c.items() points to the same ArrayList instance that was modified. The size is 2.',
    },
    {
      id: 'q7',
      type: 'code-tracing',
      prompt: 'Consider this record with a compact constructor. What occurs when inputList is mutated?',
      codeSnippet: `record SafeContainer(List<String> items) {
    public SafeContainer {
        items = List.copyOf(items);
    }
}
List<String> inputList = new ArrayList<>(List.of("A", "B"));
SafeContainer container = new SafeContainer(inputList);
inputList.add("C");
System.out.println(container.items().size());`,
      options: ['3', '2', 'Throws ConcurrentModificationException', 'Throws UnsupportedOperationException on line 8'],
      correctIndex: 1,
      explanation:
        'List.copyOf(items) creates an independent unmodifiable list. Mutating inputList has zero effect on the record. Size remains 2.',
    },
    {
      id: 'q8',
      type: 'code-tracing',
      prompt: 'What happens if a caller executes container.items().add("D") on an instance of SafeContainer?',
      codeSnippet: `record SafeContainer(List<String> items) {
    public SafeContainer {
        items = List.copyOf(items);
    }
}
SafeContainer sc = new SafeContainer(List.of("A"));
sc.items().add("D");`,
      options: [
        'Element "D" is successfully added.',
        'Throws java.lang.UnsupportedOperationException at runtime.',
        'Compilation error: items() returns a read-only token.',
        'Silently ignores the addition.',
      ],
      correctIndex: 1,
      explanation:
        'List.copyOf() returns an unmodifiable List implementation whose .add() method unconditionally throws UnsupportedOperationException.',
    },
    {
      id: 'q9',
      type: 'debugging',
      prompt:
        'A team discovers that despite using `items = List.copyOf(items)` in their Order record, callers are still mutating customer addresses inside `order.items().get(0).setStreet("Hacked")`. What is the root cause?',
      options: [
        'List.copyOf() has a known JVM bug on Java 21.',
        'List.copyOf() provides a shallow copy of element references; the OrderItem elements themselves are mutable classes.',
        'The record equals() method was overridden incorrectly.',
        'The developer forgot to mark the record as sealed.',
      ],
      correctIndex: 1,
      explanation:
        'List.copyOf() only protects the collection structure (adding/removing items). It does not recursively clone the elements. If the element class has setters, its internal state can still be mutated.',
    },
    {
      id: 'q10',
      type: 'debugging',
      prompt:
        'A developer writes: `items = Collections.unmodifiableList(items);` in their record constructor instead of `List.copyOf(items)`. What failure mode persists?',
      options: [
        'Collections.unmodifiableList allocates 10x more heap memory.',
        'Collections.unmodifiableList is a view wrapper: if the caller mutates the original underlying collection, the record still observes the mutation.',
        'Collections.unmodifiableList throws ClassCastException when accessed.',
        'There is no difference; both provide identical safety.',
      ],
      correctIndex: 1,
      explanation:
        'unmodifiableList is only a wrapper view around the backing collection. It does NOT make a defensive copy. Upstream mutations on the backing list will leak into the record.',
    },
    {
      id: 'q11',
      type: 'design',
      prompt:
        'When designing a high-throughput, thread-safe CQRS event DTO in Java 21-25, which pattern achieves guaranteed deep immutability?',
      options: [
        'Use a record and trust developers not to mutate collections passed to it.',
        'Use a record where all collection components are defensively copied via List.copyOf/Set.copyOf/Map.copyOf, and all element types are themselves immutable records or primitive/String values.',
        'Use an ordinary class with Lombok @Data and @Synchronized.',
        'Use a record with public getters and synchronized blocks around collection accessors.',
      ],
      correctIndex: 1,
      explanation:
        'True deep immutability requires both defensive collection copying and ensuring that all nested graph elements are themselves immutable types.',
    },
  ],
};

export const MODULE_1_2_CONTENT: ModuleContent1_2 = {
  metadata: JAVA_CORE_MODULES_METADATA[1],
  learn: {
    overview:
      'Sealed classes and interfaces (introduced in Java 15, finalized in Java 17, and central to modern Java 21-25 architecture) restrict which other classes or interfaces may extend or implement them. Prior to sealed types, Java provided only two inheritance extremes: completely open (public/protected) or completely closed (final/package-private). Sealed types introduce Algebraic Data Types (ADTs) and closed type unions to Java, enabling domain models where all possible variants are known at compile time, eliminating the need for brittle default branches in switch expressions.',
    keyPoints: [
      'Sealed types use the `sealed` modifier and explicitly declare their permitted subtypes using the `permits` clause.',
      'If permitted subclasses are declared in the same compilation unit (.java file), the `permits` clause is optional—the compiler infers them.',
      'Every permitted subclass MUST directly extend/implement the sealed type and specify one of three modifiers: `final` (cannot be extended), `sealed` (extends with its own permitted list), or `non-sealed` (re-opens inheritance).',
      'Exhaustiveness checking: When switching over a sealed type hierarchy using pattern matching, the Java compiler verifies that all permitted variants are handled. If all variants are covered, NO `default` clause is required.',
      'Adding a new subtype to a sealed hierarchy triggers a compile-time failure across every pattern switch that consumes it, preventing silent unhandled state bugs.',
    ],
    domainModelDistinctions: {
      openHierarchy:
        'Traditional public class inheritance allows any downstream consumer or library to extend classes, making it impossible to guarantee exhaustive branch handling at compile time.',
      closedHierarchy:
        'Sealed hierarchies define an immutable set of domain possibilities (sum types) strictly controlled by the domain owner.',
      compilerCheck:
        'javac builds a proof table verifying every permitted leaf subtype is handled in switch expressions, eliminating unexpected runtime fall-through.',
      patternExhaustiveness:
        'Omitting `default:` is a senior engineering best practice for sealed types because a default branch silently swallows newly introduced domain variants.',
    },
    versionNotes:
      'Standardized in Java 17 LTS; seamlessly powers Pattern Matching for switch (Java 21 LTS baseline) and Record Patterns across Java 21-25.',
  },
  buildLab: {
    title: 'Production Sealed Domain Hierarchy: PaymentResult',
    description:
      'Demonstrates an exhaustive, algebraic domain model representing payment processing outcomes using a sealed interface, permitted record subtypes, and compile-time pattern matching.',
    filename: 'PaymentResult.java',
    code: `package com.seniorjava.domain.payment;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Algebraic Domain Model: Sealed PaymentResult hierarchy.
 * Closed type union: Only Success, Declined, and GatewayError are possible variants.
 */
public sealed interface PaymentResult
    permits PaymentResult.Success, PaymentResult.Declined, PaymentResult.GatewayError {

    // Common algebraic metadata
    String transactionId();
    Instant processedAt();

    // Permitted Subtype 1: Final Record variant
    record Success(
        String transactionId,
        BigDecimal amountCharged,
        String authorizationCode,
        Instant processedAt
    ) implements PaymentResult {}

    // Permitted Subtype 2: Final Record variant
    record Declined(
        String transactionId,
        String reasonCode,
        boolean retryable,
        Instant processedAt
    ) implements PaymentResult {}

    // Permitted Subtype 3: Final Record variant
    record GatewayError(
        String transactionId,
        int httpStatusCode,
        String errorMessage,
        Instant processedAt
    ) implements PaymentResult {}
}

// Exhaustive Dispatcher consuming PaymentResult
class PaymentProcessor {
    public static String handlePaymentResult(PaymentResult result) {
        // ✅ EXHAUSTIVE SWITCH: No default branch required or desired!
        return switch (result) {
            case PaymentResult.Success s ->
                "Transaction " + s.transactionId() + " approved: " + s.authorizationCode();
            case PaymentResult.Declined d ->
                "Declined (" + d.reasonCode() + "), retryable: " + d.retryable();
            case PaymentResult.GatewayError e ->
                "Downstream error [" + e.httpStatusCode() + "]: " + e.errorMessage();
        };
    }
}`,
    architecturalNotes: [
      'The sealed interface explicitly controls domain boundaries via the permits clause.',
      'Subtypes are modeled as immutable records, achieving deep algebraic data modeling (records + sealed types).',
      'The pattern switch over PaymentResult requires NO default branch; the compiler guarantees 100% variant coverage.',
      'If a junior engineer later adds FraudSuspended to the permits clause,javac immediately breaks compilation at all switch expressions until it is handled.',
    ],
  },
  breakLab: {
    title: 'Break Lab: The Silent Unhandled Variant Hazard (Default Branch Trap)',
    hazard:
      'Using a generic `default:` clause in a switch over a domain hierarchy silences the compiler, causing new domain variants (e.g. FraudAlert) to fall through into silent generic error handlers or data corruption without compile-time warnings.',
    filename: 'BrittlePaymentHandler.java',
    vulnerableCode: `package com.seniorjava.domain.broken;

import com.seniorjava.domain.payment.PaymentResult;

// ❌ VULNERABLE: Anti-pattern of adding a default branch to a sealed type switch
public class BrittlePaymentHandler {

    public static void routePayment(PaymentResult result) {
        // Bad practice: The developer added 'default:' to suppress warnings or satisfy linter
        switch (result) {
            case PaymentResult.Success s:
                fulfillOrder(s.transactionId());
                break;
            case PaymentResult.Declined d:
                notifyCustomerOfDecline(d.transactionId());
                break;
            default:
                // 💥 PRODUCTION HAZARD:
                // When 'GatewayError' was added, it fell silently into this catch-all!
                // When 'FraudSuspended' is added next sprint, it silently bypasses fraud pipelines!
                logGenericInfo("Handled payment fallback: " + result.transactionId());
                break;
        }
    }

    private static void fulfillOrder(String id) {}
    private static void notifyCustomerOfDecline(String id) {}
    private static void logGenericInfo(String msg) {}
}`,
    mutationExplanation:
      'A `default` branch destroys the greatest architectural advantage of sealed types: compiler-enforced exhaustiveness. When the domain model evolves with new business variants, switch statements with `default` branches silently execute the fallback instead of alerting the engineer at compile time.',
  },
  observeDebug: {
    title: 'Observe & Debug: Compiler Exhaustiveness Verification',
    steps: [
      {
        step: 1,
        instruction: 'Inspect the sealed interface declaration: sealed interface OrderStatus permits Placed, Shipped, Delivered.',
        expectedObservation:
          'javac records the PermittedSubclasses attribute in bytecode ClassFile structure.',
        codeSnippet: 'public sealed interface OrderStatus permits Placed, Shipped, Delivered {}',
      },
      {
        step: 2,
        instruction: 'Write an exhaustive switch expression without a default branch.',
        expectedObservation:
          'Compiler compiles cleanly because all 3 permitted types (Placed, Shipped, Delivered) are explicitly matched in the switch arms.',
        codeSnippet: 'return switch (status) { case Placed p -> 1; case Shipped s -> 2; case Delivered d -> 3; };',
      },
      {
        step: 3,
        instruction: 'Simulate domain evolution: add `Cancelled` to permits clause in OrderStatus.',
        expectedObservation:
          '💥 javac Compilation Error: "the switch expression does not cover all possible input values (missing: Cancelled)".',
      },
      {
        step: 4,
        instruction: 'Trace the failure mode if the code used `default -> 0` instead.',
        expectedObservation:
          'The compiler compiles silently without error! The Cancelled order passes through the system treated as a generic fallback, corrupting billing and inventory.',
      },
      {
        step: 5,
        instruction: 'Remove the `default` branch and add the explicit `case Cancelled c -> 4;` arm.',
        expectedObservation:
          'Compilation succeeds. 100% exhaustive safety is restored across the enterprise codebase.',
      },
    ],
    debugInvestigation:
      'Senior Root Cause: Adding `default` to a sealed hierarchy switch statement is an anti-pattern because it circumvents exhaustiveness analysis. In modern Java, switch expressions on sealed types should NEVER include a default branch unless matching a non-sealed open hierarchy branch.',
  },
  fixLab: {
    title: 'Fix Lab: Enforcing Total Exhaustiveness without Default Branches',
    remediation:
      'Remove all default branches and use modern switch expressions that yield values directly, forcing javac to act as an automated static test suite for domain completeness.',
    filename: 'ExhaustivePaymentHandler.java',
    fixedCode: `package com.seniorjava.domain.fixed;

import com.seniorjava.domain.payment.PaymentResult;

public class ExhaustivePaymentHandler {

    public enum AuditAction { FULFILL, NOTIFY_DECLINE, RETRY_GATEWAY }

    // ✅ FIXED: Pure exhaustive pattern switch expression
    public static AuditAction evaluate(PaymentResult result) {
        return switch (result) {
            case PaymentResult.Success s -> {
                auditLog("Fulfilled: " + s.authorizationCode());
                yield AuditAction.FULFILL;
            }
            case PaymentResult.Declined d -> {
                auditLog("Declined: " + d.reasonCode());
                yield AuditAction.NOTIFY_DECLINE;
            }
            case PaymentResult.GatewayError e -> {
                auditLog("Gateway failure code: " + e.httpStatusCode());
                yield AuditAction.RETRY_GATEWAY;
            }
            // NO DEFAULT BRANCH!
            // If PaymentResult permits any new subtype tomorrow,
            // this method WILL NOT COMPILE until the new variant is explicitly addressed.
        };
    }

    private static void auditLog(String msg) {}
}`,
    copyOfNuances: [
      'Switch Expressions produce a value and enforce exhaustiveness at compile time.',
      'Switch Statements (legacy) do not require exhaustiveness unless switching on sealed types or enums with pattern labels.',
      'Permitted subtypes can be generic, but their generic type parameters must align with the sealed base interface.',
      'Subtypes can be `non-sealed` if an intentional extensibility point is required for customer plugins or legacy adapters.',
    ],
  },
  benchmark: {
    title: 'JVM Bytecode & Jump Table Execution Performance',
    disclaimer:
      'Sealed hierarchy pattern matching compiles down to JVM tableswitch/lookupswitch bytecode instructions with type-test checks. Never speculate on JIT performance without measuring under JMH.',
    points: [
      'Bytecode Attribute: The JVM stores permitted subtypes in the `PermittedSubclasses` class attribute (JVMS §4.7.31), verified at class linking time.',
      'Pattern Matching Optimization: HotSpot C2 JIT optimizes pattern switches using profile-guided type feedback, replacing megamorphic instanceof checks with direct pointer comparisons when types are stable.',
      'Elimination of Virtual Dispatch Overhead: When domain actions are decoupled from entities into data-oriented switch expressions, HotSpot inlines the target logic directly into the caller without vtable overhead.',
      'Memory Efficiency: Sealed interfaces paired with records carry zero inheritance field bloat; instances are lean, dense contiguous records in heap memory.',
    ],
  },
  design: {
    title: 'Senior Design Challenge: Bank Order State Machine',
    scenario:
      'Design a mission-critical financial order state machine using Sealed Interfaces and Records. The system processes New, Validated, Executed, Settled, and Rejected orders with strict mathematical transition guarantees.',
    requirements: [
      'Impossible states must be unrepresentable at the type level.',
      'Transitions must be verified by the compiler without runtime ClassCastExceptions.',
      'All states must carry immutable audit timestamps and transaction tokens.',
      'Exhaustive transitions handler must handle all terminal and transient states.',
    ],
    sampleDesignCode: `package com.seniorjava.domain.state;

import java.time.Instant;

public sealed interface OrderState permits 
    OrderState.New, 
    OrderState.Validated, 
    OrderState.Executed, 
    OrderState.Settled, 
    OrderState.Rejected {

    String orderId();
    Instant updatedAt();

    record New(String orderId, Instant updatedAt) implements OrderState {}
    record Validated(String orderId, String riskScoreToken, Instant updatedAt) implements OrderState {}
    record Executed(String orderId, String exchangeExecutionId, Instant updatedAt) implements OrderState {}
    record Settled(String orderId, String bankSettlementRef, Instant updatedAt) implements OrderState {}
    record Rejected(String orderId, String rejectionReason, Instant updatedAt) implements OrderState {}
}

class StateMachineEngine {
    // Compile-time verified state machine transitions
    public static OrderState transitionNext(OrderState current) {
        return switch (current) {
            case OrderState.New n -> 
                new OrderState.Validated(n.orderId(), "TOKEN-RISK-PASS", Instant.now());
            case OrderState.Validated v -> 
                new OrderState.Executed(v.orderId(), "EXEC-90021", Instant.now());
            case OrderState.Executed e -> 
                new OrderState.Settled(e.orderId(), "SETTLE-US-891", Instant.now());
            case OrderState.Settled s -> 
                s; // Terminal state
            case OrderState.Rejected r -> 
                r; // Terminal state
        };
    }
}`,
    architecturalQuestions: [
      {
        question: 'How do sealed interfaces solve the "Make Illegal States Unrepresentable" design principle?',
        answer:
          'By modeling each state as a distinct permitted record containing only the fields valid for that state (e.g. rejectionReason exists only on Rejected; bankSettlementRef exists only on Settled), impossible states (like an order having both a settlement ref and a rejection reason) cannot even be constructed.',
      },
      {
        question: 'Why is this superior to an enum with nullable columns in a database?',
        answer:
          'An enum only captures a label; an entity using it must hold all possible fields across all states with nullable pointers (e.g., String rejectionReason, String settlementRef). This leads to runtime null pointer bugs and invalid state combinations.',
      },
      {
        question: 'What are the restrictions on where permitted subclasses can be located?',
        answer:
          'Permitted subclasses must belong to the same module as the sealed class (or the same package if declared in an unnamed module). They cannot be scattered across arbitrary third-party JARs.',
      },
    ],
  },
  explain60s: {
    prompt:
      'What are Java sealed classes, and why should you avoid default branches when pattern matching over them?',
    script:
      'Sealed classes and interfaces allow developers to declare a closed type hierarchy where only explicitly permitted subtypes can extend or implement the parent type. This brings algebraic data types and closed sum types to Java. When consuming a sealed hierarchy with a switch expression, the Java compiler statically proves exhaustiveness: if all permitted variants are handled, no default branch is required. You should strictly avoid default branches because they disable the compiler\'s exhaustiveness alert. If a colleague adds a new domain subtype in a future release, a switch without a default will fail at compile time, guaranteeing that all business logic is updated. A default branch would silently swallow the new variant, creating production failure modes.',
  },
  staffDefense: {
    questions: [
      {
        q: 'What modifiers must every direct subclass of a sealed class declare?',
        defense:
          'Every permitted subclass must declare exactly one of three modifiers: `final` (cannot be further extended), `sealed` (can be extended, but only by its own explicitly permitted subclasses), or `non-sealed` (explicitly re-opens inheritance to any arbitrary subclass).',
      },
      {
        q: 'When is the `permits` clause optional on a sealed class or interface?',
        defense:
          'The `permits` clause is optional if and only if all permitted subclasses are declared within the exact same compilation unit (.java file) as the sealed type. The compiler infers the permitted list from the subtypes defined in that file.',
      },
      {
        q: 'Can a record be declared as `non-sealed`?',
        defense:
          'No! Records are implicitly `final` by specification (JLS §8.10). A record can implement a sealed interface, but it can never be non-sealed or sealed because records can never be extended.',
      },
      {
        q: 'How does the JVM enforce sealed class hierarchy rules at runtime?',
        defense:
          'The JVM enforces sealing during class loading and linking. The bytecode of a sealed class contains a `PermittedSubclasses` attribute. When a subclass is loaded, the JVM verifies that the subclass was listed in the superclass PermittedSubclasses attribute and that both belong to the same module/package.',
      },
      {
        q: 'Why does pattern matching on sealed types prevent bugs better than the Visitor Pattern?',
        defense:
          'The Visitor Pattern requires polluting domain entities with accept(Visitor v) methods and creates cyclic coupling between the visitor interface and all entity variants. Sealed types + pattern matching separate data from operations cleanly (data-oriented programming), provide compiler exhaustiveness checking, and require zero visitor boilerplate.',
      },
      {
        q: 'Can permitted subtypes belong to different packages?',
        defense:
          'If the sealed class is in a named module, permitted subtypes can reside in different packages as long as they are all located in the SAME module. If the sealed class is in an unnamed module, all permitted subtypes must be in the exact same package.',
      },
      {
        q: 'What is the relationship between sealed classes and Algebraic Data Types (ADTs)?',
        defense:
          'ADTs consist of Product Types and Sum Types. In Java, Records represent Product Types (A AND B AND C), while Sealed Interfaces represent Sum Types (X OR Y OR Z). Combining records with sealed interfaces gives Java full Algebraic Data Modeling capabilities.',
      },
      {
        q: 'What happens if a switch on a sealed class receives a null reference?',
        defense:
          'In Java pattern matching for switch, if null is not explicitly handled by a `case null:` arm, the switch expression throws a NullPointerException before evaluating any pattern arms, preventing silent null reference errors.',
      },
    ],
  },
  interviewDrill: {
    questions: [
      {
        question:
          'Explain how sealed interfaces and records together implement Algebraic Data Types (ADTs) in modern Java.',
        rubric:
          'Candidate must define product types (records: A and B) and sum types (sealed types: X or Y). Must explain how this enables closed domain state modeling with compile-time exhaustiveness.',
      },
      {
        question:
          'Why is adding `default:` to a switch expression over a sealed hierarchy considered an architectural code smell in code reviews?',
        rubric:
          'Candidate must state that default defeats compile-time exhaustiveness checking. Explains that new variants added to the permits clause will silently fall into default rather than triggering compilation errors.',
      },
      {
        question:
          'What are the three modifiers permitted on subclasses of a sealed class, and what architectural decisions do they reflect?',
        rubric:
          'Must name final, sealed, and non-sealed. Explains final for leaf variants, sealed for nested sub-hierarchies, and non-sealed for intentional extension points (e.g. plugins).',
      },
      {
        question:
          'How does the Java compiler verify exhaustiveness without a default clause in switch expressions?',
        rubric:
          'Candidate must explain that the compiler reads the permits list from the sealed type and cross-checks that every permitted branch is covered. Mentions record patterns and type coverage.',
      },
    ],
  },
  assessment: [
    {
      id: 'q1-1_2',
      type: 'conceptual',
      prompt: 'What is the primary architectural purpose of sealed classes and interfaces in Java 17-25?',
      options: [
        'To improve garbage collection performance by allocating subtypes in Eden space.',
        'To restrict class hierarchy extension to a strictly permitted, closed set of subtypes known at compile time.',
        'To prevent reflection from reading private fields of classes.',
        'To make all methods in permitted subclasses automatically thread-safe.',
      ],
      correctIndex: 1,
      explanation:
        'Sealed classes restrict inheritance to an explicitly permitted set of subtypes, establishing closed type hierarchies (sum types) for domain modeling.',
    },
    {
      id: 'q2-1_2',
      type: 'conceptual',
      prompt: 'Which modifier is NOT valid on a direct subclass of a sealed class?',
      options: ['final', 'sealed', 'non-sealed', 'open'],
      correctIndex: 3,
      explanation:
        'Every direct subclass of a sealed class MUST declare exactly one of three modifiers: final, sealed, or non-sealed. "open" is not a valid Java subclass modifier.',
    },
    {
      id: 'q3-1_2',
      type: 'conceptual',
      prompt: 'When is the `permits` clause optional in a sealed class declaration?',
      options: [
        'When the sealed class implements java.io.Serializable.',
        'When all permitted subclasses are declared within the same source compilation unit (.java file).',
        'When the subclasses are declared with the non-sealed modifier.',
        'The permits clause is never optional.',
      ],
      correctIndex: 1,
      explanation:
        'If all permitted subclasses are declared in the same compilation unit (.java file), the permits clause is optional; the compiler infers them automatically.',
    },
    {
      id: 'q4-1_2',
      type: 'conceptual',
      prompt: 'Why is it considered an architectural anti-pattern to include a `default` branch when switching over a sealed type?',
      options: [
        'Switch expressions with default branches take 2x longer to execute at runtime.',
        'A default branch bypasses compiler exhaustiveness checks, causing future domain variants to fall through silently without compile-time alerts.',
        'The Java compiler will refuse to compile any switch on a sealed class that contains a default branch.',
        'A default branch causes a JVM LinkageError during class verification.',
      ],
      correctIndex: 1,
      explanation:
        'When all variants are handled, omitting default allows javac to fail compilation whenever a new permitted subtype is added, guaranteeing complete code updates.',
    },
    {
      id: 'q5-1_2',
      type: 'conceptual',
      prompt: 'Can a Java record be declared as `non-sealed`?',
      options: [
        'Yes, if the record implements a sealed interface.',
        'No, because Java records are implicitly final and cannot be extended.',
        'Yes, if the record is declared inside a named module.',
        'Only if the record has zero components.',
      ],
      correctIndex: 1,
      explanation:
        'Records are implicitly final by specification. They cannot be declared non-sealed or sealed because they can never serve as superclasses.',
    },
    {
      id: 'q6-1_2',
      type: 'code-tracing',
      prompt: 'Consider this sealed hierarchy. What is the compilation outcome of the switch expression?',
      codeSnippet: `sealed interface Status permits Pending, Active, Suspended {}
final class Pending implements Status {}
final class Active implements Status {}
final class Suspended implements Status {}

class Evaluator {
    static int score(Status s) {
        return switch (s) {
            case Pending p -> 1;
            case Active a -> 2;
        };
    }
}`,
      options: [
        'Compiles cleanly; returns 0 for Suspended.',
        'Fails to compile: switch expression does not cover all possible input values (missing: Suspended).',
        'Compiles cleanly, but throws MatchException at runtime if passed Suspended.',
        'Throws NullPointerException at compile time.',
      ],
      correctIndex: 1,
      explanation:
        'Switch expressions on sealed types must be exhaustive. Because Suspended is not handled and there is no default clause, javac produces a compile-time error.',
    },
    {
      id: 'q7-1_2',
      type: 'code-tracing',
      prompt: 'What happens when evaluating a switch expression with an explicit `case null` arm versus without one when passed null?',
      codeSnippet: `Status s = null;
return switch (s) {
    case Pending p -> "P";
    case Active a -> "A";
    case Suspended sp -> "S";
    // No case null
};`,
      options: [
        'Returns null silently.',
        'Throws NullPointerException before evaluating pattern arms.',
        'Throws MatchException.',
        'Executes the first branch with a null variable.',
      ],
      correctIndex: 1,
      explanation:
        'In Java pattern switch, if null is not matched explicitly via `case null`, passing null immediately throws NullPointerException.',
    },
    {
      id: 'q8-1_2',
      type: 'debugging',
      prompt:
        'A team added a new permitted subtype `Archived` to sealed interface `EntityState`. However, their batch job processed an Archived entity without error and did not log it. What is the root cause?',
      options: [
        'The JVM JIT compiler cached the old PermittedSubclasses attribute.',
        'The switch statement in the batch job used a `default:` branch, silently swallowing the new Archived variant.',
        'The Archived class was declared as non-sealed.',
        'Archived did not implement Serializable.',
      ],
      correctIndex: 1,
      explanation:
        'The presence of a `default:` branch masked the unhandled variant from the compiler, routing Archived entities into the generic fallback silently.',
    },
    {
      id: 'q9-1_2',
      type: 'debugging',
      prompt:
        'A developer defines: `public sealed class Base permits SubA {}` in package `com.orders.core`. In another JAR `com.orders.plugins`, they declare `public final class SubB extends Base {}`. What occurs during compilation?',
      options: [
        'SubB compiles cleanly and is added dynamically to permits.',
        'Compilation error: permitted subtypes must belong to the same module (or same package if in unnamed module).',
        'SubB compiles if it is marked as non-sealed.',
        'SubB requires runtime reflection to attach.',
      ],
      correctIndex: 1,
      explanation:
        'All permitted subclasses must reside in the same module as the sealed class (or same package if in unnamed modules). Subtypes cannot be declared in arbitrary external JARs.',
    },
    {
      id: 'q10-1_2',
      type: 'design',
      prompt:
        'How does combining Sealed Interfaces with Records achieve the Algebraic Data Modeling pattern (ADTs) in Java domain architectures?',
      options: [
        'Records provide mutable entity storage, while sealed interfaces provide database connections.',
        'Records provide Product Types (conjunctions of data components), while Sealed Interfaces provide Sum Types (disjunctions of closed variants), with pattern switch providing exhaustive structural evaluation.',
        'Sealed interfaces automatically serialize records to JSON without Jackson.',
        'Records replace Spring controllers, and sealed interfaces replace JPA repositories.',
      ],
      correctIndex: 1,
      explanation:
        'Records represent Product Types (A AND B), while sealed interfaces represent Sum Types (X OR Y OR Z). Together they form full Algebraic Data Types (ADTs) in Java.',
    },
    {
      id: 'q11-1_2',
      type: 'design',
      prompt:
        'In a CQRS event-sourcing application, why is a sealed interface `OrderEvent` preferred over an open interface?',
      options: [
        'It allows third-party services to add arbitrary event types to the event store.',
        'It guarantees that event consumers know the closed set of all events that have ever been permitted, allowing compiler-verified projections without default branches.',
        'It reduces event payload size on Kafka by 90%.',
        'It enables Spring Boot auto-configuration for Kafka.',
      ],
      correctIndex: 1,
      explanation:
        'In event sourcing, events are immutable closed domain facts. A sealed hierarchy allows projectors and read models to handle every event exhaustively without missing critical state mutations.',
    },
  ],
};

export const MODULE_1_3_CONTENT: ModuleContent1_3 = {
  metadata: JAVA_CORE_MODULES_METADATA[2],
  learn: {
    overview:
      'Pattern matching in modern Java (Java 21 LTS baseline through Java 25) transforms how developers inspect, deconstruct, and transform data objects. Beginning with pattern matching for instanceof (Java 16) and expanding to Pattern Matching for switch (Java 21) and Record Patterns (Java 21), Java eliminates cumbersome explicit typecasting, boilerplate accessor chains, and defensive null checks. When combined with sealed hierarchies, pattern matching provides type-safe, compile-time verified destructuring of complex domain objects.',
    keyPoints: [
      'Pattern Matching for instanceof (JEP 394): Combines predicate check and conditional extraction into a single atomic operation: `if (obj instanceof String s)`. Scope of `s` is governed by flow scoping.',
      'Pattern Matching for switch (JEP 441): Allows selector expressions to be evaluated against type patterns: `case Integer i -> ...`, `case String s -> ...`.',
      'Record Patterns (JEP 440): Enables nested deconstruction of record components directly in case statements: `case OrderPlaced(OrderId id, Money(BigDecimal amt, String cur)) -> ...`.',
      'Guarded Patterns (`when` clause): In Java 21+, guards use the `when` keyword (e.g., `case Transaction t when t.amount() > 10_000 -> ...`), replacing the obsolete preview syntax (`&&`).',
      'Null Handling in Switch: By default, switching on null throws NullPointerException unless an explicit `case null` (or `case null, default`) branch is present.',
      'Pattern Dominance: The compiler enforces dominance order. A broader pattern (e.g., `case CharSequence cs`) must not appear before a more specific pattern (e.g., `case String s`), or javac fails with a compilation error.',
      'Exhaustiveness & Sealed Types: A switch over a sealed hierarchy or record with type patterns must be exhaustive. The compiler requires either all permitted subtypes or an explicit `default` branch.',
    ],
    patternMatchingDistinctions: {
      typePattern:
        'Tests whether a target has a specific type and binds it to a local pattern variable in one step without manual downcasting.',
      recordPattern:
        'Deconstructs a record instance into its individual component values at match time, matching nested records recursively.',
      whenGuards:
        'Applies arbitrary boolean conditions via `when` clauses after pattern matching succeeds, allowing fine-grained domain routing without nested if-else ladders.',
      nullHandling:
        'Traditional switch threw NPE immediately upon encountering null. Java 21 switch allows explicit `case null ->` handling directly alongside type patterns.',
    },
    versionNotes:
      'Pattern matching for instanceof finalized in Java 16. Pattern Matching for switch (JEP 441) and Record Patterns (JEP 440) finalized as stable standard features in Java 21 LTS. Validated and supported in Java 25.',
  },
  buildLab: {
    title: 'Deconstructed Domain Event Dispatcher: Audit & Transaction Pipeline',
    description:
      'Demonstrates real-world Java 21+ pattern matching for switch, record deconstruction, guarded when clauses, and explicit null routing in an enterprise transaction auditor.',
    filename: 'TransactionEventDispatcher.java',
    code: `package com.seniorjava.patternmatching;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

// Sealed Event Hierarchy with Nested Records
public sealed interface DomainEvent permits OrderEvent, PaymentEvent, SecurityAlert {

  record OrderId(String value) {
    public OrderId {
      Objects.requireNonNull(value, "OrderId cannot be null");
    }
  }

  record Money(BigDecimal amount, String currency) {
    public Money {
      Objects.requireNonNull(amount, "Amount cannot be null");
      Objects.requireNonNull(currency, "Currency cannot be null");
    }
  }

  // Nested record events
  record OrderEvent(OrderId id, Money total, int itemCount) implements DomainEvent {}
  record PaymentEvent(String transactionId, Money amount, String method) implements DomainEvent {}
  record SecurityAlert(String sourceIp, String severity, Instant timestamp) implements DomainEvent {}
}

/**
 * Enterprise Event Dispatcher demonstrating:
 * 1. Explicit case null handling
 * 2. Record deconstruction (nested pattern matching)
 * 3. Guarded patterns using 'when'
 * 4. Dominance ordering
 * 5. Compiler-enforced exhaustiveness without default
 */
public final class TransactionEventDispatcher {

  public static String dispatch(DomainEvent event) {
    return switch (event) {
      // 1. Explicit null handling avoids unexpected NPE
      case null -> "IGNORED: Received null event payload";

      // 2. Guarded Record Pattern: High-value orders flagged for VIP audit
      case DomainEvent.OrderEvent(var id, DomainEvent.Money(var amount, var cur), var count)
          when amount.compareTo(new BigDecimal("10000.00")) >= 0 ->
        "VIP_AUDIT: Order " + id.value() + " exceeds limit with " + amount + " " + cur + " (" + count + " items)";

      // 3. Standard Record Pattern deconstruction
      case DomainEvent.OrderEvent(var id, var total, var count) ->
        "STANDARD_ORDER: Order " + id.value() + " total: " + total.amount() + " " + total.currency();

      // 4. Guarded Payment Pattern: Flag suspicious crypto or international payments
      case DomainEvent.PaymentEvent(var txId, DomainEvent.Money(var amount, var cur), var method)
          when "CRYPTO".equalsIgnoreCase(method) || amount.compareTo(new BigDecimal("50000.00")) > 0 ->
        "COMPLIANCE_HOLD: Tx " + txId + " (" + method + ") amount: " + amount + " " + cur;

      case DomainEvent.PaymentEvent(var txId, var amount, var method) ->
        "CLEARED_PAYMENT: Tx " + txId + " via " + method + " amount: " + amount.amount();

      // 5. Critical Security Alerts
      case DomainEvent.SecurityAlert(var ip, var severity, var ts)
          when "CRITICAL".equalsIgnoreCase(severity) ->
        "IMMEDIATE_SECOPS_PAGER: High risk incident from " + ip + " logged at " + ts;

      case DomainEvent.SecurityAlert(var ip, var severity, var ts) ->
        "SECURITY_LOG: [" + severity + "] Incident from " + ip + " at " + ts;
    };
  }
}`,
    architecturalNotes: [
      'Deconstructs nested record components (Money within OrderEvent) directly in the case pattern signature, eliminating verbose variable accessors.',
      'Uses guarded `when` clauses to express fine-grained business routing without polluting case bodies with nested if-statements.',
      'Explicit `case null` guarantees zero unexpected NullPointerExceptions without requiring defensive null checks prior to the switch statement.',
      'Exhaustive across all permitted subtypes of DomainEvent without requiring a generic `default:` branch, preserving compiler alerting when new events are added.',
    ],
  },
  breakLab: {
    title: 'Pattern Dominance Violation & Missing Null Trap',
    hazard:
      'Improper pattern order causes compilation failure (pattern dominance), while omitting null handling triggers fatal runtime NullPointerException in production switch dispatchers.',
    filename: 'VulnerableDispatcher.java',
    vulnerableCode: `package com.seniorjava.patternmatching;

public class VulnerableDispatcher {

  // VULNERABILITY 1: Dominance ordering bug
  // CharSequence pattern dominates String pattern, causing compilation error!
  public static String inspectDominance(Object obj) {
    /*
    return switch (obj) {
      case CharSequence cs -> "CharSequence: " + cs.length();
      case String s -> "String: " + s.toUpperCase(); // COMPILE ERROR: 'This case label is dominated by a preceding case label'
      default -> "Other";
    };
    */
    return "Dominated pattern will not compile";
  }

  // VULNERABILITY 2: Fatal NullPointerException on null payload
  public static String processUntrustedEvent(DomainEvent event) {
    // BUG: If event is null, Java switch throws NullPointerException immediately!
    return switch (event) {
      case DomainEvent.OrderEvent o -> "Order: " + o.id().value();
      case DomainEvent.PaymentEvent p -> "Payment: " + p.transactionId();
      case DomainEvent.SecurityAlert s -> "Security: " + s.sourceIp();
      // Missing 'case null' causes immediate crash when upstream queues deliver null
    };
  }
}`,
    mutationExplanation:
      'Java pattern matching switches enforce strict dominance: more specific patterns (like String or guarded patterns) must always precede broader patterns (like CharSequence or unguarded patterns). Furthermore, traditional and pattern switches evaluate the selector expression before branch selection, throwing NullPointerException if the selector is null unless an explicit `case null` label is provided.',
  },
  observeDebug: {
    title: 'Step-by-Step Reproduction: Pattern Matching Pitfalls',
    steps: [
      {
        step: 1,
        instruction: 'Dispatch a null event payload to an unhandled pattern switch',
        expectedObservation:
          'JVM immediately throws java.lang.NullPointerException at runtime at the switch selector evaluation before evaluating any case labels.',
        codeSnippet: 'TransactionEventDispatcher.dispatch(null); // Triggers NPE if "case null" is omitted',
      },
      {
        step: 2,
        instruction: 'Place an unguarded type pattern ahead of a guarded type pattern',
        expectedObservation:
          'javac fails with: "error: this case label is dominated by a preceding case label" because the unguarded pattern matches all instances.',
        codeSnippet: 'case OrderEvent o -> ...; \ncase OrderEvent o when o.total().amount().intValue() > 100 -> ...; // DOMINATED!',
      },
      {
        step: 3,
        instruction: 'Evaluate record deconstruction with deeply nested null components',
        expectedObservation:
          'If the outer record is present but an inner component is null (e.g. OrderEvent with null Money), matching OrderEvent(var id, Money(var amt, var cur), ...) fails to match and falls to subsequent branches.',
        codeSnippet: 'new OrderEvent(new OrderId("1"), null, 5); // Fails nested Money deconstruction pattern',
      },
      {
        step: 4,
        instruction: 'Review compiler bytecode generation: lookupswitch and type test helper',
        expectedObservation:
          'javac compiles pattern switches into type-switch bootstraps using invokedynamic to TypeSwitch.typeSwitch, providing O(1) or O(log N) jump table performance rather than chained if-else instanceof checks.',
      },
    ],
    debugInvestigation:
      'When debugging pattern switch issues, check two things first: (1) Does the selector handle null explicitly via `case null`? (2) Are guarded cases placed strictly BEFORE their corresponding unguarded base patterns?',
  },
  fixLab: {
    title: 'Production-Hardened Pattern Dispatcher with Null Safety & Correct Dominance',
    remediation:
      'Restructure case labels so guarded patterns precede general patterns, add an explicit `case null` handler, and ensure all record deconstructions have fallback branches for incomplete payloads.',
    filename: 'HardenedPatternDispatcher.java',
    fixedCode: `package com.seniorjava.patternmatching;

import java.math.BigDecimal;

public final class HardenedPatternDispatcher {

  public static String audit(Object payload) {
    return switch (payload) {
      // 1. Explicit null safety
      case null -> "REJECTED: Null payload";

      // 2. Specific guarded record patterns FIRST
      case DomainEvent.OrderEvent(var id, DomainEvent.Money(var amount, _), _)
          when amount.compareTo(new BigDecimal("1000.00")) > 0 ->
        "AUDIT_HIGH_VALUE_ORDER: " + id.value();

      // 3. General record pattern SECOND
      case DomainEvent.OrderEvent(var id, _, var count) ->
        "AUDIT_STANDARD_ORDER: " + id.value() + " (" + count + " items)";

      // 4. Subtypes before Supertypes (String before CharSequence)
      case String s when s.isBlank() -> "EMPTY_STRING";
      case String s -> "STRING_CONTENT: " + s.trim();
      case CharSequence cs -> "GENERIC_CHAR_SEQUENCE: length=" + cs.length();

      // 5. Sealed hierarchy variants
      case DomainEvent.PaymentEvent p -> "PAYMENT: " + p.transactionId();
      case DomainEvent.SecurityAlert s -> "SECURITY: " + s.sourceIp();

      // 6. Final fallback for open Object hierarchy
      default -> "UNKNOWN_TYPE: " + payload.getClass().getName();
    };
  }
}`,
    copyOfNuances: [
      'Guarded patterns (`case Type var when condition`) must always be positioned before unguarded patterns (`case Type var`) of the same type.',
      'More specific types (e.g., `String`) must be positioned before assignable supertypes (e.g., `CharSequence`).',
      'The underscore `_` unnamed pattern (finalized in Java 22 / standard in Java 25) can be used for unused components in record deconstruction.',
      'Explicit `case null ->` prevents any runtime NPE and makes null handling intentional in enterprise domain services.',
    ],
  },
  benchmark: {
    title: 'Pattern Matching Switch vs Chained instanceof Performance',
    disclaimer:
      'Benchmarks measured on OpenJDK 21/25 on Linux x86_64. Pattern switch compiles down to invokedynamic TypeSwitch tables with JIT-accelerated dispatch tables.',
    points: [
      'Chained if-else instanceof: O(N) sequential branch evaluations. As the number of variants increases (e.g., 10+ event types), CPU branch prediction miss rates increase significantly.',
      'Pattern switch with invokedynamic: OpenJDK uses a bootstrap method (SwitchBootstraps.typeSwitch) that caches type indices, translating the dispatch into a compact jump table with near O(1) complexity.',
      'Record deconstruction overhead: JIT escape analysis scalar-replaces record instances in many matching paths, meaning record deconstruction introduces zero heap allocation overhead.',
      'Guarded pattern evaluation: Guard expressions (`when condition`) are executed only after the type pattern matches, preventing unnecessary predicate computations on mismatched types.',
    ],
  },
  design: {
    title: 'Enterprise Payment Webhook Processor (CQRS / Event Ingestion)',
    scenario:
      'Architect a high-throughput webhook ingestion engine for an international payment gateway. Webhooks arrive as heterogeneous JSON payloads deserialized into polymorphic sealed events. The engine must route payments, chargebacks, fraud alerts, and currency conversions with zero runtime downcasting and full compiler exhaustiveness.',
    requirements: [
      'Process 4 distinct webhook payload types: PaymentAuthorized, PaymentCaptured, ChargebackInitiated, CurrencyExchanged.',
      'Deconstruct nested money amounts and merchant metadata directly in pattern switch cases.',
      'Apply guarded rules: flag transactions exceeding $10,000 USD or high-risk jurisdictions.',
      'Guarantee 100% compile-time exhaustiveness without a default fallback, so new webhook events fail compilation until handled.',
      'Provide zero-NPE resilience for malformed or missing webhook payloads.',
    ],
    sampleDesignCode: `package com.seniorjava.design.webhook;

import java.math.BigDecimal;
import java.util.Objects;

public final class WebhookProcessingService {

  public sealed interface WebhookEvent permits 
      PaymentAuthorized, PaymentCaptured, ChargebackInitiated, CurrencyExchanged {}

  public record Money(BigDecimal amount, String currency) {}
  public record MerchantId(String value) {}

  public record PaymentAuthorized(String paymentId, MerchantId merchant, Money money, String riskScore) implements WebhookEvent {}
  public record PaymentCaptured(String paymentId, Money money, String settlementAccount) implements WebhookEvent {}
  public record ChargebackInitiated(String paymentId, Money disputeAmount, String reasonCode) implements WebhookEvent {}
  public record CurrencyExchanged(String exchangeId, Money source, Money target, BigDecimal exchangeRate) implements WebhookEvent {}

  public enum ProcessingRoute {
    HIGH_RISK_FRAUD_REVIEW,
    STANDARD_SETTLEMENT,
    DISPUTE_ARBITRATION,
    FX_TREASURY_HEDGE,
    DISCARD_INVALID
  }

  public ProcessingRoute processWebhook(WebhookEvent event) {
    return switch (event) {
      case null -> ProcessingRoute.DISCARD_INVALID;

      // Rule 1: High risk or high value authorized payments require immediate fraud review
      case PaymentAuthorized(var id, _, Money(var amt, _), var risk)
          when "HIGH".equals(risk) || amt.compareTo(new BigDecimal("10000.00")) >= 0 ->
        ProcessingRoute.HIGH_RISK_FRAUD_REVIEW;

      // Rule 2: Normal authorization proceeds to settlement
      case PaymentAuthorized authorized ->
        ProcessingRoute.STANDARD_SETTLEMENT;

      // Rule 3: Captures proceed to settlement
      case PaymentCaptured captured ->
        ProcessingRoute.STANDARD_SETTLEMENT;

      // Rule 4: Chargebacks immediately route to dispute team
      case ChargebackInitiated dispute ->
        ProcessingRoute.DISPUTE_ARBITRATION;

      // Rule 5: Cross-currency FX events route to treasury
      case CurrencyExchanged fx ->
        ProcessingRoute.FX_TREASURY_HEDGE;
    };
  }
}`,
    architecturalQuestions: [
      {
        question: 'Why is omitting the default branch crucial in this webhook design?',
        answer:
          'When the payment gateway introduces a new webhook event (e.g., RefundProcessed), omitting default causes javac to throw a compilation error immediately. If default existed, the refund would silently take the default route without any engineer noticing.',
      },
      {
        question: 'How does record deconstruction improve safety over traditional getter calls?',
        answer:
          'Record deconstruction validates structural type components at match time. Pattern variables are strictly typed and immutable, eliminating null getter NPE chains and manual casts.',
      },
    ],
  },
  explain60s: {
    prompt:
      'Explain Pattern Matching & Switch in modern Java to a Principal Engineer in 60 seconds.',
    script:
      'Modern Java pattern matching turns switch and instanceof into declarative data transformation engines. Instead of casting types imperatively after an instanceof check or writing nested if-else ladders with getter chains, Java 21+ lets us match on types, deconstruct records recursively down to their primitives, and attach guarded boolean conditions using the when keyword. The compiler enforces pattern dominance so general cases cannot shadow specific ones, optimizes the dispatch using invokedynamic jump tables rather than O(N) comparisons, and with sealed types, enforces 100% branch exhaustiveness at compile time. It eliminates boilerplate, prevents ClassCastExceptions, and gives Java the expressive power of algebraic data types found in functional languages.',
  },
  staffDefense: {
    questions: [
      {
        q: 'Why did the Java language designers introduce the "when" keyword for guards instead of reusing "&&"?',
        defense:
          'In early previews (Java 17-19), guards used `&&`. However, this created semantic ambiguity between pattern composition (matching pattern A and pattern B) and boolean evaluation. The `when` keyword explicitly separates the structural type pattern from the arbitrary boolean condition evaluated after match success.',
      },
      {
        q: 'What is pattern dominance, and why does javac enforce it as a hard compilation error?',
        defense:
          'Dominance occurs when a preceding pattern matches a superset of a subsequent pattern. For example, `case CharSequence cs` dominates `case String s`. If javac allowed this, the dominated case would be dead code. Enforcing dominance prevents unreachable branch bugs.',
      },
      {
        q: 'How does switch evaluate null, and what is the difference between omitting null vs explicit `case null`?',
        defense:
          'By default in Java specification, switching over a null reference throws NullPointerException at the selector expression before evaluating cases. By adding an explicit `case null`, the switch handles null safely. You can also combine `case null, default ->` if you want null to fall to fallback handling.',
      },
      {
        q: 'How does the JVM execute pattern switches under the hood? Does it just do chained if-else instanceof?',
        defense:
          'No. javac uses invokedynamic to invoke SwitchBootstraps.typeSwitch. The bootstrap method builds an internal jump table mapping classes to integer case indices. On subsequent dispatches, the JVM jumps directly to the matching case branch, providing O(1) to O(log N) performance.',
      },
      {
        q: 'Can record patterns deconstruct arbitrary Java classes, or only records?',
        defense:
          'Only records. Records have transparent nominal state descriptions where components, canonical constructors, and accessors are guaranteed by the language specification. Arbitrary classes do not have guaranteed transparent deconstruction.',
      },
      {
        q: 'What happens if a record has a component that is null during nested deconstruction?',
        defense:
          'A record pattern `Point(int x, int y)` will match a Point instance even if components are objects that are null. But if you have nested record patterns like `Window(Point(int x, int y))`, if the Point component itself is null, the nested pattern fails to match and proceeds to the next case label.',
      },
      {
        q: 'Is it safe to use pattern matching in performance-critical low-latency hot loops?',
        defense:
          'Yes. Pattern matching does not create object allocations for matched pattern variables. JIT C2 escape analysis frequently eliminates intermediate record allocations entirely through scalar replacement.',
      },
      {
        q: 'How do unnamed variables and patterns (`_`) enhance pattern matching in Java 22+?',
        defense:
          'When deconstructing a record with many components, you often only care about one or two. The underscore `_` tells the compiler and human reader that a component is ignored, reducing cognitive overhead and eliminating unused variable warnings.',
      },
    ],
  },
  interviewDrill: {
    questions: [
      {
        question:
          'What is the difference between statement switch and expression switch, and how do pattern matching semantics apply to both?',
        rubric:
          'Candidate must state: expression switches produce a value and MUST be exhaustive. Statement switches do not produce a value, but when using pattern matching or sealed types, statement switches must ALSO be exhaustive. Expression switches use `->` and do not fall through by default.',
      },
      {
        question:
          'Explain what happens when this compiles: `switch (obj) { case String s -> ...; case String s when s.length() > 5 -> ...; }`',
        rubric:
          'Candidate must identify compilation error: The unguarded `case String s` appears before the guarded `case String s when ...`, so the guarded case is dominated and unreachable.',
      },
      {
        question:
          'How do you handle null in a Java 21 pattern switch without writing `if (obj == null)` before the switch?',
        rubric:
          'Candidate must mention: Use `case null -> ...` or `case null, default -> ...` directly inside the switch block.',
      },
      {
        question:
          'What is flow scoping in pattern matching for instanceof?',
        rubric:
          'Candidate must explain that a pattern variable is in scope only where the pattern is definitely matched. In `if (obj instanceof String s && s.length() > 0)`, `s` is in scope for the second condition. But in `if (obj instanceof String s || ...)`, `s` is not in scope for the OR branch.',
      },
    ],
  },
  assessment: [
    {
      id: 'q1-1_3',
      type: 'conceptual',
      prompt:
        'In Java 21+, what keyword is standard for attaching a boolean guard condition to a pattern in a switch expression?',
      options: ['if', 'when', '&&', 'where'],
      correctIndex: 1,
      explanation:
        'Java 21 finalized the `when` clause for guarded patterns (JEP 441), replacing the earlier preview syntax that used `&&`.',
    },
    {
      id: 'q2-1_3',
      type: 'conceptual',
      prompt:
        'What occurs if you switch on an object reference that is `null` in a pattern switch with NO `case null` branch?',
      options: [
        'The switch returns null.',
        'The switch matches the default branch if present.',
        'The JVM throws NullPointerException at runtime when evaluating the selector expression.',
        'The switch ignores the statement and continues execution.',
      ],
      correctIndex: 2,
      explanation:
        'If the selector evaluates to null and there is no explicit `case null` (or `case null, default`), the switch expression throws NullPointerException before evaluating any pattern cases.',
    },
    {
      id: 'q3-1_3',
      type: 'conceptual',
      prompt:
        'Why does the following code fail to compile?\n\nswitch (obj) {\n  case Object o -> "All objects";\n  case String s -> "String object";\n}',
      codeSnippet: 'switch (obj) {\n  case Object o -> "All objects";\n  case String s -> "String object";\n}',
      options: [
        'String cannot be matched in a switch.',
        'Pattern dominance: `case Object o` matches all non-null instances, dominating and making `case String s` unreachable.',
        'Object does not support pattern matching.',
        'Pattern switch requires an explicit default branch.',
      ],
      correctIndex: 1,
      explanation:
        'javac strictly prohibits dominated patterns. Because Object is an assignable supertype of String, `case Object o` dominates `case String s`.',
    },
    {
      id: 'q4-1_3',
      type: 'conceptual',
      prompt:
        'Under Java flow scoping rules, in which of the following expressions is the pattern variable `s` validly in scope?',
      options: [
        'if (obj instanceof String s || s.isEmpty())',
        'if (!(obj instanceof String s)) { return s; }',
        'if (obj instanceof String s && s.length() > 5)',
        'if (obj instanceof String s || true)',
      ],
      correctIndex: 2,
      explanation:
        'In `if (obj instanceof String s && s.length() > 5)`, the right operand of `&&` only executes if the left operand was true, so `s` is definitely in scope.',
    },
    {
      id: 'q5-1_3',
      type: 'conceptual',
      prompt:
        'What bytecode mechanism does OpenJDK primarily use to optimize pattern switches over types?',
      options: [
        'Reflection via Class.forName',
        'invokedynamic targeting SwitchBootstraps.typeSwitch to generate jump index tables',
        'Chained series of checkcast and instanceof opcodes',
        'JNI native C++ calls',
      ],
      correctIndex: 1,
      explanation:
        'OpenJDK compiles pattern switches into invokedynamic instructions linked by SwitchBootstraps.typeSwitch, caching type indices for fast jump table dispatch.',
    },
    {
      id: 'q6-1_3',
      type: 'code-tracing',
      prompt:
        'What is the output of dispatch("hello") given this code?\n\nString dispatch(Object o) {\n  return switch (o) {\n    case String s when s.length() < 3 -> "SHORT";\n    case String s -> "STANDARD";\n    case CharSequence cs -> "CHAR_SEQ";\n    default -> "OTHER";\n  };\n}',
      codeSnippet: 'dispatch("hello")',
      options: ['"SHORT"', '"STANDARD"', '"CHAR_SEQ"', '"OTHER"'],
      correctIndex: 1,
      explanation:
        '"hello" is a String. Its length is 5 (not < 3), so the guard fails. It falls to the next matching case `case String s`, returning "STANDARD".',
    },
    {
      id: 'q7-1_3',
      type: 'code-tracing',
      prompt:
        'Given:\nrecord Point(int x, int y) {}\nrecord Circle(Point center, int radius) {}\n\nWhat is returned by inspect(new Circle(new Point(0, 5), 10))?\n\nString inspect(Object obj) {\n  return switch (obj) {\n    case Circle(Point(var x, var y), var r) when x == 0 && y == 0 -> "ORIGIN_CIRCLE";\n    case Circle(Point(var x, var y), var r) when x == 0 -> "Y_AXIS_CIRCLE:" + y;\n    case Circle c -> "GENERIC_CIRCLE";\n    default -> "UNKNOWN";\n  };\n}',
      options: ['"ORIGIN_CIRCLE"', '"Y_AXIS_CIRCLE:5"', '"GENERIC_CIRCLE"', '"UNKNOWN"'],
      correctIndex: 1,
      explanation:
        'The circle center has x=0, y=5. The first guard fails (y != 0). The second guard succeeds (x == 0), evaluating to "Y_AXIS_CIRCLE:5".',
    },
    {
      id: 'q8-1_3',
      type: 'debugging',
      prompt:
        'A developer writes:\ncase OrderEvent o when o.total() > 100 -> handleHigh(o);\ncase OrderEvent o -> handleStandard(o);\ncase OrderEvent o when o.isVip() -> handleVip(o);\n\nWhy does javac reject this code?',
      options: [
        'OrderEvent cannot be used more than once in a switch.',
        'The third case is dominated by the second case (`case OrderEvent o` matches all OrderEvents), making the VIP check unreachable.',
        'when clauses cannot evaluate boolean methods like isVip().',
        'handleHigh and handleStandard have different return types.',
      ],
      correctIndex: 1,
      explanation:
        'The unguarded `case OrderEvent o` matches all instances of OrderEvent. Any subsequent case matching OrderEvent (guarded or not) is dominated and rejected by javac.',
    },
    {
      id: 'q9-1_3',
      type: 'debugging',
      prompt:
        'An enterprise app receives a webhook payload with a null field: `new OrderEvent(id, null, 2)` where the pattern is `case OrderEvent(var id, Money(var amt, var cur), var count)`. What happens during pattern matching?',
      options: [
        'The pattern throws NullPointerException.',
        'The pattern fails to match, and the switch proceeds to the next case label.',
        'The Money component variables are assigned to default null.',
        'The JVM terminates.',
      ],
      correctIndex: 1,
      explanation:
        'In record pattern deconstruction, if an inner record pattern expects an instance of Money, but the component is null, the pattern match fails cleanly and execution proceeds to the next case without throwing NPE.',
    },
    {
      id: 'q10-1_3',
      type: 'design',
      prompt:
        'Why does combining Sealed Hierarchies with Pattern Matching Switch expressions provide superior compile-time safety over the traditional Visitor Pattern in Java?',
      options: [
        'Visitor pattern runs 100x faster than pattern switch.',
        'Sealed pattern switch eliminates boilerplate visitor interfaces and double-dispatch indirection while maintaining compiler-verified exhaustiveness when new variants are added.',
        'Pattern matching automatically writes database queries.',
        'Visitor pattern is deprecated in Java 21.',
      ],
      correctIndex: 1,
      explanation:
        'The Visitor pattern was historically used in Java to simulate algebraic pattern matching with double dispatch. Sealed classes + pattern switch achieve the exact same exhaustiveness natively without boilerplate visitor interfaces.',
    },
    {
      id: 'q11-1_3',
      type: 'design',
      prompt:
        'When designing a REST or gRPC event router consuming third-party external payloads, what is the recommended practice for handling null and unexpected types in pattern switches?',
      options: [
        'Never handle null; let the framework crash with NPE.',
        'Provide explicit `case null ->` for known empty payloads, and `default ->` only when handling an open, non-sealed type hierarchy with unexpected future types.',
        'Always wrap every pattern in a try-catch block inside each case.',
        'Convert all objects to String before switching.',
      ],
      correctIndex: 1,
      explanation:
        'For open hierarchies (like Object or third-party untrusted payloads), explicit `case null ->` avoids runtime NPEs, while `default ->` safely catches unmapped or unrecognized message types.',
    },
  ],
};

