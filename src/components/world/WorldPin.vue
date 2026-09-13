<script setup>
/**
 * Un élément de contenu accroché à un objet du monde.
 *
 * Trois parties : un point sur l'objet, un trait pointillé, et la carte elle-même, décalée de
 * `offset` pixels. Le point suit l'objet à chaque image (`CameraRig` écrit `--sx` / `--sy` d'après
 * `data-anchor`) ; la carte garde son décalage, si bien qu'elle reste lisible pendant que la caméra
 * bouge, sans jamais se détacher de ce qu'elle décrit.
 *
 * `emerge` : la carte sort de l'objet au lieu d'apparaître sur place (voir `WorldStage`).
 */
import { computed } from 'vue'
import { anchorPosition } from '@/world/anchors'

const props = defineProps({
  place: { type: String, required: true },
  anchor: { type: String, required: true },
  /** Décalage de la carte par rapport à l'objet, en pixels, pour un écran large. */
  offset: { type: Array, default: () => [0, -140] },
  /** Aspect de la carte : `bubble`, `parchment`, `plank`, `card` ou `tag`. */
  variant: { type: String, default: 'tag' },
  emerge: { type: Boolean, default: false },
})

const coords = computed(() =>
  anchorPosition(props.place, props.anchor)
    .map((value) => value.toFixed(2))
    .join(','),
)

const style = computed(() => {
  const [dx, dy] = props.offset
  return {
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--len': `${Math.hypot(dx, dy)}px`,
    '--angle': `${Math.atan2(dy, dx)}rad`,
  }
})
</script>

<template>
  <div
    class="world-pin"
    :class="{ 'is-emerge': emerge }"
    :data-anchor="coords"
    :data-dx="offset[0]"
    :data-dy="offset[1]"
    :style="style"
  >
    <span class="world-pin-leader" aria-hidden="true"></span>
    <span class="world-pin-dot" aria-hidden="true"></span>
    <div class="world-pin-card" :class="`is-${variant}`">
      <slot />
    </div>
  </div>
</template>
