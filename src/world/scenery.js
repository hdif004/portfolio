/**
 * Le décor : ce qui est posé dans chaque zone, et comment la forêt est peuplée.
 *
 * Les positions d'une zone sont locales, en mètres, avec l'avant de la zone vers +z : la zone est
 * ensuite tournée face à sa caméra (voir `WorldZone`). Placer un objet en `z` positif, c'est donc
 * toujours le mettre au premier plan, quelle que soit la zone.
 *
 * `scale` multiplie l'échelle de base du modèle (voir `models.js`). `rotation` est en radians, autour
 * de la verticale.
 */
import { MODELS } from './models'

/** Grossissement des zones : vues de haut, des objets à l'échelle humaine se lisent comme des taches. */
export const ZONE_SCALE = 1.1

const prop = (model, position, { rotation = 0, scale = 1 } = {}) => ({
  model,
  position,
  rotation,
  scale,
})

export const SCENERY = {
  /** Le campement : l'avatar accueille le visiteur devant le feu. */
  hero: {
    props: [
      prop('campfireStones', [0, 0, 0], { scale: 1.1 }),
      prop('campfireLogs', [0, 0.05, 0], { scale: 1.8 }),
      prop('tent', [-4.6, 0, -3.2], { rotation: 0.6, scale: 1.7 }),
      prop('logLarge', [2.5, 0, 0.9], { rotation: 1.9, scale: 0.75 }),
      prop('logLarge', [-2.3, 0, 1.6], { rotation: -1.1, scale: 0.75 }),
      prop('logLarge', [0.6, 0, -2.4], { rotation: 0.15, scale: 0.75 }),
      prop('logStack', [4.6, 0, -2.6], { rotation: -0.4, scale: 1.3 }),
      prop('bedroll', [-1.6, 0, -3.6], { rotation: 0.25, scale: 0.55 }),
      prop('barrel', [4.4, 0, 2.2], { scale: 0.4 }),
      prop('chest', [5.2, 0, 0.3], { rotation: -1.2, scale: 0.55 }),
      prop('mushrooms', [-5.6, 0, 2.6], { scale: 1.6 }),
      prop('flowers', [3.4, 0, 4.4], { scale: 2.5 }),
      prop('flowers', [-3.8, 0, 4.8], { rotation: 1, scale: 2.2 }),
      prop('avatar', [1.6, 0, 2.6], { rotation: 0.3 }),
    ],
    fires: [{ position: [0, 1.1, 0], intensity: 30, distance: 18 }],
    anchors: {
      avatar: [1.6, 1.8, 2.6],
      fire: [0, 0.6, 0],
      tent: [-4.6, 2, -3.2],
      logs: [4.6, 0.8, -2.6],
    },
  },

  /** Mon histoire : un abri de toile et le coffre des souvenirs. */
  about: {
    props: [
      prop('structureCanvas', [0, 0, -0.6], { scale: 1.35 }),
      prop('chest', [1.4, 0, 1.3], { rotation: -0.5, scale: 0.6 }),
      prop('barrel', [-2, 0, 0.4], { scale: 0.4 }),
      prop('stump', [-1.2, 0, 2.2], { scale: 1.4 }),
      prop('logStack', [2.6, 0, -1.4], { rotation: 0.8, scale: 1.1 }),
      prop('bushLarge', [-3, 0, -2], { scale: 2.2 }),
      prop('mushrooms', [2.8, 0, 2.4], { scale: 1.4 }),
    ],
    anchors: {
      shelter: [0, 2.5, -0.6],
      chest: [1.4, 0.8, 1.3],
      stump: [-1.2, 0.6, 2.2],
    },
  },

  /** Compétences : l'atelier et ses outils. */
  skills: {
    props: [
      prop('workbench', [0, 0, 0], { scale: 1.15 }),
      prop('workbenchAnvil', [-2.6, 0, 0.5], { rotation: 0.35 }),
      prop('workbenchGrind', [2.6, 0, 0.3], { rotation: -0.35 }),
      prop('toolAxe', [1.1, 0, 2.1], { rotation: 0.6, scale: 0.55 }),
      prop('boxLarge', [-2, 0, -2], { rotation: 0.2, scale: 0.8 }),
      prop('resourcePlanks', [2, 0, -2], { rotation: -0.5, scale: 0.9 }),
      prop('resourceWood', [-0.6, 0, 2.4], { rotation: 1.2, scale: 1.3 }),
    ],
    anchors: {
      bench: [0, 1.3, 0],
      anvil: [-2.6, 1.2, 0.5],
      grind: [2.6, 1.2, 0.3],
    },
  },

  /** Projets : le chantier. */
  projects: {
    props: [
      prop('structure', [-0.6, 0, -1], { scale: 1.2 }),
      prop('boxLarge', [2, 0, 0.6], { rotation: 0.4, scale: 0.9 }),
      prop('boxOpen', [2.6, 0, -1.4], { rotation: -0.3, scale: 0.9 }),
      prop('barrel', [0.4, 0, 2], { scale: 0.4 }),
      prop('resourceWood', [-2.8, 0, 1.2], { rotation: 0.4, scale: 1.3 }),
      prop('resourceStone', [2.8, 0, 2.4], { scale: 0.9 }),
      prop('toolPickaxe', [-0.8, 0, 2.6], { rotation: -0.4, scale: 0.6 }),
      prop('logLarge', [-3.2, 0, -1.6], { rotation: 0.5, scale: 0.7 }),
    ],
    anchors: {
      crateLarge: [2, 0.8, 0.6],
      crateOpen: [2.6, 1, -1.4],
    },
  },

  /** La bifurcation : le poteau indicateur. */
  banner: {
    props: [
      prop('signpost', [0, 0, 0], { scale: 1.25 }),
      prop('rockLarge', [-2.2, 0, 0.8], { rotation: 0.4, scale: 1.1 }),
      prop('stump', [1.8, 0, 1.2], { scale: 1.3 }),
      prop('bushLarge', [2.2, 0, -1.4], { scale: 2.2 }),
      prop('flowers', [-0.8, 0, 2], { scale: 2 }),
    ],
    anchors: {
      sign: [0, 4, 0],
    },
  },

  /** Contact : le campement où l'on se retrouve. */
  footer: {
    props: [
      prop('tentCanvas', [-2.8, 0, -0.2], { rotation: 0.4 }),
      prop('tentCanvas', [2.8, 0, -0.4], { rotation: -0.4 }),
      prop('campfirePit', [0, 0, 1.4]),
      prop('bedrollPacked', [1.4, 0, 2.8], { rotation: 0.5 }),
      prop('bucket', [-1.4, 0, 2.6], { scale: 0.6 }),
      prop('signpostSingle', [0, 0, -2.6], { scale: 0.9 }),
    ],
    fires: [{ position: [0, 0.8, 1.4], intensity: 16, distance: 12 }],
    anchors: {
      sign: [0, 2.2, -2.6],
      tentLeft: [-2.8, 1.6, -0.2],
      tentRight: [2.8, 1.6, -0.4],
      fire: [0, 0.4, 1.4],
      bedroll: [1.4, 0.3, 2.8],
    },
  },
}

