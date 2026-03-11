# BizBuddy AI Agent - Architecture & Technical Decisions

**Last Updated**: 2025-03-11
**Status**: Active Development
**Architecture**: Cloud-Native Hybrid (Monolith → Microservices)

---

## 🎯 Executive Summary

BizBuddy is an AI-powered business communication platform that handles customer calls and chats, qualifies leads, and manages pipelines. We're building it as a **cloud-native application** using modern DevOps practices.

**Key Architectural Decision**: Start with a **containerized monolith** on Kubernetes, designed for **future microservice decomposition**. This gives us:
- ✅ Production-ready cloud patterns NOW
- ✅ Zero refactoring needed to scale
- ✅ Easy to split into microservices later
- ✅ Single codebase for faster iteration
- ✅ Team of 1-3 developers can maintain

---

## 📊 Current State vs Target State

### Current (What we have now)
```
Monolithic Node.js/Express + React
├── Single process
├── Direct database access
├── In-memory service calls
├── Basic Docker container
└── Manual deployment
```

### Target (Cloud-Native Hybrid)
```
Kubernetes Cluster (k3s on laptop / EKS in prod)
├── Containerized monolith (K8s Deployment)
├── Managed services (PostgreSQL, Redis via Helm)
├── Event-driven internal architecture
├── CI/CD pipeline (GitHub Actions + ArgoCD)
├── Full observability (Prometheus + Grafana + Jaeger)
├── API Gateway (Kong/Ingress)
└── Infrastructure as Code (Terraform)
```

**Same codebase, cloud-native deployment!**

---

## 🏗️ Architecture Decisions

### ADR-001: Containerized Monolith vs Microservices
**Date**: 2025-03-11
**Status**: Accepted

**Context**:
- Team size: 1-3 developers
- MVP timeline: 6 weeks
- Need to ship fast but scale later
- Limited DevOps resources initially

**Decision**:
Build as a **containerized monolith** deployed on Kubernetes, but architect for future microservice extraction.

**Rationale**:
1. Faster development (no service boundaries to worry about)
2. Easier debugging (single codebase, single log stream)
3. Lower operational complexity initially
4. Can extract microservices later when team grows or scaling requires it
5. Same deployment artifacts work for both approaches

**Consequences**:
- ✅ Can deploy as single unit initially
- ⚠️ Database becomes coupling point (use well-defined schemas)
- ✅ Service boundaries are still defined in code (will help future extraction)
- ✅ Can scale individual services by moving to separate deployments later

**Migration Path**:
When we need to split:
1. Extract Auth service (natural boundary)
2. Extract AI service (compute-intensive, scale independently)
3. Extract Voice service (different resource requirements)
4. Extract Lead service (business logic separation)

---

### ADR-002: Kubernetes on Laptop (k3s) vs Cloud Managed (EKS/GKE)
**Date**: 2025-03-11
**Status**: Accepted

**Context**:
- Need cloud-native demo without cloud costs
- Want production-like environment for development
- 32GB RAM laptop available
- Target deployment: AWS EKS eventually

**Decision**:
Use **k3s** (lightweight Kubernetes) on laptop for development/demo, with **identical manifests** for production EKS.

**Rationale**:
1. Zero cost for development/demo
2. Same `kubectl` commands, same YAML
3. k3s with containerd is more lightweight than Docker Desktop K8s
4. Can simulate multi-node cluster on single machine
5. Easy migration: just change context to EKS cluster

**Configuration**:
- Laptop cluster: 3 nodes (1 control-plane + 2 workers)
- Production: Multi-AZ EKS cluster (3+ nodes per AZ)
- Same Helm charts, same Deployments, same ConfigMaps
- Only differences: resource limits, storage class names

**Consequences**:
- ✅ Production-ready K8s skills developed
- ✅ No cloud costs during development
- ✅ Can demo full stack anywhere (no internet needed)
- ⚠️ Some AWS-specific features (LoadBalancer, IAM) need abstraction
- ✅ Use Terraform to abstract cloud provider differences

---

### ADR-003: Helm Charts vs Plain YAML
**Date**: 2025-03-11
**Status**: Accepted

**Context**:
- Need to deploy many services (PostgreSQL, Redis, RabbitMQ, MinIO, app)
- Infrastructure should be version-controlled
- Need easy configuration per environment (dev/staging/prod)
- Team may grow, need clear separation

