<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { siGithub } from 'simple-icons'
import OsWindow from '../OsWindow.vue'
import BatteryIcon from '../BatteryIcon.vue'
import { useBattery } from '../../composables/useBattery.js'
import ProfileJson from '../ProfileJson.vue'
import PhoneMockup from '../PhoneMockup.vue'
import { navigateTo, setBeforeLeavingHero } from '../../navigation.js'

const { t, locale } = useI18n()
const { level: batteryLevel, charging: batteryCharging } = useBattery()
const batteryPercent = computed(() =>
  batteryLevel.value === null
    ? ''
    : new Intl.NumberFormat(locale.value, { style: 'percent' }).format(batteryLevel.value),
)

const GITHUB_URL = 'https://github.com/hdif004'
const cvUrl = `${import.meta.env.BASE_URL}CV.pdf`

/**
 * Horloge de la barre des tâches : l'heure réelle du visiteur. Elle n'est posée qu'une fois
 * monté côté client, pour que le HTML pré-rendu et l'hydratation restent identiques.
 */
const now = ref(null)
let clockTimer
let introTimer

/**
 * `intro` : la séquence d'ouverture (CSS) est en cours. Elle est coupée à la première
 * interaction, sinon les animations rejoueraient leurs états de départ quand on rouvre une fenêtre.
 */
const intro = ref(true)
const endIntro = () => (intro.value = false)

/* ---------- Fermeture de l'écran au scroll ---------- */

const heroEl = ref(null)
const sceneEl = ref(null)
let reducedMotion = false
let frame = 0
/** Fermeture imposée (0 → 1) avant une navigation, en plus de celle due au scroll. */
let forcedClose = 0
let forcedTimer

/** Sur mobile, un téléphone remplace l'ordinateur : il s'éteint au scroll au lieu de se fermer. */
const PHONE_QUERY = '(max-width: 767.98px)'
const isPhoneLayout = () => window.matchMedia(PHONE_QUERY).matches
const phoneOff = ref(false)
let forcedPhoneOff = false

const clamp01 = (n) => Math.min(1, Math.max(0, n))
const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)

/**
 * La section est plus haute que l'écran et son contenu reste collé en haut : la progression du
 * scroll dans cette zone referme le couvercle. La valeur passe par une variable CSS posée
 * directement sur l'élément, sans re-rendu Vue à chaque image.
 */
/** Part de la zone collante déjà parcourue au scroll (0 en haut, 1 écran fermé). */
const scrollProgress = () => {
  const rect = heroEl.value.getBoundingClientRect()
  const range = rect.height - window.innerHeight
  return range > 0 ? clamp01(-rect.top / range) : 0
}

const updateLid = () => {
  frame = 0
  const hero = heroEl.value
  const scene = sceneEl.value
  if (!hero || !scene) return

  const scrolled = scrollProgress()
  // Hystérésis : le téléphone ne clignote pas quand on s'arrête pile sur le seuil. Sur mobile,
  // la zone collante est courte (voir .hero) : il se rallume peu après être remonté.
  if (forcedPhoneOff || scrolled > 0.4) phoneOff.value = true
  else if (scrolled < 0.25) phoneOff.value = false

  if (reducedMotion) return

  const progress = easeInOut(Math.max(scrolled, forcedClose))

  if (progress > 0) {
    endIntro()
    scene.dataset.closing = ''
  } else {
    delete scene.dataset.closing
  }
  scene.style.setProperty('--close', progress.toFixed(4))
}

const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(updateLid)
}

/**
 * Referme l'écran avant une navigation (voir navigation.js). Résout une fois le couvercle posé ;
 * immédiatement si l'écran est déjà fermé par le scroll.
 */
const closeLid = () =>
  new Promise((resolve) => {
    const from = Math.max(forcedClose, scrollProgress())
    if (from >= 1) return resolve()

    endIntro()
    clearTimeout(forcedTimer)
    const start = performance.now()
    const duration = 650 * (1 - from)

    const step = (time) => {
      forcedClose = from + (1 - from) * clamp01((time - start) / duration)
      updateLid()
      if (forcedClose < 1) return requestAnimationFrame(step)

      // Une fois la page partie plus bas, le scroll suffit à garder l'écran fermé.
      forcedTimer = setTimeout(() => {
        forcedClose = 0
        updateLid()
      }, 1500)
      resolve()
    }
    requestAnimationFrame(step)
  })

