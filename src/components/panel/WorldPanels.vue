<script setup>
/**
 * Aiguillage des panneaux du mode aventure.
 *
 * Les sections classiques restent dans la page — ce sont elles qui sont pré-rendues et indexées.
 * Ces panneaux sont une seconde présentation des mêmes informations, écrite pour un panneau posé
 * sur un monde : une seule chose à la fois, une mise en page qui tient dans un cadre, et le
 * vocabulaire du jeu plutôt que celui d'une page de site.
 *
 * Rien n'est rendu tant que le mode aventure n'est pas actif, donc rien ne diverge entre le HTML
 * du serveur et le premier rendu du navigateur.
 */
import { useI18n } from 'vue-i18n'
import HeroPanel from './HeroPanel.vue'
import AboutPanel from './AboutPanel.vue'
import SkillsPanel from './SkillsPanel.vue'
import ProjectsPanel from './ProjectsPanel.vue'
import BannerPanel from './BannerPanel.vue'
import CampPanel from './CampPanel.vue'
import QuestHeader from '@/components/game/QuestHeader.vue'
import { useGame } from '@/composables/useGame'
import { useWorld } from '@/composables/useWorld'

const { worldActive } = useGame()
const { activeId } = useWorld()
const { t } = useI18n()

const PANELS = {
  hero: HeroPanel,
  about: AboutPanel,
  skills: SkillsPanel,
  projects: ProjectsPanel,
  banner: BannerPanel,
  footer: CampPanel,
}

// Les lieux qui portent une quête l'annoncent en tête de panneau.
const QUEST_PLACES = new Set(['hero', 'about', 'skills', 'projects'])
</script>

<template>
  <div v-if="worldActive" class="world-panels">
    <QuestHeader v-if="QUEST_PLACES.has(activeId)" :id="activeId" />
    <component :is="PANELS[activeId]" :key="activeId" />
    <p class="sr-only" role="status" aria-live="polite">{{ t(`game.places.${activeId}`) }}</p>
  </div>
</template>
