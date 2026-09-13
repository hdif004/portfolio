<script setup>
import { computed, defineAsyncComponent, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Languages, Menu, X, MessageCircle } from 'lucide-vue-next'

import ThemeToggle from './components/ThemeToggle.vue'
import ModeToggle from './components/game/ModeToggle.vue'
import QuestJournal from './components/game/QuestJournal.vue'
import AchievementToast from './components/game/AchievementToast.vue'
import WorldScene from './components/world/WorldScene.vue'
import WorldMarkers from './components/game/WorldMarkers.vue'
import HeroSection from './components/section/HeroSection.vue'
import AboutSection from './components/section/AboutSection.vue'
import SkillsSection from './components/section/SkillsSection.vue'
import ProjectsSection from './components/section/ProjectsSection.vue'
import SoftBannerSection from './components/section/SoftBannerSection.vue'
import Footer from './components/section/FooterSection.vue'
import { hydrateGame, useGame } from './composables/useGame'
import { initWorld } from './composables/useWorld'
import { mailtoHref } from './game/contact'

// Chargé à la demande : GSAP et le contenu des zones ne servent qu'en mode aventure.
const WorldStage = defineAsyncComponent(() => import('./components/world/WorldStage.vue'))

const isDark = ref(false)
const showMenu = ref(false)

const { t, locale } = useI18n()
const { unlockBadge, completeQuest, worldActive } = useGame()

/**
 * Le formulaire de contact a été retiré : écrire passe désormais par le client mail du visiteur,
 * avec un objet pré-rempli. Un seul chemin, aucune étape intermédiaire.
 */
const mailHref = computed(() => mailtoHref(t('mail.subject')))

/** Écrire est la dernière quête : c'est le seul geste du site qui engage vraiment le visiteur. */
const onContactClick = () => completeQuest('contact')

const onMobileContactClick = () => {
  showMenu.value = false
  onContactClick()
}

const applyTheme = (dark) => {
  document.documentElement.classList.toggle('dark', dark)
  isDark.value = dark
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
  applyTheme(!isDark.value)
  if (isDark.value) unlockBadge('darkMode')
}

const toggleLang = () => {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('lang', locale.value)
  unlockBadge('polyglot')
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
  hydrateGame()
  initWorld()
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

    <nav id="site-nav" class="mx-auto flex w-11/12 items-center justify-between py-2.5 sm:px-8">
      <a href="#hero" class="text-lg font-bold text-primary sm:text-2xl">{{ t('brand') }}</a>

      <ul class="site-links hidden md:flex gap-6 text-sm">
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
          <a :href="mailHref" class="hover:underline font-semibold" @click="onContactClick">
            {{ t('nav.contact') }}
          </a>
        </li>
      </ul>

      <div class="flex items-center gap-4">
        <ModeToggle class="hidden md:inline-flex" />

        <button
          @click="toggleLang"
          class="hidden md:inline-flex p-2 rounded-full cursor-pointer border border-primary text-primary hover:bg-muted transition"
          :aria-label="locale === 'fr' ? 'Passer à l’anglais' : 'Switch to French'"
        >
          <Languages class="w-5 h-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="menu-toggle md:hidden p-2 -m-2 text-text"
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
      <a
        :href="mailHref"
        class="hover:underline font-semibold"
        @click="onMobileContactClick"
        >{{ t('nav.contact') }}</a
      >
      <button
        type="button"
        class="mx-auto inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-primary"
        @click="toggleLang"
      >
        <Languages class="w-4 h-4" aria-hidden="true" />
        {{ locale === 'fr' ? 'English' : 'Français' }}
      </button>

      <ModeToggle variant="full" />
    </div>

    <!-- Raccourci mobile : la position la plus visible sert à convertir, pas à changer de langue.
         En mode aventure, la barre de navigation du monde occupe déjà le bas de l'écran. -->
    <a
      :href="mailHref"
      class="contact-shortcut md:hidden fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-primary-strong px-5 py-3 font-semibold text-on-primary shadow-lg"
      :aria-label="t('a11y.contactShortcut')"
      @click="onContactClick"
    >
      <MessageCircle class="w-5 h-5" aria-hidden="true" />
      {{ t('nav.contact') }}
    </a>

    <!-- Le monde : rendu en permanence en mode aventure, derrière le contenu. -->
    <WorldScene />
    <WorldMarkers />
    <!-- Le contenu des zones, déployé dans la scène elle-même. -->
    <WorldStage />

    <!--
      La page classique. En mode aventure elle est masquée : le contenu vit dans le monde (voir
      `WorldStage`). Le DOM ne change pas d'un mode à l'autre — seules des classes s'ajoutent.
    -->
    <div id="world-panel" :inert="worldActive">

      <!-- La page classique. En mode aventure elle est masquée au profit des panneaux ci-dessus,
           mais elle reste le contenu pré-rendu : c'est elle que voient les moteurs de recherche
           et un visiteur sans JavaScript. -->
      <main id="main">
        <HeroSection />
        <AboutSection v-reveal />
        <SkillsSection v-reveal />
        <ProjectsSection v-reveal />
        <SoftBannerSection v-reveal />
      </main>
      <Footer />
    </div>

    <!-- Couche jeu : ajoutée par-dessus le contenu, jamais entre le visiteur et le contenu. -->
    <QuestJournal />
    <AchievementToast />
  </div>
</template>
