<script setup>
/**
 * Étiquette de quête affichée au-dessus du titre d'une section, uniquement en mode aventure.
 *
 * Volontairement réduite à l'essentiel : le numéro, le nom du lieu et l'état. L'objectif et la
 * récompense vivent dans le journal, où on va les chercher — les répéter ici mettait cinq
 * informations grises devant le titre, c'est-à-dire devant le message du site.
 *
 * Purement décoratif au sens du contenu : le `h2` de la section reste le vrai titre, celui que
 * lisent les moteurs de recherche et les lecteurs d'écran. Ce bloc n'introduit donc aucun niveau
 * de titre supplémentaire.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, ChevronRight } from 'lucide-vue-next'
import { QUESTS } from '@/game/quests'
import { useGame } from '@/composables/useGame'

const props = defineProps({
  id: { type: String, required: true },
})

const { t } = useI18n()
const { ready, isAdventure, completed } = useGame()

const index = computed(() => QUESTS.findIndex((quest) => quest.id === props.id))
const number = computed(() => String(index.value + 1).padStart(2, '0'))
const done = computed(() => completed.value.includes(props.id))
</script>

<template>
  <p
    v-if="ready && isAdventure && index !== -1"
    class="quest-header mb-3 inline-flex items-center gap-2 rounded-md border border-primary px-2 py-0.5 font-mono text-xs font-semibold tracking-wider text-primary uppercase"
  >
    <component :is="done ? Check : ChevronRight" class="h-3.5 w-3.5" aria-hidden="true" />
    {{ t('game.questLabel', { number }) }}
    <span class="normal-case">· {{ t(`game.quests.${id}.name`) }}</span>
    <span class="sr-only">— {{ t(`game.status.${done ? 'done' : 'current'}`) }}</span>
  </p>
</template>
