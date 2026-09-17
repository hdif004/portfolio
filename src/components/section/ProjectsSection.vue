<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight } from 'lucide-vue-next'
import BrowserMock from '../BrowserMock.vue'
import ProjectModal from '../ProjectModal.vue'

const { t } = useI18n()

/**
 * Uniquement des missions livrées pour des clients : les projets d'études et de stage ont été
 * retirés, ils diluaient la preuve plus qu'ils ne l'appuyaient.
 *
 * `key` : préfixe des textes dans les fichiers de langue (`title`, `desc`, `meta`, `details`).
 * `preview` : nom des captures dans `public/previews/` (`<preview>-desktop.webp` et
 * `<preview>-mobile.webp`), générées par `npm run screenshots`. Les boutiques Shopify refusent
 * d'être affichées dans une iframe : une capture est le seul aperçu fiable.
 */
const projectItems = [
  {
    key: 'projects.items[0]',
    link: 'https://mudaparis.com',
    preview: 'mudaparis',
    technos: ['Shopify', 'WooCommerce', 'Migration', 'Redirections 301'],
  },
  {
    key: 'projects.items[1]',
    link: 'https://amadal.ma',
    preview: 'amadal',
    technos: ['React', 'WordPress headless', 'SEO', 'Performance'],
  },
  {
    key: 'projects.items[2]',
    link: 'https://santibe.fr',
    preview: 'santibe',
    technos: ['Shopify', 'Liquid', 'JavaScript', 'Upsell'],
  },
  {
    key: 'projects.items[3]',
    link: 'https://soliferme.fr',
    preview: 'soliferme',
    technos: ['Shopify', 'Liquid', 'Intégration de maquette'],
  },
  {
    key: 'projects.items[4]',
    link: 'https://soraali.com',
    preview: 'soraali',
    technos: ['Shopify', 'Liquid', 'JavaScript', 'Debug'],
  },
]

/** Le premier projet est mis en avant sur toute la largeur, les suivants passent en grille. */
const featured = computed(() => projectItems[0])
const others = computed(() => projectItems.slice(1))

const selected = ref(null)

const previewSrc = (project, format) =>
  `${import.meta.env.BASE_URL}previews/${project.preview}-${format}.webp`

/** Adresse affichée dans la barre du faux navigateur : le domaine seul, sans protocole. */
const hostname = (url) => new URL(url).hostname.replace(/^www\./, '')
</script>

<template>
  <section id="projects" class="py-16 md:py-20 px-4 sm:px-6 w-full md:w-11/12 max-w-6xl mx-auto">
    <div class="mb-10">
      <h2 class="text-3xl md:text-5xl font-extrabold text-primary">
        {{ t('projects.title') }}
      </h2>
      <p class="mt-3 text-text-muted md:text-lg">{{ t('projects.subtitle') }}</p>
    </div>

    <!-- Projet mis en avant -->
    <article
      class="group mb-10 grid cursor-pointer items-center gap-8 rounded-3xl bg-surface p-4 sm:p-5 md:mb-8 md:grid-cols-5 md:p-8"
      @click="selected = featured"
    >
      <button
        type="button"
        class="relative block w-full cursor-pointer text-left md:col-span-3"
        :aria-label="t('projects.openDetails', { project: t(`${featured.key}.title`) })"
      >
        <BrowserMock
          :src="previewSrc(featured, 'desktop')"
          :alt="t('projects.previewDesktop', { site: hostname(featured.link) })"
          :host="hostname(featured.link)"
          class="transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
        />
        <img
          :src="previewSrc(featured, 'mobile')"
          :alt="t('projects.previewMobile', { site: hostname(featured.link) })"
          width="390"
          height="844"
          loading="lazy"
          decoding="async"
          class="absolute -bottom-4 -right-2 w-[20%] min-w-20 rounded-xl border-4 border-card-text bg-background shadow-xl transition duration-300 group-hover:-translate-y-2"
        />
      </button>

      <div class="md:col-span-2">
        <!-- Pas de ligne `meta` ici : la description complète mentionne déjà le client et la date. -->
        <h3 class="text-2xl md:text-3xl font-bold leading-snug">
          {{ t(`${featured.key}.title`) }}
        </h3>
        <p class="mt-4 text-text">{{ t(`${featured.key}.desc`) }}</p>
        <ul class="mt-5 flex flex-wrap gap-2 text-sm">
          <li
            v-for="tech in featured.technos"
            :key="tech"
            class="rounded-full bg-background px-3 py-1 font-semibold text-primary"
          >
            {{ tech }}
          </li>
        </ul>
        <div class="mt-6 flex flex-wrap items-center gap-5">
          <span
            class="inline-flex rounded-md bg-primary-strong px-5 py-2.5 font-semibold text-on-primary transition group-hover:bg-primary-dark"
          >
            {{ t('projects.details') }}
          </span>
          <a
            :href="featured.link"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            @click.stop
          >
            {{ t('projects.viewSite') }}
            <ArrowUpRight class="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>

    <!-- Autres projets -->
    <div class="grid gap-x-8 gap-y-12 md:grid-cols-2">
      <article
        v-for="project in others"
        :key="project.key"
        class="group cursor-pointer"
        @click="selected = project"
      >
        <button
          type="button"
          class="relative block w-full cursor-pointer rounded-3xl bg-surface px-4 pt-4 pb-8 text-left sm:px-6 sm:pt-6 sm:pb-10"
          :aria-label="t('projects.openDetails', { project: t(`${project.key}.title`) })"
        >
          <BrowserMock
            :src="previewSrc(project, 'desktop')"
            :alt="t('projects.previewDesktop', { site: hostname(project.link) })"
            :host="hostname(project.link)"
            class="transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
          />
          <img
            :src="previewSrc(project, 'mobile')"
            :alt="t('projects.previewMobile', { site: hostname(project.link) })"
            width="390"
            height="844"
            loading="lazy"
            decoding="async"
            class="absolute bottom-3 right-5 w-[20%] min-w-16 sm:bottom-4 sm:right-8 rounded-xl border-4 border-card-text bg-background shadow-xl transition duration-300 group-hover:-translate-y-2"
          />
        </button>

        <div class="mt-5 px-1">
          <p class="text-sm font-semibold text-primary">{{ t(`${project.key}.meta`) }}</p>
          <h3 class="mt-1 text-xl font-bold leading-snug group-hover:underline">
            {{ t(`${project.key}.title`) }}
          </h3>
          <ul class="mt-3 flex flex-wrap gap-2 text-sm">
            <li
              v-for="tech in project.technos"
              :key="tech"
              class="rounded-full bg-surface px-3 py-1 font-semibold text-primary"
            >
              {{ tech }}
            </li>
          </ul>
          <a
            :href="project.link"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            @click.stop
          >
            {{ t('projects.viewSite') }}
            <ArrowUpRight class="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </article>
    </div>

    <ProjectModal :project="selected" @close="selected = null" />
  </section>
</template>
