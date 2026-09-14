<script setup>
import { useI18n } from 'vue-i18n'
import QuestHeader from '@/components/game/QuestHeader.vue'
import { PROJECT_ITEMS as projectItems } from '@/data/projects'

const { t } = useI18n()
</script>

<template>
  <section id="projects" class="py-20 px-6 w-10/12 mx-auto">
    <QuestHeader id="projects" />
    <h2 class="text-3xl font-bold mb-2 text-primary">
      {{ t('projects.title') }}
    </h2>
    <p class="text-text-muted mb-8 max-w-2xl">{{ t('projects.subtitle') }}</p>

    <div class="grid md:grid-cols-2 gap-6">
      <div v-for="project in projectItems" :key="project.titleKey" class="bg-card p-6 rounded shadow-sm">
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
