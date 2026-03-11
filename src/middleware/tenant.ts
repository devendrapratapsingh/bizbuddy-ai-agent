import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  apiKey: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'DELETED';
}

/**
 * Tenant Resolution Middleware
 *
 * Extracts tenant from request using multiple strategies:
 * 1. Subdomain (tenant.bizbuddy.com)
 * 2. API key header (X-API-Key)
 * 3. JWT token claim (sub/tenant_id)
 *
 * Sets req.tenant with tenant object and req.tenantId for scoping queries.
 */
export const tenantResolver = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let tenantId: string | null = null;
    let tenant: Tenant | null = null;

    // Strategy 1: Extract from subdomain
    const host = req.hostname;
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      tenant = await prisma.tenant.findFirst({
        where: { subdomain, status: 'ACTIVE' },
        select: { id: true, name: true, subdomain: true, status: true }
      });

      if (tenant) {
        tenantId = tenant.id;
        req.tenant = tenant;
        req.tenantId = tenantId;
        next();
        return;
      }
    }

    // Strategy 2: Extract from API key header
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) {
      tenant = await prisma.tenant.findFirst({
        where: {
          apiKey,
          status: 'ACTIVE'
        },
        select: { id: true, name: true, subdomain: true, status: true }
      });

      if (tenant) {
        tenantId = tenant.id;
        req.tenant = tenant;
        req.tenantId = tenantId;
        next();
        return;
      }
    }

    // Strategy 3: Extract from JWT token (if authenticated)
    // Assumes auth middleware has already set req.user
    const userId = (req as any).user?.id;
    if (userId) {
      const business = await prisma.business.findFirst({
        where: { userId },
        select: { id: true, tenantId: true }
      });

      if (business?.tenantId) {
        tenant = await prisma.tenant.findFirst({
          where: { id: business.tenantId, status: 'ACTIVE' },
          select: { id: true, name: true, subdomain: true, status: true }
        });

        if (tenant) {
          tenantId = tenant.id;
          req.tenant = tenant;
          req.tenantId = tenantId;
          next();
          return;
        }
      }
    }

    // No tenant found
    res.status(404).json({
      error: 'Tenant not found',
      message: 'Unable to resolve tenant from request'
    });

  } catch (error) {
    console.error('Tenant resolution error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to resolve tenant'
    });
  }
};

/**
 * Tenant-aware query wrapper
 * Use this to automatically scope queries to current tenant
 */
export const withTenantScope = <T>(
  queryFn: (tenantId: string) => Promise<T>
): Promise<T> => {
  // This will be called from within route handlers after tenantResolver
  return new Promise((resolve, reject) => {
    // Implementation depends on request context
    // See helper functions below for practical usage
    reject(new Error('withTenantScope should be called with tenantId'));
  });
};

/**
 * Helper: Get all tenant-scoped records
 */
export const getTenantRecords = async <T>(
  model: keyof PrismaClient,
  where: Record<string, any> = {},
  tenantId: string
): Promise<T[]> => {
  const prismaClient = prisma as any;

  return prismaClient[model].findMany({
    where: {
      ...where,
      tenantId
    }
  });
};

/**
 * Helper: Create tenant-scoped record
 */
export const createTenantRecord = async <T>(
  model: keyof PrismaClient,
  data: Record<string, any>,
  tenantId: string
): Promise<T> => {
  const prismaClient = prisma as any;

  return prismaClient[model].create({
    data: {
      ...data,
      tenantId
    }
  });
};

/**
 * Check if tenant is suspended
 */
export const ensureActiveTenant = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const tenant = req.tenant as Tenant | undefined;

  if (!tenant) {
    res.status(404).json({ error: 'Tenant not found' });
    return;
  }

  if (tenant.status !== 'ACTIVE') {
    res.status(403).json({
      error: 'Tenant suspended',
      message: `This tenant account is ${tenant.status.toLowerCase()}`
    });
    return;
  }

  next();
};
