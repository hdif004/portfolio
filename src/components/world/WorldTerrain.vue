<script setup>
/**
 * Le sol : un relief à facettes, herbe sur les hauteurs, terre battue dans les clairières.
 *
 * C'est le seul élément encore généré plutôt que chargé : un terrain n'est pas un modèle, et un
 * relief qui épouse les clairières et les sentiers ne se trouve dans aucun kit. Les ombres le
 * rendent lisible, les couleurs suivent la palette du site.
 */
import { onBeforeUnmount, watch } from 'vue'
import { BufferAttribute, Color, Mesh, MeshLambertMaterial, PlaneGeometry } from 'three'
import { WORLD_SIZE, clearingDepth, heightAt } from '@/world/terrain'

const props = defineProps({ palette: { type: Object, required: true } })

/** Environ deux mètres par facette : le relief garde son grain quelle que soit la taille du monde. */
const SEGMENTS = Math.round(WORLD_SIZE / 2)

const geometry = new PlaneGeometry(WORLD_SIZE, WORLD_SIZE, SEGMENTS, SEGMENTS)
geometry.rotateX(-Math.PI / 2)

const position = geometry.attributes.position
const colors = new Float32Array(position.count * 3)
const trodden = new Float32Array(position.count)

for (let i = 0; i < position.count; i += 1) {
  const x = position.getX(i)
  const z = position.getZ(i)
  position.setY(i, heightAt(x, z))
  // Terre battue au centre des clairières, qui se fond dans l'herbe vers la lisière.
  trodden[i] = Math.max(0, 1 - clearingDepth(x, z)) ** 1.4
}

geometry.setAttribute('color', new BufferAttribute(colors, 3))
geometry.computeVertexNormals()

const ground = new Mesh(geometry, new MeshLambertMaterial({ vertexColors: true, flatShading: true }))
ground.receiveShadow = true

const DIRT = new Color('#9b7b55')

function paint() {
  const grass = new Color(props.palette.primary)
  if (props.palette.dark) grass.multiplyScalar(0.7)
  const lowGrass = grass.clone().multiplyScalar(0.72)
  const dirt = DIRT.clone().multiplyScalar(props.palette.dark ? 0.6 : 1)
  const vertex = new Color()

  for (let i = 0; i < position.count; i += 1) {
    const height = Math.min(1, Math.max(0, (position.getY(i) + 3) / 7))
    vertex.copy(lowGrass).lerp(grass, height).lerp(dirt, trodden[i] * 0.75)
    colors[i * 3] = vertex.r
    colors[i * 3 + 1] = vertex.g
    colors[i * 3 + 2] = vertex.b
  }
  geometry.attributes.color.needsUpdate = true
}

watch(() => [props.palette.primary, props.palette.dark], paint, { immediate: true })

onBeforeUnmount(() => {
  geometry.dispose()
  ground.material.dispose()
})
</script>

<template>
  <primitive :object="ground" />
</template>
