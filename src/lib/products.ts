import type { Product } from './types';

const px = (id: number, w = 800, h = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

export const FREE_SHIPPING_THRESHOLD = 30000;
export const SHIPPING_COST = 3000;

export const PRODUCTS: Product[] = [
  // ───────────────────────── PERRUQUES (30 000 – 200 000 FCFA) ─────────────────────────
  {
    id: 'w-jade',
    slug: 'perruque-jade-emeraude',
    name: 'Perruque Jade — Ondulée Émeraude',
    category: 'wigs',
    universe: 'perruques',
    price: 58000,
    compareAtPrice: 68000,
    shortDescription: 'Vert émeraude profond, racines dégradées, ondulations glamour.',
    description:
      "Jade ose la couleur avec élégance : un vert émeraude intense qui s'éclaircit en dégradé depuis des racines naturelles. Ses ondulations souples et son lace front finement plumé offrent un résultat spectaculaire, pour celles qui veulent se démarquer sans compromis sur le naturel de l'implantation.",
    images: ['/perruques/perruque-jade-emeraude.jpg'],
    texture: 'Ondulé',
    length: 'Longue',
    color: 'Émeraude',
    colors: ['Émeraude', 'Noir', 'Bordeaux'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Ondulé'],
    badge: 'Nouveau',
    profiles: ['mode'],
    featured: true,
  },
  {
    id: 'w-scarlett',
    slug: 'perruque-scarlett-bordeaux',
    name: 'Perruque Scarlett — Lisse Bordeaux',
    category: 'wigs',
    universe: 'perruques',
    price: 52000,
    shortDescription: 'Rouge bordeaux profond, chute lisse et brillante.',
    description:
      "Scarlett affirme un rouge bordeaux riche et lumineux, porté par une chute parfaitement lisse. Coiffée en demi-attache ou lâchée, elle capte la lumière à chaque mouvement. Une couleur affirmée pour celles qui n'ont pas peur d'attirer les regards.",
    images: ['/perruques/perruque-scarlett-bordeaux.jpg'],
    texture: 'Lisse',
    length: 'Longue',
    color: 'Bordeaux',
    colors: ['Bordeaux', 'Noir', 'Auburn', 'Châtain'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Lisse'],
    badge: 'Nouveau',
    profiles: ['mode'],
  },
  {
    id: 'w-imani',
    slug: 'perruque-imani-carre-lisse',
    name: 'Perruque Imani — Carré Lisse',
    category: 'wigs',
    universe: 'perruques',
    price: 42000,
    shortDescription: 'Carré noir intense, coupe nette, brillance miroir.',
    description:
      "Imani revisite le carré classique avec une coupe nette et une brillance miroir. Sa densité généreuse et sa raie modulable en font une base polyvalente, parfaite au quotidien comme pour un look plus sophistiqué en un geste.",
    images: ['/perruques/perruque-imani-carre-noir.jpg'],
    texture: 'Lisse',
    length: 'Courte',
    color: 'Noir',
    colors: ['Noir', 'Châtain', 'Brun foncé'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Lisse'],
    profiles: ['mode', 'perte'],
  },
  {
    id: 'w-zaria',
    slug: 'perruque-zaria-ondulee-longue',
    name: 'Perruque Zaria — Ondulée Longue',
    category: 'wigs',
    universe: 'perruques',
    price: 46000,
    shortDescription: 'Noir profond à reflets chauds, ondulations souples et longues.',
    description:
      "Zaria déroule de longues ondulations souples, dans un noir profond réchauffé de reflets subtils. Une chevelure généreuse et vivante, pensée pour un port confortable même en longueur, avec un tombé naturel du début à la pointe.",
    images: ['/perruques/perruque-zaria-ondulee-noir.jpg'],
    texture: 'Ondulé',
    length: 'Longue',
    color: 'Noir',
    colors: ['Noir', 'Brun foncé', 'Châtain'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Ondulé'],
    profiles: ['afro', 'mode'],
  },
  {
    id: 'w-yasmine',
    slug: 'perruque-yasmine-lisse-longue',
    name: 'Perruque Yasmine — Lisse Longue',
    category: 'wigs',
    universe: 'perruques',
    price: 46000,
    compareAtPrice: 54000,
    shortDescription: 'Noir intense, chute lisse XXL, brillance soyeuse.',
    description:
      "Yasmine, c'est la longueur assumée : une chevelure lisse et soyeuse qui descend jusqu'au bas du dos, dans un noir profond et uniforme. Sa texture fine et sa légèreté en font une perruque qui se porte toute la journée sans jamais peser.",
    images: ['/perruques/perruque-yasmine-lisse-noir.jpg'],
    texture: 'Lisse',
    length: 'Longue',
    color: 'Noir',
    colors: ['Noir', 'Châtain', 'Auburn'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Lisse'],
    badge: 'Best-seller',
    profiles: ['mode', 'perte'],
    featured: true,
  },
  {
    id: 'w-aria',
    slug: 'perruque-aria-frange-grise',
    name: 'Perruque Aria — Frange Grise',
    category: 'wigs',
    universe: 'perruques',
    price: 56000,
    shortDescription: 'Gris cendré moderne, frange structurée, mèches lissées.',
    description:
      "Aria mise sur un gris cendré sophistiqué et une frange structurée qui encadre le visage. Coupe dégradée sur les longueurs pour un mouvement naturel — une teinte tendance qui change tout sans jamais paraître artificielle.",
    images: ['/perruques/perruque-aria-frange-grise.jpg'],
    texture: 'Lisse',
    length: 'Mi-longue',
    color: 'Gris argenté',
    colors: ['Gris argenté', 'Blond platine', 'Noir'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Lisse'],
    badge: 'Nouveau',
    profiles: ['mode'],
  },
  {
    id: 'w-kessy',
    slug: 'perruque-kessy-balayage-miel',
    name: 'Perruque Kessy — Ondulée Balayage',
    category: 'wigs',
    universe: 'perruques',
    price: 54000,
    shortDescription: 'Balayage miel vers châtain, ondulations souples et lumineuses.',
    description:
      "Kessy joue le dégradé le plus demandé du moment : des racines miel lumineuses qui filent vers un châtain profond en pointes. Ses ondulations amples donnent du mouvement à chaque mèche, pour un effet salon sans détour.",
    images: ['/perruques/perruque-kessy-balayage.jpg'],
    texture: 'Ondulé',
    length: 'Longue',
    color: 'Miel',
    colors: ['Miel', 'Châtain', 'Auburn'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Ondulé'],
    badge: 'Tendance',
    profiles: ['mode'],
    featured: true,
  },
  {
    id: 'w-kiara',
    slug: 'perruque-kiara-rose',
    name: 'Perruque Kiara — Carré Rose',
    category: 'wigs',
    universe: 'perruques',
    price: 59000,
    shortDescription: 'Rose pastel, carré ondulé, frange effilée sur le côté.',
    description:
      "Kiara assume la couleur fantaisie avec un rose délicat et lumineux. Son carré ondulé et sa frange effilée créent un look à la fois doux et affirmé, idéal pour un événement ou pour changer totalement de style le temps d'une soirée.",
    images: ['/perruques/perruque-kiara-rose.jpg'],
    texture: 'Ondulé',
    length: 'Courte',
    color: 'Rose',
    colors: ['Rose', 'Blond platine', 'Noir'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Ondulé'],
    badge: 'Nouveau',
    profiles: ['mode'],
  },
  {
    id: 'w-ivy',
    slug: 'perruque-ivy-platine',
    name: 'Perruque Ivy — Lisse Platine',
    category: 'wigs',
    universe: 'perruques',
    price: 50000,
    shortDescription: 'Blond platine froid, chute lisse XXL, racine parfaite.',
    description:
      "Ivy, c'est le blond platine dans toute sa pureté : une chevelure lisse et dense qui tombe jusqu'à la taille, avec une implantation qui suit la ligne naturelle du crâne. Une transformation totale, sans le moindre entretien de coloration.",
    images: ['/perruques/perruque-ivy-platine.jpg'],
    texture: 'Lisse',
    length: 'Longue',
    color: 'Blond platine',
    colors: ['Blond platine', 'Noir', 'Châtain'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Lisse'],
    profiles: ['mode'],
  },
  {
    id: 'w-luna',
    slug: 'perruque-luna-argentee',
    name: 'Perruque Luna — Ondulée Argentée',
    category: 'wigs',
    universe: 'perruques',
    price: 58000,
    compareAtPrice: 66000,
    shortDescription: 'Gris argenté glamour, volume XXL, ondulations hollywoodiennes.',
    description:
      "Luna déploie un volume spectaculaire en gris argenté lumineux, avec des ondulations amples façon glamour hollywoodien. Une perruque statement pour les occasions où on ne veut vraiment pas passer inaperçue.",
    images: ['/perruques/perruque-luna-argentee.jpg'],
    texture: 'Ondulé',
    length: 'Longue',
    color: 'Gris argenté',
    colors: ['Gris argenté', 'Blond platine', 'Noir'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Ondulé'],
    badge: 'Tendance',
    profiles: ['mode'],
    featured: true,
  },
  {
    id: 'w-camille',
    slug: 'perruque-camille-chatain',
    name: 'Perruque Camille — Ondulée Châtain',
    category: 'wigs',
    universe: 'perruques',
    price: 44000,
    shortDescription: 'Châtain chaud acajou, ondulations souples, teinte naturelle.',
    description:
      "Camille propose un châtain chaud aux reflets acajou, dans une teinte qui se fond parfaitement dans une carnation naturelle. Ses ondulations discrètes apportent du corps sans excès, pour un rendu élégant au quotidien.",
    images: ['/perruques/perruque-camille-chatain.jpg'],
    texture: 'Ondulé',
    length: 'Longue',
    color: 'Châtain',
    colors: ['Châtain', 'Auburn', 'Brun foncé'],
    lengths: ['12', '16', '20', '22', '28', '30', '32'],
    textures: ['Ondulé'],
    profiles: ['mode', 'afro'],
  },
];


export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeatured(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function getByCategory(category: 'wigs' | 'clothing'): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export const WIG_TEXTURES = ['Lisse', 'Ondulé', 'Afro', 'Frison', 'Tresses'];
export const WIG_LENGTHS = ['12', '16', '20', '22', '28', '30', '32'];

// Supplément ajouté au prix de base selon la taille choisie (en FCFA).
// Plus la taille est grande, plus le supplément est élevé — ajustable ici,
// un seul endroit pour toutes les perruques du site.
export const SIZE_PRICE_SUPPLEMENT: Record<string, number> = {
  '12': 0,
  '16': 2000,
  '20': 4000,
  '22': 6000,
  '28': 9000,
  '30': 11000,
  '32': 13000,
};

export function getPriceForSize(basePrice: number, size?: string): number {
  if (!size) return basePrice;
  return basePrice + (SIZE_PRICE_SUPPLEMENT[size] ?? 0);
}
export const WIG_COLORS = ['Noir', 'Châtain', 'Auburn', 'Brun foncé', 'Blond platine', 'Bordeaux', 'Émeraude', 'Gris argenté', 'Rose', 'Miel'];
export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const CLOTHING_COLORS = [
  'Fauve',
  'Écru',
  'Vert sauge',
  'Sable',
  'Noir',
  'Terracotta',
  'Émeraude',
  'Bordeaux',
  'Indigo',
  'Terre',
  'Cuivre',
  'Multicolore',
  'Poudre',
];
