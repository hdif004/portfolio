<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { siGithub } from 'simple-icons'
import ProfileJson from './ProfileJson.vue'
import BatteryIcon from './BatteryIcon.vue'
import { useBattery } from '../composables/useBattery.js'
import { navigateTo } from '../navigation.js'

/**
 * Hero mobile : un téléphone avec un écran d'accueil dans l'esprit du bureau de l'ordinateur.
 * `off` : écran éteint (scroll ou navigation), avec le bruit de verrouillage quand c'est possible.
 */
const props = defineProps({
  off: { type: Boolean, default: false },
})

const { t, locale } = useI18n()
const { level: batteryLevel, charging: batteryCharging } = useBattery()

const GITHUB_URL = 'https://github.com/hdif004'
const MAIL_URL = 'mailto:hudayfa.k.pro@gmail.com'
const cvUrl = `${import.meta.env.BASE_URL}CV.pdf`

/* ---------- Horloge (posée côté client pour garder l'hydratation identique) ---------- */

const now = ref(null)
let clockTimer

const clockTime = computed(() =>
  now.value ? now.value.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' }) : '',
)
const clockDate = computed(() =>
  now.value ? now.value.toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }) : '',
)

/** Date affichée en haut de la note, comme dans l'appli Notes (« 17 septembre 2026 à 16:52 »). */
const noteDate = computed(() =>
  now.value ? now.value.toLocaleString(locale.value, { dateStyle: 'long', timeStyle: 'short' }) : '',
)

/* ---------- Séquence d'ouverture et applis ---------- */

const intro = ref(true)
let introTimer
const endIntro = () => (intro.value = false)

/** Appli ouverte en plein écran : 'json', 'cv' ou null (écran d'accueil). */
const app = ref('json')

const openApp = (id) => {
  endIntro()
  app.value = id
}

const goHome = () => {
  endIntro()
  app.value = null
}

const openSection = (id) => {
  endIntro()
  navigateTo(id)
}

/* ---------- Son de verrouillage ---------- */

/**
 * Les navigateurs n'autorisent le son qu'après une vraie interaction : un appui (fin du toucher),
 * un clic ou une touche. Un simple `pointerdown` au doigt ou un scroll ne suffisent pas. Les
 * écouteurs restent donc en place tant que le contexte audio n'est pas réellement débloqué.
 */
let audio = null
const gestureEvents = ['pointerup', 'touchend', 'click', 'keydown']

const removeGestureListeners = () =>
  gestureEvents.forEach((type) => window.removeEventListener(type, unlockAudio))

const unlockAudio = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return removeGestureListeners()
  audio ??= new AudioContext()

  // iOS : jouer un son vide pendant le geste finit de débloquer la sortie audio.
  const silent = audio.createBufferSource()
  silent.buffer = audio.createBuffer(1, 1, 22050)
  silent.connect(audio.destination)
  silent.start(0)

  if (audio.state === 'running') return removeGestureListeners()
  audio
    .resume()
    .then(() => audio.state === 'running' && removeGestureListeners())
    .catch(() => {})
}

/** « Clac » de verrouillage synthétisé : un clic aigu très court suivi d'un petit coup sourd. */
const scheduleLockSound = () => {
  const start = audio.currentTime + 0.01

  const click = audio.createOscillator()
  const clickFilter = audio.createBiquadFilter()
  const clickGain = audio.createGain()
  click.type = 'square'
  click.frequency.setValueAtTime(2600, start)
  click.frequency.exponentialRampToValueAtTime(900, start + 0.025)
  clickFilter.type = 'bandpass'
  clickFilter.frequency.value = 1800
  clickGain.gain.setValueAtTime(0.0001, start)
  clickGain.gain.exponentialRampToValueAtTime(0.25, start + 0.002)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.04)
  click.connect(clickFilter).connect(clickGain).connect(audio.destination)
  click.start(start)
  click.stop(start + 0.05)

  const thud = audio.createOscillator()
  const thudGain = audio.createGain()
  thud.type = 'sine'
  thud.frequency.setValueAtTime(160, start + 0.01)
  thud.frequency.exponentialRampToValueAtTime(60, start + 0.09)
  thudGain.gain.setValueAtTime(0.0001, start + 0.01)
  thudGain.gain.exponentialRampToValueAtTime(0.45, start + 0.015)
  thudGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.1)
  thud.connect(thudGain).connect(audio.destination)
  thud.start(start + 0.01)
  thud.stop(start + 0.12)
}

