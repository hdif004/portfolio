<template>
  <footer id="footer" class="bg-primary-strong text-on-primary text-center py-8 mt-12">
    <div class="container mx-auto px-4">
      <p class="text-xl font-semibold mb-4">Hudayfa Koujdal – {{ t('footer.role') }}</p>

      <div class="flex justify-center items-center mb-4 text-sm">
        <a href="mailto:hudayfa.k.pro@gmail.com" class="flex items-center gap-2 hover:underline">
          <Mail class="w-4 h-4" /> hudayfa.k.pro@gmail.com
        </a>
      </div>

      <div class="flex justify-center gap-6 text-lg">
        <a
          href="https://github.com/hdif004"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 hover:underline"
        >
          <BrandIcon :icon="siGithub" class="w-5 h-5" /> GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/hudayfa-koujdal-930068258/"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 hover:underline"
        >
          <Linkedin class="w-5 h-5" /> LinkedIn
        </a>
      </div>

      <p class="mt-6 text-xs text-on-primary/80">
        &copy; {{ new Date().getFullYear() }} Hudayfa Koujdal. {{ t('footer.rights') }}
      </p>
    </div>
  </footer>
</template>

<script setup>
import { Mail, Linkedin } from 'lucide-vue-next'
import { siGithub } from 'simple-icons'
import { useI18n } from 'vue-i18n'
import BrandIcon from '../BrandIcon.vue'

const { t } = useI18n()
</script>