**Decision**:
Use **Helm charts** for all deployable units.

**Rationale**:
1. Helm is Kubernetes package manager - industry standard
2. Easy environment-specific configuration via `values.yaml`
3. Can version charts and roll back
4. Bitnami provides production-ready charts for dependencies
5. Templates reduce duplication
6. Easy to share with team

**Chart Structure**:
```
charts/
├── bizbuddy-backend/          # Main application
│   ├── templates/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── ingress.yaml
│   ├── values.yaml
│   ├── values.dev.yaml
│   └── Chart.yaml
├── postgresql/                # From bitnami (modified)
├── redis/
├── rabbitmq/
├── minio/
└── grafana/
```

**Consequences**:
- ✅ Consistent deployments across environments
- ✅ Easy to customize per environment
- ✅ Can template common patterns
- ⚠️ Learning curve for Helm
- ✅ Reusable charts for future projects

---

### ADR-004: Event-Driven Internals vs Direct Calls
**Date**: 2025-03-11
**Status**: Accepted

**Context**:
- Monolith but want loose coupling for future extraction
- Services may need to scale independently later
- Want natural audit trail of all business events
- Need to integrate with external services asynchronously

**Decision**:
Implement **internal event bus** using RabbitMQ (or in-memory for dev).

**Pattern**:
```typescript
// Instead of:
conversationService.createConversation(data);
leadService.qualifyLead(leadId);
notificationService.sendEmail(...);

// Do:
eventBus.emit('conversation.created', { conversationId, customerId });
// Lead service listens to this event and qualifies
// Notification service listens and sends alerts
```

**Event Types**:
- `conversation.created`
- `message.received`
- `message.sent`
- `lead.qualified`
- `lead.score.updated`
- `call.initiated`
- `call.ended`
- `call.recording.available`
- `pipeline.created`
- `pipeline.updated`

**Benefits**:
1. **Loose coupling**: Services don't call each other directly
2. **Easy extraction**: When moving to microservices, just deploy consumers separately
3. **Audit trail**: All events persisted to RabbitMQ (can replay)
4. **Scalability**: Can buffer events during spikes
5. **Observability**: Natural tracing through event flow

**Implementation**:
- Use `amqplib` for RabbitMQ
- Wrap in simple `EventBus` class with `emit()` and `on()` methods
- In development mode, fallback to in-memory event bus (no RabbitMQ needed)
- All events have: `type`, `payload`, `timestamp`, `correlationId`

**Consequences**:
- ✅ Services are decoupled
- ✅ Easy to add new event consumers (analytics, audit, etc.)
- ✅ Natural async processing (no blocking)
- ⚠️ Added complexity of distributed system patterns
- ✅ Can start simple (in-memory) and grow to RabbitMQ

---

### ADR-005: API Gateway Pattern
**Date**: 2025-03-11
**Status**: Accepted

**Context**:
- Multiple frontends (web, mobile, admin)
- Need authentication, rate limiting, caching
- Want to version APIs cleanly
- Need to route to different services as we split

**Decision**:
Use **Kong Ingress Controller** (or NGINX Ingress) as API gateway.

**Features Implemented**:
- Path-based routing: `/api/v1/*` → backend service
- Rate limiting: 100 req/min per IP (configurable)
- Authentication: JWT validation at gateway
- CORS: Centralized CORS policy
- Request/response logging
- Metrics collection
- Circuit breakers (future)

**Configuration**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: bizbuddy-ingress
  annotations:
    konghq.com/plugins: rate-limiting, jwt, cors
spec:
  rules:
  - host: bizbuddy.local
    http:
      paths:
      - path: /api/v1
        pathType: Prefix
        backend:
          service:
            name: bizbuddy-backend
            port:
              number: 3000
      - path: /api/health
        backend:
          service:
            name: bizbuddy-backend
            port:
              number: 3000
