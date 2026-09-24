<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Play, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    moduleId?: string;
  }>(),
  {
    moduleId: '1.1',
  }
);

const emit = defineEmits<{
  (e: 'completed'): void;
}>();

const currentStep = ref(1);
const isMutated = ref(false);
const isFixApplied = ref(false);

const isModule1_2 = computed(() => props.moduleId === '1.2');
const isModule1_3 = computed(() => props.moduleId === '1.3');

function getInitialLogs(): string[] {
  if (isModule1_3.value) {
    return [
      '> Initializing Pattern Matching Dispatcher (DomainEvent)...',
      '> Sealed interface: DomainEvent permits OrderEvent, PaymentEvent, SecurityAlert',
      '> Vulnerability check 1: Subtype dominance order in switch cases',
      '> Vulnerability check 2: Selector expression evaluation on null event payloads',
      '> Ready to test dispatch: null payload and dominated case labels...',
    ];
  }
  if (isModule1_2.value) {
    return [
      '> Initializing Sealed Hierarchy Simulator (PaymentResult)...',
      '> Sealed interface: PaymentResult permits Success, Declined, GatewayError',
      '> Active dispatcher: BrittlePaymentHandler with switch (result) containing "default:" fallback',
      '> Ready to dispatch transactions: Success("TX-101"), Declined("TX-102")...',
      '> Status: All initial known variants routed cleanly.',
    ];
  }
  return [
    '> Initializing heap simulation...',
    '> List<String> cart = new ArrayList<>();',
    '> cart.add("SKU-1001");',
    '> cart.add("SKU-1002");',
    '> VulnerableOrderRecord order = new VulnerableOrderRecord("ORD-99", cart);',
    '> Initial order.items(): [SKU-1001, SKU-1002]',
  ];
}

const executionLogs = ref<string[]>(getInitialLogs());

watch(
  () => props.moduleId,
  () => {
    resetLab();
  }
);

function triggerMutation() {
  isMutated.value = true;
  if (isModule1_3.value) {
    executionLogs.value.push(
      '> Dispatching: TransactionEventDispatcher.dispatch(null);',
      '> 💥 OBSERVATION: java.lang.NullPointerException thrown at runtime at switch selector expression!',
      '> ❌ Missing "case null ->" branch caused crash in production event consumer!',
      '> Testing compilation: case CharSequence cs -> ... before case String s -> ...',
      '> 💥 javac error: "this case label is dominated by a preceding case label" (unreachable code)'
    );
  } else if (isModule1_2.value) {
    executionLogs.value.push(
      '> Domain evolved: Adding new variant `record FraudSuspended(...) implements PaymentResult` to permits.',
      '> Dispatching: routePayment(new FraudSuspended("TX-999", "CRITICAL_FRAUD_SCORE"))',
      '> 💥 OBSERVATION: javac compiled without error because `default:` masked the missing branch!',
      '> ❌ Silent Fall-Through: Fraud alert fell silently into logGenericInfo() fallback instead of fraud pipeline!'
    );
  } else {
    executionLogs.value.push(
      '> cart.add("SKU-CORRUPTED"); // External caller mutates original list reference',
      '> 💥 OBSERVATION: order.items() now returns: [SKU-1001, SKU-1002, SKU-CORRUPTED]',
      '> ❌ Shallow immutability breached: record internal state modified after construction!'
    );
  }
  currentStep.value = 2;
}

function applyDefensiveCopyFix() {
  isFixApplied.value = true;
  if (isModule1_3.value) {
    executionLogs.value.push(
      '> Applying fix: Adding explicit "case null -> IGNORED" and reordering guarded/specific patterns...',
      '> Re-ordering: Guarded record patterns and String placed before general CharSequence/Object patterns.',
      '> Re-running dispatch(null):',
      '> ✅ OBSERVATION: Safely routed to "IGNORED: Received null event payload" with ZERO NPE.',
      '> ✅ Verified: javac compiles cleanly with strict dominance ordering and record deconstruction.',
      '> 🎉 FAILURE LAB COMPLETED: Pattern dominance resolved & null safety verified.'
    );
  } else if (isModule1_2.value) {
    executionLogs.value.push(
      '> Applying fix: Removing default branch and converting to exhaustive switch expression...',
      '> Re-compiling: javac now verifies total variant coverage across all permitted subtypes.',
      '> Explicitly handling: case FraudSuspended f -> triggerFraudIntervention(f);',
      '> ✅ OBSERVATION: 100% of domain variants now statically verified by compiler.',
      '> 🎉 FAILURE LAB COMPLETED: Silent fall-through eliminated forever.'
    );
  } else {
    executionLogs.value.push(
      '> Applying fix: public OrderRecord { items = (items == null) ? List.of() : List.copyOf(items); }',
      '> Re-instantiating order with defensive copy snapshot...',
      '> cart.add("ANOTHER-MALICIOUS-SKU"); // Modifying external list',
      '> ✅ OBSERVATION: order.items() remains strictly: [SKU-1001, SKU-1002]',
      '> ✅ Verified: List.copyOf creates an independent unmodifiable collection buffer.',
      '> 🎉 FAILURE LAB COMPLETED SUCCESSFULLY.'
    );
  }
  currentStep.value = 3;
  emit('completed');
}

function resetLab() {
  currentStep.value = 1;
  isMutated.value = false;
  isFixApplied.value = false;
  executionLogs.value = getInitialLogs();
}

defineExpose({
  currentStep,
  isMutated,
  isFixApplied,
  triggerMutation,
  applyDefensiveCopyFix,
  resetLab,
});
</script>

