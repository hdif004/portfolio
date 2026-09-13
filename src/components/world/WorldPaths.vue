<script setup>
/**
 * Les sentiers : des dalles de pierre du campement à chaque zone.
 *
 * Chaque sentier est cliquable et mène à la zone où il aboutit. Vu d'en haut, ce sont eux qui disent
 * que le campement est un ensemble, et pas six décors posés au hasard.
 */
import { Group } from 'three'
import { onBeforeUnmount, onMounted } from 'vue'
import { HOME_PLACE, PLACES, clearingRadius, placeById } from '@/game/world'
import { heightAt, pathSamples, random } from '@/world/terrain'
import { instanceModel, loadModel, placement } from '@/world/loaders'
import { registerPickable } from '@/composables/useZonePicking'

/** Écart entre deux dalles, en unités de monde. */
const SPACING = 2.1

const root = new Group()
const unregister = []

onMounted(async () => {
  let stone
  try {
    stone = await loadModel('pathStone')
  } catch {
    return
  }

  const home = placeById(HOME_PLACE)

  PLACES.filter((place) => place.id !== HOME_PLACE).forEach((place, pathIndex) => {
    const matrices = []

    pathSamples(place, SPACING).forEach((sample, i) => {
      // Le sentier s'arrête au bord des zones : les dalles ne passent pas sous le feu de camp.
      const fromHome = Math.hypot(sample.x - home.x, sample.z - home.z)
      const fromPlace = Math.hypot(sample.x - place.x, sample.z - place.z)
      if (fromHome < clearingRadius(home) * 0.45 || fromPlace < clearingRadius(place) * 0.5) return

      const seed = pathIndex * 100 + i
      // Dalles posées en travers du chemin, avec un peu de désordre : un sentier, pas un carrelage.
      const length = Math.hypot(sample.dx, sample.dz) || 1
      const wobble = (random(seed, 21) - 0.5) * 0.7
      const x = sample.x + (-sample.dz / length) * wobble
      const z = sample.z + (sample.dx / length) * wobble
      const angle = Math.atan2(sample.dx, sample.dz) + (random(seed, 22) - 0.5) * 0.5

      matrices.push(
        placement('pathStone', x, heightAt(x, z) + 0.02, z, angle, 0.65 + random(seed, 23) * 0.2),
      )
    })

    const path = instanceModel(stone, matrices, { castShadow: false })
    unregister.push(registerPickable(path, place.id))
    root.add(path)
  })
})

onBeforeUnmount(() => unregister.forEach((off) => off()))
</script>

<template>
  <primitive :object="root" />
</template>
