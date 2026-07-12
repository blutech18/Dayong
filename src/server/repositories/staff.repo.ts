import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { profiles } from "../db/schema";

export const staffRepo = {
  listAll() {
    return getDb().select().from(profiles).orderBy(desc(profiles.createdAt));
  },

  findById(id: string) {
    return getDb()
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  },
};
