<script setup>
import { onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  nextTick(() => {
    gsap.utils.toArray('.about-step').forEach((el, index) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power2.out',
      })
    })
  })
})
</script>

<template>
  <section id="about" class="py-16 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-10 text-primary">{{ t('about.title') }}</h2>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Step 1 -->
      <div
        class="about-step bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative group transition-colors duration-300"
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
        class="about-step bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative group transition-colors duration-300"
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
        class="about-step bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative group transition-colors duration-300"
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
