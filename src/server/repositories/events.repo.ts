import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { collectionEvents } from "../db/schema";

type EventInsert = typeof collectionEvents.$inferInsert;

export const eventsRepo = {
  listAll() {
    return getDb().select().from(collectionEvents).orderBy(desc(collectionEvents.scheduledAt));
  },

  findById(id: string) {
    return getDb()
      .select()
      .from(collectionEvents)
      .where(eq(collectionEvents.id, id))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  },

  insert(value: EventInsert) {
    return getDb()
      .insert(collectionEvents)
      .values(value)
      .returning()
      .then((rows) => rows[0]);
  },

  update(id: string, patch: Partial<EventInsert>) {
    return getDb()
      .update(collectionEvents)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(collectionEvents.id, id))
      .returning()
      .then((rows) => rows[0]);
  },
};
