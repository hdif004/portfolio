/**
 * Palette du site lue depuis les variables CSS, tenue à jour quand le thème change.
 *
 * Le décor suit le thème : en sombre, le campement passe au crépuscule. À n'appeler que côté client.
 */
import { onBeforeUnmount, reactive } from 'vue'

function read() {
  const root = document.documentElement
  const styles = getComputedStyle(root)
  const css = (name, fallback) => styles.getPropertyValue(name).trim() || fallback

  return {
    dark: root.classList.contains('dark'),
    background: css('--app-background', '#e9e6dc'),
    primary: css('--app-primary', '#588157'),
  }
}

export function useThemePalette() {
  const palette = reactive(read())

  const observer = new MutationObserver(() => Object.assign(palette, read()))
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  onBeforeUnmount(() => observer.disconnect())

  return palette
}
