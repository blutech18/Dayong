import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Wallet,
  LayoutGrid,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatPHP, formatDate } from "@/lib/format";
import { getCollectionEvents, createCollectionEvent } from "@/server/functions/events";
import type { CollectionEventDTO } from "@/server/services/events.service";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/collection-events")({
  head: () => ({ meta: [{ title: "Collection Events — DAYONG" }] }),
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
            <CreateEventDialog />
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

function CreateEventDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");
  const [collectorName, setCollectorName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [expectedMembers, setExpectedMembers] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return toast.error("Enter an event name.");
    if (!scheduledAt) return toast.error("Pick a schedule date.");
    setSaving(true);
    try {
      await createCollectionEvent({
        data: {
          name: name.trim(),
          scheduledAt: new Date(scheduledAt).toISOString(),
          location: location.trim(),
          collectorName: collectorName.trim(),
          targetAmount: parseFloat(targetAmount) || 0,
          expectedMembers: parseInt(expectedMembers) || 0,
        },
      });
      toast.success("Event scheduled", { description: name });
      setOpen(false);
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule collection event</DialogTitle>
          <DialogDescription>Set the schedule, target, and assigned collector.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ev-name">Event name</Label>
            <Input
              id="ev-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Monthly Collection — August 2026"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ev-date">Schedule</Label>
              <Input
                id="ev-date"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-loc">Location</Label>
              <Input
                id="ev-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Barangay Hall"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ev-collector">Collector</Label>
              <Input
                id="ev-collector"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                placeholder="Name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-target">Target (₱)</Label>
              <Input
                id="ev-target"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="24000"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-expected">Expected</Label>
              <Input
                id="ev-expected"
                type="number"
                value={expectedMembers}
                onChange={(e) => setExpectedMembers(e.target.value)}
                placeholder="48"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}Schedule event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-semibold">{monthLabel}</div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-muted/40 px-2 py-1.5 text-center font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const key = c ? `${c.getFullYear()}-${c.getMonth()}-${c.getDate()}` : `x${i}`;
          const evs = c ? (eventsByDay.get(key) ?? []) : [];
          const isToday = c && c.toDateString() === new Date().toDateString();
          return (
            <div key={key} className={cn("min-h-24 bg-card p-1.5", !c && "bg-muted/20")}>
              {c && (
                <>
                  <div
                    className={cn(
                      "mb-1 text-right text-[11px] font-medium",
                      isToday ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {isToday ? (
                      <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        {c.getDate()}
                      </span>
                    ) : (
                      c.getDate()
                    )}
                  </div>
                  <div className="space-y-1">
                    {evs.map((e) => (
                      <Link
                        key={e.id}
                        to="/collection-events/$id"
                        params={{ id: e.id }}
                        className="block truncate rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20"
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
