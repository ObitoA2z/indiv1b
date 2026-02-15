# Security Audit V1 (etat repo au 2026-02-13)

## Sources internes utilisees
- Pipelines CI: `.github/workflows/ci.yml`, `.gitlab-ci.yml`
- Rapports/seuils charge: `docs/load-test-results.md`, `load/k6-smoke.js`, `load/k6-stress.js`
- Endpoints sensibles: `backend/src/routes/auth.routes.js`, `backend/src/routes/products.routes.js`, `backend/src/routes/upload.routes.js`, `backend/src/routes/admin.routes.js`
- Infra K8s: `k8s/ingress.yaml`, `k8s/networkpolicy.yaml`, `k8s/secrets.yaml`

## Controles constates
- **AuthN/AuthZ:** JWT + role-based access (`backend/src/auth.js`, middlewares sur routes).
- **Durcissement API:** `helmet`, CORS limite, rate-limit auth (`backend/src/server.js`).
- **Scans dependances/images/config:** npm audit + Trivy dans GH Actions et GitLab CI.
- **Transport:** TLS Ingress configure (secret `petite-maison-epouvante-tls` requis).

## Preuves (fichiers + artefacts)
- **Artefacts CI attendus (contenu JSON):** `backend-audit.json`, `frontend-audit.json`, `trivy-backend.json`, `trivy-frontend.json`, `trivy-k8s-config.json`.
  - GitHub Actions (artefacts): `backend-audit-report`, `frontend-audit-report`, `trivy-image-reports` (`.github/workflows/ci.yml`).
  - GitLab CI (artefacts): `backend-audit.json`, `frontend-audit.json`, `trivy-*.json` (`.gitlab-ci.yml`).
- **Sortie locale npm audit backend (extrait):**
  - `2 low severity vulnerabilities`
  - `npm audit --audit-level=high --omit=dev` retourne `exit code 0`.
- **Sortie locale npm audit frontend (extrait):**
  - `found 0 vulnerabilities`.
- **Sortie locale tests backend (extrait):**
  - `test:unit => 17 passed`
  - `test:integration => Integration tests: OK`
  - `test:smoke => Smoke test OK`.
- **Charge k6 (preuve documentaire):** `docs/load-test-results.md` contient `date`, `p95`, `throughput`, `error rate` et commande de reproduction.

## Top 5 risques (impact x probabilite)
| # | Risque | Probabilite | Impact | Niveau |
|---|---|---|---|---|
| R1 | Gestion manuelle des secrets locaux (placeholders versionnes, injection hors repo) | Moyenne | Eleve | **Eleve** |
| R2 | Upload image expose au DoS/abus si limites mal calibrees | Moyenne | Eleve | **Eleve** |
| R3 | Persistance `emptyDir` (perte donnees, reprise service fragile) | Elevee | Moyen | **Eleve** |
| R4 | Absence de SAST/DAST et tests front auto | Moyenne | Moyen | **Moyen** |
| R5 | TLS local manuel (erreurs de config demo, faux sentiment HTTPS) | Moyenne | Moyen | **Moyen** |

## Observations techniques V1
- Correctifs securite integres: `PATCH /api/products/:id` restreint, `POST /api/upload` authentifie + role + rate limit + restrictions MIME/taille.
- CI GitHub et GitLab bloquent sur vulnerabilites/severites `HIGH/CRITICAL` (quality gates).
- Les manifests n'embarquent plus de credentials en clair; seuls des placeholders sont versionnes dans `k8s/secrets.yaml`.
- Aucune evidence de stockage secret externe (vault/kms) n'est versionnee dans ce repo.

## Recommandation immediate
Prioriser la remediaton R1 (secrets), puis R2/R3. Plan detaille dans `docs/remediation-plan.md`.
