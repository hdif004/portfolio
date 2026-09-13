<script setup>
/**
 * Le campement : l'avatar accueille le visiteur.
 *
 * Sa réplique est une bulle au-dessus de lui ; les actions sont des planches plantées autour du feu.
 * « Voir mes réalisations » ne change pas d'écran : la caméra survole la forêt jusqu'au chantier.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, Download, Github, Mail } from 'lucide-vue-next'
import WorldPin from '@/components/world/WorldPin.vue'
import { mailtoHref } from '@/game/contact'
import { useGame } from '@/composables/useGame'
import { useWorld } from '@/composables/useWorld'

const { t } = useI18n()
const { completeQuest } = useGame()
const { openPlace } = useWorld()

const cvUrl = `${import.meta.env.BASE_URL}CV.pdf`
const mailHref = computed(() => mailtoHref(t('mail.subject')))
</script>

<template>
  <WorldPin place="hero" anchor="avatar" :offset="[-400, -60]" variant="bubble">
    <p class="stage-kicker">{{ t('hero.title') }}</p>
    <h2 class="stage-title">{{ t('hero.name') }}</h2>
    <p class="stage-status">
      <span class="stage-status-dot" aria-hidden="true"></span>
      {{ t('hero.available') }}
    </p>
    <p class="stage-lead">{{ t('hero.offers') }}</p>
    <p class="stage-text">{{ t('hero.desc') }}</p>
  </WorldPin>

  <WorldPin place="hero" anchor="fire" :offset="[330, -150]" variant="plank">
    <a :href="mailHref" class="stage-action" @click="completeQuest('contact')">
      <Mail class="h-4 w-4" aria-hidden="true" />
      {{ t('hero.ctaPrimary') }}
    </a>
  </WorldPin>

  <WorldPin place="hero" anchor="tent" :offset="[-260, 190]" variant="plank">
    <button type="button" class="stage-action" @click="openPlace('projects')">
      <ArrowRight class="h-4 w-4" aria-hidden="true" />
      {{ t('hero.ctaSecondary') }}
    </button>
  </WorldPin>

  <WorldPin place="hero" anchor="logs" :offset="[300, 150]" variant="tag">
    <p class="stage-links">
      <a href="https://github.com/hdif004" target="_blank" rel="noopener noreferrer">
        <Github class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t('hero.github') }}
      </a>
      <a :href="cvUrl" download>
        <Download class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t('hero.cv') }}
      </a>
    </p>
  </WorldPin>
</template>
