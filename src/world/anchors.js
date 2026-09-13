/**
 * Points d'ancrage du contenu dans le monde.
 *
 * Une carte, un parchemin ou une planche est accroché à un objet de sa zone : on le désigne par un
 * nom (« l'établi », « la caisse ouverte »), défini en coordonnées locales dans `scenery.js`, et on
 * obtient ici sa position dans le monde — rotation et échelle de la zone comprises.
 *
 * Pur calcul, sans `three` : les composants de contenu l'utilisent pour écrire leur ancre, et
 * `CameraRig` la projette à l'écran à chaque image.
 */
import { placeById } from '@/game/world'
import { SCENERY, ZONE_SCALE } from './scenery'
import { heightAt } from './terrain'

/** Orientation d'une zone : tournée face à sa caméra, pour que son premier plan soit vu de face. */
export function zoneRotation(place) {
  return Math.atan2(place.camera.offset[0], place.camera.offset[2])
}

/** Position dans le monde d'une ancre nommée, sous la forme `[x, y, z]`. */
export function anchorPosition(placeId, anchor) {
  const place = placeById(placeId)
  if (!place) return [0, 0, 0]

  const local = SCENERY[placeId]?.anchors?.[anchor] ?? [0, 0, 0]
  const [x, y, z] = local.map((value) => value * ZONE_SCALE)
  const angle = zoneRotation(place)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  // Même rotation autour de la verticale que `Object3D.rotation.y` dans three.
  return [
    place.x + x * cos + z * sin,
    heightAt(place.x, place.z) + y,
    place.z - x * sin + z * cos,
  ]
}
