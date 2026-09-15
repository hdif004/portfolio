<script setup>
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()
</script>

<template>
  <section id="about" class="py-16 px-6 w-10/12 mx-auto">
    <div class="grid md:grid-cols-5 gap-10 md:gap-16">
      <!-- Présentation courte -->
      <div class="md:col-span-2 space-y-4">
        <h2 class="text-3xl font-bold text-primary">{{ t('about.title') }}</h2>
        <p class="text-lg text-text">{{ t('about.intro') }}</p>
      </div>

      <!-- Parcours daté -->
      <ol class="md:col-span-3 relative border-l-2 border-primary-fill ml-2">
        <li
          v-for="(_, index) in tm('about.timeline')"
          :key="index"
          v-reveal="{ delay: index * 80 }"
          class="relative pl-8 pb-8 last:pb-0"
        >
          <span
            class="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-background bg-primary-fill"
            aria-hidden="true"
          ></span>
          <p class="text-sm font-medium text-text-muted">{{ t(`about.timeline[${index}].date`) }}</p>
          <h3 class="text-lg font-semibold text-primary">
            {{ t(`about.timeline[${index}].role`) }}
            <span class="font-normal text-text">· {{ t(`about.timeline[${index}].place`) }}</span>
          </h3>
          <p class="text-text-muted">{{ t(`about.timeline[${index}].text`) }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
