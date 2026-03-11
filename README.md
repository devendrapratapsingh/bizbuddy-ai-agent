# DevOps Engineer Skill Project

A comprehensive collection of Claude Code skills for managing infrastructure, CI/CD, security, and operations as a Senior DevOps Engineer.

## Overview

This project provides Claude Code with specialized skills to handle DevOps tasks across the entire software delivery lifecycle. Each skill is self-contained and can be invoked independently or orchestrated together.

## Skills

| Skill | Description | Trigger |
|-------|-------------|---------|
| `infrastructure-as-code` | Manage IaC with Terraform, CloudFormation, Pulumi | `/infrastructure-as-code` |
| `application-cicd` | Application CI/CD pipelines | `/application-cicd` |
| `idp-platform-cicd` | Internal Developer Platform CI/CD | `/idp-platform-cicd` |
| `provisioning` | Resource provisioning automation | `/provisioning` |
| `orchestration` | Container/K8s orchestration | `/orchestration` |
| `security` | DevSecOps practices | `/security` |
| `code-review` | Review DevOps code | `/code-review` |
| `code-review-application` | Review application code (Python, Java, Node.js, Go) | `/code-review-application` |
| `code-test` | Test infrastructure code | `/code-test` |
| `observer-reporter` | Monitoring and observability | `/observer-reporter` |
| `orchestrator` | Orchestrate DevOps workflows | `/orchestrator` |
| `devops-architect` | Strategic DevOps architecture & transformation | `/devops-architect` |
| `aws-architect` | AWS-native architecture design | `/aws-architect` |
| `azure-architect` | Azure-native architecture design | `/azure-architect` |
| `gcp-architect` | GCP-native architecture design | `/gcp-architect` |
| `ai-ops` | AI/LLM operations, token optimization, cost management | `/ai-ops` |
| `memory-management` | AI memory systems, context optimization, RAG | `/memory-management` |
| `app-security` | Application security scanning (SAST, DAST, SCA) | `/app-security` |
| `platform-security` | Platform security (K8s, containers, cloud, IaC) | `/platform-security` |
| `enterprise-architect` | Enterprise architecture (Finance, Airline, Telecom, Healthcare) | `/enterprise-architect` |
| `sre` | Site Reliability Engineering (SLI/SLO/SLA, error budgets) | `/sre` |
| `mlops` | Machine Learning Operations (model deployment, training pipelines) | `/mlops` |
| `finops` | Cloud financial management and cost optimization | `/finops` |
| `k8s` | Kubernetes deep expertise (cluster management, debugging) | `/k8s` |
| `performance-engineer` | Load testing, profiling, and performance optimization | `/performance-engineer` |
| `debugger` | Comprehensive debugging for distributed systems | `/debugger` |
| `planner` | Strategic planning and execution planning | `/planner` |
| `plan-peer-verifier` | **Ultra-think verification** - Critical peer review, assumption challenging, stress-testing | `/plan-peer-verifier` |
| `java-sdlc` | Complete Java SDLC - Maven/Gradle, Spring Boot, testing, CI/CD | `/java-sdlc` |
| `python-sdlc` | Complete Python SDLC - packaging, testing, FastAPI/Django, deployment | `/python-sdlc` |
| `rust-sdlc` | Complete Rust SDLC - Cargo, Tokio, Axum/Actix, cross-compilation | `/rust-sdlc` |
| `nodejs-sdlc` | Complete Node.js/TypeScript SDLC - pnpm, NestJS, monorepos | `/nodejs-sdlc` |
| `ai-patterns` | AI/LLM design patterns - prompt engineering, agents, tool use | `/ai-patterns` |
| `rag-systems` | RAG implementation - vector DBs, embeddings, chunking, retrieval | `/rag-systems` |

## Quick Start

### Using Skills

```bash
# Navigate to your project
cd /path/to/your/project

# Use any skill by invoking the command
/infrastructure-as-code

# Or let Claude detect and use the appropriate skill automatically
```

### Installation

These skills are automatically available when using Claude Code in any project under the `skill_project` directory or when the `.claude/skills` directory is present.

## Skill Details

### Infrastructure as Code
- Terraform, CloudFormation, Pulumi expertise
- State management and locking
- Module development and versioning
- Security best practices
- Multi-environment strategies

### Application CI/CD
- GitHub Actions, GitLab CI, Jenkins, Azure DevOps
- Build optimization and caching
- Testing integration (SAST, DAST)
- Deployment strategies (Blue/Green, Canary)
- Artifact management

### IDP Platform CI/CD
- Backstage golden path templates
- Self-service infrastructure
- Platform API design
- Policy enforcement
- Developer experience optimization

### Provisioning
- Cloud resource provisioning (AWS, Azure, GCP)
- Bare metal provisioning
- Container resource provisioning
- Identity and access provisioning
- Cost optimization

### Orchestration
- Kubernetes cluster management
- Service mesh (Istio, Linkerd)
- Helm chart management
- ArgoCD GitOps
- Multi-cluster management

### Security
- Security scanning (SAST, DAST)
- Secrets management (Vault, AWS Secrets Manager)
- Compliance automation (CIS, SOC 2)
- Policy as Code (OPA)
- Incident response

