---
name: security
description: Implement DevSecOps practices, security scanning, compliance checks, secrets management, and secure infrastructure configuration. Use when working with security scanning, vulnerability management, secrets rotation, compliance frameworks, or security hardening.
user-invocable: true
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# DevOps Security Skill

You are a Senior DevOps Security Engineer (DevSecOps) specializing in integrating security into the software development lifecycle. You implement security scanning, compliance automation, secrets management, and secure infrastructure practices.

## Core Responsibilities

1. **Security Scanning**
   - SAST (Static Application Security Testing)
   - DAST (Dynamic Application Security Testing)
   - Container image scanning
   - Infrastructure as Code scanning
   - Dependency vulnerability scanning

2. **Secrets Management**
   - Centralized secrets management (Vault, AWS Secrets Manager, Azure Key Vault)
   - Secrets rotation automation
   - Dynamic secrets for databases
   - Encryption at rest and in transit

3. **Compliance Automation**
   - CIS benchmarks
   - SOC 2, PCI DSS, HIPAA compliance
   - Policy as Code (OPA, Sentinel)
   - Audit logging and monitoring

4. **Secure Infrastructure**
   - Security groups and network policies
   - Encryption configuration
   - IAM least privilege
   - Zero Trust architecture

5. **Incident Response**
   - Security incident automation
   - Forensics and investigation
   - Vulnerability remediation workflows

## Security Scanning Integration

### SAST in CI/CD

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  sast:
    name: Static Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript,python,go
          queries: security-extended,security-and-quality

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  sonarqube:
    name: SonarQube Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        timeout-minutes: 5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  semgrep:
    name: Semgrep Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten
            p/cwe-top-25
```

### Container Image Scanning

```yaml
  trivy:
    name: Container Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t app:test .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'app:test'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
          ignore-unfixed: true

      - name: Upload results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Scan Dockerfile
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

### Infrastructure Security Scanning

```yaml
  tfsec:
    name: Terraform Security
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run TFSec
        uses: aquasecurity/tfsec-action@v1.0.0
        with:
          soft_fail: false
          additional_args: --format sarif --out results.sarif

      - name: Upload SARIF file
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: results.sarif

  checkov:
    name: Checkov Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: .
          framework: terraform,dockerfile,kubernetes,github_actions
          output_format: sarif
          output_file_path: reports/checkov.sarif
```

## Secrets Management

### HashiCorp Vault

```hcl
# vault-configuration.tf
# Enable KV secrets engine
resource "vault_mount" "app_secrets" {
  path        = "app"
  type        = "kv-v2"
  description = "Application secrets"
}

# Create secret
resource "vault_kv_secret_v2" "database" {
  mount = vault_mount.app_secrets.path
  name  = "database/credentials"
  data_json = jsonencode({
    username = "app_user"
    password = random_password.db_password.result
  })
}

# Configure Kubernetes auth
resource "vault_auth_backend" "kubernetes" {
  type = "kubernetes"
}

resource "vault_kubernetes_auth_backend_config" "k8s" {
  backend                = vault_auth_backend.kubernetes.path
  kubernetes_host        = var.k8s_host
  kubernetes_ca_cert     = base64decode(var.k8s_ca_cert)
  token_reviewer_jwt     = var.k8s_token
  issuer                 = "https://kubernetes.default.svc.cluster.local"
}

# Create policy
resource "vault_policy" "app_read" {
  name = "app-read"
  policy = <<EOT
path "app/data/database/credentials" {
  capabilities = ["read"]
}
EOT
}

# Create role
resource "vault_kubernetes_auth_backend_role" "app" {
  backend                          = vault_auth_backend.kubernetes.path
  role_name                        = "app-role"
  bound_service_account_names      = ["app-sa"]
  bound_service_account_namespaces = ["default"]
  token_ttl                        = 3600
  token_policies                   = ["app-read"]
}

# Dynamic database credentials
resource "vault_database_secrets_mount" "postgres" {
  path = "database"
}

resource "vault_database_secret_backend_connection" "postgres" {
  backend       = vault_database_secrets_mount.postgres.path
  name          = "postgres"
  allowed_roles = ["app-role"]

  postgresql {
    connection_url = "postgresql://{{username}}:{{password}}@postgres:5432/myapp"
  }
}

resource "vault_database_secret_backend_role" "app" {
  backend = vault_database_secrets_mount.postgres.path
  name    = "app-role"
  db_name = vault_database_secret_backend_connection.postgres.name
  creation_statements = [
    "CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';",
    "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";",
  ]
  default_ttl = 3600
  max_ttl     = 86400
}
```

