import { useState, useEffect } from 'react';
import { Search, Filter, Star, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product } from '../data/mockData';
import { categories } from '../data/mockData';
import { fetchProducts } from '../api/client';

interface CatalogPageProps {
  onProductClick: (productId: string) => void;
  userInterests?: string[];
}

export function CatalogPage({ onProductClick, userInterests }: CatalogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [showRecommended, setShowRecommended] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (e) {
        setError('Impossible de charger les produits');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInterests =
      !showRecommended || (userInterests && userInterests.some((interest) => product.category === interest));

    return matchesCategory && matchesSearch && matchesInterests;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="pm-frame py-8">
        <p className="text-[#d7c8b8]">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pm-frame py-8">
        <p className="text-[#ffc59f]">{error}</p>
      </div>
    );
  }

  return (
    <div className="pm-frame py-7 pm-fade-in">
      <div className="pm-panel pm-edge rounded-3xl p-4 md:p-5 mb-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.5fr_0.5fr] gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d7c8b8] h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un objet, un vendeur, un style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#4f3426] bg-[#1a1310]/80 text-[#f7f0e8] placeholder:text-[#bcae9e] focus:outline-none focus:ring-2 focus:ring-[#d95f18]/40"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#4f3426] bg-[#1a1310]/80 px-3">
            <SlidersHorizontal className="h-4 w-4 text-[#d7c8b8]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'price-asc' | 'price-desc')}
              className="w-full py-3 bg-transparent text-[#f7f0e8] focus:outline-none"
            >
              <option className="bg-[#1a1310]" value="recent">Plus recents</option>
              <option className="bg-[#1a1310]" value="price-asc">Prix croissant</option>
              <option className="bg-[#1a1310]" value="price-desc">Prix decroissant</option>
            </select>
          </div>

          {userInterests && userInterests.length > 0 && (
            <button
              onClick={() => setShowRecommended(!showRecommended)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition ${
                showRecommended
                  ? 'border-[#8fa05c] bg-[#8fa05c]/20 text-[#d8e8a8]'
                  : 'border-[#4f3426] bg-[#1a1310]/80 text-[#f7f0e8] hover:border-[#8fa05c]/60'
              }`}
            >
              <Star className={`h-4 w-4 ${showRecommended ? 'fill-[#d8e8a8]' : ''}`} />
              Recommandes
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-full text-sm transition ${
              selectedCategory === 'all'
                ? 'bg-[#d95f18] text-white'
                : 'bg-[#1a1310]/80 border border-[#4f3426] text-[#f7f0e8] hover:border-[#f28d49]'
            }`}
          >
            Toutes
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-full text-sm transition ${
                selectedCategory === category.id
                  ? 'bg-[#d95f18] text-white'
                  : 'bg-[#1a1310]/80 border border-[#4f3426] text-[#f7f0e8] hover:border-[#f28d49]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[#d7c8b8] text-sm inline-flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#f28d49]" />
          {sortedProducts.length} objet{sortedProducts.length > 1 ? 's' : ''} trouve{sortedProducts.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product.id)}
            showRecommendedBadge={Boolean(showRecommended && userInterests?.some((interest) => product.category === interest))}
          />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="pm-panel rounded-2xl p-10 text-center mt-6">
          <Filter className="h-14 w-14 text-[#4f3426] mx-auto mb-3" />
          <h3 className="text-[#f7f0e8] mb-1">Aucun objet trouve</h3>
          <p className="text-[#d7c8b8]">Essaie une autre categorie ou un autre mot-cle.</p>
        </div>
      )}
    </div>
  );
}
