<template>
  <footer id="footer" class="bg-primary text-white text-center py-8 mt-12">
    <div class="container mx-auto px-4">
      <p class="text-xl font-semibold mb-4">Hudayfa Koujdal – Front-end Web Developer</p>

      <div class="flex flex-col md:flex-row justify-center items-center gap-4 mb-4 text-sm">
        <a href="mailto:hudayfa.k.pro@gmail.com" class="flex items-center gap-2 hover:underline">
          <Mail class="w-4 h-4" /> hudayfa.k.pro@gmail.com
        </a>
        <span>|</span>
        <a href="tel:+33745493840" class="flex items-center gap-2 hover:underline">
          <Phone class="w-4 h-4" /> +33 7 45 49 38 40
        </a>
      </div>

      <div class="flex justify-center gap-6 text-lg">
        <a
          href="https://github.com/hdif004"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 hover:underline"
        >
          <Github class="w-5 h-5" /> GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/outaharz/"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 hover:underline"
        >
          <Linkedin class="w-5 h-5" /> LinkedIn
        </a>
      </div>

      <p class="mt-6 text-xs text-white/70">
        &copy; {{ new Date().getFullYear() }} Hudayfa. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { Mail, Phone, Github, Linkedin } from 'lucide-vue-next'
</script>
