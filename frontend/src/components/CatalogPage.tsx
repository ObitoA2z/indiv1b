import { useState, useEffect } from 'react';
import { Search, Filter, Star } from 'lucide-react';
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

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInterests =
      !showRecommended || (userInterests && userInterests.some(interest => product.category === interest));

    return matchesCategory && matchesSearch && matchesInterests;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-slate-300">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-rose-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un objet..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-700 bg-slate-900/70 text-slate-100 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-slate-700 bg-slate-900/70 text-slate-100 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="recent">Plus recents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix decroissant</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full transition-colors ${selectedCategory === 'all' ? 'bg-rose-600 text-white' : 'bg-slate-900/70 text-slate-200 border border-slate-700 hover:border-rose-500'}`}
          >
            Toutes les categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-colors ${selectedCategory === category.id ? 'bg-rose-600 text-white' : 'bg-slate-900/70 text-slate-200 border border-slate-700 hover:border-rose-500'}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {userInterests && userInterests.length > 0 && (
          <button
            onClick={() => setShowRecommended(!showRecommended)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showRecommended ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40' : 'bg-slate-900/70 text-slate-200 border border-slate-700 hover:border-amber-400'}`}
          >
            <Star className={`h-5 w-5 ${showRecommended ? 'fill-amber-400 text-amber-400' : ''}`} />
            Recommandes pour vous
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-slate-400">
          {sortedProducts.length} objet{sortedProducts.length > 1 ? 's' : ''} trouve
          {sortedProducts.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product.id)}
            showRecommendedBadge={showRecommended && userInterests?.some(interest => product.category === interest)}
          />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-16">
          <Filter className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-slate-100 mb-2">Aucun objet trouve</h3>
          <p className="text-slate-400">Essayez de modifier vos filtres ou votre recherche</p>
        </div>
      )}
    </div>
  );
}
