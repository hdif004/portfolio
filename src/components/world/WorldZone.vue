<script setup>
/**
 * Une zone du monde : ses modèles, ses feux, sa réaction au survol.
 *
 * Tout le contenu vient de `src/world/scenery.js` : ajouter un objet à une zone ne demande pas de
 * toucher à ce composant.
 *
 * La zone est tournée face à sa caméra : ce qu'on place au premier plan dans `scenery.js` (z
 * positif) est toujours ce que la caméra voit de face en arrivant.
 */
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useLoop } from '@tresjs/core'
import { Group, PointLight } from 'three'
import gsap from 'gsap'
import { SCENERY, ZONE_SCALE } from '@/world/scenery'
import { heightAt } from '@/world/terrain'
import { zoneRotation } from '@/world/anchors'
import { spawnModel } from '@/world/loaders'
import { hoveredZone, registerPickable } from '@/composables/useZonePicking'
import { useWorld } from '@/composables/useWorld'

const props = defineProps({
  place: { type: Object, required: true },
  reducedMotion: { type: Boolean, default: false },
})

const HOVER_SCALE = 1.05
const FIRE_COLOR = 0xff9a4d

const scenery = SCENERY[props.place.id] ?? { props: [] }

const root = new Group()
root.position.set(props.place.x, heightAt(props.place.x, props.place.z), props.place.z)
root.rotation.y = zoneRotation(props.place)
root.scale.setScalar(ZONE_SCALE)

const unregister = registerPickable(root, props.place.id)
const fires = []

onMounted(async () => {
  const objects = await Promise.all(scenery.props.map((item) => spawnModel(item.model)))

  objects.forEach((object, index) => {
    if (!object) return
    const item = scenery.props[index]
    object.position.set(...item.position)
    object.rotation.y = item.rotation
    object.scale.multiplyScalar(item.scale)
    root.add(object)
  })

  // La lueur du feu : c'est elle qui donne à la zone une heure et une température, surtout au
  // crépuscule du thème sombre.
  for (const fire of scenery.fires ?? []) {
    const light = new PointLight(FIRE_COLOR, fire.intensity, fire.distance, 2)
    light.position.set(...fire.position)
    root.add(light)
    fires.push({ light, base: fire.intensity })
  }
})

// Survol : la zone se soulève légèrement, le signe qu'elle répond au pointeur.
watch(hoveredZone, (id) => {
  const scale = ZONE_SCALE * (id === props.place.id ? HOVER_SCALE : 1)
  gsap.to(root.scale, {
    x: scale,
    y: scale,
    z: scale,
    duration: props.reducedMotion ? 0 : 0.35,
    ease: 'power2.out',
    overwrite: true,
  })
})

/**
 * Ouverture de la zone : ses objets sautillent l'un après l'autre, pendant que la caméra arrive et
 * que les cartes se déploient. C'est le signe que la zone s'éveille, pas seulement qu'on la regarde.
 */
const { activeId, panelOpen } = useWorld()

watch(
  () => panelOpen.value && activeId.value === props.place.id,
  (open) => {
    if (!open || props.reducedMotion) return
    root.children
      .filter((child) => !child.isLight)
      .forEach((child, index) => {
        child.userData.restY ??= child.position.y
        gsap.fromTo(
          child.position,
          { y: child.userData.restY },
          {
            y: child.userData.restY + 0.7,
            duration: 0.22,
            delay: 0.45 + index * 0.05,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            overwrite: true,
          },
        )
      })
  },
)

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  if (props.reducedMotion || !fires.length) return
  const time = performance.now() / 1000
  // Deux sinusoïdes de périodes incommensurables : le vacillement ne se répète jamais tout à fait.
  const flicker = 0.86 + Math.sin(time * 7.3) * 0.1 + Math.sin(time * 11.7) * 0.06
  for (const fire of fires) fire.light.intensity = fire.base * flicker
})

onBeforeUnmount(() => {
  unregister()
  gsap.killTweensOf(root.scale)
  for (const child of root.children) gsap.killTweensOf(child.position)
})
</script>

<template>
  <primitive :object="root" />
</template>
