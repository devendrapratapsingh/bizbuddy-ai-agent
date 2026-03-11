#!/bin/bash
echo "=== Quick Verification ==="
echo ""
echo "IaaS Model:"
ls -la deploy/models/iaas/ 2>/dev/null | head -5
echo ""
echo "PaaS Backend Chart:"
ls -la deploy/models/paas/charts/bizbuddy-backend/ 2>/dev/null | head -5
echo ""
echo "PaaS Frontend Chart:"
ls -la deploy/models/paas/charts/bizbuddy-frontend/ 2>/dev/null | head -5
echo ""
echo "SaaS Terraform:"
ls -la deploy/models/saas/*.tf 2>/dev/null
echo ""
echo "Demo Scripts:"
ls -la scripts/demo/*.sh 2>/dev/null
echo ""
echo "Workflows:"
ls -la .github/workflows/*.yml 2>/dev/null
echo ""
echo "Multi-tenancy:"
ls -la src/middleware/tenant.ts 2>/dev/null
echo ""
echo "✅ Verification complete!"
