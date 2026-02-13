# Metriques de Pilotage V1

| ID | Metrique | Definition / formule | Seuil | Outil / source | Frequence | Action si echec |
|---|---|---|---|---|---|---|
| M1 | **Dependency Risk Score** | `high + critical` des vuln npm runtime (backend et frontend) | `= 0` | `npm audit --json` dans jobs CI | A chaque PR/push | Bloquer merge/release, ouvrir ticket remediaton (`docs/remediation-plan.md`). |
| M2 | **Container Critical Exposure** | Nombre de vulnerabilites image `CRITICAL` (backend+frontend) | `= 0` (GH), `HIGH/CRITICAL = 0` (GL) | Trivy image scan jobs | A chaque push `main` | Stop push image/deploiement, patch base image/deps. |
| M3 | **API Smoke Latency p95** | `p95(http_req_duration)` sur `GET /api/health` + `GET /api/products` | `< 500 ms` | `load/k6-smoke.js` | Avant release + preuve soutenance | Investiguer ressources, HPA, endpoint lent, rejouer test. |
| M4 | **API Smoke Error Rate** | `http_req_failed rate` sur test smoke | `< 1%` | `load/k6-smoke.js`, checks k6 | Avant release + incident | Analyser logs backend/rabbitmq, corriger reponses 5xx/4xx inattendues. |

## Mapping metriques -> jobs/scripts
- **M1:** `.github/workflows/ci.yml` jobs `backend` / `frontend`, `.gitlab-ci.yml` jobs `backend:test` / `frontend:test`.
- **M2:** `.github/workflows/ci.yml` job `build-and-push-images`, `.gitlab-ci.yml` jobs `scan:backend` / `scan:frontend`.
- **M3/M4:** scripts `load/k6-smoke.js` + historique `docs/load-test-results.md`.
