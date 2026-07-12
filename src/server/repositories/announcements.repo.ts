import { desc } from "drizzle-orm";
import { getDb } from "../db/client";
import { announcements } from "../db/schema";

type AnnouncementInsert = typeof announcements.$inferInsert;

export const announcementsRepo = {
  listAll() {
    return getDb()
      .select()
      .from(announcements)
      .orderBy(desc(announcements.pinned), desc(announcements.publishedAt));
  },

  insert(value: AnnouncementInsert) {
    return getDb()
      .insert(announcements)
      .values(value)
      .returning()
      .then((rows) => rows[0]);
  },
};
