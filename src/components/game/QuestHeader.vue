<script setup>
/**
 * En-tête de quête affiché au-dessus du titre d'une section, uniquement en mode aventure.
 *
 * Purement décoratif au sens du contenu : le titre `h2` de la section reste le vrai titre, celui
 * que lisent les moteurs de recherche et les lecteurs d'écran. Ce bloc n'introduit donc aucun
 * niveau de titre supplémentaire.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, ChevronRight, Circle } from 'lucide-vue-next'
import { QUESTS } from '@/game/quests'
import { useGame } from '@/composables/useGame'

const props = defineProps({
  id: { type: String, required: true },
})

const { t } = useI18n()
const { ready, isAdventure, completed, currentQuestId } = useGame()

const index = computed(() => QUESTS.findIndex((quest) => quest.id === props.id))
const quest = computed(() => QUESTS[index.value])
const number = computed(() => String(index.value + 1).padStart(2, '0'))

const done = computed(() => completed.value.includes(props.id))
const current = computed(() => currentQuestId.value === props.id)
const statusKey = computed(() => (done.value ? 'done' : current.value ? 'current' : 'todo'))
const icon = computed(() => (done.value ? Check : current.value ? ChevronRight : Circle))
</script>

<template>
  <div
    v-if="ready && isAdventure"
    class="quest-header mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
  >
    <span
      class="inline-flex items-center gap-1.5 rounded-md border border-primary px-2 py-0.5 font-mono text-xs font-semibold tracking-wider text-primary uppercase"
    >
      <component :is="icon" class="h-3.5 w-3.5" aria-hidden="true" />
      {{ t('game.questLabel', { number }) }}
    </span>

    <span class="font-semibold text-primary">{{ t(`game.quests.${id}.name`) }}</span>

    <span class="text-text-muted">
      {{ t('game.objective') }} {{ t(`game.quests.${id}.objective`) }}
      <span class="mx-1" aria-hidden="true">·</span>
      {{ t('game.reward', { xp: quest.xp }) }}
      <span class="mx-1" aria-hidden="true">·</span>
      {{ t(`game.status.${statusKey}`) }}
    </span>
  </div>
</template>
