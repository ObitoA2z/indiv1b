# Sandbox Experiment Report (G1)

## Goal
Validate behavior of auth, product publication, moderation, and order flow in an isolated environment.

## Environment
- Local Docker Compose environment
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4004`
- RabbitMQ: `http://localhost:15672`

## Repro steps
1. Start stack: `docker compose up --build`
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
