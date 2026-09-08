// Point d'entrée du pré-rendu : produit le HTML statique servi aux visiteurs et aux crawlers.
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import App from './App.vue'
import { createAppI18n, DEFAULT_LOCALE } from './i18n'
import { reveal } from './directives/reveal'

export async function render(locale = DEFAULT_LOCALE) {
  const app = createSSRApp(App)
  app.use(createAppI18n(locale))
  // Sur le serveur la directive n'a rien à faire : le contenu est rendu visible.
  app.directive('reveal', { ...reveal, mounted: undefined })
  return renderToString(app)
}
