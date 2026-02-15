import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Skull, Ghost } from 'lucide-react';
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
        setError('Impossible de charger les produits');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const featuredProducts = products.slice(0, 3);
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  if (loading) {
    return (
      <div className="pm-frame pt-10 pb-12">
        <p className="text-[#d7c8b8]">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pm-frame pt-10 pb-12">
        <p className="text-[#ffc59f]">{error}</p>
      </div>
    );
  }

  return (
    <div className="pm-fade-in">
      <section className="pm-frame pt-8 pb-6">
        <div className="pm-panel pm-edge rounded-3xl p-6 md:p-8 overflow-hidden relative">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#d95f18]/20 blur-3xl" />
          <div className="absolute -left-20 bottom-0 w-56 h-56 rounded-full bg-[#8fa05c]/20 blur-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#4f3426] bg-[#261a14]/80 px-3 py-1 text-xs text-[#f7f0e8] mb-4">
                <Sparkles className="h-3.5 w-3.5 text-[#f28d49]" />
                Plateforme epouvante officielle
              </div>

              <h1 className="pm-title text-4xl md:text-5xl leading-tight text-[#f7f0e8] mb-4">
                Fanzine, masques, artefacts et curiosites pour nuits blanches
              </h1>

              <p className="text-[#d7c8b8] leading-relaxed mb-6 max-w-2xl">
                Decouvre des produits epouvante valides par la maison. Chaque fiche est publiee,
                controlee puis proposee a la vente avec historique et statut de confiance.
              </p>

              <div className="flex flex-wrap gap-3 mb-7">
                <button
                  onClick={onNavigateToCatalog}
                  className="inline-flex items-center gap-2 rounded-full bg-[#d95f18] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition"
                >
                  Entrer dans le catalogue
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-[#4f3426] bg-[#1f1612]/70 px-5 py-2.5 text-sm text-[#f7f0e8] hover:border-[#f28d49] hover:text-[#f28d49] transition">
                  Voir le manifeste
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl border border-[#4f3426] bg-[#1a1310]/80 p-3">
                  <p className="text-[#f28d49]">{products.length}</p>
                  <p className="text-[#d7c8b8] text-xs">Objets en vitrine</p>
                </div>
                <div className="rounded-xl border border-[#4f3426] bg-[#1a1310]/80 p-3">
                  <p className="text-[#f28d49]">24h</p>
                  <p className="text-[#d7c8b8] text-xs">Validation moyenne</p>
                </div>
                <div className="rounded-xl border border-[#4f3426] bg-[#1a1310]/80 p-3">
                  <p className="text-[#f28d49]">5%</p>
                  <p className="text-[#d7c8b8] text-xs">Commission maison</p>
                </div>
                <div className="rounded-xl border border-[#4f3426] bg-[#1a1310]/80 p-3">
                  <p className="text-[#f28d49]">4.8/5</p>
                  <p className="text-[#d7c8b8] text-xs">Satisfaction</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {featuredProducts.map((product, idx) => (
                <button
                  key={product.id}
                  onClick={() => onProductClick(product.id)}
                  className="rounded-2xl border border-[#4f3426] bg-[#1a1310]/75 p-3 text-left hover:border-[#f28d49] transition"
                >
                  <div className="flex items-center gap-3">
                    <img src={getImageUrl(product.image)} alt={product.title} className="h-16 w-16 rounded-xl object-cover" />
                    <div>
                      <p className="text-[#f7f0e8] text-sm line-clamp-2 mb-1">{product.title}</p>
                      <p className="text-[#f28d49] text-sm">{product.price.toFixed(2)} EUR</p>
                    </div>
                    {idx === 0 ? <Skull className="h-4 w-4 text-[#8fa05c] ml-auto" /> : <Ghost className="h-4 w-4 text-[#8fa05c] ml-auto" />}
                  </div>
                </button>
              ))}

              <div className="rounded-2xl border border-[#4f3426] bg-[#1a1310]/75 p-4">
                <div className="flex items-center gap-2 text-[#f7f0e8] text-sm mb-2">
                  <ShieldCheck className="h-4 w-4 text-[#8fa05c]" />
                  Protection maison
                </div>
                <p className="text-xs text-[#d7c8b8] leading-relaxed">
                  Paiement securise, moderation active, roles verifies. Les vendeurs sont traces et notes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pm-frame pb-14">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl text-[#f7f0e8]">Nouveautes du manoir</h2>
            <p className="text-[#d7c8b8] text-sm">Selection recemment publiee</p>
          </div>
          <button
            onClick={onNavigateToCatalog}
            className="text-sm text-[#f28d49] hover:text-[#ffb27b] transition"
          >
            Tout parcourir
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentProducts.map((product) => (
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