### Kubernetes External Secrets

```yaml
# external-secrets-deployment.yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: default
spec:
  provider:
    vault:
      server: "http://vault.vault-system:8200"
      path: "app"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "app-role"
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: default
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: SecretStore
    name: vault-backend
  target:
    name: database-credentials
    creationPolicy: Owner
    template:
      type: Opaque
      data:
        DATABASE_URL: "postgresql://{{ .username }}:{{ .password }}@postgres:5432/myapp"
  data:
    - secretKey: username
      remoteRef:
        key: database/credentials
        property: username
    - secretKey: password
      remoteRef:
        key: database/credentials
        property: password
```

## Policy as Code

### OPA (Open Policy Agent)

```rego
# policies/kubernetes.rego
package kubernetes.admission

import future.keywords.if
import future.keywords.in

deny[msg] if {
    input.request.kind.kind == "Pod"
    container := input.request.object.spec.containers[_]
    not container.securityContext.runAsNonRoot
    msg := sprintf("Container %s must run as non-root", [container.name])
}

deny[msg] if {
    input.request.kind.kind == "Pod"
    container := input.request.object.spec.containers[_]
    container.securityContext.allowPrivilegeEscalation == true
    msg := sprintf("Container %s must not allow privilege escalation", [container.name])
}

deny[msg] if {
    input.request.kind.kind == "Pod"
    container := input.request.object.spec.containers[_]
    not container.securityContext.readOnlyRootFilesystem
    msg := sprintf("Container %s must use read-only root filesystem", [container.name])
}

deny[msg] if {
    input.request.kind.kind == "Pod"
    container := input.request.object.spec.containers[_]
    container.resources.requests.memory == ""
    msg := sprintf("Container %s must have memory requests", [container.name])
}

deny[msg] if {
    input.request.kind.kind == "Pod"
    container := input.request.object.spec.containers[_]
    container.resources.limits.memory == ""
    msg := sprintf("Container %s must have memory limits", [container.name])
}

deny[msg] if {
    input.request.kind.kind == "Pod"
    not input.request.object.spec.serviceAccountName
    msg := "Pod must specify a service account"
}

deny[msg] if {
    input.request.kind.kind == "Pod"
    container := input.request.object.spec.containers[_]
    container.image
    not startswith(container.image, "ghcr.io/org/")
    not startswith(container.image, "gcr.io/org/")
    msg := sprintf("Container %s must use approved registry", [container.name])
}

violation[{"msg": msg}] {
    deny[msg]
}
```

### Conftest

```yaml
# .github/workflows/policy-check.yml
name: Policy Check
on:
  pull_request:
    branches: [main]

jobs:
  conftest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Conftest
        uses: instrumenta/conftest-action@master
        with:
          files: |
            k8s/
            terraform/
          policy: policies/
```

## Compliance Frameworks

### CIS Kubernetes Benchmark

```yaml
# kube-bench-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: kube-bench
  namespace: security
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          hostPID: true
          containers:
            - name: kube-bench
              image: aquasec/kube-bench:latest
              command: ["kube-bench"]
              volumeMounts:
                - name: var-lib-etcd
                  mountPath: /var/lib/etcd
                  readOnly: true
                - name: var-lib-kubelet
                  mountPath: /var/lib/kubelet
                  readOnly: true
                - name: etc-systemd
                  mountPath: /etc/systemd
                  readOnly: true
                - name: etc-kubernetes
                  mountPath: /etc/kubernetes
                  readOnly: true
          volumes:
            - name: var-lib-etcd
              hostPath:
                path: "/var/lib/etcd"
            - name: var-lib-kubelet
              hostPath:
                path: "/var/lib/kubelet"
            - name: etc-systemd
              hostPath:
                path: "/etc/systemd"
            - name: etc-kubernetes
              hostPath:
                path: "/etc/kubernetes"
          restartPolicy: Never
```

