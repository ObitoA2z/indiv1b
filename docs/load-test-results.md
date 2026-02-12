# Load Test Results (D3)

## Script
- `load/k6-smoke.js`

## Command used
```bash
docker run --rm -v "$PWD/load:/scripts" -e BASE_URL=http://host.docker.internal:4004 grafana/k6 run /scripts/k6-smoke.js
```

## Environment
- Target API: `http://localhost:4004`
- Profile: 10 VUs, 60 seconds
- Endpoints: `GET /api/health`, `GET /api/products`

## Result snapshot
- Total HTTP requests: 1200
- Request failure rate: 0.00%
- Average duration: 5.5 ms
- P95 duration: 11.34 ms
- Max duration: 63.01 ms
- Checks succeeded: 100% (1200/1200)

## Threshold validation
- `http_req_failed < 1%`: PASS
- `http_req_duration p95 < 500 ms`: PASS

## Interpretation
Current baseline is good for V1 local workload. Keep this script in release checklist and re-run on staging/production profiles.
