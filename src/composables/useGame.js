/**
 * État du mode aventure : progression, niveau, badges, et bascule aventure / classique.
 *
 * Singleton volontaire : l'état est créé une fois à l'import et partagé par tous les composants,
 * ce qui évite d'installer un store complet pour cinq quêtes.
 *
 * Contraintes respectées ici :
 * - aucun accès à `window` en dehors de `hydrateGame()`, appelé depuis `onMounted` — le
 *   pré-rendu doit pouvoir importer ce module sans planter ;
 * - `ready` reste à `false` au moment de l'hydratation pour que le premier rendu client soit
 *   identique au HTML pré-rendu (sinon Vue signale une divergence) ;
 * - toute lecture/écriture de `localStorage` est protégée : navigation privée, stockage bloqué
 *   ou quota plein ne doivent jamais casser la page.
 */
import { computed, ref, watch } from 'vue'
import {
  BADGES,
  LEVELS,
  MAX_LEVEL,
  QUESTS,
  isKnownBadge,
  isKnownQuest,
  levelForXp,
  xpForBadge,
  xpForQuest,
} from '@/game/quests'

const STORAGE_KEY = 'portfolio-game-v1'
const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

const ready = ref(false)
const mode = ref('adventure')
const completed = ref([])
const badges = ref([])
const journalOpen = ref(false)
/**
 * Vrai quand le mode carte pilote l'affichage (voir `useDeck`). Le drapeau vit ici pour que
 * `useDeck` puisse importer `useGame` sans dépendance circulaire.
 */
const deckActive = ref(false)
const toasts = ref([])

let toastId = 0
let hydrated = false

const isAdventure = computed(() => mode.value === 'adventure')

const xp = computed(
  () =>
    completed.value.reduce((total, id) => total + xpForQuest(id), 0) +
    badges.value.reduce((total, id) => total + xpForBadge(id), 0),
)

const level = computed(() => levelForXp(xp.value))
const isMaxLevel = computed(() => level.value >= MAX_LEVEL)

/** Progression à l'intérieur du niveau courant, en pourcentage (100 % une fois au niveau max). */
const levelProgress = computed(() => {
  if (isMaxLevel.value) return 100
  const floor = LEVELS[level.value - 1]
  const ceiling = LEVELS[level.value]
  return Math.round(((xp.value - floor) / (ceiling - floor)) * 100)
})

const xpToNextLevel = computed(() => (isMaxLevel.value ? 0 : LEVELS[level.value] - xp.value))

const quests = computed(() =>
  QUESTS.map((quest) => ({
    ...quest,
    done: completed.value.includes(quest.id),
  })),
)

const completedCount = computed(() => quests.value.filter((quest) => quest.done).length)
const allQuestsDone = computed(() => completedCount.value === QUESTS.length)

/** Première quête non terminée : c'est elle qui est mise en avant dans le journal. */
const currentQuestId = computed(() => quests.value.find((quest) => !quest.done)?.id ?? null)

const unlockedBadges = computed(() =>
  BADGES.map((badge) => ({ ...badge, unlocked: badges.value.includes(badge.id) })),
)

function pushToast(kind, key, xpGain = 0) {
  toastId += 1
  const id = toastId
  toasts.value = [...toasts.value, { id, kind, key, xp: xpGain }]
  // Le toast est purement décoratif : il disparaît seul, sans jamais voler le focus.
  setTimeout(() => dismissToast(id), 5000)
}

function dismissToast(id) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: mode.value,
        completed: completed.value,
        badges: badges.value,
        journalOpen: journalOpen.value,
      }),
    )
  } catch {
    // Stockage indisponible : la progression ne survivra pas au rechargement, sans plus.
  }
}

function completeQuest(id) {
  if (!isKnownQuest(id) || completed.value.includes(id)) return

  const previousLevel = level.value
  completed.value = [...completed.value, id]
  pushToast('quest', id, xpForQuest(id))

  if (completed.value.length === 1) unlockBadge('firstQuest')
  if (allQuestsDone.value) unlockBadge('completionist')
  if (level.value > previousLevel) pushToast('level', String(level.value))

  persist()
}

function unlockBadge(id) {
  if (!isKnownBadge(id) || badges.value.includes(id)) return

  const previousLevel = level.value
  badges.value = [...badges.value, id]
  pushToast('badge', id, xpForBadge(id))
  if (level.value > previousLevel) pushToast('level', String(level.value))

  persist()
}

function setMode(next) {
  mode.value = next === 'classic' ? 'classic' : 'adventure'
  persist()
}

function toggleMode() {
  setMode(isAdventure.value ? 'classic' : 'adventure')
}

