import { createFileRoute } from "@tanstack/react-router";
import { ReportShell, ReportTile } from "@/components/report-shell";
import { formatPHP } from "@/lib/format";
import { requireAuth } from "@/lib/auth-guard";
import { getFinancialReport } from "@/server/functions/reports";

export const Route = createFileRoute("/report/cash-flow")({
  head: () => ({
    meta: [
      { title: "Cash Flow Report — Pagtukaw Lifecare" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: () => requireAuth(),
  loader: () => getFinancialReport(),
  component: CashFlowReportPage,
});

function CashFlowReportPage() {
  const { monthly, fund } = Route.useLoaderData();
  const totalNet = monthly.reduce((s, m) => s + m.net, 0);
  const openingBalance = fund.balance - totalNet;
  let running = openingBalance;
  const rows = monthly.map((m) => {
    running += m.net;
    return { month: m.month, inflow: m.income, outflow: m.expense, net: m.net, running };
  });
  const totalIn = rows.reduce((s, r) => s + r.inflow, 0);
  const totalOut = rows.reduce((s, r) => s + r.outflow, 0);

  return (
    <ReportShell eyebrow="Cash Flow Report" title="6-Month Running Balance">
      <div className="grid grid-cols-4 gap-4">
        <ReportTile label="Opening balance" value={formatPHP(openingBalance)} tone="sky" />
        <ReportTile label="Cash in" value={formatPHP(totalIn)} tone="emerald" />
        <ReportTile label="Cash out" value={formatPHP(totalOut)} tone="rose" />
        <ReportTile label="Ending balance" value={formatPHP(fund.balance)} />
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
                <td
                  className={
                    "px-3 py-2 text-right tabular-nums font-semibold " +
                    (r.net >= 0 ? "text-emerald-700" : "text-rose-700")
                  }
                >
                  {formatPHP(r.net)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPHP(r.running)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportShell>
  );
}
