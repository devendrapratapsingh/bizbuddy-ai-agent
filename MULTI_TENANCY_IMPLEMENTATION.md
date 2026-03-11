# Multi-Tenancy Implementation Guide

## Overview

BizBuddy implements **multi-tenancy** using the **shared database, shared schema** pattern with `tenantId` isolation. This is the most cost-effective and scalable approach for a SaaS application.

## 🏗️ Architecture

### Database Schema

```
tenants
  ├─ id (PK)
  ├─ name
  ├─ subdomain (unique)
  ├─ apiKey (unique)
  └─ status (ACTIVE|SUSPENDED|TRIAL|DELETED)

users
  ├─ id
  ├─ tenantId (nullable - for tenant admins)
  └─ (user data)

businesses
  ├─ id
  ├─ tenantId (REQUIRED - every business belongs to a tenant)
  └─ (business data)

conversations
  ├─ id
  ├─ tenantId (REQUIRED)
  ├─ businessId (scoped to tenant)
  └─ (conversation data)

messages
  ├─ id
  ├─ tenantId (REQUIRED)
  ├─ conversationId (scoped to tenant)
  └─ (message data)

[... similarly for pipelines, leads, agents, handoffs, employees]
```

All queries MUST include `tenantId` filter.

## 🔧 Implementation

### 1. Schema Migration

The Prisma schema has been updated with:
- `Tenant` model
- `tenantId` field on all tenant-scoped models
- Foreign key constraints with `onDelete: Cascade`

Create migration:

```bash
npx prisma migrate dev --name add-multi-tenancy
npx prisma db push
```

This creates:
- `tenants` table
- `tenantId` columns on all relevant tables
- Foreign key constraints
- Indexes on `tenantId` (for performance)

### 2. Tenant Resolution Middleware

The `src/middleware/tenant.ts` file implements tenant extraction:

**Strategies (in order):**

1. **Subdomain:** `tenant.bizbuddy.com` → extract `tenant` subdomain
2. **API Key:** `X-API-Key` header → lookup tenant by `apiKey`
3. **JWT Claim:** `req.user` → user's business → tenant

**Usage:**

```typescript
import { tenantResolver, ensureActiveTenant } from './middleware/tenant';

// Apply middleware to routes (order matters: after auth!)
app.use('/api/conversations', authMiddleware, tenantResolver, ensureActiveTenant, conversationRoutes);

// In route handlers, access tenant:
router.get('/conversations', (req, res) => {
  const tenantId = (req as any).tenantId; // string
  const tenant = (req as any).tenant; // Tenant object

  // Use tenant helpers or manually scope queries:
  const conversations = await prisma.conversation.findMany({
    where: { tenantId, businessId: req.user.businessId }
  });

  res.json(conversations);
});
```

### 3. Tenant-Scoped Queries

**Helper Functions (in middleware/tenant.ts):**

```typescript
import { getTenantRecords, createTenantRecord } from './tenant';

// Get all records for current tenant
const conversations = await getTenantRecords('conversation', {
  status: 'OPEN'
}, tenantId);

// Create a new tenant-scoped record
const newLead = await createTenantRecord('lead', {
  name: 'John Doe',
  email: 'john@example.com',
  pipelineId: '...'
}, tenantId);
```

**Direct Prisma Usage (with manual scoping):**

```typescript
// ❌ WRONG - no tenant isolation (data leak!)
const allMessages = await prisma.message.findMany();

// ✅ CORRECT - scoped by tenantId
const tenantMessages = await prisma.message.findMany({
  where: { tenantId }
});

// ✅ ALSO - verify business belongs to tenant
const conversations = await prisma.conversation.findMany({
  where: {
    tenantId,
    businessId: user.businessId  // Ensure business belongs to tenant
  }
});
```

### 4. Tenant Creation

Tenants can be created:

**Via Admin UI/API:**
```typescript
const tenant = await prisma.tenant.create({
  data: {
    name: 'Acme Corp',
    subdomain: 'acme',
    apiKey: generateApiKey(), // Store securely!
    status: 'TRIAL'
  }
});
```

