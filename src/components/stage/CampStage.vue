<script setup>
/**
 * Le campement de contact : une étiquette par canal, accrochée aux tentes et au feu.
 *
 * Chaque étiquette est cliquable d'un bout à l'autre — c'est la dernière chose que fait un visiteur
 * convaincu, elle mérite mieux qu'un lien de bas de page.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Github, Linkedin, Mail, Phone } from 'lucide-vue-next'
import WorldPin from '@/components/world/WorldPin.vue'
import { EMAIL, PHONE, PHONE_HREF, mailtoHref } from '@/game/contact'
import { useGame } from '@/composables/useGame'

const { t } = useI18n()
const { completeQuest } = useGame()

const mailHref = computed(() => mailtoHref(t('mail.subject')))

const channels = computed(() => [
  {
    id: 'mail',
    icon: Mail,
    label: EMAIL,
    href: mailHref.value,
    quest: true,
    anchor: 'tentLeft',
    offset: [-380, -50],
  },
  { id: 'phone', icon: Phone, label: PHONE, href: PHONE_HREF, anchor: 'tentRight', offset: [380, -50] },
  {
    id: 'github',
    icon: Github,
    label: 'github.com/hdif004',
    href: 'https://github.com/hdif004',
    anchor: 'fire',
    offset: [-280, 180],
  },
  {
    id: 'linkedin',
    icon: Linkedin,
    label: 'linkedin.com/in/hudayfa-koujdal',
    href: 'https://www.linkedin.com/in/hudayfa-koujdal-930068258/',
    anchor: 'bedroll',
    offset: [300, 170],
  },
])

const isExternal = (href) => href.startsWith('http')
</script>

<template>
  <WorldPin place="footer" anchor="sign" :offset="[0, -210]" variant="plank">
    <div class="stage-centered">
      <h2 class="stage-title">Hudayfa Koujdal</h2>
      <p class="stage-text">{{ t('footer.role') }}</p>
    </div>
  </WorldPin>

  <WorldPin
    v-for="channel in channels"
    :key="channel.id"
    place="footer"
    :anchor="channel.anchor"
    :offset="channel.offset"
    variant="tag"
  >
    <a
      :href="channel.href"
      :target="isExternal(channel.href) ? '_blank' : undefined"
      :rel="isExternal(channel.href) ? 'noopener noreferrer' : undefined"
      class="stage-action"
      @click="channel.quest && completeQuest('contact')"
    >
      <component :is="channel.icon" class="h-4 w-4" aria-hidden="true" />
      {{ channel.label }}
    </a>
  </WorldPin>
</template>
