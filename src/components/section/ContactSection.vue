<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Send, Mail, Linkedin, Loader2 } from 'lucide-vue-next'
import { siGithub } from 'simple-icons'
import BrandIcon from '../BrandIcon.vue'

const { t } = useI18n()

// Identifiant du formulaire Formspree (la partie après /f/ dans l'endpoint fourni par Formspree)
const FORMSPREE_ID = 'mkjwavgk'

const emptyForm = () => ({
  name: '',
  email: '',
  projectType: '',
  budget: '',
  message: '',
  // Piège à robots : un humain ne remplit jamais ce champ, il est masqué.
  _gotcha: '',
})

const form = ref(emptyForm())
const status = ref(null) // 'success' | 'error' | null
const sending = ref(false)

const projectTypes = ['showcase', 'shopify', 'migration', 'theme', 'fix', 'other']
const budgets = ['unknown', 's', 'm', 'l', 'xl']

async function handleSubmit() {
  // Champ honeypot rempli → soumission automatisée, on l'ignore silencieusement.
  if (form.value._gotcha) return

  sending.value = true
  status.value = null

  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(form.value),
    })
    status.value = res.ok ? 'success' : 'error'
    if (res.ok) form.value = emptyForm()
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
    <p class="text-text-muted mb-10 max-w-2xl">{{ t('contact.subtitle') }}</p>

    <div class="grid md:grid-cols-2 gap-12">
      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label for="contact-name" class="block text-sm font-medium mb-1 text-text">
            {{ t('contact.name') }}
          </label>
          <input
            id="contact-name"
            v-model="form.name"
            type="text"
            name="name"
            autocomplete="name"
            required
            :placeholder="t('contact.namePlaceholder')"
            class="w-full px-4 py-3 rounded-lg border border-primary/30 bg-card text-card-text placeholder:text-card-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>

        <div>
          <label for="contact-email" class="block text-sm font-medium mb-1 text-text">
            {{ t('contact.email') }}
          </label>
          <input
            id="contact-email"
            v-model="form.email"
            type="email"
            name="email"
            autocomplete="email"
            required
            :placeholder="t('contact.emailPlaceholder')"
            class="w-full px-4 py-3 rounded-lg border border-primary/30 bg-card text-card-text placeholder:text-card-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>

        <div class="grid sm:grid-cols-2 gap-5">
          <div>
            <label for="contact-type" class="block text-sm font-medium mb-1 text-text">
              {{ t('contact.projectType') }}
            </label>
            <select
              id="contact-type"
              v-model="form.projectType"
              name="projectType"
              class="w-full px-4 py-3 rounded-lg border border-primary/30 bg-card text-card-text focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              <option value="">{{ t('contact.select') }}</option>
              <option v-for="type in projectTypes" :key="type" :value="t(`contact.projectTypeOptions.${type}`)">
                {{ t(`contact.projectTypeOptions.${type}`) }}
              </option>
            </select>
          </div>

          <div>
            <label for="contact-budget" class="block text-sm font-medium mb-1 text-text">
              {{ t('contact.budget') }}
              <span class="text-text-muted font-normal">({{ t('contact.optional') }})</span>
            </label>
            <select
              id="contact-budget"
              v-model="form.budget"
              name="budget"
              class="w-full px-4 py-3 rounded-lg border border-primary/30 bg-card text-card-text focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              <option value="">{{ t('contact.select') }}</option>
              <option v-for="range in budgets" :key="range" :value="t(`contact.budgetOptions.${range}`)">
                {{ t(`contact.budgetOptions.${range}`) }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label for="contact-message" class="block text-sm font-medium mb-1 text-text">
            {{ t('contact.message') }}
          </label>
          <textarea
            id="contact-message"
            v-model="form.message"
            name="message"
            required
            rows="5"
            :placeholder="t('contact.messagePlaceholder')"
            class="w-full px-4 py-3 rounded-lg border border-primary/30 bg-card text-card-text placeholder:text-card-muted focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
          ></textarea>
        </div>

        <!-- Honeypot anti-spam : masqué visuellement et pour les lecteurs d'écran. -->
        <div class="hidden" aria-hidden="true">
          <label for="contact-gotcha">Ne remplissez pas ce champ</label>
          <input id="contact-gotcha" v-model="form._gotcha" type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
        </div>

        <button
          type="submit"
          :disabled="sending"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-strong text-on-primary rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="sending" class="w-4 h-4 animate-spin" aria-hidden="true" />
          <Send v-else class="w-4 h-4" aria-hidden="true" />
          {{ sending ? t('contact.sending') : t('contact.send') }}
        </button>

        <p aria-live="polite" role="status" class="text-sm font-medium">
          <span v-if="status === 'success'" class="text-primary">{{ t('contact.success') }}</span>
          <span v-else-if="status === 'error'" class="text-red-700 dark:text-red-300">
            {{ t('contact.error') }}
          </span>
        </p>

        <p class="text-xs text-text-muted">{{ t('contact.privacy') }}</p>
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
          href="https://github.com/hdif004"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-3 text-text hover:text-primary transition"
        >
          <span class="p-3 rounded-full bg-primary/10 text-primary">
            <BrandIcon :icon="siGithub" class="w-5 h-5" />
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
