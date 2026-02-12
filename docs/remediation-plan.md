# Remediation Plan (H2)

## Priority matrix
| Priority | Item | Owner | Target date | Success criteria |
| --- | --- | --- | --- | --- |
| P1 | Maintain CI security gates for CRITICAL vulnerabilities | DevOps | In place + continuous | CI blocks when CRITICAL > 0 |
| P1 | Ensure TLS active on public ingress | DevOps | +7 days | HTTPS endpoint reachable with valid certificate |
| P1 | Finalize stable integration testing on CI runner | Backend | +7 days | Integration job green for 5 consecutive runs |
| P2 | Enable autoscaling in production profile | DevOps | +14 days | HPA active and tested under load |
| P2 | Add centralized metrics dashboards | DevOps | +14 days | Dashboard with API availability/latency/vuln trends |
| P2 | Add load test as scheduled CI job | Backend + DevOps | +14 days | Weekly load report artifact generated |
| P3 | Improve secrets management process and rotation docs | SecOps | +21 days | Secret rotation checklist validated |
| P3 | Add periodic security review ritual | Team Lead | +21 days | Monthly security review notes versioned |

## Tracking
- Update this file after each remediation item closure.
- Link each closure to commit hash and evidence file.
