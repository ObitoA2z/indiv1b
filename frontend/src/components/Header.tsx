import { useState } from 'react';
import {
  ShoppingBag,
  LogIn,
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  Flame,
} from 'lucide-react';
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
  onAddProduct,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (page: PageView) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#4f3426]/60 bg-[#120d0a]/90 backdrop-blur-md">
      <div className="pm-frame py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden text-[#f7f0e8] hover:text-[#f28d49]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d95f18] to-[#f28d49] pm-glow flex items-center justify-center">
              <Flame className="h-5 w-5 text-[#fff3e8]" />
            </div>
            <div>
              <span className="block text-[#f7f0e8] text-base leading-tight">La Petite Maison de l'Epouvante</span>
              <span className="block text-[#d7c8b8] text-xs leading-tight">Objets maudits, vitrines rares, edition frisson</span>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-2 rounded-full border border-[#4f3426] bg-[#1f1612]/80 px-2 py-1">
          {user?.role !== 'ADMIN' && (
            <>
              <button
                onClick={() => handleNavigate('home')}
                className={`text-sm transition-colors px-3 py-1.5 rounded-full ${
                  currentPage === 'home' ? 'bg-[#d95f18] text-white' : 'text-[#f7f0e8] hover:text-[#f28d49]'
                }`}
              >
                Accueil
              </button>
              <button
                onClick={() => handleNavigate('catalog')}
                className={`text-sm transition-colors px-3 py-1.5 rounded-full ${
                  currentPage === 'catalog' ? 'bg-[#d95f18] text-white' : 'text-[#f7f0e8] hover:text-[#f28d49]'
                }`}
              >
                Catalogue
              </button>
            </>
          )}

          {user && user.role !== 'ADMIN' && (
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`flex items-center gap-1 text-sm transition-colors px-3 py-1.5 rounded-full ${
                currentPage === 'dashboard' ? 'bg-[#d95f18] text-white' : 'text-[#f7f0e8] hover:text-[#f28d49]'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Mon espace
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => handleNavigate('admin')}
              className={`flex items-center gap-1 text-sm transition-colors px-3 py-1.5 rounded-full ${
                currentPage === 'admin' ? 'bg-[#d95f18] text-white' : 'text-[#f7f0e8] hover:text-[#f28d49]'
              }`}
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
              className="hidden md:inline-flex items-center px-3 py-2 rounded-full bg-[#8fa05c] text-[#0d0b08] text-xs hover:brightness-110 transition-colors font-semibold"
            >
              Publier un objet
            </button>
          )}

          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-full hover:bg-[#261a14] transition-colors border border-[#4f3426]/70"
          >
            <ShoppingBag className="h-5 w-5 text-[#f7f0e8]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d95f18] text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartItemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-[#d7c8b8]">Connecte en tant que</span>
                <span className="text-sm text-[#f7f0e8] font-medium flex items-center gap-2">
                  {user.name}
                  {user.role === 'SELLER' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[#8fa05c]/20 text-[#cfe09b] border border-[#8fa05c]/40">
                      Vendeur
                    </span>
                  )}
                  {user.role === 'ADMIN' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[#d95f18]/20 text-[#ffc59f] border border-[#d95f18]/40">
                      Admin
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#4f3426] text-xs text-[#f7f0e8] hover:border-[#f28d49] hover:text-[#f28d49] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Deconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLogin}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#4f3426] text-xs text-[#f7f0e8] hover:border-[#f28d49] hover:text-[#f28d49] transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Se connecter
              </button>
              <button
                onClick={onSignup}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#4f3426] text-xs text-[#f7f0e8] hover:border-[#8fa05c] hover:text-[#cfe09b] transition-colors"
              >
                Creer un compte
              </button>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#4f3426] bg-[#120d0a] px-4 py-3 space-y-2">
          {user?.role !== 'ADMIN' && (
            <>
              <button onClick={() => handleNavigate('home')} className="block w-full text-left py-2 text-[#f7f0e8]">
                Accueil
              </button>
              <button onClick={() => handleNavigate('catalog')} className="block w-full text-left py-2 text-[#f7f0e8]">
                Catalogue
              </button>
            </>
          )}

          {user && user.role !== 'ADMIN' && (
            <button onClick={() => handleNavigate('dashboard')} className="block w-full text-left py-2 text-[#f7f0e8]">
              Mon espace
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <button onClick={() => handleNavigate('admin')} className="block w-full text-left py-2 text-[#f7f0e8]">
              Admin
            </button>
          )}

          {(!user || user.role === 'SELLER') && (
            <button onClick={onAddProduct} className="block w-full text-left py-2 text-[#f7f0e8]">
              Publier un objet
            </button>
          )}
        </div>
      )}
    </header>
  );
}
