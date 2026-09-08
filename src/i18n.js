// src/i18n.js
import { createI18n } from 'vue-i18n'
import fr from './locales/fr.json'
import en from './locales/en.json'

export const SUPPORTED_LOCALES = ['fr', 'en']
export const DEFAULT_LOCALE = 'fr'

// Langue rendue par le pré-rendu statique : le HTML servi aux crawlers est en français.
export function detectLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  const saved = window.localStorage.getItem('lang')
  if (SUPPORTED_LOCALES.includes(saved)) return saved

  return window.navigator.language.startsWith('fr') ? 'fr' : 'en'
}

export function createAppI18n(locale = DEFAULT_LOCALE) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages: { fr, en },
  })
}
