<script setup>
/**
 * Compétences : une planche par poste de l'atelier.
 *
 * L'établi porte ce que j'utilise au quotidien, l'enclume ce qui est maîtrisé, la meule ce que
 * j'aiguise encore. Le classement d'origine est conservé tel quel : c'est une information honnête,
 * qu'aucun niveau chiffré ne viendrait remplacer sans l'inventer.
 */
import { useI18n } from 'vue-i18n'
import WorldPin from '@/components/world/WorldPin.vue'
import { SKILL_GROUPS } from '@/data/skills'

const { t } = useI18n()

const STATIONS = {
  daily: { anchor: 'bench', offset: [0, -230] },
  solid: { anchor: 'anvil', offset: [-420, 120] },
  learning: { anchor: 'grind', offset: [420, 120] },
}
</script>

<template>
  <WorldPin
    v-for="group in SKILL_GROUPS"
    :key="group.id"
    place="skills"
    :anchor="STATIONS[group.id].anchor"
    :offset="STATIONS[group.id].offset"
    variant="plank"
  >
    <h3 class="stage-title">
      {{ t(group.titleKey) }}
      <span class="stage-count">{{ group.items.length }}</span>
    </h3>
    <p class="stage-text">{{ t(group.captionKey) }}</p>
    <ul class="stage-chips">
      <li v-for="item in group.items" :key="item.name" class="stage-chip">
        <component :is="item.icon" aria-hidden="true" />
        {{ item.name }}
      </li>
    </ul>
  </WorldPin>
</template>
