<script setup>
/**
 * Le point de départ : la réplique du personnage.
 *
 * C'est une bulle de dialogue, pas une section de page. Le hero classique met l'illustration à
 * côté du texte ; ici l'illustration est le personnage 3D derrière la bulle, et le panneau ne
 * garde que ce qu'il dit. Même contenu, autre situation de lecture.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, Download, Github, Mail } from 'lucide-vue-next'
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
  <div class="gp gp-dialogue">
    <p class="gp-speaker">
      <span class="gp-speaker-name">{{ t('hero.name') }}</span>
      <span class="gp-speaker-role">{{ t('hero.title') }}</span>
    </p>

    <p class="gp-status">
      <span class="gp-status-dot" aria-hidden="true"></span>
      {{ t('hero.available') }}
    </p>

    <p class="gp-line gp-line-lead">{{ t('hero.offers') }}</p>
    <p class="gp-line">{{ t('hero.desc') }}</p>

    <div class="gp-actions">
      <a :href="mailHref" class="gp-button is-primary" @click="completeQuest('contact')">
        <Mail class="h-4 w-4" aria-hidden="true" />
        {{ t('hero.ctaPrimary') }}
      </a>

      <button type="button" class="gp-button" @click="openPlace('projects')">
        <ArrowRight class="h-4 w-4" aria-hidden="true" />
        {{ t('hero.ctaSecondary') }}
      </button>
    </div>

    <p class="gp-links">
      <a href="https://github.com/hdif004" target="_blank" rel="noopener noreferrer">
        <Github class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t('hero.github') }}
      </a>
      <a :href="cvUrl" download>
        <Download class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t('hero.cv') }}
      </a>
    </p>
  </div>
</template>
