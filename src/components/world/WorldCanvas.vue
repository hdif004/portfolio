<script setup>
/**
 * La scène : un campement en forêt, en bas-poly, vu de trois quarts.
 *
 * Organisation :
 * - `WorldLights`  — ciel, soleil de fin d'après-midi, brouillard ;
 * - `CameraRig`    — transitions de caméra (GSAP) et position des étiquettes HTML ;
 * - `ZonePicker`   — clics et survol (Raycaster) ;
 * - `WorldTerrain`, `WorldForest`, `WorldPaths` — le décor partagé ;
 * - `WorldZone`    — une zone, ses modèles et ses feux, décrits dans `src/world/scenery.js`.
 *
 * Les modèles sont préchargés avant d'afficher le décor : le monde apparaît en fondu d'un bloc,
 * plutôt qu'objet par objet.
 */
import { onMounted, ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
// `PCFSoftShadowMap` a été retiré de three (r18x) : `PCFShadowMap` filtre désormais les bords.
import { ACESFilmicToneMapping, PCFShadowMap } from 'three'
import { PLACES } from '@/game/world'
import { WORLD_MODELS } from '@/world/scenery'
import { preloadModels } from '@/world/loaders'
import { useThemePalette } from '@/composables/useThemePalette'
import WorldLights from './WorldLights.vue'
import CameraRig from './CameraRig.vue'
import ZonePicker from './ZonePicker.vue'
import WorldTerrain from './WorldTerrain.vue'
import WorldForest from './WorldForest.vue'
import WorldPaths from './WorldPaths.vue'
import WorldZone from './WorldZone.vue'

defineProps({ reducedMotion: { type: Boolean, default: false } })
const emit = defineEmits(['ready'])

const palette = useThemePalette()
const loaded = ref(false)

onMounted(async () => {
  await preloadModels(WORLD_MODELS)
  loaded.value = true
  emit('ready')
})
</script>

<template>
  <TresCanvas
    :alpha="true"
    :clear-alpha="0"
    :antialias="true"
    :shadows="true"
    :shadow-map-type="PCFShadowMap"
    :tone-mapping="ACESFilmicToneMapping"
    :tone-mapping-exposure="1"
    :dpr="[1, 1.5]"
  >
    <TresPerspectiveCamera :fov="42" :near="1" :far="420" />

    <WorldLights :palette="palette" />
    <CameraRig :reduced-motion="reducedMotion" />
    <ZonePicker />

    <template v-if="loaded">
      <WorldTerrain :palette="palette" />
      <WorldForest />
      <WorldPaths />
      <WorldZone
        v-for="place in PLACES"
        :key="place.id"
        :place="place"
        :reduced-motion="reducedMotion"
      />
    </template>
  </TresCanvas>
</template>
