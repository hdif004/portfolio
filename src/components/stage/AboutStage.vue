<script setup>
/**
 * Mon histoire : trois parchemins plantés autour de l'abri, un par étape.
 *
 * L'ordre compte — c'est une suite, pas trois options —, d'où les chiffres romains et l'apparition
 * l'un après l'autre.
 */
import { useI18n } from 'vue-i18n'
import WorldPin from '@/components/world/WorldPin.vue'

const { t } = useI18n()

const STEPS = [
  { anchor: 'shelter', offset: [-380, -150], numeral: 'I' },
  { anchor: 'chest', offset: [400, -70], numeral: 'II' },
  { anchor: 'stump', offset: [-320, 190], numeral: 'III' },
]
</script>

<template>
  <WorldPin
    v-for="(step, index) in STEPS"
    :key="step.numeral"
    place="about"
    :anchor="step.anchor"
    :offset="step.offset"
    variant="parchment"
  >
    <p v-if="index === 0" class="stage-kicker">{{ t('about.title') }}</p>
    <div class="stage-step">
      <span class="stage-numeral" aria-hidden="true">{{ step.numeral }}</span>
      <div>
        <h3 class="stage-title">{{ t(`about.steps[${index}].label`) }}</h3>
        <p class="stage-text">{{ t(`about.steps[${index}].text`) }}</p>
      </div>
    </div>
  </WorldPin>
</template>
