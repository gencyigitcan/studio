import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

// If we are in production or have Turso credentials, use the adapter
// Otherwise fallback to default (good for local development without Turso if needed, though usually we want consistency)
const adapter = connectionString && authToken
  ? new PrismaLibSql(
    createClient({
      url: connectionString,
      authToken: authToken,
    }) as any
  )
  : null

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: adapter as any,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
