import { createFileRoute } from "@tanstack/react-router";
import { ReportShell, ReportTile } from "@/components/report-shell";
import { collectionEvents, formatDate, formatPHP } from "@/lib/mock-data";

export const Route = createFileRoute("/report/events")({
  head: () => ({ meta: [{ title: "Collection Events Report — DAYONG" }, { name: "robots", content: "noindex" }] }),
  component: EventsReportPage,
});

function EventsReportPage() {
  const totalCollected = collectionEvents.reduce((s, e) => s + e.collectedAmount, 0);
  const totalTarget = collectionEvents.reduce((s, e) => s + e.targetAmount, 0);
  const completed = collectionEvents.filter((e) => e.status === "completed").length;

  return (
    <ReportShell eyebrow="Collection Events" title="Event Performance">
      <div className="grid grid-cols-4 gap-4">
        <ReportTile label="Total events" value={String(collectionEvents.length)} />
        <ReportTile label="Completed" value={String(completed)} tone="emerald" />
        <ReportTile label="Total collected" value={formatPHP(totalCollected)} tone="sky" />
        <ReportTile label="Total target" value={formatPHP(totalTarget)} tone="amber" />
      </div>

      <h2 className="mt-8 font-display text-base font-semibold">Event log</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-left uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Collector</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Collected</th>
              <th className="px-3 py-2 text-right">Target</th>
              <th className="px-3 py-2 text-right">% Hit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {collectionEvents.map((e) => {
              const pct = e.targetAmount ? Math.round((e.collectedAmount / e.targetAmount) * 100) : 0;
              return (
                <tr key={e.id}>
                  <td className="px-3 py-1.5">{e.name}</td>
                  <td className="px-3 py-1.5">{formatDate(e.scheduledAt)}</td>
                  <td className="px-3 py-1.5">{e.collector}</td>
                  <td className="px-3 py-1.5 capitalize">{e.status.replace("_", " ")}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{formatPHP(e.collectedAmount)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{formatPHP(e.targetAmount)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ReportShell>
  );
}
