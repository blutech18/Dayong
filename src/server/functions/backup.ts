/** Backup & restore server functions (admin only). */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { backupService, type BackupFile } from "../services/backup.service";
import { requireSessionUser } from "../auth";

/** Export all application data as a JSON string (fully serializable over RPC). */
export const getBackup = createServerFn({ method: "GET" }).handler(async (): Promise<string> => {
  await requireSessionUser(["admin"]);
  const backup = await backupService.export();
  return JSON.stringify(backup, null, 2);
});

/** Restore application data from a JSON backup. DESTRUCTIVE — replaces all data. */
export const restoreBackup = createServerFn({ method: "POST" })
  .validator(z.object({ content: z.string().min(2) }))
  .handler(async ({ data }): Promise<{ restored: Record<string, number> }> => {
    await requireSessionUser(["admin"]);
    let parsed: BackupFile;
    try {
      parsed = JSON.parse(data.content) as BackupFile;
    } catch {
      throw new Error("Backup file is not valid JSON.");
    }
    return backupService.restore(parsed);
  });
