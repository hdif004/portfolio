/**
 * Chargement des modèles `.glb` et instanciation.
 *
 * `GLTFLoader` directement plutôt que `useGLTF` de cientos, pour deux raisons :
 * - un cache par modèle : un rondin posé dans trois zones n'est téléchargé et analysé qu'une fois,
 *   chaque zone en reçoit une copie qui partage géométrie et matériaux ;
 * - la forêt a besoin de la géométrie brute pour construire des `InstancedMesh` (six cents sapins
 *   en une poignée d'appels de dessin), ce qu'un composant qui rend le modèle tel quel ne permet pas.
 *
 * Ce module importe `three` : il ne doit être atteint que depuis le morceau chargé à la demande.
 */
import { InstancedMesh, Group, Matrix4, Quaternion, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MODELS } from './models'

const loader = new GLTFLoader()
const cache = new Map()

/**
 * Prépare un modèle une fois pour toutes : ombres portées et reçues sur chaque maillage, matériaux
 * mats. Le glTF suppose un métal par défaut quand l'export ne précise rien ; sans carte
 * d'environnement, un matériau métallique rend presque noir.
 */
function prepare(scene) {
  scene.traverse((child) => {
    if (!child.isMesh) return
    child.castShadow = true
    child.receiveShadow = true
    for (const material of [child.material].flat()) {
      material.metalness = 0
      material.roughness = Math.max(material.roughness ?? 1, 0.85)
    }
  })
  scene.updateMatrixWorld(true)
  return scene
}

/** Charge (une seule fois) la scène d'un modèle du catalogue. */
export function loadModel(key) {
  const entry = MODELS[key]
  if (!entry) return Promise.reject(new Error(`Modèle inconnu : ${key}`))

  if (!cache.has(key)) {
    cache.set(
      key,
      loader.loadAsync(entry.url).then((gltf) => prepare(gltf.scene)),
    )
  }
  return cache.get(key)
}

/** Précharge une liste de modèles. Un modèle en échec est signalé, jamais bloquant. */
export async function preloadModels(keys) {
  const results = await Promise.allSettled(keys.map(loadModel))
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(`[monde] modèle non chargé : ${keys[index]}`, result.reason)
    }
  })
}

/** Copie d'un modèle prête à poser, à l'échelle du monde. `null` si le modèle est indisponible. */
export async function spawnModel(key) {
  try {
    const copy = (await loadModel(key)).clone(true)
    copy.scale.setScalar(MODELS[key].scale)
    return copy
  } catch (error) {
    if (!MODELS[key]?.optional) console.warn(`[monde] modèle indisponible : ${key}`, error)
    return null
  }
}

const position = new Vector3()
const rotation = new Quaternion()
const size = new Vector3()
const UP = new Vector3(0, 1, 0)

/** Matrice de placement d'une instance, échelle du catalogue comprise. */
export function placement(key, x, y, z, angle = 0, scale = 1) {
  return new Matrix4().compose(
    position.set(x, y, z),
    rotation.setFromAxisAngle(UP, angle),
    size.setScalar(scale * MODELS[key].scale),
  )
}

/**
 * Construit un `InstancedMesh` par maillage du modèle, avec une instance par matrice.
 *
 * Un modèle Kenney contient souvent plusieurs maillages (tronc, feuillage) : chacun garde sa
 * position relative, composée avec la matrice de l'instance.
 */
export function instanceModel(source, matrices, { castShadow = true } = {}) {
  const group = new Group()
  if (!matrices.length) return group

  const matrix = new Matrix4()

  source.traverse((child) => {
    if (!child.isMesh) return
    const mesh = new InstancedMesh(child.geometry, child.material, matrices.length)
    matrices.forEach((instance, index) => {
      mesh.setMatrixAt(index, matrix.multiplyMatrices(instance, child.matrixWorld))
    })
    mesh.castShadow = castShadow
    mesh.receiveShadow = true
    // Sans sphère englobante à jour, le frustum culling et le raycaster se basent sur la géométrie
    // d'origine, posée à l'origine du monde : des arbres disparaîtraient au bord de l'écran.
    mesh.computeBoundingSphere()
    group.add(mesh)
  })

  return group
}

/** Choix pondéré déterministe dans une liste `{ weight }`. */
export function pickWeighted(list, roll) {
  const total = list.reduce((sum, item) => sum + item.weight, 0)
  let threshold = roll * total
  for (const item of list) {
    threshold -= item.weight
    if (threshold <= 0) return item
  }
  return list[list.length - 1]
}
