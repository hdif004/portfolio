<script setup>
/**
 * L'atelier : la méthode de travail, présentée comme un carnet.
 *
 * La section classique aligne trois cartes côte à côte, ce qui se lit comme trois options
 * équivalentes. Ici les trois étapes sont empilées et reliées : c'est une suite, et l'ordre est
 * précisément ce que le visiteur a besoin de comprendre.
 */
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const steps = [0, 1, 2]
const NUMERALS = ['I', 'II', 'III']
</script>

<template>
  <div class="gp">
    <h2 class="gp-title">{{ t('about.title') }}</h2>

    <ol class="gp-steps">
      <li v-for="(step, index) in steps" :key="step" class="gp-step">
        <span class="gp-step-mark" aria-hidden="true">{{ NUMERALS[index] }}</span>
        <div>
          <h3 class="gp-step-label">{{ t(`about.steps[${step}].label`) }}</h3>
          <p class="gp-step-text">{{ t(`about.steps[${step}].text`) }}</p>
        </div>
      </li>
    </ol>
  </div>
</template>
