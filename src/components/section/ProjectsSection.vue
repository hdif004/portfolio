<script setup>
import { useI18n } from 'vue-i18n'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

const { t } = useI18n()

const projects = {
  [t('projects.tabs.all')]: [
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
  ],
  [t('projects.tabs.pro')]: [
    {
      titleKey: 'projects.items[1].title',
      descKey: 'projects.items[1].desc',
      link: 'https://github.com/hdif004',
      technos: ['Liquid', 'Shopify CLI', 'HTML/CSS'],
    },
    {
      titleKey: 'projects.items[0].title',
      descKey: 'projects.items[0].desc',
      link: 'https://github.com/hdif004',
      technos: ['Vue.js', 'Strapi', 'Tailwind CSS', 'OpenAI API'],
    },
  ],
  [t('projects.tabs.perso')]: [
    {
      titleKey: 'projects.items[0].title',
      descKey: 'projects.items[0].desc',
      link: 'https://github.com/hdif004',
      technos: ['Vue.js', 'Strapi', 'Tailwind CSS', 'OpenAI API'],
    },
  ],
}
</script>

<template>
  <section id="projects" class="py-20 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-8 text-primary">
      {{ t('projects.title') }}
    </h2>

    <TabGroup>
      <TabList
        class="flex gap-2 mb-6 bg-muted p-1 rounded-lg overflow-x-auto whitespace-nowrap scrollbar-none justify-center md:justify-start"
      >
        <Tab v-for="tab in Object.keys(projects)" as="template" :key="tab" v-slot="{ selected }">
          <button
            :class="[
              'px-4 py-2 rounded-lg text-sm font-semibold transition duration-300',
              'cursor-pointer whitespace-nowrap',
              selected ? 'bg-primary text-white shadow' : 'text-text hover:bg-primary/10',
            ]"
          >
            {{ tab }}
          </button>
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel v-for="(group, index) in Object.values(projects)" :key="index">
          <Transition
            appear
            enter-active-class="transition-opacity duration-500"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-300"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
            mode="out-in"
          >
            <div class="grid md:grid-cols-2 gap-6">
              <div
                v-for="project in group"
                :key="project.titleKey"
                class="bg-card p-6 rounded shadow-sm"
              >
                <h3 class="text-xl font-semibold mb-2">
                  {{ t(project.titleKey) }}
                </h3>
                <p class="text-sm text-text/70 mb-4">
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

                <a :href="project.link" target="_blank" class="text-primary hover:underline">
                  {{ t('projects.view') }}
                </a>
              </div>
            </div>
          </Transition>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </section>
</template>
