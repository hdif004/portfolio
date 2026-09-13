import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import templateCompilerOptions from '@tresjs/core/template-compiler-options'

// https://vite.dev/config/
export default defineConfig({
  // Les options de Tres déclarent `<TresMesh>`, `<primitive>`… comme éléments personnalisés :
  // sans elles, Vue cherche des composants de ce nom et avertit à chaque rendu.
  plugins: [vue({ ...templateCompilerOptions }), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
