import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Lazy Prisma client.
 *
 * The actual `PrismaClient` instance is NOT constructed when this module is
 * imported — it's only constructed the first time a property (e.g.
 * `db.listing.findMany()`) is accessed. This prevents the build from
 * crashing when `DATABASE_URL` is not yet configured (e.g., during a Vercel
 * build before env vars are set, or on a fresh clone).
 *
 * If `DATABASE_URL` is empty/missing when the first query runs, Prisma will
 * throw — but that throw is caught by the caller's try/catch (e.g. sitemap.ts,
 * pages with try/catch), so it degrades gracefully instead of killing the
 * build.
 *
 * The Proxy transparently forwards all property accesses to the underlying
 * PrismaClient, so `db.listing.findMany(...)` works exactly as before.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV !== 'production' ? ['query'] : ['error'],
      })
    }
    const value = Reflect.get(globalForPrisma.prisma, prop, receiver)
    // Bind methods so `this` is the PrismaClient (not the Proxy).
    return typeof value === 'function' ? value.bind(globalForPrisma.prisma) : value
  },
})
