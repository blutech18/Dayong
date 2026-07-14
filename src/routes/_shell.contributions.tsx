import { useMemo, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Download,
  Filter,
  Wallet,
  TrendingUp,
  Receipt,
  Printer,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import { RecordContributionModal } from "@/components/action-modals";
import { TablePagination } from "@/components/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { formatPHP, formatDateTime } from "@/lib/format";
import { getContributionsPage, recordContributionBatch } from "@/server/functions/contributions";

export const Route = createFileRoute("/_shell/contributions")({
  head: () => ({ meta: [{ title: "Contributions — Pagtukaw Lifecare" }] }),
  loader: () => getContributionsPage(),
  component: ContributionsPage,
});

type MemberOption = { id: string; firstName: string; lastName: string; memberNo: string };

function ContributionsPage() {
  const { contributions, stats, members } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (q) {
        const hay = `${c.memberName} ${c.memberNo} ${c.receiptNo}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [contributions, q, status]);
  const { page, setPage, paged, pageSize, total } = usePagination(filtered);

  const monthCollected = useMemo(() => {
    const now = new Date();
    return contributions
      .filter((c) => {
        const d = new Date(c.paidAt);
        return (
          c.status !== "unpaid" &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, c) => s + c.amount, 0);
  }, [contributions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contributions"
        description="Payment records, receipts and outstanding balances across all members."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <PostBatchModal members={members} />
            <RecordContributionModal
              trigger={
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Record payment
                </Button>
              }
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Collected this month"
          value={formatPHP(monthCollected)}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Total collected (paid)"
          value={formatPHP(stats.collectedPaid)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Partial payments"
          value={formatPHP(stats.partial)}
          icon={Receipt}
          tone="warning"
        />
        <StatCard label="Records" value={String(stats.count)} icon={Receipt} tone="muted" />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Receipt no, member…"
                className="h-9 w-full rounded-lg border border-input bg-muted/30 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Filter className="h-4 w-4" />
              More filters
            </Button>
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
                <th className="px-6 py-3 text-right font-medium">Action</th>
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
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {formatDateTime(c.paidAt)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-3 text-right font-semibold tabular-nums">
                    {formatPHP(c.amount)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      aria-label="Print receipt"
                      onClick={() => toast.success(`Printing receipt ${c.receiptNo}...`)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
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

type BatchMethod = "cash" | "gcash" | "bank" | "check";
type BatchRow = { id: number; memberId: string; amount: string; method: BatchMethod };

function PostBatchModal({ members }: { members: MemberOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [rows, setRows] = useState<BatchRow[]>([
    { id: 1, memberId: "", amount: "", method: "cash" },
    { id: 2, memberId: "", amount: "", method: "cash" },
  ]);

  const total = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const update = (id: number, patch: Partial<BatchRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  function reset() {
    setRows([
      { id: 1, memberId: "", amount: "", method: "cash" },
      { id: 2, memberId: "", amount: "", method: "cash" },
    ]);
  }

  async function post() {
    const entries = rows
      .filter((r) => r.memberId && parseFloat(r.amount) > 0)
      .map((r) => ({ memberId: r.memberId, amount: parseFloat(r.amount), method: r.method }));
    if (entries.length === 0)
      return toast.error("Add at least one entry with a member and amount.");
    setPosting(true);
    try {
      const result = await recordContributionBatch({ data: { entries } });
      toast.success("Batch posted", {
        description: `${result.count} entries · ${formatPHP(result.total)} recorded.`,
      });
      setOpen(false);
      reset();
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post batch.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Receipt className="h-4 w-4" />
          Post batch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post contributions</DialogTitle>
          <DialogDescription>Record multiple member contributions in one batch.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {rows.map((r, i) => (
            <div
              key={r.id}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem_7rem_auto] sm:items-center"
            >
              <Select value={r.memberId} onValueChange={(v) => update(r.id, { memberId: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={`Member ${i + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} · {m.memberNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={r.method}
                onValueChange={(v) => update(r.id, { method: v as BatchMethod })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={r.amount}
                onChange={(e) => update(r.id, { amount: e.target.value })}
                className="h-9 text-right tabular-nums"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive"
                aria-label="Remove row"
                disabled={rows.length <= 1}
                onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              setRows((prev) => [
                ...prev,
                { id: Date.now(), memberId: "", amount: "", method: "cash" },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add row
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">Batch total</span>
          <span className="font-display text-base font-semibold tabular-nums">
            {formatPHP(total)}
          </span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={posting}>
            Cancel
          </Button>
          <Button onClick={post} disabled={posting} className="gap-1.5">
            {posting && <Loader2 className="h-4 w-4 animate-spin" />}
            Post batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
