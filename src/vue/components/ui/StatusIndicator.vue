<script setup lang="ts">
/**
 * Vue port of src/components/ui/StatusIndicator.tsx (design-system parity).
 * Maps a semantic status string to a Badge variant + default label.
 */
import { computed } from 'vue';
import type { FunctionalComponent } from 'vue';
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  PlayCircle,
  Clock,
  Lock,
  MinusCircle,
} from 'lucide-vue-next';
import Badge from './Badge.vue';
import type { BadgeVariant } from './Badge.vue';

const props = withDefaults(
  defineProps<{
    status: string;
    label?: string;
    size?: 'sm' | 'md';
    showIcon?: boolean;
    showDot?: boolean;
  }>(),
  { label: undefined, size: 'md', showIcon: false, showDot: true }
);

interface StatusConfig {
  variant: BadgeVariant;
  icon: FunctionalComponent;
  defaultLabel: string;
  pulse: boolean;
}

function getStatusConfig(norm: string): StatusConfig {
  switch (norm) {
    case 'SUCCESS':
    case 'COMPLETED':
    case 'RESOLVED':
    case 'MASTERED':
      return { variant: 'success', icon: CheckCircle2, defaultLabel: 'Completed', pulse: false };
    case 'WARNING':
    case 'PRACTICING':
    case 'INVESTIGATING':
      return { variant: 'warning', icon: AlertTriangle, defaultLabel: 'Investigating', pulse: true };
    case 'DANGER':
    case 'OVERDUE':
    case 'UNRESOLVED':
      return { variant: 'danger', icon: Flame, defaultLabel: 'Critical / Overdue', pulse: true };
    case 'ACTIVE':
    case 'IN_PROGRESS':
    case 'UNDERSTOOD':
      return { variant: 'primary', icon: PlayCircle, defaultLabel: 'In Progress', pulse: true };
    case 'TODO':
    case 'LEARNING':
      return { variant: 'info', icon: Clock, defaultLabel: 'Todo', pulse: false };
    case 'LOCKED':
      return { variant: 'neutral', icon: Lock, defaultLabel: 'Locked', pulse: false };
    default:
      return { variant: 'default', icon: MinusCircle, defaultLabel: norm, pulse: false };
  }
}

const normStatus = computed(() => (props.status || 'NEUTRAL').toUpperCase());
const config = computed(() => getStatusConfig(normStatus.value));
const displayLabel = computed(() => props.label ?? config.value.defaultLabel);
</script>

<template>
  <Badge
    :variant="config.variant"
    :size="size"
    :dot="showDot"
    :pulse="config.pulse"
    :icon="showIcon ? config.icon : null"
  >
    {{ displayLabel }}
  </Badge>
</template>