### Code Review
- Review Dockerfiles, Terraform, Kubernetes
- Security-focused code review
- Best practice validation
- Automated review pipelines
- Review templates and checklists

### Code Test
- Terraform testing (Terratest)
- Kubernetes testing (kubeconform, OPA)
- Docker testing (container-structure-test)
- Shell script testing (Bats)
- Ansible testing (Molecule)

### Observer Reporter
- Prometheus/Grafana setup
- Centralized logging (Loki, ELK)
- Distributed tracing (Jaeger)
- Alert management
- Cost and performance reporting

### Orchestrator
- Multi-step deployment orchestration
- Change management
- Incident response coordination
- Pipeline orchestration
- Resource coordination

### Code Review Application
- Review Python, Java, Node.js, Go, Ruby applications
- Language-specific best practices
- Security-focused code review
- Design pattern validation
- Performance and maintainability review

### AWS Architect
- AWS-native architecture design
- Well-Architected Framework compliance
- Service selection and integration
- Cost optimization strategies
- Security best practices

### Azure Architect
- Azure-native architecture design
- Well-Architected Framework compliance
- Azure service integration
- Cost management
- Enterprise security patterns

### GCP Architect
- GCP-native architecture design
- Well-Architected Framework compliance
- Google Cloud service selection
- Cost optimization
- Security and compliance

### DevOps Architect
- Strategic DevOps platform architecture
- Maturity assessments
- Toolchain selection
- Transformation roadmaps
- Platform engineering strategy

### AI-Ops
- AI/LLM operations and cost management
- Token usage optimization
- Prompt engineering strategies
- Model selection guidance
- Inference optimization

### Memory Management
- AI memory systems design
- Context window optimization
- Long-term memory strategies
- RAG implementation
- Memory-efficient conversation design

### App Security
- Application security scanning (SAST, DAST, SCA)
- Dependency vulnerability scanning
- Secrets detection
- Secure coding practices
- Application security controls

### Platform Security
- Container and Kubernetes security
- Cloud security posture management
- IaC security scanning
- Network security
- Infrastructure security controls

### Enterprise Architect
- Domain-specific architecture (Finance, Airline, Telecom, Healthcare, Retail)
- TOGAF framework implementation
- Regulatory compliance
- Integration patterns
- Data governance

### SRE
- SLI/SLO/SLA definition and management
- Error budgets and burn rate alerting
- Incident management procedures
- Chaos engineering
- Production readiness reviews

### MLOps
- ML model deployment and serving
- Training pipeline orchestration
- Model monitoring and drift detection
- Feature stores
- Experiment tracking

### FinOps
- Cloud cost optimization
- Tagging and allocation strategies
- Showback/chargeback models
- Reserved capacity planning
- Waste elimination

### K8s
- Kubernetes cluster management
- Performance tuning and optimization
- Security hardening
- Troubleshooting and debugging
- Networking and storage management

### Performance Engineer
- Load testing and stress testing
- Application profiling
- Bottleneck analysis
- Capacity planning
- Performance optimization

### Debugger
- Distributed systems debugging
- Log analysis and correlation
- Distributed tracing
- Root cause analysis
- Crash dump analysis

### Planner
- Strategic planning and execution
- Milestone and dependency management
- Risk analysis and mitigation
- Resource allocation
- Actionable plan breakdown

### Plan Peer Verifier
- Critical plan review and validation
- Assumption challenging
- Logic testing and stress-testing
- Blind spot identification
- Devil's advocate perspective

### Java SDLC
- Maven/Gradle project setup
- Spring Boot applications
- JUnit 5 and Mockito testing
- Code quality (SonarQube, Checkstyle)
- Security scanning (OWASP)
- CI/CD pipelines
- Containerization and deployment

### Python SDLC
- Virtual environments (venv, poetry, uv)
- Type hints and mypy checking
- pytest with async support
- FastAPI/Django web frameworks
- Pydantic data validation
- Security (bandit, safety)
- CI/CD and deployment

### Rust SDLC
- Cargo workspace management
- Memory safety patterns
- Async programming with Tokio
- Web frameworks (Axum, Actix)
- Cross-compilation
- Security and performance
- CI/CD and containerization

### Node.js SDLC
- TypeScript strict configuration
- pnpm/yarn/npm management
- Testing with Vitest/Jest
- Express/NestJS/Fastify
- Monorepos with Turborepo
- Prisma/Drizzle ORM
- CI/CD and deployment

### AI Patterns
- Prompt engineering techniques
- Agent architectures (ReAct, Plan-and-Execute)
- Tool use and function calling
- Multi-modal patterns
- Chain-of-thought reasoning
- Cost optimization
- Security and output filtering

### RAG Systems
- Vector databases (Pinecone, Chroma, pgvector)
- Embedding models and chunking
- Hybrid search (BM25 + vector)
- Reranking strategies
- Context assembly
- Faithfulness checking
- Production monitoring

## Directory Structure

