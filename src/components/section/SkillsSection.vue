<template>
  <section id="skills" class="py-16 px-6 w-10/12 mx-auto">
    <QuestHeader id="skills" />
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
            <component :is="skill.icon" class="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            {{ skill.name }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import QuestHeader from '@/components/game/QuestHeader.vue'
import {
  Code2,
  FileCode,
  LayoutDashboard,
  Server,
  Boxes,
  Settings2,
  GitBranch,
  Container,
  PenTool,
  ShoppingBag,
  Globe,
  Gauge,
  Terminal,
} from 'lucide-vue-next'

const { t } = useI18n()

const skillGroups = [
  {
    titleKey: 'skills.categories.daily',
    captionKey: 'skills.captions.daily',
    items: [
      { name: 'Shopify', icon: ShoppingBag },
      { name: 'Liquid', icon: FileCode },
      { name: 'JavaScript', icon: FileCode },
      { name: 'Tailwind CSS', icon: LayoutDashboard },
      { name: 'WordPress / WooCommerce', icon: Globe },
      { name: 'SEO & performance', icon: Gauge },
      { name: 'Git', icon: GitBranch },
    ],
  },
  {
    titleKey: 'skills.categories.solid',
    captionKey: 'skills.captions.solid',
    items: [
      { name: 'Vue.js', icon: Code2 },
      { name: 'PHP', icon: FileCode },
      { name: 'Strapi', icon: Server },
      { name: 'Bootstrap', icon: Boxes },
      { name: 'Shopify CLI', icon: Terminal },
    ],
  },
  {
    titleKey: 'skills.categories.learning',
    captionKey: 'skills.captions.learning',
    items: [
      { name: 'React.js', icon: Code2 },
      { name: 'Symfony', icon: Settings2 },
      { name: 'Python', icon: Terminal },
      { name: 'Docker', icon: Container },
      { name: 'Figma', icon: PenTool },
    ],
  },
]
</script>
