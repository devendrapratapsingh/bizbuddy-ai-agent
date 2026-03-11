#!/bin/bash

# Comprehensive Deployment Verification Script
# Checks all deployment models and components

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Change to project root
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

pass() { echo -e "${GREEN}✅ $1${NC}"; ((PASS++)); }
fail() { echo -e "${RED}❌ $1${NC}"; ((FAIL++)); }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; ((WARN++)); }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo "=========================================="
echo "🔍 DEPLOYMENT VERIFICATION"
echo "=========================================="
echo ""

# 1. Check Directory Structure
info "1. Checking directory structure..."

[[ -d "deploy/models/iaas" ]] && pass "IaaS model directory exists" || fail "IaaS model missing"
[[ -d "deploy/models/paas" ]] && pass "PaaS model directory exists" || fail "PaaS model missing"
[[ -d "deploy/models/saas" ]] && pass "SaaS model directory exists" || fail "SaaS model missing"
[[ -d "deploy/scripts" ]] && pass "Deploy scripts directory exists" || fail "Deploy scripts missing"
[[ -d "scripts/demo" ]] && pass "Demo scripts directory exists" || fail "Demo scripts missing"
[[ -d ".github/workflows" ]] && pass "GitHub workflows directory exists" || fail "GitHub workflows missing"
echo ""

# 2. IaaS Model
info "2. Verifying IaaS deployment model..."

[[ -f "deploy/models/iaas/docker-compose.yml" ]] && pass "docker-compose.yml exists" || fail "docker-compose.yml missing"
[[ -f "deploy/models/iaas/.env.iaas" ]] && pass ".env.iaas template exists" || fail ".env.iaas missing"
[[ -f "deploy/models/iaas/README.md" ]] && pass "IaaS README exists" || fail "IaaS README missing"
[[ -f "deploy/models/iaas/nginx/nginx.conf" ]] && pass "Nginx config exists" || echo "Nginx config not found (optional)"

# Validate docker-compose syntax
if command -v docker-compose &> /dev/null; then
  if docker-compose -f deploy/models/iaas/docker-compose.yml config &>/dev/null; then
    pass "docker-compose.yml syntax valid"
  else
    fail "docker-compose.yml has syntax errors"
  fi
else
  warn "docker-compose not installed - skipping syntax check"
fi
echo ""

# 3. PaaS Model
info "3. verifying PaaS deployment model..."

# Backend chart
[[ -f "deploy/models/paas/charts/bizbuddy-backend/Chart.yaml" ]] && pass "Backend Chart.yaml exists" || fail "Backend Chart.yaml missing"
[[ -f "deploy/models/paas/charts/bizbuddy-backend/values.yaml" ]] && pass "Backend values.yaml exists" || fail "Backend values.yaml missing"
[[ -d "deploy/models/paas/charts/bizbuddy-backend/templates" ]] && pass "Backend templates directory exists" || fail "Backend templates missing"

