// main.js
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n' // 👈 utilise l'instance existante

createApp(App).use(i18n).mount('#app')