**First User Registration:**
When first user registers for a business:
```typescript
// Create tenant automatically
const tenant = await prisma.tenant.create({
  data: {
    name: businessName,
    subdomain: generateSubdomain(businessName),
    apiKey: generateApiKey(),
    status: 'ACTIVE'
  }
});

// Create business with tenantId
await prisma.business.create({
  data: {
    name: businessName,
    domain,
    userId: user.id,
    tenantId: tenant.id  // Link business to tenant
  }
});
```

### 5. Tenant Resolution Flowchart

```
Incoming Request
      │
      ├─ Is it a public API? (subdomain) → lookup tenant by subdomain
      │
      ├─ Has X-API-Key header? → lookup tenant by apiKey
      │
      ├─ Is user authenticated? → get user.business.tenantId
      │
      └─ No tenant found → 404/403
```

## 🔐 Security Considerations

### 1. Row-Level Security

All database queries MUST include `tenantId` filter. Prisma doesn't support RLS natively, so we implement at application layer:

```typescript
// Central helper for all queries
const scopedQuery = async (model, where, tenantId) => {
  return prisma[model].findMany({
    where: { ...where, tenantId } // tenantId always included
  });
};
```

### 2. Tenant Validation

When accessing resources by ID (e.g., `/api/conversations/:id`), verify ownership:

```typescript
router.get('/conversations/:id', async (req, res) => {
  const { id } = req.params;
  const tenantId = req.tenantId;

  const conversation = await prisma.conversation.findFirst({
    where: { id, tenantId }  // tenantId ensures isolation
  });

  if (!conversation) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(conversation);
});
```

### 3. Cross-Tenant Attacks

**Attack Scenario:** Attacker guesses another tenant's resource ID.

**Mitigation:** Always include `tenantId` in WHERE clause. Database will never return records from other tenants even if ID is known.

### 4. Subscription Metadata

Store tenant limits in Tenant model:

```prisma
model Tenant {
  id           String
  plan         TenantPlan @default(FREE)
  maxAgents    Int?        // Plan limits
  maxConcurrentCalls Int?
  monthlyQuota Int?
}
```

Enforce in middleware:

```typescript
const enforceQuotas = async (req, res, next) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });

  if (tenant.plan === 'FREE' && tenant.maxAgents < currentAgents) {
    return res.status(403).json({ error: 'Plan limit exceeded' });
  }

  next();
};
```

## 🔄 Migration from Single-Tenant

Current BizBuddy is single-tenant (one business per deployment). To migrate:

1. **Add tenantId to all records**
   - For existing data, create a default tenant
   - Assign `tenantId` to all existing records

```bash
# Create migration scratchpad
npx prisma migrate dev --name create-tenant-columns
```

2. **Backfill tenantId**
   - For each business, create tenant
   - Update all related records with tenantId

```sql
-- Manual SQL if needed (use prisma.$executeRaw)
UPDATE users SET "tenantId" = 'default-tenant-id' WHERE "tenantId" IS NULL;
UPDATE businesses SET "tenantId" = 'default-tenant-id' WHERE "tenantId" IS NULL;
-- ... etc for all tables
```

3. **Update all queries**
   - Search for all `prisma.model.find*` calls
   - Ensure each includes `tenantId`
   - Use helper functions to enforce

4. **Add tenantId to auth**
   - When user registers, create tenant if needed
   - Store tenantId in JWT claims
   - Load tenant from JWT (fallback to subdomain/API key)

5. **Testing**
   - Create multiple tenants
   - Verify data isolation
   - Test edge cases (suspended tenants, deleted)

## 🧪 Testing Multi-Tenancy

### Unit Test Example

