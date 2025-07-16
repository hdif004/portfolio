// src/i18n.js
import { createI18n } from 'vue-i18n'
import fr from './locales/fr.json'
import en from './locales/en.json'

const userLang = localStorage.getItem('lang') || navigator.language.startsWith('fr') ? 'fr' : 'en'

export const i18n = createI18n({
  legacy: false,
  locale: userLang,
  fallbackLocale: 'en',
  messages: { fr, en },
})
