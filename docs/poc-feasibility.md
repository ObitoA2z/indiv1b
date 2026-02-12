# POC Feasibility Note (G2)

## POC scope
Prove that a full product lifecycle can run on the chosen stack without adding new technologies.

## Hypothesis
With React + Express + Prisma + RabbitMQ + Docker/Kubernetes manifests, we can publish, moderate, and order products with role-based access.

## Success criteria
- Auth flow works (`register/login`).
- Seller can publish product (`POST /api/products`).
- Admin can approve/reject product.
- Buyer can place order.
- Core routes pass smoke test.

## Evidence
- Routes implementation: `backend/src/routes/*.js`
- Auth/RBAC: `backend/src/auth.js`, `backend/src/routes/auth.routes.js`, `backend/src/routes/admin.routes.js`
- Smoke test script: `backend/scripts/smoke-routes.js`
- CI workflow: `.github/workflows/ci.yml`

## Result
POC confirmed for V1 scope.

## Next feasibility step
Move persistence and scalability assumptions from local SQLite/single-node broker to production-grade equivalents.
