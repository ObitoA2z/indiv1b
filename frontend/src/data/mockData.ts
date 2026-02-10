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
  { id: 'grimoires', name: 'Grimoires' },
  { id: 'poupees-hantees', name: 'Poupees hantees' },
  { id: 'affiches-horreur', name: "Affiches d'horreur" },
  { id: 'masques-rituels', name: 'Masques rituels' },
  { id: 'vinyles-hantes', name: 'Vinyles hantes' },
  { id: 'photographies-paranormales', name: 'Photographies paranormales' },
  { id: 'objets-maudits', name: 'Objets maudits' },
  { id: 'figurines-macabres', name: 'Figurines macabres' }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    title: "Grimoire d'initiation - Edition 1897",
    description:
      "Grimoire ancien reliure cuir, pages intactes, annotations d'initie en marge. Ideal pour les rituels de protection et les recherches occultes.",
    price: 240.0,
    shipping: 12.0,
    image:
      'https://images.unsplash.com/photo-1455885666463-2d0c55f91a8f?auto=format&fit=crop&w=1080&q=80',
    category: 'grimoires',
    sellerId: 's1',
    sellerName: 'ArchivisteNoir',
    sellerRating: 4.9,
    sellerReviews: 62,
    location: 'Paris',
    status: 'available',
    createdAt: '2024-12-01',
    priceHistory: [
      { price: 280.0, date: '2024-11-20' },
      { price: 240.0, date: '2024-12-01' }
    ]
  },
  {
    id: '2',
    title: "Poupee de porcelaine 'Eloise' - Soupirs nocturnes",
    description:
      "Poupee ancienne, porcelaine intacte, robe d'origine. Vendue avec certificat d'authenticite et notes du collectionneur.",
    price: 320.0,
    shipping: 18.0,
    image:
      'https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=1080&q=80',
    category: 'poupees-hantees',
    sellerId: 's2',
    sellerName: 'MaisonEtrange',
    sellerRating: 4.8,
    sellerReviews: 91,
    location: 'Lyon',
    status: 'available',
    createdAt: '2024-11-28'
  },
  {
    id: '3',
    title: "Affiche originale - La Nuit des Ombres (1964)",
    description:
      "Affiche cinema originale, format 120x160 cm. Papier d'epoque, couleurs conservees. Piece rare pour amateurs d'horreur classique.",
    price: 680.0,
    shipping: 22.0,
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1080&q=80',
    category: 'affiches-horreur',
    sellerId: 's3',
    sellerName: 'CineNoir',
    sellerRating: 4.7,
    sellerReviews: 103,
    location: 'Bordeaux',
    status: 'available',
    createdAt: '2024-12-02'
  },
  {
    id: '4',
    title: 'Masque rituel en bois - Cercle de Sologne',
    description:
      "Masque sculpte main, patine d'origine, traces d'encens. Objet destine a l'exposition ou aux rituels theatrises.",
    price: 210.0,
    shipping: 14.0,
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80',
    category: 'masques-rituels',
    sellerId: 's4',
    sellerName: 'BoisAncestral',
    sellerRating: 4.9,
    sellerReviews: 48,
    location: 'Marseille',
    status: 'available',
    createdAt: '2024-11-25'
  },
  {
    id: '5',
    title: "Vinyle hante - Bande originale 'Le Manoir' (1978)",
    description:
      "Pressage d'epoque, pochette en bon etat, disque ecoute et nettoye. Sonorites sombres, ambiance de manoir abandonne.",
    price: 160.0,
    shipping: 8.0,
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1080&q=80',
    category: 'vinyles-hantes',
    sellerId: 's5',
    sellerName: 'AiguilleNoire',
    sellerRating: 4.6,
    sellerReviews: 77,
    location: 'Toulouse',
    status: 'available',
    createdAt: '2024-11-30'
  },
  {
    id: '6',
    title: 'Photographie argentique - Apparition du couloir Nord',
    description:
      "Tirage argentique authentifie, leger grain d'epoque. La silhouette en fond apparait sur la serie complete.",
    price: 390.0,
    shipping: 16.0,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1080&q=80',
    category: 'photographies-paranormales',
    sellerId: 's6',
    sellerName: 'ObscuraLab',
    sellerRating: 4.8,
    sellerReviews: 132,
    location: 'Nantes',
    status: 'available',
    createdAt: '2024-11-22'
  },
  {
    id: '7',
    title: "Talisman d'obsidienne - Protection inversee",
    description:
      "Talisman taille main, obsidienne polie. Livre avec sachet de protection et protocole d'entretien.",
    price: 140.0,
    shipping: 9.0,
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1080&q=80',
    category: 'objets-maudits',
    sellerId: 's7',
    sellerName: 'AtelierOcculte',
    sellerRating: 4.5,
    sellerReviews: 58,
    location: 'Lille',
    status: 'pending',
    createdAt: '2024-12-03'
  },
  {
    id: '8',
    title: "Figurine 'Gardien du Caveau' - Edition limitee",
    description:
      "Figurine resine detaillee, edition numerotee, boite d'origine. Parfaite pour vitrine et collection macabre.",
    price: 260.0,
    shipping: 15.0,
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1080&q=80',
    category: 'figurines-macabres',
    sellerId: 's8',
    sellerName: 'CryptaWorks',
    sellerRating: 4.7,
    sellerReviews: 69,
    location: 'Strasbourg',
    status: 'available',
    createdAt: '2024-11-27'
  }
];
