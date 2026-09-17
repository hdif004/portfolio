<script setup>
import { computed } from 'vue'

/**
 * Icône de batterie des mockups. `level` (0 à 1) vient de useBattery ; sans information,
 * la jauge reste à un niveau fixe. Vert en charge, rouge sous 20 %.
 */
const props = defineProps({
  level: { type: Number, default: null },
  charging: { type: Boolean, default: false },
})

const FALLBACK_LEVEL = 0.8
const INNER_WIDTH = 17.2

const fillWidth = computed(() => Math.max(1.5, INNER_WIDTH * (props.level ?? FALLBACK_LEVEL)))

const fillColor = computed(() => {
  if (props.level === null) return 'currentColor'
  if (props.charging) return '#34c759'
  return props.level <= 0.2 ? '#ff453a' : 'currentColor'
})
</script>

<template>
  <svg viewBox="0 0 26 12" aria-hidden="true">
    <rect x="0.6" y="0.6" width="21.8" height="10.8" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.5" />
    <rect x="2.4" y="2.4" :width="fillWidth" height="7.2" rx="1.6" :fill="fillColor" />
    <path d="M24 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.5" />
    <path v-if="charging" d="M12.6 1.2 7.4 6.6h3.4l-1.4 4.2 5.2-5.4h-3.4z" fill="#fff" stroke="#1b1b1b" stroke-width="0.6" stroke-linejoin="round" />
  </svg>
</template>