```
skill_project/
├── .claude/
│   └── skills/
│       ├── infrastructure-as-code/
│       │   └── SKILL.md
│       ├── application-cicd/
│       │   └── SKILL.md
│       ├── idp-platform-cicd/
│       │   └── SKILL.md
│       ├── provisioning/
│       │   └── SKILL.md
│       ├── orchestration/
│       │   └── SKILL.md
│       ├── security/
│       │   └── SKILL.md
│       ├── code-review/
│       │   └── SKILL.md
│       ├── code-review-application/
│       │   └── SKILL.md
│       ├── code-test/
│       │   └── SKILL.md
│       ├── observer-reporter/
│       │   └── SKILL.md
│       ├── orchestrator/
│       │   └── SKILL.md
│       ├── devops-architect/
│       │   └── SKILL.md
│       ├── aws-architect/
│       │   └── SKILL.md
│       ├── azure-architect/
│       │   └── SKILL.md
│       ├── gcp-architect/
│       │   └── SKILL.md
│       ├── ai-ops/
│       │   └── SKILL.md
│       ├── memory-management/
│       │   └── SKILL.md
│       ├── app-security/
│       │   └── SKILL.md
│       ├── platform-security/
│       │   └── SKILL.md
│       ├── enterprise-architect/
│       │   └── SKILL.md
│       ├── sre/
│       │   └── SKILL.md
│       ├── mlops/
│       │   └── SKILL.md
│       ├── finops/
│       │   └── SKILL.md
│       ├── k8s/
│       │   └── SKILL.md
│       ├── performance-engineer/
│       │   └── SKILL.md
│       ├── debugger/
│       │   └── SKILL.md
│       ├── planner/
│       │   └── SKILL.md
│       └── plan-peer-verifier/
│           └── SKILL.md
└── README.md
```

## Skill Configuration

Each skill follows the SKILL.md format:

```yaml
---
name: skill-name
description: What this skill does
user-invocable: true
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Skill Content
...
```

## Best Practices

1. **Always review plans** before applying infrastructure changes
2. **Use version control** for all infrastructure code
3. **Implement security scanning** at every stage
4. **Monitor and alert** on all critical metrics
5. **Document everything** in code and runbooks
6. **Test in non-production** environments first
7. **Use least privilege** for all access
8. **Encrypt data** at rest and in transit
9. **Automate everything** that can be automated
10. **Maintain audit trails** for all changes

## Common Workflows

### New Service Deployment

1. `/idp-platform-cicd` - Create golden path from template
2. `/infrastructure-as-code` - Provision infrastructure
3. `/security` - Run security scans
4. `/code-test` - Run all tests
5. `/orchestrator` - Orchestrate deployment
6. `/observer-reporter` - Monitor post-deployment

### Incident Response

1. `/observer-reporter` - Create incident
2. `/orchestrator` - Coordinate response
3. `/security` - Security analysis if needed
4. `/provisioning` - Remediation actions
5. `/observer-reporter` - Post-incident review

### Infrastructure Update

1. `/infrastructure-as-code` - Plan changes
2. `/code-review` - Review changes
3. `/security` - Security validation
4. `/orchestrator` - Orchestrated rollout
5. `/code-test` - Integration tests
6. `/observer-reporter` - Monitor health

### Plan Verification & Review (Ultra-Think)

Use this workflow for critical decisions requiring deep scrutiny:

1. `/planner` - Create initial plan with milestones
2. `/plan-peer-verifier` - **Ultra-think review** - Challenge every assumption
   - Question the goal: Is this the RIGHT problem?
   - Stress-test: What happens when things go wrong?
   - Identify blind spots: What haven't we considered?
   - Expose circular reasoning and hidden dependencies
3. `/security` - Validate security implications
4. `/sre` - Check reliability targets and error budgets
5. `/finops` - Verify cost implications
6. Revise plan based on findings
7. `/orchestrator` - Execute validated plan

### Pre-Production Review

Before any production deployment:

1. `/code-review` - Review infrastructure code
2. `/code-review-application` - Review application code
3. `/app-security` - SAST/DAST scanning
4. `/platform-security` - Container and K8s security
5. `/plan-peer-verifier` - **Ultra-think** deployment risk analysis
6. `/code-test` - Integration and compliance tests
7. `/performance-engineer` - Load testing validation

## Troubleshooting

### Skill not loading
- Ensure `.claude/skills/` directory exists
- Check SKILL.md YAML frontmatter is valid
- Verify skill name matches directory name

### Commands not working
- Use `/command` format in Claude Code
- Check that skill is user-invocable
- Verify allowed-tools are specified

### Permissions issues
- Skills inherit parent Claude Code permissions
- Review allowed-tools in SKILL.md
- Some skills may require manual invocation

## Contributing

To add a new skill:

1. Create directory under `.claude/skills/`
2. Add SKILL.md with YAML frontmatter
3. Document the skill in this README
4. Test with `/<skill-name>`

## License

MIT - This is a template project for DevOps automation.

## Support

For issues or questions about these skills, refer to the Claude Code documentation or create an issue in the project repository.

---

**Maintained by:** Senior DevOps Engineering Team
**Last Updated:** 2024