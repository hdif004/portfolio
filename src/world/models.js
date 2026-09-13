/**
 * Catalogue des modèles 3D.
 *
 * Une clé courte par modèle, utilisée partout ailleurs : changer de fichier (un autre kit Kenney,
 * un modèle Poly Pizza) ne touche que cette table.
 *
 * `scale` ramène le modèle à l'échelle du monde (≈ mètres). Les deux kits Kenney ne sont pas
 * exportés à la même échelle : un sapin du Nature Kit mesure 1,5 unité, un établi du Survival Kit
 * 0,3. On corrige une fois ici, et `scenery.js` raisonne ensuite en tailles réelles.
 *
 * Sources (licence CC0, voir `public/models/*\/LICENSE.txt`) :
 * - https://kenney.nl/assets/nature-kit
 * - https://kenney.nl/assets/survival-kit
 */
const BASE = `${import.meta.env.BASE_URL}models`

const NATURE = 3.2
const SURVIVAL = 7

const nature = (file) => ({ url: `${BASE}/nature/${file}.glb`, scale: NATURE })
const survival = (file) => ({ url: `${BASE}/survival/${file}.glb`, scale: SURVIVAL })

export const MODELS = {
  // --- Forêt ---
  pineTallA: nature('tree_pineTallA'),
  pineTallB: nature('tree_pineTallB'),
  pineRound: nature('tree_pineRoundC'),
  pineDefault: nature('tree_pineDefaultA'),
  treeDefault: nature('tree_default'),
  treeOak: nature('tree_oak'),

  // --- Sol ---
  pathStone: nature('path_stone'),
  rockLarge: nature('rock_largeA'),
  bushLarge: nature('plant_bushLarge'),
  stump: nature('stump_round'),
  mushrooms: nature('mushroom_redGroup'),
  grass: nature('grass_large'),
  flowers: nature('flower_yellowA'),

  // --- Campement ---
  tent: nature('tent_detailedOpen'),
  campfireStones: nature('campfire_stones'),
  campfireLogs: nature('campfire_logs'),
  logLarge: nature('log_large'),
  logStack: nature('log_stack'),
  tentCanvas: survival('tent-canvas'),
  campfirePit: survival('campfire-pit'),
  bedroll: survival('bedroll'),
  bedrollPacked: survival('bedroll-packed'),
  bucket: survival('bucket'),
  barrel: survival('barrel'),
  chest: survival('chest'),

  // --- Atelier, chantier, bifurcation ---
  workbench: survival('workbench'),
  workbenchAnvil: survival('workbench-anvil'),
  workbenchGrind: survival('workbench-grind'),
  toolAxe: survival('tool-axe'),
  toolPickaxe: survival('tool-pickaxe'),
  boxLarge: survival('box-large'),
  boxOpen: survival('box-open'),
  resourcePlanks: survival('resource-planks'),
  resourceWood: survival('resource-wood'),
  resourceStone: survival('resource-stone-large'),
  structure: survival('structure'),
  structureCanvas: survival('structure-canvas'),
  signpost: survival('signpost'),
  signpostSingle: survival('signpost-single'),

  /**
   * L'avatar : à fournir en `public/models/avatar.glb` (personnage low-poly, pieds à y = 0, face
   * vers +z, hauteur d'environ 1 unité — sinon ajuster `scale`). Tant qu'il manque, la zone
   * s'affiche sans lui plutôt que d'échouer.
   */
  avatar: { url: `${BASE}/avatar.glb`, scale: 1.8, optional: true },
}
