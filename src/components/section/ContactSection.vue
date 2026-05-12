<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Send, Mail, Phone, Github, Linkedin } from 'lucide-vue-next'

const { t } = useI18n()

const form = ref({ name: '', email: '', message: '' })
const status = ref(null) // 'success' | 'error' | null
const sending = ref(false)

async function handleSubmit() {
  sending.value = true
  status.value = null

  try {
    const res = await fetch(`https://formspree.io/f/hudayfa.k.pro@gmail.com`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(form.value),
    })
    status.value = res.ok ? 'success' : 'error'
    if (res.ok) form.value = { name: '', email: '', message: '' }
  } catch {
    status.value = 'error'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section id="contact" class="py-20 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-2 text-primary">{{ t('contact.title') }}</h2>
    <p class="text-text/70 mb-10">{{ t('contact.subtitle') }}</p>

    <div class="grid md:grid-cols-2 gap-12">
      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1 text-text">{{ t('contact.name') }}</label>
          <input
            v-model="form.name"
            type="text"
            required
            :placeholder="t('contact.namePlaceholder')"
            class="w-full px-4 py-3 rounded-lg border border-primary/30 bg-card text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-text">{{ t('contact.email') }}</label>
          <input
            v-model="form.email"
            type="email"
            required
            :placeholder="t('contact.emailPlaceholder')"
            class="w-full px-4 py-3 rounded-lg border border-primary/30 bg-card text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-text">{{ t('contact.message') }}</label>
          <textarea
            v-model="form.message"
            required
            rows="5"
            :placeholder="t('contact.messagePlaceholder')"
            class="w-full px-4 py-3 rounded-lg border border-primary/30 bg-card text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="sending"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send class="w-4 h-4" />
          {{ t('contact.send') }}
        </button>

        <p v-if="status === 'success'" class="text-green-600 text-sm font-medium">
          {{ t('contact.success') }}
        </p>
        <p v-if="status === 'error'" class="text-red-500 text-sm font-medium">
          {{ t('contact.error') }}
        </p>
      </form>

      <!-- Infos de contact -->
      <div class="space-y-6 flex flex-col justify-center">
        <a
          href="mailto:hudayfa.k.pro@gmail.com"
          class="flex items-center gap-3 text-text hover:text-primary transition"
        >
          <span class="p-3 rounded-full bg-primary/10 text-primary">
            <Mail class="w-5 h-5" />
          </span>
          <span>hudayfa.k.pro@gmail.com</span>
        </a>

        <a
          href="tel:+33745493840"
          class="flex items-center gap-3 text-text hover:text-primary transition"
        >
          <span class="p-3 rounded-full bg-primary/10 text-primary">
            <Phone class="w-5 h-5" />
          </span>
          <span>+33 7 45 49 38 40</span>
        </a>

        <a
          href="https://github.com/hdif004"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-3 text-text hover:text-primary transition"
        >
          <span class="p-3 rounded-full bg-primary/10 text-primary">
            <Github class="w-5 h-5" />
          </span>
          <span>github.com/hdif004</span>
        </a>

        <a
          href="https://www.linkedin.com/in/hudayfa-koujdal-930068258/"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-3 text-text hover:text-primary transition"
        >
          <span class="p-3 rounded-full bg-primary/10 text-primary">
            <Linkedin class="w-5 h-5" />
          </span>
          <span>linkedin.com/in/hudayfa-koujdal</span>
        </a>
      </div>
    </div>
  </section>
</template>
