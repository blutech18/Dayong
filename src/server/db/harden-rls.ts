/**
 * Security hardening (idempotent).
 *
 * The app accesses data exclusively through the owner (postgres) connection via
 * Drizzle, which bypasses RLS. The browser only ever holds the publishable key,
 * which maps to the `anon` role (and `authenticated` after sign-in) via Supabase's
 * auto-generated REST API. To ensure those roles cannot read or write application
 * data directly, we:
 *   1. Enable Row Level Security on every app table (deny-by-default: no policies).
 *   2. Revoke all table privileges from `anon` and `authenticated`.
 *
 * This does NOT affect the app, because the table owner bypasses RLS.
 * Run: npm run db:harden
 */
import postgres from "postgres";

const TABLES = [
  "profiles",
  "members",
  "collection_events",
  "contributions",
  "assistance_requests",
  "assistance_workflow_steps",
  "documents",
  "financial_transactions",
  "announcements",
  "audit_logs",
  "notifications",
  "app_settings",
];

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });

  for (const t of TABLES) {
    // sql.unsafe is safe here: table names are from our own fixed allowlist.
    await sql.unsafe(`ALTER TABLE public."${t}" ENABLE ROW LEVEL SECURITY;`);
    await sql.unsafe(`REVOKE ALL ON public."${t}" FROM anon, authenticated;`);
    console.log(`✓ hardened ${t}`);
  }

  await sql.end();
  console.log("\nAll application tables: RLS enabled, anon/authenticated grants revoked.");
}

main().catch((e) => {
  console.error("Hardening failed:", e);
  process.exit(1);
});