<template>
  <div class="space-y-4 rounded-xl border border-[#1E293B] bg-[#111622] p-5" data-testid="failure-lab-container">
    <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 text-[#EF4444]" />
        <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-[#EF4444]">
          <span v-if="isModule1_3">INTERACTIVE BREAK LAB: DOMINANCE TRAP & NULL PAYLOAD NPE</span>
          <span v-else-if="isModule1_2">INTERACTIVE BREAK LAB: SILENT VARIANT FALL-THROUGH TRACE</span>
          <span v-else>INTERACTIVE BREAK LAB: HEAP MUTATION TRACE</span>
        </h4>
      </div>
      <span class="text-[11px] font-mono text-[#94A3B8]">
        Step {{ currentStep }} of 3
      </span>
    </div>

    <!-- Stepper instructions -->
    <div class="text-xs text-[#CBD5E1] space-y-1 leading-relaxed">
      <template v-if="isModule1_3">
        <p v-if="currentStep === 1">
          <strong>Step 1:</strong> The event router dispatches polymorphic events. Click below to simulate sending a <code class="text-[#EF4444]">null</code> event payload and compiling an inverted pattern dominance hierarchy.
        </p>
        <p v-else-if="currentStep === 2">
          <strong>Step 2:</strong> Notice how the runtime selector immediately crashes with <code class="text-[#EF4444]">NullPointerException</code>, while the compiler rejects dominated cases! Now apply the null-safe, correctly ordered pattern switch.
        </p>
        <p v-else>
          <strong>Step 3:</strong> Verification complete! Null payloads are cleanly intercepted via <code class="text-[#22C55E]">case null</code>, and pattern dominance satisfies javac.
        </p>
      </template>
      <template v-else-if="isModule1_2">
        <p v-if="currentStep === 1">
          <strong>Step 1:</strong> The payment processor uses a switch with a <code class="text-[#EF4444]">default:</code> branch. Click below to simulate domain evolution when a new <code class="text-[#38BDF8]">FraudSuspended</code> variant is introduced.
        </p>
        <p v-else-if="currentStep === 2">
          <strong>Step 2:</strong> Notice how the compiler allowed the code to compile silently, routing the fraud event into a generic info log! Now apply the exhaustive switch remediation.
        </p>
        <p v-else>
          <strong>Step 3:</strong> Total exhaustiveness verified! The compiler now statically blocks compilation if any permitted subtype is unhandled.
        </p>
      </template>
      <template v-else>
        <p v-if="currentStep === 1">
          <strong>Step 1:</strong> The record was instantiated referencing an external <code class="text-[#38BDF8]">ArrayList</code>. Click below to simulate an external caller modifying that original list.
        </p>
        <p v-else-if="currentStep === 2">
          <strong>Step 2:</strong> Notice how <code class="text-[#EF4444]">order.items()</code> observed the corrupted item without reassignment. Now apply the <code class="text-[#22C55E]">List.copyOf()</code> defensive fix.
        </p>
        <p v-else>
          <strong>Step 3:</strong> Verification complete! The record state is completely decoupled from the caller's list.
        </p>
      </template>
    </div>

    <!-- Interactive Execution Console -->
    <div class="rounded-lg bg-[#0B0E14] border border-[#1E293B] p-3 font-mono text-[11px] space-y-1 text-[#38BDF8] min-h-[140px] max-h-[180px] overflow-y-auto" data-testid="lab-console">
      <div v-for="(log, i) in executionLogs" :key="i"
        :class="log.includes('💥') || log.includes('❌') ? 'text-[#EF4444]' : log.includes('✅') || log.includes('🎉') ? 'text-[#22C55E]' : 'text-[#94A3B8]'"
      >
        {{ log }}
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between pt-2">
      <button
        v-if="currentStep === 1"
        type="button"
        class="px-4 py-2 rounded-lg bg-[#EF4444] text-[#FFFFFF] text-xs font-mono font-bold hover:bg-[#EF4444]/90 flex items-center gap-1.5 cursor-pointer transition-all"
        data-testid="trigger-mutation-btn"
        @click="triggerMutation"
      >
        <Play class="w-3.5 h-3.5" />
        <span v-if="isModule1_3">SIMULATE NULL & DOMINANCE TRAP</span>
        <span v-else-if="isModule1_2">SIMULATE NEW DOMAIN VARIANT</span>
        <span v-else>SIMULATE EXTERNAL MUTATION</span>
      </button>

      <button
        v-else-if="currentStep === 2"
        type="button"
        class="px-4 py-2 rounded-lg bg-[#22C55E] text-[#020617] text-xs font-mono font-bold hover:bg-[#22C55E]/90 flex items-center gap-1.5 cursor-pointer transition-all"
        data-testid="apply-fix-btn"
        @click="applyDefensiveCopyFix"
      >
        <ShieldCheck class="w-3.5 h-3.5" />
        <span v-if="isModule1_3">APPLY NULL-SAFE PATTERN SWITCH</span>
        <span v-else-if="isModule1_2">ENFORCE EXHAUSTIVE SWITCH</span>
        <span v-else>APPLY DEFENSIVE COPY FIX</span>
      </button>

      <div v-else class="flex items-center gap-2 text-xs font-mono text-[#22C55E] font-semibold">
        <CheckCircle2 class="w-4 h-4" />
        <span>Failure Lab Verified & Passed</span>
      </div>

      <button
        type="button"
        class="p-2 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151B28] text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
        data-testid="reset-lab-btn"
        @click="resetLab"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>RESET SIMULATION</span>
      </button>
    </div>
  </div>
</template>
