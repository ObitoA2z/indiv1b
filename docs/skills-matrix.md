# Skills Matrix (echelle 1-4)

Echelle: **1 debutant**, **2 operationnel**, **3 autonome**, **4 expert/lead**.

| Competence | Role | Niveau attendu | Niveau actuel estime | Gap | Preuve repo associee |
|---|---|---:|---:|---:|---|
| API Node/Express securisee (JWT/RBAC) | Dev | 3 | 3 | 0 | `backend/src/auth.js`, `backend/src/routes/*.js` |
| Qualite code + tests integration | Dev / QA | 3 | 2 | 1 | `backend/scripts/test-integration.js`, `backend/tests/unit/*` |
| Front React TypeScript (build/typecheck) | Dev Front | 3 | 3 | 0 | `frontend/src/*`, `frontend/package.json` |
| CI pipelines + quality gates | DevOps | 3 | 3 | 0 | `.github/workflows/ci.yml`, `.gitlab-ci.yml` |
| Container/Kubernetes operations | DevOps | 3 | 2 | 1 | `k8s/*.yaml`, `docs/start-stop-local.md` |
| Observabilite Prometheus/Grafana | DevOps / QA | 3 | 2 | 1 | `k8s/prometheus-*.yaml`, `k8s/grafana-*.yaml`, dashboard JSON |
| Securite applicative (audit/remediation) | Sec | 3 | 2 | 1 | `docs/security-audit-v1.md`, `docs/remediation-plan.md` |
| Performance test & interpretation | QA Perf | 3 | 2 | 1 | `load/*.js`, `docs/load-test-results.md` |

## Priorites de progression
1. Renforcer QA front (tests auto) et perf engineering.
2. Monter en maturite SecOps (gestion secrets, SAST/DAST).
3. Industrialiser exploitation K8s (persistence, runbooks).
