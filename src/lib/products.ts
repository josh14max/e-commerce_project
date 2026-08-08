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
    id: 'w-amara',
    slug: 'perruque-amara-lisse',
    name: 'Perruque Amara — Lisse Mi-longue',
    category: 'wigs',
    universe: 'perruques',
    price: 45000,
    compareAtPrice: 55000,
    shortDescription: 'Lisse soyeuse, brillance naturelle, densité confort.',
    description:
      "Amara épouse votre quotidien avec sa chute lisse et lumineuse. Pensée pour un port prolongé, sa capillage fine épouse votre visage sans pression. Idéale pour retrouver une chevelure pleine de vie, au bureau comme en soirée.",
    images: [px(3993447), px(3993445), px(3993450)],
    texture: 'Lisse',
    length: 'Mi-longue',
    color: 'Noir',
    colors: ['Noir', 'Châtain', 'Auburn'],
    lengths: ['Courte', 'Mi-longue', 'Longue'],
    textures: ['Lisse', 'Ondulé'],
    badge: 'Best-seller',
    profiles: ['mode', 'perte'],
    featured: true,
  },
  {
    id: 'w-naomi',
    slug: 'perruque-naomi-afro-volumineuse',
    name: 'Perruque Naomi — Afro Volumineuse',
    category: 'wigs',
    universe: 'perruques',
    price: 55000,
    shortDescription: 'Volume afro assumé, texture naturelle, légèreté au port.',
    description:
      "Naomi célèbre la texture afro dans toute sa splendeur. Sa maille respirante et son volume maîtrisé vous accompagnent toute la journée. Une perruque pensée pour celles qui veulent porter leur héritage avec fierté et confort.",
    images: [px(1024311), px(1108066), px(1853595)],
    texture: 'Afro',
    length: 'Courte',
    color: 'Noir',
    colors: ['Noir', 'Brun foncé'],
    lengths: ['Courte', 'Mi-longue'],
    textures: ['Afro', 'Frison'],
    badge: 'Nouveau',
    profiles: ['afro', 'mode'],
    featured: true,
  },
  {
    id: 'w-selena',
    slug: 'perruque-selena-ondulee-longue',
    name: 'Perruque Selena — Ondulée Longue',
    category: 'wigs',
    universe: 'perruques',
    price: 75000,
    compareAtPrice: 89000,
    shortDescription: 'Ondulations souples, longueur glamour, tombé fluide.',
    description:
      "Selena enroule vos journées d'ondulations douces et romantiques. Sa longueur généreuse et son tombé fluide subliment chaque mouvement. Une perruque qui transforme un instant ordinaire en moment d'élégance.",
    images: [px(3992656), px(3992652), px(3992664)],
    texture: 'Ondulé',
    length: 'Longue',
    color: 'Châtain',
    colors: ['Châtain', 'Noir', 'Blond platine'],
    lengths: ['Mi-longue', 'Longue'],
    textures: ['Ondulé', 'Lisse'],
    profiles: ['mode', 'perte'],
    featured: true,
  },
  {
    id: 'w-yara',
    slug: 'perruque-yara-frison-court',
    name: 'Perruque Yara — Frison Court',
    category: 'wigs',
    universe: 'perruques',
    price: 38000,
    shortDescription: 'Coupe frison moderne, texture texturée, fraîcheur naturelle.',
    description:
      "Yara ose la coupe courte et texturée. Son frison maîtrisé apporte du caractère et de la légèreté. Parfaite pour celles qui veulent un changement franc, sans renoncer à la douceur.",
    images: [px(1853595), px(1024311), px(1108066)],
    texture: 'Frison',
    length: 'Courte',
    color: 'Brun foncé',
    colors: ['Brun foncé', 'Noir'],
    lengths: ['Courte'],
    textures: ['Frison', 'Afro'],
    profiles: ['afro', 'mode'],
  },
  {
    id: 'w-leila',
    slug: 'perruque-leila-tresses-collees',
    name: 'Perruque Leila — Tresses Collées',
    category: 'wigs',
    universe: 'perruques',
    price: 65000,
    shortDescription: 'Tresses collées fines, finition nette, style protecteur.',
    description:
      "Leila revisite les tresses collées en perruque protective style. Sa finition nette et son maintien doux respectent votre cuir chevelu. Une alternative élégante pour varier les styles tout en préservant vos cheveux.",
    images: [px(3762500), px(3762495), px(3762498)],
    texture: 'Tresses',
    length: 'Mi-longue',
    color: 'Noir',
    colors: ['Noir', 'Châtain'],
    lengths: ['Mi-longue', 'Longue'],
    textures: ['Tresses'],
    badge: 'Protective',
    profiles: ['afro', 'perte'],
  },
  {
    id: 'w-mira',
    slug: 'perruque-mira-bob-carre',
    name: 'Perruque Mira — Bob Carré',
    category: 'wigs',
    universe: 'perruques',
    price: 42000,
    shortDescription: 'Carré bob structuré, ligne nette, chic intemporel.',
    description:
      "Mira structure votre regard avec son carré bob précis. La ligne nette et la longueur mentonnière encadrent le visage avec élégance. Un classique revisité, pour un style affirmé sans effort.",
    images: [px(3993450), px(3993447), px(3993445)],
    texture: 'Lisse',
    length: 'Courte',
    color: 'Auburn',
    colors: ['Auburn', 'Noir', 'Châtain'],
    lengths: ['Courte'],
    textures: ['Lisse'],
    profiles: ['mode', 'perte'],
  },
  {
    id: 'w-ada',
    slug: 'perruque-ada-medical-douce',
    name: 'Perruque Ada — Confort Médical',
    category: 'wigs',
    universe: 'perruques',
    price: 48000,
    shortDescription: 'Capillage médical doux, sans couture, ultra-confort.',
    description:
      "Ada est pensée pour les femmes traversant une perte de cheveux liée à un traitement. Sa matière ultra-douce et son capillage sans couture épargnent les cuir chevelus sensibles. Conçue avec amour, pour vous sentir vous-même, partout.",
    images: [px(3992652), px(3992656), px(3992664)],
    texture: 'Lisse',
    length: 'Mi-longue',
    color: 'Châtain',
    colors: ['Châtain', 'Noir', 'Blond platine'],
    lengths: ['Courte', 'Mi-longue', 'Longue'],
    textures: ['Lisse', 'Ondulé'],
    badge: 'Confort',
    profiles: ['perte'],
  },
  {
    id: 'w-romy',
    slug: 'perruque-romy-blond-platine',
    name: 'Perruque Romy — Blond Platine Longue',
    category: 'wigs',
    universe: 'perruques',
    price: 95000,
    shortDescription: 'Blond platine éclatant, longueur sirène, glamour absolu.',
    description:
      "Romy illumine votre teint d'un blond platine lumineux. Sa longueur sirène et sa brillance soyeuse font de chaque sortie un événement. Pour celles qui n'ont pas peur d'être vues.",
    images: [px(3992664), px(3992656), px(3992652)],
    texture: 'Lisse',
    length: 'Longue',
    color: 'Blond platine',
    colors: ['Blond platine', 'Châtain'],
    lengths: ['Longue'],
    textures: ['Lisse', 'Ondulé'],
    profiles: ['mode'],
  },
  {
    id: 'w-kadi',
    slug: 'perruque-kadi-demi-perruque',
    name: 'Perruque Kadi — Demi-perruque Bouclée',
    category: 'wigs',
    universe: 'perruques',
    price: 35000,
    shortDescription: 'Demi-perruque légère, boucles définies, volume naturel.',
    description:
      "Kadi s'installe en un geste et densifie votre chevelure de boucles bien définies. Sa demi-perruque se fond dans vos cheveux naturels pour un effet invisible. Idéale pour un volume rapide sans contrainte.",
    images: [px(1108066), px(1853595), px(1024311)],
    texture: 'Ondulé',
    length: 'Mi-longue',
    color: 'Noir',
    colors: ['Noir', 'Châtain', 'Auburn'],
    lengths: ['Mi-longue', 'Longue'],
    textures: ['Ondulé', 'Frison'],
    profiles: ['mode', 'afro'],
  },
  {
    id: 'w-zara',
    slug: 'perruque-zara-longue-raide',
    name: 'Perruque Zara — Longue Raide Naturelle',
    category: 'wigs',
    universe: 'perruques',
    price: 120000,
    compareAtPrice: 145000,
    shortDescription: 'Raide soyeux premium, longueur dos, brillance miroir.',
    description:
      "Zara déploie sa cascade raide jusqu'au bas du dos. Sa fibre premium imite la fibre naturelle avec un réalisme troublant. Une perruque d'exception pour celles qui veulent marquer les esprits.",
    images: [px(3993445), px(3993450), px(3993447)],
    texture: 'Lisse',
    length: 'Longue',
    color: 'Noir',
    colors: ['Noir', 'Châtain', 'Blond platine'],
    lengths: ['Longue'],
    textures: ['Lisse'],
    badge: 'Premium',
    profiles: ['mode'],
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
export const WIG_LENGTHS = ['Courte', 'Mi-longue', 'Longue'];
export const WIG_COLORS = ['Noir', 'Châtain', 'Auburn', 'Brun foncé', 'Blond platine'];
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
