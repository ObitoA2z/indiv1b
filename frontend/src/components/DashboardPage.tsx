import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, AlertTriangle, TrendingUp, Plus, MessageCircle } from 'lucide-react';
import type { User } from '../App';
import type { Product } from '../data/mockData';
import { ProductCard } from './ProductCard';
import { fetchProducts } from '../api/client';

interface DashboardPageProps {
  user: User | null;
  onProductClick: (productId: string) => void;
  onOpenChat: () => void;
  onAddProduct: () => void;
  onUpgradeToSeller: () => void;
}

export function DashboardPage({
  user,
  onProductClick,
  onOpenChat,
  onAddProduct,
  onUpgradeToSeller,
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<'my-products' | 'favorites' | 'orders'>('my-products');
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

  const myProducts = user ? products.filter(p => p.sellerId === user.id) : [];
  const favoriteProducts = products.slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-slate-300">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-rose-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-slate-100 mb-2 text-2xl">
            Bonjour {user?.name || 'Explorateur'}
          </h1>
          <p className="text-slate-400">
            Gere vos objets, vos favoris et vos achats depuis cet espace.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg hover:border-rose-400 hover:text-rose-200 transition-colors text-slate-200"
          >
            <MessageCircle className="h-5 w-5" />
            Contacter un visiteur
          </button>
          {user?.role === 'SELLER' ? (
            <button
              onClick={onAddProduct}
              className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-500 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Publier un objet
            </button>
          ) : user?.role === 'BUYER' ? (
            <button
              onClick={onUpgradeToSeller}
              className="flex items-center gap-2 bg-slate-900 text-slate-100 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors border border-slate-700"
            >
              Devenir vendeur
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Objets en vitrine</p>
              <p className="text-slate-100">{myProducts.length}</p>
            </div>
            <Package className="h-6 w-6 text-rose-300" />
          </div>
        </div>

        <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Objets favoris</p>
              <p className="text-slate-100">{favoriteProducts.length}</p>
            </div>
            <Clock className="h-6 w-6 text-amber-300" />
          </div>
        </div>

        <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Ventes realisees</p>
              <p className="text-slate-100">12</p>
            </div>
            <CheckCircle className="h-6 w-6 text-emerald-300" />
          </div>
        </div>

        <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Note moyenne</p>
              <p className="text-slate-100">4.8/5</p>
            </div>
            <TrendingUp className="h-6 w-6 text-sky-300" />
          </div>
        </div>
      </div>

      <div className="border-b border-slate-800 mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('my-products')}
            className={`pb-4 border-b-2 ${activeTab === 'my-products' ? 'border-rose-500 text-rose-200' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Mes objets
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-4 border-b-2 ${activeTab === 'favorites' ? 'border-rose-500 text-rose-200' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Favoris
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 border-b-2 ${activeTab === 'orders' ? 'border-rose-500 text-rose-200' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Mes achats
          </button>
        </nav>
      </div>

      {activeTab === 'my-products' && (
        <div>
          {myProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product.id)}
                  showRecommendedBadge={false}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-8 text-center">
              <Package className="h-16 w-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-slate-100 mb-2">Vous n'avez pas encore d'objet en vitrine</h3>
              <p className="text-slate-400 mb-4">
                Publiez vos objets d'epouvante en quelques clics.
              </p>
              {user?.role === 'SELLER' ? (
                <button
                  onClick={onAddProduct}
                  className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-500 transition-colors"
                >
                  Publier un objet
                </button>
              ) : user?.role === 'BUYER' ? (
                <button
                  onClick={onUpgradeToSeller}
                  className="bg-slate-900 text-slate-100 px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors border border-slate-700"
                >
                  Devenir vendeur
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product.id)}
                  showRecommendedBadge={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-slate-100 mb-2">Aucun favori pour le moment</h3>
              <p className="text-slate-400">Ajoutez des objets a vos favoris pour les retrouver facilement.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-rose-300" />
            <h3 className="text-slate-100">Historique des achats</h3>
          </div>
          <p className="text-slate-400 mb-4">
            L'historique des achats sera disponible une fois l'integration avec le systeme de paiement realisee.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-slate-300">
              Exemple de donnees a afficher :
            </p>
            <ul className="list-disc list-inside text-slate-400 mt-2">
              <li>Date de l'achat</li>
              <li>Objets achetes</li>
              <li>Montant total</li>
              <li>Statut de livraison</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
