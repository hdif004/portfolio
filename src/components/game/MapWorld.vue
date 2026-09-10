<script setup>
/**
 * Décor 3D de la carte : une forêt bas-poly posée sur un relief, la route qui relie les lieux et
 * une balise sur chacun d'eux. C'est ce qui transforme le déplacement en survol d'un monde plutôt
 * qu'en changement de diapositive.
 *
 * Les arbres sont dessinés en `InstancedMesh` : sept cents sapins ne coûtent que deux appels de
 * dessin. Ils s'écartent des clairières où se posent les lieux, sinon les cartes atterriraient au
 * milieu des branches.
 *
 * Trois précautions, parce qu'un décor ne doit jamais coûter le contenu :
 * - `three` est chargé à la demande, uniquement en mode aventure : le mode classique et le premier
 *   rendu ne paient rien (morceau séparé côté build) ;
 * - la scène n'est rendue que pendant les vols. Une fois posé sur un lieu, la carte est cachée
 *   derrière le contenu : on arrête de dessiner, le processeur graphique se repose ;
 * - `prefers-reduced-motion` désactive tout le décor.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MAP_POINTS, mapCamera } from '@/composables/useDeck'
import { useGame } from '@/composables/useGame'

const { deckActive } = useGame()

const canvas = ref(null)
/** Unités 3D par unité de carte : règle l'écart entre les lieux dans le monde. */
const WORLD = 16
const FLAT_RADIUS = 9 // rayon aplani autour d'un lieu, pour que la carte se pose sur une clairière

let renderer = null
let scene = null
let camera3d = null
let frame = 0
let disposeTheme = null
let stopped = false

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

/** Distance au lieu le plus proche : sert au terrain comme à l'implantation des arbres. */
function distanceToNearestPlace(x, z) {
  let nearest = Infinity
  for (const point of MAP_POINTS) {
    nearest = Math.min(nearest, Math.hypot(x - point.x * WORLD, z - point.y * WORLD))
  }
  return nearest
}

/** Hauteur du terrain, aplanie autour de chaque lieu. */
function heightAt(x, z) {
  let height = noise(x * 0.055, z * 0.055) * 7 + noise(x * 0.14, z * 0.14) * 2.4 - 3

  const nearest = distanceToNearestPlace(x, z)
  if (nearest < FLAT_RADIUS) height *= (nearest / FLAT_RADIUS) ** 2

  return height
}

async function start() {
  if (prefersReducedMotion() || !canvas.value) return

  const THREE = await import('three')
  if (stopped) return

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setSize(window.innerWidth, window.innerHeight, false)

  scene = new THREE.Scene()
  camera3d = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 400)

  // --- Relief -------------------------------------------------------------------------------
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
    new THREE.MeshBasicMaterial({ vertexColors: true, flatShading: true }),
  )
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
  const trunkMaterial = new THREE.MeshBasicMaterial()
  const crownMaterial = new THREE.MeshBasicMaterial()
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.16, 0.24, 1.1, 5),
    trunkMaterial,
    TREES,
  )
  const crowns = new THREE.InstancedMesh(new THREE.ConeGeometry(1.05, 3.4, 6), crownMaterial, TREES)

  /** Nuance de chaque sapin, conservée pour pouvoir repeindre la forêt au changement de thème. */
  const shades = []
  let planted = 0

  for (let i = 0; planted < TREES && i < TREES * 4; i += 1) {
    const x = (random(i, 1) - 0.5) * size
    const z = (random(i, 2) - 0.5) * size

    // On laisse la clairière libre : un lieu ne doit pas se poser dans les branches.
    if (distanceToNearestPlace(x, z) < FLAT_RADIUS + 2.5) continue

    const ground = heightAt(x, z)
    const scale = 0.65 + random(i, 3) * 0.9
    const turn = random(i, 4) * Math.PI * 2

    dummy.position.set(x, ground + 0.55 * scale, z)
    dummy.rotation.set(0, turn, 0)
    dummy.scale.setScalar(scale)
    dummy.updateMatrix()
    trunks.setMatrixAt(planted, dummy.matrix)

    dummy.position.setY(ground + 2.6 * scale)
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

  // --- Route et balises ---------------------------------------------------------------------
  const routePoints = MAP_POINTS.map(
    (point) =>
      new THREE.Vector3(
        point.x * WORLD,
        heightAt(point.x * WORLD, point.y * WORLD) + 0.6,
        point.y * WORLD,
      ),
  )
  const route = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(
      new THREE.CatmullRomCurve3(routePoints).getPoints(160),
    ),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }),
  )
  scene.add(route)

  const beacons = routePoints.map((point) => {
    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.5),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(cssColor('--app-primary-strong')) }),
    )
    beacon.position.copy(point).setY(point.y + 2.4)
    scene.add(beacon)
    return beacon
  })

  scene.fog = new THREE.Fog(new THREE.Color(cssColor('--app-background')), 70, 230)

  const repaint = () => {
    paint()
    paintForest()
    scene.fog.color.set(cssColor('--app-background'))
    for (const beacon of beacons) beacon.material.color.set(cssColor('--app-primary-strong'))
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
  const disposeResize = () => window.removeEventListener('resize', resize)

  const loop = () => {
    frame = requestAnimationFrame(loop)

    // Posé sur un lieu, la carte est masquée par le contenu : inutile de dessiner.
    const visibility = Math.min(1, Math.max(0, (1 - mapCamera.scale) * 2.4))
    canvas.value.style.opacity = String(visibility)
    if (visibility <= 0.001) return

    const altitude = 8 + (1 - mapCamera.scale) * 78
    const targetX = mapCamera.x * WORLD
    const targetZ = mapCamera.y * WORLD

    camera3d.position.set(targetX, altitude, targetZ + altitude * 0.72)
    camera3d.lookAt(targetX, 0, targetZ)
    camera3d.rotation.z += (mapCamera.rotate * Math.PI) / 180

    const time = performance.now() / 1000
    for (const [index, beacon] of beacons.entries()) {
      beacon.rotation.y = time * 0.8 + index
      beacon.position.y = routePoints[index].y + 2.4 + Math.sin(time * 1.6 + index) * 0.35
    }

    renderer.render(scene, camera3d)
  }

  loop()

  return () => {
    disposeResize()
    geometry.dispose()
  }
}

function stop() {
  stopped = true
  cancelAnimationFrame(frame)
  disposeTheme?.()
  renderer?.dispose()
  renderer = null
  scene = null
}

// `onMounted` et pas un `watch` immédiat au niveau du composant : le pré-rendu exécute `setup`,
// et tout ce fichier parle à `window`. Le serveur ne doit jamais entrer ici.
onMounted(() => {
  watch(
    deckActive,
    (active) => {
      if (active) {
        stopped = false
        start()
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
    v-show="deckActive"
    ref="canvas"
    class="pointer-events-none fixed inset-0 z-0 h-full w-full print:hidden"
    aria-hidden="true"
  ></canvas>
</template>
