import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Search,
  HeartHandshake,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  Eye,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import { NewAssistanceModal } from "@/components/action-modals";
import { TablePagination } from "@/components/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { formatPHP, formatDate, formatDateTime } from "@/lib/format";
import { getAssistancePage, transitionAssistance } from "@/server/functions/assistance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/assistance")({
  head: () => ({ meta: [{ title: "Assistance Requests — Pagtukaw Lifecare" }] }),
  loader: () => getAssistancePage(),
  component: AssistancePage,
});

type WorkflowAction = "verify" | "approve" | "reject" | "release";

function AssistancePage() {
  const { requests, stats } = Route.useLoaderData();
  const router = useRouter();
  const [tab, setTab] = useState<string>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const list = requests.filter((r) => {
    if (tab !== "all" && r.status !== tab) return false;
    if (
      q &&
      !`${r.memberName} ${r.requestNo} ${r.category}`.toLowerCase().includes(q.toLowerCase())
    )
      return false;
    return true;
  });
  const { page, setPage, paged, pageSize, total } = usePagination(list);

  const active = requests.find((r) => r.id === selected) ?? null;

  async function runAction(id: string, action: WorkflowAction) {
    setSaving(true);
    try {
      const updated = await transitionAssistance({ data: { id, action } });
      toast.success(`Request ${updated.status.replace(/_/g, " ")}`, {
        description: updated.requestNo,
      });
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assistance Requests"
        description="Review, verify, and release assistance to members in need."
        actions={<NewAssistanceModal />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total requests"
          value={String(stats.total)}
          icon={HeartHandshake}
          tone="primary"
        />
        <StatCard
          label="Awaiting action"
          value={String(stats.pending)}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Approved / Released"
          value={String(stats.approved)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard label="Rejected" value={String(stats.rejected)} icon={XCircle} tone="danger" />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v);
              setPage(1);
            }}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="under_review">Under review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="released">Released</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search request no, name…"
                className="h-9 w-full rounded-lg border border-input bg-muted/30 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Request</th>
                <th className="px-3 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Submitted</th>
                <th className="px-3 py-3 font-medium">Docs</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
                <th className="px-3 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => setSelected(r.id)}
                >
                  <td className="px-6 py-3 font-medium">{r.requestNo}</td>
                  <td className="px-3 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.memberName}</div>
                      <div className="truncate text-xs text-muted-foreground">{r.memberNo}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 capitalize text-xs">{r.category}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {formatDate(r.submittedAt)}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {r.documentsCount}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-3 text-right font-semibold tabular-nums">
                    {formatPHP(r.amount)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      aria-label="View request"
                    >
                      <Eye className="h-4 w-4" />
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
          label="requests"
        />
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="w-full sm:max-w-2xl p-0 overflow-hidden [&>button]:hidden">
          {active && (
            <div className="flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="shrink-0 px-6 py-6 border-b border-border bg-muted/10 relative">
                <div className="sr-only">
                  <DialogHeader>
                    <DialogTitle>{active.requestNo}</DialogTitle>
                    <DialogDescription>Assistance Request details</DialogDescription>
                  </DialogHeader>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{active.memberName}</h2>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground/80">{active.memberNo}</span>
                      <span>•</span>
                      <span>{active.requestNo}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={active.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(active.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-thin min-h-0 bg-muted/5">
                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount Requested
                    </div>
                    <div className="mt-2 text-2xl font-bold text-foreground">
                      {formatPHP(active.amount)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </div>
                    <div className="mt-2 text-2xl font-bold capitalize text-foreground">
                      {active.category}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Documents
                    </div>
                    <div className="mt-2 flex items-baseline gap-1 text-2xl font-bold text-foreground">
                      {active.documentsCount}
                      <span className="text-sm font-medium text-muted-foreground">file(s)</span>
                    </div>
                  </div>
                </div>

                {/* Reason & Reviewer */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Reason for Request
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {active.reason}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Assigned Reviewer
                    </div>
                    <div className="mt-2 font-medium text-foreground">
                      {active.reviewedBy ?? "Unassigned"}
                    </div>
                  </div>
                </div>

                {/* Workflow Stepper */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
                    Approval Progress
                  </h4>
                  <div className="flex items-center justify-between">
                    {[
                      { step: "Submitted", done: true },
                      { step: "Verified", done: active.status !== "pending" },
                      { step: "Approved", done: ["approved", "released"].includes(active.status) },
                      { step: "Released", done: active.status === "released" },
                    ].map((s, i, arr) => (
                      <div key={i} className="relative flex flex-1 flex-col items-center gap-3">
                        {i !== arr.length - 1 && (
                          <div
                            className={cn(
                              "absolute left-[50%] right-[-50%] top-3.5 h-[2px]",
                              s.done ? "bg-primary" : "bg-muted"
                            )}
                          />
                        )}
                        <div
                          className={cn(
                            "relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 text-[11px] font-bold transition-colors",
                            s.done
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted bg-background text-muted-foreground"
                          )}
                        >
                          {i + 1}
                        </div>
                        <div
                          className={cn(
                            "text-xs font-semibold",
                            s.done ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {s.step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="shrink-0 px-6 py-4 border-t border-border bg-background flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                  {active.status !== "released" && active.status !== "rejected" ? (
                    <Button
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive px-6 w-full sm:w-auto"
                      disabled={saving}
                      onClick={() => runAction(active.id, "reject")}
                    >
                      Reject
                    </Button>
                  ) : (
                    <div className="text-sm font-medium text-muted-foreground hidden sm:block">
                      This request is {active.status}.
                    </div>
                  )}
                </div>
                <div className="w-full sm:w-auto flex flex-col-reverse sm:flex-row items-center gap-3">
                  <Button
                    variant="outline"
                    className="px-6 w-full sm:w-auto"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </Button>
                  {active.status !== "released" && active.status !== "rejected" && (
                    <>
                      {active.status === "pending" && (
                        <Button
                          className="gap-2 px-6 w-full sm:w-auto"
                          disabled={saving}
                          onClick={() => runAction(active.id, "verify")}
                        >
                          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                          Verify documents
                        </Button>
                      )}
                      {active.status === "under_review" && (
                        <Button
                          className="gap-2 px-6 w-full sm:w-auto"
                          disabled={saving}
                          onClick={() => runAction(active.id, "approve")}
                        >
                          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                          Approve
                        </Button>
                      )}
                      {active.status === "approved" && (
                        <Button
                          className="gap-2 px-6 w-full sm:w-auto"
                          disabled={saving}
                          onClick={() => runAction(active.id, "release")}
                        >
                          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                          Release funds
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium capitalize">{value}</div>
    </div>
  );
}
