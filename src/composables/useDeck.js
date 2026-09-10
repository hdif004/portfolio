/**
 * Mode carte : les sections ne défilent plus, elles sont posées à des endroits d'un monde et
 * c'est la caméra qui voyage de l'une à l'autre.
 *
 * Le déplacement est calqué sur le changement de personnage de GTA : la caméra grimpe très haut
 * d'un coup, traverse la carte à cette altitude en suivant une courbe, puis replonge sur le lieu
 * d'arrivée. Ce n'est pas un fondu entre deux diapositives : pendant le trajet on voit réellement
 * le monde, les autres lieux et la route qui les relie.
 *
 * Actif uniquement en mode aventure — le mode classique garde la page qui défile, qui reste la
 * version de référence pour le référencement et pour un visiteur qui n'a pas envie de jouer.
 *
 * Trois contraintes ont guidé l'implémentation :
 * - le DOM ne change jamais : on n'ajoute que des classes et des styles après le montage, donc le
 *   HTML pré-rendu et l'hydratation restent intacts ;
 * - aucune section n'est masquée (`display: none`) : le contenu reste présent pour les crawlers ;
 * - une section plus haute que l'écran défile à l'intérieur de son lieu. Sans cela, une partie du
 *   contenu deviendrait inatteignable au clavier comme au doigt (WCAG 2.2 — 1.4.10 Reflow).
 */
import { computed, reactive, ref, watch } from 'vue'
import { QUESTS } from '@/game/quests'
import { deckActive, useGame } from '@/composables/useGame'

/**
 * Position de chaque lieu, en unités d'écran (un pas de 1 = 110 % de la largeur ou de la hauteur).
 * Les coordonnées sont volontairement irrégulières : un parcours en ligne droite se lit comme un
 * carrousel, un parcours dispersé se lit comme une carte. Aucune paire de lieux n'est assez proche
 * pour que deux cartes se recouvrent — il faut au moins ~0,91 d'écart sur l'un des deux axes.
 */
const MAP = [
  { id: 'hero', x: 0, y: 0 },
  { id: 'about', x: 1.5, y: -0.4 },
  { id: 'skills', x: 2.8, y: 0.4 },
  { id: 'projects', x: 1.7, y: 1.6 },
  { id: 'banner', x: 0.2, y: 1.9 },
  { id: 'contact', x: -1.2, y: 1.0 },
  { id: 'footer', x: -1.5, y: 2.4 },
]

/** Espacement d'une unité de carte, en pourcentage de l'écran. */
const SPACING = 110

/** Centre géométrique du monde : sert à faire bomber les trajectoires vers l'extérieur. */
const CENTER = MAP.reduce(
  (acc, point) => ({ x: acc.x + point.x / MAP.length, y: acc.y + point.y / MAP.length }),
  { x: 0, y: 0 },
)

const CURVE = 0.22 // amplitude de la courbe de vol, en fraction de la distance parcourue
const SETTLE_MS = 260

/**
 * Altitude du survol. Un saut court n'a pas besoin de monter aussi haut qu'une traversée : la
 * caméra prend juste assez de recul pour qu'on comprenne où l'on va.
 */
const flightScale = (distance) => Math.min(0.62, Math.max(0.24, 0.66 - distance * 0.1))
const flightDuration = (distance) => Math.min(2100, Math.max(900, 760 + distance * 270))

const activeIndex = ref(0)
const traveling = ref(false)

/** Position courante de la caméra, partagée avec le décor 3D et les marqueurs. */
export const mapCamera = reactive({ x: 0, y: 0, scale: 1, rotate: 0 })
export const MAP_POINTS = MAP
export const MAP_SPACING = SPACING

const { isAdventure, ready, completeQuest } = useGame()

const enabled = computed(() => ready.value && isAdventure.value)
const activeSlide = computed(() => MAP[activeIndex.value])
const slides = computed(() =>
  MAP.map((point, index) => ({ ...point, index, active: index === activeIndex.value })),
)
const canGoPrevious = computed(() => activeIndex.value > 0)
const canGoNext = computed(() => activeIndex.value < MAP.length - 1)

