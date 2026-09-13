<script setup>
/**
 * Clics et survol dans le monde, par lancer de rayon (`Raycaster`).
 *
 * Le rayon n'est testé que contre les objets enregistrés (zones et sentiers, voir
 * `useZonePicking`), jamais contre la forêt : six cents sapins instanciés ne doivent pas être
 * parcourus à chaque mouvement de souris.
 *
 * Les étiquettes HTML (`WorldMarkers`) font la même chose et restent le chemin accessible : ici on
 * ajoute le geste évident, pas le seul.
 */
import { onBeforeUnmount, onMounted } from 'vue'
import { useTres } from '@tresjs/core'
import { Raycaster, Vector2 } from 'three'
import { openPlace } from '@/composables/useWorld'
import { hoveredZone, pickables } from '@/composables/useZonePicking'

const { camera, renderer } = useTres()

const raycaster = new Raycaster()
const pointer = new Vector2()

function zoneAt(event) {
  const view = camera.value
  const element = renderer.domElement
  if (!view || !element) return null

  const rect = element.getBoundingClientRect()
  pointer.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  )
  raycaster.setFromCamera(pointer, view)

  // On remonte du maillage touché jusqu'à l'objet qui porte l'identifiant de zone.
  let object = raycaster.intersectObjects(pickables(), true)[0]?.object
  while (object && !object.userData.placeId) object = object.parent
  return object?.userData.placeId ?? null
}

let pending = null
let frame = 0

// Un seul lancer de rayon par image, quel que soit le nombre d'événements `pointermove` reçus.
function onMove(event) {
  pending = event
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    const id = zoneAt(pending)
    if (id === hoveredZone.value) return
    hoveredZone.value = id
    renderer.domElement.style.cursor = id ? 'pointer' : ''
  })
}

function onLeave() {
  hoveredZone.value = null
  renderer.domElement.style.cursor = ''
}

function onClick(event) {
  const id = zoneAt(event)
  if (id) openPlace(id)
}

onMounted(() => {
  const element = renderer.domElement
  element.addEventListener('pointermove', onMove)
  element.addEventListener('pointerleave', onLeave)
  element.addEventListener('click', onClick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  hoveredZone.value = null
  const element = renderer.domElement
  element?.removeEventListener('pointermove', onMove)
  element?.removeEventListener('pointerleave', onLeave)
  element?.removeEventListener('click', onClick)
})
</script>

<template>
  <slot />
</template>