```

**Benefits**:
1. **Centralized cross-cutting concerns** (auth, rate limiting, logging)
2. **Simpler backend services** (don't need to implement these)
3. **Easy to add new services** behind gateway
4. **Can do blue-green deployments** at gateway level
5. **API versioning** built-in

**Consequences**:
- ✅ Backend code cleaner
- ✅ Consistent policies across all endpoints
- ⚠️ Additional infrastructure component to manage
- ✅ Can use managed Kong in AWS (Amazon API Gateway) later

---

### ADR-006: Managed Services vs Self-Hosted
**Date**: 2025-03-11
**Status**: Accepted

**Context**:
- Need PostgreSQL, Redis, RabbitMQ, object storage
- Want minimal operational overhead in production
- Docker Compose for local? But need K8s for demo
- Cost considerations

**Decision**:
**Development (laptop)**: Self-hosted via Helm charts (Bitnami)
**Production (AWS)**: Managed services (RDS, ElastiCache, MQ, S3)

**Why This Hybrid**:
1. **Zero cost dev**: Helm charts run on k3s for free
2. **Production reliability**: Managed services have SLAs, backups, HA
3. **Same configuration**: Helm values compatible with AWS services via terraform
4. **Easy migration**: Just change connection strings

**Services**:
| Service | Dev (k3s) | Prod (AWS) | Migration Effort |
|---------|-----------|------------|------------------|
| PostgreSQL | Bitnami Helm | RDS | Change connection string + IAM |
| Redis | Bitnami Helm | ElastiCache | Change connection string |
| RabbitMQ | Bitnami Helm | Amazon MQ | Change connection URL |
| Object Storage | MinIO | S3 | Change endpoint + credentials |
| Monitoring | Prometheus + Grafana | Amazon CloudWatch | Switch metrics source |

**Implementation**:
- Use environment-specific `values.yaml` files
- Dev: `helm install --values values.dev.yaml`
- Prod: `helm install --values values.prod.yaml` (or use Terraform to provision managed)

**Consequences**:
- ✅ Free development environment
- ✅ Production-grade services
- ✅ Easy migration (configuration change only)
- ⚠️ Some API differences (MinIO vs S3 mostly compatible)
- ✅ Can test backup/restore procedures locally

---

### ADR-007: Observability Strategy
**Date**: 2025-03-11
**Status**: Accepted

**Context**:
- Need to monitor application health
- Debug distributed system issues
- Track business metrics (conversions, call quality)
- Alert on problems

**Decision**:
Use **Prometheus + Grafana + Loki + Jaeger** stack (all open-source, runs on k3s).

**Three Pillars of Observability**:

1. **Metrics** (Prometheus + Grafana)
   - Application: Request rate, error rate, duration (RED)
   - Infrastructure: CPU, memory, disk, network
   - Business: Active conversations, lead conversion rate, call volume
   - Dashboards: Real-time + historical

2. **Logs** (Loki)
   - Centralized log aggregation
   - Structured JSON logs from app
   - Query by service, level, correlation ID
   - Integrates with Grafana

3. **Traces** (Jaeger)
   - Distributed tracing across services
   - Trace conversation flow: API → AI → DB → Cache
   - Identify bottlenecks
   - Error propagation tracking

**Implementation**:
```yaml
# k8s/
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yaml
│   │   └── rules.yaml (alerts)
│   ├── grafana/
│   │   ├── grafana.yaml
│   │   └── dashboards/
│   │       ├── bizbuddy-api.json
│   │       ├── bizbuddy-infra.json
│   │       └── bizbuddy-business.json
│   ├── loki/
│   │   └── loki.yaml
│   └── jaeger/
│       └── jaeger.yaml
```

**Application Instrumentation**:
```typescript
// In code:
import { promClient } from 'prom-client';

// Counters
const requestsTotal = new promClient.Counter({
  name: 'bizbuddy_requests_total',
  help: 'Total requests',
  labelNames: ['method', 'route', 'status']
});

// Histograms
const requestDuration = new promClient.Histogram({
  name: 'bizbuddy_request_duration_seconds',
  help: 'Request duration',
  labelNames: ['route'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Middleware to record metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    requestsTotal.inc({ method: req.method, route: req.route?.path || req.path, status: res.statusCode.toString() });
    requestDuration.observe({ route: req.route?.path || req.path }, duration);
  });
  next();
});

// Expose /metrics endpoint for Prometheus scraping
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

**Benefits**:
1. **Proactive monitoring**: Alert on error rate > 1%
2. **Fast debugging**: Search logs by conversation ID
3. **Performance optimization**: Identify slow DB queries
4. **Business insights**: Track conversion funnels
5. **Capacity planning**: See when to scale resources

**Consequences**:
- ✅ Can catch issues before users notice
- ✅ Data-driven decision making
- ✅ Automated alerts via Alertmanager → Slack/Email
- ⚠️ Storage cost for metrics/logs (minimal on laptop)
- ✅ Essential for production SLOs

