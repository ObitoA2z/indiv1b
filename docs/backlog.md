# Backlog Produit V1 (DevSecOps / Qualite)

Statut reference: `done` = implemente dans le repo, `partial` = partiellement couvre.

## US-01 — Consultation catalogue public
- **Priorite:** P1 | **Statut:** done
- **Given** un visiteur non connecte, **When** il ouvre le catalogue, **Then** il voit la liste et le detail produit.
- **Endpoints:** `GET /api/products`, `GET /api/products/:id` (`backend/src/routes/products.routes.js`)
- **Front/Back:** `frontend/src/components/CatalogPage.tsx`, `frontend/src/components/ProductDetailPage.tsx`, `frontend/src/api/client.ts`
- **Tests associes:** smoke `backend/scripts/smoke-routes.js`, integration `backend/scripts/test-integration.js`

## US-02 — Authentification utilisateur
- **Priorite:** P1 | **Statut:** done
- **Given** un utilisateur avec email valide, **When** il se cree/connecte, **Then** il recoit un JWT et son profil.
- **Endpoints:** `POST /api/auth/register`, `POST /api/auth/login` (`backend/src/routes/auth.routes.js`)
- **Front/Back:** `frontend/src/components/LoginModal.tsx`, `frontend/src/components/SignUpModal.tsx`, `backend/src/auth.js`
- **Tests associes:** `backend/tests/unit/auth.test.js`, integration `backend/scripts/test-integration.js`

## US-03 — Publication produit par SELLER (statut pending)
- **Priorite:** P1 | **Statut:** done
- **Given** un SELLER authentifie, **When** il publie un produit, **Then** le produit est cree avec `status=pending`.
- **Endpoints:** `POST /api/products` (`backend/src/routes/products.routes.js`), `POST /api/upload` (`backend/src/routes/upload.routes.js`)
- **Front/Back:** `frontend/src/components/AddProductModal.tsx`, `frontend/src/App.tsx`
- **Tests associes:** integration `backend/scripts/test-integration.js`

## US-04 — Validation admin produit (available/rejected)
- **Priorite:** P1 | **Statut:** done
- **Given** un produit pending, **When** un ADMIN approuve/rejette, **Then** le statut devient `available` ou `rejected`.
- **Endpoints:** `POST /api/admin/products/:id/approve`, `POST /api/admin/products/:id/reject`
- **Front/Back:** `frontend/src/components/AdminDashboard.tsx`, `backend/src/routes/admin.routes.js`
- **Tests associes:** integration `backend/scripts/test-integration.js`

## US-05 — Achat/commande BUYER
- **Priorite:** P1 | **Statut:** done
- **Given** un BUYER authentifie et un produit disponible, **When** il commande, **Then** une commande est creee et publiee sur RabbitMQ.
- **Endpoints:** `POST /api/orders`, `GET /api/orders`, `POST /api/checkout/session`
- **Front/Back:** `frontend/src/components/ProductDetailPage.tsx`, `frontend/src/components/CartDrawer.tsx`, `backend/src/routes/orders.routes.js`
- **Tests associes:** integration `backend/scripts/test-integration.js`, charge `load/order-stress.js`

## US-06 — Demande de passage vendeur (BUYER -> SellerRequest)
- **Priorite:** P1 | **Statut:** done
- **Given** un BUYER connecte, **When** il envoie une demande vendeur, **Then** un `SellerRequest` est cree/maj en `pending`.
- **Endpoints:** `POST /api/users/me/request-seller`, `POST /api/users/me/upgrade-to-seller` (compat), `GET /api/users/me/seller-request`
- **Front/Back:** `frontend/src/App.tsx`, `frontend/src/api/client.ts`, `backend/src/routes/users.routes.js`
- **Tests associes:** integration `backend/scripts/test-integration.js`

## US-07 — Moderation des demandes vendeur (ADMIN)
- **Priorite:** P2 | **Statut:** done
- **Given** des demandes pending, **When** ADMIN approuve/rejette, **Then** role user et statut demande sont mis a jour.
- **Endpoints:** `GET /api/admin/seller-requests`, `POST /api/admin/seller-requests/:id/approve`, `POST /api/admin/seller-requests/:id/reject`
- **Front/Back:** `frontend/src/components/AdminDashboard.tsx`, `backend/src/routes/admin.routes.js`
- **Tests associes:** couverture indirecte integration + tests manuels admin

## US-08 — Edition produit securisee (SELLER proprietaire ou ADMIN)
- **Priorite:** P1 | **Statut:** done
- **Given** un produit existant, **When** un non proprietaire/non admin tente un patch, **Then** acces refuse; owner seller/admin peuvent modifier.
- **Endpoints:** `PATCH /api/products/:id` (`backend/src/routes/products.routes.js`)
- **Front/Back:** endpoint back uniquement (pas d’ecran edition dedie V1)
- **Tests associes:** integration `backend/scripts/test-integration.js` (401/403/200)
