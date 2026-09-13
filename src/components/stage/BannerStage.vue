<script setup>
/**
 * La bifurcation : une planche clouée en haut du poteau indicateur. Une question, un délai, un bouton.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Mail } from 'lucide-vue-next'
import WorldPin from '@/components/world/WorldPin.vue'
import { mailtoHref } from '@/game/contact'
import { useGame } from '@/composables/useGame'

const { t } = useI18n()
const { completeQuest } = useGame()

const mailHref = computed(() => mailtoHref(t('mail.subject')))
</script>

<template>
  <WorldPin place="banner" anchor="sign" :offset="[0, -200]" variant="plank">
    <div class="stage-centered">
      <h2 class="stage-title">{{ t('banner.title') }}</h2>
      <p class="stage-text">{{ t('banner.subtitle') }}</p>
      <a :href="mailHref" class="stage-button" @click="completeQuest('contact')">
        <Mail class="h-4 w-4" aria-hidden="true" />
        {{ t('banner.button') }}
      </a>
    </div>
  </WorldPin>
</template>
