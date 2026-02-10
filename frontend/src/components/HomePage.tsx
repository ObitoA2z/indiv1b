import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product } from '../data/mockData';
import { fetchProducts } from '../api/client';
import { getImageUrl } from '../lib/getImageUrl';

interface HomePageProps {
  onProductClick: (productId: string) => void;
  onNavigateToCatalog: () => void;
}

export function HomePage({ onProductClick, onNavigateToCatalog }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (e) {
        setError("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const featuredProducts = products.slice(0, 4);
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          <p className="text-slate-300">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          <p className="text-rose-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl"></div>
        <div className="absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 text-rose-200 text-xs border border-rose-500/30 mb-5">
                <Sparkles className="h-3 w-3" />
                <span>La maison s'ouvre a ceux qui osent</span>
              </div>

              <h1 className="text-4xl md:text-5xl text-slate-100 mb-4">
                La Petite Maison de l'Epouvante
              </h1>

              <p className="text-slate-300 mb-6 leading-relaxed">
                Grimoires, poupees, affiches d'horreur, masques rituels, photographies paranormales...
                Publiez et trouvez vos objets d'epouvante avec un rituel de verification strict.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-rose-300" />
                  <span className="text-slate-200 text-sm">Paiements securises</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  <span className="text-slate-200 text-sm">Authentification par experts</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onNavigateToCatalog}
                  className="inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-full text-sm hover:bg-rose-500 transition-colors"
                >
                  Explorer les objets
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 border border-slate-700 text-slate-200 px-4 py-2 rounded-full text-sm hover:border-rose-400 hover:text-rose-200 transition-colors">
                  Comment ca marche
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {featuredProducts.map(product => (
                <div key={product.id} className="bg-slate-900/80 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-slate-100 text-sm line-clamp-2 mb-1">{product.title}</p>
                    <p className="text-rose-200 text-sm mb-1">{product.price.toFixed(2)} €</p>
                    <p className="text-slate-400 text-xs mb-2">Publie par {product.sellerName}</p>
                    <button
                      onClick={() => onProductClick(product.id)}
                      className="w-full text-center text-xs text-rose-200 hover:text-rose-100"
                    >
                      Voir le detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-100">Objets recemment ajoutes</h2>
          <span className="text-slate-500 text-xs">Selection froide de la semaine</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product.id)}
              showRecommendedBadge={false}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
