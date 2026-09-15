<script setup>
/**
 * Logo de marque issu de `simple-icons` (grille 24×24, remplissage). Toujours monochrome : il prend
 * la couleur du texte (`currentColor`) pour rester dans la palette du site.
 */
defineProps({
  icon: { type: Object, required: true },
})
</script>

<template>
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path :d="icon.path" />
  </svg>
</template>
