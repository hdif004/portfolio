<script setup>
/**
 * L'établi : les compétences en inventaire.
 *
 * Chaque outil occupe une case, comme dans un sac de jeu. Le classement d'origine est conservé
 * tel quel — au quotidien / solide / en cours d'apprentissage — parce que c'est une information
 * honnête et utile à un client, et qu'aucun niveau chiffré ne viendrait la remplacer sans
 * l'inventer.
 */
import { useI18n } from 'vue-i18n'
import { SKILL_GROUPS } from '@/data/skills'

const { t } = useI18n()
</script>

<template>
  <div class="gp">
    <h2 class="gp-title">{{ t('skills.title') }}</h2>
    <p class="gp-lead">{{ t('skills.subtitle') }}</p>

    <section v-for="group in SKILL_GROUPS" :key="group.id" class="gp-pouch">
      <h3 class="gp-pouch-title">
        {{ t(group.titleKey) }}
        <span class="gp-pouch-count">{{ group.items.length }}</span>
      </h3>
      <p class="gp-pouch-caption">{{ t(group.captionKey) }}</p>

      <ul class="gp-slots">
        <li v-for="item in group.items" :key="item.name" class="gp-slot">
          <component :is="item.icon" class="gp-slot-icon" aria-hidden="true" />
          <span class="gp-slot-name">{{ item.name }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
