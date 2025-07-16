<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const projects = [
  {
    titleKey: 'projects.items[0].title',
    descKey: 'projects.items[0].desc',
    link: 'https://github.com/hdif004',
    technos: ['Vue.js', 'Strapi', 'Tailwind CSS', 'OpenAI API'],
  },
  {
    titleKey: 'projects.items[1].title',
    descKey: 'projects.items[1].desc',
    link: 'https://github.com/hdif004',
    technos: ['Liquid', 'Shopify CLI', 'HTML/CSS'],
  },
]
</script>

<template>
  <section id="projects" class="py-20 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-6 text-primary">{{ t('projects.title') }}</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div
        v-for="project in projects"
        :key="project.titleKey"
        class="bg-card p-6 rounded shadow-sm"
      >
        <h3 class="text-xl font-semibold mb-2">{{ t(project.titleKey) }}</h3>
        <p class="text-sm text-text/70 mb-4">{{ t(project.descKey) }}</p>
        <ul class="flex flex-wrap gap-2 text-sm my-2 text-primary">
          <li
            v-for="tech in project.technos"
            :key="tech"
            class="bg-primary/10 px-2 py-1 border font-bold rounded"
          >
            {{ tech }}
          </li>
        </ul>

        <a :href="project.link" target="_blank" class="text-primary hover:underline">
          {{ t('projects.view') }}
        </a>
      </div>
    </div>
  </section>
</template>
