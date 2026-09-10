<script setup>
/**
 * Commandes du mode carte : flèches sur les bords, points de position en bas.
 *
 * Elles ne sont pas décoratives : sans elles, un visiteur qui ne devine ni la molette ni les
 * flèches du clavier serait bloqué sur la première case. La barre de navigation reste évidemment
 * le chemin le plus direct.
 */
import { useI18n } from 'vue-i18n'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useGame } from '@/composables/useGame'
import { useDeck } from '@/composables/useDeck'

const { t } = useI18n()
const { deckActive } = useGame()
const {
  slides,
  activeIndex,
  activeSlide,
  total,
  canGoPrevious,
  canGoNext,
  goTo,
  goToNext,
  goToPrevious,
} = useDeck()

const arrowClass =
  'fixed top-1/2 z-50 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary bg-card text-primary shadow-lg transition hover:bg-muted disabled:invisible print:hidden'
</script>

<template>
  <template v-if="deckActive">
    <button
      type="button"
      :class="arrowClass"
      class="left-3"
      :disabled="!canGoPrevious"
      :aria-label="t('game.deck.previous')"
      @click="goToPrevious({ focus: true })"
    >
      <ChevronLeft class="h-5 w-5" aria-hidden="true" />
    </button>

    <button
      type="button"
      :class="arrowClass"
      class="right-3"
      :disabled="!canGoNext"
      :aria-label="t('game.deck.next')"
      @click="goToNext({ focus: true })"
    >
      <ChevronRight class="h-5 w-5" aria-hidden="true" />
    </button>

    <!-- Points de position : ils disent où l'on est, et permettent d'aller n'importe où. -->
    <nav
      class="fixed bottom-4 left-1/2 z-50 hidden -translate-x-1/2 rounded-full border border-primary bg-card px-3 py-2 shadow-lg sm:block print:hidden"
      :aria-label="t('game.deck.mapLabel')"
    >
      <ul class="flex items-center gap-1">
        <li v-for="slide in slides" :key="slide.id">
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-muted"
            :aria-current="slide.active ? 'true' : undefined"
            :aria-label="
              t('game.deck.goTo', {
                index: slide.index + 1,
                total,
                name: t(`game.slides.${slide.id}`),
              })
            "
            @click="goTo(slide.id, { focus: true })"
          >
            <span
              class="block rounded-full transition-all"
              :class="slide.active ? 'h-2.5 w-2.5 bg-primary-strong' : 'h-1.5 w-1.5 bg-muted'"
            ></span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Le changement de case est purement visuel : cette zone le rend audible. -->
    <p class="sr-only" role="status" aria-live="polite">
      {{
        t('game.deck.position', {
          index: activeIndex + 1,
          total,
          name: t(`game.slides.${activeSlide.id}`),
        })
      }}
    </p>
  </template>
</template>