/**
 * Joue le son si l'audio est débloqué. Quand l'extinction suit directement un appui (appli
 * Réalisations ou Contact), le déblocage est encore en cours : on attend qu'il aboutisse.
 */
const playLockSound = () => {
  if (!audio) return
  if (audio.state === 'running') return scheduleLockSound()
  audio
    .resume()
    .then(() => audio.state === 'running' && scheduleLockSound())
    .catch(() => {})
}

/**
 * Écran de verrouillage : visible pendant l'intro (animation CSS), puis à chaque rallumage du
 * téléphone, le temps d'un « déverrouillage » automatique.
 */
const locked = ref(false)
let unlockTimer

watch(
  () => props.off,
  (off) => {
    clearTimeout(unlockTimer)
    if (off) {
      endIntro()
      locked.value = true
      playLockSound()
    } else {
      unlockTimer = setTimeout(() => (locked.value = false), 800)
    }
  },
)

onMounted(() => {
  now.value = new Date()
  clockTimer = setInterval(() => (now.value = new Date()), 15000)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) endIntro()
  else introTimer = setTimeout(endIntro, 4400)

  gestureEvents.forEach((type) => window.addEventListener(type, unlockAudio, { passive: true }))
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearTimeout(introTimer)
  clearTimeout(unlockTimer)
  removeGestureListeners()
  audio?.close()
})
</script>

