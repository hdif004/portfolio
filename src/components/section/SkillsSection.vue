<template>
  <section id="skills" class="py-16 md:py-20 px-4 sm:px-6 w-full md:w-11/12 max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-5xl font-extrabold text-primary">{{ t('skills.title') }}</h2>
    <p class="mt-3 mb-10 text-text-muted md:text-lg">{{ t('skills.subtitle') }}</p>

    <div class="grid gap-5 md:grid-cols-3">
      <!-- Au quotidien : bloc plein, sur toute la hauteur, logos en grand -->
      <div
        class="rounded-3xl bg-primary-strong p-5 sm:p-6 md:row-span-2 md:col-span-2 md:p-8 text-on-primary"
      >
        <h3 class="text-2xl font-bold">{{ t(daily.titleKey) }}</h3>
        <p class="mt-1 mb-6">{{ t(daily.captionKey) }}</p>

        <ul class="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">
          <li
            v-for="skill in daily.items"
            :key="skill.name"
            class="flex items-center gap-2 rounded-2xl bg-background px-3 py-3 text-sm font-semibold text-text sm:gap-3 sm:px-4 sm:py-4 sm:text-base"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-primary sm:h-10 sm:w-10 sm:rounded-xl"
            >
              <BrandIcon v-if="skill.brand" :icon="skill.brand" class="w-4 h-4 sm:w-5 sm:h-5" />
              <component v-else :is="skill.icon" class="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </span>
            <span class="min-w-0 leading-tight">{{ skill.name }}</span>
          </li>
        </ul>
      </div>

      <!-- Maîtrisé / Notions : blocs plus discrets -->
      <div
        v-for="group in secondary"
        :key="group.titleKey"
        class="rounded-3xl bg-surface p-5 sm:p-6"
      >
        <h3 class="text-xl font-bold text-primary">{{ t(group.titleKey) }}</h3>
        <p class="mt-1 mb-5 text-sm text-text">{{ t(group.captionKey) }}</p>

        <ul class="flex flex-wrap gap-2">
          <li
            v-for="skill in group.items"
            :key="skill.name"
            class="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-sm font-medium text-text"
          >
            <BrandIcon
              v-if="skill.brand"
              :icon="skill.brand"
              class="w-4 h-4 text-primary shrink-0"
            />
            <component
              v-else
              :is="skill.icon"
              class="w-4 h-4 text-primary shrink-0"
              aria-hidden="true"
            />
            {{ skill.name }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { Braces, Gauge, SquareTerminal } from 'lucide-vue-next'
import {
  siBootstrap,
  siDocker,
  siFigma,
  siGit,
  siJavascript,
  siPhp,
  siPython,
  siReact,
  siShopify,
  siStrapi,
  siSymfony,
  siTailwindcss,
  siVuedotjs,
  siWordpress,
} from 'simple-icons'
import BrandIcon from '../BrandIcon.vue'

const { t } = useI18n()

/** `brand` : logo officiel (simple-icons). `icon` : pictogramme Lucide quand il n'existe pas de logo. */
const skillGroups = [
  {
    titleKey: 'skills.categories.daily',
    captionKey: 'skills.captions.daily',
    items: [
      { name: 'Shopify', brand: siShopify },
      { name: 'Liquid', icon: Braces },
      { name: 'JavaScript', brand: siJavascript },
      { name: 'Tailwind CSS', brand: siTailwindcss },
      { name: 'WordPress / WooCommerce', brand: siWordpress },
      { name: 'SEO & performance', icon: Gauge },
      { name: 'Git', brand: siGit },
    ],
  },
  {
    titleKey: 'skills.categories.solid',
    captionKey: 'skills.captions.solid',
    items: [
      { name: 'Vue.js', brand: siVuedotjs },
      { name: 'PHP', brand: siPhp },
      { name: 'Strapi', brand: siStrapi },
      { name: 'Bootstrap', brand: siBootstrap },
      { name: 'Shopify CLI', icon: SquareTerminal },
    ],
  },
  {
    titleKey: 'skills.categories.learning',
    captionKey: 'skills.captions.learning',
    items: [
      { name: 'React.js', brand: siReact },
      { name: 'Symfony', brand: siSymfony },
      { name: 'Python', brand: siPython },
      { name: 'Docker', brand: siDocker },
      { name: 'Figma', brand: siFigma },
    ],
  },
]

const [daily, ...secondary] = skillGroups
</script>
