<script setup lang="ts">
/**
 * Phase Z — Senior Engineering Certification.
 *
 * Route: /certifications/senior-engineering
 *
 * This page is deliberately incapable of showing CERTIFIED on its own. The
 * verdict comes from `evaluateCertification`, which requires evidence on all
 * thirteen dimensions. Dimensions the platform has no capability for are
 * reported as NO EVIDENCE SOURCE — not as a zero score.
 */
import { computed } from 'vue';
import { Award, ShieldAlert, CheckCircle2, Circle, CircleDashed, ArrowRight, Scale, Info } from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import PageHeader from '../components/PageHeader.vue';
import ProgressBar from '../components/ProgressBar.vue';
import EmptyState from '../components/EmptyState.vue';
import StatCard from '../components/StatCard.vue';
import Badge from '../components/ui/Badge.vue';
import {
  CERTIFICATION_DIMENSIONS,
  CERTIFICATION_DIMENSION_THRESHOLD,
  type DimensionResult,
} from '../../engines/certificationEngine';

const store = useLearningStore();

const verdict = computed(() => store.certification);

function statusVariant(status: DimensionResult['status']) {
  if (status === 'EVIDENCE_MET') return 'success' as const;
  if (status === 'EVIDENCE_PARTIAL') return 'warning' as const;
  return 'danger' as const;
}

