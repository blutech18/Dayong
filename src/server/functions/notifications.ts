/** Notification server functions. */
import { createServerFn } from "@tanstack/react-start";
import { notificationsService, type NotificationDTO } from "../services/notifications.service";
import { requireSessionUser } from "../auth";

/** Notifications visible to the current user (personal + global). */
export const getNotifications = createServerFn({ method: "GET" }).handler(
  async (): Promise<NotificationDTO[]> => {
    const user = await requireSessionUser();
    return notificationsService.list(user.id);
  },
);

/** Mark all visible notifications as read. */
export const markAllNotificationsRead = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  return notificationsService.markAllRead(user.id);
});

/** Mark a single notification as read. */
export const markNotificationRead = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return notificationsService.markRead(user.id, data);
  });
