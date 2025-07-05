<script setup>
import { ref, onMounted } from 'vue'
import ThemeToggle from './components/ThemeToggle.vue'

const isDark = ref(false)

const applyTheme = (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
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
    <!-- Header avec toggle -->
    <header class="flex justify-end p-4">
      <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
    </header>

    <!-- Section d'accueil -->
    <main class="flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 class="text-4xl font-bold mb-4 text-primary">Welcome to My Portfolio</h1>
      <p class="text-lg max-w-xl">This is a simple Vue.js application styled with Tailwind CSS.</p>
    </main>
  </div>
</template>
