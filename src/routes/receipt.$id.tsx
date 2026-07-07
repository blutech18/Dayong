import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Printer, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contributions, formatPHP, formatDateTime } from "@/lib/mock-data";

export const Route = createFileRoute("/receipt/$id")({
  head: () => ({ meta: [{ title: "Official Receipt — DAYONG" }] }),
  loader: ({ params }) => {
    const receipt = contributions.find((c) => c.id === params.id) ?? contributions[0];
    if (!receipt) throw notFound();
    return { receipt };
  },
  component: ReceiptPage,
});

function ReceiptPage() {
  const { receipt } = Route.useLoaderData();
  const amountWords = numberToWords(receipt.amount);

  return (
    <div className="min-h-screen bg-muted/30 py-8 print:bg-white print:py-0">
      {/* Toolbar (hidden on print) */}
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between px-4 print:hidden">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link to="/contributions"><ArrowLeft className="h-4 w-4" />Back</Link>
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print receipt
        </Button>
      </div>

      {/* Receipt card */}
      <div className="mx-auto max-w-3xl bg-white text-slate-900 shadow-lg print:shadow-none print:max-w-none">
        <div className="border-b-4 border-primary p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-xl font-bold tracking-tight">DAYONG</div>
                <div className="text-xs text-slate-600">Member Assistance & Collection Management</div>
                <div className="text-xs text-slate-500">Barangay San Roque · Quezon City · Metro Manila</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-slate-500">Official Receipt</div>
              <div className="font-display text-2xl font-bold text-primary">{receipt.receiptNo}</div>
              <div className="mt-1 text-xs text-slate-600">{formatDateTime(receipt.paidAt)}</div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Received from</div>
              <div className="mt-1 text-lg font-semibold">{receipt.memberName}</div>
              <div className="text-sm text-slate-600">Member No. {receipt.memberNo}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Payment method</div>
              <div className="mt-1 text-lg font-semibold uppercase">{receipt.method}</div>
              <div className="text-sm text-slate-600">Status: <span className="font-medium capitalize">{receipt.status}</span></div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">For payment of</div>
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{receipt.eventName ?? "Monthly membership contribution"}</div>
                  <div className="text-xs text-slate-600">One (1) contribution period</div>
                </div>
                <div className="font-display text-xl font-bold tabular-nums">{formatPHP(receipt.amount)}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-primary/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Amount in words</div>
                <div className="mt-0.5 text-sm font-medium italic">{amountWords} Pesos Only</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Total amount</div>
                <div className="font-display text-3xl font-bold text-primary tabular-nums">{formatPHP(receipt.amount)}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Payment received and posted to member's ledger.
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-slate-400 pb-1">&nbsp;</div>
              <div className="mt-1 text-xs text-slate-600">Member signature</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 text-center text-sm font-medium">{receipt.recordedBy}</div>
              <div className="mt-1 text-xs text-slate-600">Authorized collector</div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
            This is a computer-generated receipt. Please retain for your records.
            <br />DAYONG Member Assistance & Collection Management System · Generated {formatDateTime(new Date().toISOString())}
          </div>
        </div>
      </div>
    </div>
  );
}

function numberToWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function under1000(x: number): string {
    if (x === 0) return "";
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
    return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + under1000(x % 100) : "");
  }
  if (n === 0) return "Zero";
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const parts = [];
  if (thousands) parts.push(under1000(thousands) + " Thousand");
  if (rest) parts.push(under1000(rest));
  return parts.join(" ");
}
