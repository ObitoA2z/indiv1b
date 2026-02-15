export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  shipping: number;
  image: string;
  images?: string[];
  category: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerReviews: number;
  location: string;
  status: 'available' | 'pending' | 'sold';
  createdAt: string;
  priceHistory?: { price: number; date: string }[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export const categories: Category[] = [
  { id: 'grimoires', name: 'Citrouilles maudites' },
  { id: 'poupees-hantees', name: 'Visages possedes' },
  { id: 'affiches-horreur', name: 'Citrouilles peintes' },
  { id: 'masques-rituels', name: 'Masques de peste' },
  { id: 'vinyles-hantes', name: 'Grimoires arachnides' },
  { id: 'photographies-paranormales', name: 'Scenes macabres' },
  { id: 'objets-maudits', name: 'Araignees decoratives' },
  { id: 'figurines-macabres', name: 'Enseignes fantomes' }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Citrouille grimacante - Veille de Samhain',
    description:
      'Citrouille sculptee main avec expression agressive, ideale pour decorer une entree de maison hantee.',
    price: 49.0,
    shipping: 7.0,
    image: 'https://picsum.photos/seed/epouvante-101/1200/900',
    category: 'grimoires',
    sellerId: 's1',
    sellerName: 'ArchivisteNoir',
    sellerRating: 4.9,
    sellerReviews: 62,
    location: 'Paris',
    status: 'available',
    createdAt: '2025-10-21',
    priceHistory: [
      { price: 59.0, date: '2025-10-12' },
      { price: 49.0, date: '2025-10-21' }
    ]
  },
  {
    id: '2',
    title: 'Citrouille possedee - Edition rouge',
    description:
      'Citrouille de decoration avec reliefs tres marques et teinte sombre pour une ambiance agressive.',
    price: 64.0,
    shipping: 9.0,
    image: 'https://picsum.photos/seed/epouvante-102/1200/900',
    category: 'poupees-hantees',
    sellerId: 's2',
    sellerName: 'MaisonEtrange',
    sellerRating: 4.8,
    sellerReviews: 91,
    location: 'Lyon',
    status: 'available',
    createdAt: '2025-10-23'
  },
  {
    id: '3',
    title: 'Lot de mini-citrouilles peintes - Trio noir',
    description:
      'Trois petites citrouilles customisees a la craie pour deco de table ou stand epouvante.',
    price: 29.0,
    shipping: 6.0,
    image: 'https://picsum.photos/seed/epouvante-103/1200/900',
    category: 'affiches-horreur',
    sellerId: 's3',
    sellerName: 'CineNoir',
    sellerRating: 4.7,
    sellerReviews: 103,
    location: 'Bordeaux',
    status: 'available',
    createdAt: '2025-10-25'
  },
  {
    id: '4',
    title: 'Masque bec de peste - Replique theatrale',
    description:
      'Masque style medecin de peste en tissu patine, parfait pour costume et decor photo sombre.',
    price: 85.0,
    shipping: 11.0,
    image: 'https://picsum.photos/seed/epouvante-104/1200/900',
    category: 'masques-rituels',
    sellerId: 's4',
    sellerName: 'BoisAncestral',
    sellerRating: 4.9,
    sellerReviews: 48,
    location: 'Marseille',
    status: 'available',
    createdAt: '2025-10-27'
  },
  {
    id: '5',
    title: "Livre decoratif 'Arachnids' - Couverture relief",
    description:
      'Faux grimoire avec araignee en relief pour bibliotheque gothique et vitrine epouvante.',
    price: 72.0,
    shipping: 10.0,
    image: 'https://picsum.photos/seed/epouvante-105/1200/900',
    category: 'vinyles-hantes',
    sellerId: 's5',
    sellerName: 'AiguilleNoire',
    sellerRating: 4.6,
    sellerReviews: 77,
    location: 'Toulouse',
    status: 'available',
    createdAt: '2025-10-28'
  },
  {
    id: '6',
    title: 'Mise en scene cuisine macabre - Duo visages',
    description:
      'Accessoire photo humoristique et angoissant avec couteau factice et pommes de terre illustrees.',
    price: 19.0,
    shipping: 5.0,
    image: 'https://picsum.photos/seed/epouvante-106/1200/900',
    category: 'photographies-paranormales',
    sellerId: 's6',
    sellerName: 'ObscuraLab',
    sellerRating: 4.8,
    sellerReviews: 132,
    location: 'Nantes',
    status: 'available',
    createdAt: '2025-10-18'
  },
  {
    id: '7',
    title: 'Araignee textile rouge - Decoration porte',
    description:
      'Araignee artisanale en tissu et fils chenille, legere et facile a suspendre pour Halloween.',
    price: 14.0,
    shipping: 4.0,
    image: 'https://picsum.photos/seed/epouvante-107/1200/900',
    category: 'objets-maudits',
    sellerId: 's7',
    sellerName: 'AtelierOcculte',
    sellerRating: 4.5,
    sellerReviews: 58,
    location: 'Lille',
    status: 'pending',
    createdAt: '2025-10-29'
  },
  {
    id: '8',
    title: "Enseigne 'BOO' et fantomes - Jardin",
    description:
      'Decoration exterieure grand format avec lettres orange et silhouettes de fantomes blanches.',
    price: 39.0,
    shipping: 8.0,
    image: 'https://picsum.photos/seed/epouvante-108/1200/900',
    category: 'figurines-macabres',
    sellerId: 's8',
    sellerName: 'CryptaWorks',
    sellerRating: 4.7,
    sellerReviews: 69,
    location: 'Strasbourg',
    status: 'available',
    createdAt: '2025-10-30'
  }
];
