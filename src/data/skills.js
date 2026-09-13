/**
 * Compétences techniques.
 *
 * Extraites du composant pour être partagées : la section classique les présente en cartes, le
 * panneau du mode aventure en inventaire. Deux présentations, une seule source — sans quoi
 * l'inventaire finirait par mentir sur ce que dit le portfolio.
 *
 * Les libellés sont des noms propres d'outils : ils ne sont pas traduits. Seuls les titres et
 * légendes de groupes passent par l'i18n.
 */
import {
  Boxes,
  Code2,
  Container,
  FileCode,
  Gauge,
  GitBranch,
  Globe,
  LayoutDashboard,
  PenTool,
  Server,
  Settings2,
  ShoppingBag,
  Terminal,
} from 'lucide-vue-next'

export const SKILL_GROUPS = [
  {
    id: 'daily',
    titleKey: 'skills.categories.daily',
    captionKey: 'skills.captions.daily',
    items: [
      { name: 'Shopify', icon: ShoppingBag },
      { name: 'Liquid', icon: FileCode },
      { name: 'JavaScript', icon: FileCode },
      { name: 'Tailwind CSS', icon: LayoutDashboard },
      { name: 'WordPress / WooCommerce', icon: Globe },
      { name: 'SEO & performance', icon: Gauge },
      { name: 'Git', icon: GitBranch },
    ],
  },
  {
    id: 'solid',
    titleKey: 'skills.categories.solid',
    captionKey: 'skills.captions.solid',
    items: [
      { name: 'Vue.js', icon: Code2 },
      { name: 'PHP', icon: FileCode },
      { name: 'Strapi', icon: Server },
      { name: 'Bootstrap', icon: Boxes },
      { name: 'Shopify CLI', icon: Terminal },
    ],
  },
  {
    id: 'learning',
    titleKey: 'skills.categories.learning',
    captionKey: 'skills.captions.learning',
    items: [
      { name: 'React.js', icon: Code2 },
      { name: 'Symfony', icon: Settings2 },
      { name: 'Python', icon: Terminal },
      { name: 'Docker', icon: Container },
      { name: 'Figma', icon: PenTool },
    ],
  },
]