---

### ADR-008: CI/CD Strategy - GitHub Actions + ArgoCD
**Date**: 2025-03-11
**Status**: Accepted

**Context**:
- Need automated testing and deployment
- Want GitOps workflow (declarative infra)
- Need environment promotion (dev → staging → prod)
- Want automated rollback capabilities

**Decision**:
**CI**: GitHub Actions (build, test, scan)
**CD**: ArgoCD (GitOps continuous delivery)

**Pipeline Flow**:
```
Developer pushes code
    ↓
GitHub Actions triggers
    ↓
├─ Run unit tests
├─ Run integration tests
├─ Build Docker image
├─ Security scan (Trivy/Snyk)
├─ Push to local registry (laptop) / ECR (AWS)
└─ Create/update Git commit with new image tag
    ↓
ArgoCD detects new commit in git repo
    ↓
 kubectl apply -f k8s/ (sync with desired state)
    ↓
Rolling update deployment
    ↓
Health checks pass
    ↓
✅ Deployed!
```

**GitOps Repository Structure**:
```
infrastructure-gitops/
├── apps/
│   ├── bizbuddy-backend/
│   │   ├── base/            # Common config
│   │   ├── overlays/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── kustomization.yaml
│   └── bizbuddy-frontend/
├── infrastructure/
│   ├── postgresql/
│   ├── redis/
│   └── monitoring/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
└── ArgoCD Application manifests
```

**GitHub Actions Workflow**:
```yaml
name: CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run linter
        run: npm run lint
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build

  docker:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: |
          docker build -t bizbuddy-backend:${{ github.sha }} .
          docker tag bizbuddy-backend:${{ github.sha }} localhost:5000/bizbuddy-backend:latest
      - name: Push to registry
        run: |
          docker push localhost:5000/bizbuddy-backend:latest
      - name: Update kustomization
        run: |
          # Update image tag in kustomization.yaml
          sed -i "s|newTag:.*|newTag: ${{ github.sha }}|" infrastructure/apps/bizbuddy-backend/overlays/dev/kustomization.yaml
          git commit -am "Deploy backend ${{ github.sha }}"
          git push

  argocd-sync:
    needs: docker
    runs-on: ubuntu-latest
    steps:
      - name: Trigger ArgoCD sync
        run: |
          curl -X POST https://argocd.example.com/api/v1/applications/bizbuddy-backend/sync
```

**Benefits**:
1. **Automated testing** - No human forgets to test
2. **Consistent deployments** - Same process for all environments
3. **Easy rollback** - `git revert` + ArgoCD auto-syncs
4. **Audit trail** - All changes tracked in git
5. **Developer self-service** - Anyone can trigger deploy

**Consequences**:
- ✅ Fast, reliable deployments
- ✅ Full automation
- ⚠️ Initial setup complexity (ArgoCD install)
- ✅ Great for team collaboration

---

### ADR-009: Configuration Management
**Date**: 2025-03-11
**Status**: Accepted

**Context**:
- Need different configs for dev/staging/prod
- Secrets (API keys, DB passwords) must be protected
- Can't commit secrets to git
- Need easy configuration updates

**Decision**:
**Kubernetes ConfigMaps + Secrets + Helm values**

**Configuration Hierarchy**:
```
1. Default values in Chart.yaml (checked into git)
2. Environment values in values.dev.yaml, values.prod.yaml (checked in)
3. Sensitive secrets in Kubernetes Secrets (NOT in git)
4. Runtime overrides via environment variables
```

**Example**:
```yaml
# values.yaml (committed)
global:
  appName: bizbuddy
  image:
    repository: bizbuddy-backend
    tag: latest
  ingress:
    enabled: true
    host: bizbuddy.local

postgresql:
  postgresqlPassword: "CHANGE_ME"  # Overridden in secret

# Overlay for prod:
# values.prod.yaml
global:
  ingress:
    host: bizbuddy.example.com
postgresql:
  postgresqlPassword: "REAL_PASSWORD"  # From secret, not in file!
```

**Secrets Management**:
```bash
# Create secret (not committed):
kubectl create secret generic bizbuddy-secrets \
  --from-literal=database-url='postgresql://...' \
  --from-literal=openai-api-key='sk-...' \
  --dry-run=client -o yaml > secrets.yaml

# encrypted with SealedSecrets or SOPS if needed:
kubectl apply -f secrets.yaml
```

