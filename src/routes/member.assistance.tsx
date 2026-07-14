import type { SVGProps } from "react";
import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Loader2 } from "lucide-react";
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
import { StatusBadge } from "@/components/status-badge";
import { formatPHP, formatDate } from "@/lib/format";
import { getMyAssistance, submitMyAssistance } from "@/server/functions/member-portal";

type Category = "medical" | "burial" | "calamity" | "educational" | "other";

export const Route = createFileRoute("/member/assistance")({
  head: () => ({ meta: [{ title: "My Assistance — Pagtukaw Lifecare" }] }),
  loader: () => getMyAssistance(),
  component: MemberAssistance,
});

function MemberAssistance() {
  const requests = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Assistance Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your applications for financial or medical aid.
          </p>
        </div>
        <ApplyDialog />
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-24 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground mb-4">
            <HeartPulseIcon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg">No assistance requests</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            You haven't applied for any assistance yet. When you do, you can track the approval
            status here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {requests.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.requestNo}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground capitalize">
                  {r.category} · submitted {formatDate(r.submittedAt)}
                </div>
                {r.reason && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{r.reason}</p>
                )}
              </div>
              <div className="font-semibold tabular-nums">{formatPHP(r.amount)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplyDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category | "">("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const value = parseFloat(amount);
    if (!category) return toast.error("Select a category.");
    if (!value || value <= 0) return toast.error("Enter a valid amount.");
    if (!reason.trim()) return toast.error("Describe your request.");
    setSaving(true);
    try {
      const created = await submitMyAssistance({
        data: { category, amount: value, reason: reason.trim() },
      });
      toast.success("Request submitted", { description: `Assigned ${created.requestNo}` });
      setOpen(false);
      setCategory("");
      setAmount("");
      setReason("");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Apply for Assistance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for assistance</DialogTitle>
          <DialogDescription>
            Your request will be reviewed by the organization's staff.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
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
            <Label>Amount requested (PHP)</Label>
            <Input
              type="number"
              min={0}
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Reason / description</Label>
            <Textarea
              rows={4}
              placeholder="Explain the situation and how the assistance will be used…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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

function HeartPulseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}
