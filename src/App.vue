<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Languages, Menu, X, MessageCircle } from 'lucide-vue-next'

import ThemeToggle from './components/ThemeToggle.vue'
import HeroSection from './components/section/HeroSection.vue'
import AboutSection from './components/section/AboutSection.vue'
import SkillsSection from './components/section/SkillsSection.vue'
import ProjectsSection from './components/section/ProjectsSection.vue'
import SoftBannerSection from './components/section/SoftBannerSection.vue'
import ContactSection from './components/section/ContactSection.vue'
import Footer from './components/section/FooterSection.vue'

const isDark = ref(false)
const showMenu = ref(false)

const { t, locale } = useI18n()

const applyTheme = (dark) => {
  document.documentElement.classList.toggle('dark', dark)
  isDark.value = dark
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => applyTheme(!isDark.value)

const toggleLang = () => {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('lang', locale.value)
}

// L'attribut lang doit suivre la langue affichée (crawlers + lecteurs d'écran).
// Garde `typeof document` : ce composant est aussi rendu côté serveur au moment du pré-rendu.
watch(
  locale,
  (value) => {
    if (typeof document !== 'undefined') document.documentElement.lang = value
  },
  { immediate: true },
)

onMounted(() => {
  const saved = localStorage.getItem('theme')
  applyTheme(saved === 'dark')
})
</script>

<template>
  <div class="min-h-screen bg-background text-text transition-colors duration-300">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary-strong focus:px-4 focus:py-2 focus:text-on-primary"
    >
      {{ t('a11y.skipToContent') }}
    </a>

    <nav class="flex items-center justify-between w-11/12 mx-auto py-4 sm:px-8">
      <a href="#hero" class="text-xl sm:text-3xl font-bold text-primary"> Hudayfa Koujdal </a>

      <ul class="hidden md:flex gap-6 text-sm">
        <li>
          <a href="#hero" class="hover:underline font-semibold">{{ t('nav.home') }}</a>
        </li>
        <li>
          <a href="#about" class="hover:underline font-semibold">{{ t('nav.about') }}</a>
        </li>
        <li>
          <a href="#skills" class="hover:underline font-semibold">{{ t('nav.skills') }}</a>
        </li>
        <li>
          <a href="#projects" class="hover:underline font-semibold">{{ t('nav.projects') }}</a>
        </li>
        <li>
          <a href="#contact" class="hover:underline font-semibold">{{ t('nav.contact') }}</a>
        </li>
      </ul>

      <div class="flex items-center gap-4">
        <button
          @click="toggleLang"
          class="hidden md:inline-flex p-2 rounded-full cursor-pointer border border-primary text-primary hover:bg-muted transition"
          :aria-label="locale === 'fr' ? 'Passer à l’anglais' : 'Switch to French'"
        >
          <Languages class="w-5 h-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="md:hidden p-2 -m-2 text-text"
          :aria-expanded="showMenu"
          aria-controls="mobile-menu"
          :aria-label="showMenu ? t('a11y.closeMenu') : t('a11y.openMenu')"
          @click="showMenu = !showMenu"
        >
          <X v-if="showMenu" class="w-6 h-6" aria-hidden="true" />
          <Menu v-else class="w-6 h-6" aria-hidden="true" />
        </button>

        <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
      </div>
    </nav>

    <div
      v-show="showMenu"
      id="mobile-menu"
      class="mobile-menu md:hidden flex flex-col gap-4 text-center py-4 border-t border-muted text-sm"
    >
      <a href="#hero" @click="showMenu = false" class="hover:underline font-semibold">{{
        t('nav.home')
      }}</a>
      <a href="#about" @click="showMenu = false" class="hover:underline font-semibold">{{
        t('nav.about')
      }}</a>
      <a href="#skills" @click="showMenu = false" class="hover:underline font-semibold">{{
        t('nav.skills')
      }}</a>
      <a href="#projects" @click="showMenu = false" class="hover:underline font-semibold">{{
        t('nav.projects')
      }}</a>
      <a href="#contact" @click="showMenu = false" class="hover:underline font-semibold">{{
        t('nav.contact')
      }}</a>
      <button
        type="button"
        class="mx-auto inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-primary"
        @click="toggleLang"
      >
        <Languages class="w-4 h-4" aria-hidden="true" />
        {{ locale === 'fr' ? 'English' : 'Français' }}
      </button>
    </div>

    <!-- Raccourci mobile : la position la plus visible sert à convertir, pas à changer de langue. -->
    <a
      href="#contact"
      class="md:hidden fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-primary-strong px-5 py-3 font-semibold text-on-primary shadow-lg"
      :aria-label="t('a11y.contactShortcut')"
    >
      <MessageCircle class="w-5 h-5" aria-hidden="true" />
      {{ t('nav.contact') }}
    </a>

    <main id="main">
      <HeroSection />
      <AboutSection v-reveal />
      <SkillsSection v-reveal />
      <ProjectsSection v-reveal />
      <SoftBannerSection v-reveal />
      <ContactSection v-reveal />
    </main>
    <Footer />
  </div>
</template>
