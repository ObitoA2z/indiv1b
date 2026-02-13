# Sandbox Experiment — NetworkPolicy Kubernetes

## Objectif
Verifier que la politique `default-deny-all` puis les exceptions applicatives (`frontend`, `backend`, `rabbitmq`, `prometheus`, `grafana`) controlent correctement les flux reseau.

## Environnement
- Cluster local Minikube (driver Docker), namespace `petite-maison-epouvante`.
- Manifests utilises: `k8s/networkpolicy.yaml`, `k8s/*-deployment.yaml`, `k8s/*-service.yaml`.

## Protocole reproductible
```powershell
kubectl apply -f k8s/namespace.yaml
Get-ChildItem k8s\*.yaml | Where-Object { $_.Name -notin @('argocd-application.yaml') } | ForEach-Object { kubectl apply -f $_.FullName }
kubectl -n petite-maison-epouvante get networkpolicy
kubectl -n petite-maison-epouvante describe networkpolicy default-deny-all
kubectl -n petite-maison-epouvante exec deploy/petite-maison-backend -- sh -lc "nc -zvw2 rabbitmq 5672"
kubectl -n petite-maison-epouvante exec deploy/petite-maison-backend -- sh -lc "nc -zvw2 prometheus 9090 || true"
```

## Resultats observes (attendus)
- `backend -> rabbitmq:5672` autorise (`backend-egress-rabbitmq` + `rabbitmq-ingress-amqp`).
- Flux non explicitement autorises bloques (principe zero trust) via `default-deny-all`.
- Acces Ingress externe conserve uniquement pour hosts declares dans `k8s/ingress.yaml`.

## Limites
- Validation orientee connectivite L4; pas de test policy-as-code automatise CI.
- Pas de segmentation multi-namespace hors `petite-maison-epouvante`.

## Decision
Conserver ce modele NetworkPolicy pour V1. Ajouter en V2 une verification automatique policy (CI) et des tests reseau plus fins par service.
