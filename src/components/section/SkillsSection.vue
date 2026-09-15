<template>
  <section id="skills" class="py-16 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-2 text-primary">{{ t('skills.title') }}</h2>
    <p class="text-text-muted mb-10">{{ t('skills.subtitle') }}</p>

    <div class="grid md:grid-cols-3 gap-8">
      <div
        v-for="group in skillGroups"
        :key="group.titleKey"
        class="bg-card p-6 rounded-lg shadow-sm"
      >
        <h3 class="text-xl font-semibold mb-1 text-primary">{{ t(group.titleKey) }}</h3>
        <p class="text-sm text-card-muted mb-5">{{ t(group.captionKey) }}</p>

        <ul class="flex flex-wrap gap-2">
          <li
            v-for="skill in group.items"
            :key="skill.name"
            class="inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1.5 text-sm text-card-text"
          >
            <BrandIcon v-if="skill.brand" :icon="skill.brand" class="w-4 h-4 text-primary shrink-0" />
            <component v-else :is="skill.icon" class="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
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
</script>