/** Essences de la forêt et leur fréquence relative. Les résineux dominent : c'est une forêt de montagne. */
export const TREES = [
  { model: 'pineTallA', weight: 3 },
  { model: 'pineTallB', weight: 2 },
  { model: 'pineRound', weight: 2 },
  { model: 'pineDefault', weight: 2 },
  { model: 'treeDefault', weight: 1 },
  { model: 'treeOak', weight: 1 },
]

export const TREE_COUNT = 650

/** Petits éléments semés au sol, en lisière et entre les arbres. */
export const GROUND_COVER = [
  { model: 'rockLarge', weight: 1, scale: [0.6, 1.3], castShadow: true },
  { model: 'bushLarge', weight: 3, scale: [1.2, 2.2], castShadow: true },
  { model: 'stump', weight: 1, scale: [0.9, 1.4], castShadow: true },
  { model: 'mushrooms', weight: 1, scale: [1, 1.6], castShadow: false },
  { model: 'grass', weight: 4, scale: [1.2, 2], castShadow: false },
  { model: 'flowers', weight: 2, scale: [1.5, 2.5], castShadow: false },
]

export const GROUND_COVER_COUNT = 420

/** Toutes les clés à précharger avant d'afficher le monde. L'avatar, facultatif, n'en fait pas partie. */
export const WORLD_MODELS = [
  ...new Set([
    ...Object.values(SCENERY).flatMap((zone) => zone.props.map((item) => item.model)),
    ...TREES.map((tree) => tree.model),
    ...GROUND_COVER.map((cover) => cover.model),
    'pathStone',
  ]),
].filter((key) => !MODELS[key].optional)
