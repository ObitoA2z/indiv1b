import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  Trash2,
  Check,
  X as XIcon,
  Shield,
  FileWarning,
  ClipboardList,
} from 'lucide-react';
import type { Product } from '../data/mockData';
import { categories } from '../data/mockData';
import { getImageUrl } from '../lib/getImageUrl';
import {
  fetchProducts,
  approveProduct,
  rejectProduct,
  deleteProductAdmin,
  listSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
  adminListUsers,
  adminSetUserRole,
  adminSetUserActive,
} from '../api/client';
import type { User } from '../App';

type TabId = 'overview' | 'products' | 'users' | 'categories' | 'fraud' | 'seller-requests';

interface AdminDashboardProps {
  user: User | null;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [newCategory, setNewCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerRequests, setSellerRequests] = useState<any[]>([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFilter, setUsersFilter] = useState<'ALL' | 'BUYER' | 'SELLER' | 'ADMIN'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch {
        setError('Impossible de charger les produits');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingProducts = useMemo(() => products.filter((p) => p.status === 'pending'), [products]);

  const tabButtonClass = (tab: TabId) =>
    `w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
      activeTab === tab
        ? 'border-cyan-300/45 bg-cyan-300/15 text-cyan-50'
        : 'border-cyan-300/20 bg-[#0a1226] text-cyan-100/70 hover:border-cyan-300/35 hover:text-cyan-50'
    }`;

  const loadUsers = async (role?: 'BUYER' | 'SELLER' | 'ADMIN') => {
    if (!user?.token) return;
    setUsersLoading(true);
    try {
      const res = await adminListUsers(user.token, role);
      setUsers(res.items);
      setTotalUsers(res.total);
    } catch {
      alert('Impossible de lister les utilisateurs');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadSellerRequests = async () => {
    if (!user?.token) return;
    setReqLoading(true);
    try {
      const list = await listSellerRequests(user.token, 'pending');
      setSellerRequests(list);
    } catch {
      alert('Impossible de charger les demandes vendeur');
    } finally {
      setReqLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user || user.role !== 'ADMIN') {
      alert('Acces reserve aux administrateurs');
      return;
    }
    try {
      const updated = await approveProduct(id, user.token);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      alert("Erreur lors de l'approbation du produit");
    }
  };

  const handleReject = async (id: string) => {
    if (!user || user.role !== 'ADMIN') {
      alert('Acces reserve aux administrateurs');
      return;
    }
    try {
      const updated = await rejectProduct(id, user.token);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      alert('Erreur lors du rejet du produit');
    }
  };

  if (loading) {
    return (
      <div className="pm-frame py-8">
        <p className="text-cyan-100/75">Chargement des donnees admin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pm-frame py-8">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="pm-frame py-8">
      <div className="mb-6 rounded-3xl border border-cyan-300/25 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Back-office</p>
        <h1 className="text-2xl text-[#effbff]">Administration de la Petite Maison de l'Epouvante</h1>
        <p className="text-cyan-100/70">Pilotage produits, membres, moderation et securite.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-cyan-300/25 bg-[#081128] p-4">
          <div className="mb-2 inline-flex rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2">
            <Users className="h-5 w-5 text-cyan-100" />
          </div>
          <p className="text-xs uppercase tracking-widest text-cyan-100/60">Utilisateurs</p>
          <p className="text-xl text-[#effbff]">{totalUsers ?? '-'}</p>
        </article>

        <article className="rounded-2xl border border-cyan-300/25 bg-[#081128] p-4">
          <div className="mb-2 inline-flex rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2">
            <Package className="h-5 w-5 text-cyan-100" />
          </div>
          <p className="text-xs uppercase tracking-widest text-cyan-100/60">Produits</p>
          <p className="text-xl text-[#effbff]">{products.length}</p>
        </article>

        <article className="rounded-2xl border border-amber-300/35 bg-amber-300/10 p-4">
          <div className="mb-2 inline-flex rounded-lg border border-amber-300/35 bg-amber-300/10 p-2">
            <AlertTriangle className="h-5 w-5 text-amber-100" />
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-100/70">En attente</p>
          <p className="text-xl text-amber-50">{pendingProducts.length}</p>
        </article>

        <article className="rounded-2xl border border-emerald-300/35 bg-emerald-300/10 p-4">
          <div className="mb-2 inline-flex rounded-lg border border-emerald-300/35 bg-emerald-300/10 p-2">
            <TrendingUp className="h-5 w-5 text-emerald-100" />
          </div>
          <p className="text-xs uppercase tracking-widest text-emerald-100/70">Commission</p>
          <p className="text-xl text-emerald-50">5%</p>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="space-y-2 rounded-2xl border border-cyan-300/25 bg-[#081128] p-3">
          <button onClick={() => setActiveTab('overview')} className={tabButtonClass('overview')}>
            Vue generale
          </button>
          <button onClick={() => setActiveTab('products')} className={tabButtonClass('products')}>
            Produits ({pendingProducts.length} en attente)
          </button>
          <button
            onClick={async () => {
              setActiveTab('users');
              await loadUsers(usersFilter === 'ALL' ? undefined : usersFilter);
            }}
            className={tabButtonClass('users')}
          >
            Utilisateurs
          </button>
          <button onClick={() => setActiveTab('categories')} className={tabButtonClass('categories')}>
            Categories
          </button>
          <button onClick={() => setActiveTab('fraud')} className={tabButtonClass('fraud')}>
            Detection fraude
          </button>
          <button
            onClick={async () => {
              setActiveTab('seller-requests');
              await loadSellerRequests();
            }}
            className={tabButtonClass('seller-requests')}
          >
            Demandes vendeur
          </button>
        </aside>

        <section className="rounded-2xl border border-cyan-300/25 bg-[#060c1e] p-4 sm:p-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-4">
                <h3 className="mb-2 text-cyan-50">Activite recente</h3>
                <ul className="space-y-2 text-sm text-cyan-100/70">
                  <li className="rounded-xl border border-cyan-300/15 bg-[#081128] p-3">Nouveau produit depose en moderation.</li>
                  <li className="rounded-xl border border-cyan-300/15 bg-[#081128] p-3">Demande vendeur recue pour verification.</li>
                  <li className="rounded-xl border border-cyan-300/15 bg-[#081128] p-3">Connexion admin enregistree.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-4">
                  <p className="text-xs uppercase tracking-widest text-cyan-100/60">Aujourd'hui</p>
                  <p className="text-lg text-cyan-50">12 ventes</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-4">
                  <p className="text-xs uppercase tracking-widest text-cyan-100/60">Cette semaine</p>
                  <p className="text-lg text-cyan-50">87 ventes</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-4">
                  <p className="text-xs uppercase tracking-widest text-cyan-100/60">Ce mois</p>
                  <p className="text-lg text-cyan-50">342 ventes</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h2 className="mb-4 text-cyan-50">Produits ({products.length})</h2>
              {products.length > 0 ? (
                <div className="space-y-3">
                  {products.map((product) => (
                    <article key={product.id} className="rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-3">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <img src={getImageUrl(product.image)} alt={product.title} className="h-28 w-full rounded-xl object-cover sm:w-36" />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-cyan-50">{product.title}</h3>
                          <p className="line-clamp-2 text-sm text-cyan-100/70">{product.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-cyan-100/65">
                            <span className="rounded-full border border-cyan-300/20 px-2 py-1">Prix: {product.price.toFixed(2)} EUR</span>
                            <span className="rounded-full border border-cyan-300/20 px-2 py-1">Vendeur: {product.sellerName}</span>
                            <span className="rounded-full border border-cyan-300/20 px-2 py-1">Categorie: {product.category}</span>
                            <span className="rounded-full border border-cyan-300/20 px-2 py-1">Statut: {product.status}</span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {product.status === 'pending' && (
                              <>
                                <button onClick={() => handleApprove(product.id)} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm text-white">
                                  <Check className="h-4 w-4" /> Approuver
                                </button>
                                <button onClick={() => handleReject(product.id)} className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-sm text-white">
                                  <XIcon className="h-4 w-4" /> Rejeter
                                </button>
                              </>
                            )}
                            <button
                              onClick={async () => {
                                if (!user || user.role !== 'ADMIN') {
                                  alert('Acces reserve aux administrateurs');
                                  return;
                                }
                                if (!confirm('Supprimer definitivement ce produit ?')) return;
                                try {
                                  await deleteProductAdmin(product.id, user.token);
                                  setProducts((prev) => prev.filter((p) => p.id !== product.id));
                                } catch {
                                  alert('Erreur lors de la suppression du produit');
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-sm text-white"
                            >
                              <Trash2 className="h-4 w-4" /> Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-6 text-center text-cyan-100/70">Aucun produit</div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-cyan-50">Gestion des utilisateurs</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-cyan-100/65">Filtrer:</label>
                  <select
                    value={usersFilter}
                    onChange={async (e) => {
                      const value = e.target.value as 'ALL' | 'BUYER' | 'SELLER' | 'ADMIN';
                      setUsersFilter(value);
                      await loadUsers(value === 'ALL' ? undefined : value);
                    }}
                    className="rounded-xl border border-cyan-300/25 bg-[#0a1226] px-3 py-1.5 text-sm text-cyan-50"
                  >
                    <option value="ALL">Tous</option>
                    <option value="BUYER">Acheteurs</option>
                    <option value="SELLER">Vendeurs</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>

              {usersLoading ? (
                <p className="text-cyan-100/70">Chargement...</p>
              ) : users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((u) => (
                    <article key={u.id} className="rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-3">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-2">
                            <Shield className="h-4 w-4 text-cyan-100" />
                          </div>
                          <div>
                            <p className="text-cyan-50">{u.name}</p>
                            <p className="text-sm text-cyan-100/70">{u.email}</p>
                            {(u.address || u.phone || u.gender) && (
                              <div className="mt-1 space-y-0.5 text-xs text-cyan-100/55">
                                {u.address && <p>Adresse: {u.address}</p>}
                                {u.phone && <p>Tel: {u.phone}</p>}
                                {u.gender && <p>Genre: {u.gender}</p>}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-cyan-300/20 px-2 py-1 text-xs text-cyan-100">{u.role}</span>
                          <span className={`rounded-full px-2 py-1 text-xs ${u.active ? 'bg-emerald-500/20 text-emerald-100' : 'bg-amber-500/20 text-amber-100'}`}>
                            {u.active ? 'Actif' : 'En attente'}
                          </span>
                          <button
                            onClick={async () => {
                              if (!user?.token) return;
                              try {
                                const updated = await adminSetUserRole(user.token, u.id, 'BUYER');
                                setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
                              } catch {
                                alert('Maj du role impossible');
                              }
                            }}
                            className="rounded-lg border border-cyan-300/25 bg-[#071022] px-2 py-1 text-xs text-cyan-100"
                          >
                            Acheteur
                          </button>
                          <button
                            onClick={async () => {
                              if (!user?.token) return;
                              try {
                                const updated = await adminSetUserRole(user.token, u.id, 'SELLER');
                                setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
                              } catch {
                                alert('Maj du role impossible');
                              }
                            }}
                            className="rounded-lg border border-cyan-300/25 bg-[#071022] px-2 py-1 text-xs text-cyan-100"
                          >
                            Vendeur
                          </button>
                          <button
                            onClick={async () => {
                              if (!user?.token) return;
                              try {
                                const updated = await adminSetUserRole(user.token, u.id, 'ADMIN');
                                setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
                              } catch {
                                alert('Maj du role impossible');
                              }
                            }}
                            className="rounded-lg border border-cyan-300/25 bg-[#071022] px-2 py-1 text-xs text-cyan-100"
                          >
                            Admin
                          </button>
                          <button
                            onClick={async () => {
                              if (!user?.token) return;
                              try {
                                const updated = await adminSetUserActive(user.token, u.id, !u.active);
                                setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
                              } catch {
                                alert('Maj du statut impossible');
                              }
                            }}
                            className="rounded-lg border border-cyan-300/25 bg-[#071022] px-2 py-1 text-xs text-cyan-100"
                          >
                            {u.active ? 'Desactiver' : 'Activer'}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-cyan-100/70">Aucun utilisateur</p>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <h2 className="mb-4 text-cyan-50">Gestion des categories</h2>
              <div className="mb-4 rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-4">
                <label className="mb-2 block text-sm text-cyan-100/70">Ajouter une categorie</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nom de la categorie"
                    className="flex-1 rounded-xl border border-cyan-300/25 bg-[#071022] px-3 py-2 text-sm text-cyan-50"
                  />
                  <button className="inline-flex items-center gap-1 rounded-xl bg-cyan-600 px-3 py-2 text-sm text-white">
                    <Plus className="h-4 w-4" /> Ajouter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-3">
                    <span className="text-sm text-cyan-50">{category.name}</span>
                    <button className="rounded-lg p-1 text-red-300 hover:bg-red-500/15">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seller-requests' && (
            <div>
              <h2 className="mb-4 text-cyan-50">Demandes vendeur</h2>
              {reqLoading ? (
                <p className="text-cyan-100/70">Chargement...</p>
              ) : sellerRequests.length > 0 ? (
                <div className="space-y-2">
                  {sellerRequests.map((r) => (
                    <article key={r.id} className="flex flex-col gap-3 rounded-2xl border border-cyan-300/20 bg-[#0a1226] p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-cyan-50">{r.user?.name || r.user?.email}</p>
                        <p className="text-sm text-cyan-100/70">{r.user?.email}</p>
                        <p className="text-xs text-cyan-100/55">Demande du {new Date(r.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (!user?.token) return;
                            try {
                              await approveSellerRequest(user.token, r.id);
                              setSellerRequests((prev) => prev.filter((x) => x.id !== r.id));
                            } catch {
                              alert("Erreur lors de l'approbation");
                            }
                          }}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm text-white"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={async () => {
                            if (!user?.token) return;
                            try {
                              await rejectSellerRequest(user.token, r.id);
                              setSellerRequests((prev) => prev.filter((x) => x.id !== r.id));
                            } catch {
                              alert('Erreur lors du rejet');
                            }
                          }}
                          className="rounded-xl bg-red-600 px-3 py-1.5 text-sm text-white"
                        >
                          Rejeter
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-cyan-100/70">Aucune demande en attente</p>
              )}
            </div>
          )}

          {activeTab === 'fraud' && (
            <div>
              <h2 className="mb-4 text-cyan-50">Detection des fraudes</h2>
              <div className="mb-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4">
                <p className="mb-1 inline-flex items-center gap-2 text-amber-100"><ClipboardList className="h-4 w-4" /> Alertes automatiques</p>
                <p className="text-sm text-amber-100/75">
                  La plateforme surveille les variations de prix, les comptes suspects et les activites anormales.
                </p>
              </div>

              <div className="space-y-2">
                <article className="rounded-2xl border border-red-300/30 bg-red-500/10 p-4">
                  <p className="mb-1 inline-flex items-center gap-2 text-red-100"><FileWarning className="h-4 w-4" /> Changement de prix suspect</p>
                  <p className="text-sm text-red-100/75">Un produit a augmente de 300% en moins de 24h. Verification manuelle recommandee.</p>
                </article>
                <article className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4">
                  <p className="mb-1 inline-flex items-center gap-2 text-amber-100"><AlertTriangle className="h-4 w-4" /> Vendeur signale</p>
                  <p className="text-sm text-amber-100/75">Plusieurs avis negatifs recents ont ete detectes. Controle du profil en attente.</p>
                </article>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
