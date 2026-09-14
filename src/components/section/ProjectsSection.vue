<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/**
 * Uniquement des missions livrées pour des clients : les projets d'études et de stage ont été
 * retirés, ils diluaient la preuve plus qu'ils ne l'appuyaient.
 *
 * `preview` : nom des captures dans `public/previews/` (`<preview>-desktop.webp` et
 * `<preview>-mobile.webp`), générées par `npm run screenshots`. Les boutiques Shopify refusent
 * d'être affichées dans une iframe : une capture est le seul aperçu fiable.
 */
const projectItems = [
  {
    titleKey: 'projects.items[0].title',
    descKey: 'projects.items[0].desc',
    link: 'https://mudaparis.com',
    linkKey: 'projects.viewSite',
    preview: 'mudaparis',
    technos: ['Shopify', 'Liquid', 'WooCommerce', 'Migration'],
  },
  {
    titleKey: 'projects.items[1].title',
    descKey: 'projects.items[1].desc',
    link: 'https://amadal.ma',
    linkKey: 'projects.viewSite',
    preview: 'amadal',
    technos: ['WordPress headless', 'PHP', 'SEO', 'Performance'],
  },
  {
    titleKey: 'projects.items[2].title',
    descKey: 'projects.items[2].desc',
    link: 'https://santibe.fr',
    linkKey: 'projects.viewSite',
    preview: 'santibe',
    technos: ['Shopify', 'Liquid', 'JavaScript', 'UX e-commerce'],
  },
  {
    titleKey: 'projects.items[3].title',
    descKey: 'projects.items[3].desc',
    link: 'https://soliferme.fr',
    linkKey: 'projects.viewSite',
    preview: 'soliferme',
    technos: ['Shopify', 'Liquid', 'Tailwind CSS', 'Responsive'],
  },
  {
    titleKey: 'projects.items[4].title',
    descKey: 'projects.items[4].desc',
    link: 'https://soraali.com',
    linkKey: 'projects.viewSite',
    preview: 'soraali',
    technos: ['Shopify', 'Liquid', 'JavaScript', 'Debug'],
  },
]

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
      <div v-for="project in projectItems" :key="project.titleKey" class="bg-card p-6 rounded shadow-sm">
        <!-- Aperçu : faux navigateur (capture bureau) et téléphone (capture mobile) par-dessus.
             Le lien est retiré de la tabulation et masqué aux lecteurs d'écran : il double le lien
             « Voir le site » plus bas, qui reste le chemin accessible. -->
        <a
          :href="project.link"
          target="_blank"
          rel="noopener noreferrer"
          tabindex="-1"
          aria-hidden="true"
          class="group relative mb-10 block"
        >
          <div
            class="overflow-hidden rounded-lg border border-muted bg-background shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
          >
            <div class="flex items-center gap-2 border-b border-muted bg-surface px-3 py-2">
              <span class="flex gap-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span>
              </span>
              <span
                class="mx-auto truncate rounded-md bg-background px-3 py-0.5 text-xs text-text-muted"
              >
                {{ hostname(project.link) }}
              </span>
            </div>
            <img
              :src="previewSrc(project, 'desktop')"
              :alt="t('projects.previewDesktop', { site: hostname(project.link) })"
              width="1200"
              height="750"
              loading="lazy"
              decoding="async"
              class="block aspect-[8/5] w-full object-cover object-top"
            />
          </div>

          <img
            :src="previewSrc(project, 'mobile')"
            :alt="t('projects.previewMobile', { site: hostname(project.link) })"
            width="390"
            height="844"
            loading="lazy"
            decoding="async"
            class="absolute -bottom-6 right-3 w-[22%] min-w-20 rounded-xl border-4 border-card-text bg-background shadow-xl transition duration-300 group-hover:-translate-y-2"
          />
        </a>

        <h3 class="text-xl font-semibold mb-2">
          {{ t(project.titleKey) }}
        </h3>
        <p class="text-sm text-text-muted mb-4">
          {{ t(project.descKey) }}
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

        <a
          :href="project.link"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
        >
          {{ t(project.linkKey || 'projects.view') }}
        </a>
      </div>
    </div>
  </section>
</template>
