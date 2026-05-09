# JiffyLaundry Monitoring & Observability Guide

## Monitoring Stack

### Option 1: Datadog (Recommended for SaaS)

```javascript
// apps/backend-api/src/monitoring.js
import datadogRum from '@datadog/rum'
import pino from 'pino'

// Initialize Datadog RUM
datadogRum.init({
  applicationId: process.env.DATADOG_APP_ID,
  clientToken: process.env.DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'jiffylaundry-backend',
  env: process.env.NODE_ENV,
  sessionReplaySampleRate: 100,
  defaultPrivacyLevel: 'mask-user-input',
})

datadogRum.startSessionReplayRecording()

// Logger with Datadog integration
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-datadog-transport',
    options: {
      ddApiKey: process.env.DATADOG_API_KEY,
      service: 'backend-api',
      hostname: process.env.HOSTNAME,
    },
  },
})
```

### Option 2: ELK Stack (Self-Hosted)

**docker-compose.yml addition:**
```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
  environment:
    discovery.type: single-node
    xpack.security.enabled: false
  ports:
    - "9200:9200"
  volumes:
    - elasticsearch-data:/usr/share/elasticsearch/data

kibana:
  image: docker.elastic.co/kibana/kibana:8.10.0
  ports:
    - "5601:5601"
  environment:
    ELASTICSEARCH_HOSTS: http://elasticsearch:9200
  depends_on:
    - elasticsearch

logstash:
  image: docker.elastic.co/logstash/logstash:8.10.0
  ports:
    - "5000:5000"
  volumes:
    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  depends_on:
    - elasticsearch
```

**logstash.conf:**
```
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "jiffylaundry-%{+YYYY.MM.dd}"
  }
}
```

## Key Metrics

### Application Metrics

```javascript
// apps/backend-api/src/metrics.js
import prometheus from 'prom-client'

// Histogram for request latency
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
})

// Counter for requests
const httpRequests = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

// Gauge for active Socket.io connections
const activeConnections = new prometheus.Gauge({
  name: 'socketio_active_connections',
  help: 'Number of active Socket.io connections',
  labelNames: ['user_role']
})

// Gauge for job queue depth
const jobQueueDepth = new prometheus.Gauge({
  name: 'job_queue_depth',
  help: 'Number of pending jobs in queue',
  labelNames: ['queue_name']
})

// Counter for payments
const paymentCounter = new prometheus.Counter({
  name: 'stripe_payments_total',
  help: 'Total number of payments processed',
  labelNames: ['status']
})

// Histogram for API latency by endpoint
const apiLatency = new prometheus.Histogram({
  name: 'api_latency_seconds',
  help: 'API endpoint latency',
  labelNames: ['endpoint', 'method'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
})

export { 
  httpRequestDuration, 
  httpRequests, 
  activeConnections, 
  jobQueueDepth, 
  paymentCounter,
  apiLatency 
}
```

## Alerts

### Critical Alerts

```javascript
// alerts.js
const CRITICAL_ALERTS = {
  API_DOWN: {
    condition: 'health_check_failed',
    threshold: 2, // 2 consecutive failures
    severity: 'critical',
    action: 'page_on_call_engineer',
  },
  
  DATABASE_DOWN: {
    condition: 'db_connection_failed',
    threshold: 5, // 5 failures in 5 minutes
    severity: 'critical',
    action: 'page_on_call_engineer',
  },
  
  REDIS_DOWN: {
    condition: 'redis_connection_failed',
    threshold: 3,
    severity: 'critical',
    action: 'alert_ops_team',
  },
  
  HIGH_ERROR_RATE: {
    condition: 'error_rate > 1%',
    window: '5m',
    severity: 'critical',
    action: 'alert_engineering',
  },
  
  PAYMENT_FAILURES: {
    condition: 'stripe_payment_failure_rate > 5%',
    window: '10m',
    severity: 'high',
    action: 'alert_billing_team',
  },
  
  QUEUE_BACKUP: {
    condition: 'job_queue_depth > 1000',
    window: '5m',
    severity: 'high',
    action: 'alert_ops',
  },

  HIGH_LATENCY: {
    condition: 'p95_latency > 500ms',
    window: '10m',
    severity: 'medium',
    action: 'alert_engineering',
  },
}
```

## Dashboards

### Real-Time Operations Dashboard

```javascript
// Key widgets:
// 1. Active Users (by role)
// 2. Orders in Progress
// 3. Driver Locations Map
// 4. API Latency (p50, p95, p99)
// 5. Error Rate
// 6. Payment Success Rate
// 7. Queue Depth
// 8. Redis Memory Usage
// 9. Database Connection Pool
// 10. Socket.io Connection Count
```

### Business Metrics Dashboard

