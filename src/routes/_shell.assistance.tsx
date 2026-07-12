import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  Plus,
  Search,
  HeartHandshake,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import { formatPHP, formatDate, formatDateTime } from "@/lib/format";
import {
  getAssistancePage,
  transitionAssistance,
  createAssistance,
} from "@/server/functions/assistance";
import { getMemberOptions, type MemberOption } from "@/server/functions/members";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/assistance")({
  head: () => ({ meta: [{ title: "Assistance Requests — DAYONG" }] }),
  loader: async () => {
    const [page, members] = await Promise.all([getAssistancePage(), getMemberOptions()]);
    return { ...page, members };
  },
  component: AssistancePage,
});

type WorkflowAction = "verify" | "approve" | "reject" | "release";

function AssistancePage() {
  const { requests, stats, members } = Route.useLoaderData();
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
        actions={<NewAssistanceModal members={members} />}
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
          <Tabs value={tab} onValueChange={setTab}>
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
                onChange={(e) => setQ(e.target.value)}
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
                <th className="w-12 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((r) => (
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
                  <td className="px-3 py-3">
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
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle>{active.requestNo}</SheetTitle>
                  <StatusBadge status={active.status} />
                </div>
                <SheetDescription>Submitted {formatDateTime(active.submittedAt)}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="rounded-xl border border-border p-4">
                  <div className="font-medium">{active.memberName}</div>
                  <div className="text-xs text-muted-foreground">{active.memberNo}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category" value={active.category} />
                  <Field label="Amount requested" value={formatPHP(active.amount)} />
                  <Field label="Reviewer" value={active.reviewedBy ?? "Unassigned"} />
                  <Field label="Documents" value={`${active.documentsCount} file(s)`} />
                </div>

                <div>
                  <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Reason
                  </div>
                  <p className="text-sm">{active.reason}</p>
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Approval workflow
                  </div>
                  <ol className="space-y-3">
                    {[
                      { step: "Submitted", done: true },
                      { step: "Documents verified", done: active.status !== "pending" },
                      { step: "Approved", done: ["approved", "released"].includes(active.status) },
                      { step: "Released", done: active.status === "released" },
                    ].map((s, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <span
                          className={cn(
                            "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold",
                            s.done
                              ? "bg-success text-success-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className={s.done ? "" : "text-muted-foreground"}>{s.step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-wrap gap-2">
                  {active.status !== "released" && active.status !== "rejected" && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 text-destructive hover:text-destructive"
                        disabled={saving}
                        onClick={() => runAction(active.id, "reject")}
                      >
                        Reject
                      </Button>
                      {active.status === "pending" && (
                        <Button
                          className="flex-1 gap-1.5"
                          disabled={saving}
                          onClick={() => runAction(active.id, "verify")}
                        >
                          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                          Verify documents
                        </Button>
                      )}
                      {active.status === "under_review" && (
                        <Button
                          className="flex-1 gap-1.5"
                          disabled={saving}
                          onClick={() => runAction(active.id, "approve")}
                        >
                          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                          Approve
                        </Button>
                      )}
                      {active.status === "approved" && (
                        <Button
                          className="flex-1 gap-1.5"
                          disabled={saving}
                          onClick={() => runAction(active.id, "release")}
                        >
                          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                          Release funds
                        </Button>
                      )}
                    </>
                  )}
                  {(active.status === "released" || active.status === "rejected") && (
                    <div className="flex-1 text-center text-sm text-muted-foreground">
                      This request is {active.status}. No further action needed.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
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

type AssistCategory = "medical" | "burial" | "calamity" | "educational" | "other";

function NewAssistanceModal({ members }: { members: MemberOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [category, setCategory] = useState<AssistCategory | "">("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setMemberId("");
    setCategory("");
    setAmount("");
    setReason("");
  }

  async function submit() {
    const value = parseFloat(amount);
    if (!memberId) return toast.error("Select a member.");
    if (!category) return toast.error("Select a category.");
    if (!value || value <= 0) return toast.error("Enter a valid amount.");
    if (!reason.trim()) return toast.error("Provide a reason.");
    setSaving(true);
    try {
      const created = await createAssistance({
        data: { memberId, category, amount: value, reason: reason.trim() },
      });
      toast.success("Request submitted", { description: `Assigned ${created.requestNo}` });
      setOpen(false);
      reset();
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request.");
    } finally {
      setSaving(false);
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
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New assistance request</DialogTitle>
          <DialogDescription>
            File a request on behalf of a member. It enters the review queue.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Member</Label>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} · {m.memberNo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as AssistCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="burial">Burial</SelectItem>
                <SelectItem value="calamity">Calamity</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Amount (PHP)</Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Reason / description</Label>
            <Textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the situation and how the assistance will be used…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
