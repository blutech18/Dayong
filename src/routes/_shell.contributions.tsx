import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, Plus, Download, Filter, Wallet, TrendingUp, Receipt,
  Printer, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import {
  contributions, members, formatPHP, formatDateTime,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/contributions")({
  head: () => ({ meta: [{ title: "Contributions — DAYONG" }] }),
  component: ContributionsPage,
});

function ContributionsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (q) {
        const hay = `${c.memberName} ${c.memberNo} ${c.receiptNo}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [q, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totals = useMemo(() => ({
    collected: contributions.filter(c => c.status === "paid").reduce((s, c) => s + c.amount, 0),
    partial: contributions.filter(c => c.status === "partial").reduce((s, c) => s + c.amount, 0),
    outstanding: 24000 - contributions.slice(0, 24).reduce((s, c) => s + c.amount, 0),
  }), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contributions"
        description="Payment records, receipts and outstanding balances across all members."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link to="/contributions/new"><Receipt className="h-4 w-4" />Post batch</Link>
            </Button>
            <RecordPaymentDialog />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Collected this month" value={formatPHP(18500)} delta={3.2} deltaLabel="vs last month" icon={Wallet} tone="primary" />
        <StatCard label="YTD collections" value={formatPHP(totals.collected)} delta={12.4} deltaLabel="vs last year" icon={TrendingUp} tone="success" />
        <StatCard label="Partial payments" value={formatPHP(totals.partial)} icon={Receipt} tone="warning" />
        <StatCard label="Outstanding" value={formatPHP(Math.max(0, totals.outstanding))} delta={-4.1} deltaLabel="improved" icon={Receipt} tone="danger" />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Receipt no, member…"
                className="h-9 w-full rounded-lg border border-input bg-muted/30 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5"><Filter className="h-4 w-4" />More filters</Button>
          </div>
        </div>

        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Receipt</th>
                <th className="px-3 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Method</th>
                <th className="px-3 py-3 font-medium">Event</th>
                <th className="px-3 py-3 font-medium">Recorded</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
                <th className="w-12 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40">
                  <td className="px-6 py-3 font-medium">{c.receiptNo}</td>
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium">{c.memberName}</div>
                    <div className="text-xs text-muted-foreground">{c.memberNo}</div>
                  </td>
                  <td className="px-3 py-3 capitalize text-xs">{c.method}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{c.eventName ?? "—"}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{formatDateTime(c.paidAt)}</td>
                  <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-6 py-3 text-right font-semibold tabular-nums">{formatPHP(c.amount)}</td>
                  <td className="px-3 py-3">
                    <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Print receipt"><Printer className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border p-4 text-sm">
          <div className="text-xs text-muted-foreground">
            {filtered.length} contribution{filtered.length === 1 ? "" : "s"} · Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordPaymentDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Record payment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record contribution</DialogTitle>
          <DialogDescription>Enter payment details. A receipt will be generated automatically.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="member">Member</Label>
            <Select>
              <SelectTrigger id="member"><SelectValue placeholder="Search member…" /></SelectTrigger>
              <SelectContent>
                {members.slice(0, 8).map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName} · {m.memberNo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="amount">Amount (PHP)</Label>
              <Input id="amount" type="number" placeholder="500.00" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="method">Method</Label>
              <Select defaultValue="cash">
                <SelectTrigger id="method"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="Reference numbers, remarks…" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Record and print receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
