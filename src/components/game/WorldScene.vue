<script setup>
/**
 * La clairière : une forêt bas-poly vue du dessus, dans laquelle chaque section du portfolio
 * occupe un lieu reconnaissable à sa silhouette.
 *
 * C'est le changement de fond par rapport à l'ancien mode carte : le monde est désormais
 * permanent et visible en continu. Avant, la scène n'était rendue que pendant les transitions,
 * donc les sept cents sapins, le relief et la route n'étaient jamais réellement vus — on payait
 * le poids de `three` pour une tache verte d'une seconde.
 *
 * Trois précautions, parce qu'un décor ne doit jamais coûter le contenu :
 * - `three` est chargé à la demande, uniquement en mode aventure : le mode classique et le
 *   premier rendu ne paient rien (morceau séparé côté build) ;
 * - si WebGL n'est pas disponible, on repasse en mode classique plutôt que d'afficher un vide ;
 * - le rendu s'arrête dès que l'onglet passe en arrière-plan.
 *
 * Les arbres sont dessinés en `InstancedMesh` : sept cents sapins ne coûtent que deux appels de
 * dessin. Ils s'écartent des clairières, sinon les lieux se retrouveraient dans les branches.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { PLACES, clearingRadius } from '@/game/world'
import { worldCamera, openPlace } from '@/composables/useWorld'
import { useGame } from '@/composables/useGame'

const { worldActive, setMode } = useGame()

const canvas = ref(null)
const loading = ref(false)

/**
 * Couleurs des objets, volontairement indépendantes de la palette du site : ce sont des couleurs
 * de choses (un bonnet, du bois, du métal), pas des couleurs d'interface. Elles reprennent celles
 * de l'illustration du hero pour que le personnage reste reconnaissable.
 */
const PAINT = {
  skin: 0xe8b58c,
  beanie: 0xb5533c,
  sweater: 0xe0a93f,
  trousers: 0x2f3b2a,
  chair: 0x3d4a38,
  metal: 0x8d8f86,
  wood: 0x8a6a45,
  woodDark: 0x5f4a30,
  screen: 0x1e2a1c,
  stone: 0x9a9a92,
  fire: 0xe4763a,
  fireCore: 0xf7c24a,
  lantern: 0xffe3ad,
  rug: 0x7a5c46,
  canvasTent: 0xd8d3c3,
  beard: 0x4a3524,
}

let renderer = null
let scene = null
let camera3d = null
let frame = 0
let disposeTheme = null
let stopped = false
/** Objets cliquables : chaque groupe de lieu, marqué par son identifiant. */
let pickable = []

/**
 * Hauteur du point d'ancrage de l'étiquette d'un lieu, au-dessus de sa structure. L'écart visuel
 * avec la structure, lui, est réglé en pixels dans `main.css` — voir `.world-marker`.
 */
const MARKER_HEIGHT = 3

/** Les structures sont dessinées à l'échelle humaine, puis grossies : vues de haut, une cabane de
 *  quatre mètres se lit comme une tache. */
const STRUCTURE_SCALE = 1.7

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const cssColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/** Bruit de valeur bilinéaire — un relief crédible sans embarquer de bibliothèque de bruit. */
function noise(x, z) {
  const fx = Math.floor(x)
  const fz = Math.floor(z)
  const hash = (i, j) => {
    const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
    return n - Math.floor(n)
  }
  const smooth = (t) => t * t * (3 - 2 * t)
  const tx = smooth(x - fx)
  const tz = smooth(z - fz)
  const a = hash(fx, fz)
  const b = hash(fx + 1, fz)
  const c = hash(fx, fz + 1)
  const d = hash(fx + 1, fz + 1)
  return (a + (b - a) * tx) * (1 - tz) + (c + (d - c) * tx) * tz
}

/** Tirage déterministe : même forêt à chaque visite, sans stocker la moindre coordonnée. */
function random(i, salt) {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return n - Math.floor(n)
}

/**
 * Distance au bord de la clairière la plus proche, en fraction de son rayon : 0 au centre d'un
 * lieu, 1 à sa lisière. Une seule mesure pour le terrain comme pour l'implantation des arbres,
 * alors que les clairières n'ont pas toutes la même taille.
 */
