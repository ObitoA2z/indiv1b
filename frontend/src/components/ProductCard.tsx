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
    <article
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#4f3426] bg-[#1a1310]/85 transition hover:-translate-y-1 hover:border-[#f28d49] hover:shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={getImageUrl(product.image)}
          alt={product.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {product.status === 'pending' && (
          <span className="absolute top-3 left-3 rounded-full border border-[#8fa05c]/50 bg-[#8fa05c]/25 px-2 py-1 text-xs text-[#d8e8a8]">
            En attente
          </span>
        )}

        {product.status === 'sold' && (
          <span className="absolute top-3 left-3 rounded-full border border-[#4f3426] bg-[#120d0a] px-2 py-1 text-xs text-[#f7f0e8]">
            Vendu
          </span>
        )}

        {showRecommendedBadge && (
          <span className="absolute top-3 right-3 rounded-full bg-[#d95f18] px-2 py-1 text-xs text-white">
            Recommande
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-[#f7f0e8] text-sm line-clamp-2 min-h-[2.5rem] mb-2">{product.title}</p>

        <div className="flex items-end justify-between mb-3">
          <p className="text-[#f28d49] text-lg leading-none">{product.price.toFixed(2)} EUR</p>
          {product.shipping > 0 && <p className="text-xs text-[#d7c8b8]">+ {product.shipping.toFixed(2)} port</p>}
        </div>

        <div className="flex items-center justify-between text-xs text-[#d7c8b8] border-t border-[#4f3426]/70 pt-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-[#f28d49] fill-[#f28d49]" />
            <span>{product.sellerRating.toFixed(1)}</span>
            <span>({product.sellerReviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{product.location}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
