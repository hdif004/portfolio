<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import heroImg from '@/assets/images/hero.webp'
import QuestHeader from '@/components/game/QuestHeader.vue'
import { mailtoHref } from '@/game/contact'
import { useGame } from '@/composables/useGame'

const { t } = useI18n()
const { completeQuest } = useGame()

const cvUrl = `${import.meta.env.BASE_URL}CV.pdf`

// Plus de formulaire : le bouton principal ouvre directement le mail, objet pré-rempli.
const mailHref = computed(() => mailtoHref(t('mail.subject')))
</script>

<template>
  <section
    id="hero"
    class="flex flex-col-reverse md:flex-row items-center justify-between px-8 py-16 md:py-24 gap-12 w-11/12 mx-auto"
  >
    <!-- Texte -->
    <div v-reveal="{ from: 'left' }" class="hero-text text-left md:w-7/12 space-y-5">
      <QuestHeader id="hero" />
      <p
        class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
          ></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
        </span>
        {{ t('hero.available') }}
      </p>

      <p class="text-lg text-text">
        {{ t('hero.greeting') }} <span class="font-semibold">{{ t('hero.name') }}</span
        >.
      </p>

      <h1 class="md:text-5xl text-3xl font-extrabold leading-tight">
        {{ t('hero.title') }}
      </h1>

      <p class="text-lg font-semibold text-primary">
        {{ t('hero.offers') }}
      </p>
      <p class="md:text-lg text-text-muted">
        {{ t('hero.desc') }}
      </p>

      <div class="flex flex-wrap items-center gap-4">
        <!-- CTA principal : contact -->
        <a
          :href="mailHref"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-strong text-on-primary rounded-md font-semibold hover:bg-primary-dark transition"
          @click="completeQuest('contact')"
        >
          {{ t('hero.ctaPrimary') }}
        </a>

        <!-- CTA secondaire : réalisations -->
        <a
          href="#projects"
          class="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-md font-semibold hover:bg-primary/10 transition"
        >
          {{ t('hero.ctaSecondary') }}
        </a>
      </div>

      <!-- Liens secondaires discrets -->
      <p class="flex flex-wrap items-center gap-4 text-sm text-text-muted">
        <a
          href="https://github.com/hdif004"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-4 hover:text-primary transition"
        >
          {{ t('hero.github') }}
        </a>
        <span aria-hidden="true">·</span>
        <a
          :href="cvUrl"
          download
          class="underline underline-offset-4 hover:text-primary transition"
        >
          {{ t('hero.cv') }}
        </a>
      </p>
    </div>

    <!-- Image -->
    <div v-reveal="{ from: 'right', delay: 150 }" class="hero-img md:w-6/12">
      <img
        :src="heroImg"
        :alt="t('hero.imageAlt')"
        width="840"
        height="755"
        fetchpriority="high"
        decoding="async"
        class="w-full h-auto"
      />
    </div>
  </section>
</template>
