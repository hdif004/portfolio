<script setup>
/**
 * Projets : les cartes jaillissent des caisses du chantier.
 *
 * La grande caisse contient les missions clients, la caisse ouverte les projets personnels — la
 * distinction compte pour un prospect. Chaque carte est compacte (titre, technos) et se déplie au
 * clic pour la description et le lien, qui sont la vraie preuve.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ExternalLink, Minus, Plus } from 'lucide-vue-next'
import WorldPin from '@/components/world/WorldPin.vue'
import { PROJECT_ITEMS } from '@/data/projects'

const { t } = useI18n()

/** Emplacements des cartes autour de leur caisse, en pixels pour un écran large. */
const SLOTS = {
  pro: [
    [-520, -170],
    [-520, 0],
    [-520, 170],
    [330, -170],
    [330, 0],
    [330, 170],
  ],
  perso: [
    [-130, -235],
    [170, -235],
  ],
}

const CRATES = { pro: 'crateLarge', perso: 'crateOpen' }

const used = { pro: 0, perso: 0 }
const cards = PROJECT_ITEMS.map((project, index) => {
  const slots = SLOTS[project.tab]
  const offset = slots[used[project.tab]++ % slots.length]
  return { project, index, anchor: CRATES[project.tab], offset }
})

const count = (tab) => PROJECT_ITEMS.filter((project) => project.tab === tab).length

const expanded = ref(null)
const toggle = (index) => (expanded.value = expanded.value === index ? null : index)
</script>

<template>
  <WorldPin place="projects" anchor="crateLarge" :offset="[0, 80]" variant="tag">
    <p class="stage-kicker">{{ t('projects.tabs.pro') }} · {{ count('pro') }}</p>
  </WorldPin>

  <WorldPin place="projects" anchor="crateOpen" :offset="[170, 20]" variant="tag">
    <p class="stage-kicker">{{ t('projects.tabs.perso') }} · {{ count('perso') }}</p>
  </WorldPin>

  <WorldPin
    v-for="card in cards"
    :key="card.project.titleKey"
    place="projects"
    :anchor="card.anchor"
    :offset="card.offset"
    variant="card"
    emerge
    :class="{ 'is-raised': expanded === card.index }"
  >
    <p class="stage-kicker">{{ String(card.index + 1).padStart(2, '0') }}</p>
    <h3 class="stage-title">{{ t(card.project.titleKey) }}</h3>

    <ul class="stage-chips">
      <li v-for="tech in card.project.technos.slice(0, 3)" :key="tech" class="stage-chip">
        {{ tech }}
      </li>
    </ul>

    <div v-if="expanded === card.index" class="stage-details">
      <p class="stage-text">{{ t(card.project.descKey) }}</p>
      <a :href="card.project.link" target="_blank" rel="noopener noreferrer" class="stage-link">
        <ExternalLink class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t(card.project.linkKey || 'projects.view') }}
        <span class="sr-only">— {{ t(card.project.titleKey) }}</span>
      </a>
    </div>

    <button
      type="button"
      class="stage-more"
      :aria-expanded="expanded === card.index"
      @click="toggle(card.index)"
    >
      <component :is="expanded === card.index ? Minus : Plus" class="h-3.5 w-3.5" aria-hidden="true" />
      <span class="sr-only">{{ t(card.project.titleKey) }}</span>
    </button>
  </WorldPin>
</template>
