# Quality Requirements - ISO 25010 Mapping

## Context
Project: La Petite Maison de l Epouvante
Version: V1

## ISO 25010 quality attributes used in V1
| ISO 25010 area | Requirement ID | Requirement | Target |
| --- | --- | --- | --- |
| Functional suitability | Q-001 | Product publish/consult workflow must work end-to-end. | 100% of critical routes pass smoke test |
| Reliability | Q-002 | Core API must remain available. | `/api/health` success >= 99.5% over 30 days |
| Performance efficiency | Q-003 | Product listing must respond quickly. | P95 latency <= 500 ms on `GET /api/products` |
| Security | Q-004 | Auth and role checks must block unauthorized access. | 0 critical auth bypass findings |
| Maintainability | Q-005 | Changes must stay testable and modular. | Unit + integration tests executed in CI |
| Portability | Q-006 | App must run local + Docker + Kubernetes manifests. | Successful startup in Docker Compose and K8s manifests versioned |

## Verification evidence
- API routes: `backend/src/routes/*.js`
- Auth middleware: `backend/src/auth.js`
- CI execution: `.github/workflows/ci.yml`
- Infrastructure descriptors: `docker-compose.yml`, `k8s/*.yaml`, `k8s-aks/*.yaml`
