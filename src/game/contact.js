/**
 * Point de contact unique du site.
 *
 * Le formulaire a été retiré : tous les appels à l'action ouvrent directement le client mail du
 * visiteur, avec un objet pré-rempli. Un seul chemin, rien à maintenir, et aucune étape
 * intermédiaire entre l'envie d'écrire et l'écriture.
 */
export const EMAIL = 'hudayfa.k.pro@gmail.com'
export const PHONE = '+33 7 68 64 45 45'
export const PHONE_HREF = 'tel:+33768644545'

/** Construit le lien `mailto:`. `subject` est déjà traduit par l'appelant. */
export function mailtoHref(subject) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`
}
