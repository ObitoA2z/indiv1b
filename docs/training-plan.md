# Plan de Formation (action unique V1)

## Action
- **Titre:** Atelier "Pipeline DevSecOps operable: scans, gates, remediations"
- **Public:** Dev + DevOps + QA (projet Petite Maison)
- **Duree:** 1/2 journee (3h30)
- **Date cible:** 2026-03-08

## Objectifs pedagogiques
1. Lire et expliquer les quality gates de `.github/workflows/ci.yml` et `.gitlab-ci.yml`.
2. Reproduire un scan local (npm audit + Trivy + k6 smoke) et interpreter les resultats.
3. Ouvrir un plan de correction base sur `docs/tech-debt-register.md` et `docs/remediation-plan.md`.

## Livrable attendu
- Une MR de simulation "vulnerability fix" avec pipeline vert + mise a jour documentaire.

## KPI de succes
- 100% des participants executent les commandes de verification sans assistance.
- Au moins 1 remediation P1 cloturee sous 2 semaines apres atelier.