function toggleJournal() {
  journalOpen.value = !journalOpen.value
  // Le journal replié doit le rester d'une page à l'autre : c'est un refus explicite.
  persist()
}

function resetProgress() {
  completed.value = []
  badges.value = []
  toasts.value = []
  persist()
}

/**
 * Les quêtes « vue » se terminent quand leur section entre dans le champ de vision.
 * L'observation tourne dans les deux modes : en repassant en aventure, le visiteur retrouve la
 * progression correspondant à ce qu'il a réellement lu.
 */
/**
 * Première visite : le journal se déplie à la deuxième quête, c'est-à-dire quand le visiteur a
 * quitté le hero et que le jeu a réellement commencé. Sur mobile il reste en pastille, l'écran
 * est trop petit pour un panneau permanent.
 */
function revealJournalOnFirstScroll() {
  if (!window.matchMedia('(min-width: 768px)').matches) return

  const stop = watch(completedCount, (count) => {
    if (count < 2) return
    journalOpen.value = true
    stop()
  })
}

function watchQuestSections() {
  if (typeof IntersectionObserver === 'undefined') return

  const pending = QUESTS.filter((quest) => quest.trigger === 'view')
  if (!pending.length) return

  // Bande centrale de l'écran plutôt qu'un pourcentage de surface : une section très haute
  // n'atteint jamais 25 % de visibilité, et un scroll rapide ne doit pas sauter une quête.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        // En mode carte, c'est l'arrivée sur une case qui valide la quête : sans ce garde-fou,
        // les sections survolées par la caméra pendant un trajet seraient toutes validées d'un coup.
        if (deckActive.value) continue
        const quest = pending.find((item) => item.anchor === entry.target.id)
        if (quest) completeQuest(quest.id)
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '-20% 0px -20% 0px', threshold: 0 },
  )

  for (const quest of pending) {
    const section = document.getElementById(quest.anchor)
    if (section && !completed.value.includes(quest.id)) observer.observe(section)
  }
}

function watchKonami() {
  const buffer = []

  window.addEventListener('keydown', (event) => {
    // Un utilisateur en train de remplir le formulaire de contact ne joue pas au Konami.
    const tag = event.target?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    buffer.push(event.key)
    if (buffer.length > KONAMI.length) buffer.shift()
    if (buffer.length < KONAMI.length) return
    if (!KONAMI.every((key, index) => key.toLowerCase() === buffer[index]?.toLowerCase())) return

    buffer.length = 0
    // Le code Konami tapé en mode classique bascule en mode aventure : c'est la découverte.
    if (!isAdventure.value) setMode('adventure')
    unlockBadge('konami')
  })
}

/** À appeler une seule fois, depuis `onMounted` de l'application. */
export function hydrateGame() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true

  let savedJournalOpen = null

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved) {
      if (typeof saved.journalOpen === 'boolean') savedJournalOpen = saved.journalOpen
      if (saved.mode) mode.value = saved.mode === 'classic' ? 'classic' : 'adventure'
      if (Array.isArray(saved.completed)) completed.value = saved.completed.filter(isKnownQuest)
      if (Array.isArray(saved.badges)) badges.value = saved.badges.filter(isKnownBadge)
    }
  } catch {
    // Données corrompues : on repart d'une progression vierge.
  }

  // Le hero est la page la plus importante du site : le journal ne doit pas la recouvrir à
  // l'arrivée. Il s'ouvre tout seul un peu plus bas (voir `revealJournalOnFirstScroll`), sauf si
  // le visiteur a déjà exprimé un choix, auquel cas on le respecte.
  if (typeof savedJournalOpen === 'boolean') {
    journalOpen.value = savedJournalOpen
  } else {
    journalOpen.value = false
    revealJournalOnFirstScroll()
  }

  // Quêtes validées par la simple arrivée : le retour est immédiat, avant tout scroll.
  for (const quest of QUESTS.filter((item) => item.trigger === 'enter')) completeQuest(quest.id)

  watchQuestSections()
  watchKonami()

  ready.value = true
}

// La bascule de mode se voit tout de suite : plus de toast en attente quand on repasse en classique.
watch(isAdventure, (adventure) => {
  if (!adventure) toasts.value = []
})

export { deckActive }

export function useGame() {
  return {
    ready,
    deckActive,
    mode,
    isAdventure,
    quests,
    completed,
    unlockedBadges,
    badges,
    toasts,
    journalOpen,
    xp,
    level,
    levelProgress,
    xpToNextLevel,
    isMaxLevel,
    completedCount,
    totalQuests: QUESTS.length,
    allQuestsDone,
    currentQuestId,
    completeQuest,
    unlockBadge,
    toggleMode,
    setMode,
    toggleJournal,
    resetProgress,
    dismissToast,
  }
}
