# Sandbox Experiment Report (G1)

## Goal
Validate behavior of auth, product publication, moderation, and order flow in an isolated environment.

## Environment
- Local Kubernetes (Minikube) environment
- Frontend: `https://petite-maison-epouvante.local:9443`
- Backend: `https://api.petite-maison-epouvante.local:9443`
- RabbitMQ: `https://rabbitmq.petite-maison-epouvante.local:9443`

## Repro steps
1. Start cluster and app: `minikube start` puis `kubectl -n argocd get application petite-maison-epouvante-full`
2. Register buyer and seller accounts via API.
3. Create product with seller token.
4. Approve product with admin token.
5. Create order with buyer token.
6. Verify order appears in `GET /api/orders`.

## Observed limits
- SQLite file database is not ideal for concurrent production write load.
- Local TLS is not enforced by default.
- RabbitMQ single node (no HA) in local setup.

## Conclusion
The V1 workflow is feasible and reproducible in sandbox for demo and validation. Production hardening requires HA and stricter security controls.
