# Technical Debt Register linked to Metrics

| Debt ID | Trigger metric | Current symptom | Impact | Priority | Planned remediation |
| --- | --- | --- | --- | --- | --- |
| TD-001 | Metric 2 (Latency P95) | Product listing may slow down with data growth. | UX degradation and timeout risk. | High | Add DB index review and load test gate per release. |
| TD-002 | Metric 3 (Vulns) | CRITICAL gate enabled, HIGH remains non-blocking with remediation tracking. | Residual risk on accumulated HIGH vulnerabilities. | Medium | Keep CRITICAL gate, add waiver workflow and SLA on HIGH findings. |
| TD-003 | Metric 1 (Availability) | Single replica in manifests for key services. | Low resilience during pod restart. | Medium | Add HPA + increase replicas in production overlays. |
| TD-004 | Metric 4 (CI reliability) | Integration test unstable on some environments due to Prisma engine behavior. | False negatives in CI and delivery delays. | High | Stabilize Prisma test execution in Linux runner and keep fallback strategy documented. |
| TD-005 | Metric 3 (Vulns) | RabbitMQ default credentials visible in local compose defaults. | Misconfiguration risk if reused in shared env. | Medium | Externalize secure credentials per environment and rotate secrets. |

## Review cadence
- Weekly backlog triage for TD items.
- Monthly debt burndown review with quality metrics trend.
