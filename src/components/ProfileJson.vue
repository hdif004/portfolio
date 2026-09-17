<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Fiche « profil » affichée comme un fichier JSON coloré, dans les mockups de la hero.
 * `compact` : version étroite (téléphone) — tableaux sur plusieurs lignes, sans numéros de ligne.
 */
const props = defineProps({
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(['open-cv'])

const { t } = useI18n()

/**
 * Uniquement des informations déjà présentes ailleurs sur le site. Une valeur { text, href }
 * devient un lien, { text, action } un bouton.
 * `projects` : missions clientes listées dans la section Réalisations, à mettre à jour avec elle.
 */
const profile = computed(() => ({
  firstName: 'Hudayfa',
  lastName: 'Koujdal',
  role: `💻 ${t('hero.profile.role')}`,
  stack: ['Shopify', 'Liquid', 'JavaScript', 'WordPress'],
  projects: 5,
  contact: {
    email: { text: 'hudayfa.k.pro@gmail.com', href: 'mailto:hudayfa.k.pro@gmail.com' },
    github: { text: 'github.com/hdif004', href: 'https://github.com/hdif004', external: true },
    cv: { text: 'CV.pdf', action: () => emit('open-cv') },
  },
  coffeeAddict: '☕ of course',
}))

const tok = (type, text, extra = {}) => ({ type, text, ...extra })

const valueTokens = (value) => {
  if (typeof value === 'number') return [tok('num', String(value))]
  if (typeof value === 'string') return [tok('str', JSON.stringify(value))]
  const { text, ...link } = value
  return [tok('str', JSON.stringify(text), link)]
}

const isNested = (value) => value && typeof value === 'object' && !Array.isArray(value) && !('text' in value)

const objectLines = (object, depth = 0) => {
  const pad = '  '.repeat(depth + 1)
  const entries = Object.entries(object)
  const lines = []

  entries.forEach(([key, value], i) => {
    const comma = i < entries.length - 1 ? [tok('punct', ',')] : []
    const head = [tok('pad', pad), tok('key', JSON.stringify(key)), tok('punct', ': ')]

    if (isNested(value)) {
      lines.push([...head, tok('punct', '{')], ...objectLines(value, depth + 1))
      lines.push([tok('pad', pad), tok('punct', '}'), ...comma])
    } else if (Array.isArray(value) && props.compact) {
      lines.push([...head, tok('punct', '[')])
      value.forEach((item, j) => {
        const itemComma = j < value.length - 1 ? [tok('punct', ',')] : []
        lines.push([tok('pad', `${pad}  `), ...valueTokens(item), ...itemComma])
      })
      lines.push([tok('pad', pad), tok('punct', ']'), ...comma])
    } else if (Array.isArray(value)) {
      const items = value.flatMap((item, j) => [...(j ? [tok('punct', ', ')] : []), ...valueTokens(item)])
      lines.push([...head, tok('punct', '['), ...items, tok('punct', ']'), ...comma])
    } else {
      lines.push([...head, ...valueTokens(value), ...comma])
    }
  })
  return lines
}

const lines = computed(() => [[tok('punct', '{')], ...objectLines(profile.value), [tok('punct', '}')]])

const tokenClass = {
  punct: 'text-[#8fa37f]',
  key: 'text-[#e9c46a]',
  str: 'text-[#f4a582]',
  num: 'text-[#a3d9a5]',
  pad: '',
}
</script>

<template>
  <pre
    class="profile-json overflow-auto font-mono text-[#dad7cd]"
  ><code><span v-for="(line, i) in lines" :key="i" class="flex"><span v-if="!compact" aria-hidden="true" class="mr-[1.5em] w-[1.5em] shrink-0 select-none text-right text-[#5f7a63]">{{ i + 1 }}</span><span :class="compact ? 'wrap-line' : 'whitespace-pre'"><template v-for="(token, j) in line" :key="j"><a v-if="token.href" :href="token.href" :target="token.external ? '_blank' : undefined" :rel="token.external ? 'noopener noreferrer' : undefined" :class="tokenClass[token.type]" class="code-link">{{ token.text }}</a><button v-else-if="token.action" type="button" :class="tokenClass[token.type]" class="code-link" @click="token.action">{{ token.text }}</button><span v-else :class="tokenClass[token.type]">{{ token.text }}</span></template></span></span></code></pre>
</template>

<style scoped>
.profile-json {
  scrollbar-width: none;
}

.profile-json::-webkit-scrollbar {
  display: none;
}

/* Version compacte : sur les plus petits téléphones, une ligne trop longue passe à la ligne. */
.wrap-line {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.code-link {
  text-decoration: underline dotted;
  text-underline-offset: 4px;
  cursor: pointer;
}

.code-link:hover {
  text-decoration-style: solid;
}
</style>
