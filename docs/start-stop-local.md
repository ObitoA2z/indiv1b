# Start/Stop local (Windows)

Ce guide couvre les deux modes du projet:
- Docker Compose (mode dev rapide)
- Kubernetes Minikube + ArgoCD (mode CI/CD local)

## 1) Tout eteindre

Depuis la racine du repo:

```powershell
docker compose down --remove-orphans
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" stop
```

Verification:

```powershell
docker compose ps
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" status
```

## 2) Demarrer en Docker Compose

Depuis la racine du repo:

```powershell
docker compose up -d --build
docker compose ps
```

URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4004/api/health`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`
- RabbitMQ UI: `http://localhost:15672`

## 3) Demarrer en Kubernetes + ArgoCD

### 3.1 Lancer Minikube

```powershell
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" start
kubectl config use-context minikube
```

### 3.2 Verifier ArgoCD

```powershell
kubectl -n argocd get application petite-maison-epouvante-full
```

Si l'application n'existe pas:

```powershell
kubectl apply -f k8s/argocd-application.yaml
```

### 3.3 Configurer TLS local

Installer `mkcert` si necessaire:

```powershell
winget install --id FiloSottile.mkcert -e --accept-source-agreements --accept-package-agreements
```

Generer un certif multi-domaines puis creer le secret K8s:

```powershell
$mkcert = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\FiloSottile.mkcert_Microsoft.Winget.Source_8wekyb3d8bbwe\mkcert.exe"
$certDir = "$env:TEMP\pm-tls"
New-Item -ItemType Directory -Force $certDir | Out-Null
Push-Location $certDir
& $mkcert -install
& $mkcert petite-maison-epouvante.local api.petite-maison-epouvante.local grafana.petite-maison-epouvante.local prometheus.petite-maison-epouvante.local rabbitmq.petite-maison-epouvante.local
Pop-Location
kubectl -n petite-maison-epouvante create secret tls petite-maison-epouvante-tls --cert="$certDir\petite-maison-epouvante.local+4.pem" --key="$certDir\petite-maison-epouvante.local+4-key.pem" --dry-run=client -o yaml | kubectl apply -f -
```

Ajouter les hosts (PowerShell en administrateur):

```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n127.0.0.1 petite-maison-epouvante.local`n127.0.0.1 api.petite-maison-epouvante.local`n127.0.0.1 grafana.petite-maison-epouvante.local`n127.0.0.1 prometheus.petite-maison-epouvante.local`n127.0.0.1 rabbitmq.petite-maison-epouvante.local"
```

### 3.4 Exposer l'Ingress local (HTTPS)

Garder ce terminal ouvert:

```powershell
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 9443:443 9080:80
```

### 3.5 Verifier les pods

```powershell
kubectl -n petite-maison-epouvante get pods,svc,ingress
kubectl -n argocd get application petite-maison-epouvante-full
```

## 4) URLs Kubernetes HTTPS

- Frontend: `https://petite-maison-epouvante.local:9443`
- API backend: `https://api.petite-maison-epouvante.local:9443/api/health`
- Grafana: `https://grafana.petite-maison-epouvante.local:9443`
- Prometheus: `https://prometheus.petite-maison-epouvante.local:9443`
- RabbitMQ UI: `https://rabbitmq.petite-maison-epouvante.local:9443`

Note: la racine de l'API (`/`) peut retourner `404`, c'est normal. Verifier `api/health`.