let stage = null
let frame = 0
let lastTravelAt = 0
let listeners = []

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const elementFor = (id) => document.getElementById(id)

// Départ très franc, plateau en altitude, arrivée qui se pose : la signature du survol.
const easeInOutQuint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2)
const bell = (t) => Math.sin(Math.PI * t) ** 0.65

let far = null

/** Écrit la position de la caméra sur la scène : un seul `transform`, donc une seule composition. */
function applyCamera() {
  if (!stage) return

  stage.style.transform =
    `rotate(${mapCamera.rotate}deg) scale(${mapCamera.scale}) ` +
    `translate(${-SPACING * mapCamera.x}%, ${-SPACING * mapCamera.y}%)`
  // Sert aux marqueurs, qui compensent le zoom pour rester lisibles vus d'en haut.
  stage.style.setProperty('--cam-scale', String(mapCamera.scale))

  // Assez haut pour voir le monde : on montre les noms de lieux et on estompe les cartes.
  const next = mapCamera.scale < 0.82
  if (next !== far) {
    far = next
    document.documentElement.classList.toggle('is-far', next)
  }
}

function on(target, type, handler, options) {
  target.addEventListener(type, handler, options)
  listeners.push(() => target.removeEventListener(type, handler, options))
}

/**
 * Un lieu n'est atteignable au clavier que lorsqu'il est à l'écran : `inert` retire les autres du
 * parcours de tabulation et de l'arbre d'accessibilité, sinon le focus part sur des liens
 * invisibles situés à l'autre bout de la carte.
 */
function updateSlideStates() {
  for (const [index, point] of MAP.entries()) {
    const el = elementFor(point.id)
    if (!el) continue
    el.classList.toggle('is-here', index === activeIndex.value)
    if (index === activeIndex.value) el.removeAttribute('inert')
    else el.setAttribute('inert', '')
  }
}

/** Petit rebond d'arrivée : la caméra se pose au lieu de s'arrêter net. */
function settle() {
  const start = performance.now()

  const step = (now) => {
    const u = Math.min(1, (now - start) / SETTLE_MS)
    mapCamera.scale = 1 + 0.028 * Math.sin(Math.PI * u) * (1 - u)
    applyCamera()

    if (u < 1) {
      frame = requestAnimationFrame(step)
      return
    }

    mapCamera.scale = 1
    applyCamera()
    traveling.value = false
    document.documentElement.classList.remove('is-traveling')
  }

  frame = requestAnimationFrame(step)
}

function travelTo(index, { focus = false } = {}) {
  const target = MAP[index]
  if (!target || !stage || index === activeIndex.value) return

  const from = { x: mapCamera.x, y: mapCamera.y }
  activeIndex.value = index
  lastTravelAt = Date.now()
  cancelAnimationFrame(frame)

  // Le lieu d'arrivée repart de son propre haut : on ne conserve pas le défilement interne.
  const targetEl = elementFor(target.id)
  if (targetEl) targetEl.scrollTop = 0

  const arrive = () => {
    updateSlideStates()
    if (focus && targetEl) targetEl.focus({ preventScroll: true })
    // Chaque étape valide sa quête, s'il y en a une attachée à ce lieu.
    const quest = QUESTS.find((item) => item.id === target.id && item.trigger === 'view')
    if (quest) completeQuest(quest.id)
  }

  if (prefersReducedMotion()) {
    Object.assign(mapCamera, { x: target.x, y: target.y, scale: 1, rotate: 0 })
    applyCamera()
    arrive()
    return
  }

  const dx = target.x - from.x
  const dy = target.y - from.y
  const distance = Math.hypot(dx, dy)

  /*
   * Point de contrôle de la courbe de vol : le milieu du trajet, poussé perpendiculairement vers
   * l'extérieur de la carte. La caméra décrit alors un arc, pas un rail.
   */
  const midX = (from.x + target.x) / 2
  const midY = (from.y + target.y) / 2
  const perpX = -dy / (distance || 1)
  const perpY = dx / (distance || 1)
  const outward = Math.sign((midX - CENTER.x) * perpX + (midY - CENTER.y) * perpY) || 1
  const controlX = midX + perpX * outward * distance * CURVE
  const controlY = midY + perpY * outward * distance * CURVE

  const apex = flightScale(distance)
  const duration = flightDuration(distance)
  const tilt = (Math.sign(dx) || 1) * 1.1
  const start = performance.now()

  traveling.value = true
  document.documentElement.classList.add('is-traveling')

  const step = (now) => {
    const t = Math.min(1, (now - start) / duration)
    const p = easeInOutQuint(t)
    const inverse = 1 - p

    // Bézier quadratique : départ → point de contrôle → arrivée.
    mapCamera.x = inverse * inverse * from.x + 2 * inverse * p * controlX + p * p * target.x
    mapCamera.y = inverse * inverse * from.y + 2 * inverse * p * controlY + p * p * target.y
    mapCamera.scale = 1 - (1 - apex) * bell(t)
    mapCamera.rotate = tilt * bell(t)
    applyCamera()

    if (t < 1) {
      frame = requestAnimationFrame(step)
      return
    }

    Object.assign(mapCamera, { x: target.x, y: target.y, rotate: 0 })
    arrive()
    settle()
  }

  frame = requestAnimationFrame(step)
}

