<script setup>
/**
 * Marqueurs posés sur le monde, un par lieu. Ils vivent à l'intérieur de la scène : ils voyagent
 * donc avec la carte, contrairement aux commandes qui restent collées à l'écran.
 *
 * Ils n'apparaissent qu'en altitude (classe `is-far` posée par la caméra) : au sol ils gêneraient
 * la lecture, vus d'en haut ce sont eux qui rendent la carte lisible — sans eux, un survol montre
 * des rectangles anonymes.
 *
 * Le nom affiché est le nom de lieu ; le nom réel de la section reste dans le libellé
 * d'accessibilité, pour qu'un lecteur d'écran annonce « Aller à Compétences » et pas « L'établi ».
 */
import { useI18n } from 'vue-i18n'
import { MapPin } from 'lucide-vue-next'
import { useGame } from '@/composables/useGame'
import { useDeck } from '@/composables/useDeck'

const { t } = useI18n()
const { deckActive } = useGame()
const { slides, total, goTo } = useDeck()
</script>

<template>
  <div v-if="deckActive" class="map-markers" aria-hidden="false">
    <button
      v-for="point in slides"
      :key="point.id"
      type="button"
      class="map-marker"
      :class="{ 'is-here': point.active }"
      :style="{ '--x': point.x, '--y': point.y }"
      :aria-label="
        t('game.deck.goTo', {
          index: point.index + 1,
          total,
          name: t(`game.slides.${point.id}`),
        })
      "
      @click="goTo(point.id, { focus: true })"
    >
      <span class="map-marker-pin">
        <MapPin class="h-4 w-4" aria-hidden="true" />
      </span>
      <span class="map-marker-name">{{ t(`game.places.${point.id}`) }}</span>
    </button>
  </div>
</template>
