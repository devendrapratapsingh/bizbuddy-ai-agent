# DevOps Skill Project Context

## Environment
- **Primary working directory**: /Users/uniquenotion/Private/projects/skill_project
- **Shell**: zsh
- **Platform**: macOS (Darwin)
- **Date**: 2026-03-11

## Skills Available (29 Total)

### Infrastructure & Architecture
- `infrastructure-as-code` - Terraform, CloudFormation, Pulumi
- `provisioning` - Resource provisioning automation
- `orchestration` - Container/K8s orchestration
- `k8s` - Kubernetes deep expertise
- `aws-architect` - AWS-native architecture
- `azure-architect` - Azure-native architecture
- `gcp-architect` - GCP-native architecture
- `devops-architect` - Strategic DevOps architecture
- `enterprise-architect` - Domain-specific enterprise architecture

### CI/CD & Platform
- `application-cicd` - Application CI/CD pipelines
- `idp-platform-cicd` - Internal Developer Platform
- `orchestrator` - DevOps workflow orchestration

### Security & Compliance
- `security` - DevSecOps practices
- `app-security` - Application security scanning
- `platform-security` - Platform security (K8s, containers, cloud)

### Operations & Reliability
- `sre` - Site Reliability Engineering (SLI/SLO/SLA)
- `observer-reporter` - Monitoring and observability
- `performance-engineer` - Load testing and profiling
- `debugger` - Distributed systems debugging

### Specialized
- `mlops` - Machine Learning Operations
- `finops` - Cloud financial management
- `ai-ops` - AI/LLM operations optimization
- `memory-management` - AI memory systems

### Application Development (SDLC)
- `java-sdlc` - Complete Java SDLC (Maven/Gradle, Spring Boot, JUnit)
- `python-sdlc` - Complete Python SDLC (poetry/uv, FastAPI, pytest)
- `rust-sdlc` - Complete Rust SDLC (Cargo, Tokio, Axum)
- `nodejs-sdlc` - Complete Node.js/TypeScript SDLC (pnpm, NestJS)

### AI/ML
- `ai-patterns` - AI/LLM design patterns (prompt engineering, agents)
- `rag-systems` - RAG implementation (vector DBs, embeddings, hybrid search)

### Review & Quality
- `code-review` - DevOps code review
- `code-review-application` - Application code review
- `code-test` - Infrastructure testing

### Planning & Strategy
- `planner` - Strategic planning with milestones
- `plan-peer-verifier` - Critical plan review

## Skill Invocation Patterns

### Direct Invocation
```
/infrastructure-as-code
/security
/planner
```

### Auto-Detection
Claude auto-detects appropriate skills based on:
- File types (.tf, .yaml, .dockerfile, etc.)
- Context keywords (kubernetes, terraform, security)
- Task descriptions

## Default Behaviors

1. **Always review plans** before applying infrastructure changes
2. **Use version control** for all infrastructure code
3. **Implement security scanning** at every stage
4. **Monitor and alert** on all critical metrics
5. **Document everything** in code and runbooks
6. **Test in non-production** environments first
7. **Use least privilege** for all access
8. **Encrypt data** at rest and in transit

## Safety Checks for Destructive Operations

When performing potentially destructive operations, always confirm and review:

- **Terraform Apply**: Review the plan output before confirming any infrastructure changes
- **Kubectl Delete**: Confirm the resource names and namespaces before deleting
- **Database Migrations**: Backup data before running destructive migrations
- **Branch/Repo Operations**: Verify branch names and remote targets before force-pushing

## Protective Safeguards

⚠️ **Destructive Operation Warnings:**
- Before `terraform apply`, always review the plan and confirm expected changes
- Before `kubectl delete`, verify the resource name and namespace to avoid accidental deletion
- Before any destructive operation, confirm the target environment (never delete from production by mistake)

## Preferred Tools
- **IaC**: Terraform (default), CloudFormation, Pulumi
- **Containers**: Docker, Kubernetes
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **Monitoring**: Prometheus, Grafana, Loki
- **Security**: Vault, OPA, Trivy

## Workflow Shortcuts

### New Service Deployment
```
/planner → /idp-platform-cicd → /infrastructure-as-code → /security → /code-test
```

### Incident Response
```
/debugger → /orchestrator → /observer-reporter
```

### Cost Optimization
```
/finops → /performance-engineer → /ai-ops
```

### Security Audit
```
/platform-security → /app-security → /code-review
```

### ML Deployment
```
/planner → /mlops → /k8s → /observer-reporter
```

### Ultra-Think Verification (Critical Decisions)
```
/planner → /plan-peer-verifier → /debugger → /security → /performance-engineer → /sre
```

**When to use ultra-think:**
- Production architecture decisions
- Multi-region deployments
- Security-critical changes
- High-cost infrastructure commitments
- Irreversible migrations

**Ultra-think checklist:**
- Challenge every assumption
- Question the goal: Is this the RIGHT problem?
- Stress-test: What happens when things go wrong?
- Identify blind spots: What haven't we considered?
- Expose circular reasoning and hidden dependencies
- Validate against edge cases

## MCP Integrations
- **GitHub**: Repository operations, issues, PRs
- **Filesystem**: Project file access
- **Fetch**: Web content retrieval

## Environment Variables
See `.env` file for cloud provider configurations.

## Memory
- Use `/Users/uniquenotion/.claude/projects/-Users-uniquenotion-Private-projects-skill-project/memory/MEMORY.md` for persistent context
- Store stable patterns, conventions, and user preferences

## Support
For issues or questions about these skills, refer to the Claude Code documentation.

**Maintained by**: Senior DevOps Engineering Team
**Last Updated**: 2026-03-10
