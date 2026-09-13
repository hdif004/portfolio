<script setup>
/**
 * Transitions de caméra, façon sélection de personnage de Crash Team Racing.
 *
 * `useWorld` fixe le plan visé (`worldCamera`) ; ce composant s'y rend avec GSAP :
 * - la position et le point visé glissent en `power2.inOut` : départ et arrivée en douceur ;
 * - le regard part un peu avant le corps (point visé plus rapide que la position) : on regarde
 *   là où l'on va, ce qui rend le mouvement lisible ;
 * - la caméra prend de la hauteur pendant le trajet puis redescend (`lift`), proportionnellement
 *   à la distance : un saut de zone en zone devient un survol, un simple recadrage reste discret ;
 * - chaque zone ayant son propre angle de vue, la caméra pivote en chemin.
 *
 * Un nouveau plan en cours de trajet repart de la position courante : rien ne saute.
 *
 * Il place aussi les étiquettes HTML des zones, dans la même boucle, pour qu'elles ne soient
 * jamais en retard d'une image sur le décor.
 */
import { onBeforeUnmount, watch } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { Vector3 } from 'three'
import gsap from 'gsap'
import { MARKER_HEIGHT, PLACES } from '@/game/world'
import { worldCamera } from '@/composables/useWorld'
import { OVERVIEW_SHOT } from '@/world/cameraShots'
import { cameraState as state } from '@/world/cameraState'

const props = defineProps({ reducedMotion: { type: Boolean, default: false } })

const { camera } = useTres()

// Arrivée : on part du ciel, au-dessus et en retrait de la vue d'ensemble, puis on plonge.
Object.assign(state, {
  px: OVERVIEW_SHOT.position.x,
  py: OVERVIEW_SHOT.position.y + 50,
  pz: OVERVIEW_SHOT.position.z + 40,
  tx: OVERVIEW_SHOT.target.x,
  ty: OVERVIEW_SHOT.target.y,
  tz: OVERVIEW_SHOT.target.z,
  lift: 0,
})

let timeline = null

function travel({ position, target }) {
  timeline?.kill()

  if (props.reducedMotion) {
    Object.assign(state, {
      px: position.x,
      py: position.y,
      pz: position.z,
      tx: target.x,
      ty: target.y,
      tz: target.z,
      lift: 0,
    })
    return
  }

  const distance = Math.hypot(position.x - state.px, position.y - state.py, position.z - state.pz)
  const duration = gsap.utils.clamp(0.8, 2.2, 0.6 + distance * 0.018)
  const peak = Math.min(distance * 0.25, 14)

  timeline = gsap
    .timeline({ defaults: { ease: 'power2.inOut' } })
    .to(state, { px: position.x, py: position.y, pz: position.z, duration }, 0)
    .to(state, { tx: target.x, ty: target.y, tz: target.z, duration: duration * 0.8 }, 0)
    .to(state, { lift: peak, duration: duration * 0.45, ease: 'sine.out' }, 0)
    .to(state, { lift: 0, duration: duration * 0.55, ease: 'sine.inOut' }, duration * 0.45)
}

watch(worldCamera, () => travel(worldCamera), { deep: true, immediate: true })

const projected = new Vector3()
const markers = new Map()

/**
 * Position à l'écran de chaque zone, écrite directement dans le style des étiquettes.
 *
 * Hors du système réactif de Vue : mettre à jour six positions soixante fois par seconde à travers
 * des `ref` déclencherait autant de rendus de composant pour un simple déplacement de pixels.
 */
function placeMarkers(view) {
  const width = window.innerWidth
  const height = window.innerHeight

  for (const place of PLACES) {
    let marker = markers.get(place.id)
    if (!marker?.isConnected) {
      marker = document.querySelector(`.world-marker[data-place="${place.id}"]`)
      markers.set(place.id, marker)
    }
    if (!marker) continue

    projected.set(place.x, place.markerHeight ?? MARKER_HEIGHT, place.z).project(view)
    marker.style.setProperty('--sx', `${(projected.x * 0.5 + 0.5) * width}px`)
    marker.style.setProperty('--sy', `${(-projected.y * 0.5 + 0.5) * height}px`)
    marker.toggleAttribute('data-offscreen', projected.z >= 1)
  }

  // Contenu déployé dans une zone : chaque carte suit l'objet auquel elle est accrochée.
  for (const pin of document.querySelectorAll('.world-pin[data-anchor]')) {
    const [x, y, z] = pin.dataset.anchor.split(',').map(Number)
    projected.set(x, y, z).project(view)
    pin.style.setProperty('--sx', `${(projected.x * 0.5 + 0.5) * width}px`)
    pin.style.setProperty('--sy', `${(-projected.y * 0.5 + 0.5) * height}px`)
    pin.toggleAttribute('data-offscreen', projected.z >= 1)
  }
}

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  const view = camera.value
  if (!view) return

  view.position.set(state.px, state.py + state.lift, state.pz)
  view.lookAt(state.tx, state.ty, state.tz)
  view.updateMatrixWorld()

  placeMarkers(view)
})

onBeforeUnmount(() => timeline?.kill())
</script>

<template>
  <slot />
</template>
