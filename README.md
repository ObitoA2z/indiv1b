# La Petite Maison de l Epouvante

Application web full-stack pour publier, consulter et acheter des produits epouvante.

## Fonctionnalite metier principale
- Publication et consultation de produits epouvante.

## Stack technique
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + Prisma
- Base: SQLite (Prisma)
- Messaging: RabbitMQ
- Monitoring: Prometheus + Grafana
- Conteneurisation: Docker / Docker Compose
- CI/CD: GitHub Actions

## Lancement en local (Docker)
1. Renseigner `.env` a la racine (ex: `JWT_SECRET`, `STRIPE_SECRET_KEY`).
2. Lancer:
   - `docker compose up --build`
3. Acceder a:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:4004`
   - RabbitMQ UI: `http://localhost:15672`

## Lancement backend sans Docker
1. Aller dans `backend`.
2. Installer les dependances:
   - `npm ci`
3. Generer Prisma client:
   - `npx prisma generate`
4. Appliquer schema/migrations:
   - `npx prisma migrate deploy`
5. Seed:
   - `npx prisma db seed`
6. Demarrer:
   - `npm run dev`

## Tests
- Backend unitaires:
  - `npm --prefix backend run test:unit`
- Backend integration:
  - `npm --prefix backend run test:integration`
- Frontend build/typecheck:
  - `npm --prefix frontend run build`
  - `npm --prefix frontend run typecheck`

## Comptes et roles
- Roles: `BUYER`, `SELLER`, `ADMIN`
- Les comptes se creent via `POST /api/auth/register`
- Listing comptes (admin): `GET /api/admin/users`

## Routes API principales
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/admin/users`

## Notes securite appliquees
- Auth JWT + controle de roles
- CORS sur origine frontend configuree
- Headers de securite de base
- Limitation des tentatives de login

## Dossier de conformite V1
- Backlog + criteres d acceptation: `docs/backlog.md`
- Exigences qualite ISO 25010: `docs/quality-requirements.md`
- Metriques et seuils: `docs/metrics.md`
- Dette technique liee aux metriques: `docs/tech-debt-register.md`
- DevSecOps lifecycle: `docs/devsecops-lifecycle.md`
- Schema CI/CD detaille: `docs/cicd-schema.md`
- Script de charge + resultats: `load/k6-smoke.js`, `docs/load-test-results.md`
- Audit securite V1: `docs/security-audit-v1.md`
- Plan de remediation: `docs/remediation-plan.md`
- Sandbox + POC: `docs/sandbox-experiment.md`, `docs/poc-feasibility.md`
- Cartographie competences + formation: `docs/skills-matrix.md`, `docs/training-plan.md`
- Runbook exploitation/observabilite: `docs/operations-runbook.md`
- Pack preuves soutenance: `docs/soutenance-evidence-pack.md`

## Infra complementaire
- TLS ingress manifest: `k8s/ingress.yaml`
- Autoscaling manifests: `k8s/backend-hpa.yaml`, `k8s/frontend-hpa.yaml`

## URLs HTTPS locales (Kubernetes)
- Frontend: `https://petite-maison-epouvante.local`
- API backend: `https://api.petite-maison-epouvante.local`
- Grafana: `https://grafana.petite-maison-epouvante.local`
- Prometheus: `https://prometheus.petite-maison-epouvante.local`
- RabbitMQ UI: `https://rabbitmq.petite-maison-epouvante.local`
