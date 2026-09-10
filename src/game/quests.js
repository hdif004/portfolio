/**
 * Données du mode aventure.
 *
 * Ce fichier ne contient que des constantes : il est importé aussi bien par le pré-rendu que par
 * le navigateur, il ne doit donc jamais toucher à `window`.
 *
 * Règle de conception : le jeu habille le portfolio, il ne le conditionne jamais. Aucune section
 * n'est masquée tant qu'une quête n'est pas terminée — le contenu reste lisible, indexable et
 * accessible même si le mode aventure est désactivé.
 */

/**
 * `trigger: 'enter'` → validée dès l'arrivée sur la page (le premier retour immédiat, celui qui
 *                     fait comprendre au visiteur qu'il y a un jeu).
 * `trigger: 'view'`  → validée quand la section traverse le milieu de l'écran, donc quand elle a
 *                     réellement eu une chance d'être lue.
 * `trigger: 'action'`→ validée par un vrai geste (ici : envoyer le formulaire).
 */
export const QUESTS = [
  { id: 'hero', anchor: 'hero', xp: 50, trigger: 'enter' },
  { id: 'about', anchor: 'about', xp: 100, trigger: 'view' },
  { id: 'skills', anchor: 'skills', xp: 100, trigger: 'view' },
  { id: 'projects', anchor: 'projects', xp: 150, trigger: 'view' },
  { id: 'contact', anchor: 'contact', xp: 200, trigger: 'action' },
]

export const QUEST_IDS = QUESTS.map((quest) => quest.id)

export const BADGES = [
  { id: 'firstQuest', xp: 25 },
  { id: 'darkMode', xp: 25 },
  { id: 'polyglot', xp: 25 },
  { id: 'konami', xp: 25 },
  { id: 'completionist', xp: 25 },
]

const BADGE_IDS = new Set(BADGES.map((badge) => badge.id))

/** Seuils d'expérience. L'index dans le tableau = niveau - 1. */
export const LEVELS = [0, 150, 350, 600]

export const MAX_LEVEL = LEVELS.length

export function xpForQuest(id) {
  return QUESTS.find((quest) => quest.id === id)?.xp ?? 0
}

export function xpForBadge(id) {
  return BADGES.find((badge) => badge.id === id)?.xp ?? 0
}

export function isKnownQuest(id) {
  return QUEST_IDS.includes(id)
}

export function isKnownBadge(id) {
  return BADGE_IDS.has(id)
}

/** Niveau atteint pour un total d'expérience donné (1 à MAX_LEVEL). */
export function levelForXp(xp) {
  let level = 1
  for (let index = 1; index < LEVELS.length; index += 1) {
    if (xp >= LEVELS[index]) level = index + 1
  }
  return level
}
