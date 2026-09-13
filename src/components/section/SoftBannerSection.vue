<template>
  <section id="banner" class="bg-surface text-center py-12 px-6">
    <div class="max-w-3xl mx-auto space-y-4">
      <p class="text-2xl md:text-3xl font-semibold text-primary">
        {{ t('banner.title') }}
      </p>
      <p class="text-text-muted text-base md:text-lg">
        {{ t('banner.subtitle') }}
      </p>
      <a
        :href="mailHref"
        class="inline-block mt-4 px-6 py-3 border border-primary rounded-md text-primary font-medium hover:bg-primary/10 transition"
        @click="completeQuest('contact')"
      >
        {{ t('banner.button') }}
      </a>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mailtoHref } from '@/game/contact'
import { useGame } from '@/composables/useGame'

const { t } = useI18n()
const { completeQuest } = useGame()

const mailHref = computed(() => mailtoHref(t('mail.subject')))
</script>
