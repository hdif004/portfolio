/**
 * Définition du monde du mode aventure : les zones et la façon dont la caméra les présente.
 *
 * Le portfolio est un campement en forêt vu de trois quarts. Chaque section occupe une zone reliée
 * au campement par un sentier ; on ne « change pas d'écran », la caméra se déplace vers la zone et
 * le contenu s'ouvre par-dessus le monde qui reste visible derrière.
 *
 * Ce fichier ne contient que des constantes : il est importé aussi bien par le pré-rendu que par
 * le navigateur, il ne doit donc jamais toucher à `window` ni à `three`.
 *
 * Ce qui est posé dans chaque zone (modèles, lumières) vit dans `src/world/scenery.js` : ici on
 * décrit où sont les zones et comment on les regarde, pas de quoi elles sont faites.
 */

/**
 * - `x`, `z` : centre de la zone, en unités de monde (≈ mètres).
 * - `radius` : rayon de la clairière aplanie et déboisée autour de la zone.
 * - `camera.offset` : position de la caméra par rapport à la zone. Chaque zone a son propre angle :
 *   c'est ce changement d'azimut pendant le trajet qui donne l'effet « sélection de personnage »
 *   plutôt qu'un simple travelling. La zone est tournée face à cette caméra (voir `WorldZone`).
 * - `camera.lookAt` : point visé, relatif au centre de la zone.
 * - `markerHeight` : hauteur de l'étiquette HTML au-dessus de la zone.
 *
 * `section` est l'identifiant du bloc HTML correspondant. Il reste dans le DOM en permanence —
 * c'est lui qui est indexé —, le mode aventure ne fait que décider lequel est présenté.
 */
export const PLACES = [
  {
    id: 'hero',
    section: 'hero',
    x: 0,
    z: 0,
    radius: 13,
    camera: { offset: [3, 62, 20] },
    markerHeight: 5,
  },
  { id: 'about', section: 'about', x: -26, z: -18, camera: { offset: [6, 52, 16] } },
  { id: 'skills', section: 'skills', x: 24, z: -22, camera: { offset: [-6, 52, 16] } },
  { id: 'projects', section: 'projects', x: 32, z: 12, camera: { offset: [-7, 52, 15] } },
  { id: 'banner', section: 'banner', x: -6, z: 30, camera: { offset: [2, 50, 15] } },
  { id: 'footer', section: 'footer', x: -30, z: 15, camera: { offset: [7, 52, 15] } },
]

export const PLACE_IDS = PLACES.map((place) => place.id)

export function isKnownPlace(id) {
  return PLACE_IDS.includes(id)
}

export function placeById(id) {
  return PLACES.find((place) => place.id === id) ?? null
}

/** Rayon aplani et déboisé par défaut autour d'une zone. */
export const CLEARING_RADIUS = 9

/** Rayon de la clairière d'une zone donnée. */
export function clearingRadius(place) {
  return place.radius ?? CLEARING_RADIUS
}

/** Point visé par défaut dans une zone : un peu au-dessus du sol, à hauteur des objets. */
export const DEFAULT_LOOK_AT = [0, 1.5, 0]

/** Hauteur par défaut de l'étiquette d'une zone. */
export const MARKER_HEIGHT = 6

/**
 * La zone d'où part la visite. C'est le campement où se trouve l'avatar : on arrive au-dessus de
 * lui, et c'est en cliquant dessus qu'on ouvre la présentation.
 */
export const HOME_PLACE = 'hero'
