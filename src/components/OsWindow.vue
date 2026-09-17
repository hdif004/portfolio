<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Fenêtre du bureau simulé dans la hero : barre de titre façon Windows (réduire, agrandir,
 * fermer). Les tailles sont en `cqw`, relatives à l'écran du mockup.
 */
const props = defineProps({
  title: { type: String, required: true },
  maximized: { type: Boolean, default: true },
  active: { type: Boolean, default: false },
  /** Position quand la fenêtre n'est pas agrandie : { top, left, right, bottom }. */
  windowed: { type: Object, required: true },
})

const emit = defineEmits(['focus', 'minimize', 'toggle-maximize', 'close'])

const { t } = useI18n()

const frame = computed(() =>
  props.maximized ? { top: '0', left: '0', right: '0', bottom: 'var(--taskbar-h)' } : props.windowed,
)
</script>

<template>
  <div
    role="dialog"
    :aria-label="title"
    class="os-window absolute flex flex-col overflow-hidden bg-[#1f2b22]"
    :class="[active ? 'z-20' : 'z-10', { 'is-windowed': !maximized }]"
    :style="frame"
    @pointerdown="emit('focus')"
  >
    <div
      class="title-bar flex shrink-0 items-center justify-between bg-[#18221b] text-[#dad7cd]"
      @dblclick="emit('toggle-maximize')"
    >
      <span class="flex min-w-0 items-center gap-[0.8cqw] pl-[1.5cqw]">
        <slot name="icon" />
        <span class="truncate">{{ title }}</span>
      </span>
      <span class="flex h-full shrink-0">
        <slot name="actions" />
        <button type="button" class="win-btn" :aria-label="t('hero.os.minimize')" @click="emit('minimize')">
          <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 5h8" /></svg>
        </button>
        <button
          type="button"
          class="win-btn"
          :aria-label="maximized ? t('hero.os.restore') : t('hero.os.maximize')"
          @click="emit('toggle-maximize')"
        >
          <svg v-if="maximized" viewBox="0 0 10 10" aria-hidden="true">
            <rect x="1.5" y="3" width="5.5" height="5.5" />
            <path d="M3 3V1.5h5.5V7H7" />
          </svg>
          <svg v-else viewBox="0 0 10 10" aria-hidden="true"><rect x="1.5" y="1.5" width="7" height="7" /></svg>
        </button>
        <button type="button" class="win-btn win-close" :aria-label="t('hero.os.close')" @click="emit('close')">
          <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" /></svg>
        </button>
      </span>
    </div>
    <div class="min-h-0 flex-1">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.os-window {
  transition:
    top 0.25s ease,
    left 0.25s ease,
    right 0.25s ease,
    bottom 0.25s ease,
    border-radius 0.25s ease;
}

.is-windowed {
  border-radius: 0.8cqw;
  box-shadow: 0 1.5cqw 4cqw rgb(0 0 0 / 0.45);
  outline: 1px solid rgb(255 255 255 / 0.1);
}

.title-bar {
  height: 4.5cqw;
  font-size: max(11px, 1.6cqw);
  user-select: none;
}

.title-bar :slotted(.win-btn),
.win-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5.5cqw;
  min-width: 22px;
  height: 100%;
  color: inherit;
  cursor: pointer;
}

.title-bar :slotted(.win-btn svg),
.win-btn svg {
  width: max(7px, 1.1cqw);
  fill: none;
  stroke: currentColor;
  stroke-width: 1;
}

.title-bar :slotted(.win-btn:hover),
.win-btn:hover {
  background: rgb(255 255 255 / 0.08);
}

.win-close:hover {
  background: #c42b1c;
  color: #fff;
}

.win-btn:focus-visible,
.title-bar :slotted(.win-btn:focus-visible) {
  outline: 2px solid #a3b18a;
  outline-offset: -2px;
  border-radius: 0;
}
</style>
