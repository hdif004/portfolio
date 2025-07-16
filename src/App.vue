<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import ThemeToggle from './components/ThemeToggle.vue'
import HeroSection from './components/section/HeroSection.vue'
import AboutSection from './components/section/AboutSection.vue'
import SkillsSection from './components/section/SkillsSection.vue'
import ProjectsSection from './components/section/ProjectsSection.vue'
import ContactSection from './components/section/ContactSection.vue'
import Footer from './components/section/FooterSection.vue'

const isDark = ref(false)

const applyTheme = (dark) => {
  document.documentElement.classList.toggle('dark', dark)
  isDark.value = dark
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => applyTheme(!isDark.value)

onMounted(() => {
  const saved = localStorage.getItem('theme')
  applyTheme(saved === 'dark')
})

// Langue avec vue-i18n
const { locale } = useI18n()

const toggleLang = () => {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('lang', locale.value)
}
</script>

<template>
  <div class="min-h-screen bg-background text-text transition-colors duration-300">
    <!-- Navbar -->
    <nav class="flex items-center justify-between px-8 py-4">
      <div class="text-xl font-bold text-primary">{{ $t('brand') }}</div>
      <ul class="flex gap-6 text-sm">
        <li>
          <a href="#" class="hover:underline">{{ $t('nav.home') }}</a>
        </li>
        <li>
          <a href="#about" class="hover:underline">{{ $t('nav.about') }}</a>
        </li>
        <li>
          <a href="#skills" class="hover:underline">{{ $t('nav.skills') }}</a>
        </li>
        <li>
          <a href="#projects" class="hover:underline">{{ $t('nav.projects') }}</a>
        </li>
        <li>
          <a href="#contact" class="hover:underline">{{ $t('nav.contact') }}</a>
        </li>
      </ul>
      <div class="flex items-center gap-4">
        <button @click="toggleLang" class="text-sm border px-2 py-1 rounded hover:bg-muted">
          {{ locale === 'fr' ? 'EN' : 'FR' }}
        </button>
        <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
      </div>
    </nav>

    <!-- Sections -->
    <HeroSection />
    <AboutSection />
    <SkillsSection />
    <ProjectsSection />
    <ContactSection />
    <Footer />
  </div>
</template>
