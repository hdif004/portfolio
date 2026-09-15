<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  host: { type: String, required: true },
})
</script>

<template>
  <!-- Faux navigateur : barre avec les trois pastilles et l'adresse, capture bureau en dessous. -->
  <div class="overflow-hidden rounded-lg border border-muted bg-background shadow-md">
    <div class="flex items-center gap-2 border-b border-muted bg-surface px-3 py-2">
      <span class="flex gap-1.5" aria-hidden="true">
        <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span>
      </span>
      <span class="mx-auto truncate rounded-md bg-background px-3 py-0.5 text-xs text-text-muted">
        {{ host }}
      </span>
    </div>
    <img
      :src="src"
      :alt="alt"
      width="1200"
      height="750"
      loading="lazy"
      decoding="async"
      class="block aspect-[8/5] w-full object-cover object-top"
    />
  </div>
</template>
