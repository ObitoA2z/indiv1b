import { useState } from 'react';
import { ShoppingBag, LogIn, LogOut, LayoutDashboard, Shield, Menu, X } from 'lucide-react';
import type { User, PageView } from '../App';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onNavigate: (page: PageView) => void;
  currentPage: PageView;
  cartItemCount: number;
  onOpenCart: () => void;
  onAddProduct: () => void;
}

export function Header({
  user,
  onLogin,
  onSignup,
  onLogout,
  onNavigate,
  currentPage,
  cartItemCount,
  onOpenCart,
  onAddProduct
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (page: PageView) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden text-slate-300 hover:text-rose-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigate('home')}
          >
            <div className="w-9 h-9 rounded-full bg-rose-600/90 shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-rose-200 text-base leading-tight">La Petite Maison de l’Épouvante</span>
              <span className="block text-slate-400 text-xs leading-tight">Objets, rituels, curiosites interdites</span>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {user?.role !== 'ADMIN' && (
            <>
              <button
                onClick={() => handleNavigate('home')}
                className={`text-sm transition-colors ${currentPage === 'home' ? 'text-rose-200' : 'text-slate-300 hover:text-rose-200'}`}
              >
                Accueil
              </button>
              <button
                onClick={() => handleNavigate('catalog')}
                className={`text-sm transition-colors ${currentPage === 'catalog' ? 'text-rose-200' : 'text-slate-300 hover:text-rose-200'}`}
              >
                Catalogue
              </button>
            </>
          )}
          {user && user.role !== 'ADMIN' && (
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`flex items-center gap-1 text-sm transition-colors ${currentPage === 'dashboard' ? 'text-rose-200' : 'text-slate-300 hover:text-rose-200'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Mon espace
            </button>
          )}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => handleNavigate('admin')}
              className={`flex items-center gap-1 text-sm transition-colors ${currentPage === 'admin' ? 'text-rose-200' : 'text-slate-300 hover:text-rose-200'}`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {(!user || user.role === 'SELLER') && (
            <button
              onClick={onAddProduct}
              className="hidden md:inline-flex items-center px-3 py-2 rounded-full bg-rose-600 text-white text-xs hover:bg-rose-500 transition-colors"
            >
              Publier un objet
            </button>
          )}

          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-full hover:bg-slate-800/70 transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-slate-200" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartItemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-slate-400">Connecte en tant que</span>
                <span className="text-sm text-slate-100 font-medium flex items-center gap-2">
                  {user.name}
                  {user.role === 'SELLER' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/40">Vendeur</span>
                  )}
                  {user.role === 'ADMIN' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40">Admin</span>
                  )}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-200 hover:border-rose-400 hover:text-rose-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Deconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLogin}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-200 hover:border-rose-400 hover:text-rose-200 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Se connecter
              </button>
              <button
                onClick={onSignup}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-200 hover:border-emerald-400 hover:text-emerald-200 transition-colors"
              >
                Creer un compte
              </button>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-2">
          {user?.role !== 'ADMIN' && (
            <>
              <button
                onClick={() => handleNavigate('home')}
                className="block w-full text-left py-2 text-slate-300"
              >
                Accueil
              </button>
              <button
                onClick={() => handleNavigate('catalog')}
                className="block w-full text-left py-2 text-slate-300"
              >
                Catalogue
              </button>
            </>
          )}
          {user && user.role !== 'ADMIN' && (
            <button
              onClick={() => handleNavigate('dashboard')}
              className="block w-full text-left py-2 text-slate-300"
            >
              Mon espace
            </button>
          )}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => handleNavigate('admin')}
              className="block w-full text-left py-2 text-slate-300"
            >
              Admin
            </button>
          )}
          {(!user || user.role === 'SELLER') && (
            <button
              onClick={onAddProduct}
              className="block w-full text-left py-2 text-slate-300"
            >
              Publier un objet
            </button>
          )}
        </div>
      )}
    </header>
  );
}
