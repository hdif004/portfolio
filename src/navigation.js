/**
 * Navigation interne commune à la nav, au bouton de contact mobile et aux icônes du mockup.
 *
 * La hero peut enregistrer une étape à jouer avant de quitter le haut de page (refermer
 * l'ordinateur) : `navigateTo` l'attend, puis fait défiler en douceur jusqu'à la section.
 */
let beforeLeavingHero = null

/** Enregistre (ou retire, avec `null`) la fonction asynchrone à jouer avant la navigation. */
export const setBeforeLeavingHero = (fn) => {
  beforeLeavingHero = fn
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const navigateTo = async (id) => {
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth'

  if (id === 'hero') {
    window.scrollTo({ top: 0, behavior })
    return
  }

  const target = document.getElementById(id)
  if (!target) return

  if (beforeLeavingHero) await beforeLeavingHero()
  target.scrollIntoView({ behavior })
}
