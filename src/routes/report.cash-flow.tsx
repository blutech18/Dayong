import { createFileRoute } from "@tanstack/react-router";
import { ReportShell, ReportTile } from "@/components/report-shell";
import { monthlyCollections, monthlyExpenses, dashboardStats, formatPHP } from "@/lib/mock-data";

export const Route = createFileRoute("/report/cash-flow")({
  head: () => ({ meta: [{ title: "Cash Flow Report — DAYONG" }, { name: "robots", content: "noindex" }] }),
  component: CashFlowReportPage,
});

function CashFlowReportPage() {
  const openingBalance = dashboardStats.balance - monthlyCollections.reduce((s, m, i) => s + m.collected - (monthlyExpenses[i].assistance + monthlyExpenses[i].operations), 0);
  let running = openingBalance;
  const rows = monthlyCollections.map((c, i) => {
    const out = monthlyExpenses[i].assistance + monthlyExpenses[i].operations;
    const net = c.collected - out;
    running += net;
    return { month: c.month, inflow: c.collected, outflow: out, net, running };
  });
  const totalIn = rows.reduce((s, r) => s + r.inflow, 0);
  const totalOut = rows.reduce((s, r) => s + r.outflow, 0);

  return (
    <ReportShell eyebrow="Cash Flow Report" title="6-Month Running Balance">
      <div className="grid grid-cols-4 gap-4">
        <ReportTile label="Opening balance" value={formatPHP(openingBalance)} tone="sky" />
        <ReportTile label="Cash in" value={formatPHP(totalIn)} tone="emerald" />
        <ReportTile label="Cash out" value={formatPHP(totalOut)} tone="rose" />
        <ReportTile label="Ending balance" value={formatPHP(dashboardStats.balance)} />
      </div>

      <h2 className="mt-8 font-display text-base font-semibold">Monthly cash flow</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Month</th>
              <th className="px-3 py-2 text-right">Cash in</th>
              <th className="px-3 py-2 text-right">Cash out</th>
              <th className="px-3 py-2 text-right">Net</th>
              <th className="px-3 py-2 text-right">Running balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r) => (
              <tr key={r.month}>
                <td className="px-3 py-2 font-medium">{r.month}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPHP(r.inflow)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPHP(r.outflow)}</td>
                <td className={"px-3 py-2 text-right tabular-nums font-semibold " + (r.net >= 0 ? "text-emerald-700" : "text-rose-700")}>{formatPHP(r.net)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPHP(r.running)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportShell>
  );
}
