import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Star,
  MessageCircle,
  AlertCircle,
  TrendingDown,
  ShoppingCart,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { User } from '../App';
import type { Product } from '../data/mockData';
import { fetchProductById, createCheckoutSession, createOrder } from '../api/client';
import { getImageUrl } from '../lib/getImageUrl';

interface ProductDetailPageProps {
  productId: string | null;
  user: User | null;
  onBack: () => void;
  onOpenChat: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductDetailPage({
  productId,
  user,
  onBack,
  onOpenChat,
  onAddToCart,
}: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!productId) {
      setError('Produit introuvable');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await fetchProductById(productId);
        setProduct(data);
      } catch (e) {
        setError('Produit introuvable');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [productId]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (event.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => {
          const galleryLength = (() => {
            if (!product) return 1;
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
              return product.images.length;
            }
            return 1;
          })();

          return prev === 0 ? galleryLength - 1 : prev - 1;
        });
      } else if (event.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => {
          const galleryLength = (() => {
            if (!product) return 1;
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
              return product.images.length;
            }
            return 1;
          })();

          return prev === galleryLength - 1 ? 0 : prev + 1;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, product]);

  const handleBuyNow = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour acheter cet objet');
      return;
    }

    if (!user.token) {
      alert('Session invalide, veuillez vous reconnecter.');
      return;
    }

    if (!product) {
      alert('Produit introuvable');
      return;
    }

    try {
      const { url } = await createCheckoutSession(product.id, user.token, 1);
      window.location.href = url;
    } catch (err: any) {
      console.error(err);
      const message = String(err?.message || '');
      if (message.toLowerCase().includes('stripe')) {
        try {
          await createOrder(product.id, user.token, 1);
          alert('Commande enregistree avec succes.');
          return;
        } catch (fallbackErr: any) {
          console.error(fallbackErr);
          alert(fallbackErr?.message || 'Erreur lors de la creation de la commande');
          return;
        }
      }
      alert(message || 'Erreur lors de la redirection vers le paiement');
    }
  };

  if (loading) {
    return (
      <div className="pm-frame py-8">
        <p className="text-[#d7c8b8]">Chargement du produit...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pm-frame py-8">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-[#f7f0e8] hover:text-[#f28d49] mb-4">
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>
        <p className="text-[#ffc59f]">{error || 'Produit non trouve'}</p>
      </div>
    );
  }

  const galleryImagesRaw = product.images && Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
  const galleryImages = galleryImagesRaw.map(getImageUrl);

  const mainImage = galleryImages[Math.min(selectedImageIndex, galleryImages.length - 1)];

  const handleOpenLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="pm-frame py-8 pm-fade-in">
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center">
          <button type="button" onClick={handleCloseLightbox} className="absolute top-4 right-4 text-white hover:text-[#f28d49]">
            <CloseIcon className="h-6 w-6" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button type="button" onClick={handlePrevImage} className="absolute left-4 text-white hover:text-[#f28d49] px-2 py-2">
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button type="button" onClick={handleNextImage} className="absolute right-4 text-white hover:text-[#f28d49] px-2 py-2">
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <img src={mainImage} alt={product.title} className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-xl" />

          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      )}

      <button onClick={onBack} className="inline-flex items-center gap-2 text-[#f7f0e8] hover:text-[#f28d49] mb-6">
        <ArrowLeft className="h-5 w-5" />
        Retour au catalogue
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        <div>
          <div className="pm-panel rounded-2xl overflow-hidden mb-4 cursor-zoom-in" onClick={() => handleOpenLightbox(selectedImageIndex)}>
            <img src={mainImage} alt={product.title} className="w-full h-[430px] object-cover" />
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-3 mb-4 overflow-x-auto">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-20 w-20 rounded-md overflow-hidden border-2 ${
                    index === selectedImageIndex ? 'border-[#f28d49]' : 'border-transparent hover:border-[#8fa05c]'
                  }`}
                >
                  <img src={img} alt={`${product.title} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {product.priceHistory && product.priceHistory.length > 1 && (
            <div className="rounded-lg p-4 border border-[#8fa05c]/40 bg-[#8fa05c]/15 flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-[#d8e8a8] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[#d8e8a8] mb-1">Baisse de prix</h4>
                <p className="text-[#d8e8a8]/90 text-sm">
                  Prix reduit de {product.priceHistory[0].price.toFixed(2)} EUR a {product.price.toFixed(2)} EUR
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-[#f7f0e8] mb-3 text-3xl">{product.title}</h1>

          <div className="flex items-center gap-4 mb-5 text-[#d7c8b8]">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-[#f28d49] text-[#f28d49]" />
              <span className="text-[#f7f0e8]">{product.sellerRating.toFixed(1)}</span>
              <span>({product.sellerReviews} avis)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{product.location}</span>
            </div>
          </div>

          {product.status === 'pending' && (
            <div className="rounded-lg p-4 mb-5 flex items-start gap-3 border border-[#8fa05c]/40 bg-[#8fa05c]/15">
              <AlertCircle className="h-5 w-5 text-[#d8e8a8] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[#d8e8a8] mb-1">Objet en attente de validation</h4>
                <p className="text-[#d8e8a8]/85 text-sm">Cet objet est en cours de verification par notre equipe avant publication.</p>
              </div>
            </div>
          )}

          {product.status === 'sold' && (
            <div className="pm-panel rounded-lg p-4 mb-5">
              <h4 className="text-[#f7f0e8] mb-1">Objet vendu</h4>
              <p className="text-[#d7c8b8]">Cet objet n'est plus disponible.</p>
            </div>
          )}

          <div className="pm-panel rounded-lg p-5 mb-5">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[#f28d49] text-3xl">{product.price.toFixed(2)} EUR</span>
            </div>
            {product.shipping > 0 && <p className="text-[#d7c8b8]">+ {product.shipping.toFixed(2)} EUR de frais de port</p>}
            <p className="text-[#bcae9e] text-sm mt-2">Commission maison (5%) et TVA ajoutees au moment du paiement.</p>
          </div>

          <div className="space-y-3 mb-5">
            <button
              onClick={handleBuyNow}
              disabled={product.status !== 'available'}
              className="w-full rounded-lg bg-[#d95f18] text-white py-3 font-semibold hover:brightness-110 transition disabled:bg-[#4f3426] disabled:cursor-not-allowed"
            >
              {product.status === 'available' ? 'Acheter maintenant' : 'Non disponible'}
            </button>
            {product.status === 'available' && (
              <button
                onClick={() => {
                  onAddToCart(product);
                  alert('Objet ajoute au panier');
                }}
                className="w-full rounded-lg border border-[#d95f18]/50 py-3 text-[#ffc59f] hover:bg-[#d95f18]/10 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Ajouter au panier
              </button>
            )}
            {user && product.status === 'available' && (
              <button
                onClick={onOpenChat}
                className="w-full rounded-lg border border-[#4f3426] bg-[#1a1310]/80 py-3 text-[#f7f0e8] hover:border-[#8fa05c] hover:text-[#d8e8a8] transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Contacter le vendeur
              </button>
            )}
          </div>

          <div className="border-t border-[#4f3426] pt-5">
            <h3 className="text-[#f7f0e8] mb-2">Description</h3>
            <p className="text-[#d7c8b8] whitespace-pre-line text-sm leading-relaxed">{product.description}</p>
          </div>

          <div className="border-t border-[#4f3426] pt-5 mt-5">
            <h3 className="text-[#f7f0e8] mb-2">Vendeur</h3>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full flex items-center justify-center border border-[#d95f18]/40 bg-[#d95f18]/15">
                <span className="text-[#ffc59f]">{product.sellerName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[#f7f0e8]">{product.sellerName}</p>
                <div className="flex items-center gap-1 text-sm text-[#d7c8b8]">
                  <Star className="h-4 w-4 fill-[#f28d49] text-[#f28d49]" />
                  <span>{product.sellerRating.toFixed(1)}</span>
                  <span>({product.sellerReviews} ventes)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 mt-5 border border-[#8fa05c]/30 bg-[#8fa05c]/12">
            <h4 className="text-[#d8e8a8] mb-2 inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Protection La Petite Maison de l'Epouvante
            </h4>
            <ul className="text-[#d8e8a8]/90 space-y-1 text-sm">
              <li>- Paiement securise</li>
              <li>- Vendeur verifie</li>
              <li>- Objet controle avant mise en ligne</li>
              <li>- Service client disponible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
