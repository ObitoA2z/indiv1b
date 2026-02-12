# CI CD Schema (C2)

## Pipeline source
- GitHub Actions workflow: `.github/workflows/ci.yml`

## Stages
1. Dependency review on pull requests.
2. Backend job: install, generate Prisma client, run unit+integration tests, run dependency audit.
3. Frontend job: install, typecheck, build, run dependency audit.
4. Build and push images on `main`.
5. Image vulnerability scans (Trivy).
6. Update Kubernetes manifests with image tags and push commit.
7. Security gates: fail pipeline when CRITICAL vulnerabilities are detected (deps/images).

## Inputs and outputs
- Inputs: source code, lock files, secrets (`GITHUB_TOKEN`).
- Outputs: docker images in GHCR, updated manifests in `k8s/`.

## Controls
- Jobs are branch/event scoped.
- Dependency and image scans are executed per release pipeline.
