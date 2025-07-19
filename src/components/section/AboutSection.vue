<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section id="about" class="py-20 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-14 text-primary">{{ t('about.title') }}</h2>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Step 1 -->
      <div
        class="bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative group transition-colors duration-300"
      >
        <div
          class="absolute -left-3 top-6 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
        >
          1
        </div>
        <h3 class="text-xl font-semibold text-primary mb-2">{{ t('about.steps[0].label') }}</h3>
        <p class="text-card text-base transition-colors duration-300">
          {{ t('about.steps[0].text') }}
        </p>
      </div>

      <!-- Step 2 -->
      <div
        class="bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative group transition-colors duration-300"
      >
        <div
          class="absolute -left-3 top-6 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
        >
          2
        </div>
        <h3 class="text-xl font-semibold text-primary mb-2">{{ t('about.steps[1].label') }}</h3>
        <p class="text-card text-base transition-colors duration-300">
          {{ t('about.steps[1].text') }}
        </p>
      </div>

      <!-- Step 3 -->
      <div
        class="bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative group transition-colors duration-300"
      >
        <div
          class="absolute -left-3 top-6 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
        >
          3
        </div>
        <h3 class="text-xl font-semibold text-primary mb-2">{{ t('about.steps[2].label') }}</h3>
        <p class="text-text text-base transition-colors duration-300">
          {{ t('about.steps[2].text') }}
        </p>
      </div>
    </div>
  </section>
</template>
