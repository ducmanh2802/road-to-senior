import React, { useState } from 'react';
import {
  Leaf,
  Code2,
  Bug,
  AlertTriangle,
  Award,
  Layers,
  Terminal,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Box
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CodeBlock } from '../ui/CodeBlock';
import { Alert } from '../ui/Alert';

export const SpringView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('transaction-proxy');
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'pitfall' | 'testcontainers'>('architecture');

  const topics = [
    {
      id: 'transaction-proxy',
      title: '@Transactional Self-Invocation & Proxy Bypass',
      category: 'Spring AOP & Transactions',
      description: 'Understanding Spring CGLIB proxies, interceptor chains, and why calling a @Transactional method from within the same class skips transaction boundaries.',
      codeSnippet: `@Service
@RequiredQueryTimeout(5)
public class OrderProcessingService {

    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;

    // ❌ WRONG: Self-invocation bypasses the CGLIB proxy wrapper!
    public void processOrderUnsafe(Long orderId) {
        log.info("Processing order non-transactionally");
        this.executeTransaction(orderId); // Direct method call on 'this' - NO TRANSACTION CREATED!
    }

    // ✅ CORRECT ARCHITECTURE: Separate into a dedicated transaction boundary collaborator
    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public void executeTransaction(Long orderId) {
        Order order = orderRepository.findByIdWithPessimisticLock(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        order.markPaid();
        orderRepository.save(order);
    }
}`,
      pitfall: `Default @Transactional only rolls back on RuntimeException and Error, NOT checked Exceptions unless explicitly declared with rollbackFor = Exception.class.
Self-invocation (methodA calling @Transactional methodB within same bean) calls the raw Java object instance 'this' directly, completely bypassing Spring's CGLIB proxy and TransactionInterceptor.`,
      testcontainersSnippet: `@SpringBootTest
@Testcontainers
class OrderServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("orders_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private OrderProcessingService orderService;

    @Test
    void shouldRollbackOnException() {
        // Real database transaction verification
    }
}`
    },
    {
      id: 'jpa-nplusone',
      title: 'Hibernate JPA N+1 Query Elimination & Batch Size',
      category: 'Data Access & ORM',
      description: 'Solving N+1 select queries using EntityGraph, JOIN FETCH, and default_batch_fetch_size.',
      codeSnippet: `public interface OrderRepository extends JpaRepository<Order, Long> {

    // ❌ Problematic default: Fetches 1 Order, then issues N separate SQL SELECTs for OrderItems
    // List<Order> findAllByCustomerId(Long customerId);

    // ✅ OPTION 1: JPQL JOIN FETCH (Eagerly loads items in single SQL JOIN)
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.customer WHERE o.customer.id = :customerId")
    List<Order> findAllWithItemsEager(@Param("customerId") Long customerId);

    // ✅ OPTION 2: Spring Data JPA 2.x EntityGraph
    @EntityGraph(attributePaths = {"items", "shippingAddress"})
    List<Order> findByStatus(OrderStatus status);
}`,
      pitfall: `Using JOIN FETCH on multiple @OneToMany collections at the same time causes a Cartesian Product explosion in memory, triggering MultipleBagFetchException. Use @BatchSize(size = 50) on child collections or two-stage queries instead.`,
      testcontainersSnippet: `// application.yml configuration for detection
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 50
        generate_statistics: true`
    }
  ];

  const current = topics.find(t => t.id === selectedTopic) || topics[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Spring Boot 3 & Backend Architecture"
        description="Production engineering patterns, transaction boundary guarantees, and integration testing with real Testcontainers."
        badge={
          <Badge variant="success" size="sm" dot>
            {topics.length} Production Architect Modules
          </Badge>
        }
      />

      {/* Topic Selector */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {topics.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-mono border ${
                selectedTopic === t.id
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-bold'
                  : 'bg-surface-elevated text-text-muted border-border hover:border-border-muted hover:text-text-primary'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Navigation */}
      <Card variant="glass" className="p-1.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'architecture', label: '1. ARCHITECTURAL PATTERN', icon: Layers },
            { id: 'code', label: '2. CODE IMPLEMENTATION', icon: Code2 },
            { id: 'pitfall', label: '3. PRODUCTION PITFALL', icon: Bug },
            { id: 'testcontainers', label: '4. TESTCONTAINERS INTEGRATION', icon: Box },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[150px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-mono text-xs transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
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
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">
              <Layers className="w-4 h-4" />
              <span>SPRING 3 INTERNALS & PROXY DYNAMICS</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">{current.title}</h2>
            <p className="text-sm text-text-secondary leading-relaxed font-sans">{current.description}</p>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 uppercase font-bold">
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4" /> SPRING BOOT 3 CODE PATTERN
              </span>
              <Badge variant="success" size="sm">Thread-Safe & Scalable</Badge>
            </div>
            <CodeBlock
              code={current.codeSnippet}
              language="java"
              title="Spring Service Implementation"
              showLineNumbers
            />
          </div>
        )}

        {activeTab === 'pitfall' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase font-bold tracking-wider">
              <Bug className="w-4 h-4" />
              <span>CRITICAL PRODUCTION FAILURE SCENARIOS</span>
            </div>
            <Alert
              variant="danger"
              title="Silent Transaction Bypass / Memory Hazards"
            >
              <p className="text-xs text-text-primary leading-relaxed font-sans mt-1 whitespace-pre-line">
                {current.pitfall}
              </p>
            </Alert>
          </div>
        )}

        {activeTab === 'testcontainers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-sky-400 uppercase font-bold">
              <span className="flex items-center gap-2">
                <Box className="w-4 h-4" /> TESTCONTAINERS INTEGRATION TEST
              </span>
              <Badge variant="primary" size="sm">Real Database Verification</Badge>
            </div>
            <CodeBlock
              code={current.testcontainersSnippet}
              language="java"
              title="Integration Test with Docker Postgres"
              showLineNumbers
            />
          </div>
        )}
      </Card>
    </div>
  );
};
