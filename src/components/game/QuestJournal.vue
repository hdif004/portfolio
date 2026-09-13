<script setup>
/**
 * Journal de quêtes flottant : niveau, barre d'expérience, liste des sections et badges.
 *
 * Il double la navigation sans la remplacer — la barre de nav classique reste en place, elle est
 * le seul chemin fiable pour un visiteur qui n'a pas envie de jouer.
 *
 * Déplié par défaut sur grand écran, replié en pastille sur mobile (voir `hydrateGame`), à gauche
 * pour ne jamais recouvrir le raccourci « Contact » fixé en bas à droite. En mode aventure il
 * remonte sous la barre du site, où la barre des lieux ne le percute pas (voir `main.css`).
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Check,
  ChevronRight,
  Circle,
  Footprints,
  Gamepad2,
  Languages,
  Lock,
  Moon,
  RotateCcw,
  ScrollText,
  Swords,
  Trophy,
  X,
} from 'lucide-vue-next'
import { useGame } from '@/composables/useGame'

const { t } = useI18n()
const {
  ready,
  isAdventure,
  quests,
  unlockedBadges,
  journalOpen,
  level,
  xp,
  levelProgress,
  xpToNextLevel,
  isMaxLevel,
  completedCount,
  totalQuests,
  currentQuestId,
  toggleJournal,
  resetProgress,
} = useGame()

const BADGE_ICONS = {
  firstQuest: Footprints,
  darkMode: Moon,
  polyglot: Languages,
  konami: Gamepad2,
  completionist: Trophy,
}

const statusOf = (quest) =>
  quest.done ? 'done' : currentQuestId.value === quest.id ? 'current' : 'todo'

const iconOf = (quest) =>
  quest.done ? Check : currentQuestId.value === quest.id ? ChevronRight : Circle

const levelTitle = computed(() => t(`game.levels.${level.value}`))

// Sur mobile le journal recouvre la page : un clic sur une quête le referme.
const onQuestClick = () => {
  if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 768px)').matches) {
    journalOpen.value = false
  }
}
</script>

<template>
  <aside
    v-if="ready && isAdventure"
    class="quest-journal fixed bottom-4 left-4 z-50 print:hidden"
    :aria-label="t('game.journal')"
  >
    <!-- Panneau déplié -->
    <div
      v-show="journalOpen"
      id="quest-journal"
      class="quest-panel w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-primary bg-card p-4 shadow-lg"
    >
      <div class="mb-3 flex items-start justify-between gap-2">
        <div>
          <p
            class="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-primary uppercase"
          >
            <Swords class="h-3.5 w-3.5" aria-hidden="true" />
            {{ t('game.levelShort', { level }) }} · {{ levelTitle }}
          </p>
          <p class="text-xs text-card-muted">
            {{ t('game.questProgress', { done: completedCount, total: totalQuests }) }}
          </p>
        </div>

        <button
          type="button"
          class="-m-1 rounded p-1 text-card-muted hover:text-card-text"
          :aria-label="t('game.closeJournal')"
          aria-controls="quest-journal"
          :aria-expanded="journalOpen"
          @click="toggleJournal"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <!-- Barre d'expérience -->
      <div
        class="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        :aria-valuenow="levelProgress"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="t('game.xpBar', { xp })"
      >
        <div
          class="xp-fill h-full rounded-full bg-primary-strong"
          :style="{ width: `${levelProgress}%` }"
        ></div>
      </div>
      <p class="mt-1 mb-3 text-xs text-card-muted">
        {{ isMaxLevel ? t('game.maxLevel', { xp }) : t('game.xpToNext', { xp: xpToNextLevel }) }}
      </p>

      <!-- Liste des quêtes : elle sert aussi de navigation. -->
      <ol class="space-y-1">
        <li v-for="quest in quests" :key="quest.id">
          <a
            :href="`#${quest.anchor}`"
            class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-card-text transition hover:bg-muted"
            :class="{ 'font-semibold': statusOf(quest) === 'current' }"
            @click="onQuestClick"
          >
            <component
              :is="iconOf(quest)"
              class="h-4 w-4 shrink-0"
              :class="quest.done ? 'text-primary' : 'text-card-muted'"
              aria-hidden="true"
            />
            <span :class="quest.done ? 'text-card-muted line-through' : ''">
              {{ t(`game.quests.${quest.id}.name`) }}
            </span>
            <span class="sr-only">— {{ t(`game.status.${statusOf(quest)}`) }}</span>
            <span class="ml-auto font-mono text-xs text-card-muted">+{{ quest.xp }}</span>
          </a>
        </li>
      </ol>

      <!-- Badges -->
      <p class="mt-3 mb-1 font-mono text-xs font-bold tracking-wider text-card-muted uppercase">
        {{ t('game.badges') }}
      </p>
      <ul class="flex flex-wrap gap-1.5">
        <li v-for="badge in unlockedBadges" :key="badge.id">
          <span
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border"
            :class="
              badge.unlocked
                ? 'border-primary bg-primary-strong text-on-primary'
                : 'border-muted bg-muted text-card-muted'
            "
            :title="badge.unlocked ? t(`game.badgeList.${badge.id}.name`) : t('game.badgeLocked')"
          >
            <component
              :is="badge.unlocked ? BADGE_ICONS[badge.id] : Lock"
              class="h-4 w-4"
              aria-hidden="true"
            />
            <span class="sr-only">
              {{ badge.unlocked ? t(`game.badgeList.${badge.id}.name`) : t('game.badgeLocked') }}
            </span>
          </span>
        </li>
      </ul>

      <button
        type="button"
        class="mt-3 inline-flex items-center gap-1.5 text-xs text-card-muted underline hover:text-card-text"
        @click="resetProgress"
      >
        <RotateCcw class="h-3 w-3" aria-hidden="true" />
        {{ t('game.reset') }}
      </button>
    </div>

    <!-- Pastille repliée -->
    <button
      v-show="!journalOpen"
      type="button"
      class="inline-flex items-center gap-2 rounded-full border border-primary bg-card py-2 pr-4 pl-3 shadow-lg"
      aria-controls="quest-journal"
      :aria-expanded="journalOpen"
      @click="toggleJournal"
    >
      <ScrollText class="h-5 w-5 text-primary" aria-hidden="true" />
      <span class="flex flex-col items-start">
        <span class="font-mono text-xs font-bold text-primary">
          {{ t('game.levelShort', { level }) }}
        </span>
        <span class="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <span
            class="xp-fill block h-full rounded-full bg-primary-strong"
            :style="{ width: `${levelProgress}%` }"
          ></span>
        </span>
      </span>
      <span class="sr-only">
        {{ t('game.openJournal') }} —
        {{ t('game.questProgress', { done: completedCount, total: totalQuests }) }}
      </span>
    </button>
  </aside>
</template>
