# Monitoring Guide

## Prometheus Metrics

StylusDB exposes Prometheus-compatible metrics for monitoring.

### Available Metrics

#### Default Metrics
- `process_cpu_user_seconds_total` - CPU time in user mode
- `process_cpu_system_seconds_total` - CPU time in system mode
- `process_heap_bytes` - Process heap size
- `process_resident_memory_bytes` - Resident memory size
- `nodejs_eventloop_lag_seconds` - Event loop lag
- `nodejs_active_handles` - Number of active handles
- `nodejs_active_requests` - Number of active requests

#### Custom Metrics

**Raft Metrics:**
- `stylusdb_raft_state` - Current state (0=follower, 1=candidate, 2=leader)
- `stylusdb_raft_term` - Current term number
- `stylusdb_log_length` - Length of the Raft log

**Database Metrics:**
- `stylusdb_db_operations_total` - Total database operations (labeled by operation type)
- `stylusdb_operation_duration_seconds` - Operation duration histogram

**Cluster Metrics:**
- `stylusdb_cluster_size` - Number of nodes in cluster
- `stylusdb_active_connections` - Active network connections

**Error Metrics:**
- `stylusdb_errors_total` - Total errors (labeled by type)

### Exposing Metrics

Metrics are exposed via the API server:

```bash
curl http://localhost:3000/metrics
```

### Prometheus Configuration

Add to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'stylusdb'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
```

### Grafana Dashboards

Import the provided Grafana dashboard (coming soon) or create custom dashboards using the metrics above.

## Health Checks

### Health Check Endpoints

**Liveness Probe:**
```bash
GET /health/alive
```
Returns 200 if process is running.

**Readiness Probe:**
```bash
GET /health/ready
```
Returns 200 if service can accept traffic.

**Detailed Health:**
```bash
GET /health
```
Returns detailed health status of all components.

### Response Format

```json
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2025-11-05T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "healthy",
      "timestamp": "2025-11-05T10:30:00.000Z"
    },
    "raft": {
      "status": "healthy",
      "timestamp": "2025-11-05T10:30:00.000Z"
    }
  }
}
```

## Alerting

### Recommended Alerts

**High Error Rate:**
```yaml
alert: HighErrorRate
expr: rate(stylusdb_errors_total[5m]) > 10
for: 5m
annotations:
  summary: "High error rate detected"
```

**No Leader:**
```yaml
alert: NoRaftLeader
expr: max(stylusdb_raft_state) < 2
for: 1m
annotations:
  summary: "No Raft leader in cluster"
```

**High Memory:**
```yaml
alert: HighMemoryUsage
expr: process_resident_memory_bytes > 1e9
for: 5m
annotations:
  summary: "High memory usage"
```

## Logging Integration

Logs and metrics work together:
- Errors are both logged and counted in metrics
- Important events are logged with structured data
- Log levels can be correlated with metrics

## Monitoring Best Practices

1. **Set up Alerting:** Configure alerts for critical metrics
2. **Monitor Trends:** Track long-term metric trends
3. **Correlate Logs:** Use timestamps to correlate logs with metrics
4. **Regular Reviews:** Review dashboards regularly
5. **Capacity Planning:** Use metrics for capacity planning
