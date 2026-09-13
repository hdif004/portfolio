<script setup>
/**
 * Le contenu des zones, déployé dans la scène au lieu d'un panneau.
 *
 * Quand une zone s'ouvre, ses éléments apparaissent accrochés aux objets (voir `WorldPin`) : les
 * traits se tracent depuis les objets, puis les cartes surgissent l'une après l'autre — ou sortent
 * des caisses, pour les projets. À la fermeture, tout se replie avant que la caméra ne reparte.
 *
 * Tout reste du HTML : lisible, traduit, atteignable au clavier, et Échap referme (voir `useWorld`).
 * Sur un écran étroit il n'y a pas la place autour des objets : le même contenu passe dans un
 * volet en bas de l'écran (voir `main.css`).
 */
import { useI18n } from 'vue-i18n'
import { X } from 'lucide-vue-next'
import gsap from 'gsap'
import HeroStage from '@/components/stage/HeroStage.vue'
import AboutStage from '@/components/stage/AboutStage.vue'
import SkillsStage from '@/components/stage/SkillsStage.vue'
import ProjectsStage from '@/components/stage/ProjectsStage.vue'
import BannerStage from '@/components/stage/BannerStage.vue'
import CampStage from '@/components/stage/CampStage.vue'
import { useGame } from '@/composables/useGame'
import { useWorld } from '@/composables/useWorld'

const STAGES = {
  hero: HeroStage,
  about: AboutStage,
  skills: SkillsStage,
  projects: ProjectsStage,
  banner: BannerStage,
  footer: CampStage,
}

const { t } = useI18n()
const { worldActive } = useGame()
const { activeId, panelOpen, closePanel } = useWorld()

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const narrow = () => window.matchMedia('(max-width: 640px)').matches

function onEnter(scene, done) {
  if (reducedMotion()) return done()

  const stage = scene.closest('.world-stage')
  const scale = parseFloat(getComputedStyle(stage).getPropertyValue('--pin-scale')) || 1
  // On laisse la caméra entamer son trajet : les cartes arrivent quand la zone se précise.
  const timeline = gsap.timeline({ delay: 0.5, onComplete: done })

  timeline.from(
    scene.querySelectorAll('.world-pin-leader'),
    { scaleX: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
    0,
  )

  scene.querySelectorAll('.world-pin').forEach((pin, index) => {
    const card = pin.querySelector('.world-pin-card')
    const at = 0.15 + index * 0.07

    if (pin.classList.contains('is-emerge') && !narrow()) {
      // La carte part de l'objet (décalage inverse) et s'envole vers sa place en tournoyant.
      timeline.from(
        card,
        {
          x: -Number(pin.dataset.dx) * scale,
          y: -Number(pin.dataset.dy) * scale,
          scale: 0.1,
          rotation: index % 2 ? -18 : 18,
          opacity: 0,
          duration: 0.75,
          ease: 'back.out(1.3)',
        },
        at,
      )
    } else {
      timeline.from(
        card,
        { y: 18, scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(1.8)' },
        at,
      )
    }
  })
}

function onLeave(scene, done) {
  if (reducedMotion()) return done()
  gsap.to(scene.querySelectorAll('.world-pin-card, .world-pin-leader, .world-pin-dot'), {
    opacity: 0,
    scale: 0.85,
    duration: 0.18,
    stagger: 0.015,
    onComplete: done,
  })
}
</script>

<template>
  <div
    v-if="worldActive"
    id="world-stage"
    class="world-stage"
    tabindex="-1"
    :aria-label="t(`game.places.${activeId}`)"
  >
    <Transition :css="false" mode="out-in" @enter="onEnter" @leave="onLeave">
      <div v-if="panelOpen" :key="activeId" class="world-stage-scene">
        <component :is="STAGES[activeId]" />
      </div>
    </Transition>

    <button v-if="panelOpen" type="button" class="world-stage-close" @click="closePanel">
      <X class="h-4 w-4" aria-hidden="true" />
      {{ t('game.world.close') }}
      <kbd aria-hidden="true">Échap</kbd>
    </button>

    <p class="sr-only" role="status" aria-live="polite">
      {{ panelOpen ? t(`game.places.${activeId}`) : '' }}
    </p>
  </div>
</template>
