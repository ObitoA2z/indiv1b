# POC Feasibility — GitOps + Observabilite + Charge

## Hypothese
Le repo permet un flux faisable de bout en bout: build/scans CI -> mise a jour manifests -> sync ArgoCD -> verification runtime via Prometheus/Grafana + smoke charge k6.

## Criteres de succes
1. Pipeline CI vert avec tests + scans (`.github/workflows/ci.yml`).
2. Manifest K8s deploye et synchro ArgoCD (`k8s/argocd-application.yaml`).
3. Dashboard Grafana alimente par Prometheus (`grafana/dashboards/petite-maison-overview.json`).
4. Smoke charge respecte `p95<500ms` et `error<1%` (`load/k6-smoke.js`).

## Resultat observe (repo)
- CI couvre tests backend/frontend + scans npm/Trivy + update tags images sur `k8s/backend-deployment.yaml` et `k8s/frontend-deployment.yaml`.
- ArgoCD application est definie en auto-sync (`prune` + `selfHeal`).
- Observabilite est provisionnee par manifests Grafana/Prometheus et dashboard versionne.
- Resultat smoke de reference present dans `docs/load-test-results.md` (seuils passes).

## Conclusion
POC **faisable en V1** avec outillage present dans le repo, sans composant externe additionnel.

## Limites V1 / V2
- V1: persistance ephemere (`emptyDir`), TLS local manuel, pas de tests front auto.
- V2: storage persistant, automatisation TLS/certs, tests e2e UI, SAST/DAST additionnels.
