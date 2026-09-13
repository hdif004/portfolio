/**
 * Registre des objets cliquables du monde (zones et sentiers) et zone survolée.
 *
 * Chaque objet enregistré porte l'identifiant de sa zone : cliquer sur un sentier mène à la zone
 * où il aboutit, exactement comme cliquer sur la zone elle-même.
 */
import { ref } from 'vue'

const objects = new Set()

/** Identifiant de la zone sous le pointeur, ou `null`. */
export const hoveredZone = ref(null)

/** Enregistre un objet cliquable. Renvoie la fonction de désinscription. */
export function registerPickable(object, placeId) {
  object.userData.placeId = placeId
  objects.add(object)
  return () => objects.delete(object)
}

export function pickables() {
  return [...objects]
}
