import { notificationsRepo } from "../repositories/notifications.repo";
import type { Notification } from "../db/schema";

export interface NotificationDTO {
  id: string;
  title: string;
  body: string;
  type: Notification["type"];
  read: boolean;
  createdAt: string;
}

export const notificationsService = {
  /**
   * Create an in-app notification. `userId = null` makes it visible to everyone
   * (staff broadcast). Best-effort: never throws into the caller.
   */
  async notify(input: {
    userId?: string | null;
    title: string;
    body: string;
    type?: Notification["type"];
  }): Promise<void> {
    try {
      await notificationsRepo.insert({
        userId: input.userId ?? null,
        title: input.title,
        body: input.body,
        type: input.type ?? "info",
      });
    } catch (err) {
      console.error("[notifications] failed to create:", err);
    }
  },

  async list(userId: string): Promise<NotificationDTO[]> {
    const rows = await notificationsRepo.listForUser(userId);
    return rows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));
  },

  async markAllRead(userId: string) {
    await notificationsRepo.markAllRead(userId);
    return { ok: true };
  },

  async markRead(userId: string, id: string) {
    await notificationsRepo.markRead(userId, id);
    return { ok: true };
  },
};
