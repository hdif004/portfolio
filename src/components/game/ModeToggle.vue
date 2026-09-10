<script setup>
/**
 * Bascule mode aventure / mode classique.
 *
 * Le mode aventure est actif par défaut, mais la sortie doit rester évidente : un visiteur venu
 * chercher un prestataire ne doit jamais avoir à jouer pour lire le contenu. Le choix est
 * mémorisé (voir `useGame`).
 */
import { useI18n } from 'vue-i18n'
import { BookOpen, Gamepad2 } from 'lucide-vue-next'
import { useGame } from '@/composables/useGame'

defineProps({
  // 'icon' pour la barre de navigation, 'full' pour le menu mobile.
  variant: { type: String, default: 'icon' },
})

const { t } = useI18n()
const { isAdventure, toggleMode } = useGame()
</script>

<template>
  <button
    type="button"
    :aria-pressed="isAdventure"
    :aria-label="isAdventure ? t('game.modeToggle.toClassic') : t('game.modeToggle.toAdventure')"
    :title="isAdventure ? t('game.modeToggle.toClassic') : t('game.modeToggle.toAdventure')"
    class="cursor-pointer border border-primary text-primary transition hover:bg-muted"
    :class="
      variant === 'full'
        ? 'mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2'
        : 'inline-flex rounded-full p-2'
    "
    @click="toggleMode"
  >
    <component :is="isAdventure ? BookOpen : Gamepad2" class="h-5 w-5" aria-hidden="true" />
    <span v-if="variant === 'full'">
      {{ isAdventure ? t('game.modeToggle.toClassic') : t('game.modeToggle.toAdventure') }}
    </span>
  </button>
</template>