**Application Access**:
```typescript
// In app:
const dbUrl = process.env.DATABASE_URL;
// K8s injects from Secret → env var

// For local dev:
// .env file
// For k8s: helm install --set postgresql.postgresqlPassword=xxxx
```

**Benefits**:
1. **Secure**: Secrets never in git
2. **Flexible**: Different configs per environment
3. **Declarative**: All config in version control (except secrets)
4. **Easy updates**: `helm upgrade` with new values

**Consequences**:
- ✅ Secure secret handling
- ✅ Environment-specific configs
- ⚠️ Need process to manage secrets (external-secrets operator recommended)
- ✅ Can rotate secrets without code changes

---

### ADR-010: Database Strategy - Single Database vs Per Service
**Date**: 2025-03-11
**Status**: Accepted (Single DB now, split later)

**Context**:
- Monolith needs single database
- Future microservices might need their own databases
- Want to avoid distributed transactions
- PostgreSQL supports multiple schemas

**Decision**:
**Single PostgreSQL instance** with **multiple schemas** (or single schema with clear ownership).

**Current Schema**:
```
bizbuddy/
├── public/
│   ├── users
│   ├── businesses
│   ├── conversations
│   ├── messages
│   ├── pipelines
│   ├── leads
│   ├── agents
│   └── handoffs
└── (future: separate schemas per domain)
```

**Why**:
1. **Simple**: Single connection string, single backup
2. **ACID transactions**: Can span multiple tables
3. **Easy to split later**: Move tables to separate DBs
4. **PostgreSQL performance**: Can handle thousands of QPS

**Migration Plan to Microservices**:
1. Apply Schema per bounded context: `conversation`, `lead`, `user`, etc.
2. Each service owns its schema
3. Gradually move services to separate databases
4. Use logical replication to sync during transition

**Benefits**:
- ✅ Simple initially
- ✅ ACID transactions
- ⚠️ Potential coupling (but monolith anyway)
- ✅ Easy to extract later

**Consequences**:
- ✅ Fast development
- ✅ Consistent data
- ⚠️ Single point of failure (mitigated with PgBouncer + replicas)
- ✅ Can start with one schema, split when needed

---

## 🎯 Target Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Your Laptop (IaaS)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Kubernetes Cluster (k3s)                    │   │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │   │
│  │  │  Control    │   │   Worker    │   │   Worker    │          │   │
│  │  │   Plane     │   │   Node 1    │   │   Node 2    │          │   │
│  │  │  (k3s srv)  │   │             │   │             │          │   │
│  │  └─────────────┘   └─────────────┘   └─────────────┘          │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │               Kubernetes Resources                         │ │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │ │   │
│  │  │  │Backend   │  │Frontend  │  │ Postgres │  │  Redis   │ │ │   │
│  │  │  │Deploy    │  │ Deploy   │  │  Stateful│  │ Stateful │ │ │   │
│  │  │  │ReplicaSet│  │ReplicaSet│  │   Set    │  │   Set    │ │ │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │ │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │ │   │
│  │  │  │ RabbitMQ │  │  MinIO   │  │Prometheus│  │ Grafana  │ │ │   │
│  │  │  │Stateful  │  │Stateful  │  │          │  │          │ │ │   │
│  │  │  │   Set    │  │   Set    │  │Deploy    │  │Deploy    │ │ │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │              Ingress (Kong/NGINX)                          │ │   │
│  │  │  Routes: /api → backend, / → frontend, /metrics → prom   │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               │ External Calls
                               ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           SaaS Layer (Real Cloud)                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   OpenAI    │  │   SendGrid  │  │   Twilio    │  │   Stripe    ││
│  │   (ChatGPT) │  │  (Emails)   │  │  (SMS/Call) │  │ (Payments)  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack (Final)

### Backend
| Component | Technology | Version | Why |
|-----------|------------|---------|-----|
| Runtime | Node.js | 18+ | LTS, great ecosystem |
| Framework | Express.js | 4.18 | Simple, proven, fast |
| Language | TypeScript | 5.2 | Type safety, better DX |
| ORM | Prisma | 5.8 | Type-safe, migrations, easy |
| Database | PostgreSQL | 15+ | ACID, JSON support, reliable |
| Cache | Redis | 7+ | Fast, simple, proven |
| Message Queue | RabbitMQ | 3.12 | AMQP, reliable, monitoring |
| Auth | JWT | - | Stateless, scalable |
| Events | amqplib | - | RabbitMQ client |
| Monitoring | prom-client | - | Standard metrics |

