<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const steps = [0, 1, 2]
</script>

<template>
  <section id="about" class="py-16 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-10 text-primary">{{ t('about.title') }}</h2>

    <div class="grid md:grid-cols-3 gap-8">
      <div
        v-for="(step, index) in steps"
        :key="step"
        v-reveal="{ delay: index * 100 }"
        class="about-step bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative transition-colors duration-300"
      >
        <div
          class="absolute -left-3 top-6 bg-primary-strong text-on-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
          aria-hidden="true"
        >
          {{ index + 1 }}
        </div>
        <h3 class="text-xl font-semibold text-primary mb-2">
          {{ t(`about.steps[${step}].label`) }}
        </h3>
        <p class="text-card-text text-base">
          {{ t(`about.steps[${step}].text`) }}
        </p>
      </div>
    </div>
  </section>
</template>
