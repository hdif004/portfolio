<script setup>
/**
 * Le chantier : les réalisations en tableau de hauts faits.
 *
 * La section classique affiche une grille de cartes avec une vidéo intégrée par projet. Ici les
 * réalisations sont une liste numérotée : sur un panneau, huit cartes côte à côte deviennent
 * illisibles, et huit lecteurs vidéo chargés d'un coup coûtent bien plus que ce qu'ils apportent.
 * Chaque ligne reste cliquable vers le site ou le dépôt, qui sont la vraie preuve.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ExternalLink } from 'lucide-vue-next'
import { PROJECT_ITEMS } from '@/data/projects'

const { t } = useI18n()

const FILTERS = [
  { id: 'all', labelKey: 'projects.tabs.all' },
  { id: 'pro', labelKey: 'projects.tabs.pro' },
  { id: 'perso', labelKey: 'projects.tabs.perso' },
]

const filter = ref('all')

const shown = computed(() =>
  PROJECT_ITEMS.filter((item) => filter.value === 'all' || item.tab === filter.value),
)
</script>

<template>
  <div class="gp">
    <h2 class="gp-title">{{ t('projects.title') }}</h2>
    <p class="gp-lead">{{ t('projects.subtitle') }}</p>

    <div class="gp-filters" role="group" :aria-label="t('projects.title')">
      <button
        v-for="option in FILTERS"
        :key="option.id"
        type="button"
        class="gp-filter"
        :class="{ 'is-active': filter === option.id }"
        :aria-pressed="filter === option.id"
        @click="filter = option.id"
      >
        {{ t(option.labelKey) }}
      </button>
    </div>

    <ol class="gp-feats">
      <li v-for="(project, index) in shown" :key="project.titleKey" class="gp-feat">
        <span class="gp-feat-number" aria-hidden="true">
          {{ String(index + 1).padStart(2, '0') }}
        </span>

        <div class="gp-feat-body">
          <h3 class="gp-feat-title">{{ t(project.titleKey) }}</h3>
          <p class="gp-feat-desc">{{ t(project.descKey) }}</p>

          <ul class="gp-loot">
            <li v-for="tech in project.technos" :key="tech">{{ tech }}</li>
          </ul>

          <a :href="project.link" target="_blank" rel="noopener noreferrer" class="gp-feat-link">
            <ExternalLink class="h-3.5 w-3.5" aria-hidden="true" />
            {{ t(project.linkKey || 'projects.view') }}
            <span class="sr-only">— {{ t(project.titleKey) }}</span>
          </a>
        </div>
      </li>
    </ol>
  </div>
</template>
