import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Calendar, MapPin, Users, ArrowLeft, Wallet, Download, Printer, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import {
  collectionEvents, contributions, members, formatPHP, formatDate, formatDateTime, initialsOf,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/collection-events/$id")({
  head: () => ({ meta: [{ title: "Collection Event — DAYONG" }] }),
  loader: ({ params }) => {
    const event = collectionEvents.find((e) => e.id === params.id);
    if (!event) throw notFound();
    return { event };
  },
  notFoundComponent: EventNotFound,
  component: EventDetail,
});

function EventNotFound() {
  return (
    <div className="grid place-items-center py-20 text-center">
      <div>
        <h2 className="font-display text-2xl font-semibold">Event not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The collection event you're looking for doesn't exist.</p>
        <Button asChild className="mt-4"><Link to="/collection-events">Back to events</Link></Button>
      </div>
    </div>
  );
}

function EventDetail() {
  const { event } = Route.useLoaderData();
  const pct = Math.round((event.collectedAmount / event.targetAmount) * 100);

  // Fake per-event attendance from members
  const attendees = members.slice(0, 12);
  const collected = attendees.slice(0, 8);
  const unpaid = attendees.slice(8);

  // Contributions attributed to this event (mock)
  const eventContribs = contributions.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 gap-1.5 text-muted-foreground">
          <Link to="/collection-events"><ArrowLeft className="h-4 w-4" />All events</Link>
        </Button>
        <PageHeader
          title={event.name}
          description={`Scheduled ${formatDateTime(event.scheduledAt)} · ${event.location}`}
          actions={
            <>
              <Button variant="outline" size="sm" className="gap-1.5"><Printer className="h-4 w-4" />Print</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
              <Button size="sm" className="gap-1.5"><Wallet className="h-4 w-4" />Record payment</Button>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Target amount" value={formatPHP(event.targetAmount)} icon={Wallet} tone="primary" />
        <StatCard label="Collected" value={formatPHP(event.collectedAmount)} icon={CheckCircle2} tone="success" />
        <StatCard label="Attendance" value={`${collected.length}/${event.expectedMembers}`} icon={Users} tone="muted" />
        <StatCard label="Status" value={event.status.replace("_"," ")} icon={Clock} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">Collection progress</h3>
              <StatusBadge status={event.status} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-3xl font-semibold tabular-nums">{formatPHP(event.collectedAmount)}</div>
                <div className="text-xs text-muted-foreground">of {formatPHP(event.targetAmount)} target</div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-semibold text-primary">{pct}%</div>
                <div className="text-xs text-muted-foreground">complete</div>
              </div>
            </div>
            <Progress value={pct} className="mt-3 h-2" />
          </div>

          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-display text-sm font-semibold">Payments recorded</h3>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
            <div className="scroll-thin overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Receipt</th>
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventContribs.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-mono text-xs">{c.receiptNo}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{c.memberName}</div>
                        <div className="text-xs text-muted-foreground">{c.memberNo}</div>
                      </td>
                      <td className="px-4 py-3 text-xs uppercase text-muted-foreground">{c.method}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPHP(c.amount)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-display text-sm font-semibold">Event details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Scheduled</dt>
                  <dd className="font-medium">{formatDateTime(event.scheduledAt)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Location</dt>
                  <dd className="font-medium">{event.location}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Assigned collector</dt>
                  <dd className="font-medium">{event.collector}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-display text-sm font-semibold">Attendance ({collected.length + unpaid.length})</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{collected.length} paid · {unpaid.length} pending</p>
            </div>
            <ul className="max-h-96 divide-y divide-border overflow-y-auto scroll-thin">
              {[...collected.map(m => ({m, paid: true})), ...unpaid.map(m => ({m, paid: false}))].map(({m, paid}) => (
                <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initialsOf(m.firstName + " " + m.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{m.firstName} {m.lastName}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{m.memberNo}</div>
                  </div>
                  {paid ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" />Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
                      <Clock className="h-3 w-3" />Due
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
