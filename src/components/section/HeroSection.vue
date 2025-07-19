<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section
    class="flex flex-col-reverse md:flex-row items-center justify-between px-8 py-16 md:py-24 gap-12 w-10/12 mx-auto"
  >
    <!-- Texte -->
    <div class="text-left space-y-6 max-w-xl">
      <h1 class="text-5xl font-extrabold leading-tight">
        {{ t('hero.greeting') }} <span class="text-primary">{{ t('hero.name') }}</span
        ><br />
        {{ t('hero.title') }}
      </h1>
      <p class="text-lg text-text/80">
        {{ t('hero.desc') }}
      </p>
      <a
        href="https://github.com/hdif004"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition"
      >
        {{ t('hero.github') }}
      </a>
    </div>

    <!-- Image -->
    <div>
      <img src="/src/assets/images/hero.png" :alt="t('hero.imageAlt')" />
    </div>
  </section>
</template>