```typescript
describe('Tenant Isolation', () => {
  it('should only return records for current tenant', async () => {
    // Create tenant A
    const tenantA = await prisma.tenant.create({ data: { ... } });

    // Create conversation for tenant A
    await prisma.conversation.create({
      data: { tenantId: tenantA.id, ... }
    });

    // Simulate request with tenant A
    req.tenantId = tenantA.id;

    // Query should only return tenant A's data
    const result = await getTenantRecords('conversation', {}, tenantA.id);
    expect(result).toHaveLength(1);

    // Even if we try to query by ID from tenant B, should return empty
    const tenantB = await prisma.tenant.create({ data: { ... } });
    req.tenantId = tenantB.id;
    const result2 = await getTenantRecords('conversation', {}, tenantB.id);
    expect(result2).toHaveLength(0); // ❌ tenant A's data not visible!
  });
});
```

### Integration Test

```typescript
test('tenantResolver resolves from subdomain', async () => {
  const req = { hostname: 'acme.bizbuddy.com' } as Request;
  const res = {} as Response;
  const next = jest.fn();

  await tenantResolver(req, res, next);

  expect(req.tenant).toBeDefined();
  expect(req.tenantId).toBe('acme-tenant-id');
});
```

## 📊 Performance Considerations

### Indexes

Ensure indexes on `tenantId`:

```sql
-- Prisma schema
model Conversation {
  // ...
  @@index([tenantId])
  @@index([tenantId, businessId])
  @@index([tenantId, createdAt])
}
```

### Connection Pooling

With multi-tenancy, connection pool size may need adjustment:

```typescript
// In database.ts
const pool = new Pool({
  max: 20, // May need increase for many tenants
  idleTimeoutMillis: 10000
});
```

### Caching

Cache tenant lookups:

```typescript
const tenantCache = new Map<string, Tenant>();

const getTenant = async (tenantId: string) => {
  if (tenantCache.has(tenantId)) {
    return tenantCache.get(tenantId);
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  tenantCache.set(tenantId, tenant);
  return tenant;
};
```

## 🚨 Error Handling

### Missing Tenant

```typescript
if (!req.tenant) {
  return res.status(404).json({
    error: 'Tenant not found',
    message: 'No tenant matches the provided domain, API key, or user'
  });
}
```

### Suspended Tenant

```typescript
if (tenant.status !== 'ACTIVE') {
  return res.status(403).json({
    error: 'Tenant suspended',
    message: `Your account is ${tenant.status.toLowerCase()}. Contact support.`
  });
}
```

## 📈 Scaling Multi-Tenancy

### Thousands of Tenants?

Shared DB works for 1000s of tenants. For 10,000+:
- Consider **schema-per-tenant** (separate PostgreSQL schemas)
- Use connection routing based on tenant
- Partition table by tenantId

### Millions of Records?

Ensure proper indexing:
- Primary key (id)
- Foreign keys (tenantId, businessId, etc.)
- Composite indexes for common queries: `(tenantId, createdAt)`, `(tenantId, status)`

### Global Distribution?

For multi-region SaaS:
- Use AWS Aurora Global Database
- Read replicas in each region
- Shard by tenant region
- CDN for static assets

---

## 🎯 Checklist

- [x] Prisma schema updated with Tenant model and tenantId fields
- [x] Create migration: `npx prisma migrate dev --name add-multi-tenancy`
- [x] Implement `tenantResolver` middleware
- [x] Apply middleware to all routes (after auth)
- [x] Update all services to use tenantId in queries
- [x] Add `@@index([tenantId])` to all tenant-scoped models
- [x] Write unit tests for tenant isolation
- [x] Seed data with multiple tenants for testing
- [x ] Test API key flow
- [ ] Test subdomain flow (requires DNS setup)
- [ ] Test suspended tenant rejection
- [ ] Benchmark performance with 1000+ tenants

---

## 📚 References

- [Prisma Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Multi-tenancy Patterns](https://www.mongodb.com/developer/products/mongodb/multi-tenancy-data-models/)
- [12-Factor App](https://12factor.net/)
- [OWASP Multi-Tenancy](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenancy_Security_Cheat_Sheet.html)

---

**Status:** Schema complete, middleware ready, need to integrate into services
**Last Updated:** 2025-03-11
