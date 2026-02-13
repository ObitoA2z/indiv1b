# Remediation Plan V1 (P1 / P2 / P3)

## P1 — Critique (a traiter en premier)
| Sujet | Owner | Deadline | Critere de cloture | Fichiers cibles |
|---|---|---|---|---|
| Secrets en clair dans manifests | DevOps | 2026-03-15 | Plus aucune valeur secrete committee; secrets injectes par CI/env proteges | `k8s/secrets.yaml`, `k8s/grafana-deployment.yaml`, `k8s/rabbitmq-deployment.yaml` |
| Garde-fous API edition/upload | Backend | 2026-02-20 | Tests integration verts sur authz patch/upload | `backend/src/routes/products.routes.js`, `backend/src/routes/upload.routes.js`, `backend/scripts/test-integration.js` |

## P2 — Important
| Sujet | Owner | Deadline | Critere de cloture | Fichiers cibles |
|---|---|---|---|---|
| Persistance des donnees (eviter `emptyDir`) | DevOps | 2026-04-05 | PVC/StorageClass utilises pour DB/observabilite/broker | `k8s/*-deployment.yaml` |
| Metriques backend natives | Backend | 2026-03-22 | Endpoint metrics scrape par Prometheus + dashboard mis a jour | `backend/src/server.js`, `k8s/prometheus-configmap.yaml`, `grafana/dashboards/petite-maison-overview.json` |
| Automatisation TLS local/staging | DevOps | 2026-03-29 | Procedure unifiee et reproductible sans etapes manuelles cachees | `docs/start-stop-local.md`, `k8s/ingress.yaml` |

## P3 — Amelioration continue
| Sujet | Owner | Deadline | Critere de cloture | Fichiers cibles |
|---|---|---|---|---|
| Ajouter tests front automatise (unit/e2e) | Frontend QA | 2026-04-20 | Nouveau job CI front test + rapport execution | `frontend/src/*`, `.github/workflows/ci.yml`, `.gitlab-ci.yml` |
| Etendre audit securite (SAST/DAST) | SecOps | 2026-04-30 | Jobs CI supplementaires et evidence soutenance | `.github/workflows/ci.yml`, `.gitlab-ci.yml`, `docs/security-audit-v1.md` |

## Suivi
- Metriques de suivi: `docs/metrics.md`
- Dette associee: `docs/tech-debt-register.md`
