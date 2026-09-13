<script setup>
/**
 * Marqueurs posés sur les lieux de la clairière.
 *
 * Ce sont de vrais boutons HTML, pas des objets 3D : ils sont atteignables au clavier, annoncés
 * par un lecteur d'écran et traduits. Leur position à l'écran est recalculée à chaque image par
 * `WorldScene`, qui projette la position 3D du lieu et écrit `--sx` / `--sy`.
 *
 * Cliquer sur la structure elle-même fait la même chose — c'est le geste évident. Ces marqueurs
 * sont le chemin fiable : sans eux, un lieu ne serait atteignable qu'à la souris et qu'à
 * condition d'avoir deviné qu'un tas de caisses est cliquable.
 */
import { useI18n } from 'vue-i18n'
import { useGame } from '@/composables/useGame'
import { useWorld } from '@/composables/useWorld'

const { t } = useI18n()
const { worldActive, quests } = useGame()
const { places, panelOpen, everOpened, isOverview, openPlace, showOverview } = useWorld()

/** Une quête terminée se voit sur le marqueur : c'est la carte qui sert de progression. */
const isDone = (id) => quests.value.some((quest) => quest.id === id && quest.done)
</script>

<template>
  <div v-if="worldActive" class="world-markers" :class="{ 'is-dimmed': panelOpen }">
    <!-- L'indice d'entrée : rien dans un décor ne dit qu'il est cliquable tant qu'on ne l'a pas
         dit une fois. Il disparaît dès le premier lieu ouvert. -->
    <p v-if="!everOpened" class="world-hint">{{ t('game.world.hint') }}</p>

    <button
      v-for="place in places"
      :key="place.id"
      type="button"
      class="world-marker"
      :class="{ 'is-here': place.active, 'is-done': isDone(place.id) }"
      :data-place="place.id"
      :aria-label="t('game.world.open', { name: t(`game.places.${place.id}`) })"
      @click="openPlace(place.id)"
    >
      <span class="world-marker-dot" aria-hidden="true"></span>
      <span class="world-marker-name">{{ t(`game.places.${place.id}`) }}</span>
      <span class="world-marker-section">{{ t(`game.slides.${place.id}`) }}</span>
    </button>

    <!-- Retour à la vue d'ensemble : la touche M fait la même chose, mais rien ne l'annonce. -->
    <button
      v-if="!isOverview"
      type="button"
      class="world-overview"
      :title="t('game.world.overviewHint')"
      @click="showOverview"
    >
      {{ t('game.world.overview') }}
    </button>
  </div>
</template>
