/**
 * Standalone migration runner with explicit error output.
 * Run: npm run db:migrate:run
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (did you pass --env-file=.env?).");

  console.log("Connecting to database…");
  const sql = postgres(url, { max: 1, prepare: false });
  const db = drizzle(sql);

  try {
    console.log("Applying migrations…");
    await migrate(db, { migrationsFolder: "./src/server/db/migrations" });
    console.log("✓ Migrations applied.");
  } finally {
    // Always release the connection so failed runs don't leak pooler clients.
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("Migration failed:");
  console.error(err);
  process.exit(1);
});
