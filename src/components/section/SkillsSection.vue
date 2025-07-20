<template>
  <section id="skills" class="py-16 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-10 text-primary">{{ t('skills.title') }}</h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div
        v-for="(group, index) in skillGroups"
        :key="group.title"
        class="bg-card p-6 rounded-lg shadow-sm opacity-0 translate-y-4 transition duration-700 ease-in-out"
        :class="'animate-fade-in-delay-' + index"
      >
        <h3 class="text-xl font-semibold mb-4 text-primary">{{ group.title }}</h3>
        <ul class="space-y-4">
          <li v-for="skill in group.items" :key="skill.name">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <component :is="skill.icon" class="w-5 h-5 text-primary" />
                <span class="text-text/90">{{ skill.name }}</span>
              </div>
              <span class="text-sm text-text/50 skill-percentage" :data-target="skill.level">
                0%
              </span>
            </div>
            <div class="w-full bg-primary/20 rounded-full h-2">
              <div
                class="skill-bar-fill bg-primary h-2 rounded-full"
                :data-level="skill.level"
              ></div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  nextTick(() => {
    // Animation des barres
    gsap.utils.toArray('.skill-bar-fill').forEach((el) => {
      const finalWidth = el.getAttribute('data-level')

      gsap.fromTo(
        el,
        { width: '0%' },
        {
          width: finalWidth + '%',
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    // Animation des nombres
    gsap.utils.toArray('.skill-percentage').forEach((el) => {
      const target = parseInt(el.getAttribute('data-target') || '0')

      const obj = { value: 0 }

      gsap.to(obj, {
        value: target,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          el.textContent = `${Math.round(obj.value)}%`
        },
      })
    })
  })
})

const { t } = useI18n()
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
} from 'lucide-vue-next'

const skillGroups = [
  {
    title: 'Front-End',
    items: [
      { name: 'Vue.js', icon: Code2, level: 75 },
      { name: 'Tailwind CSS', icon: LayoutDashboard, level: 90 },
      { name: 'JavaScript', icon: FileCode, level: 80 },
      { name: 'Bootstrap', icon: Boxes, level: 70 },
      { name: 'Next.js', icon: LayoutDashboard, level: 45 },
    ],
  },
  {
    title: 'Back-End / CMS',
    items: [
      { name: 'PHP', icon: FileCode, level: 70 },
      { name: 'Symfony', icon: Settings2, level: 60 },
      { name: 'Strapi', icon: Server, level: 70 },
      { name: 'NestJS', icon: Server, level: 60 },
      { name: 'Shopify CLI', icon: Boxes, level: 60 },
    ],
  },
  {
    title: 'Outils & Méthodes',
    items: [
      { name: 'Git', icon: GitBranch, level: 80 },
      { name: 'Figma', icon: PenTool, level: 55 },
      { name: 'Docker', icon: Container, level: 60 },
    ],
  },
]
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

[class*='animate-fade-in-delay-'] {
  animation: fade-in 0.6s ease forwards;
}

.animate-fade-in-delay-0 {
  animation-delay: 0.1s;
}
.animate-fade-in-delay-1 {
  animation-delay: 0.3s;
}
.animate-fade-in-delay-2 {
  animation-delay: 0.5s;
}
</style>
