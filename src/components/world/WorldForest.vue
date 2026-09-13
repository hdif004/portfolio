<script setup>
/**
 * La forêt et le couvert du sol, en `InstancedMesh`.
 *
 * Six cents arbres ne coûtent qu'un appel de dessin par essence et par maillage. Ils s'écartent des
 * clairières et des sentiers : une zone ne doit pas se retrouver dans les branches, un chemin ne
 * doit pas traverser un tronc.
 *
 * Les modèles sont déjà en cache (préchargés par `WorldCanvas`) : la construction est immédiate.
 */
import { Group } from 'three'
import { onMounted } from 'vue'
import { GROUND_COVER, GROUND_COVER_COUNT, TREES, TREE_COUNT } from '@/world/scenery'
import { WORLD_SIZE, clearingDepth, distanceToPaths, heightAt, random } from '@/world/terrain'
import { instanceModel, loadModel, pickWeighted, placement } from '@/world/loaders'

const root = new Group()

/** Les arbres sont légèrement enfoncés : le relief à facettes ne suit pas exactement `heightAt`. */
const SINK = 0.15

/**
 * Tire des emplacements et les répartit par modèle. `accept` écarte un emplacement, `pick`
 * choisit le modèle et sa taille.
 */
function scatter(count, salt, accept, pick) {
  const byModel = new Map()
  let placed = 0

  for (let i = 0; placed < count && i < count * 6; i += 1) {
    const x = (random(i, salt) - 0.5) * WORLD_SIZE
    const z = (random(i, salt + 1) - 0.5) * WORLD_SIZE
    if (!accept(x, z)) continue

    const { model, scale } = pick(i)
    const matrix = placement(
      model,
      x,
      heightAt(x, z) - SINK,
      z,
      random(i, salt + 2) * Math.PI * 2,
      scale,
    )
    if (!byModel.has(model)) byModel.set(model, [])
    byModel.get(model).push(matrix)
    placed += 1
  }

  return byModel
}

async function build(byModel, options = () => ({})) {
  for (const [model, matrices] of byModel) {
    try {
      root.add(instanceModel(await loadModel(model), matrices, options(model)))
    } catch {
      // Modèle manquant : cette essence est absente, le reste de la forêt pousse quand même.
    }
  }
}

onMounted(async () => {
  const trees = scatter(
    TREE_COUNT,
    1,
    (x, z) => clearingDepth(x, z) > 1.2 && distanceToPaths(x, z) > 3.4,
    (i) => ({
      model: pickWeighted(TREES, random(i, 4)).model,
      scale: 0.8 + random(i, 5) * 0.7,
    }),
  )

  const cover = scatter(
    GROUND_COVER_COUNT,
    11,
    // Le couvert s'approche plus près que les arbres : c'est lui qui fait la lisière.
    (x, z) => clearingDepth(x, z) > 0.75 && distanceToPaths(x, z) > 1.8,
    (i) => {
      const item = pickWeighted(GROUND_COVER, random(i, 14))
      const [min, max] = item.scale
      return { model: item.model, scale: min + random(i, 15) * (max - min) }
    },
  )

  await build(trees)
  await build(cover, (model) => ({
    castShadow: GROUND_COVER.find((item) => item.model === model)?.castShadow ?? false,
  }))
})
</script>

<template>
  <primitive :object="root" />
</template>
