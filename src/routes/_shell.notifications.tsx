import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Check, Settings2, Bell as BellIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getNotifications, markAllNotificationsRead } from "@/server/functions/notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DAYONG" }] }),
  loader: () => getNotifications(),
  component: NotificationsPage,
});

function NotificationsPage() {
  const notifications = Route.useLoaderData();
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const list = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      toast.success("All notifications marked as read.");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update notifications.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Everything worth your attention — reminders, alerts, and updates."
        actions={
          <>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleMarkAllRead}>
              <Check className="h-4 w-4" />
              Mark all read
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Settings2 className="h-4 w-4" />
              Preferences
            </Button>
          </>
        }
      />

      <div className="flex gap-2 border-b border-border">
        {(["all", "unread"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium capitalize",
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}{" "}
            {t === "unread" && (
              <span className="ml-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {list.length === 0 && (
            <li className="p-12 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
                <BellIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">You're all caught up</p>
              <p className="text-xs text-muted-foreground">No notifications here.</p>
            </li>
          )}
          {list.map((n) => (
            <li
              key={n.id}
              className={cn("flex items-start gap-3 p-4", !n.read && "bg-primary/[0.03]")}
            >
              <div
                className={cn(
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  n.type === "success" && "bg-success",
                  n.type === "warning" && "bg-warning",
                  n.type === "danger" && "bg-destructive",
                  n.type === "info" && "bg-info",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{n.title}</div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("en-PH", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              </div>
              {!n.read && <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
