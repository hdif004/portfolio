<script setup>
/**
 * La bifurcation : l'appel à l'action, réduit à un choix.
 *
 * Un panneau indicateur ne raconte rien — il indique. Le contenu est donc tenu au minimum : une
 * question, une promesse de délai, un bouton.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Mail } from 'lucide-vue-next'
import { mailtoHref } from '@/game/contact'
import { useGame } from '@/composables/useGame'

const { t } = useI18n()
const { completeQuest } = useGame()

const mailHref = computed(() => mailtoHref(t('mail.subject')))
</script>

<template>
  <div class="gp gp-centered">
    <h2 class="gp-title">{{ t('banner.title') }}</h2>
    <p class="gp-lead">{{ t('banner.subtitle') }}</p>

    <div class="gp-actions is-centered">
      <a :href="mailHref" class="gp-button is-primary is-big" @click="completeQuest('contact')">
        <Mail class="h-4 w-4" aria-hidden="true" />
        {{ t('banner.button') }}
      </a>
    </div>
  </div>
</template>
