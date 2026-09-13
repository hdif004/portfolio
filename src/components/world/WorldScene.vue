<script setup>
/**
 * Point d'entrée du monde 3D, côté application.
 *
 * Ce composant ne contient aucun code 3D : il décide seulement si le monde doit exister.
 * - TresJS, `three` et les modèles sont chargés à la demande, uniquement en mode aventure : le mode
 *   classique et le premier rendu ne paient rien (morceau séparé côté build) ;
 * - le pré-rendu ne rend qu'un conteneur vide, identique au premier rendu client : pas de
 *   divergence à l'hydratation ;
 * - sans WebGL, on repasse en mode classique plutôt que d'afficher un vide.
 */
import { defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useGame } from '@/composables/useGame'

const WorldCanvas = defineAsyncComponent(() => import('./WorldCanvas.vue'))

const { worldActive, setMode } = useGame()

const mounted = ref(false)
const loading = ref(true)
const reducedMotion = ref(false)

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!supportsWebGL()) {
    // Pas de WebGL (pilote bloqué, machine ancienne) : le mode aventure n'a rien à montrer. On rend
    // la main au mode classique, qui contient exactement le même portfolio.
    watch(worldActive, (active) => active && setMode('classic'), { immediate: true })
    return
  }

  mounted.value = true
})

// Le monde est détruit en quittant le mode aventure : au retour, il se recharge en fondu.
watch(worldActive, (active) => {
  if (!active) loading.value = true
})
</script>

<template>
  <div
    v-show="worldActive"
    class="world-canvas"
    :class="{ 'is-loading': loading }"
    aria-hidden="true"
  >
    <WorldCanvas
      v-if="mounted && worldActive"
      :reduced-motion="reducedMotion"
      @ready="loading = false"
    />
  </div>
</template>
