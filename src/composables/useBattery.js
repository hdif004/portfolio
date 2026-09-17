import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Batterie réelle du visiteur, via l'API Battery Status. Disponible dans Chrome, Edge, Opera et
 * Samsung Internet ; absente de Safari (donc de tous les navigateurs iPhone) et de Firefox.
 * `level` reste à null quand l'information n'est pas disponible. Rien n'est envoyé nulle part.
 */
export function useBattery() {
  const level = ref(null)
  const charging = ref(false)
  let battery = null

  const update = () => {
    level.value = battery.level
    charging.value = battery.charging
  }

  onMounted(async () => {
    if (typeof navigator.getBattery !== 'function') return
    try {
      battery = await navigator.getBattery()
      update()
      battery.addEventListener('levelchange', update)
      battery.addEventListener('chargingchange', update)
    } catch {
      battery = null
    }
  })

  onBeforeUnmount(() => {
    battery?.removeEventListener('levelchange', update)
    battery?.removeEventListener('chargingchange', update)
  })

  return { level, charging }
}
