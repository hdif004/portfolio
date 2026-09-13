/**
 * Plans de caméra : où se place la caméra et ce qu'elle regarde, pour chaque état du monde.
 *
 * Pur calcul, sans `three` ni `window` : `useWorld` décide du plan, `CameraRig` l'anime avec GSAP.
 * Séparer les deux permet de régler un cadrage sans toucher à l'animation, et inversement.
 */
import { DEFAULT_LOOK_AT } from '@/game/world'

/** Vue d'ensemble du campement : presque à la verticale, toutes les zones dans le cadre. */
export const OVERVIEW_SHOT = {
  position: { x: 0, y: 150, z: 42 },
  target: { x: 0, y: 0, z: 4 },
}

/**
 * Rapprochement quand le contenu d'une zone est déployé : juste assez pour que les objets auxquels
 * les cartes sont accrochées se lisent, sans perdre la place autour pour les cartes elles-mêmes.
 */
const OPEN_ZOOM = 0.9

/** Plan d'une zone, vue depuis l'angle propre à cette zone (voir `PLACES` dans `game/world`). */
export function shotForPlace(place, { open = false } = {}) {
  const zoom = open ? OPEN_ZOOM : 1
  const [ox, oy, oz] = place.camera.offset.map((value) => value * zoom)
  const [lx, ly, lz] = place.camera.lookAt ?? DEFAULT_LOOK_AT

  const target = { x: place.x + lx, y: ly, z: place.z + lz }
  return {
    position: { x: target.x + ox, y: ly + oy, z: target.z + oz },
    target,
  }
}
