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
- Conteneurisation: Docker + Kubernetes
- CI/CD: GitHub Actions

## Lancement en local (Kubernetes)
1. Demarrer Minikube:
   - `minikube start`
2. Verifier ArgoCD:
   - `kubectl -n argocd get application petite-maison-epouvante-full`
3. Acceder aux services via Ingress HTTPS:
   - Frontend: `https://petite-maison-epouvante.local:9443`
   - Backend health: `https://api.petite-maison-epouvante.local:9443/api/health`
   - Grafana: `https://grafana.petite-maison-epouvante.local:9443`
   - Prometheus: `https://prometheus.petite-maison-epouvante.local:9443`
   - RabbitMQ UI: `https://rabbitmq.petite-maison-epouvante.local:9443`

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

## Quality Gates CI/CD
- **Dependances npm (backend/frontend):** blocage sur vulnerabilites `HIGH/CRITICAL`.
- **Scans Trivy images + manifests K8s:** blocage sur `HIGH/CRITICAL`.
- **Jobs references:** `.github/workflows/ci.yml`, `.gitlab-ci.yml`.
- **Artefacts de preuve:** rapports `backend-audit.json`, `frontend-audit.json`, `trivy-*.json`.

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
- Pack preuves soutenance: `docs/soutenance-evidence-pack.md`
- Guide start/stop local: `docs/start-stop-local.md`
- Resultats tests de charge: `docs/load-test-results.md`

## Infra complementaire
- TLS ingress manifest: `k8s/ingress.yaml`
- Autoscaling manifests: `k8s/backend-hpa.yaml`, `k8s/frontend-hpa.yaml`

## URLs HTTPS locales (Kubernetes)
- Frontend: `https://petite-maison-epouvante.local:9443`
- API backend: `https://api.petite-maison-epouvante.local:9443`
- Grafana: `https://grafana.petite-maison-epouvante.local:9443`
- Prometheus: `https://prometheus.petite-maison-epouvante.local:9443`
- RabbitMQ UI: `https://rabbitmq.petite-maison-epouvante.local:9443`