/** Éteint le téléphone avant une navigation, le temps qu'on voie l'écran s'éteindre. */
const powerOffPhone = () =>
  new Promise((resolve) => {
    if (phoneOff.value) return resolve()
    clearTimeout(forcedTimer)
    forcedPhoneOff = true
    phoneOff.value = true
    setTimeout(resolve, reducedMotion ? 0 : 450)
    forcedTimer = setTimeout(() => {
      forcedPhoneOff = false
      updateLid()
    }, 1500)
  })

const beforeLeavingHero = () => {
  if (isPhoneLayout()) return powerOffPhone()
  return reducedMotion ? Promise.resolve() : closeLid()
}

onMounted(() => {
  now.value = new Date()
  clockTimer = setInterval(() => (now.value = new Date()), 15000)

  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) endIntro()
  else introTimer = setTimeout(endIntro, 4200)

  setBeforeLeavingHero(beforeLeavingHero)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  updateLid()
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearTimeout(introTimer)
  clearTimeout(forcedTimer)
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  setBeforeLeavingHero(null)
})

const clockTime = computed(() =>
  now.value ? now.value.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' }) : '',
)
const clockDate = computed(() => (now.value ? now.value.toLocaleDateString(locale.value) : ''))

/* ---------- Fenêtres ---------- */

const windows = reactive({
  json: { open: true, minimized: false, maximized: true },
  cv: { open: false, minimized: false, maximized: false, loaded: false },
})
const activeWindow = ref('json')

const isShown = (id) => windows[id].open && !windows[id].minimized

const openWindow = (id) => {
  endIntro()
  Object.assign(windows[id], { open: true, minimized: false })
  if (id === 'cv') windows.cv.loaded = true
  activeWindow.value = id
}

const closeWindow = (id) => {
  windows[id].open = false
  if (activeWindow.value === id) activeWindow.value = null
}

const minimizeWindow = (id) => {
  windows[id].minimized = true
  if (activeWindow.value === id) activeWindow.value = null
}

/** Bouton de la barre des tâches : ouvre, restaure, ou réduit la fenêtre déjà au premier plan. */
const toggleFromTaskbar = (id) => {
  endIntro()
  if (isShown(id) && activeWindow.value === id) minimizeWindow(id)
  else openWindow(id)
}

/* ---------- Icônes du bureau ---------- */

const desktopIcons = computed(() => [
  { id: 'json', label: 'hudayfa.json', run: () => openWindow('json') },
  { id: 'cv', label: 'CV.pdf', run: () => openWindow('cv') },
  { id: 'projects', label: t('hero.os.projects'), run: () => navigateTo('projects') },
  { id: 'github', label: 'GitHub', run: () => window.open(GITHUB_URL, '_blank', 'noopener') },
  { id: 'contact', label: t('hero.os.contact'), run: () => navigateTo('contact') },
])

const selectedIcon = ref(null)

/**
 * Comme sur un vrai bureau : un clic sélectionne, un double-clic ouvre. Au clavier (detail 0)
 * et sur écran tactile, un seul appui ouvre directement.
 */
const onIconClick = (event, icon) => {
  endIntro()
  selectedIcon.value = icon.id
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (event.detail === 0 || coarse) icon.run()
}

/* ---------- Clavier du mockup (décoratif) ---------- */

/** Largeur de chaque touche, en colonnes d'une grille de 15. */
const keyboardRows = [
  Array(15).fill(1),
  [1.5, ...Array(12).fill(1), 1.5],
  [1.75, ...Array(11).fill(1), 2.25],
  [2.25, ...Array(10).fill(1), 2.75],
  [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1],
]

</script>


