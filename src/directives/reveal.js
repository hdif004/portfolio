/**
 * Révélation au scroll, sans dépendance externe.
 *
 * Principe : le contenu est visible par défaut. C'est le script qui ajoute la classe `js` sur
 * <html> (voir main.js), ce qui autorise l'état masqué. Si le JS échoue, si l'IntersectionObserver
 * n'existe pas ou si l'utilisateur a demandé moins d'animations, tout reste affiché.
 */
const REVEALED = 'is-revealed'

let observer = null

const getObserver = () => {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add(REVEALED)
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 },
  )
  return observer
}

export const reveal = {
  mounted(el, binding) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced || typeof IntersectionObserver === 'undefined') {
      el.classList.add(REVEALED)
      return
    }

    el.classList.add('reveal')
    if (binding.value?.delay) el.style.setProperty('--reveal-delay', `${binding.value.delay}ms`)
    if (binding.value?.from === 'left') el.classList.add('reveal-left')
    if (binding.value?.from === 'right') el.classList.add('reveal-right')

    getObserver().observe(el)

    // Filet de sécurité : si l'observer ne se déclenche jamais, on affiche quand même.
    setTimeout(() => el.classList.add(REVEALED), 2000)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
