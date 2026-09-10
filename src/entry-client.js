// Point d'entrée navigateur : hydrate le HTML pré-rendu.
import './assets/main.css'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { createAppI18n, detectLocale } from './i18n'
import { reveal } from './directives/reveal'
import { inject } from '@vercel/analytics'

// Tant que cette classe n'est pas posée, aucune section n'est masquée : le contenu reste
// lisible même si le JS ne s'exécute pas.
document.documentElement.classList.add('js')

createSSRApp(App).use(createAppI18n(detectLocale())).directive('reveal', reveal).mount('#app')

// Vercel Web Analytics : uniquement côté navigateur, après l'hydratation.
inject()
