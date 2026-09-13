/**
 * Relief, clairières et sentiers : la géographie du monde, en calcul pur.
 *
 * Sans `three` : le relief, la forêt et les sentiers lisent tous les mêmes fonctions, ce qui garantit
 * qu'un arbre ne pousse jamais sur un sentier et qu'une zone repose toujours à plat.
 */
import { HOME_PLACE, PLACES, clearingRadius, placeById } from '@/game/world'

/** Côté du terrain, en unités de monde. */
export const WORLD_SIZE = 260

/** Bruit de valeur bilinéaire — un relief crédible sans embarquer de bibliothèque de bruit. */
function noise(x, z) {
  const fx = Math.floor(x)
  const fz = Math.floor(z)
  const hash = (i, j) => {
    const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
    return n - Math.floor(n)
  }
  const smooth = (t) => t * t * (3 - 2 * t)
  const tx = smooth(x - fx)
  const tz = smooth(z - fz)
  const a = hash(fx, fz)
  const b = hash(fx + 1, fz)
  const c = hash(fx, fz + 1)
  const d = hash(fx + 1, fz + 1)
  return (a + (b - a) * tx) * (1 - tz) + (c + (d - c) * tx) * tz
}

/** Tirage déterministe : même forêt à chaque visite, sans stocker la moindre coordonnée. */
export function random(i, salt) {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return n - Math.floor(n)
}

/**
 * Distance à la clairière la plus proche, en fraction de son rayon : 0 au centre d'une zone, 1 à
 * sa lisière. Une seule mesure pour le terrain comme pour la forêt, alors que les clairières n'ont
 * pas toutes la même taille.
 */
export function clearingDepth(x, z) {
  let nearest = Infinity
  for (const place of PLACES) {
    nearest = Math.min(nearest, Math.hypot(x - place.x, z - place.z) / clearingRadius(place))
  }
  return nearest
}

/** Hauteur du terrain, aplanie autour de chaque zone pour que les modèles reposent à plat. */
export function heightAt(x, z) {
  let height = noise(x * 0.045, z * 0.045) * 6 + noise(x * 0.12, z * 0.12) * 1.8 - 2.6

  const depth = clearingDepth(x, z)
  if (depth < 1) height *= depth ** 2

  return height
}

/**
 * Échantillons le long du sentier qui relie le campement à une zone.
 *
 * Courbe de Bézier quadratique avec un léger arc de côté : un trait parfaitement droit se lit comme
 * un fil tendu, pas comme un chemin. Chaque échantillon porte sa direction, pour orienter les dalles.
 */
export function pathSamples(place, spacing) {
  const home = placeById(HOME_PLACE)
  const p0 = { x: home.x, z: home.z }
  const p2 = { x: place.x, z: place.z }
  // Point de passage au milieu, poussé de côté ; on en déduit le point de contrôle de la courbe.
  const mid = {
    x: (p0.x + p2.x) / 2 + (p2.z - p0.z) * 0.14,
    z: (p0.z + p2.z) / 2 - (p2.x - p0.x) * 0.14,
  }
  const control = { x: 2 * mid.x - (p0.x + p2.x) / 2, z: 2 * mid.z - (p0.z + p2.z) / 2 }

  const at = (t) => ({
    x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * control.x + t ** 2 * p2.x,
    z: (1 - t) ** 2 * p0.z + 2 * (1 - t) * t * control.z + t ** 2 * p2.z,
  })

  const length = Math.hypot(p2.x - p0.x, p2.z - p0.z) * 1.05
  const count = Math.max(2, Math.ceil(length / spacing))
  const samples = []

  for (let i = 0; i <= count; i += 1) {
    const t = i / count
    const point = at(t)
    const ahead = at(Math.min(1, t + 0.01))
    const behind = at(Math.max(0, t - 0.01))
    samples.push({ ...point, dx: ahead.x - behind.x, dz: ahead.z - behind.z })
  }

  return samples
}

/** Tous les sentiers, échantillonnés finement : sert à tenir la forêt à l'écart. */
const ALL_PATH_POINTS = PLACES.filter((place) => place.id !== HOME_PLACE).flatMap((place) =>
  pathSamples(place, 1.5),
)

/** Distance au sentier le plus proche. */
export function distanceToPaths(x, z) {
  let nearest = Infinity
  for (const point of ALL_PATH_POINTS) {
    nearest = Math.min(nearest, Math.hypot(x - point.x, z - point.z))
  }
  return nearest
}
