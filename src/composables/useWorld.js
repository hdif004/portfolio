/**
 * Mode aventure : le portfolio devient une clairière vue du dessus.
 *
 * Le monde est permanent. On ne passe pas d'une diapositive à l'autre : la caméra se déplace vers
 * un lieu, et le contenu de la section s'ouvre dans un panneau posé par-dessus, pendant que la
 * forêt reste visible derrière. C'est l'inverse de l'ancien mode carte, où le décor 3D n'existait
 * que pendant les transitions et n'était donc jamais réellement vu.
 *
 * Trois contraintes ont guidé l'implémentation :
 * - le DOM ne change jamais : on n'ajoute que des classes après le montage, donc le HTML
 *   pré-rendu et l'hydratation restent intacts ;
 * - le contenu garde sa taille de police normale. L'ancien mode compressait la racine à 70 % pour
 *   faire tenir chaque section dans un écran ; ici le panneau défile, ce qui est le comportement
 *   attendu d'un panneau ;
 * - tout est atteignable au clavier : chaque lieu est un vrai bouton, Échap ferme le panneau.
 */
import { computed, reactive, ref, watch } from 'vue'
import { PLACES, HOME_PLACE, isKnownPlace, placeById } from '@/game/world'
import { questForPlace } from '@/game/quests'
import { worldActive, useGame } from '@/composables/useGame'

/** Lieu sur lequel la caméra est posée. */
const activeId = ref(HOME_PLACE)
/** Vrai quand le panneau de contenu est ouvert. Fermé, on voit le monde en entier. */
const panelOpen = ref(false)
/**
 * Vrai dès qu'un lieu a été ouvert une fois. Sert à n'afficher l'indice d'entrée (« cliquez sur
 * un lieu ») que tant qu'il est utile : une consigne qui reste après avoir été comprise devient
 * du bruit.
 */
const everOpened = ref(false)

/**
 * Position visée par la caméra, en unités de monde. `WorldScene` lit ces valeurs à chaque image et
 * s'en rapproche progressivement : c'est la scène qui possède le temps, pas ce module.
 *
 * `height` est l'altitude de survol : basse quand on examine un lieu, haute quand on prend du
 * recul pour voir la clairière entière.
 */
export const worldCamera = reactive({ x: 0, z: 0, height: 26 })

/** Altitudes de survol. Un seul endroit à régler pour changer la sensation de la caméra. */
const HEIGHT_OVERVIEW = 96
const HEIGHT_PLACE = 42
const HEIGHT_PANEL = 48

/**
 * Décalage latéral de la caméra quand la bulle du point de départ est ouverte : le personnage
 * glisse vers la droite de l'écran, la bulle occupe la gauche. Une bulle de dialogue qui recouvre
 * celui qui parle n'est plus une bulle de dialogue.
 *
 * Le décalage est latéral et non en profondeur : vue du dessus, la caméra n'est reculée que d'un
 * quart de son altitude, si bien qu'avancer la cible de quelques mètres fait passer le lieu
 * derrière la caméra au lieu de le faire descendre à l'écran.
 */
const BUBBLE_OFFSET = 13

/** En dessous de cette largeur, la bulle occupe tout l'écran : il n'y a plus de côté où pousser. */
const WIDE_SCREEN = 900

const { isAdventure, ready, completeQuest } = useGame()

const enabled = computed(() => ready.value && isAdventure.value)
const activePlace = computed(() => placeById(activeId.value) ?? PLACES[0])
const places = computed(() =>
  PLACES.map((place, index) => ({ ...place, index, active: place.id === activeId.value })),
)
const total = PLACES.length

let listeners = []

function on(target, type, handler, options) {
  target.addEventListener(type, handler, options)
  listeners.push(() => target.removeEventListener(type, handler, options))
}

/** Recalcule la cible de la caméra d'après le lieu actif et l'état du panneau. */
function aimCamera() {
  const place = activePlace.value
  const bubble =
    panelOpen.value && place.id === HOME_PLACE && window.innerWidth >= WIDE_SCREEN

  worldCamera.x = place.x - (bubble ? BUBBLE_OFFSET : 0)
  worldCamera.z = place.z
  worldCamera.height = panelOpen.value ? HEIGHT_PANEL : HEIGHT_PLACE
}

/** Déplace la caméra vers un lieu sans ouvrir son contenu. */
export function goToPlace(id) {
  if (!isKnownPlace(id)) return
  activeId.value = id
  aimCamera()
}

/**
 * Ouvre un lieu : la caméra s'y rend et le panneau s'affiche.
 *
 * C'est ici, et seulement ici, qu'une quête de visite est validée : il a fallu un clic. Rien ne se
 * valide plus au passage de la caméra, contrairement à l'ancien mode carte où traverser le monde
 * suffisait à tout cocher.
 */
