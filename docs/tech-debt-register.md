# Registre Dette Technique — V1

| Metrique violee / risque | Dette technique | Impact | Action cible | Owner | Echeance | Preuve de cloture attendue |
|---|---|---|---|---|---|---|
| M1/M2 (securite) | Gestion manuelle des secrets (placeholders versionnes, injection locale/CI) | Erreur de config, rotation non standardisee | Basculer vers secret manager CI + rotation secrets | DevOps | 2026-03-15 | PR d'integration secret manager + procedure de rotation versionnee |
| M3/M4 (perf/fiabilite) | Pas de metriques backend `/metrics` natives | Visibilite limitee sur causes latence/erreurs | Ajouter instrumentations metrics backend et scrape Prometheus | Backend | 2026-03-22 | Nouveau endpoint metrics + update `k8s/prometheus-configmap.yaml` |
| Securite API | `POST /api/upload` et `PATCH /api/products/:id` initialement trop permissifs | Elevation d’acces, abus API | Correctifs auth/role/ownership + tests integration | Backend | 2026-02-20 | Presence dans `backend/src/routes/*.js` + `backend/scripts/test-integration.js` vert |
| Securite transport | TLS local manuel (mkcert + hosts + port-forward) non automatise | Setup fragile, erreurs demo | Script bootstrap TLS local automatise dans docs/outillage | DevOps | 2026-03-01 | Procedure unique reproductible validee (`docs/start-stop-local.md`) |
| Maintenabilite | Incoherence endpoint front/back upgrade seller | Defaut fonctionnel latent | Conserver endpoint compat + normaliser client API | Backend+Front | 2026-02-20 | Endpoint present dans `backend/src/routes/users.routes.js` + test integration |
| Qualite test | Pas de tests front unit/e2e | Regressions UI non detectees en CI | Ajouter suite minimale UI (ex: smoke composant/catalogue) | Frontend QA | 2026-04-01 | Nouveau job CI front test + rapport execution |
