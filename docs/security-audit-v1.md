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

## Top 5 risques (impact x probabilite)
| # | Risque | Probabilite | Impact | Niveau |
|---|---|---|---|---|
| R1 | Secrets de dev en clair dans manifests (`k8s/secrets.yaml`, creds Grafana/RabbitMQ) | Elevee | Eleve | **Critique** |
| R2 | Upload image expose au DoS/abus si limites mal calibrees | Moyenne | Eleve | **Eleve** |
| R3 | Persistance `emptyDir` (perte donnees, reprise service fragile) | Elevee | Moyen | **Eleve** |
| R4 | Absence de SAST/DAST et tests front auto | Moyenne | Moyen | **Moyen** |
| R5 | TLS local manuel (erreurs de config demo, faux sentiment HTTPS) | Moyenne | Moyen | **Moyen** |

## Observations techniques V1
- Correctifs securite integres: `PATCH /api/products/:id` restreint, `POST /api/upload` authentifie + role + rate limit + restrictions MIME/taille.
- CI GitHub bloque deja sur vuln deps high/critical et Trivy critical; GitLab aligne maintenant sur gates bloquants HIGH/CRITICAL.
- Aucune evidence de stockage secret externe (vault/kms) n’est versionnee dans ce repo.

## Recommandation immediate
Prioriser la remediaton R1 (secrets), puis R2/R3. Plan detaille dans `docs/remediation-plan.md`.
