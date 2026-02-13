# Exigences Qualite (ISO/IEC 25010) — V1

Scope base sur composants presents: backend/frontend Node+React, pipeline CI, scans npm/Trivy, scripts k6.

| Caracteristique ISO 25010 | Exigence mesurable (SLO / seuil) | Methode de mesure | Outil | Preuves repo |
|---|---|---|---|---|
| **Security** | 0 vulnerabilite **HIGH/CRITICAL** dans deps runtime backend/frontend | Audit dependances a chaque pipeline | GitHub Actions `backend`/`frontend` + GitLab `backend:test`/`frontend:test` | `.github/workflows/ci.yml`, `.gitlab-ci.yml` |
| **Security** | 0 vuln image conteneur **CRITICAL** (GH), 0 **HIGH/CRITICAL** (GL) | Scan image backend/frontend a chaque build main | Trivy image scan | `.github/workflows/ci.yml`, `.gitlab-ci.yml` |
| **Security** | 0 misconfig K8s **CRITICAL** (GH), 0 **HIGH/CRITICAL** (GL) | Scan config du dossier `k8s/` | Trivy config scan | `.github/workflows/ci.yml`, `.gitlab-ci.yml`, `k8s/*.yaml` |
| **Reliability** | `/api/health` doit repondre `200` en smoke; taux echec HTTP `<1%` | Smoke test API + checks HTTP | `backend/scripts/smoke-routes.js`, `load/k6-smoke.js` | `docs/load-test-results.md`, `backend/package.json` |
| **Performance efficiency** | `p95 http_req_duration < 500 ms` en profil smoke (10 VUs/60s) | Campagne charge smoke | k6 (`load/k6-smoke.js`) | `load/k6-smoke.js`, `docs/load-test-results.md` |
| **Maintainability** | Build + typecheck front OK; tests backend unit+integration OK sur chaque PR/push | Execution automatique pipeline CI | npm scripts + CI jobs | `frontend/package.json`, `backend/package.json`, `.github/workflows/ci.yml` |
| **Portability/Deployability** | Manifests K8s deployables en namespace dedie avec auto-sync GitOps | `kubectl apply` + ArgoCD sync `Synced/Healthy` | Kubernetes + ArgoCD | `k8s/*.yaml`, `k8s/argocd-application.yaml`, `docs/start-stop-local.md` |

## Notes de conformite V1
- Les seuils ci-dessus sont **bloquants CI** pour securite (audit deps/scans) via `.github/workflows/ci.yml` et `.gitlab-ci.yml`.
- La mesure perf actuelle est un profil smoke (`load/k6-smoke.js`), suffisante V1; extension stress dans `load/k6-stress.js`.
