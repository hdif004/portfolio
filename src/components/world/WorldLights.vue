<script setup>
/**
 * Éclairage : une lumière de fin d'après-midi dans une clairière.
 *
 * - `HemisphereLight` : ciel teinté de feuillage en haut, terre en bas. C'est la base douce qui
 *   évite les faces noires côté ombre ;
 * - `DirectionalLight` : le soleil, bas et chaud, qui porte les ombres longues. Sans elles, vue de
 *   haut, tout est plat : ce sont les ombres qui donnent le relief et l'heure qu'il est.
 *
 * Le soleil suit le point visé par la caméra : la zone d'ombre reste resserrée autour de ce qu'on
 * regarde, donc nette, au lieu de s'étaler sur tout le monde en perdant sa résolution.
 *
 * En thème sombre, le campement passe au crépuscule : ciel bleuté, soleil faible, et ce sont les
 * feux de camp qui prennent le relais.
 */
import { computed, shallowRef, watch, watchEffect } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { Color, Fog } from 'three'
import { cameraState } from '@/world/cameraState'

const props = defineProps({ palette: { type: Object, required: true } })

const MOODS = {
  day: {
    sky: '#d6e8c0',
    ground: '#5c4631',
    skyIntensity: 1.1,
    sun: '#ffcf96',
    sunIntensity: 2.6,
  },
  dusk: {
    sky: '#7186a8',
    ground: '#2c2622',
    skyIntensity: 0.55,
    sun: '#ffac6b',
    sunIntensity: 1.1,
  },
}

/** Direction du soleil par rapport au point visé : bas sur l'horizon, venant de l'ouest. */
const SUN_OFFSET = [-38, 42, 22]
/** Demi-côté de la zone d'ombre, en unités de monde. */
const SHADOW_EXTENT = 55

const mood = computed(() => (props.palette.dark ? MOODS.dusk : MOODS.day))

const sky = shallowRef()
const sun = shallowRef()

const { scene } = useTres()
// Opaque à 260 : en vue d'ensemble, les bords du terrain (à 250–290 de la caméra) s'y fondent.
scene.value.fog = new Fog(new Color(), 110, 260)

watchEffect(() => {
  scene.value.fog.color.set(props.palette.background)
})

watch(sun, (light) => {
  if (!light) return
  const shadow = light.shadow
  shadow.mapSize.set(2048, 2048)
  Object.assign(shadow.camera, {
    left: -SHADOW_EXTENT,
    right: SHADOW_EXTENT,
    top: SHADOW_EXTENT,
    bottom: -SHADOW_EXTENT,
    near: 1,
    far: 160,
  })
  shadow.camera.updateProjectionMatrix()
  // Sans ce décalage, une surface plane s'ombre elle-même en rayures (« shadow acne »).
  shadow.bias = -0.0008
  shadow.normalBias = 0.04
  // Le soleil vise un point qui bouge : sa cible doit faire partie de la scène.
  scene.value.add(light.target)
})

watchEffect(() => {
  if (sky.value) {
    sky.value.color.set(mood.value.sky)
    sky.value.groundColor.set(mood.value.ground)
    sky.value.intensity = mood.value.skyIntensity
  }
  if (sun.value) {
    sun.value.color.set(mood.value.sun)
    sun.value.intensity = mood.value.sunIntensity
  }
})

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  const light = sun.value
  if (!light) return
  // Arrondi à l'unité : un soleil qui glisse de fractions de texel fait scintiller les ombres.
  const x = Math.round(cameraState.tx)
  const z = Math.round(cameraState.tz)
  light.position.set(x + SUN_OFFSET[0], SUN_OFFSET[1], z + SUN_OFFSET[2])
  light.target.position.set(x, 0, z)
})
</script>

<template>
  <TresHemisphereLight ref="sky" />
  <TresDirectionalLight ref="sun" :cast-shadow="true" />
</template>
