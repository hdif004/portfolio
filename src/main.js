// main.js
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'
import { MotionPlugin } from '@vueuse/motion'

createApp(App).use(i18n).use(MotionPlugin).mount('#app')
