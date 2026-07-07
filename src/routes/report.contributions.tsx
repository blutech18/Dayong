import { createFileRoute } from "@tanstack/react-router";
import { ReportShell, ReportTile } from "@/components/report-shell";
import { contributions, formatDate, formatPHP } from "@/lib/mock-data";

export const Route = createFileRoute("/report/contributions")({
  head: () => ({ meta: [{ title: "Contribution Report — DAYONG" }, { name: "robots", content: "noindex" }] }),
  component: ContributionReportPage,
});

function ContributionReportPage() {
  const rows = [...contributions].sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  const paid = contributions.filter((c) => c.status === "paid");
  const totalPaid = paid.reduce((s, c) => s + c.amount, 0);
  const partial = contributions.filter((c) => c.status === "partial").length;
  const unpaid = contributions.filter((c) => c.status === "unpaid").length;

  return (
    <ReportShell eyebrow="Contribution Report" title="Recent Collections">
      <div className="grid grid-cols-4 gap-4">
        <ReportTile label="Total collected" value={formatPHP(totalPaid)} tone="emerald" />
        <ReportTile label="Paid records" value={String(paid.length)} />
        <ReportTile label="Partial" value={String(partial)} tone="amber" />
        <ReportTile label="Unpaid" value={String(unpaid)} tone="rose" />
      </div>

      <h2 className="mt-8 font-display text-base font-semibold">Contribution log</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-left uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Receipt</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Member</th>
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-1.5 font-mono">{c.receiptNo}</td>
                <td className="px-3 py-1.5">{formatDate(c.paidAt)}</td>
                <td className="px-3 py-1.5">{c.memberName}</td>
                <td className="px-3 py-1.5 capitalize">{c.method}</td>
                <td className="px-3 py-1.5 capitalize">{c.status}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{formatPHP(c.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportShell>
  );
}
