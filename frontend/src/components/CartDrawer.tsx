import { X, Minus, Plus, Trash2, ShoppingBag, Receipt, ShieldCheck, Ghost } from 'lucide-react';
import type { CartItem, User } from '../App';
import { getImageUrl } from '../lib/getImageUrl';
import { useState } from 'react';

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  user: User | null;
  onLogin: () => void;
  onCheckout: () => Promise<void>;
}

export function CartDrawer({
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  user,
  onLogin,
  onCheckout,
}: CartDrawerProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingTotal = cart.reduce((sum, item) => sum + item.product.shipping, 0);
  const total = subtotal + shippingTotal;
  const commission = total * 0.05;

  const handleCheckout = async () => {
    if (!user) {
      onLogin();
      return;
    }

    setCheckoutLoading(true);
    try {
      await onCheckout();
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#03040a]/80 backdrop-blur-md" onClick={onClose} />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-cyan-400/35 bg-[#060912]/95 shadow-[0_0_80px_rgba(34,211,238,0.22)]">
        <header className="border-b border-cyan-400/25 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan-300/40 bg-cyan-300/10 p-2.5">
                <Ghost className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Panier spectral</p>
                <h2 className="text-lg text-[#effbff]">Rituel de commande</h2>
                <p className="text-xs text-cyan-100/70">{cart.length} article{cart.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 p-1.5 text-cyan-100 hover:bg-cyan-300/20">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="grid h-full place-items-center rounded-2xl border border-cyan-400/20 bg-[#0a1222]/75 p-8 text-center">
              <ShoppingBag className="mx-auto mb-3 h-14 w-14 text-cyan-300/40" />
              <h3 className="mb-2 text-[#effbff]">Aucun article dans ton panier</h3>
              <p className="mb-4 text-sm text-cyan-100/65">Ajoute un produit de la boutique pour commencer.</p>
              <button onClick={onClose} className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white">
                Retour au catalogue
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <article key={item.product.id} className="rounded-2xl border border-cyan-300/25 bg-[#0a1222]/75 p-3">
                  <div className="flex gap-3">
                    <img src={getImageUrl(item.product.image)} alt={item.product.title} className="h-20 w-20 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 line-clamp-2 text-sm text-[#effbff]">{item.product.title}</p>
                      <p className="mb-2 text-sm font-semibold text-cyan-200">{item.product.price.toFixed(2)} EUR</p>

                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center rounded-xl border border-cyan-300/25 bg-[#040814]">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-2 text-cyan-100 hover:text-cyan-300"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-2 text-sm text-cyan-50">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-2 text-cyan-100 hover:text-cyan-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button onClick={() => onRemoveItem(item.product.id)} className="rounded-lg p-1.5 text-cyan-100/70 hover:bg-red-500/20 hover:text-red-200">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <button onClick={onClearCart} className="w-full rounded-xl border border-cyan-300/30 bg-cyan-300/10 py-2 text-sm text-cyan-100 hover:bg-cyan-300/20">
                Vider le panier
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="border-t border-cyan-300/25 bg-[#060912] p-4">
            <div className="mb-3 rounded-2xl border border-cyan-300/25 bg-[#0a1222]/75 p-4">
              <div className="mb-2 inline-flex items-center gap-2 text-sm text-cyan-100">
                <Receipt className="h-4 w-4 text-cyan-300" /> Recapitulatif
              </div>
              <div className="space-y-1.5 text-sm text-cyan-100/70">
                <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toFixed(2)} EUR</span></div>
                <div className="flex justify-between"><span>Livraison</span><span>{shippingTotal.toFixed(2)} EUR</span></div>
                <div className="flex justify-between"><span>Commission maison</span><span>{commission.toFixed(2)} EUR</span></div>
                <div className="flex justify-between border-t border-cyan-300/20 pt-2 text-cyan-50"><span>Total</span><span>{total.toFixed(2)} EUR</span></div>
              </div>
            </div>

            {!user && (
              <div className="mb-3 rounded-xl border border-amber-300/40 bg-amber-300/10 p-3 text-xs text-amber-100">
                Connecte-toi pour finaliser la commande.
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 py-3 text-sm font-semibold text-white"
            >
              {checkoutLoading
                ? 'Traitement en cours...'
                : user
                ? 'Proceder au paiement'
                : 'Se connecter pour payer'}
            </button>

            <p className="mt-2 inline-flex w-full items-center justify-center gap-1 text-xs text-cyan-100/70">
              <ShieldCheck className="h-3.5 w-3.5" /> Paiement securise
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}