function clearingDepth(x, z) {
  let nearest = Infinity
  for (const place of PLACES) {
    nearest = Math.min(nearest, Math.hypot(x - place.x, z - place.z) / clearingRadius(place))
  }
  return nearest
}

/** Hauteur du terrain, aplanie autour de chaque lieu pour que les structures reposent à plat. */
function heightAt(x, z) {
  let height = noise(x * 0.055, z * 0.055) * 7 + noise(x * 0.14, z * 0.14) * 2.4 - 3

  const depth = clearingDepth(x, z)
  if (depth < 1) height *= depth ** 2

  return height
}

async function start() {
  if (!canvas.value) return

  loading.value = true
  const THREE = await import('three')
  if (stopped) {
    loading.value = false
    return
  }

  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true })
  } catch {
    // Pas de WebGL (pilote bloqué, machine ancienne) : le mode aventure n'a plus rien à montrer.
    // On rend la main au mode classique, qui contient exactement le même portfolio.
    loading.value = false
    setMode('classic')
    return
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  // Vue du dessus, sans ombres, tout est plat : ce sont elles qui donnent le relief et l'heure
  // qu'il est. `PCFSoft` pour des bords doux — une ombre dure sur du bas-poly fait carton découpé.
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  scene = new THREE.Scene()
  camera3d = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 1, 400)

  const reduced = prefersReducedMotion()

  // --- Lumières -------------------------------------------------------------------------------
  // Lumière du ciel pour le volume général, soleil rasant pour les ombres longues. Le sol et les
  // arbres sont éclairés eux aussi : sans cela, seules les structures auraient du relief.
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x4c5a46, 0.62))

  const sun = new THREE.DirectionalLight(0xfff0d8, 1.7)
  sun.position.set(-38, 46, 26)
  sun.castShadow = true
  // La zone d'ombre couvre le monde une fois pour toutes : la caméra se déplace, pas le soleil.
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -46
  sun.shadow.camera.right = 46
  sun.shadow.camera.top = 46
  sun.shadow.camera.bottom = -46
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 140
  // Sans ce décalage, une surface plane s'ombre elle-même en rayures (« shadow acne »).
  sun.shadow.bias = -0.0012
  sun.shadow.normalBias = 0.04
  scene.add(sun)

  // --- Relief ---------------------------------------------------------------------------------
  const size = 260
  const segments = 110
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
  geometry.rotateX(-Math.PI / 2)

  const position = geometry.attributes.position
  const colors = new Float32Array(position.count * 3)
  const low = new THREE.Color()
  const high = new THREE.Color()
  const vertex = new THREE.Color()

  const paint = () => {
    low.set(cssColor('--app-surface') || '#cfccc1')
    high.set(cssColor('--app-primary') || '#588157')

    for (let i = 0; i < position.count; i += 1) {
      const height = position.getY(i)
      vertex.copy(low).lerp(high, Math.min(1, Math.max(0, (height + 3) / 9)))
      colors[i * 3] = vertex.r
      colors[i * 3 + 1] = vertex.g
      colors[i * 3 + 2] = vertex.b
    }
    geometry.attributes.color.needsUpdate = true
  }

  for (let i = 0; i < position.count; i += 1) {
    position.setY(i, heightAt(position.getX(i), position.getZ(i)))
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  paint()

  const ground = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }),
  )
  ground.receiveShadow = true
  scene.add(ground)

  // Grille par-dessus le relief : la lecture « carte » vient surtout de là.
  const grid = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.045 }),
  )
  scene.add(grid)

  // --- Forêt ----------------------------------------------------------------------------------
  const TREES = 700
  const dummy = new THREE.Object3D()
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.16, 0.24, 1.1, 5),
    new THREE.MeshLambertMaterial(),
    TREES,
  )
  const crowns = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.05, 3.4, 6),
    new THREE.MeshLambertMaterial(),
    TREES,
  )
  // Seules les couronnes projettent : les troncs sont dessous, leur ombre n'ajouterait rien.
  crowns.castShadow = true

  /** Nuance de chaque sapin, conservée pour pouvoir repeindre la forêt au changement de thème. */
  const shades = []
  let planted = 0

  for (let i = 0; planted < TREES && i < TREES * 4; i += 1) {
    const x = (random(i, 1) - 0.5) * size
    const z = (random(i, 2) - 0.5) * size

    // On laisse la clairière libre : une structure ne doit pas pousser dans les branches.
    if (clearingDepth(x, z) < 1.25) continue

    const floor = heightAt(x, z)
    const scale = 0.65 + random(i, 3) * 0.9
    const turn = random(i, 4) * Math.PI * 2

    dummy.position.set(x, floor + 0.55 * scale, z)
    dummy.rotation.set(0, turn, 0)
    dummy.scale.setScalar(scale)
    dummy.updateMatrix()
    trunks.setMatrixAt(planted, dummy.matrix)

    dummy.position.setY(floor + 2.6 * scale)
    dummy.updateMatrix()
    crowns.setMatrixAt(planted, dummy.matrix)

    shades.push(random(i, 5))
    planted += 1
  }

  trunks.count = planted
  crowns.count = planted
  scene.add(trunks, crowns)

  /** Repeint la forêt d'après la palette courante : deux verts, tirés au sort par arbre. */
  const paintForest = () => {
    const light = new THREE.Color(cssColor('--app-primary') || '#588157')
    const dark = light.clone().multiplyScalar(0.55)
    const bark = light.clone().multiplyScalar(0.35)
    const shade = new THREE.Color()

    for (let i = 0; i < planted; i += 1) {
      crowns.setColorAt(i, shade.copy(dark).lerp(light, shades[i]))
      trunks.setColorAt(i, bark)
    }
    crowns.instanceColor.needsUpdate = true
    trunks.instanceColor.needsUpdate = true
  }

  paintForest()

  // --- Sentiers -------------------------------------------------------------------------------
  // Les lieux sont reliés au point de départ : vu d'en haut, ce sont les sentiers qui disent que
  // la clairière est un ensemble et pas six décors posés au hasard.
  const home = PLACES[0]
  const pathMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
  })

  for (const place of PLACES.slice(1)) {
    const from = new THREE.Vector3(home.x, heightAt(home.x, home.z) + 0.35, home.z)
    const to = new THREE.Vector3(place.x, heightAt(place.x, place.z) + 0.35, place.z)
    // Un léger arc de côté : un trait parfaitement droit se lit comme un fil, pas comme un chemin.
    const mid = from.clone().lerp(to, 0.5)
    mid.x += (to.z - from.z) * 0.12
    mid.z -= (to.x - from.x) * 0.12
    mid.y = heightAt(mid.x, mid.z) + 0.35

    const curve = new THREE.CatmullRomCurve3([from, mid, to])
    scene.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), pathMaterial),
    )
  }

  // --- Structures des lieux -------------------------------------------------------------------
  const box = (w, h, d, color) =>
    new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }))
  const cylinder = (rTop, rBottom, h, color, sides = 8) =>
    new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBottom, h, sides),
      new THREE.MeshLambertMaterial({ color }),
    )
  const cone = (r, h, color, sides = 6) =>
    new THREE.Mesh(new THREE.ConeGeometry(r, h, sides), new THREE.MeshLambertMaterial({ color }))

  /**
   * Le personnage : dans son fauteuil roulant, à son bureau. Le lieu de départ, c'est lui.
   *
   * Le fauteuil est construit pour être lu de haut : grandes roues débordant largement du siège,
   * rayons visibles, main courante et repose-pieds. Vu de trois quarts, c'est la silhouette du
   * fauteuil qui identifie le personnage avant même son bonnet.
   */
  function buildDesk(THREE) {
    const group = new THREE.Group()

    // Le bureau est volontairement étroit et placé bas : large, il masquait tout le fauteuil.
    const top = box(3.4, 0.18, 1.5, PAINT.wood)
    top.position.set(0, 1.42, -1.5)
    group.add(top)

    for (const [dx, dz] of [
      [-1.5, -2.1],
      [1.5, -2.1],
      [-1.5, -0.9],
      [1.5, -0.9],
    ]) {
      const leg = box(0.14, 1.42, 0.14, PAINT.woodDark)
      leg.position.set(dx, 0.71, dz)
      group.add(leg)
    }

    const base = box(1.3, 0.07, 0.9, PAINT.metal)
    base.position.set(0, 1.54, -1.6)
    group.add(base)
    const screen = box(1.3, 0.9, 0.07, PAINT.screen)
    screen.position.set(0, 1.95, -2)
    screen.rotation.x = -0.28
    group.add(screen)

    // --- Fauteuil roulant ---
    const chair = new THREE.Group()

    for (const side of [-1, 1]) {
      const wheel = new THREE.Group()

      const tyre = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.09, 6, 20),
        new THREE.MeshLambertMaterial({ color: PAINT.chair }),
      )
      wheel.add(tyre)

      // Main courante : le second cercle, plus fin, légèrement décalé vers l'extérieur.
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.66, 0.045, 6, 18),
        new THREE.MeshLambertMaterial({ color: PAINT.metal }),
      )
      rim.position.x = side * 0.1
      wheel.add(rim)

      // Rayons : c'est ce qui fait lire « roue de fauteuil » et pas « pneu ».
      for (let i = 0; i < 8; i += 1) {
        const spoke = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 1.66, 4),
          new THREE.MeshLambertMaterial({ color: PAINT.metal }),
        )
        spoke.rotation.z = (i / 8) * Math.PI
        wheel.add(spoke)
      }

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.16, 8),
        new THREE.MeshLambertMaterial({ color: PAINT.metal }),
      )
      hub.rotation.z = Math.PI / 2
      wheel.add(hub)

      // La roue est dans le plan XY : on la tourne pour qu'elle roule vers l'avant.
      wheel.rotation.y = Math.PI / 2
      wheel.position.set(side * 1.05, 0.85, 0.75)
      chair.add(wheel)

      // Roulette avant, bien plus petite : le contraste des deux diamètres fait le fauteuil.
      const caster = new THREE.Mesh(
        new THREE.TorusGeometry(0.26, 0.07, 6, 12),
        new THREE.MeshLambertMaterial({ color: PAINT.chair }),
      )
      caster.rotation.y = Math.PI / 2
      caster.position.set(side * 0.62, 0.26, -0.55)
      chair.add(caster)

      const fork = box(0.08, 0.5, 0.08, PAINT.metal)
      fork.position.set(side * 0.62, 0.55, -0.55)
      chair.add(fork)

      // Accoudoir.
      const armrest = box(0.12, 0.08, 0.95, PAINT.metal)
      armrest.position.set(side * 0.78, 1.32, 0.6)
      chair.add(armrest)
    }

    const seat = box(1.45, 0.14, 1.2, PAINT.chair)
    seat.position.set(0, 1, 0.7)
    chair.add(seat)

    const back = box(1.45, 1.15, 0.12, PAINT.chair)
    back.position.set(0, 1.6, 1.32)
    chair.add(back)

    // Repose-pieds, en avant du siège : le détail qui ferme la silhouette.
    const footplate = box(1, 0.1, 0.45, PAINT.metal)
    footplate.position.set(0, 0.4, -0.75)
    chair.add(footplate)

    group.add(chair)

    // --- Le personnage ---
    const legs = box(0.9, 0.34, 1.3, PAINT.trousers)
    legs.position.set(0, 1.2, -0.15)
    group.add(legs)

    const feet = box(0.8, 0.22, 0.3, PAINT.chair)
    feet.position.set(0, 0.56, -0.78)
    group.add(feet)

    const torso = cylinder(0.44, 0.5, 1.05, PAINT.sweater)
    torso.position.set(0, 1.75, 0.72)
    group.add(torso)

    for (const side of [-1, 1]) {
      const arm = cylinder(0.14, 0.14, 1.15, PAINT.sweater, 6)
      arm.position.set(side * 0.45, 1.82, 0.05)
      arm.rotation.x = Math.PI / 2.3
      group.add(arm)
    }

    const head = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.34, 1),
      new THREE.MeshLambertMaterial({ color: PAINT.skin }),
    )
    head.position.set(0, 2.5, 0.62)
    group.add(head)

    // Barbe : une facette sombre sur l'avant du visage suffit à la ressemblance.
    const beard = box(0.42, 0.3, 0.16, PAINT.beard)
    beard.position.set(0, 2.37, 0.34)
    group.add(beard)

    const beanie = cylinder(0.3, 0.36, 0.36, PAINT.beanie)
    beanie.position.set(0, 2.76, 0.62)
    group.add(beanie)

    // --- Le campement du personnage ---------------------------------------------------------
    // Un bureau seul au milieu d'une clairière ne raconte rien. Le feu, les rondins et l'auvent
    // disent que quelqu'un vit là, et donnent au lieu de départ sa chaleur.

    const camp = new THREE.Group()
    camp.position.set(-4.6, 0, 2.2)

    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2
      const stone = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.26 + random(i, 11) * 0.1),
        new THREE.MeshLambertMaterial({ color: PAINT.stone }),
      )
      stone.position.set(Math.cos(angle) * 1.15, 0.18, Math.sin(angle) * 1.15)
      camp.add(stone)
    }

    for (const turn of [0.3, 1.5, 2.6]) {
      const log = cylinder(0.14, 0.14, 1.7, PAINT.woodDark, 6)
      log.position.set(0, 0.38, 0)
      log.rotation.set(Math.PI / 2.7, turn, 0)
      camp.add(log)
    }

    // Les flammes ne sont pas éclairées : ce sont elles qui éclairent.
    const flames = []
    for (const [i, scale] of [1, 0.72, 0.5].entries()) {
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.42 * scale, 1.25 * scale, 5),
        new THREE.MeshBasicMaterial({ color: i === 0 ? PAINT.fire : PAINT.fireCore }),
      )
      flame.position.y = 0.85 + i * 0.12
      flame.rotation.y = i * 1.1
      camp.add(flame)
      flames.push(flame)
    }

    // La lueur du feu : c'est elle qui fait que la scène a une heure et une température.
    const glow = new THREE.PointLight(0xff9a4d, 26, 16, 2)
    glow.position.set(0, 1.4, 0)
    camp.add(glow)

    // Rondins où l'on s'assoit, tournés vers le feu.
    for (const [x, z, turn] of [
      [2, 0.7, 0.25],
      [-1.4, 1.7, 1.25],
      [0.4, -2, 0.05],
    ]) {
      const seat = cylinder(0.32, 0.32, 1.9, PAINT.wood, 8)
      seat.position.set(x, 0.32, z)
      seat.rotation.set(0, turn, Math.PI / 2)
      camp.add(seat)
    }

    // Bois coupé, empilé.
    for (let i = 0; i < 5; i += 1) {
      const log = cylinder(0.17, 0.17, 1.5, PAINT.woodDark, 6)
      log.position.set(2.8 + (i % 3) * 0.36, 0.18 + Math.floor(i / 3) * 0.35, -1.6)
      log.rotation.z = Math.PI / 2
      camp.add(log)
    }

    group.add(camp)

    // Tapis au sol : il pose le poste de travail au lieu de le laisser flotter sur l'herbe.
    const rug = box(6.2, 0.06, 4.6, PAINT.rug)
    rug.position.set(0, 0.04, -0.4)
    group.add(rug)

    /*
     * Paravent de toile derrière le poste — et pas un auvent au-dessus.
     *
     * Vu du dessus, un toit cacherait exactement ce qu'on est venu voir : le personnage. Une toile
     * verticale, elle, se lit comme un abri sans rien masquer.
     */
    const screenWall = new THREE.Group()
    screenWall.position.set(0, 0, -3.1)

    for (const dx of [-2.8, 2.8]) {
      const post = cylinder(0.12, 0.14, 2.6, PAINT.woodDark, 6)
      post.position.set(dx, 1.3, 0)
      screenWall.add(post)
    }

    const sheet = box(5.6, 1.9, 0.1, PAINT.canvasTent)
    sheet.position.y = 1.55
    screenWall.add(sheet)

    group.add(screenWall)

    // Lanterne sur son piquet : le second point lumineux, plus froid que le feu.
    const pole = cylinder(0.08, 0.1, 2.6, PAINT.woodDark, 6)
    pole.position.set(-3.1, 1.3, 1.4)
    group.add(pole)

    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.44, 0.32),
      new THREE.MeshBasicMaterial({ color: PAINT.lantern }),
    )
    lantern.position.set(-3.1, 2.45, 1.4)
    group.add(lantern)

    const lanternGlow = new THREE.PointLight(0xffd9a0, 9, 9, 2)
    lanternGlow.position.copy(lantern.position)
    group.add(lanternGlow)

    // La tête et le torse oscillent très légèrement : vu d'en haut, c'est ce qui fait la
    // différence entre « un personnage » et « un tas de cubes ».
    group.userData.animate = (time) => {
      head.position.y = 2.5 + Math.sin(time * 1.6) * 0.03
      beard.position.y = 2.37 + Math.sin(time * 1.6) * 0.03
      beanie.position.y = 2.76 + Math.sin(time * 1.6) * 0.03
      torso.rotation.x = Math.sin(time * 1.6) * 0.02

      // Deux sinusoïdes de périodes incommensurables : le vacillement ne se répète jamais tout à
      // fait, ce qu'un seul sinus ferait immédiatement remarquer.
      const flicker = 0.86 + Math.sin(time * 7.3) * 0.1 + Math.sin(time * 11.7) * 0.06
      glow.intensity = 26 * flicker
      lanternGlow.intensity = 9 * (0.94 + Math.sin(time * 3.1) * 0.06)

      for (const [i, flame] of flames.entries()) {
        flame.scale.set(flicker, 0.9 + Math.sin(time * 6 + i) * 0.16, flicker)
        flame.rotation.y = time * (0.9 + i * 0.4)
      }
    }

    return group
  }

  /** L'atelier : une cabane de rondins. */
  function buildCabin(THREE) {
    const group = new THREE.Group()

    const walls = box(4.2, 2.4, 3.4, PAINT.wood)
    walls.position.y = 1.2
    group.add(walls)

    const roof = cone(3.4, 1.7, PAINT.beanie, 4)
    roof.position.y = 3.25
    roof.rotation.y = Math.PI / 4
    group.add(roof)

    const door = box(0.9, 1.4, 0.1, PAINT.woodDark)
    door.position.set(0, 0.7, 1.72)
    group.add(door)

    const chimney = box(0.45, 1.2, 0.45, PAINT.stone)
    chimney.position.set(1.3, 3.4, 0.6)
    group.add(chimney)

    return group
  }

  /** L'établi : un plan de travail et ses outils rangés. */
  function buildWorkbench(THREE) {
    const group = new THREE.Group()

    const top = box(4.6, 0.25, 2, PAINT.wood)
    top.position.y = 1.35
    group.add(top)

    for (const [dx, dz] of [
      [-2, -0.7],
      [2, -0.7],
      [-2, 0.7],
      [2, 0.7],
    ]) {
      const leg = box(0.2, 1.35, 0.2, PAINT.woodDark)
      leg.position.set(dx, 0.67, dz)
      group.add(leg)
    }

    // Panneau d'outils : autant de tasseaux que d'outils accrochés, ça suffit à la lecture.
    const board = box(4.4, 1.8, 0.12, PAINT.woodDark)
    board.position.set(0, 2.4, -0.95)
    group.add(board)

    for (let i = 0; i < 5; i += 1) {
      const tool = box(0.18, 0.8 + (i % 3) * 0.22, 0.18, PAINT.metal)
      tool.position.set(-1.7 + i * 0.85, 2.4, -0.8)
      group.add(tool)
    }

    const crate = box(0.9, 0.7, 0.9, PAINT.wood)
    crate.position.set(2.4, 0.35, 1.2)
    group.add(crate)

    return group
  }

  /** Le chantier : des caisses empilées et une grue de fortune. */
  function buildSite(THREE) {
    const group = new THREE.Group()

    const stack = [
      [0, 0.5, 0, 1.4],
      [1.5, 0.45, 0.6, 1.2],
      [0.3, 1.5, 0.2, 1.1],
      [-1.4, 0.55, -0.8, 1.5],
    ]
    for (const [x, y, z, s] of stack) {
      const crate = box(s, s, s, PAINT.wood)
      crate.position.set(x, y, z)
      crate.rotation.y = x * 0.4
      group.add(crate)
    }

    const mast = box(0.22, 4.6, 0.22, PAINT.metal)
    mast.position.set(-2.6, 2.3, 1.4)
    group.add(mast)

    const jib = box(3.4, 0.18, 0.18, PAINT.metal)
    jib.position.set(-1.2, 4.5, 1.4)
    group.add(jib)

    const hook = box(0.1, 1.1, 0.1, PAINT.metal)
    hook.position.set(0.2, 3.9, 1.4)
    group.add(hook)

    const load = box(0.7, 0.7, 0.7, PAINT.woodDark)
    load.position.set(0.2, 3.1, 1.4)
    group.add(load)

    group.userData.animate = (time) => {
      const swing = Math.sin(time * 0.9) * 0.12
      hook.rotation.z = swing
      load.position.x = 0.2 + Math.sin(time * 0.9) * 0.35
      load.position.y = 3.1 - Math.abs(Math.sin(time * 0.9)) * 0.05
    }

    return group
  }

  /** La bifurcation : un poteau indicateur, là où l'on choisit d'écrire ou de repartir. */
  function buildSignpost(THREE) {
    const group = new THREE.Group()

    const post = cylinder(0.16, 0.2, 3.6, PAINT.woodDark)
    post.position.y = 1.8
    group.add(post)

    for (const [i, turn] of [0.4, -0.9, 2.1].entries()) {
      const plank = box(1.9, 0.42, 0.12, PAINT.wood)
      plank.position.set(0.8, 3 - i * 0.7, 0)
      const arm = new THREE.Group()
      arm.add(plank)
      arm.rotation.y = turn
      group.add(arm)
    }

    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.8),
      new THREE.MeshLambertMaterial({ color: PAINT.stone }),
    )
    stone.position.set(-1.6, 0.5, 0.9)
    group.add(stone)

    return group
  }

  /** Le campement : les tentes où l'on se retrouve, donc les coordonnées. */
  function buildCampfire(THREE) {
    const group = new THREE.Group()

    for (const side of [-1, 1]) {
      const tent = cone(1.5, 1.9, PAINT.canvasTent, 4)
      tent.position.set(side * 2.6, 0.95, 0)
      tent.rotation.y = Math.PI / 4
      group.add(tent)

      const flap = box(0.5, 0.9, 0.06, PAINT.woodDark)
      flap.position.set(side * 2.6, 0.45, 1)
      group.add(flap)
    }

    // Cairn : le tas de pierres qui marque un point de rendez-vous.
    for (let i = 0; i < 5; i += 1) {
      const stone = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.55 - i * 0.07),
        new THREE.MeshLambertMaterial({ color: PAINT.stone }),
      )
      stone.position.set(0, 0.4 + i * 0.55, -1.2)
      stone.rotation.y = i
      group.add(stone)
    }

    const pack = box(1, 0.8, 0.7, PAINT.wood)
    pack.position.set(1.1, 0.4, 1.6)
    pack.rotation.y = 0.5
    group.add(pack)

    return group
  }

  const BUILDERS = {
    desk: buildDesk,
    cabin: buildCabin,
    workbench: buildWorkbench,
    site: buildSite,
    signpost: buildSignpost,
    campfire: buildCampfire,
  }

  const structures = new Map()

  for (const place of PLACES) {
    const group = BUILDERS[place.kind](THREE)
    group.position.set(place.x, heightAt(place.x, place.z), place.z)
    group.scale.setScalar(STRUCTURE_SCALE)
    // Chaque lieu regarde vers le centre : les façades ne tournent jamais le dos à la caméra.
    // Le point de départ, lui, est tourné de trois quarts : c'est l'angle où l'on voit à la fois
    // le personnage et le profil de son fauteuil.
    group.rotation.y = place.id === 'hero' ? -0.5 : Math.atan2(-place.x, -place.z)
    group.userData.placeId = place.id
    group.traverse((child) => {
      // Les enfants portent aussi l'identifiant : le pointeur touche une caisse, pas le groupe.
      child.userData.placeId = place.id
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
    })
    scene.add(group)
    structures.set(place.id, group)
    pickable.push(group)
  }

  scene.fog = new THREE.Fog(new THREE.Color(cssColor('--app-background')), 80, 240)

  const repaint = () => {
    paint()
    paintForest()
    scene.fog.color.set(cssColor('--app-background'))
  }

  // Le thème peut changer à tout moment : le décor suit la palette du site.
  const observer = new MutationObserver(repaint)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  disposeTheme = () => observer.disconnect()

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    camera3d.aspect = window.innerWidth / window.innerHeight
    camera3d.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)

  // --- Pointeur -------------------------------------------------------------------------------
  // Cliquer sur une structure ouvre son lieu. Les marqueurs HTML (voir `WorldMarkers`) font la
  // même chose et restent le chemin accessible : ici on ajoute le geste évident, pas le seul.
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let hovered = null

  const placeUnderPointer = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(pointer, camera3d)
    const hit = raycaster.intersectObjects(pickable, true)[0]
    return hit?.object?.userData?.placeId ?? null
  }

  const onMove = (event) => {
    const id = placeUnderPointer(event)
    if (id === hovered) return
    hovered = id
    canvas.value.style.cursor = id ? 'pointer' : ''
    for (const [placeId, group] of structures) {
      group.scale.setScalar(placeId === hovered ? STRUCTURE_SCALE * 1.07 : STRUCTURE_SCALE)
    }
  }

  const onClick = (event) => {
    const id = placeUnderPointer(event)
    if (id) openPlace(id)
  }

  window.addEventListener('pointermove', onMove)
  canvas.value.addEventListener('click', onClick)

  // --- Boucle ---------------------------------------------------------------------------------
  const current = { x: worldCamera.x, z: worldCamera.z, height: worldCamera.height }
  // Première image : on arrive en altitude et on redescend, sauf si le mouvement est refusé.
  if (!reduced) current.height = worldCamera.height + 26

  const screen = new THREE.Vector3()

  /**
   * Position à l'écran de chaque lieu, écrite directement dans le style des marqueurs.
   *
   * Volontairement hors du système réactif de Vue : mettre à jour six positions soixante fois par
   * seconde à travers `ref` déclencherait autant de rendus de composant pour un simple
   * déplacement de pixels.
   */
  const placeMarkers = () => {
    for (const place of PLACES) {
      const marker = document.querySelector(`.world-marker[data-place="${place.id}"]`)
      if (!marker) continue

      screen.set(place.x, heightAt(place.x, place.z) + MARKER_HEIGHT, place.z).project(camera3d)
      const visible = screen.z < 1
      marker.style.setProperty('--sx', `${(screen.x * 0.5 + 0.5) * window.innerWidth}px`)
      marker.style.setProperty('--sy', `${(-screen.y * 0.5 + 0.5) * window.innerHeight}px`)
      marker.toggleAttribute('data-offscreen', !visible)
    }
  }

  const loop = () => {
    frame = requestAnimationFrame(loop)

    // Rattrapage exponentiel : la caméra glisse vers sa cible sans à-coup, et un changement de
    // destination en cours de route est absorbé au lieu de couper le mouvement.
    const ease = reduced ? 1 : 0.055
    current.x += (worldCamera.x - current.x) * ease
    current.z += (worldCamera.z - current.z) * ease
    current.height += (worldCamera.height - current.height) * ease

    // Vue du dessus. Le léger recul en z garde un peu de perspective : parfaitement à la
    // verticale, les structures n'auraient plus de hauteur du tout.
    camera3d.position.set(current.x, current.height, current.z + current.height * 0.26)
    camera3d.lookAt(current.x, 0, current.z)

    if (!reduced) {
      const time = performance.now() / 1000
      for (const group of structures.values()) group.userData.animate?.(time)
    }

    placeMarkers()
    renderer.render(scene, camera3d)
  }

  const onVisibility = () => {
    // Onglet en arrière-plan : on arrête de dessiner. `requestAnimationFrame` est déjà gelé par
    // le navigateur dans ce cas, mais l'arrêt explicite évite une image inutile au retour.
    if (document.hidden) cancelAnimationFrame(frame)
    else if (!stopped) loop()
  }
  document.addEventListener('visibilitychange', onVisibility)

  loading.value = false
  loop()

  return () => {
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onMove)
    canvas.value?.removeEventListener('click', onClick)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}

let cleanup = null

function stop() {
  stopped = true
  cancelAnimationFrame(frame)
  cleanup?.()
  cleanup = null
  disposeTheme?.()
  renderer?.dispose()
  renderer = null
  scene = null
  pickable = []
}

// `onMounted` et pas un `watch` immédiat au niveau du composant : le pré-rendu exécute `setup`,
// et tout ce fichier parle à `window`. Le serveur ne doit jamais entrer ici.
onMounted(() => {
  watch(
    worldActive,
    async (active) => {
      if (active) {
        stopped = false
        cleanup = await start()
      } else {
        stop()
      }
    },
    { immediate: true },
  )
})

onBeforeUnmount(stop)
</script>

<template>
  <canvas
    v-show="worldActive"
    ref="canvas"
    class="world-canvas"
    :class="{ 'is-loading': loading }"
    aria-hidden="true"
  ></canvas>
</template>
