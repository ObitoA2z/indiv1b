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
  - `curl http://localhost:4004/api/health`
- Prometheus targets:
  - `curl http://localhost:9090/api/v1/targets`
- Conteneurs:
  - `docker compose ps`

## Alertes / seuils operationnels
- Disponibilite:
  - `sum(up{job=~"prometheus|rabbitmq"}) < 2`
- Charge messages:
  - `sum(rabbitmq_queue_messages_ready) > 1000`
- Saturation RabbitMQ:
  - `rabbitmq_erlang_processes_used / rabbitmq_erlang_processes_limit > 0.8`

## Actions de reponse
1. Verifier l etat conteneurs (`docker compose ps`).
2. Lire les logs du service impacte:
   - `docker logs epouvante-backend --tail 200`
   - `docker logs epouvante-rabbitmq --tail 200`
3. Relancer le service si besoin:
   - `docker compose restart backend`
   - `docker compose restart rabbitmq`
4. Recontroler les metriques dans Grafana.
5. Documenter l incident (cause, impact, action, prevention).

## Incident post-mortem (minimum)
- Quand: date/heure
- Symptomes observables
- Impact utilisateur
- Cause racine
- Correctif applique
- Action preventive planifiee
