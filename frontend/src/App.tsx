import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { DashboardPage } from './components/DashboardPage';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { SignUpModal } from './components/SignUpModal';
import { ChatWidget } from './components/ChatWidget';
import { CartDrawer } from './components/CartDrawer';
import { AddProductModal, ProductFormData } from './components/AddProductModal';
import { Product } from './data/mockData';
import { createProduct, loginUser, registerUser, createSellerRequest, createOrder } from './api/client';

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  interests: string[];
  token?: string;
  active?: boolean;
  address?: string | null;
  phone?: string | null;
  gender?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PageView = 'home' | 'catalog' | 'product' | 'dashboard' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    // Restaurer l'utilisateur depuis localStorage au chargement
    const savedUser = localStorage.getItem('epouvante_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    const { user: apiUser, token } = await loginUser({ email, password });
    const loggedInUser: User = {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role as UserRole,
      interests: ['grimoires', 'poupees-hantees', 'affiches-horreur'],
      token,
      active: apiUser.active,
      address: apiUser.address ?? null,
      phone: apiUser.phone ?? null,
      gender: apiUser.gender ?? null,
    };
    setUser(loggedInUser);
    localStorage.setItem('epouvante_user', JSON.stringify(loggedInUser));
    setShowLoginModal(false);
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    role: 'BUYER' | 'SELLER',
    address?: string,
    phone?: string,
    gender?: string,
  ) => {
    const { user: apiUser, token, message } = await registerUser({ name, email, password, role, address, phone, gender });

    setUser({
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role as UserRole,
      interests: ['grimoires', 'poupees-hantees', 'affiches-horreur'],
      token: token || undefined,
      active: apiUser.active,
      address: apiUser.address ?? null,
      phone: apiUser.phone ?? null,
      gender: apiUser.gender ?? null,
    });
    if (message) {
      alert(message);
    }
    setShowSignUpModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('epouvante_user');
    setCurrentPage('home');
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product');
  };

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckoutCart = async () => {
    if (!user?.token) {
      alert('Veuillez vous reconnecter pour finaliser la commande.');
      return;
    }

    if (cart.length === 0) {
      alert('Votre panier est vide.');
      return;
    }

    try {
      for (const item of cart) {
        await createOrder(item.product.id, user.token, item.quantity);
      }
      setCart([]);
      setShowCart(false);
      alert('Commande enregistree avec succes.');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Erreur lors de la creation de la commande');
    }
  };

  const handleAddProduct = (productData: ProductFormData) => {
    if (!user) {
      alert('Vous devez être connecté pour publier un objet');
      return;
    }

    if (user.role === 'BUYER') {
      alert('Seuls les vendeurs ou admins peuvent publier un objet');
      return;
    }

    createProduct(
      {
        ...productData,
        sellerId: user.id,
        sellerName: user.name,
        location: 'France',
      },
      user.token,
    )
      .then(() => {
        alert('Votre objet a été soumis pour validation. Vous serez notifié dans 24-48h.');
      })
      .catch((err) => {
        console.error(err);
        alert("Erreur lors de la création de l'objet");
      });
  };

  // Forcer l'accès admin uniquement quand connecté en ADMIN
  if (user?.role === 'ADMIN' && currentPage !== 'admin') {
    setCurrentPage('admin');
  }

  const handleUpgradeToSeller = async () => {
    if (!user?.token) { alert('Veuillez vous reconnecter'); return; }
    try {
      await createSellerRequest(user.token);
      alert("Demande envoyée. Un administrateur doit l'approuver.");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Impossible d'envoyer la demande");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onProductClick={handleProductClick}
            onNavigateToCatalog={() => setCurrentPage('catalog')}
          />
        );
      case 'catalog':
        return (
          <CatalogPage
            onProductClick={handleProductClick}
            userInterests={user?.interests}
          />
        );
      case 'product':
        return (
          <ProductDetailPage
            productId={selectedProductId}
            user={user}
            onBack={() => setCurrentPage('catalog')}
            onOpenChat={() => setShowChat(true)}
            onAddToCart={handleAddToCart}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            user={user}
            onProductClick={handleProductClick}
            onOpenChat={() => setShowChat(true)}
            onAddProduct={() => setShowAddProduct(true)}
            onUpgradeToSeller={handleUpgradeToSeller}
          />
        );
      case 'admin':
        return <AdminDashboard user={user} />;
      default:
        return (
          <HomePage
            onProductClick={handleProductClick}
            onNavigateToCatalog={() => setCurrentPage('catalog')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#f7f0e8]">
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.08)_0.5px,transparent_0.5px)] [background-size:6px_6px]" />
      <Header
        user={user}
        onLogin={() => setShowLoginModal(true)}
        onSignup={() => setShowSignUpModal(true)}
        onLogout={handleLogout}
        onNavigate={(page) => setCurrentPage(page)}
        currentPage={currentPage}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setShowCart(true)}
        onAddProduct={() => {
          if (!user) {
            setShowLoginModal(true);
          } else {
            setShowAddProduct(true);
          }
        }}
      />

      <main className="relative z-10">{renderPage()}</main>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
      )}

      {showSignUpModal && (
        <SignUpModal onClose={() => setShowSignUpModal(false)} onRegister={handleRegister} />
      )}

      {showChat && user && (
        <ChatWidget user={user} onClose={() => setShowChat(false)} />
      )}

      {showCart && (
        <CartDrawer
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          user={user}
          onLogin={() => {
            setShowCart(false);
            setShowLoginModal(true);
          }}
          onCheckout={handleCheckoutCart}
        />
      )}

      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onSubmit={handleAddProduct}
        />
      )}
    </div>
  );
}

export default App;
