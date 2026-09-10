<script setup>
/**
 * Notifications de progression (quête terminée, badge, montée de niveau).
 *
 * `aria-live="polite"` : l'information est annoncée aux lecteurs d'écran sans jamais interrompre
 * la lecture en cours ni déplacer le focus. Les toasts disparaissent seuls et ne contiennent
 * aucune action — rien d'important n'est enfermé dedans.
 */
import { useI18n } from 'vue-i18n'
import { Award, Sparkles, Trophy } from 'lucide-vue-next'
import { useGame } from '@/composables/useGame'

const { t } = useI18n()
const { ready, isAdventure, toasts } = useGame()

const ICONS = { quest: Trophy, badge: Award, level: Sparkles }

const titleOf = (toast) => t(`game.toast.${toast.kind}`)

const bodyOf = (toast) => {
  if (toast.kind === 'quest') return t(`game.quests.${toast.key}.name`)
  if (toast.kind === 'badge') return t(`game.badgeList.${toast.key}.name`)
  return t(`game.levels.${toast.key}`)
}
</script>

<template>
  <div
    v-if="ready && isAdventure"
    class="pointer-events-none fixed top-20 right-4 z-60 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2 print:hidden"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-start gap-3 rounded-lg border border-primary bg-card p-3 shadow-lg"
      >
        <span
          class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-strong text-on-primary"
        >
          <component :is="ICONS[toast.kind]" class="h-4 w-4" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <p class="font-mono text-xs font-bold tracking-wider text-primary uppercase">
            {{ titleOf(toast) }}
          </p>
          <p class="text-sm font-semibold text-card-text">{{ bodyOf(toast) }}</p>
          <p v-if="toast.xp" class="text-xs text-card-muted">
            {{ t('game.xpGain', { xp: toast.xp }) }}
          </p>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
