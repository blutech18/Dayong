import { desc, eq, isNull, or, and } from "drizzle-orm";
import { getDb } from "../db/client";
import { notifications } from "../db/schema";

/** A notification is visible to a user if it targets them or is global (null user). */
function visibleTo(userId: string) {
  return or(eq(notifications.userId, userId), isNull(notifications.userId));
}

type NotificationInsert = typeof notifications.$inferInsert;

export const notificationsRepo = {
  insert(value: NotificationInsert) {
    return getDb().insert(notifications).values(value);
  },

  listForUser(userId: string) {
    return getDb()
      .select()
      .from(notifications)
      .where(visibleTo(userId))
      .orderBy(desc(notifications.createdAt))
      .limit(100);
  },

  markAllRead(userId: string) {
    return getDb()
      .update(notifications)
      .set({ read: true })
      .where(and(visibleTo(userId), eq(notifications.read, false)));
  },

  markRead(userId: string, id: string) {
    return getDb()
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), visibleTo(userId)));
  },
};
