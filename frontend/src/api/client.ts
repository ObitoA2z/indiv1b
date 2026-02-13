import type { Product } from '../data/mockData';
import type { ProductFormData } from '../components/AddProductModal';

// Helper pour construire les URLs d'API sans doubler "/api".
// - En dev local, VITE_API_URL peut etre en HTTP.
// - En prod, une base absolue en HTTP est forcee en HTTPS.
const RAW_API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
const IS_PROD = Boolean(import.meta.env.PROD);

function normalizeApiBase(rawBase: string): string {
  if (!rawBase) return '';

  try {
    const parsed = new URL(rawBase);
    if (IS_PROD && parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return rawBase.replace(/\/$/, '');
  }
}

const API_BASE = normalizeApiBase(RAW_API_BASE);

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (API_BASE) {
    try {
      const u = new URL(API_BASE);
      // Nettoie le trailing slash Ã©ventuel et concatÃ¨ne le chemin
      const basePath = u.pathname.replace(/\/$/, '');
      u.pathname = `${basePath}${normalizedPath}`;
      return u.toString();
    } catch {
      // Si API_BASE n'est pas une URL absolue, on la traite comme prÃ©fixe de chemin
      const base = API_BASE.replace(/\/$/, '');
      return `${base}${normalizedPath}`;
    }
  }

  // Aucun RAW_API_BASE : on utilise un chemin relatif (utile en Kube avec Nginx proxy /api)
  return normalizedPath;
}

function getStoredAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem('epouvante_user');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { token?: unknown };
    return typeof parsed?.token === 'string' && parsed.token.length > 0 ? parsed.token : undefined;
  } catch {
    return undefined;
  }
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN' | string;
  active?: boolean;
  address?: string | null;
  phone?: string | null;
  gender?: string | null;
}

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN' | string;
  active?: boolean;
  address?: string | null;
  phone?: string | null;
  gender?: string | null;
}
export async function adminListUsers(token: string, role?: string, q?: string, page: number = 1, pageSize: number = 10): Promise<{ total: number; page: number; pageSize: number; items: AdminUserDTO[] }> {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (q) params.set('q', q);
  if (page) params.set('page', String(page));
  if (pageSize) params.set('pageSize', String(pageSize));
  const res = await fetch(buildApiUrl(`/api/admin/users?${params.toString()}`), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Impossible de lister les utilisateurs");
  return res.json();
}
export async function adminSetUserRole(token: string, id: string, role: 'BUYER' | 'SELLER' | 'ADMIN'): Promise<AdminUserDTO> {
  const res = await fetch(buildApiUrl(`/api/admin/users/${id}/role`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Impossible de mettre Ã  jour le rÃ´le");
  }
  return res.json();
}

export async function adminSetUserActive(token: string, id: string, active: boolean): Promise<AdminUserDTO> {
  const res = await fetch(buildApiUrl(`/api/admin/users/${id}/active`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ active }),
  });
  if (!res.ok) throw new Error("Impossible de mettre Ã  jour l'Ã©tat du compte");
  return res.json();
}

export interface SellerRequest {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  message?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createSellerRequest(token: string, message?: string): Promise<SellerRequest> {
  const res = await fetch(buildApiUrl('/api/users/me/request-seller'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Impossible de crÃ©er la demande vendeur');
  }
  return res.json();
}

export async function listSellerRequests(token: string, status: string = 'pending'): Promise<SellerRequest[]> {
  const res = await fetch(buildApiUrl(`/api/admin/seller-requests?status=${encodeURIComponent(status)}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Impossible de lister les demandes vendeur');
  return res.json();
}

export async function approveSellerRequest(token: string, id: string): Promise<void> {
  const res = await fetch(buildApiUrl(`/api/admin/seller-requests/${id}/approve`), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Impossible d'approuver la demande");
}

export async function rejectSellerRequest(token: string, id: string, message?: string): Promise<void> {
  const res = await fetch(buildApiUrl(`/api/admin/seller-requests/${id}/reject`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Impossible de rejeter la demande');
}

export async function upgradeToSeller(token: string): Promise<AuthUser> {
  const res = await fetch(buildApiUrl('/api/users/me/upgrade-to-seller'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Impossible de passer en vendeur');
  }
  return res.json();
}

export interface AuthResponse {
  token?: string;
  user: AuthUser;
  message?: string;
}

export async function loginUser(params: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Erreur de connexion');
  }

  return res.json();
}

export async function registerUser(params: { name?: string; email: string; password: string; role?: 'BUYER' | 'SELLER'; address?: string; phone?: string; gender?: string; sellerMessage?: string }): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl('/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Erreur lors de l'inscription");
  }

  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(buildApiUrl('/api/products'));
  if (!res.ok) {
    throw new Error('Erreur lors du chargement des produits');
  }
  const data = await res.json();
  return (data as any[]).map((p) => ({
    ...p,
    category: p.category ?? p.categoryId,
    createdAt:
      typeof p.createdAt === 'string'
        ? p.createdAt
        : new Date(p.createdAt).toISOString(),
  }));
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(buildApiUrl(`/api/products/${id}`));
  if (!res.ok) {
    throw new Error('Produit non trouvÃ©');
  }
  const p = await res.json();
  return {
    ...p,
    category: p.category ?? p.categoryId,
    createdAt:
      typeof p.createdAt === 'string'
        ? p.createdAt
        : new Date(p.createdAt).toISOString(),
  } as Product;
}

export interface CreateProductPayload extends ProductFormData {
  sellerId: string;
  sellerName: string;
  location?: string;
}

export async function uploadImage(file: File, token?: string): Promise<string> {
  const authToken = token || getStoredAuthToken();
  if (!authToken) {
    throw new Error('Connexion requise pour uploader une image');
  }

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(buildApiUrl('/api/upload'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l'upload de l'image");
  }

  const data = await res.json();
  return data.url as string;
}

export async function createProduct(payload: CreateProductPayload, token?: string): Promise<Product> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildApiUrl('/api/products'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la crÃ©ation de l'objet");
  }

  return res.json();
}

export async function createCheckoutSession(productId: string, token: string, quantity: number = 1): Promise<{ url: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(buildApiUrl('/api/checkout/session'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Erreur lors de la crÃ©ation de la session de paiement');
  }

  return res.json();
}

export interface OrderDTO {
  id: string;
  productId: string;
  buyerId: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function createOrder(productId: string, token: string, quantity: number = 1): Promise<OrderDTO> {
  const res = await fetch(buildApiUrl('/api/orders'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Erreur lors de la creation de la commande');
  }

  return res.json();
}

export async function approveProduct(id: string, token?: string): Promise<Product> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildApiUrl(`/api/admin/products/${id}/approve`), {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l'approbation de l'objet");
  }

  return res.json();
}

export async function rejectProduct(id: string, token?: string): Promise<Product> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildApiUrl(`/api/admin/products/${id}/reject`), {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    throw new Error("Erreur lors du rejet de l'objet");
  }

  return res.json();
}

export async function deleteProductAdmin(id: string, token?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(buildApiUrl(`/api/admin/products/${id}`), {
    method: 'DELETE',
    headers,
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Erreur lors de la suppression de l'objet");
  }
}


