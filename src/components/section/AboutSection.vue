// src/components/section/AboutSection.vue
<template>
  <section id="about" class="py-20 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-14 text-primary text-center">About Me</h2>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Step 1 -->
      <div
        class="bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative group transition-colors duration-300"
      >
        <div
          class="absolute -left-3 top-6 bg-primary text-background w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
        >
          1
        </div>
        <h3 class="text-xl font-semibold text-primary mb-2">Le déclic</h3>
        <p class="text-card text-base transition-colors duration-300">
          Curieux de nature, j'ai découvert le monde du code en explorant HTML, CSS et JavaScript.
          Très vite, je me suis passionné pour la création d'interfaces, ce qui m'a naturellement
          orienté vers le développement web.
        </p>
      </div>

      <!-- Step 2 -->
      <div
        class="bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative group transition-colors duration-300"
      >
        <div
          class="absolute -left-3 top-6 bg-primary text-background w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
        >
          2
        </div>
        <h3 class="text-xl font-semibold text-primary mb-2">La formation</h3>
        <p class="text-card text-base transition-colors duration-300">
          Actuellement étudiant en licence professionnelle "Métiers de l'Internet – Applications
          Web" à l'Université de Limoges, j'ai consolidé mes compétences en
          <strong class="text-card font-bold">Vue.js</strong>,
          <strong class="text-card font-bold">Tailwind CSS</strong>,
          <strong class="text-card font-bold">Strapi</strong>,
          <strong class="text-card font-bold">Symfony</strong>,
          <strong class="text-card font-bold">NestJS</strong> et
          <strong class="text-card font-bold">Next.js</strong>.
        </p>
      </div>

      <!-- Step 3 -->
      <div
        class="bg-card p-6 rounded-xl shadow-sm border-l-4 border-primary relative group transition-colors duration-300"
      >
        <div
          class="absolute -left-3 top-6 bg-primary text-background w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
        >
          3
        </div>
        <h3 class="text-xl font-semibold text-primary mb-2">Ma vision</h3>
        <p class="text-text text-base transition-colors duration-300">
          J'accorde une grande importance à l'accessibilité, à la performance et à l'esthétique. Je
          crois en des interfaces simples, utiles et bien pensées, toujours orientées utilisateur.
          J'aime résoudre de vrais problèmes avec créativité.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup></script>