### Frontend
| Component | Technology | Version | Why |
|-----------|------------|---------|-----|
| Framework | React | 18.2 | Popular, component-based |
| Language | TypeScript | 5.2 | Type safety |
| UI Library | Material-UI | 5.15 | Complete component library |
| State | React Query | 3.39 | Server state management |
| Forms | React Hook Form | 7.48 | Performant forms |
| Routing | React Router | 6.20 | Standard SPA routing |
| HTTP | Axios | 1.6 | Interceptors, easy |
| Real-time | Socket.io-client | 4.7 | WebSocket abstraction |

### Infrastructure
| Component | Technology | Version | Why |
|-----------|------------|---------|-----|
| Orchestration | Kubernetes (k3s/EKS) | 1.28 | Industry standard |
| Package Manager | Helm | 3.14 | K8s package manager |
| Ingress | Kong/NGINX | 2.x | API gateway, routing |
| CI | GitHub Actions | - | Integrated, free for open source |
| CD | ArgoCD | 2.8 | GitOps, declarative |
| IaC | Terraform | 1.5+ | Multi-cloud, team collaboration |
| Monitoring | Prometheus | 2.x | Metrics, alerting |
| Visualization | Grafana | 10.x | Dashboards, alerts |
| Logs | Loki | 2.x | Log aggregation |
| Tracing | Jaeger | 1.x | Distributed tracing |
| Secrets | Kubernetes Secrets | - | Built-in, simple |
| (Future) | External Secrets | - | Cloud secret integration |

### Development Tools
| Tool | Purpose |
|------|---------|
| VS Code | IDE |
| ESLint | Linting |
| Prettier | Code formatting |
| Jest | Unit/integration testing |
| Playwright | E2E testing |
| Docker | Containerization |
| kubectl | K8s CLI |
| Helm | Package management |
| Terraform | Infrastructure as Code |
| k9s | K8s terminal UI |
| Lens | K8s dashboard |

---

## 🚀 Deployment Strategy

### Environments

| Environment | Purpose | Infrastructure | Data |
|-------------|---------|----------------|------|
| **Local (laptop)** | Development, demo | k3s + Helm charts | Sample data |
| **Development** | Feature testing | k3s or cloud dev cluster | Copy of prod (sanitized) |
| **Staging** | Pre-prod validation | EKS with production-like scale | Copy of prod (sanitized) |
| **Production** | Live customers | Multi-AZ EKS + RDS + ElastiCache | Real customer data |

### Deployment Process

1. **Developer**: Create feature branch → Code → PR
2. **CI**: GitHub Actions runs tests → Builds Docker image → Scans for vulnerabilities
3. **Merge**: Push to `main` triggers deployment
4. **GitOps**: Image tag updated in git → ArgoCD detects change
5. **Deploy**: ArgoCD applies K8s manifests → Rolling update
6. **Verify**: Health checks → Prometheus alerts → Smoke tests
7. **Rollback**: If issues, revert git commit → ArgoCD rolls back

**Deployment Time**:
- Local: `git push` → ArgoCD sync → 30 seconds
- Production: With canary + automated testing → 5-10 minutes

---

## 📈 Scaling Strategy

### Horizontal Scaling (Scale Out)

**Application**:
```yaml
# HPA (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bizbuddy-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bizbuddy-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Triggers**:
- CPU > 70% for 5m → Add replica
- Memory > 80% for 5m → Add replica
- Custom metric (queue depth) → Add replica

### Vertical Scaling (Scale Up)

**Pod Resources**:
```yaml
resources:
  requests:
    cpu: "200m"
    memory: "512Mi"
  limits:
    cpu: "1000m"
    memory: "2Gi"
