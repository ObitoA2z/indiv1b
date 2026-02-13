# Start/Stop local (Windows)

Ce guide couvre le mode du projet:
- Kubernetes Minikube + ArgoCD (mode CI/CD local)

## 1) Tout eteindre

Depuis la racine du repo:

```powershell
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" stop
```

Verification:

```powershell
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" status
```

## 2) Demarrer en Kubernetes + ArgoCD

### 2.1 Lancer Minikube

```powershell
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" start
kubectl config use-context minikube
```

### 2.2 Verifier ArgoCD

```powershell
kubectl -n argocd get application petite-maison-epouvante-full
```

Si l'application n'existe pas:

```powershell
kubectl apply -f k8s/argocd-application.yaml
```

### 2.3 Creer les secrets applicatifs (placeholders locaux)

Ne commitez jamais de secrets reels. Creez/maj le secret avec des valeurs locales:

```powershell
kubectl -n petite-maison-epouvante create secret generic petite-maison-secrets `
  --from-literal=JWT_SECRET="change_me_local_please" `
  --from-literal=STRIPE_SECRET_KEY="<your-stripe-secret-key>" `
  --from-literal=RABBITMQ_DEFAULT_USER="<rabbitmq-user>" `
  --from-literal=RABBITMQ_DEFAULT_PASS="<rabbitmq-password>" `
  --from-literal=RABBITMQ_URL="amqp://<rabbitmq-user>:<rabbitmq-password>@rabbitmq.petite-maison-epouvante.svc.cluster.local:5672" `
  --from-literal=GRAFANA_ADMIN_USER="<grafana-admin-user>" `
  --from-literal=GRAFANA_ADMIN_PASSWORD="<grafana-admin-password>" `
  --dry-run=client -o yaml | kubectl apply -f -
```

### 2.4 Configurer TLS local

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

### 2.5 Exposer l'Ingress local (HTTPS)

Garder ce terminal ouvert:

```powershell
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 9443:443 9080:80
```

### 2.6 Verifier les pods

```powershell
kubectl -n petite-maison-epouvante get pods,svc,ingress
kubectl -n argocd get application petite-maison-epouvante-full
```

## 3) URLs Kubernetes HTTPS

- Frontend: `https://petite-maison-epouvante.local:9443`
- API backend: `https://api.petite-maison-epouvante.local:9443/api/health`
- Grafana: `https://grafana.petite-maison-epouvante.local:9443`
- Prometheus: `https://prometheus.petite-maison-epouvante.local:9443`
- RabbitMQ UI: `https://rabbitmq.petite-maison-epouvante.local:9443`

Note: la racine de l'API (`/`) peut retourner `404`, c'est normal. Verifier `api/health`.
Note front/API: en production, utiliser un appel API relatif (`/api/...`) via Ingress, ou une `VITE_API_URL` en `https://...` uniquement.

## 4) Verification HTTP -> HTTPS

Depuis un terminal PowerShell:

```powershell
curl.exe -I http://petite-maison-epouvante.local:9080/
curl.exe -I https://petite-maison-epouvante.local:9443/
curl.exe -I http://api.petite-maison-epouvante.local:9080/api/health
curl.exe -I https://api.petite-maison-epouvante.local:9443/api/health
```

Attendu:
- Requetes `http://...:9080` => `301` (ou `308`) vers HTTPS.
- Requetes `https://...:9443` => `200` (ou `301` selon route).
