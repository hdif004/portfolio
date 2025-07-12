<template>
  <section id="projects" class="py-20 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-6 text-primary">Projects</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div
        v-for="project in projects"
        :key="project.title"
        class="bg-primary/5 p-6 rounded shadow-sm"
      >
        <h3 class="text-xl font-semibold mb-2">{{ project.title }}</h3>
        <p class="text-sm text-text/70 mb-4">{{ project.description }}</p>
        <a :href="project.link" target="_blank" class="text-primary hover:underline"
          >View Project →</a
        >
      </div>
    </div>
  </section>
</template>

<script setup>
const projects = [
  {
    title: 'MonFeed (Social Media App)',
    description: 'An AI-powered platform to manage and schedule social media posts.',
    link: 'https://github.com/hdif004',
  },
  {
    title: 'Shopify Storefront',
    description: 'Custom Shopify theme built with Liquid and Shopify CLI.',
    link: 'https://github.com/hdif004',
  },
]
</script>
