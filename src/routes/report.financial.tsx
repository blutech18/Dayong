import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPHP, formatDate } from "@/lib/format";
import { requireAuth } from "@/lib/auth-guard";
import { getFinancialReport } from "@/server/functions/reports";

export const Route = createFileRoute("/report/financial")({
  head: () => ({
    meta: [{ title: "Financial Report — DAYONG" }, { name: "robots", content: "noindex" }],
  }),
  beforeLoad: () => requireAuth(),
  loader: () => getFinancialReport(),
  component: FinancialReportPage,
});

function FinancialReportPage() {
  const { monthly: rows, fund } = Route.useLoaderData();
  const totals = rows.reduce(
    (acc, r) => ({
      income: acc.income + r.income,
      assistance: acc.assistance + r.assistance,
      operations: acc.operations + r.operations,
      expense: acc.expense + r.expense,
      net: acc.net + r.net,
    }),
    { income: 0, assistance: 0, operations: 0, expense: 0, net: 0 },
  );

  return (
    <div className="min-h-screen bg-muted/30 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-4xl items-center justify-between px-4 print:hidden">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link to="/reports">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print report
        </Button>
      </div>

      <div className="mx-auto max-w-4xl bg-white text-slate-900 shadow-lg print:shadow-none print:max-w-none">
        <div className="border-b-4 border-primary p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-xl font-bold tracking-tight">DAYONG</div>
                <div className="text-xs text-slate-600">
                  Member Assistance & Collection Management
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-slate-500">
                Financial Report
              </div>
              <div className="font-display text-lg font-semibold">6-Month Summary</div>
              <div className="mt-1 text-xs text-slate-600">
                Generated {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-3 gap-4">
            <SummaryTile label="Total income" value={formatPHP(totals.income)} tone="emerald" />
            <SummaryTile label="Total expenses" value={formatPHP(totals.expense)} tone="rose" />
            <SummaryTile label="Net cash flow" value={formatPHP(totals.net)} tone="primary" />
          </div>

          <h2 className="mt-8 font-display text-base font-semibold">Monthly breakdown</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2 text-right">Income</th>
                  <th className="px-3 py-2 text-right">Assistance</th>
                  <th className="px-3 py-2 text-right">Operations</th>
                  <th className="px-3 py-2 text-right">Total expense</th>
                  <th className="px-3 py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((r) => (
                  <tr key={r.month}>
                    <td className="px-3 py-2 font-medium">{r.month}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatPHP(r.income)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatPHP(r.assistance)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatPHP(r.operations)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatPHP(r.expense)}</td>
                    <td
                      className={
                        "px-3 py-2 text-right tabular-nums font-semibold " +
                        (r.net >= 0 ? "text-emerald-700" : "text-rose-700")
                      }
                    >
                      {formatPHP(r.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold">
                <tr>
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatPHP(totals.income)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatPHP(totals.assistance)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatPHP(totals.operations)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatPHP(totals.expense)}</td>
                  <td
                    className={
                      "px-3 py-2 text-right tabular-nums " +
                      (totals.net >= 0 ? "text-emerald-700" : "text-rose-700")
                    }
                  >
                    {formatPHP(totals.net)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <h2 className="mt-8 font-display text-base font-semibold">Fund position</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <FactCell label="Ending balance" value={formatPHP(fund.balance)} />
            <FactCell label="Active members" value={String(fund.activeMembers)} />
            <FactCell label="Approved claims" value={String(fund.approvedAssistance)} />
            <FactCell label="Pending claims" value={String(fund.pendingAssistance)} />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-slate-400 pb-1 text-center text-sm font-medium">
                Admin Santos
              </div>
              <div className="mt-1 text-center text-xs text-slate-600">Prepared by · Treasurer</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1">&nbsp;</div>
              <div className="mt-1 text-center text-xs text-slate-600">
                Approved by · Board President
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
            This is a computer-generated report. All figures in Philippine Peso (PHP).
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "primary";
}) {
  const cls = {
    emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    rose: "bg-rose-50 text-rose-800 ring-rose-200",
    primary: "bg-primary/5 text-primary ring-primary/20",
  }[tone];
  return (
    <div className={"rounded-lg p-4 ring-1 " + cls}>
      <div className="text-[10px] uppercase tracking-widest opacity-70">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function FactCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