<template>
  <div class="phone-scene" :class="{ intro, 'is-off': off, 'is-locked': locked }">
    <div class="phone">
      <!-- Boutons latéraux -->
      <span aria-hidden="true" class="side-btn side-btn-action"></span>
      <span aria-hidden="true" class="side-btn side-btn-vol-up"></span>
      <span aria-hidden="true" class="side-btn side-btn-vol-down"></span>
      <span aria-hidden="true" class="side-btn side-btn-power"></span>

      <div class="screen" role="region" :aria-label="t('hero.os.desktop')">
        <div class="wallpaper absolute inset-0"></div>

        <!-- Barre d'état -->
        <div aria-hidden="true" class="status-bar absolute inset-x-0 top-0 z-30 items-center">
          <span class="status-time">{{ clockTime }}</span>
          <span class="island"></span>
          <span class="status-icons flex items-center gap-[1cqw]">
            <svg viewBox="0 0 18 12" class="status-icon">
              <rect x="0" y="8" width="3" height="4" rx="0.8" />
              <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
              <rect x="10" y="3" width="3" height="9" rx="0.8" />
              <rect x="15" y="0" width="3" height="12" rx="0.8" />
            </svg>
            <svg viewBox="0 0 16 12" class="status-icon">
              <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0z" />
              <path d="M3.6 7a6.2 6.2 0 0 1 8.8 0l-1.3 1.3a4.4 4.4 0 0 0-6.2 0z" />
              <path d="M1.2 4.6a9.6 9.6 0 0 1 13.6 0l-1.3 1.3a7.8 7.8 0 0 0-11 0z" />
            </svg>
            <BatteryIcon class="status-icon status-battery" :level="batteryLevel" :charging="batteryCharging" />
          </span>
        </div>

        <!-- Écran d'accueil -->
        <div class="home absolute inset-0 flex flex-col">
          <ul class="app-grid">
            <li>
              <button type="button" class="app-icon" @click="openApp('json')">
                <span class="app-tile bg-[#1f2b22] font-mono font-bold text-[#a3b18a]" aria-hidden="true">{ }</span>
                <span class="app-label">hudayfa.json</span>
              </button>
            </li>
            <li>
              <button type="button" class="app-icon" @click="openApp('cv')">
                <span class="app-tile bg-[#f4f1e8]" aria-hidden="true">
                  <span class="rounded-[0.8cqw] bg-[#c42b1c] px-[1.2cqw] font-bold text-white">PDF</span>
                </span>
                <span class="app-label">CV.pdf</span>
              </button>
            </li>
            <li>
              <button type="button" class="app-icon" @click="openSection('projects')">
                <span class="app-tile bg-[#e9c46a]" aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="tile-svg">
                    <path d="M2 6.5A2.5 2.5 0 0 1 4.5 4h4.6l2 2h8.4A2.5 2.5 0 0 1 22 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5z" fill="#f7e3a8" />
                  </svg>
                </span>
                <span class="app-label">{{ t('hero.os.projects') }}</span>
              </button>
            </li>
            <li>
              <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="app-icon" @click="endIntro">
                <span class="app-tile bg-[#f4f1e8]" aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="tile-svg"><path :d="siGithub.path" fill="#1f2b22" /></svg>
                </span>
                <span class="app-label">GitHub</span>
              </a>
            </li>
          </ul>

          <!-- Dock -->
          <div class="dock">
            <a :href="MAIL_URL" class="app-icon" :aria-label="t('hero.os.mail')" @click="endIntro">
              <span class="app-tile bg-[#5f8fb4]" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="tile-svg">
                  <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="#fff" />
                  <path d="M3.5 6.5 12 13l8.5-6.5" fill="none" stroke="#5f8fb4" stroke-width="1.8" stroke-linejoin="round" />
                </svg>
              </span>
            </a>
            <button type="button" class="app-icon" :aria-label="t('hero.os.contact')" @click="openSection('contact')">
              <span class="app-tile bg-[#588157]" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="tile-svg">
                  <path d="M12 3.5c5 0 9 3.3 9 7.5s-4 7.5-9 7.5c-1 0-2-.1-2.9-.4L4.5 20l1.2-3.6C4 15 3 13.1 3 11c0-4.2 4-7.5 9-7.5z" fill="#fff" />
                </svg>
              </span>
            </button>
            <button type="button" class="app-icon" aria-label="hudayfa.json" @click="openApp('json')">
              <span class="app-tile bg-[#1f2b22] font-mono font-bold text-[#a3b18a]" aria-hidden="true">{ }</span>
            </button>
          </div>
        </div>

        <!-- Écran de verrouillage -->
        <div aria-hidden="true" class="lock-screen absolute inset-0 flex flex-col items-center">
          <div class="wallpaper absolute inset-0"></div>
          <svg viewBox="0 0 24 24" class="lock-icon relative">
            <rect x="5" y="10.5" width="14" height="10.5" rx="2.5" fill="currentColor" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2" />
          </svg>
          <p class="lock-date relative">{{ clockDate }}</p>
          <p class="lock-time relative">{{ clockTime }}</p>
          <div class="lock-actions absolute inset-x-0 flex justify-between">
            <span class="lock-action">
              <svg viewBox="0 0 24 24">
                <path d="M8 2.5h8l-1 4H9zM9 6.5h6l-1.2 5V21a1 1 0 0 1-1 1h-1.6a1 1 0 0 1-1-1v-9.5z" />
              </svg>
            </span>
            <span class="lock-action">
              <svg viewBox="0 0 24 24">
                <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.5-2h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />
                <circle cx="12" cy="13" r="3.5" fill="#26241f" />
              </svg>
            </span>
          </div>
        </div>

        <!-- Toucher simulé pendant l'intro -->
        <span aria-hidden="true" class="tap"></span>

        <!-- Applis plein écran -->
        <Transition name="app">
          <div v-if="app" :key="app" class="app-view absolute inset-0 z-20 flex flex-col bg-[#26241f]" role="dialog" :aria-label="app === 'json' ? 'hudayfa.json' : 'CV.pdf'">
            <!-- Barre d'outils façon appli Notes (décorative) -->
            <div aria-hidden="true" class="app-toolbar flex shrink-0 items-center justify-end text-[#e9c46a]">
              <svg viewBox="0 0 24 24" class="toolbar-icon">
                <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
              </svg>
              <svg viewBox="0 0 24 24" class="toolbar-icon">
                <circle cx="12" cy="12" r="9.5" />
                <circle cx="7.8" cy="12" r="0.6" fill="currentColor" />
                <circle cx="12" cy="12" r="0.6" fill="currentColor" />
                <circle cx="16.2" cy="12" r="0.6" fill="currentColor" />
              </svg>
            </div>

            <template v-if="app === 'json'">
              <p aria-hidden="true" class="note-date text-center text-[#8d8a80]">{{ noteDate }}</p>
              <ProfileJson compact class="app-json min-h-0 flex-1" @open-cv="openApp('cv')" />

              <div aria-hidden="true" class="note-toolbar flex shrink-0 items-center justify-between text-[#e9c46a]">
                <svg viewBox="0 0 24 24" class="toolbar-icon">
                  <circle cx="5" cy="6.5" r="1.8" />
                  <circle cx="5" cy="12" r="1.8" />
                  <circle cx="5" cy="17.5" r="1.8" />
                  <path d="M10 6.5h10M10 12h10M10 17.5h10" />
                </svg>
                <svg viewBox="0 0 24 24" class="toolbar-icon">
                  <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.5-2h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
                <svg viewBox="0 0 24 24" class="toolbar-icon">
                  <path d="M14.5 5.5 18.5 9.5M4 20l1-4.5L16 4.5a2 2 0 0 1 3 0l.5.5a2 2 0 0 1 0 3L8.5 19z" />
                </svg>
                <svg viewBox="0 0 24 24" class="toolbar-icon">
                  <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                  <path d="M17.5 3.5a2 2 0 0 1 3 3L12 15l-4 1 1-4z" />
                </svg>
              </div>
            </template>

            <div v-else class="cv-app flex min-h-0 flex-1 flex-col items-center justify-center text-center text-[#dad7cd]">
              <svg viewBox="0 0 40 48" class="cv-icon" aria-hidden="true">
                <path d="M4 2h22l10 10v32a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#f4f1e8" />
                <path d="M26 2v10h10" fill="#d9d4c3" />
                <rect x="2" y="26" width="30" height="11" rx="1.5" fill="#c42b1c" />
                <text x="17" y="34.5" text-anchor="middle" font-size="8" font-family="sans-serif" font-weight="700" fill="#fff">PDF</text>
              </svg>
              <p class="cv-name font-semibold">CV.pdf</p>
              <p class="cv-owner text-[#a3b18a]">Hudayfa Koujdal</p>
              <a :href="cvUrl" target="_blank" rel="noopener" class="cv-btn bg-[#a3b18a] text-[#1b2820]">
                {{ t('hero.os.openCv') }}
              </a>
              <a :href="cvUrl" download class="cv-btn border border-[#a3b18a] text-[#dad7cd]">
                {{ t('hero.os.download') }}
              </a>
            </div>
          </div>
        </Transition>

        <!-- Barre d'accueil : retour à l'écran d'accueil -->
        <button
          type="button"
          class="home-indicator absolute bottom-0 left-1/2 z-30 -translate-x-1/2"
          :aria-label="t('hero.os.home')"
          @click="goHome"
        >
          <span></span>
        </button>

        <!-- Écran éteint -->
        <div aria-hidden="true" class="screen-off absolute inset-0 z-40"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- Dimensions : tout est relatif à la largeur du téléphone ---------- */
