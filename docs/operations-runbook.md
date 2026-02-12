# Runbook Exploitation V1

## Scope
Runbook minimal pour supervision et reaction incident sur la V1.

## Services critiques
- Backend API
- RabbitMQ
- Prometheus
- Grafana

## Health checks rapides
- API:
  - `curl -k https://api.petite-maison-epouvante.local:9443/api/health`
- Prometheus targets:
  - `curl -k https://prometheus.petite-maison-epouvante.local:9443/api/v1/targets`
- Kubernetes:
  - `kubectl -n petite-maison-epouvante get pods,svc,ingress`

## Alertes / seuils operationnels
- Disponibilite:
  - `sum(up{job=~"prometheus|rabbitmq"}) < 2`
- Charge messages:
  - `sum(rabbitmq_queue_messages_ready) > 1000`
- Saturation RabbitMQ:
  - `rabbitmq_erlang_processes_used / rabbitmq_erlang_processes_limit > 0.8`

## Actions de reponse
1. Verifier l etat des workloads (`kubectl -n petite-maison-epouvante get pods`).
2. Lire les logs du service impacte:
   - `kubectl -n petite-maison-epouvante logs deploy/petite-maison-backend --tail=200`
   - `kubectl -n petite-maison-epouvante logs deploy/rabbitmq --tail=200`
3. Relancer le service si besoin:
   - `kubectl -n petite-maison-epouvante rollout restart deploy/petite-maison-backend`
   - `kubectl -n petite-maison-epouvante rollout restart deploy/rabbitmq`
4. Recontroler les metriques dans Grafana.
5. Documenter l incident (cause, impact, action, prevention).

## Incident post-mortem (minimum)
- Quand: date/heure
- Symptomes observables
- Impact utilisateur
- Cause racine
- Correctif applique
- Action preventive planifiee
