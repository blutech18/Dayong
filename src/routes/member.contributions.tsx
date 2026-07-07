import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/member/contributions")({
  head: () => ({ meta: [{ title: "My Contributions — DAYONG" }] }),
  component: MemberContributions,
});

function MemberContributions() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Contribution Ledger</h1>
          <p className="text-sm text-muted-foreground">Review your payment history and outstanding balances.</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <Download className="h-4 w-4" />
          Download Statement
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Receipt No.</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle">Oct 15, 2023</td>
                <td className="p-4 align-middle">Monthly Contribution</td>
                <td className="p-4 align-middle">₱500.00</td>
                <td className="p-4 align-middle font-mono">OR-2023-10-154</td>
                <td className="p-4 align-middle">
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                    Paid
                  </div>
                </td>
              </tr>
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle">Sep 15, 2023</td>
                <td className="p-4 align-middle">Monthly Contribution</td>
                <td className="p-4 align-middle">₱500.00</td>
                <td className="p-4 align-middle font-mono">OR-2023-09-122</td>
                <td className="p-4 align-middle">
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                    Paid
                  </div>
                </td>
              </tr>
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-muted-foreground">
                <td className="p-4 align-middle" colSpan={5} style={{ textAlign: "center" }}>
                  End of records
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