export function openPlace(id, { focus = true } = {}) {
  if (!isKnownPlace(id)) return

  activeId.value = id
  panelOpen.value = true
  everOpened.value = true
  aimCamera()

  const quest = questForPlace(id)
  if (quest) completeQuest(quest.id)

  if (!focus) return
  // Le focus part sur le panneau : la suite de la tabulation se passe dans le contenu ouvert.
  requestAnimationFrame(() => {
    document.getElementById('world-panel')?.focus({ preventScroll: true })
  })
}

export function closePanel({ focus = true } = {}) {
  if (!panelOpen.value) return

  panelOpen.value = false
  aimCamera()

  if (!focus) return
  // On rend le focus au marqueur du lieu qu'on vient de quitter, pas au début de la page.
  requestAnimationFrame(() => {
    document.querySelector(`.world-marker[data-place="${activeId.value}"]`)?.focus()
  })
}

export function togglePlace(id) {
  if (panelOpen.value && activeId.value === id) closePanel()
  else openPlace(id)
}

/** Prend de l'altitude : le panneau se ferme et on voit la clairière entière. */
export function showOverview() {
  panelOpen.value = false
  worldCamera.x = 0
  worldCamera.z = 0
  worldCamera.height = HEIGHT_OVERVIEW
}

function step(offset) {
  const index = PLACES.findIndex((place) => place.id === activeId.value)
  const next = PLACES[(index + offset + total) % total]
  if (!next) return
  if (panelOpen.value) openPlace(next.id)
  else goToPlace(next.id)
}

export function goToNext() {
  step(1)
}

export function goToPrevious() {
  step(-1)
}

function isTypingTarget(target) {
  const tag = target?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable
}

function attachListeners() {
  // Les liens d'ancre pilotent le monde : un seul écouteur délégué plutôt qu'un `@click` dispersé
  // dans chaque composant (navigation, menu mobile, journal de quêtes, boutons du hero…).
  on(document, 'click', (event) => {
    const link = event.target.closest?.('a[href^="#"]')
    if (!link) return
    const id = link.getAttribute('href').slice(1)
    const place = PLACES.find((item) => item.section === id || item.id === id)
    if (!place) return
    event.preventDefault()
    openPlace(place.id)
  })

  on(window, 'keydown', (event) => {
    if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return

    if (event.key === 'Escape' && panelOpen.value) {
      event.preventDefault()
      closePanel()
      return
    }

    // Tant qu'un panneau est ouvert, les flèches appartiennent au contenu (défilement, liens).
    if (panelOpen.value) return

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      goToNext()
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      goToPrevious()
    } else if (event.key === 'm' || event.key === 'M') {
      event.preventDefault()
      showOverview()
    } else if (event.key === 'Enter' || event.key === ' ') {
      // Le focus est sur le monde lui-même, pas sur un bouton : on entre dans le lieu visé.
      if (event.target === document.body) {
        event.preventDefault()
        openPlace(activeId.value)
      }
    }
  })

  // Lien partagé ou bouton « précédent » du navigateur : le monde suit l'ancre.
  on(window, 'hashchange', () => {
    const id = window.location.hash.slice(1)
    const place = PLACES.find((item) => item.section === id || item.id === id)
    if (place) openPlace(place.id, { focus: false })
  })
}

function activate() {
  document.documentElement.classList.add('world-mode')

  // On ouvre sur le lieu correspondant à l'ancre de l'URL, sinon sur le point de départ.
  const fromHash = PLACES.find((place) => place.section === window.location.hash.slice(1))
  activeId.value = fromHash?.id ?? HOME_PLACE
  // À l'arrivée, le monde est visible et rien n'est ouvert : le visiteur voit d'abord où il est.
  panelOpen.value = false

  aimCamera()
  attachListeners()
  worldActive.value = true

  // Un lien partagé vers une section ouvre directement ce contenu : on ne force personne à
  // traverser le jeu pour lire ce qu'il était venu lire.
  if (fromHash) openPlace(fromHash.id, { focus: false })
}

function deactivate() {
  worldActive.value = false
  panelOpen.value = false
  document.documentElement.classList.remove('world-mode')

  for (const off of listeners) off()
  listeners = []
}

/** À appeler une fois, depuis `onMounted` de l'application. */
export function initWorld() {
  if (typeof window === 'undefined') return
  watch(enabled, (active) => (active ? activate() : deactivate()), { immediate: true })
}

export function useWorld() {
  return {
    places,
    activeId,
    everOpened,
    activePlace,
    panelOpen,
    total,
    camera: worldCamera,
    goToPlace,
    openPlace,
    closePanel,
    togglePlace,
    showOverview,
    goToNext,
    goToPrevious,
  }
}
