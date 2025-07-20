<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Languages, Menu } from 'lucide-vue-next'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

import ThemeToggle from './components/ThemeToggle.vue'
import HeroSection from './components/section/HeroSection.vue'
import AboutSection from './components/section/AboutSection.vue'
import SkillsSection from './components/section/SkillsSection.vue'
import ProjectsSection from './components/section/ProjectsSection.vue'
import SoftBannerSection from './components/section/SoftBannerSection.vue'
import Footer from './components/section/FooterSection.vue'

const isDark = ref(false)
const showMenu = ref(false)

const applyTheme = (dark) => {
  document.documentElement.classList.toggle('dark', dark)
  isDark.value = dark
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => applyTheme(!isDark.value)

onMounted(() => {
  const saved = localStorage.getItem('theme')
  applyTheme(saved === 'dark')

  nextTick(() => {
    // Animation du header
    gsap.from('nav', {
      opacity: 0,
      y: -40,
      duration: 1,
      ease: 'power2.out',
    })

    // Animation des sections au scroll
    gsap.utils.toArray('section').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power2.out',
      })
    })

    // Animation menu mobile
    gsap.from('.mobile-menu a', {
      opacity: 0,
      y: -10,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.mobile-menu',
        start: 'top 100%',
      },
    })
  })
})

const { locale } = useI18n()

const toggleLang = () => {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('lang', locale.value)
}
</script>

<template>
  <div class="min-h-screen bg-background text-text transition-colors duration-300">
    <nav class="flex items-center justify-between px-6 py-4 sm:px-8">
      <div class="text-xl sm:text-4xl font-bold text-primary">
        {{ $t('brand') }}
      </div>

      <ul class="hidden md:flex gap-6 text-sm">
        <li>
          <a href="#" class="hover:underline font-semibold">{{ $t('nav.home') }}</a>
        </li>
        <li>
          <a href="#about" class="hover:underline font-semibold">{{ $t('nav.about') }}</a>
        </li>
        <li>
          <a href="#skills" class="hover:underline font-semibold">{{ $t('nav.skills') }}</a>
        </li>
        <li>
          <a href="#projects" class="hover:underline font-semibold">{{ $t('nav.projects') }}</a>
        </li>
      </ul>

      <div class="flex items-center gap-4">
        <button
          @click="toggleLang"
          class="hidden md:inline-flex p-2 rounded-full cursor-pointer border border-primary text-primary hover:bg-muted transition"
          :aria-label="locale === 'fr' ? 'Passer à l’anglais' : 'Switch to French'"
        >
          <Languages class="w-5 h-5" />
        </button>

        <div class="md:hidden">
          <Menu @click="showMenu = !showMenu" class="w-6 h-6 cursor-pointer" />
        </div>

        <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
      </div>
    </nav>

    <div
      v-if="showMenu"
      class="mobile-menu md:hidden flex flex-col gap-4 text-center py-4 border-t border-muted text-sm"
    >
      <a href="#" @click="showMenu = false" class="hover:underline font-semibold">{{
        $t('nav.home')
      }}</a>
      <a href="#about" @click="showMenu = false" class="hover:underline font-semibold">{{
        $t('nav.about')
      }}</a>
      <a href="#skills" @click="showMenu = false" class="hover:underline font-semibold">{{
        $t('nav.skills')
      }}</a>
      <a href="#projects" @click="showMenu = false" class="hover:underline font-semibold">{{
        $t('nav.projects')
      }}</a>
      <a href="#contact" @click="showMenu = false" class="hover:underline font-semibold">{{
        $t('nav.contact')
      }}</a>
    </div>

    <button
      @click="toggleLang"
      class="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full border border-primary bg-background text-primary shadow hover:bg-muted transition"
      :aria-label="locale === 'fr' ? 'Passer à l’anglais' : 'Switch to French'"
    >
      <Languages class="w-5 h-5" />
    </button>

    <HeroSection />
    <AboutSection />
    <SkillsSection />
    <ProjectsSection />
    <SoftBannerSection />
    <Footer />
  </div>
</template>
