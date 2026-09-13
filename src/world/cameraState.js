/**
 * État courant de la caméra, animé par GSAP dans `CameraRig`.
 *
 * Objet brut, volontairement hors du système réactif de Vue : il change soixante fois par seconde
 * et n'est lu que dans la boucle de rendu (caméra, soleil qui suit le point visé).
 *
 * `lift` est la hauteur ajoutée pendant un trajet : la caméra monte puis redescend, c'est ce qui
 * transforme un travelling en survol.
 */
export const cameraState = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, lift: 0 }