# Count backend templates
backend_templates=$(find deploy/models/paas/charts/bizbuddy-backend/templates -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
if [[ $backend_templates -ge 8 ]]; then
  pass "Backend has $backend_templates templates (expected 8-10)"
else
  fail "Backend only has $backend_templates templates (expected 8-10)"
fi

# Frontend chart
[[ -f "deploy/models/paas/charts/bizbuddy-frontend/Chart.yaml" ]] && pass "Frontend Chart.yaml exists" || fail "Frontend Chart.yaml missing"
[[ -f "deploy/models/paas/charts/bizbuddy-frontend/values.yaml" ]] && pass "Frontend values.yaml exists" || fail "Frontend values.yaml missing"
[[ -d "deploy/models/paas/charts/bizbuddy-frontend/templates" ]] && pass "Frontend templates directory exists" || fail "Frontend templates missing"

# Count frontend templates
frontend_templates=$(find deploy/models/paas/charts/bizbuddy-frontend/templates -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
if [[ $frontend_templates -ge 5 ]]; then
  pass "Frontend has $frontend_templates templates (expected 5-7)"
else
  fail "Frontend only has $frontend_templates templates (expected 5-7)"
fi

# Values files
[[ -f "deploy/models/paas/values/dev.yaml" ]] && pass "Dev values file exists" || fail "Dev values missing"
[[ -f "deploy/models/paas/values/staging.yaml" ]] && pass "Staging values file exists" || fail "Staging values missing"
[[ -f "deploy/models/paas/values/prod.yaml" ]] && pass "Prod values file exists" || fail "Prod values missing"

# k3s setup
[[ -f "deploy/models/paas/k3s-setup.sh" ]] && pass "k3s-setup.sh exists" || fail "k3s-setup.sh missing"
[[ -f "deploy/models/paas/metallb-config.yaml" ]] && pass "MetalLB config exists" || warn "MetalLB config optional"
[[ -f "deploy/models/paas/ingress-nginx.yaml" ]] && pass "NGINX ingress config exists" || warn "Ingress config optional"
[[ -f "deploy/models/paas/README.md" ]] && pass "PaaS README exists" || fail "PaaS README missing"
echo ""

# 4. SaaS Model
info "4. Verifying SaaS deployment model..."

[[ -f "deploy/models/saas/main.tf" ]] && pass "Terraform main.tf exists" || fail "main.tf missing"
[[ -f "deploy/models/saas/variables.tf" ]] && pass "Terraform variables.tf exists" || fail "variables.tf missing"
[[ -f "deploy/models/saas/outputs.tf" ]] && pass "Terraform outputs.tf exists" || fail "outputs.tf missing"
[[ -f "deploy/models/saas/terraform.tfvars.example" ]] && pass "Terraform tfvars example exists" || fail "terraform.tfvars.example missing"

# Check modules
for module in networking kubernetes database cache storage ingress monitoring; do
  if [[ -d "deploy/models/saas/modules/$module" ]]; then
    module_files=$(find "deploy/models/saas/modules/$module" -name "*.tf" 2>/dev/null | wc -l | tr -d ' ')
    if [[ $module_files -ge 2 ]]; then
      pass "$module module has $module_files .tf files"
    else
      fail "$module module only has $module_files .tf files (expected 2+)"
    fi
  else
    fail "$module module directory missing"
  fi
done
echo ""

# 5. Deploy Scripts
info "5. Verifying deployment scripts..."

[[ -f "deploy/scripts/deploy.sh" ]] && pass "Unified deploy script exists" || fail "deploy.sh missing"
if [[ -x "deploy/scripts/deploy.sh" ]]; then
  pass "deploy.sh is executable"
else
  fail "deploy.sh is not executable (run: chmod +x deploy/scripts/deploy.sh)"
fi
echo ""

# 6. Demo Scripts
info "6. Verifying demo scripts..."

demo_scripts=(01-iaas.sh 02-paas.sh 03-saas.sh 04-cicd.sh)
for script in "${demo_scripts[@]}"; do
  if [[ -f "scripts/demo/$script" ]]; then
    if [[ -x "scripts/demo/$script" ]]; then
      pass "$script exists and is executable"
    else
      warn "$script exists but not executable"
    fi
  else
    fail "$script missing"
  fi
done
echo ""

# 7. CI/CD Workflows
info "7. Verifying GitHub Actions workflows..."

workflows=(ci.yml cd-iaas.yml cd-paas.yml cd-saas.yml)
for wf in "${workflows[@]}"; do
  if [[ -f ".github/workflows/$wf" ]]; then
    pass "$wf workflow exists"
  else
    fail "$wf workflow missing"
  fi
done
echo ""

# 8. Multi-Tenancy
info "8. Verifying multi-tenancy implementation..."

if grep -q "model Tenant" prisma/schema.prisma; then
  pass "Tenant model added to schema"
else
  fail "Tenant model not found in schema"
fi

tenant_fields=$(grep -c "tenantId" prisma/schema.prisma 2>/dev/null || echo "0")
if [[ $tenant_fields -ge 8 ]]; then
  pass "Found $tenant_fields tenantId references in schema (expected 8-10)"
else
  warn "Only found $tenant_fields tenantId references (expected 8-10)"
fi

[[ -f "src/middleware/tenant.ts" ]] && pass "Tenant middleware exists" || fail "Tenant middleware missing"
echo ""

# 9. Configuration
info "9. Verifying configuration..."

[[ -f "src/config/vars.ts" ]] && pass "Config vars.ts exists" || fail "vars.ts missing"
if grep -q "DEPLOY_MODEL" src/config/vars.ts; then
  pass "DEPLOY_MODEL variable added"
else
  warn "DEPLOY_MODEL variable not found (may need addition)"
fi
echo ""

# 10. Documentation
info "10. Verifying documentation..."

docs=(
  "deploy/README.md"
  "CLOUD_NATIVE_STRUCTURE_SUMMARY.md"
  "DEPLOYMENT_IMPLEMENTATION_COMPLETE.md"
  "MULTI_TENANCY_IMPLEMENTATION.md"
  "deploy/models/iaas/README.md"
  "deploy/models/paas/README.md"
  "deploy/models/saas/README.md"
)

for doc in "${docs[@]}"; do
  if [[ -f "$doc" ]]; then
    pass "$(basename $doc) exists"
  else
    warn "$(basename $doc) missing"
  fi
done
echo ""

# Summary
echo "=========================================="
echo "📊 VERIFICATION SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed:  $PASS${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${RED}Failed:  $FAIL${NC}"
echo ""

if [[ $FAIL -eq 0 ]]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
  echo "The deployment structure is complete and ready."
  echo ""
  echo "🚀 Next steps:"
  echo "   1. Test IaaS: cd deploy/models/iaas && docker-compose up -d"
  echo "   2. Run full demo: bash scripts/demo/01-iaas.sh"
  echo "   3. Check docs: cat deploy/README.md"
  exit 0
else
  echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
  echo "Please review the failed checks above and fix issues."
  exit 1
fi
