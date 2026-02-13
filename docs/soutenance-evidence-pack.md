# Pack Preuves Soutenance — DevSecOps / Qualite V1

## 1) Backlog + couverture fonctionnelle
- **Backlog court et traceable:** `docs/backlog.md`
- **Preuves code:** `backend/src/routes/*.js`, `frontend/src/components/*.tsx`
- **Preuves tests:** `backend/scripts/test-integration.js`, `backend/scripts/smoke-routes.js`

## 2) Exigences qualite (ISO/IEC 25010)
- **Mapping exigences mesurables:** `docs/quality-requirements.md`
- **Metriques de suivi:** `docs/metrics.md`
- **Dette associee:** `docs/tech-debt-register.md`

## 3) CI/CD + quality gates
- **GitHub CI (tests + scans + gates):** `.github/workflows/ci.yml`
- **GitLab CI harmonise (scans bloquants HIGH/CRITICAL):** `.gitlab-ci.yml`
- **Schema CI/CD versionne:** `docs/ci-cd-diagram.md`
- **Preuves attendues:** jobs verts + artefacts `*audit*.json`, `trivy-*.json`

## 4) Securite V1 + remediations
- **Audit securite date:** `docs/security-audit-v1.md`
- **Plan remediations P1/P2/P3:** `docs/remediation-plan.md`
- **Correctifs techniques integres:** `backend/src/routes/products.routes.js`, `backend/src/routes/upload.routes.js`, `backend/src/routes/users.routes.js`

## 5) Deploiement, TLS, observabilite
- **Manifests K8s:** `k8s/*.yaml`
- **Ingress TLS:** `k8s/ingress.yaml` (secret `petite-maison-epouvante-tls`)
- **Prometheus/Grafana:** `k8s/prometheus-*.yaml`, `k8s/grafana-*.yaml`, `grafana/dashboards/petite-maison-overview.json`
- **Guide start/stop:** `docs/start-stop-local.md`

## 6) Charge et performance
- **Scripts:** `load/k6-smoke.js`, `load/k6-stress.js`, `load/order-stress.js`
- **Resultat de reference:** `docs/load-test-results.md`

## 7) Bac a sable / POC / competences
- **Experiment sandbox:** `docs/sandbox-experiment.md`
- **POC faisabilite:** `docs/poc-feasibility.md`
- **Matrice competences:** `docs/skills-matrix.md`
- **Plan formation:** `docs/training-plan.md`

## 8) Commandes minimales a montrer en demo
```powershell
npm --prefix backend run test
npm --prefix frontend run typecheck
npm --prefix frontend run build
docker run --rm -e BASE_URL=http://host.docker.internal:4004 -v "$PWD/load:/scripts" grafana/k6 run /scripts/k6-smoke.js
kubectl -n petite-maison-epouvante get deploy,svc,ingress,hpa,networkpolicy
kubectl -n argocd get application petite-maison-epouvante-full
```
