import { PrismaClient } from '@prisma/client';

// Create Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/bizbuddy_db'
    }
  }
});

export { prisma };