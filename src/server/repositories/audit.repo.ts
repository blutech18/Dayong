import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { auditLogs } from "../db/schema";

export const auditRepo = {
  listRecent(limit = 100) {
    return getDb().select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  },

  listByActor(actorId: string, limit = 10) {
    return getDb()
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.actorId, actorId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  },
};
