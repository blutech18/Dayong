import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  LayoutGrid,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { CreateEventModal } from "@/components/action-modals";
import { formatPHP, formatDate } from "@/lib/format";
import { getCollectionEvents } from "@/server/functions/events";
import type { CollectionEventDTO } from "@/server/services/events.service";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/collection-events")({
  head: () => ({ meta: [{ title: "Collection Events — Pagtukaw Lifecare" }] }),
  loader: () => getCollectionEvents(),
  component: EventsPage,
});

function EventsPage() {
  const events = Route.useLoaderData();
  const [view, setView] = useState<"grid" | "calendar">("grid");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Collection Events"
        description="Schedule and track collection events, attendance, and progress toward targets."
        actions={
          <>
            <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                  view === "grid"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Grid
              </button>
              <button
                onClick={() => setView("calendar")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                  view === "calendar"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <CalendarRange className="h-3.5 w-3.5" />
                Calendar
              </button>
            </div>
            <CreateEventModal />
          </>
        }
      />

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No collection events scheduled yet.
        </div>
      ) : view === "calendar" ? (
        <CalendarView events={events} />
      ) : (
        <GridView events={events} />
      )}
    </div>
  );
}

function GridView({ events }: { events: CollectionEventDTO[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {events.map((e) => {
        const pct = e.targetAmount > 0 ? Math.round((e.collectedAmount / e.targetAmount) * 100) : 0;
        return (
          <div
            key={e.id}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <StatusBadge status={e.status} />
            </div>
            <h3 className="mt-3 font-display text-base font-semibold leading-tight">{e.name}</h3>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(e.scheduledAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {e.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {e.expectedMembers} expected · Collector: {e.collector}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-semibold tabular-nums">
                  {formatPHP(e.collectedAmount)} / {formatPHP(e.targetAmount)}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/collection-events/$id" params={{ id: e.id }}>
                  Details
                </Link>
              </Button>
              <Button size="sm" className="flex-1 gap-1.5">
                <Wallet className="h-4 w-4" />
                Record
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarView({ events }: { events: CollectionEventDTO[] }) {
  const [cursor, setCursor] = useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = new Map<string, CollectionEventDTO[]>();
  for (const e of events) {
    const d = new Date(e.scheduledAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const arr = eventsByDay.get(key) ?? [];
    arr.push(e);
    eventsByDay.set(key, arr);
  }

  const monthLabel = cursor.toLocaleDateString("en-PH", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="font-display text-xl font-semibold tracking-tight">{monthLabel}</div>
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-9 px-4" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-muted/40 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const key = c ? `${c.getFullYear()}-${c.getMonth()}-${c.getDate()}` : `x${i}`;
          const evs = c ? (eventsByDay.get(key) ?? []) : [];
          const isToday = c && c.toDateString() === new Date().toDateString();
          return (
            <div key={key} className={cn("min-h-[140px] bg-card p-2 sm:p-3 transition-colors hover:bg-muted/50", !c && "bg-muted/20 hover:bg-muted/20")}>
              {c && (
                <>
                  <div
                    className={cn(
                      "mb-2 text-right text-sm font-semibold",
                      isToday ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors",
                    )}
                  >
                    {isToday ? (
                      <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-primary shadow-sm text-primary-foreground">
                        {c.getDate()}
                      </span>
                    ) : (
                      <span className="inline-grid h-8 w-8 place-items-center rounded-full hover:bg-muted transition-colors cursor-default">
                        {c.getDate()}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {evs.map((e) => (
                      <Link
                        key={e.id}
                        to="/collection-events/$id"
                        params={{ id: e.id }}
                        className="block truncate rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 hover:border-primary/30 transition-colors"
                      >
                        {e.name.replace(/^Monthly Collection — /, "")}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
