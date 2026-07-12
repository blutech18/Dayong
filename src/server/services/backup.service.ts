/**
 * Logical backup / restore of application data as JSON.
 *
 * Uses the raw postgres driver so exported ISO timestamp strings and numeric
 * strings round-trip back through Postgres casts on restore. Restore is
 * destructive (replaces all application data) and is admin-gated at the
 * function layer. Does not include Supabase auth users or Storage objects.
 */
import postgres from "postgres";
import { serverEnv } from "../env";

/** Parent-first order so foreign keys are satisfied on insert. */
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
] as const;

export interface BackupFile {
  version: 1;
  exportedAt: string;
  tables: Record<string, Record<string, unknown>[]>;
}

function client() {
  return postgres(serverEnv.databaseUrl, { max: 1, prepare: false });
}

export const backupService = {
  async export(): Promise<BackupFile> {
    const sql = client();
    try {
      const tables: BackupFile["tables"] = {};
      for (const t of TABLES) {
        const rows = await sql.unsafe(`select * from public."${t}"`);
        tables[t] = rows as unknown as Record<string, unknown>[];
      }
      return { version: 1, exportedAt: new Date().toISOString(), tables };
    } finally {
      await sql.end();
    }
  },

  async restore(backup: BackupFile): Promise<{ restored: Record<string, number> }> {
    if (backup?.version !== 1 || !backup.tables) {
      throw new Error("Invalid backup file.");
    }
    const sql = client();
    const restored: Record<string, number> = {};
    try {
      await sql.begin(async (tx) => {
        // Clear child → parent.
        for (const t of [...TABLES].reverse()) {
          await tx.unsafe(`delete from public."${t}"`);
        }
        // Insert parent → child.
        for (const t of TABLES) {
          const rows = backup.tables[t] ?? [];
          restored[t] = rows.length;
          for (const row of rows) {
            await tx.unsafe(
              `insert into public."${t}" (${Object.keys(row)
                .map((k) => `"${k}"`)
                .join(",")}) values (${Object.keys(row)
                .map((_, i) => `$${i + 1}`)
                .join(",")})`,
              Object.values(row) as never[],
            );
          }
        }
      });
      return { restored };
    } finally {
      await sql.end();
    }
  },
};
