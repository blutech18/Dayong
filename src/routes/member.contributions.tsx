import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { formatPHP, formatDate } from "@/lib/format";
import { getMyContributions } from "@/server/functions/member-portal";

export const Route = createFileRoute("/member/contributions")({
  head: () => ({ meta: [{ title: "My Contributions — Pagtukaw Lifecare" }] }),
  loader: () => getMyContributions(),
  component: MemberContributions,
});

const statusTone: Record<string, string> = {
  paid: "border-transparent bg-primary text-primary-foreground",
  partial: "border-transparent bg-amber-500 text-white",
  unpaid: "border-transparent bg-muted text-muted-foreground",
};

function MemberContributions() {
  const contributions = Route.useLoaderData();
  const { page, setPage, paged, pageSize, total } = usePagination(contributions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Contribution Ledger
          </h1>
          <p className="text-sm text-muted-foreground">
            Review your payment history and outstanding balances.
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" disabled={contributions.length === 0}>
          <Download className="h-4 w-4" />
          Download Statement
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Date
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Method
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Receipt No.
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {contributions.length === 0 && (
                <tr className="border-b text-muted-foreground">
                  <td className="p-8 align-middle" colSpan={5} style={{ textAlign: "center" }}>
                    No contributions recorded yet.
                  </td>
                </tr>
              )}
              {paged.map((c) => (
                <tr key={c.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">{formatDate(c.paidAt)}</td>
                  <td className="p-4 align-middle capitalize">{c.method}</td>
                  <td className="p-4 align-middle">{formatPHP(c.amount)}</td>
                  <td className="p-4 align-middle font-mono">{c.receiptNo}</td>
                  <td className="p-4 align-middle">
                    <div
                      className={
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize " +
                        (statusTone[c.status] ?? statusTone.unpaid)
                      }
                    >
                      {c.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          label="contributions"
        />
      </div>
    </div>
  );
}
