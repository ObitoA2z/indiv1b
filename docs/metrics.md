# Metrics Catalog V1

## Metric 1 - API availability
- Definition: percentage of successful health checks on `/api/health`.
- Target threshold: >= 99.5% per 30 days.
- Tool/source: Kubernetes readiness/liveness + logs (`kubectl logs`), smoke script (`backend/scripts/smoke-routes.js`).
- Frequency: daily check + weekly review.
- Action if below target: incident ticket P1/P2, identify failing pod, apply fix, run post-mortem.

## Metric 2 - API latency P95
- Definition: P95 response time on `GET /api/products` under load test.
- Target threshold: <= 500 ms.
- Tool/source: k6 script `load/k6-smoke.js`.
- Frequency: before release + weekly on staging.
- Action if above target: profile API/database query, tune indexes/query path, re-test.

## Metric 3 - Security vulnerabilities
- Definition: number of CRITICAL/HIGH vulnerabilities from dependency and image scans.
- Target threshold: CRITICAL = 0, HIGH <= 5 with remediation plan.
- Tool/source: `npm audit` and Trivy in `.github/workflows/ci.yml`.
- Frequency: each pull request / push.
- Action if above target: block release, patch dependencies/base image, rerun CI scans.

## Metric 4 - CI pipeline reliability
- Definition: percentage of successful pipelines for default branch.
- Target threshold: >= 95% success over last 20 runs.
- Tool/source: GitHub Actions workflow `.github/workflows/ci.yml`.
- Frequency: each run + weekly trend review.
- Action if below target: categorize flaky/failing jobs, fix root causes, tighten quality gates.