<template>
  <!--
    La section est plus haute que l'écran : son contenu reste collé en haut pendant que le scroll
    referme le couvercle (voir updateLid), puis la page continue normalement.
  -->
  <section id="hero" ref="heroEl" class="hero relative">
    <!-- Titre conservé pour les lecteurs d'écran et le référencement : le mockup fait office de hero. -->
    <h1 class="sr-only">{{ t('hero.name') }}, {{ t('hero.title') }} ({{ t('hero.specialty') }})</h1>

    <div class="sticky top-0 flex h-svh justify-center overflow-x-clip pt-4 md:pt-6">
      <!-- Halo doux derrière l'ordinateur, purement décoratif. -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute left-1/2 top-[40%] -z-10 h-[34rem] w-[min(70rem,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-fill/20 blur-3xl"
      ></div>

      <!--
        Séquence d'ouverture (CSS, classe `intro`) : l'ordinateur arrive de la droite, l'écran
        s'ouvre, le bureau s'allume, le curseur double-clique sur hudayfa.json. Les styles de base
        décrivent l'état final : sans animation, tout est directement lisible et utilisable.
      -->
      <!-- Mobile : téléphone -->
      <PhoneMockup class="md:hidden" :off="phoneOff" />

      <!-- Tablette et ordinateur : portable -->
      <div ref="sceneEl" class="scene hidden md:block" :class="{ intro }">
        <div class="stage">
          <div class="laptop">
            <!-- Écran (couvercle) -->
            <div class="lid">
              <div class="lid-front">
                <div class="screen relative aspect-[16/10] overflow-hidden rounded-[0.5cqw] bg-black">
                    <div
                      class="desktop absolute inset-0"
                      role="region"
                      :aria-label="t('hero.os.desktop')"
                      @click.self="selectedIcon = null"
                    >
                      <!-- Icônes du bureau -->
                      <ul class="icons absolute flex flex-col flex-wrap content-start" @click.self="selectedIcon = null">
                        <li v-for="icon in desktopIcons" :key="icon.id">
                          <button
                            type="button"
                            class="desk-icon flex flex-col items-center"
                            :class="{ selected: selectedIcon === icon.id }"
                            @click="onIconClick($event, icon)"
                            @dblclick="icon.run()"
                          >
                            <svg v-if="icon.id === 'json'" viewBox="0 0 40 48" class="icon-svg" aria-hidden="true">
                              <path d="M4 2h22l10 10v32a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#f4f1e8" />
                              <path d="M26 2v10h10" fill="#d9d4c3" />
                              <text x="19" y="33" text-anchor="middle" font-size="9" font-family="monospace" font-weight="700" fill="#46704a">{ }</text>
                            </svg>
                            <svg v-else-if="icon.id === 'cv'" viewBox="0 0 40 48" class="icon-svg" aria-hidden="true">
                              <path d="M4 2h22l10 10v32a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#f4f1e8" />
                              <path d="M26 2v10h10" fill="#d9d4c3" />
                              <rect x="2" y="26" width="30" height="11" rx="1.5" fill="#c42b1c" />
                              <text x="17" y="34.5" text-anchor="middle" font-size="8" font-family="sans-serif" font-weight="700" fill="#fff">PDF</text>
                            </svg>
                            <svg v-else-if="icon.id === 'projects'" viewBox="0 0 40 48" class="icon-svg" aria-hidden="true">
                              <path d="M2 12a3 3 0 0 1 3-3h10l4 4h16a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="#e9c46a" />
                              <path d="M2 18h36v20a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="#f2d383" />
                            </svg>
                            <svg v-else-if="icon.id === 'github'" viewBox="0 0 40 48" class="icon-svg" aria-hidden="true">
                              <circle cx="20" cy="24" r="17" fill="#f4f1e8" />
                              <g transform="translate(8 12)"><path :d="siGithub.path" fill="#1f2b22" /></g>
                            </svg>
                            <svg v-else viewBox="0 0 40 48" class="icon-svg" aria-hidden="true">
                              <rect x="2" y="11" width="36" height="26" rx="3" fill="#f4f1e8" />
                              <path d="M3 13l17 13 17-13" fill="none" stroke="#46704a" stroke-width="2.5" stroke-linejoin="round" />
                            </svg>
                            <span class="icon-label">{{ icon.label }}</span>
                          </button>
                        </li>
                      </ul>

                      <!-- Curseur de la séquence d'ouverture -->
                      <svg v-if="intro" aria-hidden="true" viewBox="0 0 16 24" class="cursor absolute">
                        <path d="M1 1v19l5-5 3.5 7.5 3-1.4L9 13.8h7z" fill="#fff" stroke="#000" stroke-width="1.2" stroke-linejoin="round" />
                      </svg>

                      <!-- Fenêtre : hudayfa.json -->
                      <Transition name="win">
                        <OsWindow
                          v-show="isShown('json')"
                          class="intro-window"
                          title="hudayfa.json"
                          :maximized="windows.json.maximized"
                          :active="activeWindow === 'json'"
                          :windowed="{ top: '5%', left: '14%', right: '6%', bottom: 'calc(var(--taskbar-h) + 5%)' }"
                          @focus="activeWindow = 'json'"
                          @minimize="minimizeWindow('json')"
                          @toggle-maximize="windows.json.maximized = !windows.json.maximized"
                          @close="closeWindow('json')"
                        >
                          <template #icon>
                            <span aria-hidden="true" class="font-mono font-bold text-[#a3b18a]">{ }</span>
                          </template>
                          <ProfileJson class="code h-full" @open-cv="openWindow('cv')" />
                        </OsWindow>
                      </Transition>

                      <!-- Fenêtre : CV.pdf (l'iframe n'est créée qu'à la première ouverture) -->
                      <Transition name="win">
                        <OsWindow
                          v-if="windows.cv.loaded"
                          v-show="isShown('cv')"
                          title="CV.pdf"
                          :maximized="windows.cv.maximized"
                          :active="activeWindow === 'cv'"
                          :windowed="{ top: '3%', left: '24%', right: '4%', bottom: 'calc(var(--taskbar-h) + 3%)' }"
                          @focus="activeWindow = 'cv'"
                          @minimize="minimizeWindow('cv')"
                          @toggle-maximize="windows.cv.maximized = !windows.cv.maximized"
                          @close="closeWindow('cv')"
                        >
                          <template #icon>
                            <span aria-hidden="true" class="rounded-sm bg-[#c42b1c] px-[0.4cqw] font-bold text-white">PDF</span>
                          </template>
                          <template #actions>
                            <a :href="cvUrl" download class="win-btn" :aria-label="t('hero.os.download')" :title="t('hero.os.download')">
                              <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1v6M2.5 4.5 5 7l2.5-2.5M1.5 9h7" /></svg>
                            </a>
                          </template>
                          <div class="relative h-full bg-[#525659]">
                            <p class="pdf-fallback absolute inset-0 flex flex-col items-center justify-center gap-[1cqw] p-[3cqw] text-center text-[#dad7cd]">
                              {{ t('hero.os.cvFallback') }}
                              <a :href="cvUrl" download class="rounded bg-[#a3b18a] px-[1.5cqw] py-[0.6cqw] font-semibold text-[#1b2820]">
                                {{ t('hero.os.download') }}
                              </a>
                            </p>
                            <iframe :src="`${cvUrl}#view=FitH`" :title="t('hero.os.cvTitle')" class="relative h-full w-full border-0"></iframe>
                          </div>
                        </OsWindow>
                      </Transition>

                      <!-- Barre des tâches -->
                      <div class="taskbar absolute inset-x-0 bottom-0 z-30 flex items-center justify-between px-[1.2cqw] text-white">
                        <span class="w-[18cqw]"></span>
                        <span class="flex h-full items-center gap-[0.6cqw]">
                          <!-- Démarrer (décoratif) -->
                          <span class="task-app" aria-hidden="true">
                            <svg viewBox="0 0 20 20" class="task-svg">
                              <rect x="1" y="1" width="8.5" height="8.5" rx="1" fill="#a3b18a" />
                              <rect x="10.5" y="1" width="8.5" height="8.5" rx="1" fill="#a3b18a" />
                              <rect x="1" y="10.5" width="8.5" height="8.5" rx="1" fill="#a3b18a" />
                              <rect x="10.5" y="10.5" width="8.5" height="8.5" rx="1" fill="#a3b18a" />
                            </svg>
                          </span>
                          <button type="button" class="task-app" :aria-label="t('hero.os.projects')" @click="navigateTo('projects')">
                            <svg viewBox="0 0 20 20" class="task-svg" aria-hidden="true">
                              <path d="M1 5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2z" fill="#e9c46a" />
                            </svg>
                          </button>
                          <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="task-app" aria-label="GitHub">
                            <svg viewBox="0 0 20 20" class="task-svg" aria-hidden="true">
                              <circle cx="10" cy="10" r="8.5" fill="#5f8fb4" />
                              <path d="M1.5 10h17M10 1.5c3 3 3 14 0 17M10 1.5c-3 3-3 14 0 17" stroke="#dbe8f0" stroke-width="1.2" fill="none" />
                            </svg>
                          </a>
                          <button
                            type="button"
                            class="task-app relative"
                            :class="{ 'is-active': activeWindow === 'json' && isShown('json') }"
                            aria-label="hudayfa.json"
                            @click="toggleFromTaskbar('json')"
                          >
                            <svg viewBox="0 0 20 20" class="task-svg" aria-hidden="true">
                              <rect x="1" y="1" width="18" height="18" rx="3" fill="#1f2b22" stroke="#a3b18a" stroke-width="1.2" />
                              <text x="10" y="13.5" text-anchor="middle" font-size="8" font-family="monospace" font-weight="700" fill="#a3b18a">{ }</text>
                            </svg>
                            <span v-if="windows.json.open" class="task-indicator"></span>
                          </button>
                          <button
                            v-if="windows.cv.open"
                            type="button"
                            class="task-app relative"
                            :class="{ 'is-active': activeWindow === 'cv' && isShown('cv') }"
                            aria-label="CV.pdf"
                            @click="toggleFromTaskbar('cv')"
                          >
                            <svg viewBox="0 0 20 20" class="task-svg" aria-hidden="true">
                              <rect x="2" y="1" width="16" height="18" rx="2" fill="#f4f1e8" />
                              <rect x="2" y="10" width="16" height="6" fill="#c42b1c" />
                            </svg>
                            <span class="task-indicator"></span>
                          </button>
                        </span>
                        <span aria-hidden="true" class="tray flex w-[18cqw] items-center justify-end gap-[1cqw]">
                          <span class="flex items-center gap-[0.5cqw]">
                            <BatteryIcon class="tray-battery" :level="batteryLevel" :charging="batteryCharging" />
                            <span v-if="batteryPercent" class="clock">{{ batteryPercent }}</span>
                          </span>
                          <span class="clock flex flex-col items-end leading-tight">
                            <span>{{ clockTime }}</span>
                            <span>{{ clockDate }}</span>
                          </span>
                        </span>
                      </div>
                    </div>
                  <!-- Reflet et assombrissement pendant la fermeture -->
                  <div aria-hidden="true" class="glare pointer-events-none absolute inset-0"></div>
                  <div aria-hidden="true" class="screen-dim pointer-events-none absolute inset-0"></div>
                </div>
                <span aria-hidden="true" class="camera"></span>
              </div>
              <!-- Dos du couvercle, visible quand il se referme -->
              <div aria-hidden="true" class="lid-back"></div>
              <!-- Tranches du couvercle : lui donnent son épaisseur -->
              <div aria-hidden="true" class="lid-edge lid-edge-top"></div>
              <div aria-hidden="true" class="lid-edge lid-edge-left"></div>
              <div aria-hidden="true" class="lid-edge lid-edge-right"></div>
            </div>

            <!-- Repose-poignets, couché vers le visiteur -->
            <div aria-hidden="true" class="deck">
              <div class="deck-shadow"></div>
              <div class="keyboard">
                <div v-for="(row, r) in keyboardRows" :key="r" class="key-row">
                  <span v-for="(width, k) in row" :key="k" class="key" :style="{ flexGrow: width }"></span>
                </div>
              </div>
              <div class="trackpad"></div>
              <div class="deck-front"><span class="deck-notch"></span></div>
              <div class="deck-side deck-side-left"></div>
              <div class="deck-side deck-side-right"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---------- Dimensions ---------- */
.hero {
  height: 150svh;
}

/* Mobile : le téléphone s'éteint sans animation de couvercle, une zone collante courte suffit. */
@media (max-width: 767.98px) {
  .hero {
    height: 120svh;
  }
}

/*
 * Largeur de l'écran : limitée par la largeur de la page et par la hauteur disponible
 * (l'ordinateur complet, clavier compris, mesure environ 0,86 fois sa largeur).
 */
.scene {
  width: min(80vw, 78rem, calc((100svh - 6.5rem) * 1.17));
  container-type: inline-size;
}

/* ---------- Volume 3D ---------- */
.stage {
  perspective: 320cqw;
  perspective-origin: 50% 0%;
}

.laptop {
  position: relative;
  transform-style: preserve-3d;
}

.lid {
  position: relative;
  transform-origin: 50% 100%;
  transform-style: preserve-3d;
}

/* Au repos, pas de transformation sur l'écran : le texte reste net. */
.scene[data-closing] .lid {
  transform: rotateX(calc(var(--close) * -88deg));
}

.lid-front {
  position: relative;
  padding: 1.6cqw 1.6cqw 2.6cqw;
  border-radius: 1cqw 1cqw 0.4cqw 0.4cqw;
  background: linear-gradient(180deg, #1b1b1b, #0c0c0c);
  box-shadow:
    inset 0 0 0 0.15cqw #3a3a3a,
    0 0 0 0.25cqw #bdbab0;
  backface-visibility: hidden;
}

.camera {
  position: absolute;
  top: 0.6cqw;
  left: 50%;
  width: 0.5cqw;
  height: 0.5cqw;
  border-radius: 9999px;
  background: #2b3a31;
  transform: translateX(-50%);
}

.lid {
  --lid-t: 1.3cqw;
}

.lid-back {
  position: absolute;
  inset: -0.25cqw;
  border-radius: 1cqw 1cqw 0.4cqw 0.4cqw;
  background: linear-gradient(180deg, #dcd9cf, #b3b0a5);
  transform: translateZ(calc(var(--lid-t) * -1)) rotateY(180deg);
  backface-visibility: hidden;
  pointer-events: none;
}

.lid-edge {
  position: absolute;
  pointer-events: none;
  background: linear-gradient(90deg, #a9a69b, #c9c6bb 50%, #a9a69b);
}

/* Tranche du haut : pivote vers l'arrière depuis le bord supérieur. */
.lid-edge-top {
  top: -0.25cqw;
  left: 0.8cqw;
  right: 0.8cqw;
  height: var(--lid-t);
  transform-origin: 50% 0;
  transform: rotateX(-90deg);
}

.lid-edge-left,
.lid-edge-right {
  top: 0.8cqw;
  bottom: 0;
  width: var(--lid-t);
  background: linear-gradient(180deg, #c9c6bb, #9f9c91);
}

.lid-edge-left {
  left: -0.25cqw;
  transform-origin: 0 50%;
  transform: rotateY(90deg);
}

.lid-edge-right {
  right: -0.25cqw;
  transform-origin: 100% 50%;
  transform: rotateY(-90deg);
}

.glare {
  z-index: 45;
  background: linear-gradient(115deg, rgb(255 255 255 / 0.07) 0%, rgb(255 255 255 / 0.02) 35%, transparent 36%);
}

.screen-dim {
  z-index: 50;
  background: #000;
  opacity: calc(var(--close, 0) * 0.85);
}

.deck {
  position: absolute;
  top: 100%;
  left: -1cqw;
  width: calc(100% + 2cqw);
  height: 64cqw;
  border-radius: 0 0 2cqw 2cqw;
  background:
    linear-gradient(180deg, #a8a59b 0, #cfccc2 1.2cqw, #dcd9cf 30%, #cbc8bd 100%);
  transform-origin: 50% 0;
  transform: rotateX(90deg);
  transform-style: preserve-3d;
}

/*
 * Netteté au repos. Un écran rendu dans un contexte 3D est dessiné comme une texture : si elle
 * tombe sur un demi-pixel (ex. à 1440 px de large), le texte devient flou. Hors intro et hors
 * fermeture, on repasse donc l'ordinateur à plat : l'écran est dessiné normalement, et seul le
 * repose-poignets garde sa perspective, recalculée pour le même point de vue que la scène
 * (œil au bord supérieur de l'écran, `--lid-h` au-dessus de la charnière).
 */
.scene {
  --lid-h: calc((100cqw - 3.2cqw) * 0.625 + 4.2cqw);
}

.scene:not(.intro):not([data-closing]) .laptop,
.scene:not(.intro):not([data-closing]) .lid {
  transform-style: flat;
}

.scene:not(.intro):not([data-closing]) .lid-front {
  backface-visibility: visible;
}

.scene:not(.intro):not([data-closing]) :is(.lid-back, .lid-edge) {
  display: none;
}

.scene:not(.intro):not([data-closing]) .deck {
  transform: translateY(calc(var(--lid-h) * -1)) perspective(320cqw) translateY(var(--lid-h))
    rotateX(90deg);
}

.deck-shadow {
  position: absolute;
  inset: -4cqw -6cqw -8cqw;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgb(0 0 0 / 0.35), transparent);
  transform: translateZ(-2.4cqw);
  filter: blur(1.5cqw);
}

.keyboard {
  position: absolute;
  top: 5cqw;
  left: 11%;
  right: 11%;
  display: flex;
  flex-direction: column;
  gap: 0.7cqw;
  padding: 1cqw;
  border-radius: 1cqw;
  background: #bdbaaf;
}

.key-row {
  display: flex;
  gap: 0.7cqw;
}

.key {
  flex-basis: 0;
  height: 3.4cqw;
  border-radius: 0.5cqw;
  background: linear-gradient(180deg, #34332f, #262521);
  box-shadow: 0 0.25cqw 0 #16150f;
}

.trackpad {
  position: absolute;
  top: 37cqw;
  left: 50%;
  width: 34%;
  height: 21cqw;
  border-radius: 1.4cqw;
  background: linear-gradient(180deg, #d2cfc5, #c6c3b8);
  box-shadow: inset 0 0 0 0.15cqw #b3b0a5;
  transform: translateX(-50%);
}

.deck-front {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: var(--deck-t);
  border-radius: 0 0 2cqw 2cqw;
  background: linear-gradient(180deg, #d3d0c6, #9d9a90);
  transform-origin: 50% 0;
  transform: rotateX(-90deg);
}

.deck {
  --deck-t: 2.4cqw;
}

/* Tranches latérales : pivotent vers le bas depuis les bords du repose-poignets. */
.deck-side {
  position: absolute;
  top: 0;
  bottom: 2cqw;
  width: var(--deck-t);
  background: linear-gradient(180deg, #bebbb0, #9d9a90);
}

.deck-side-left {
  left: 0;
  transform-origin: 0 50%;
  transform: rotateY(90deg);
}

.deck-side-right {
  right: 0;
  transform-origin: 100% 50%;
  transform: rotateY(-90deg);
}

.deck-notch {
  position: absolute;
  top: 0;
  left: 50%;
  width: 14%;
  height: 45%;
  border-radius: 0 0 1cqw 1cqw;
  background: #a9a69c;
  transform: translateX(-50%);
}

/* ---------- Écran : tailles relatives à la largeur de l'écran ---------- */
.screen {
  container-type: inline-size;
  --taskbar-h: 5cqw;
}

.desktop {
  background:
    radial-gradient(circle at 80% 20%, rgb(218 215 205 / 0.35), transparent 45%),
    radial-gradient(circle at 15% 85%, rgb(163 177 138 / 0.45), transparent 50%),
    linear-gradient(135deg, #344e41, #588157);
}

.icons {
  left: 1.5cqw;
  top: 1.5cqw;
  bottom: calc(var(--taskbar-h) + 1cqw);
  gap: 0.6cqw;
}

.desk-icon {
  width: 10cqw;
  min-width: 68px;
  padding: 0.6cqw 0.4cqw;
  border-radius: 0.5cqw;
  border: 1px solid transparent;
  color: #fff;
  cursor: default;
}

.desk-icon:hover {
  background: rgb(255 255 255 / 0.12);
}

.desk-icon.selected {
  background: rgb(255 255 255 / 0.22);
  border-color: rgb(255 255 255 / 0.3);
}

.desk-icon:focus-visible {
  outline: 2px solid #f4f1e8;
  outline-offset: 0;
}

.icon-svg {
  width: 5cqw;
  min-width: 18px;
}

.icon-label {
  margin-top: 0.4cqw;
  font-size: max(10px, 1.35cqw);
  line-height: 1.2;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.6);
}

.cursor {
  z-index: 40;
  width: 2.2cqw;
  min-width: 10px;
  left: 70%;
  top: 75%;
  opacity: 0;
  pointer-events: none;
}

.intro-window {
  transform-origin: 6% 9%;
}

.code {
  padding: 2.2cqw 3cqw;
  /* 16 lignes tiennent sans défilement dès que l'écran du mockup dépasse ~560 px de large. */
  font-size: max(11px, 1.8cqw);
  line-height: 1.5;
}

.pdf-fallback {
  font-size: max(9px, 1.6cqw);
}

.taskbar {
  height: var(--taskbar-h);
  background: rgb(16 24 19 / 0.82);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgb(255 255 255 / 0.08);
}

.task-app {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.2cqw;
  height: 4.2cqw;
  min-width: 20px;
  min-height: 20px;
  border-radius: 0.6cqw;
}

button.task-app,
a.task-app {
  cursor: pointer;
}

button.task-app:hover,
a.task-app:hover,
.task-app.is-active {
  background: rgb(255 255 255 / 0.12);
}

.task-svg {
  width: 2.6cqw;
  min-width: 10px;
}

.task-indicator {
  position: absolute;
  bottom: 0.2cqw;
  left: 50%;
  width: 0.8cqw;
  height: 0.3cqw;
  min-height: 2px;
  border-radius: 9999px;
  background: #8fa37f;
  transform: translateX(-50%);
  transition: width 0.2s ease;
}

.is-active .task-indicator {
  width: 1.6cqw;
  background: #a3b18a;
}

.tray-battery {
  width: max(16px, 2.4cqw);
  color: #fff;
}

.clock {
  font-size: max(9px, 1.25cqw);
}

/* ---------- Ouverture / fermeture des fenêtres ---------- */
.win-enter-active,
.win-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.win-enter-from,
.win-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(2%);
}

/* ---------- Séquence d'ouverture ---------- */
.intro .laptop {
  animation: laptop-in 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.intro .lid {
  animation: lid-open 1.1s cubic-bezier(0.45, 0, 0.2, 1) 0.9s both;
}

.intro .desktop {
  animation: screen-on 0.5s ease-out 1.9s both;
}

.intro .icons li {
  animation: icon-pop 0.4s cubic-bezier(0.3, 1.5, 0.6, 1) 2.3s both;
}

.intro .icons li:nth-child(2) {
  animation-delay: 2.38s;
}

.intro .icons li:nth-child(3) {
  animation-delay: 2.46s;
}

.intro .icons li:nth-child(4) {
  animation-delay: 2.54s;
}

.intro .icons li:nth-child(5) {
  animation-delay: 2.62s;
}

.intro .icons li:first-child .desk-icon {
  animation: icon-select 0.15s linear 3.05s both;
}

.intro .cursor {
  animation: cursor 3.5s linear both;
}

.intro .intro-window {
  animation: window-open 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) 3.4s both;
}

/* Pas d'opacité ici : une opacité animée aplatit la 3D (le clavier deviendrait invisible). */
@keyframes laptop-in {
  from {
    transform: translateX(calc(50vw + 70%)) rotateY(-40deg);
  }
  to {
    transform: none;
  }
}

@keyframes lid-open {
  from {
    transform: rotateX(-90deg);
  }
  to {
    transform: rotateX(0deg);
  }
}

@keyframes screen-on {
  from {
    opacity: 0;
    filter: brightness(2);
  }
  to {
    opacity: 1;
    filter: none;
  }
}

@keyframes icon-pop {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes icon-select {
  from {
    background-color: transparent;
  }
  to {
    background-color: rgb(255 255 255 / 0.22);
  }
}

/* 3,5 s au total : caché → apparaît (2,4 s) → glisse vers l'icône → double-clic → disparaît. */
@keyframes cursor {
  0%,
  68% {
    opacity: 0;
    left: 70%;
    top: 75%;
    transform: none;
  }
  72% {
    opacity: 1;
    left: 70%;
    top: 75%;
  }
  87% {
    left: 6%;
    top: 9%;
    transform: none;
  }
  90% {
    transform: scale(0.8);
  }
  92% {
    transform: none;
  }
  94% {
    transform: scale(0.8);
  }
  96% {
    opacity: 1;
    left: 6%;
    top: 9%;
    transform: none;
  }
  100% {
    opacity: 0;
    left: 6%;
    top: 9%;
  }
}

@keyframes window-open {
  from {
    opacity: 0;
    transform: scale(0.06);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Moins d'animations demandé : on montre directement l'état final. */
@media (prefers-reduced-motion: reduce) {
  .intro .laptop,
  .intro .lid,
  .intro .desktop,
  .intro .icons li,
  .intro .desk-icon,
  .intro .cursor,
  .intro .intro-window {
    animation: none !important;
  }
}
</style>