.phone-scene {
  width: min(80vw, 22rem, calc((100svh - 6rem) / 2.12));
  container-type: inline-size;
  perspective: 900px;
}

.phone {
  position: relative;
  padding: 2.6cqw;
  border-radius: 15cqw;
  background: linear-gradient(145deg, #3c463f, #1d231f 55%, #2e3631);
  box-shadow:
    inset 0 0 0 0.5cqw #56615a,
    inset 0 0 0 1.1cqw #1a1f1c,
    0 3cqw 8cqw -2cqw rgb(0 0 0 / 0.45),
    0 1cqw 2cqw rgb(0 0 0 / 0.25);
}

.side-btn {
  position: absolute;
  width: 1cqw;
  border-radius: 0.6cqw;
  background: linear-gradient(90deg, #2a312c, #4b5650);
}

.side-btn-action {
  left: -0.8cqw;
  top: 20%;
  height: 6cqw;
}

.side-btn-vol-up {
  left: -0.8cqw;
  top: 29%;
  height: 11cqw;
}

.side-btn-vol-down {
  left: -0.8cqw;
  top: 38%;
  height: 11cqw;
}

.side-btn-power {
  right: -0.8cqw;
  top: 31%;
  height: 17cqw;
  background: linear-gradient(270deg, #2a312c, #4b5650);
}

.screen {
  position: relative;
  aspect-ratio: 9 / 19.5;
  overflow: hidden;
  border-radius: 12.5cqw;
  background: #000;
  color: #fff;
  --status-h: 13cqw;
  /* Centre de l'icône hudayfa.json, pour le toucher simulé et l'ouverture de l'appli. */
  --tap-x: 17%;
  --tap-y: 12%;
}

.wallpaper {
  background:
    radial-gradient(circle at 80% 15%, rgb(218 215 205 / 0.35), transparent 45%),
    radial-gradient(circle at 10% 90%, rgb(163 177 138 / 0.5), transparent 55%),
    linear-gradient(160deg, #344e41, #588157);
}

/* ---------- Barre d'état ---------- */
.status-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  column-gap: 4.5cqw;
  height: var(--status-h);
  padding: 0 6cqw;
  font-size: max(10px, 3.4cqw);
  font-weight: 600;
}

/* Heure et icônes collées de part et d'autre de l'îlot, à la même distance. */
.status-time {
  justify-self: end;
}

.status-icons {
  justify-self: start;
}

.island {
  width: 36cqw;
  height: 8cqw;
  border-radius: 9999px;
  background: #000;
}

.status-icon {
  height: 2.8cqw;
  min-height: 8px;
  fill: currentColor;
}

.status-battery {
  height: 3cqw;
}

/* ---------- Écran d'accueil ---------- */
.home {
  padding: calc(var(--status-h) + 4cqw) 6cqw 5cqw;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4cqw 2cqw;
}

.app-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5cqw;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.app-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16cqw;
  height: 16cqw;
  border-radius: 4.2cqw;
  font-size: 5cqw;
  box-shadow: 0 1cqw 2.5cqw rgb(0 0 0 / 0.25);
  transition: transform 0.15s ease;
}

.app-icon:active .app-tile {
  transform: scale(0.9);
}

.app-icon:focus-visible {
  outline: 2px solid #f4f1e8;
  outline-offset: 1cqw;
  border-radius: 4.2cqw;
}

.tile-svg {
  width: 9.5cqw;
}

.app-label {
  max-width: 21cqw;
  overflow: hidden;
  font-size: max(10px, 3.3cqw);
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.5);
}

.dock {
  display: flex;
  justify-content: space-around;
  margin-top: auto;
  padding: 3cqw 4cqw;
  border-radius: 9cqw;
  background: rgb(255 255 255 / 0.18);
  backdrop-filter: blur(10px);
}

/* ---------- Applis ---------- */
.app-view {
  padding-top: var(--status-h);
}

.app-toolbar {
  gap: 4.5cqw;
  height: 10cqw;
  padding: 0 5cqw;
}

.toolbar-icon {
  width: max(16px, 6cqw);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.note-date {
  font-size: max(10px, 3.2cqw);
}

.note-toolbar {
  height: 16cqw;
  padding: 0 7cqw 8cqw;
}

/* 18 lignes compactes : la ligne la plus longue (~40 caractères) tient dans la largeur. */
.app-json {
  padding: 3cqw 3.5cqw 2cqw;
  font-size: max(10px, 3.55cqw);
  line-height: 1.55;
}

.cv-app {
  gap: 2.5cqw;
  padding: 6cqw 8cqw 12cqw;
}

.cv-icon {
  width: 22cqw;
  margin-bottom: 2cqw;
}

.cv-name {
  font-size: max(14px, 5cqw);
}

.cv-owner {
  margin-bottom: 4cqw;
  font-size: max(12px, 3.8cqw);
}

.cv-btn {
  width: 100%;
  padding: 3cqw 0;
  border-radius: 3.5cqw;
  font-size: max(13px, 4.2cqw);
  font-weight: 600;
}

.home-indicator {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 45cqw;
  height: 7cqw;
  padding-bottom: 2.2cqw;
}

.home-indicator span {
  width: 36cqw;
  height: 1.4cqw;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.85);
}

.app-enter-active,
.app-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.app-enter-from,
.app-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* ---------- Écran de verrouillage ---------- */
.lock-screen {
  z-index: 28;
  padding-top: calc(var(--status-h) + 3cqw);
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.3);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-100%);
  transition:
    transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.45s ease;
}