function statusLabel(status: DimensionResult['status']): string {
  switch (status) {
    case 'EVIDENCE_MET':
      return 'MET';
    case 'EVIDENCE_PARTIAL':
      return 'PARTIAL';
    case 'NO_EVIDENCE':
      return 'NO EVIDENCE';
    default:
      return 'NO EVIDENCE SOURCE';
  }
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12" data-testid="certification-page">
    <PageHeader
      title="Senior Engineering Certification"
      description="Thirteen dimensions, every score derived from recorded evidence. A dimension with no evidence source is reported as a gap — never scored as a zero and never silently passed."
    >
      <template #actions>
        <Badge :variant="verdict.certified ? 'success' : 'danger'" dot>{{ verdict.verdict }}</Badge>
      </template>
    </PageHeader>

    <!-- Verdict banner -->
    <div
      class="p-5 rounded-lg border space-y-3"
      :class="verdict.certified ? 'border-[#22C55E]/40 bg-[#22C55E]/5' : 'border-[#EF4444]/40 bg-[#EF4444]/5'"
      data-testid="certification-verdict"
    >
      <div class="flex items-start gap-3 flex-wrap">
        <ShieldAlert v-if="!verdict.certified" class="w-6 h-6 text-[#EF4444] shrink-0" />
        <Award v-else class="w-6 h-6 text-[#22C55E] shrink-0" />
        <div class="min-w-0">
          <h2 class="text-base font-bold text-[#F8FAFC]">
            {{ verdict.certified ? 'SENIOR ENGINEERING MASTERY CERTIFIED' : 'NOT CERTIFIED' }}
          </h2>
          <p class="text-xs text-[#CBD5E1] mt-1 leading-relaxed">
            <template v-if="verdict.certified">
              All {{ verdict.dimensionsRequired }} dimensions have recorded evidence and meet the
              {{ CERTIFICATION_DIMENSION_THRESHOLD }}% threshold.
            </template>
            <template v-else>
              {{ verdict.dimensionsMet }} of {{ verdict.dimensionsRequired }} dimensions meet the
              {{ CERTIFICATION_DIMENSION_THRESHOLD }}% threshold.
              <template v-if="verdict.missingSources.length > 0">
                {{ verdict.missingSources.length }} dimension(s) have no evidence source in this platform at all —
                reported as a capability gap, not as a failed score.
              </template>
            </template>
          </p>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Dimensions Met"
        :value="`${verdict.dimensionsMet}/${verdict.dimensionsRequired}`"
        :icon="Award"
        icon-color="text-[#22C55E]"
        icon-bg="bg-[#22C55E]/10 border-[#22C55E]/20"
      />
      <StatCard label="Overall (scored dimensions)" :value="`${verdict.overallPercent}%`" :sub-value="`threshold ${CERTIFICATION_DIMENSION_THRESHOLD}%`" :icon="Scale" />
      <StatCard
        label="No Evidence Source"
        :value="verdict.missingSources.length"
        :icon="Info"
        icon-color="text-[#F59E0B]"
        icon-bg="bg-[#F59E0B]/10 border-[#F59E0B]/20"
      />
      <StatCard
        label="Java Modules Complete"
        :value="store.javaCompletedCount"
        :sub-value="`of ${store.javaTotalCount}`"
        :icon="CheckCircle2"
      />
    </div>

    <!-- The thirteen dimensions -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-3">
      <h2 class="text-sm font-semibold text-[#F1F5F9]">The thirteen dimensions</h2>
      <p class="text-[10px] font-mono text-[#64748B]">
        Every figure below is recorded evidence ÷ available evidence. No score is hardcoded anywhere in the platform.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div
          v-for="dimension in verdict.dimensions"
          :key="dimension.dimension"
          class="p-3 rounded-md border bg-[#151D2C] space-y-2"
          :class="
            dimension.status === 'EVIDENCE_MET'
              ? 'border-[#22C55E]/40'
              : dimension.status === 'EVIDENCE_PARTIAL'
              ? 'border-[#F59E0B]/40'
              : 'border-[#EF4444]/40'
          "
          :data-testid="`cert-dimension-${dimension.dimension}`"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-[#F1F5F9]">{{ dimension.label }}</span>
            <Badge :variant="statusVariant(dimension.status)" size="sm">{{ statusLabel(dimension.status) }}</Badge>
          </div>

          <template v-if="dimension.percent !== null">
            <ProgressBar
              :value="dimension.percent"
              size="xs"
              :variant="dimension.met ? 'success' : 'primary'"
            />
            <div class="text-[10px] font-mono text-[#64748B]">
              {{ dimension.recorded }}/{{ dimension.available }} recorded · {{ dimension.percent }}%
            </div>
          </template>
          <template v-else>
            <div class="text-[10px] font-mono text-[#F59E0B] leading-relaxed">
              This platform has no capability that records {{ dimension.label.toLowerCase() }} evidence. Reporting a score
              here would be fabricating evidence, so the dimension is reported as a gap.
            </div>
          </template>

          <ul v-if="dimension.evidenceKinds.length > 0" class="space-y-0.5">
            <li v-for="kind in dimension.evidenceKinds" :key="kind" class="text-[10px] text-[#64748B]">• {{ kind }}</li>
          </ul>
          <RouterLink
            v-if="dimension.earnAtRoute"
            :to="dimension.earnAtRoute"
            class="text-[10px] font-mono text-[#38BDF8] hover:underline inline-flex items-center gap-1"
          >
            Earn it at {{ dimension.earnAtRoute }} <ArrowRight class="w-3 h-3" />
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Next evidence -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-2">
      <h2 class="text-sm font-semibold text-[#F1F5F9]">Next evidence, cheapest first</h2>
      <p class="text-[10px] font-mono text-[#64748B]">
        Ordered by how far each dimension is from its threshold — the shortest path to moving the verdict.
      </p>
      <EmptyState v-if="verdict.nextEvidence.length === 0" title="No outstanding evidence" description="Every scored dimension meets its threshold." />
      <div
        v-for="item in verdict.nextEvidence"
        :key="item.dimension"
        class="flex items-center justify-between gap-3 p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433] flex-wrap"
        :data-testid="`cert-next-${item.dimension}`"
      >
        <div class="min-w-0">
          <div class="text-xs text-[#F1F5F9]">{{ item.label }}</div>
          <div class="text-[10px] font-mono text-[#64748B]">{{ item.remaining }} more of {{ item.of }} available</div>
        </div>
        <RouterLink :to="item.route" class="text-[10px] font-mono text-[#38BDF8] hover:underline">{{ item.route }}</RouterLink>
      </div>
    </div>

    <!-- Audit -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-2">
      <h2 class="text-sm font-semibold text-[#F1F5F9]">Verdict audit trail</h2>
      <ul class="space-y-0.5">
        <li v-for="line in verdict.auditTrail" :key="line" class="text-[11px] font-mono text-[#64748B]">{{ line }}</li>
      </ul>
      <div class="text-[10px] font-mono text-[#F59E0B]">
        {{ CERTIFICATION_DIMENSIONS.length }} dimensions defined · threshold {{ CERTIFICATION_DIMENSION_THRESHOLD }}% each ·
        overall percent is the mean of scorable dimensions only.
      </div>
    </div>

    <!-- Honest gate legend -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-2">
      <h2 class="text-sm font-semibold text-[#F1F5F9]">What the statuses mean</h2>
      <div class="space-y-1.5 text-[11px] text-[#94A3B8]">
        <div class="flex items-start gap-2">
          <CheckCircle2 class="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
          <span>MET — enough recorded evidence to reach the threshold.</span>
        </div>
        <div class="flex items-start gap-2">
          <Circle class="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
          <span>PARTIAL — real evidence recorded, below the threshold.</span>
        </div>
        <div class="flex items-start gap-2">
          <CircleDashed class="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />
          <span>NO EVIDENCE — the capability exists but nothing has been recorded.</span>
        </div>
        <div class="flex items-start gap-2">
          <Info class="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
          <span>NO EVIDENCE SOURCE — the platform cannot record this dimension yet. A capability gap, not a learner failure.</span>
        </div>
      </div>
    </div>
  </div>
</template>