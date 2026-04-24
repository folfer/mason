import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// Prevent multiple connections in development (Next.js hot reload)
const globalForDb = globalThis as unknown as { conn: postgres.Sql }
const conn = globalForDb.conn ?? postgres(connectionString, { max: 1 })
if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn

export const db = drizzle(conn, { schema })
