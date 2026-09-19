import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Terminal, 
  Bug, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Radio, 
  RefreshCw 
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CodeBlock } from '../ui/CodeBlock';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';

export const MicroservicesView: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<string>('outbox');
  const [chaosTriggered, setChaosTriggered] = useState<boolean>(false);
  const [resolutionStep, setResolutionStep] = useState<number>(0);

  const patterns = [
    {
      id: 'outbox',
      title: 'Transactional Outbox Pattern & CDC',
      subtitle: 'Guaranteed Dual-Write Atomicity (Database + Kafka)',
      description: 'Solves the 2-Phase Commit problem in microservices. When an order is created, the order state and the outgoing event are committed atomically in the same local ACID database transaction. A CDC worker (e.g. Debezium / Kafka Connect) tails the database WAL log and publishes the event to Kafka with at-least-once delivery guarantees.',
      flowDiagram: `[Order API] ➔ [Local DB Transaction { INSERT into orders; INSERT into outbox_table; } COMMIT] ➔ [Debezium CDC / Outbox Poller] ➔ [Kafka Topic: order.events] ➔ [Payment & Inventory Consumers]`,
      codeSnippet: `@Service
@RequiredArgsConstructor
public class OrderCreationService {

    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest req) {
        // 1. Persist Order in local Postgres
        Order order = orderRepository.save(new Order(req.customerId(), req.items()));

        // 2. Persist Event into Outbox in THE SAME local transaction
        OutboxEvent event = OutboxEvent.builder()
            .aggregateType("ORDER")
            .aggregateId(order.getId().toString())
            .eventType("ORDER_CREATED")
            .payload(objectMapper.writeValueAsString(new OrderCreatedPayload(order)))
            .status(OutboxStatus.PENDING)
            .createdAt(Instant.now())
            .build();
        outboxRepository.save(event);

        return new OrderResponse(order.getId(), OrderStatus.CREATED);
    }
}`,
      chaosScenario: {
        title: 'Dual-Write Split-Brain Disaster',
        triggerText: 'Simulate direct Kafka publish failure after DB save',
        symptom: 'Order is committed to Postgres, but Kafka publish times out due to network partition. The Order is marked PAID in DB, but Shipping & Inventory services NEVER receive the event. Customer is charged but item is never shipped.',
        rootCause: 'Direct dual writes (DB save + Kafka send in one method) cannot be atomic across heterogeneous distributed systems without 2PC.',
        fixSteps: [
          'Step 1: Introduce outbox_events table with columns (id, aggregate_type, aggregate_id, event_type, payload, status, created_at).',
          'Step 2: Save outbox records within the primary Postgres transaction.',
          'Step 3: Deploy Debezium PostgreSQL CDC Connector to tail pg_wal, streaming events into Kafka topics with idempotent message IDs.'
        ]
      }
    },
    {
      id: 'saga',
      title: 'Saga Orchestration with State Machine',
      subtitle: 'Managing Long-Running Distributed Transactions',
      description: 'Orchestrates multi-service workflows (Create Order ➔ Reserve Inventory ➔ Authorize Payment ➔ Dispatch Shipment) without blocking locks. If payment fails, the orchestrator triggers backward compensating transactions in reverse order.',
      flowDiagram: `[Order Saga Orchestrator]
  ├─ 1. Reserve Stock (Inventory Service) ➔ SUCCESS
  ├─ 2. Authorize Card (Payment Service) ➔ FAILED (Insufficient Funds)
  └─ 3. [COMPENSATION] ➔ Release Stock (Inventory Service) ➔ Cancel Order`,
      codeSnippet: `@Component
@RequiredArgsConstructor
public class OrderSagaOrchestrator {

    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final OrderRepository orderRepository;

    public void executeOrderSaga(Order order) {
        boolean stockReserved = false;
        try {
            stockReserved = inventoryClient.reserveStock(order.getId(), order.getItems());
            paymentClient.chargePayment(order.getId(), order.getTotalAmount());
            order.setStatus(OrderStatus.CONFIRMED);
        } catch (PaymentException ex) {
            log.error("Payment failed. Triggering compensating transactions.", ex);
            if (stockReserved) {
                inventoryClient.compensateReleaseStock(order.getId());
            }
            order.setStatus(OrderStatus.FAILED_PAYMENT);
        } finally {
            orderRepository.save(order);
        }
    }
}`,
      chaosScenario: {
        title: 'Orchestrator Crash Mid-Flight',
        triggerText: 'Simulate server crash after Reserve Stock but before Payment',
        symptom: 'Inventory remains locked indefinitely. Subsequent orders report Out-of-Stock for valid products.',
        rootCause: 'In-memory saga execution state lost upon JVM restart. Compensation is never invoked.',
        fixSteps: [
          'Step 1: Store Saga state in persistent database (State Machine table: SAGA_ID, CURRENT_STEP, STATUS).',
          'Step 2: Implement durable execution framework like Temporal or persistent state transitions.',
          'Step 3: Background reaper process polls for abandoned sagas older than 5 minutes and runs compensation.'
        ]
      }
    },
    {
      id: 'kafka-rebalance',
      title: 'Kafka Consumer Group Rebalance Storm Prevention',
      subtitle: 'Heartbeat, max.poll.interval.ms & Cooperative Sticky Assignor',
      description: 'When consumer processing takes longer than max.poll.interval.ms, the Kafka Coordinator assumes the consumer died, kicks it out of the consumer group, and reassigns partitions across all remaining nodes, causing a cascading rebalance freeze.',
      flowDiagram: `[Kafka Broker] ➔ [Consumer 1 (Processing slow 45s batch)] ➔ [Timeout > max.poll.interval.ms (30s)] ➔ [KICKED OUT!] ➔ [Rebalance Storm across all 20 nodes]`,
      codeSnippet: `// application.yml - Senior Kafka Consumer Tuning
spring:
  kafka:
    consumer:
      enable-auto-commit: false
      isolation-level: read_committed
      properties:
        # Prevent rebalance storms
        max.poll.interval.ms: 300000        # 5 minutes for heavy batch processing
        max.poll.records: 50                 # Small batch size to finish within poll window
        heartbeat.interval.ms: 3000         # 3s background heartbeat
        session.timeout.ms: 45000           # 45s node failure detection
        partition.assignment.strategy: org.apache.kafka.clients.consumer.CooperativeStickyAssignor`,
      chaosScenario: {
        title: 'Cascading Rebalance Freeze',
        triggerText: 'Simulate slow third-party API call inside Kafka Listener',
        symptom: 'Consumer group lag spikes to millions of messages. Logs flooded with "CommitFailedException: Consumer was disconnected from cluster".',
        rootCause: 'max.poll.interval.ms was set to default 300s while batch size was 500 records calling a 1000ms external API (total 500s > 300s).',
        fixSteps: [
          'Step 1: Reduce max.poll.records to 20 or 50.',
          'Step 2: Switch assignment strategy from RangeAssignor to CooperativeStickyAssignor to prevent full stop-the-world rebalances.',
          'Step 3: Offload heavy I/O to a dedicated worker thread pool and pause() partitions if buffer fills up.'
        ]
      }
    }
  ];

  const current = patterns.find(p => p.id === selectedPattern) || patterns[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Microservices & Event-Driven Patterns"
        description="Dual-write atomicity, Saga compensating transactions, Kafka consumer tuning, and distributed idempotency."
        badge={
          <Badge variant="purple" size="sm" dot>
            {patterns.length} Core Distributed Patterns
          </Badge>
        }
      />

      {/* Pattern Selector */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {patterns.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPattern(p.id);
                setChaosTriggered(false);
                setResolutionStep(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-mono border ${
                selectedPattern === p.id
                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/40 font-bold'
                  : 'bg-surface-elevated text-text-muted border-border hover:border-border-muted hover:text-text-primary'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </Card>

      {/* Pattern Overview */}
      <Card variant="default" className="p-6 space-y-5">
        <div>
          <Badge variant="purple" size="sm" className="mb-2">
            {current.subtitle}
          </Badge>
          <h2 className="text-xl font-bold text-text-primary mt-1">{current.title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed mt-2">{current.description}</p>
        </div>

        {/* Distributed Event Flow Visualizer */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
            EVENT FLOW ARCHITECTURE
          </div>
          <div className="p-3.5 bg-surface-elevated border border-border rounded-xl font-mono text-xs text-text-primary overflow-x-auto leading-relaxed">
            {current.flowDiagram}
          </div>
        </div>

        {/* Production Code Pattern */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-purple-400 uppercase font-bold">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4" /> PRODUCTION JAVA 21 & SPRING CODE
            </span>
            <Badge variant="outline" size="sm">Transactional</Badge>
          </div>
          <CodeBlock
            code={current.codeSnippet}
            language="java"
            title="Service Implementation"
            showLineNumbers
          />
        </div>

        {/* Chaos Engineering Simulator Panel */}
        <div className="p-5 bg-surface-elevated border border-rose-500/30 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
              <Bug className="w-4 h-4" />
              <span>CHAOS SIMULATOR: {current.chaosScenario.title}</span>
            </div>

            <Button
              variant={chaosTriggered ? 'outline' : 'danger'}
              size="sm"
              onClick={() => setChaosTriggered(!chaosTriggered)}
              icon={<Zap className="w-3.5 h-3.5" />}
            >
              {chaosTriggered ? 'Reset Simulation' : current.chaosScenario.triggerText}
            </Button>
          </div>

          {chaosTriggered && (
            <div className="space-y-3 pt-3 border-t border-rose-500/20 animate-in fade-in duration-200">
              <Alert variant="danger" title="Observed Production Symptom">
                <p className="text-xs text-text-primary mt-1 font-sans leading-relaxed">
                  {current.chaosScenario.symptom}
                </p>
              </Alert>

              <div className="p-3.5 bg-surface border border-border rounded-lg space-y-1">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                  ROOT CAUSE ANALYSIS:
                </div>
                <p className="text-xs text-text-secondary font-sans leading-relaxed">
                  {current.chaosScenario.rootCause}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  PRODUCTION RESOLUTION BLUEPRINT:
                </div>
                {current.chaosScenario.fixSteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-surface border border-border rounded-lg text-xs font-mono text-text-primary flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