.is-locked .lock-screen {
  opacity: 1;
  transform: none;
}

.lock-icon {
  width: 5cqw;
  min-width: 12px;
}

.lock-date {
  margin-top: 3cqw;
  font-size: max(12px, 4.6cqw);
  font-weight: 600;
  text-transform: capitalize;
}

.lock-time {
  font-size: 24cqw;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.lock-actions {
  bottom: 9cqw;
  padding: 0 11cqw;
}

.lock-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13cqw;
  height: 13cqw;
  border-radius: 9999px;
  background: rgb(0 0 0 / 0.28);
  backdrop-filter: blur(8px);
}

.lock-action svg {
  width: 6cqw;
  fill: #fff;
}

/* Sur l'écran de verrouillage, l'heure est au centre : pas dans la barre d'état. */
.status-time {
  transition: opacity 0.3s ease;
}

.is-locked .status-time {
  opacity: 0;
}

/* ---------- Écran éteint ---------- */
.screen-off {
  background: #000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease-in;
}

.is-off .screen-off {
  opacity: 1;
  pointer-events: auto;
}

/* ---------- Séquence d'ouverture ---------- */
.tap {
  position: absolute;
  z-index: 25;
  left: calc(var(--tap-x) - 7cqw);
  top: calc(var(--tap-y) - 7cqw);
  width: 14cqw;
  height: 14cqw;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.55);
  opacity: 0;
  pointer-events: none;
}

