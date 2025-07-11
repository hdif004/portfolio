<template>
  <section id="skills" class="py-20 px-6 max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold mb-6 text-primary">Skills</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      <div
        v-for="skill in skills"
        :key="skill"
        class="bg-primary/10 text-primary px-4 py-2 rounded text-center font-semibold"
      >
        {{ skill }}
      </div>
    </div>
  </section>
</template>

<script setup>
const skills = ['HTML', 'CSS', 'JavaScript', 'Vue.js', 'Tailwind CSS', 'Strapi', 'Liquid', 'Git']
</script>
