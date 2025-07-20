<script setup>
import { onMounted } from 'vue'
import { gsap } from 'gsap'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

onMounted(() => {
  gsap.from('.hero-text', {
    x: -60,
    opacity: 0,
    duration: 1,
    ease: 'power2.out',
  })

  gsap.from('.hero-img', {
    x: 60,
    opacity: 0,
    duration: 1,
    delay: 0.3,
    ease: 'power2.out',
  })
})
</script>

<template>
  <section
    class="flex flex-col-reverse md:flex-row items-center justify-between px-8 py-16 md:py-24 gap-12 w-10/12 mx-auto"
  >
    <!-- Texte -->
    <div class="hero-text text-left space-y-6 max-w-xl">
      <h1 class="text-5xl font-extrabold leading-tight">
        {{ t('hero.greeting') }}
        <span class="text-primary">{{ t('hero.name') }}</span
        ><br />
        {{ t('hero.title') }}
      </h1>
      <p class="text-lg text-text/80">
        {{ t('hero.desc') }}
      </p>

      <div class="flex flex-wrap gap-4">
        <!-- GitHub -->
        <a
          href="https://github.com/hdif004"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition"
        >
          {{ t('hero.github') }}
        </a>

        <!-- Bouton de téléchargement de CV -->
        <a
          href="/assets/CV.pdf"
          download
          class="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-md font-semibold hover:bg-primary/10 transition"
        >
          {{ t('hero.cv') || 'Télécharger mon CV' }}
        </a>
      </div>
    </div>

    <!-- Image -->
    <div class="hero-img">
      <img src="/src/assets/images/hero.png" :alt="t('hero.imageAlt')" />
    </div>
  </section>
</template>
