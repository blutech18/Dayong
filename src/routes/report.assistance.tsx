import { createFileRoute } from "@tanstack/react-router";
import { ReportShell, ReportTile } from "@/components/report-shell";
import { assistanceRequests, formatDate, formatPHP } from "@/lib/mock-data";

export const Route = createFileRoute("/report/assistance")({
  head: () => ({ meta: [{ title: "Assistance Report — DAYONG" }, { name: "robots", content: "noindex" }] }),
  component: AssistanceReportPage,
});

function AssistanceReportPage() {
  const rows = [...assistanceRequests].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const released = assistanceRequests.filter((r) => r.status === "released");
  const totalReleased = released.reduce((s, r) => s + r.amount, 0);
  const pending = assistanceRequests.filter((r) => r.status === "pending" || r.status === "under_review").length;
  const approved = assistanceRequests.filter((r) => r.status === "approved").length;

  const byCategory = ["medical", "burial", "calamity", "educational", "other"].map((cat) => ({
    cat,
    count: assistanceRequests.filter((r) => r.category === cat).length,
    amount: assistanceRequests.filter((r) => r.category === cat).reduce((s, r) => s + r.amount, 0),
  }));

  return (
    <ReportShell eyebrow="Assistance Report" title="Requests & Releases">
      <div className="grid grid-cols-4 gap-4">
        <ReportTile label="Total released" value={formatPHP(totalReleased)} tone="emerald" />
        <ReportTile label="Approved" value={String(approved)} />
        <ReportTile label="Pending review" value={String(pending)} tone="amber" />
        <ReportTile label="All requests" value={String(assistanceRequests.length)} tone="sky" />
      </div>

      <h2 className="mt-8 font-display text-base font-semibold">By category</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="px-3 py-2">Category</th><th className="px-3 py-2 text-right">Requests</th><th className="px-3 py-2 text-right">Total requested</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {byCategory.map((c) => (
              <tr key={c.cat}>
                <td className="px-3 py-2 capitalize">{c.cat}</td>
                <td className="px-3 py-2 text-right tabular-nums">{c.count}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPHP(c.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 font-display text-base font-semibold">Request log</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-left uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Request No.</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Member</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-1.5 font-mono">{r.requestNo}</td>
                <td className="px-3 py-1.5">{formatDate(r.submittedAt)}</td>
                <td className="px-3 py-1.5">{r.memberName}</td>
                <td className="px-3 py-1.5 capitalize">{r.category}</td>
                <td className="px-3 py-1.5 capitalize">{r.status.replace("_", " ")}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{formatPHP(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportShell>
  );
}
