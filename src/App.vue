<script setup>
import { ref, onMounted } from 'vue'
import ThemeToggle from './components/ThemeToggle.vue'
import HeroSection from './components/section/HeroSection.vue'
import AboutSection from './components/section/AboutSection.vue'
import SkillsSection from './components/section/SkillsSection.vue'
import ProjectsSection from './components/section/ProjectsSection.vue'
import ContactSection from './components/section/ContactSection.vue'
import Footer from './components/section/FooterSection.vue'

const isDark = ref(false)

const applyTheme = (dark) => {
  document.documentElement.classList.toggle('dark', dark)
  isDark.value = dark
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => applyTheme(!isDark.value)

onMounted(() => {
  const saved = localStorage.getItem('theme')
  applyTheme(saved === 'dark')
})
</script>

<template>
  <div class="min-h-screen bg-background text-text transition-colors duration-300">
    <!-- Navbar -->
    <nav class="flex items-center justify-between px-8 py-4">
      <div class="text-xl font-bold text-primary">Hudayfa</div>
      <ul class="flex gap-6 text-sm">
        <li><a href="#" class="hover:underline">Home</a></li>
        <li><a href="#about" class="hover:underline">About</a></li>
        <li><a href="#skills" class="hover:underline">Skills</a></li>
        <li><a href="#projects" class="hover:underline">Projects</a></li>
        <li><a href="#contact" class="hover:underline">Contact</a></li>
      </ul>
      <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
    </nav>

    <!-- Sections -->
    <HeroSection />
    <AboutSection />
    <SkillsSection />
    <ProjectsSection />
    <ContactSection />
    <Footer />
  </div>
</template>
