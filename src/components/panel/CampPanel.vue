<script setup>
/**
 * Le campement : les coordonnées.
 *
 * Le footer classique aligne ses liens en petit, centré, sous la page. Ici chaque canal devient
 * une ligne pleine largeur, cliquable d'un bout à l'autre — c'est la dernière chose que fait un
 * visiteur convaincu, elle mérite plus qu'un lien de bas de page.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Github, Linkedin, Mail, Phone } from 'lucide-vue-next'
import { EMAIL, PHONE, PHONE_HREF, mailtoHref } from '@/game/contact'
import { useGame } from '@/composables/useGame'

const { t } = useI18n()
const { completeQuest } = useGame()

const mailHref = computed(() => mailtoHref(t('mail.subject')))

const channels = computed(() => [
  { id: 'mail', icon: Mail, label: EMAIL, href: mailHref.value, quest: true },
  { id: 'phone', icon: Phone, label: PHONE, href: PHONE_HREF },
  { id: 'github', icon: Github, label: 'github.com/hdif004', href: 'https://github.com/hdif004' },
  {
    id: 'linkedin',
    icon: Linkedin,
    label: 'linkedin.com/in/hudayfa-koujdal',
    href: 'https://www.linkedin.com/in/hudayfa-koujdal-930068258/',
  },
])
</script>

<template>
  <div class="gp">
    <h2 class="gp-title">Hudayfa Koujdal</h2>
    <p class="gp-lead">{{ t('footer.role') }}</p>

    <ul class="gp-channels">
      <li v-for="channel in channels" :key="channel.id">
        <a
          :href="channel.href"
          :target="channel.href.startsWith('http') ? '_blank' : undefined"
          :rel="channel.href.startsWith('http') ? 'noopener noreferrer' : undefined"
          class="gp-channel"
          @click="channel.quest && completeQuest('contact')"
        >
          <component :is="channel.icon" class="h-4 w-4" aria-hidden="true" />
          {{ channel.label }}
        </a>
      </li>
    </ul>

    <p class="gp-fineprint">
      &copy; {{ new Date().getFullYear() }} Hudayfa Koujdal. {{ t('footer.rights') }}
    </p>
  </div>
</template>