export function goTo(id, options) {
  const index = MAP.findIndex((point) => point.id === id)
  if (index !== -1) travelTo(index, options)
}

export function goToNext(options) {
  travelTo(activeIndex.value + 1, options)
}

export function goToPrevious(options) {
  travelTo(activeIndex.value - 1, options)
}

/** Vrai si le défilement interne du lieu est arrivé au bout, dans le sens demandé. */
function atScrollEdge(el, direction) {
  if (!el) return true
  const bottom = el.scrollHeight - el.clientHeight - el.scrollTop
  return direction > 0 ? bottom <= 2 : el.scrollTop <= 2
}

function isTypingTarget(target) {
  const tag = target?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable
}

function attachListeners() {
  // Les liens d'ancre pilotent la caméra : un seul écouteur délégué plutôt qu'un `@click` dispersé
  // dans chaque composant (navigation, menu mobile, journal de quêtes, boutons du hero…).
  on(document, 'click', (event) => {
    const link = event.target.closest?.('a[href^="#"]')
    if (!link) return
    const id = link.getAttribute('href').slice(1)
    if (!MAP.some((point) => point.id === id)) return
    event.preventDefault()
    goTo(id, { focus: true })
  })

  on(window, 'keydown', (event) => {
    if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return

    const el = elementFor(activeSlide.value.id)
    const forward = ['ArrowRight', 'PageDown']
    const backward = ['ArrowLeft', 'PageUp']

    // Les flèches haut/bas servent d'abord à parcourir un lieu trop haut pour l'écran.
    if (event.key === 'ArrowDown' && atScrollEdge(el, 1)) forward.push('ArrowDown')
    if (event.key === 'ArrowUp' && atScrollEdge(el, -1)) backward.push('ArrowUp')

    if (forward.includes(event.key)) {
      event.preventDefault()
      goToNext({ focus: true })
    } else if (backward.includes(event.key)) {
      event.preventDefault()
      goToPrevious({ focus: true })
    } else if (event.key === 'Home') {
      event.preventDefault()
      goTo(MAP[0].id, { focus: true })
    } else if (event.key === 'End') {
      event.preventDefault()
      goTo(MAP[MAP.length - 1].id, { focus: true })
    }
  })

  // La molette déplace la caméra, mais seulement quand le lieu n'a plus rien à faire défiler.
  on(
    window,
    'wheel',
    (event) => {
      if (traveling.value || Math.abs(event.deltaY) < 4) return
      if (Date.now() - lastTravelAt < 1400) return

      const direction = event.deltaY > 0 ? 1 : -1
      if (!atScrollEdge(elementFor(activeSlide.value.id), direction)) return

      if (direction > 0) goToNext()
      else goToPrevious()
    },
    { passive: true },
  )

  let touchStartY = 0
  on(window, 'touchstart', (event) => (touchStartY = event.touches[0].clientY), { passive: true })
  on(
    window,
    'touchend',
    (event) => {
      if (traveling.value) return
      const delta = touchStartY - (event.changedTouches[0]?.clientY ?? touchStartY)
      if (Math.abs(delta) < 60) return

      const direction = delta > 0 ? 1 : -1
      if (!atScrollEdge(elementFor(activeSlide.value.id), direction)) return

      if (direction > 0) goToNext()
      else goToPrevious()
    },
    { passive: true },
  )

  // Lien partagé ou bouton « précédent » du navigateur : la caméra suit l'ancre.
  on(window, 'hashchange', () => {
    const id = window.location.hash.slice(1)
    if (id) goTo(id)
  })
}