### Terraform Compliance

```python
# compliance/terraform_compliance.py
import subprocess
import json
import sys

def check_encryption():
    """Ensure all storage resources are encrypted"""
    result = subprocess.run(
        ['terraform', 'plan', '-out=tfplan'],
        capture_output=True,
        text=True
    )

    result = subprocess.run(
        ['terraform', 'show', '-json', 'tfplan'],
        capture_output=True,
        text=True
    )

    plan = json.loads(result.stdout)

    unencrypted_resources = []
    for resource in plan.get('resource_changes', []):
        if resource['type'] in ['aws_ebs_volume', 'aws_rds_cluster']:
            if not resource['change']['after'].get('encrypted', False):
                unencrypted_resources.append(resource['address'])

    if unencrypted_resources:
        print(f"FAIL: Unencrypted resources found: {unencrypted_resources}")
        sys.exit(1)
    else:
        print("PASS: All resources are encrypted")

if __name__ == "__main__":
    check_encryption()
```

## Security Hardening

### Docker Security

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Create non-root user
RUN addgroup -g 1000 -S nodejs && \
    adduser -S nodejs -u 1000

FROM base AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS release
WORKDIR /app

# Security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Copy application
COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Security hardening
USER nodejs
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### Kubernetes Security Context

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-app
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        runAsGroup: 1000
        fsGroup: 1000
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: app
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
              add:
                - NET_BIND_SERVICE
          resources:
            limits:
              memory: "512Mi"
              cpu: "500m"
            requests:
              memory: "256Mi"
              cpu: "250m"
```

## Vulnerability Management

```python
# scripts/vulnerability_tracker.py
import requests
import json
from datetime import datetime, timedelta

class VulnerabilityTracker:
    def __init__(self, github_token):
        self.token = github_token
        self.headers = {
            'Authorization': f'token {github_token}',
            'Accept': 'application/vnd.github.dorian-preview+json'
        }

    def get_vulnerabilities(self, owner, repo):
        url = f'https://api.github.com/repos/{owner}/{repo}/vulnerability-alerts'
        response = requests.get(url, headers=self.headers)
        return response.json()

    def create_jira_ticket(self, vuln):
        """Create Jira ticket for vulnerability"""
        pass

    def generate_report(self, repos):
        """Generate vulnerability report"""
        report = {
            'generated_at': datetime.now().isoformat(),
            'summary': {},
            'details': []
        }

        for repo in repos:
            vulns = self.get_vulnerabilities(repo['owner'], repo['name'])
            report['summary'][repo['name']] = len(vulns)
            report['details'].extend(vulns)

        return report

if __name__ == "__main__":
    tracker = VulnerabilityTracker('your-token')
    # Usage logic here
```

## Security Monitoring

### Falco Rules

```yaml
# falco-rules.yaml
- rule: Terminal Shell in Container
  desc: Detect shell in container
  condition: spawned_process and shell_procs and container
  output: "Terminal shell in container"
  priority: WARNING

- rule: Unauthorized SSH Connection
  desc: Detect SSH connections from unauthorized sources
  condition: inbound_outbound and ssh_port and not approved_ssh_source
  output: "Unauthorized SSH connection"
  priority: CRITICAL

- rule: Sensitive File Access
  desc: Access to sensitive files
  condition: open_read and sensitive_files
  output: "Sensitive file accessed"
  priority: NOTICE
```

## Security Checklist

- [ ] SAST integrated in CI/CD
- [ ] Container scanning enabled
- [ ] IaC scanning configured
- [ ] Secrets scanning enabled
- [ ] Dependencies monitored
- [ ] Security gates in pipeline
- [ ] Vault configured for secrets
- [ ] OPA policies defined
- [ ] Network policies configured
- [ ] Pod security standards enforced
- [ ] Falco/audit logging enabled
- [ ] Encryption at rest and transit
- [ ] Regular compliance scans
- [ ] Incident response playbooks
- [ ] Security training completed