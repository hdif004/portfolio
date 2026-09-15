<script setup>
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, ArrowUpRight } from 'lucide-vue-next'
import BrowserMock from './BrowserMock.vue'

/**
 * Détail d'un projet dans un <dialog> natif : piège du focus, touche Échap et retour du focus
 * sont gérés par le navigateur. Ouverture en deux temps (hauteur puis largeur), fermeture inverse.
 */
const props = defineProps({
  project: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const { t, tm } = useI18n()

const dialog = ref(null)
const closing = ref(false)
let fallback = null

watch(
  () => props.project,
  async (project) => {
    if (!project) return
    await nextTick()
    closing.value = false
    dialog.value.showModal()
    document.documentElement.style.overflow = 'hidden'
  },
)

const requestClose = () => {
  if (closing.value) return
  closing.value = true
  // Filet de sécurité si `animationend` ne se déclenche pas.
  fallback = setTimeout(() => dialog.value?.open && dialog.value.close(), 700)
}

const onAnimationEnd = (event) => {
  if (event.target === dialog.value && closing.value) dialog.value.close()
}

// Un clic dont la cible est le <dialog> lui-même tombe sur le fond assombri.
const onClick = (event) => {
  if (event.target === dialog.value) requestClose()
}

const onClosed = () => {
  clearTimeout(fallback)
  closing.value = false
  document.documentElement.style.overflow = ''
  emit('close')
}

const previewSrc = (format) =>
  `${import.meta.env.BASE_URL}previews/${props.project.preview}-${format}.webp`

const hostname = (url) => new URL(url).hostname.replace(/^www\./, '')
</script>

<template>
  <dialog
    ref="dialog"
    class="project-modal m-auto h-[94dvh] max-h-none w-[96vw] max-w-none overflow-hidden rounded-2xl border-0 bg-card p-0 text-card-text shadow-2xl"
    :class="{ 'is-closing': closing }"
    aria-labelledby="project-modal-title"
    @cancel.prevent="requestClose"
    @click="onClick"
    @animationend="onAnimationEnd"
    @close="onClosed"
  >
    <div v-if="project" class="modal-inner h-full overflow-y-auto">
      <header
        class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-muted bg-card px-6 py-4 md:px-10"
      >
        <div>
          <h2 id="project-modal-title" class="text-2xl font-bold md:text-3xl">
            {{ t(`${project.key}.title`) }}
          </h2>
          <p class="mt-1 text-sm text-card-muted">{{ t(`${project.key}.meta`) }}</p>
        </div>
        <button
          type="button"
          class="shrink-0 cursor-pointer rounded-full p-2 transition hover:bg-muted"
          :aria-label="t('projects.close')"
          @click="requestClose"
        >
          <X class="h-6 w-6" aria-hidden="true" />
        </button>
      </header>

      <div class="px-6 py-8 md:px-10">
        <!-- Mocks : ordinateur à gauche, téléphone à droite -->
        <div
          class="grid items-center gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] md:gap-12"
        >
          <BrowserMock
            :src="previewSrc('desktop')"
            :alt="t('projects.previewDesktop', { site: hostname(project.link) })"
            :host="hostname(project.link)"
          />

          <div
            class="mx-auto w-40 rounded-[2rem] border-[10px] border-[#1f2937] bg-[#1f2937] shadow-xl md:w-full md:max-w-60"
          >
            <div class="relative overflow-hidden rounded-[1.4rem] bg-background">
              <span
                class="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-[#1f2937]"
                aria-hidden="true"
              ></span>
              <img
                :src="previewSrc('mobile')"
                :alt="t('projects.previewMobile', { site: hostname(project.link) })"
                width="390"
                height="844"
                loading="lazy"
                decoding="async"
                class="block aspect-[390/844] w-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        <!-- Description détaillée -->
        <div class="mt-10 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-12">
          <div>
            <h3 class="mb-3 text-lg font-semibold text-primary">{{ t('projects.work') }}</h3>
            <ul class="list-disc space-y-2 pl-5">
              <li v-for="(_, index) in tm(`${project.key}.details`)" :key="index">
                {{ t(`${project.key}.details[${index}]`) }}
              </li>
            </ul>
          </div>

          <div>
            <h3 class="mb-3 text-lg font-semibold text-primary">{{ t('projects.stack') }}</h3>
            <ul class="mb-6 flex flex-wrap gap-2 text-sm text-primary">
              <li
                v-for="tech in project.technos"
                :key="tech"
                class="rounded border bg-primary/10 px-2 py-1 font-bold"
              >
                {{ tech }}
              </li>
            </ul>
            <a
              :href="project.link"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              {{ t('projects.viewSite') }}
              <ArrowUpRight class="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.project-modal[open] {
  animation: modal-open 650ms cubic-bezier(0.65, 0, 0.35, 1) both;
}

.project-modal[open]::backdrop {
  background: rgb(0 0 0 / 0.6);
  animation: fade-in 350ms ease-out both;
}

.project-modal.is-closing {
  animation: modal-close 500ms cubic-bezier(0.65, 0, 0.35, 1) both;
}

.project-modal.is-closing::backdrop {
  animation: fade-out 500ms ease-in both;
}

/* Le contenu n'apparaît qu'une fois la fenêtre dépliée, et disparaît avant qu'elle se replie. */
.modal-inner {
  animation: fade-in 200ms ease-out 550ms both;
}

.is-closing .modal-inner {
  animation: fade-out 120ms ease-in both;
}

/* Axe Y d'abord (une fine ligne qui grandit en hauteur), puis axe X. */
@keyframes modal-open {
  0% {
    transform: scale(0.01, 0);
  }
  45% {
    transform: scale(0.01, 1);
  }
  100% {
    transform: scale(1, 1);
  }
}

@keyframes modal-close {
  0% {
    transform: scale(1, 1);
  }
  55% {
    transform: scale(0.01, 1);
  }
  100% {
    transform: scale(0.01, 0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes fade-out {
  to {
    opacity: 0;
  }
}
</style>
