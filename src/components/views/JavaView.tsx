import React, { useState } from 'react';
import { 
  Coffee, 
  Code2, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Bug, 
  Mic, 
  Award 
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CodeBlock } from '../ui/CodeBlock';
import { Alert } from '../ui/Alert';

export const JavaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'implement' | 'break' | 'debug' | 'explain' | 'interview'>('learn');
  const [selectedTopic, setSelectedTopic] = useState<string>('completablefuture');

  const topics = [
    {
      id: 'completablefuture',
      title: 'CompletableFuture & Non-Blocking Async Pipelines',
      category: 'Concurrency',
      description: 'Chaining supplyAsync, thenCompose, thenCombine with thread pool isolation and exception fallbacks.',
      codeSnippet: `// 1. Dedicated ForkJoinPool or custom thread pool to avoid commonPool starvation
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
      breakScenario: `Calling .join() or .get() immediately after supplyAsync inside a REST controller, converting the async pipeline into a blocking thread-per-request bottleneck and exhausting the Tomcat worker pool.`,
      debugFix: `Return CompletableFuture directly from Spring @RestController (DeferredResult) or subscribe asynchronously. Never block on .join() in the servlet request thread.`,
      interviewAnswer: `CompletableFuture implements both Future and CompletionStage interfaces, enabling monadic composition of asynchronous tasks without callback hell.
Key Senior Architectural Nuances:
1. Always pass an explicit Executor to supplyAsync() / thenApplyAsync(). Default ForkJoinPool.commonPool() is shared JVM-wide; blocking I/O calls inside it will starve parallelStream and garbage collector helper tasks.
2. thenCompose (flatMap) vs thenCombine: thenCompose executes dependent sequential async stages, while thenCombine executes two independent parallel async stages concurrently and merges their results.
3. Exception propagation: .exceptionally() handles failures at the tail, whereas .handle() intercepts both success payload and Throwable at intermediate stages.`
    },
    {
      id: 'jmm',
      title: 'Java Memory Model (JMM), Volatile & Happens-Before',
      category: 'JVM Internals',
      description: 'Hardware store buffers, CPU instruction reordering, and volatile memory barrier instructions.',
      codeSnippet: `public class DoubleCheckedLockingSingleton {
    // volatile is CRITICAL: prevents instruction reordering between object allocation and reference assignment
    private static volatile DoubleCheckedLockingSingleton instance;

    public static DoubleCheckedLockingSingleton getInstance() {
        if (instance == null) { // 1st check (no lock)
            synchronized (DoubleCheckedLockingSingleton.class) {
                if (instance == null) { // 2nd check (with lock)
                    // Memory actions without volatile:
                    // 1. allocate memory -> 2. assign reference -> 3. init constructor (REORDERED!)
                    // Other threads could observe partially initialized object!
                    instance = new DoubleCheckedLockingSingleton();
                }
            }
        }
        return instance;
    }
}`,
      breakScenario: `Removing the 'volatile' keyword from the singleton field in Double-Checked Locking. Under heavy multi-core CPU load, Thread B reads a non-null instance that has not yet completed its constructor initialization, crashing with NullPointerException on field access.`,
      debugFix: `Add 'volatile' so that compiler & CPU emit a StoreStore / StoreLoad memory barrier ensuring complete object initialization happens-before reference publication.`,
      interviewAnswer: `The Java Memory Model (JSR-133) defines the rules by which changes made by one thread become visible to other threads.
volatile enforces two critical guarantees:
1. Visibility: Reads always fetch the most recent write directly from main memory rather than local CPU L1/L2 caches.
2. Ordering: Prevents compiler and CPU instruction reordering across the volatile boundary by injecting memory barriers.
Happens-before guarantee: A write to a volatile variable happens-before every subsequent read of that same variable.`
    },
    {
      id: 'virtual-threads',
      title: 'Java 21 Virtual Threads (Project Loom)',
      category: 'Modern Java 21',
      description: 'Lightweight user-mode threads managed by JVM runtime mapped M:N onto OS carrier threads.',
      codeSnippet: `// Starting 10,000 Virtual Threads with zero OS thread overhead
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            // Virtual thread parks automatically on blocking I/O (yielding carrier thread)
            Thread.sleep(Duration.ofMillis(100));
            return fetchUserData(i);
        });
    });
} // Automatically waits for all virtual threads to complete via AutoCloseable`,
      breakScenario: `Running blocking I/O inside a 'synchronized' block instead of ReentrantLock, causing Thread Pinning where the virtual thread cannot unmount from its underlying OS carrier thread.`,
      debugFix: `Replace synchronized blocks with java.util.concurrent.locks.ReentrantLock, which fully supports virtual thread continuation unmounting without carrier thread pinning.`,
      interviewAnswer: `Virtual Threads in Java 21 decouple Java thread abstractions from 1:1 OS kernel threads.
When a Virtual Thread executes a blocking operation (e.g. Socket read, JDBC query, Thread.sleep), the JVM unmounts the Continuation from the Carrier Thread (ForkJoinPool worker) and parks it on the Java Heap. The Carrier Thread is immediately freed to execute other virtual threads.
Senior Pitfall to Highlight: Thread Pinning happens when blocking I/O occurs inside synchronized methods or native JNI calls, preventing unmounting. Run with -Djdk.tracePinnedThreads=full to detect.`
    }
  ];

  const current = topics.find(t => t.id === selectedTopic) || topics[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Core Java 21 & JVM Internals"
        description="Master the runtime memory barriers, CPU cache coherence, bytecode optimizations, and Project Loom thread scheduling."
        badge={
          <Badge variant="primary" size="sm" dot>
            {topics.length} Deep Core Modules
          </Badge>
        }
      />

      {/* Topic Selector Bar */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {topics.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-mono border ${
                selectedTopic === t.id
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-bold'
                  : 'bg-surface-elevated text-text-muted border-border hover:border-border-muted hover:text-text-primary'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      </Card>

      {/* 6-Stage Engineering Loop Navigation */}
      <Card variant="glass" className="p-1.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'learn', label: '1. LEARN & THEORY', icon: BookOpen },
            { id: 'implement', label: '2. IMPLEMENT CODE', icon: Code2 },
            { id: 'break', label: '3. BREAK THE CODE', icon: Bug },
            { id: 'debug', label: '4. DEBUG & FIX', icon: AlertTriangle },
            { id: 'explain', label: '5. EXPLAIN OUT LOUD', icon: Mic },
            { id: 'interview', label: '6. SENIOR INTERVIEW', icon: Award },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-mono text-xs transition-colors ${
                  isActive 
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm' 
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Content Area */}
      <Card variant="default" className="p-6 space-y-4">
        {activeTab === 'learn' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase font-bold tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>ARCHITECTURAL FOUNDATION & THEORY</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">{current.title}</h2>
            <p className="text-sm text-text-secondary leading-relaxed font-sans">{current.description}</p>
            
            <div className="p-4 bg-surface-elevated border border-border rounded-xl space-y-2">
              <div className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">
                KEY CONCEPTS TO INTERNALIZE:
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-text-secondary font-sans leading-relaxed">
                <li>Thread safety is fundamentally about state mutability management across CPU cache hierarchies.</li>
                <li>Never rely on default unconfigured executors for asynchronous workflows in production.</li>
                <li>Size thread pools based on mathematical concurrency formulas: N_cpu * (1 + Wait/Compute).</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'implement' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-sky-400 uppercase font-bold">
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4" /> PRODUCTION JAVA 21 CODE PATTERN
              </span>
              <Badge variant="primary" size="sm">Clean Architecture</Badge>
            </div>
            <CodeBlock
              code={current.codeSnippet}
              language="java"
              title="Java 21 Thread Pattern"
              showLineNumbers
            />
          </div>
        )}

        {activeTab === 'break' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase font-bold tracking-wider">
              <Bug className="w-4 h-4" />
              <span>CHAOS & FAILURE INJECTION (BREAK THE CODE)</span>
            </div>
            <h3 className="text-base font-bold text-text-primary">How This Breaks In High-Concurrency Production:</h3>
            <Alert
              variant="danger"
              title="Production Concurrency Hazard"
            >
              <p className="text-xs text-text-primary leading-relaxed font-sans mt-1">
                {current.breakScenario}
              </p>
            </Alert>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>ROOT CAUSE ANALYSIS & PRODUCTION FIX</span>
            </div>
            <Alert
              variant="warning"
              title="Senior Mitigation Strategy"
            >
              <p className="text-xs text-text-primary leading-relaxed font-sans mt-1">
                {current.debugFix}
              </p>
            </Alert>
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase font-bold tracking-wider">
              <Mic className="w-4 h-4" />
              <span>ACTIVE EXPLANATION DRILL</span>
            </div>
            <p className="text-xs text-text-secondary">
              Read the prompt below, then practice explaining this concept out loud in 90 seconds without looking at notes:
            </p>
            <div className="p-4 bg-surface-elevated border border-border rounded-xl space-y-2">
              <div className="text-sm font-bold text-text-primary">
                Prompt: "Why would you choose CompletableFuture with a dedicated Executor over parallelStream in a Spring Boot REST API?"
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interview' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">
              <Award className="w-4 h-4" />
              <span>SENIOR STAFF INTERVIEW ANSWER</span>
            </div>
            <div className="p-4 bg-surface-elevated border border-emerald-500/30 rounded-xl space-y-2">
              <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed font-sans">
                {current.interviewAnswer}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
