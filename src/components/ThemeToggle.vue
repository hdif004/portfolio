<template>
  <Switch
    :modelValue="isDark"
    @update:modelValue="$emit('toggle', $event)"
    as="template"
    v-slot="{ checked }"
  >
    <button
      :class="[
        'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
        checked ? 'bg-[#f3f0e7]' : 'bg-green-800',
      ]"
    >
      <span class="sr-only">Toggle dark mode</span>

      <!-- ☀️ Sun icon (left, light mode) -->
      <Sun
        v-if="!checked"
        class="absolute sun-icon z-10 left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-300 pointer-events-none"
      />

      <!-- 🌙 Moon icon (right, dark mode) -->
      <Moon
        v-else
        class="absolute moon-icon z-10 right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-800 pointer-events-none"
      />

      <!-- Bulle blanche -->
      <span
        :class="[
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300',
          checked ? 'translate-x-7' : 'translate-x-1',
        ]"
      />
    </button>
  </Switch>
</template>

<script setup>
import { Switch } from '@headlessui/vue'
import { Moon, Sun } from 'lucide-vue-next'

defineProps({ isDark: Boolean })
defineEmits(['toggle'])
</script>
