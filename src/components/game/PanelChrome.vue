<script setup>
/**
 * En-tête du panneau de contenu : nom du lieu où l'on se trouve, et sortie.
 *
 * Il vit à l'intérieur de `#world-panel`, donc au-dessus du contenu de la section, sans jamais
 * s'intercaler dans sa hiérarchie de titres : le `h2` de la section reste le titre réel, celui
 * que lisent les moteurs de recherche et les lecteurs d'écran.
 *
 * En mode classique, ce bloc n'existe pas — la page défile, il n'y a rien à fermer.
 */
import { useI18n } from 'vue-i18n'
import { X } from 'lucide-vue-next'
import { useGame } from '@/composables/useGame'
import { useWorld } from '@/composables/useWorld'

const { t } = useI18n()
const { worldActive } = useGame()
const { activeId, panelOpen, closePanel } = useWorld()
</script>

<template>
  <div v-if="worldActive && panelOpen" class="panel-chrome">
    <p class="panel-chrome-place">
      <span class="panel-chrome-dot" aria-hidden="true"></span>
      {{ t(`game.places.${activeId}`) }}
    </p>

    <button
      type="button"
      class="panel-chrome-close"
      :aria-label="t('game.world.close')"
      @click="closePanel"
    >
      <span class="panel-chrome-esc" aria-hidden="true">Échap</span>
      <X class="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
</template>
