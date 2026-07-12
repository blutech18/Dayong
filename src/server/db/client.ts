/**
 * Drizzle database client (server-only).
 *
 * Lazily initialised so importing this module never crashes the build when
 * DATABASE_URL is absent — the connection is created on first query.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "../env";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;
  const client = postgres(serverEnv.databaseUrl, {
    // Required for pooled connections (Supabase transaction/session pooler).
    prepare: false,
    // Serverless-friendly: keep a tiny pool per warm instance so we never
    // exhaust the pooler's client limit, close idle connections, and fail
    // fast instead of hanging forever when a connection can't be acquired.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  _db = drizzle(client, { schema });
  return _db;
}

export { schema };
