# Pack Preuves Soutenance

Ce document liste les preuves a produire pendant la soutenance pour valider les criteres du bloc.

## 1) Fonctionnalite metier E2E
- Commande:
  - `npm --prefix backend run test:integration`
- Preuve attendue:
  - sortie `Integration tests: OK`
  - scenario inclus: publication vendeur, approbation admin, consultation produit, creation commande.

## 2) Qualite et tests
- Commandes:
  - `npm --prefix backend run test:unit`
  - `npm --prefix backend run test:integration`
  - `npm --prefix backend run test:smoke`
  - `npm --prefix frontend run typecheck`
  - `npm --prefix frontend run build`
- Preuves attendues:
  - tous les jobs en succes.

## 3) CI/CD et securite
- Fichier pipeline:
  - `.github/workflows/ci.yml`
- Preuves attendues:
  - `npm audit` backend/frontend en artifact JSON.
  - Trivy backend/frontend en artifact JSON.
  - gate CI bloquant sur vulnerabilites CRITICAL (dependances + images).

## 4) Deploiement Kubernetes
- Manifestes:
  - `k8s/*.yaml`
- Commandes de preuve (cluster):
  - `kubectl get ns`
  - `kubectl get deploy,svc,ingress,hpa -n petite-maison-epouvante`
  - `kubectl describe hpa petite-maison-backend-hpa -n petite-maison-epouvante`
- Preuves attendues:
  - ressources presentes et HPA actif.

## 5) HTTPS / TLS
- Manifestes:
  - `k8s/ingress.yaml`
- Commande de preuve:
  - `curl -I https://<host>`
- Preuve attendue:
  - certificat valide + redirection HTTPS active.

## 6) Observabilite
- Services locaux:
  - `docker compose up -d prometheus grafana rabbitmq backend`
- URLs:
  - `http://localhost:9090` (Prometheus)
  - `http://localhost:3000` (Grafana)
- Dashboard:
  - `grafana/dashboards/petite-maison-overview.json`
- Preuve attendue:
  - dashboard avec metriques vivantes (`up`, RabbitMQ rates, queue depth, connections).

## 7) Charge
- Scripts:
  - `load/k6-smoke.js`
  - `load/k6-stress.js`
  - `load/order-stress.js`
- Commandes:
  - `docker run --rm -e BASE_URL=http://host.docker.internal:4004 -v "$PWD/load:/scripts" grafana/k6 run /scripts/k6-smoke.js`
  - `docker run --rm -e BASE_URL=http://host.docker.internal:4004 -v "$PWD/load:/scripts" grafana/k6 run /scripts/k6-stress.js`
  - `node load/order-stress.js`
- Preuve attendue:
  - captures resultats + courbes Grafana qui evoluent.
