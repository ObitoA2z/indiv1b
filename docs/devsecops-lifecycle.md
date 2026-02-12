# DevSecOps Lifecycle (C1)

## Lifecycle
- Plan: backlog and acceptance criteria definition.
- Develop: code, review, secure coding practices.
- Build: package and containerize.
- Test: unit, integration, smoke, security scans.
- Deploy: automated delivery to container registry and Kubernetes manifests.
- Monitor: health checks, logs, incidents.
- Improve: remediation and debt management.

## Security measures by stage
- Plan: risk identification and control definition.
- Develop: input validation, authz checks, secret externalization.
- Build: immutable artifacts and dependency lock usage.
- Test: `npm audit`, Trivy, route smoke tests.
- Deploy: secrets/config separation, probes, network policy.
- Monitor: log review and incident handling workflow.
