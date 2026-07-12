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
  const client = postgres(serverEnv.databaseUrl, { prepare: false });
  _db = drizzle(client, { schema });
  return _db;
}

export { schema };
