param(
    [ValidateSet("smoke", "stress")]
    [string]$Profile = "smoke",

    [string]$BaseUrl = "https://api.petite-maison-epouvante.local:9443",

    [string]$PrometheusWriteUrl = "http://host.docker.internal:19090/api/v1/write",

    [string]$K6Image = "grafana/k6"
)

$ErrorActionPreference = "Stop"

$scriptName = if ($Profile -eq "stress") { "k6-stress.js" } else { "k6-smoke.js" }
$scriptPath = Join-Path $PSScriptRoot $scriptName

if (-not (Test-Path $scriptPath)) {
    throw "Script k6 introuvable: $scriptPath"
}

$mountPath = (Resolve-Path $PSScriptRoot).Path

Write-Host "k6 profile        : $Profile"
Write-Host "Target API        : $BaseUrl"
Write-Host "Prometheus RW URL : $PrometheusWriteUrl"
Write-Host "k6 script         : /scripts/$scriptName"
Write-Host ""
Write-Host "Note: le port-forward Prometheus doit etre actif sur localhost:19090."
Write-Host "      Exemple: kubectl -n petite-maison-epouvante port-forward svc/prometheus 19090:9090"
Write-Host ""

$dockerArgs = @(
    "run", "--rm",
    "--add-host", "api.petite-maison-epouvante.local:host-gateway",
    "-v", "${mountPath}:/scripts",
    "-e", "BASE_URL=$BaseUrl",
    "-e", "K6_PROMETHEUS_RW_SERVER_URL=$PrometheusWriteUrl",
    "-e", "K6_PROMETHEUS_RW_TREND_STATS=p(95),avg,min,max",
    $K6Image,
    "run",
    "--insecure-skip-tls-verify",
    "--tag", "profile=$Profile",
    "--tag", "target=local-k8s",
    "-o", "experimental-prometheus-rw",
    "/scripts/$scriptName"
)

& docker @dockerArgs
$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "PromQL utiles (Grafana Explore / Prometheus):"
Write-Host "  sum(rate(k6_http_reqs_total[1m]))"
Write-Host "  avg(k6_http_req_duration_avg)"
Write-Host "  max(k6_http_req_duration_p95)"
Write-Host "  max(k6_http_req_failed_rate)"
Write-Host "  max(k6_vus)"

exit $exitCode
