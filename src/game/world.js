/**
 * Définition du monde du mode aventure.
 *
 * Le portfolio n'est plus une suite de diapositives : c'est une clairière vue du dessus, dans
 * laquelle chaque section occupe un lieu. On ne « change pas d'écran », on se déplace vers un
 * endroit, et le contenu de la section s'ouvre par-dessus le monde qui reste visible derrière.
 *
 * Ce fichier ne contient que des constantes : il est importé aussi bien par le pré-rendu que par
 * le navigateur, il ne doit donc jamais toucher à `window`.
 *
 * Les coordonnées sont exprimées en unités de monde (mètres 3D), directement utilisables par la
 * scène : plus d'unité intermédiaire « écran » comme dans l'ancien mode carte, où une même
 * position devait être traduite deux fois et finissait par diverger entre le décor et le contenu.
 */

/**
 * `kind` décrit la structure low-poly posée sur le lieu (voir `WorldScene.vue`). Chaque lieu a sa
 * silhouette : vu de haut, c'est elle qui rend la clairière reconnaissable, avant même son nom.
 *
 * `section` est l'identifiant du bloc HTML correspondant. Il reste dans le DOM en permanence —
 * c'est lui qui est indexé —, le mode aventure ne fait que décider lequel est présenté.
 */
export const PLACES = [
  // `radius` : le point de départ porte un campement entier, il lui faut plus de place que les
  // autres. Sans cela, le feu et les rondins se retrouveraient plantés dans les sapins.
  { id: 'hero', section: 'hero', kind: 'desk', x: 0, z: 0, radius: 15 },
  { id: 'about', section: 'about', kind: 'cabin', x: -15, z: -11 },
  { id: 'skills', section: 'skills', kind: 'workbench', x: 14, z: -13 },
  { id: 'projects', section: 'projects', kind: 'site', x: 19, z: 8 },
  { id: 'banner', section: 'banner', kind: 'signpost', x: -4, z: 17 },
  { id: 'footer', section: 'footer', kind: 'campfire', x: -18, z: 9 },
]

export const PLACE_IDS = PLACES.map((place) => place.id)

export function isKnownPlace(id) {
  return PLACE_IDS.includes(id)
}

export function placeById(id) {
  return PLACES.find((place) => place.id === id) ?? null
}

/** Rayon aplani et déboisé par défaut autour d'un lieu : la clairière où se pose sa structure. */
export const CLEARING_RADIUS = 7.5

/** Rayon de la clairière d'un lieu donné. */
export function clearingRadius(place) {
  return place.radius ?? CLEARING_RADIUS
}

/**
 * Le lieu d'où part la visite. C'est là que se trouve l'avatar : on arrive au-dessus de lui, et
 * c'est en cliquant dessus qu'on ouvre la présentation.
 */
export const HOME_PLACE = 'hero'