```

**Node Types** (AWS):
- Dev: t3.medium (2 vCPU, 4GB RAM)
- Prod: m5.xlarge (4 vCPU, 16GB RAM) or GPU instances for AI

### Database Scaling

1. **Read replicas**: Route analytics queries to replicas
2. **Connection pooling**: PgBouncer in transaction pooling mode
3. **Caching**: Redis for frequent queries (conversations, leads)
4. **Partitioning**: By business ID or date for large tables

### AI Service Scaling

**Problem**: OpenAI API has rate limits

**Solution**:
- Implement request queueing (RabbitMQ)
- Multiple OpenAI API keys (rotation)
- Cache AI responses (Redis) for similar queries
- Implement circuit breaker pattern
- Consider self-hosted model (Llama 3.1) for high volume

---

## 🔒 Security Considerations

### Network Security
- All pods in K8s have NetworkPolicies (default deny)
- Only ingress can access services from outside
- Pod-to-pod communication restricted by label
- mTLS between services (service mesh)

### Authentication & Authorization
- JWT tokens signed with strong secret (rotate quarterly)
- Tokens expire in 24 hours, refresh tokens valid 7 days
- Role-based access control (RBAC) in app logic
- API gateway validates JWT before routing

### Secrets Management
- Kubernetes Secrets (base64 encoded, not encrypted at rest by default)
- **Production**: Use AWS Secrets Manager or HashiCorp Vault
- SealedSecrets for git-ops friendly secrets

### Compliance
- GDPR: Data encryption at rest (RDS), data deletion on request
- SOC2: Audit logging, access controls, metrics
- HIPAA (if healthcare): BAA with cloud provider, additional encryption

### Runtime Security
- Container image scanning (Trivy/Clair)
- Pod security policies (run as non-root)
- Falco for runtime threat detection
- Regular security updates

---

## 🧪 Testing Strategy

### Unit Tests
- ✅ Service methods (AI, conversation, lead scoring)
- ✅ Utility functions
- ✅ React components

### Integration Tests
- ✅ API endpoints (with test database)
- ✅ Database transactions
- ✅ External service mocks (OpenAI, Twilio)

### E2E Tests
- ✅ User registration → login → conversation
- ✅ Lead qualification flow
- ✅ Voice call initiation (WebRTC signaling)

### Performance Tests
- ✅ Load test: 100 concurrent users
- ✅ WebRTC stress test: 10 simultaneous calls
- ✅ AI prompt processing: 100 requests/sec

### Chaos Engineering
- ✅ Kill random pods → verify self-healing
- ✅ Stop PostgreSQL → verify circuit breaker
- ✅ Network latency injection → verify timeout handling

---

## 📊 Monitoring & Alerting

### Key Metrics (SLOs)

| Service | Metric | Target | Alert |
|---------|--------|--------|-------|
| API | Availability | 99.9% | < 99% for 5m |
| API | Latency (p95) | < 200ms | > 500ms for 5m |
| Database | Connection pool usage | < 80% | > 90% for 5m |
| AI | Error rate | < 1% | > 5% for 2m |
| Voice | Call setup time | < 2s | > 5s for 5m |
| Leads | Qualification accuracy | > 85% | < 80% for 1h |

### Dashboards

1. **API Overview**
   - Request rate, error rate, duration
   - Top endpoints by latency
   - Status codes distribution

2. **Infrastructure**
   - Node resource usage
   - Pod restarts
   - Pod distribution across nodes

3. **Business Metrics**
   - Active conversations
   - Lead conversion funnel
   - Call volume and duration
   - Agent utilization

4. **AI Performance**
   - OpenAI API latency
   - Token usage and cost
   - Error rates by model

5. **Voice Quality**
   - Call setup success rate
   - MOS (Mean Opinion Score) estimation
   - Jitter, packet loss, latency

### Alerts

- **PagerDuty/Opsgenie**: Critical alerts (service down, high error rate)
- **Slack**: Warning alerts (high latency, capacity threshold)
- **Email**: Daily digest, weekly reports

---

## 💰 Cost Optimization (Cloud)

### Development (Laptop)
- **Cost**: $0 (electricity only)
- **Resources**: 32GB RAM, 8 cores

### Production (AWS Estimates)

| Service | Specification | Monthly Cost |
|---------|---------------|--------------|
| EKS Cluster | 3x m5.large nodes | ~$200 |
| RDS PostgreSQL | db.t3.medium, multi-AZ | ~$150 |
| ElastiCache Redis | cache.t3.micro | ~$20 |
| EC2 (if needed) | t3.medium x 2 | ~$40 |
| Load Balancer | ALB | ~$20 |
| S3 Storage | 100GB | ~$2 |
| CloudWatch | Custom metrics, logs | ~$50 |
| OpenAI API | ~$0.002-0.02/request | Variable |
| **Total** | **Estimated** | **~$500-800/month** |

**Optimization Strategies**:
- Spot instances for non-critical workloads
- Auto-scaling to zero for dev/staging nights
- Reserved instances for production (1-3 year commitment)
- S3 Intelligent-Tiering for infrequent access
- OpenAI caching layer to reduce API calls

---

## 🔄 Disaster Recovery

### Backup Strategy
- **Database**: Automated daily snapshots, PITR (point-in-time recovery) for 7 days
- **MinIO/S3**: Versioned buckets with lifecycle policies
- **K8s manifests**: All in git (immutable)

### Recovery Time Objectives (RTO)
- Critical services: < 1 hour
- Full restore: < 4 hours

### Recovery Point Objectives (RPO)
- Database: < 1 hour (daily snapshots + WAL)
- Files: < 24 hours (daily sync)
- Configuration: 0 (git is source of truth)

### Failover Process
1. Detect region failure ( Route53 health check )
2. Switch DNS to secondary region (60s TTL)
3. Secondary region already has replica data (read replica promoted)
4. Scale up resources in new region
5. Notify team

---

## 🎯 Migration to Production Cloud

### Step 1: Provision Infrastructure (Terraform)
```bash
cd terraform/environments/prod
terraform init
terraform plan
terraform apply
# Creates: EKS cluster, VPC, RDS, ElastiCache, etc.
```

### Step 2: Update Configuration
- Change `values.prod.yaml` to use managed service endpoints
- Update connection strings
- Set up IAM roles for K8s service accounts

### Step 3: Deploy to Production
```bash
kubectl config use-context aws-prod
kubectl apply -f k8s/prod/
# Or: git push to argocd repo
```

### Step 4: Verify
- Run smoke tests
- Check monitoring dashboards
- Verify backups
- Test failover

**Migration Time**: 1-2 days for initial setup, then ongoing CI/CD

---

## 📚 References & Further Reading

### Books
- "Kubernetes Patterns" by Bilgin Ibryam, Roland Huß
- "Cloud Native Patterns" by Cornelia Davis
- "Site Reliability Engineering" by Niall Richard Murphy

### Documentation
- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [Helm Docs](https://helm.sh/docs/)
- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [Terraform Docs](https://developer.hashicorp.com/terraform/docs)

### Patterns
- [12-Factor App](https://12factor.net/)
- [Cloud Native Computing Foundation](https://www.cncf.io/)
- [GitOps](https://www.gitops.tech/)

---

## ✅ Next Steps

### Immediate (This Week)
1. ✅ Create `k3s-setup.sh` - One-command cluster install
2. ✅ Create Helm charts for all services
3. ✅ Set up local registry for Docker images
4. ✅ Create `demo-setup.sh` that does everything
5. ✅ Test full stack on laptop

### Short-term (Next 2 Weeks)
1. Implement event bus in application code
2. Add OpenTelemetry instrumentation
3. Set up GitHub Actions CI
4. Create ArgoCD manifests for GitOps
5. Build Grafana dashboards

### Medium-term (Next Month)
1. Deploy to AWS dev environment
2. Implement Terraform for infrastructure
3. Add chaos engineering tests
4. Set up proper alerting
5. Performance testing and optimization

### Long-term (3+ Months)
1. Extract first microservice (Auth)
2. Implement service mesh (Istio/Linkerd)
3. Add advanced security (OPA, Kyverno)
4. Multi-region deployment
5. Advanced AI model fine-tuning

---

## 🎉 Conclusion

We've designed a **cloud-native, production-ready architecture** that:

1. ✅ **Runs on your laptop** for development and demo (zero cost)
2. ✅ **Deploys to AWS** with minimal changes (1 `terraform apply`)
3. ✅ **Scales horizontally** as your business grows
4. ✅ **Observable** with full metrics, logs, and traces
5. ✅ **Secure** with best practices baked in
6. ✅ **Maintainable** with clear separation of concerns
7. ✅ **Future-proof** designed for microservice extraction
8. ✅ **Cost-effective** with managed services where it matters

**The beauty**: Same YAML manifests, same Helm charts, same CI/CD pipelines work on laptop and AWS. You're developing exactly as you'll deploy.

**Ready to build?** Let's start with the `k3s-setup.sh` script and get your laptop cloud running! 🚀

---

**Document Version**: 1.0
**Last Updated**: 2025-03-11
**Author**: BizBuddy Architecture Team
**Review Date**: Ongoing