```javascript
// 1. Total Revenue (daily, weekly, monthly)
// 2. Order Volume
// 3. Average Order Value
// 4. Customer Churn Rate
// 5. Driver Utilization
// 6. Laundromat Queue Size
// 7. Support Ticket Response Time
// 8. SLA Violations
// 9. Refund Rate
// 10. Customer Satisfaction Score
```

## Logging Strategy

### Log Levels

```javascript
// DEBUG (5): Detailed diagnostic information
logger.debug({ userId, action: 'order_created', orderId }, 'User created order')

// INFO (4): General informational messages
logger.info({ orderId, status: 'delivered' }, 'Order delivered')

// WARN (3): Warning messages
logger.warn({ userId, suspiciousActivity: true }, 'Unusual pattern detected')

// ERROR (2): Error messages
logger.error({ err, orderId }, 'Failed to process order')

// FATAL (1): Fatal errors
logger.fatal({ err }, 'System is down')
```

### Structured Logging Format

```json
{
  "level": "info",
  "timestamp": "2026-05-08T20:00:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "userRole": "admin",
  "service": "backend-api",
  "action": "order_status_updated",
  "orderId": "order-456",
  "oldStatus": "pending_dispatch",
  "newStatus": "accepted",
  "duration_ms": 145,
  "statusCode": 200,
  "message": "Order status updated successfully"
}
```

## Tracing Strategy

### Distributed Tracing with Jaeger

```javascript
// apps/backend-api/src/tracing.js
import initTracer from 'jaeger-client'

const initJaeger = (serviceName) => {
  const config = {
    serviceName: serviceName,
    sampler: {
      type: 'const',
      param: 1,
    },
    reporter: {
      agentHost: process.env.JAEGER_HOST || 'localhost',
      agentPort: process.env.JAEGER_PORT || 6831,
    },
  }

  return initTracer(config)
}

export const tracer = initJaeger('jiffylaundry-backend')
```

**Trace a request:**
```javascript
const span = tracer.startSpan('order_creation')
try {
  const order = await createOrder(data)
  span.setTag('orderId', order.id)
  span.finish()
} catch (err) {
  span.setTag('error', true)
  span.log({ event: 'error', message: err.message })
  span.finish()
}
```

## Health Checks

### Endpoint Health Check

```javascript
// GET /health
{
  "status": "ok",
  "timestamp": "2026-05-08T20:00:00Z",
  "checks": {
    "redis": { "status": "ok", "latency": 5 },
    "database": { "status": "ok", "latency": 25 },
    "stripe": { "status": "ok", "latency": 120 },
    "socketio": { "status": "ok", "connections": 1250 }
  },
  "version": "1.0.0",
  "uptime": 864000
}
```

## Performance Testing

### Load Testing with Artillery

```yaml
# load-test.yml
config:
  target: http://localhost:4000
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Spike"

scenarios:
  - name: "Order Management"
    flow:
      - get:
          url: "/api/orders"
      - get:
          url: "/api/orders/{{ orderId }}"
      - post:
          url: "/api/orders/{{ orderId }}/status"
          json: { "status": "accepted" }

  - name: "Realtime Updates"
    flow:
      - websocket:
          emit: "subscribe:order"
          data: "{{ orderId }}"
      - think: 30
```

**Run test:**
```bash
artillery run load-test.yml
```

## Incident Response

### Runbook Template

```markdown
## Incident: [Title]

### Detection
- Alert: [Alert Name]
- Threshold: [Value]
- Severity: [Critical/High/Medium]

### Impact
- Users Affected: [%]
- Services Down: [list]
- Revenue Impact: [$/min]

### Triage
1. Check service health: `curl http://localhost:4000/health`
2. Check logs: `docker-compose logs -f backend-api`
3. Check metrics dashboard
4. Assess scope and severity

### Resolution
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Prevention
- [ ] Add monitoring alert
- [ ] Add health check
- [ ] Update runbook
- [ ] Post-mortem scheduled
```

## Continuous Monitoring

### Uptime Monitoring

```bash
# Monitor API availability
watch -n 5 'curl -s http://localhost:4000/health | jq ".checks"'
```

### Real-Time Logs

```bash
# Tail backend logs
docker-compose logs -f backend-api | grep -E "error|ERROR"

# Filter by request ID
docker-compose logs backend-api | grep "550e8400-e29b-41d4"
```

### Performance Profiling

```bash
# Node.js built-in profiling
node --prof src/index.js
node --prof-process isolate-*.log > profile.txt
```

## Dashboard URLs

- **Datadog**: https://app.datadoghq.com
- **Kibana**: http://localhost:5601
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
- **Jaeger**: http://localhost:16686

## Next Steps

1. Set up chosen monitoring solution (Datadog or ELK)
2. Create dashboards for ops team
3. Configure critical alerts
4. Establish on-call rotation
5. Create incident response runbooks
6. Test alert firing and escalation
7. Document monitoring for team
