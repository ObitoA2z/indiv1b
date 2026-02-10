import { Star, MapPin } from 'lucide-react';
import type { Product } from '../data/mockData';
import { getImageUrl } from '../lib/getImageUrl';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  showRecommendedBadge?: boolean;
}

export function ProductCard({ product, onClick, showRecommendedBadge }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden cursor-pointer hover:border-rose-500/50 hover:shadow-[0_0_25px_rgba(244,63,94,0.15)] transition-all"
    >
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={getImageUrl(product.image)}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

        {product.status === 'pending' && (
          <span className="absolute top-3 left-3 bg-amber-500/20 text-amber-200 text-xs px-2 py-1 rounded-full border border-amber-500/40">
            En attente
          </span>
        )}

        {product.status === 'sold' && (
          <span className="absolute top-3 left-3 bg-slate-900 text-slate-100 text-xs px-2 py-1 rounded-full border border-slate-700">
            Vendu
          </span>
        )}

        {showRecommendedBadge && (
          <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs px-2 py-1 rounded-full">
            Recommande
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-slate-100 text-sm line-clamp-2 mb-1">{product.title}</p>

        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-rose-200">{product.price.toFixed(2)} €</p>
          {product.shipping > 0 && (
            <p className="text-slate-400 text-xs">+ {product.shipping.toFixed(2)} € port</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span>{product.sellerRating.toFixed(1)}</span>
            <span>({product.sellerReviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{product.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
