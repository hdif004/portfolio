<script setup>
import { ref } from 'vue'
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

const selected = ref(null)

const previewSrc = (project, format) =>
  `${import.meta.env.BASE_URL}previews/${project.preview}-${format}.webp`

/** Adresse affichée dans la barre du faux navigateur : le domaine seul, sans protocole. */
const hostname = (url) => new URL(url).hostname.replace(/^www\./, '')
</script>

<template>
  <section id="projects" class="py-20 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-2 text-primary">
      {{ t('projects.title') }}
    </h2>
    <p class="text-text-muted mb-8 max-w-2xl">{{ t('projects.subtitle') }}</p>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Toute la carte ouvre le détail ; le bouton sur l'aperçu est le chemin clavier. -->
      <div
        v-for="project in projectItems"
        :key="project.key"
        class="group bg-card p-6 rounded shadow-sm cursor-pointer"
        @click="selected = project"
      >
        <button
          type="button"
          class="relative mb-10 block w-full cursor-pointer text-left"
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
            class="absolute -bottom-6 right-3 w-[22%] min-w-20 rounded-xl border-4 border-card-text bg-background shadow-xl transition duration-300 group-hover:-translate-y-2"
          />
        </button>

        <h3 class="text-xl font-semibold mb-2">
          {{ t(`${project.key}.title`) }}
        </h3>
        <p class="text-sm text-text-muted mb-4">
          {{ t(`${project.key}.desc`) }}
        </p>

        <ul class="flex flex-wrap gap-2 text-sm my-2 text-primary">
          <li
            v-for="tech in project.technos"
            :key="tech"
            class="bg-primary/10 px-2 py-1 border font-bold rounded"
          >
            {{ tech }}
          </li>
        </ul>

        <div class="flex flex-wrap items-center gap-4">
          <span class="font-semibold text-primary group-hover:underline">
            {{ t('projects.details') }}
          </span>
          <a
            :href="project.link"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-primary hover:underline"
            @click.stop
          >
            {{ t('projects.viewSite') }}
            <ArrowUpRight class="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>

    <ProjectModal :project="selected" @close="selected = null" />
  </section>
</template>
