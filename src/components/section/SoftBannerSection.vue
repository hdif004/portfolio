<template>
  <section class="bg-secondary/10 text-center py-12 px-6">
    <div class="max-w-3xl mx-auto space-y-4">
      <p class="text-2xl md:text-3xl font-semibold text-primary">
        {{ t('banner.title') }}
      </p>
      <p class="text-text/80 text-base md:text-lg">
        {{ t('banner.subtitle') }}
      </p>
      <a
        href="#footer"
        class="inline-block mt-4 px-6 py-3 border border-primary rounded-md text-primary font-medium hover:bg-primary/10 transition"
      >
        {{ t('banner.button') }}
      </a>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
