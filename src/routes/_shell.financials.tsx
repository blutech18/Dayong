import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  PiggyBank,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatPHP, formatDate } from "@/lib/format";
import { getFinancialsOverview } from "@/server/functions/financials";

export const Route = createFileRoute("/_shell/financials")({
  head: () => ({ meta: [{ title: "Financial Management — DAYONG" }] }),
  loader: () => getFinancialsOverview(),
  component: FinancialsPage,
});

function FinancialsPage() {
  const { stats, monthly, ledger } = Route.useLoaderData();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Management"
        description="Income, expenses, and cash-flow analytics across the organization."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export ledger
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total income (YTD)"
          value={formatPHP(stats.incomeYTD)}
          icon={ArrowUpRight}
          tone="success"
        />
        <StatCard
          label="Total expenses (YTD)"
          value={formatPHP(stats.expenseYTD)}
          icon={ArrowDownRight}
          tone="danger"
        />
        <StatCard
          label="Net cash flow"
          value={formatPHP(stats.net)}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="Cash on hand"
          value={formatPHP(stats.cashOnHand)}
          icon={PiggyBank}
          tone="secondary"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold">Cash flow trend</h3>
            <p className="text-xs text-muted-foreground">
              Income vs Expenses vs Net · last 6 months
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Income
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Expense
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Net
            </span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => formatPHP(v)}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="var(--color-destructive)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--color-secondary)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h3 className="font-display text-base font-semibold">Ledger</h3>
            <p className="text-xs text-muted-foreground">Latest transactions</p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5">
            View all
          </Button>
        </div>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Reference</th>
                <th className="px-3 py-3 font-medium">Description</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ledger.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
              {ledger.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-6 py-3 text-xs text-muted-foreground">{formatDate(r.date)}</td>
                  <td className="px-3 py-3 font-medium">{r.ref}</td>
                  <td className="px-3 py-3">{r.desc}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        r.type === "income"
                          ? "inline-flex items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold text-success"
                          : "inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[11px] font-semibold text-destructive"
                      }
                    >
                      {r.type === "income" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {r.type}
                    </span>
                  </td>
                  <td
                    className={
                      "px-6 py-3 text-right font-semibold tabular-nums " +
                      (r.type === "income" ? "text-success" : "text-destructive")
                    }
                  >
                    {r.type === "income" ? "+" : "−"}
                    {formatPHP(r.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