function playIntro() {
  // Arrivée sur la carte : on décolle brièvement pour montrer le monde, puis on se pose sur le
  // premier lieu. C'est le seul mouvement joué sans que le visiteur ait rien demandé.
  const start = performance.now()
  const duration = 1600

  const step = (now) => {
    const t = Math.min(1, (now - start) / duration)
    mapCamera.scale = 0.32 + 0.68 * easeInOutQuint(t)
    mapCamera.rotate = -1 * (1 - easeInOutQuint(t))
    applyCamera()

    if (t < 1) {
      frame = requestAnimationFrame(step)
      return
    }

    mapCamera.rotate = 0
    traveling.value = false
    document.documentElement.classList.remove('is-traveling')
    applyCamera()
  }

  traveling.value = true
  document.documentElement.classList.add('is-traveling')
  frame = requestAnimationFrame(step)
}

function activate() {
  stage = document.getElementById('deck-stage')
  if (!stage) return

  document.documentElement.classList.add('deck-mode')
  stage.classList.add('deck-stage')

  for (const point of MAP) {
    const el = elementFor(point.id)
    if (!el) continue
    el.classList.add('deck-slide')
    el.style.setProperty('--x', String(point.x))
    el.style.setProperty('--y', String(point.y))
    // Cible de focus à l'arrivée, sans jamais entrer dans l'ordre de tabulation.
    el.setAttribute('tabindex', '-1')
  }

  // On ouvre sur le lieu correspondant à l'ancre de l'URL, sinon sur le premier.
  const fromHash = MAP.findIndex((point) => point.id === window.location.hash.slice(1))
  activeIndex.value = fromHash === -1 ? 0 : fromHash

  Object.assign(mapCamera, { x: activeSlide.value.x, y: activeSlide.value.y, scale: 1, rotate: 0 })
  applyCamera()
  updateSlideStates()
  attachListeners()
  deckActive.value = true

  if (!prefersReducedMotion()) playIntro()
}

function deactivate() {
  deckActive.value = false
  cancelAnimationFrame(frame)
  traveling.value = false
  document.documentElement.classList.remove('deck-mode', 'is-traveling', 'is-far')
  far = null

  if (stage) {
    stage.classList.remove('deck-stage')
    stage.style.removeProperty('transform')
    stage.style.removeProperty('--cam-scale')
  }

  for (const point of MAP) {
    const el = elementFor(point.id)
    if (!el) continue
    el.classList.remove('deck-slide', 'is-here')
    el.style.removeProperty('--x')
    el.style.removeProperty('--y')
    el.removeAttribute('inert')
    el.removeAttribute('tabindex')
  }

  for (const off of listeners) off()
  listeners = []
  stage = null
}

/** À appeler une fois, depuis `onMounted` de l'application. */
export function initDeck() {
  if (typeof window === 'undefined') return
  watch(enabled, (active) => (active ? activate() : deactivate()), { immediate: true })
}

export function useDeck() {
  return {
    slides,
    activeIndex,
    activeSlide,
    traveling,
    camera: mapCamera,
    canGoPrevious,
    canGoNext,
    total: MAP.length,
    goTo,
    goToNext,
    goToPrevious,
  }
}