.intro .phone {
  animation: phone-in 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.intro .screen-off {
  animation: screen-on 0.45s ease-out 0.9s both;
}

/* Écran de verrouillage (0,9 s) → déverrouillage (2,1 s) → accueil → toucher → appli. */
.intro .lock-screen {
  animation: unlock 0.45s cubic-bezier(0.4, 0, 0.2, 1) 2.1s both;
}

.intro .status-time {
  animation: fade-in 0.3s ease 2.3s both;
}

.intro .app-grid li,
.intro .dock {
  animation: pop 0.35s cubic-bezier(0.3, 1.4, 0.6, 1) both;
}

.intro .app-grid li:nth-child(1) {
  animation-delay: 2.4s;
}

.intro .app-grid li:nth-child(2) {
  animation-delay: 2.47s;
}

.intro .app-grid li:nth-child(3) {
  animation-delay: 2.54s;
}

.intro .app-grid li:nth-child(4) {
  animation-delay: 2.61s;
}

.intro .dock {
  animation-delay: 2.7s;
}

/* Le toucher tombe sur hudayfa.json, première icône de la grille. */
.intro .tap {
  animation: tap 0.45s ease-out 3.15s both;
}

.intro .app-view {
  transform-origin: var(--tap-x) var(--tap-y);
  animation: app-open 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) 3.5s both;
}

@keyframes unlock {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: translateY(-100%);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes phone-in {
  from {
    opacity: 0;
    transform: translateY(35%) rotateX(35deg) rotateZ(-8deg);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes screen-on {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes tap {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  30% {
    opacity: 0.9;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.4);
  }
}

@keyframes app-open {
  from {
    opacity: 0;
    transform: scale(0.15);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro .phone,
  .intro .screen-off,
  .intro .lock-screen,
  .intro .status-time,
  .intro .app-grid li,
  .intro .dock,
  .intro .tap,
  .intro .app-view {
    animation: none !important;
  }
}
</style>
