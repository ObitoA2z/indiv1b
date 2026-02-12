# Backlog V1 - La Petite Maison de l Epouvante

## Scope V1
The V1 scope is focused on one business feature: publish and consult horror products.

## User stories
| ID | User story | Priority | Status |
| --- | --- | --- | --- |
| US-001 | As a visitor, I can view the list of available products so I can discover the catalog. | Must | Done |
| US-002 | As a visitor, I can open a product detail page so I can read description and price. | Must | Done |
| US-003 | As a buyer, I can create an account and login so I can interact with the platform. | Must | Done |
| US-004 | As a seller, I can publish a product so it can be reviewed by admin. | Must | Done |
| US-005 | As an admin, I can approve or reject products so only validated content is public. | Must | Done |
| US-006 | As a buyer, I can create an order from an available product. | Must | Done |
| US-007 | As an admin, I can list users and update role/activation state. | Should | Done |
| US-008 | As a buyer, I can request seller role and track request status. | Should | Done |

## Acceptance criteria
### US-001 Catalog
- Given products exist with status `available`, when `GET /api/products` is called, then the response is `200` and contains product list.

### US-002 Product detail
- Given a valid product id, when `GET /api/products/:id` is called, then the response is `200` and returns the product.
- Given an unknown product id, then the response is `404`.

### US-003 Account + login
- Given valid signup data, when `POST /api/auth/register` is called, then the response is `201` and returns `token` + `user`.
- Given valid credentials, when `POST /api/auth/login` is called, then the response is `200` and returns `token` + `user`.

### US-004 Seller publish
- Given a logged seller, when `POST /api/products` is called with required fields, then response is `201` and product status is `pending`.
- Given a buyer token, then response is `403`.

### US-005 Admin moderation
- Given an admin token, when `POST /api/admin/products/:id/approve`, then status becomes `available`.
- Given an admin token, when `POST /api/admin/products/:id/reject`, then status becomes `rejected`.

### US-006 Order creation
- Given a logged user and valid product id, when `POST /api/orders` is called, then response is `201` and order is stored.
- Given missing product id, then response is `400`.

### US-007 Admin user management
- Given admin token, when `GET /api/admin/users`, then response is `200` with paginated users.
- Given admin token, when `POST /api/admin/users/:id/role`, then role is updated.
- Given admin token, when `POST /api/admin/users/:id/active`, then active flag is updated.

### US-008 Seller request workflow
- Given logged buyer, when `POST /api/users/me/request-seller`, then response is `201`.
- Given admin token, when `POST /api/admin/seller-requests/:id/approve`, then user role becomes `SELLER`.

## Test mapping
- Unit tests: `backend/tests/unit/auth.test.js`, `backend/tests/unit/server.test.js`, `backend/tests/unit/rabbitmq.test.js`
- Integration tests: `backend/scripts/test-integration.js`
- Smoke tests: `backend/scripts/smoke-routes.js`
