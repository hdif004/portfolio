<template>
  <button
    @click="$emit('toggle')"
    class="p-2 rounded-full border border-primary bg-background text-text hover:bg-primary hover:text-background transition-all duration-200"
    :aria-label="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
  >
    <span v-if="isDark">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<script setup>
defineProps({
  isDark: Boolean,
})

defineEmits(['toggle'])
</script>
