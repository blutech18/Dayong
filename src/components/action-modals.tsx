import { useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Loader2, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatPHP } from "@/lib/format";
import { getMemberOptions } from "@/server/functions/members";
import { createMember } from "@/server/functions/members";
import { recordContribution } from "@/server/functions/contributions";
import { createAssistance } from "@/server/functions/assistance";
import { createAnnouncement } from "@/server/functions/announcements";
import { createCollectionEvent } from "@/server/functions/events";

/** Shared hook: member options, fetched lazily when a modal opens. */
function useMemberOptions(enabled: boolean) {
  return useQuery({
    queryKey: ["member-options"],
    queryFn: () => getMemberOptions(),
    enabled,
    staleTime: 30_000,
  });
}

const DIALOG_CLASS = "max-h-[85vh] overflow-y-auto sm:max-w-lg";

// ── Record contribution ──────────────────────────────────────────────────────

type Method = "cash" | "gcash" | "bank" | "check";

export function RecordContributionModal({ trigger }: { trigger?: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: members = [] } = useMemberOptions(open);
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Method>("cash");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setMemberId("");
    setAmount("");
    setMethod("cash");
  };

  async function submit() {
    const value = parseFloat(amount);
    if (!memberId) return toast.error("Select a member.");
    if (!value || value <= 0) return toast.error("Enter a valid amount.");
    setSaving(true);
    try {
      const result = await recordContribution({
        data: { memberId, amount: value, method, status: "paid" },
      });
      toast.success("Contribution recorded", {
        description: `${result.receiptNo} · ${formatPHP(result.amount)}`,
      });
      setOpen(false);
      reset();
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record payment.");
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
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Record contribution
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle>Record contribution</DialogTitle>
          <DialogDescription>
            Enter payment details. A receipt is generated automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Member</Label>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Select member…" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Amount (PHP)</Label>
              <Input
                type="number"
                min={0}
                placeholder="500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Record and print receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── New member ───────────────────────────────────────────────────────────────

export function NewMemberModal({ trigger }: { trigger?: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const reset = () => setForm({ firstName: "", lastName: "", email: "", phone: "", address: "" });

  async function submit() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return toast.error("First and last name are required.");
    }
    setSaving(true);
    try {
      const member = await createMember({
        data: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        },
      });
      toast.success("Member registered", { description: `${member.memberNo} created.` });
      setOpen(false);
      reset();
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register member.");
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
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle>Register new member</DialogTitle>
          <DialogDescription>The record starts as pending until verified.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>First name</Label>
            <Input value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Last name</Label>
            <Input value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => set({ address: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Register member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── New assistance request ─────────────────────────────────────────────────────

type AssistCategory = "medical" | "burial" | "calamity" | "educational" | "other";

export function NewAssistanceModal({ trigger }: { trigger?: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: members = [] } = useMemberOptions(open);
  const [memberId, setMemberId] = useState("");
  const [category, setCategory] = useState<AssistCategory | "">("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setMemberId("");
    setCategory("");
    setAmount("");
    setReason("");
  };

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
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={DIALOG_CLASS}>
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

// ── New announcement ───────────────────────────────────────────────────────────

type AnnouncementCategory = "general" | "event" | "policy" | "urgent";

export function NewAnnouncementModal({ trigger }: { trigger?: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("general");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setBody("");
    setCategory("general");
    setPinned(false);
  };

  async function submit() {
    if (!title.trim() || !body.trim()) {
      return toast.error("Title and message are required.");
    }
    setSaving(true);
    try {
      await createAnnouncement({
        data: { title: title.trim(), body: body.trim(), category, pinned },
      });
      toast.success("Announcement published", { description: title });
      setOpen(false);
      reset();
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish announcement.");
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
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New announcement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle>Compose announcement</DialogTitle>
          <DialogDescription>Publish a message visible to members and staff.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as AnnouncementCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Message</Label>
            <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={pinned} onCheckedChange={(v) => setPinned(!!v)} />
            <Pin className="h-3.5 w-3.5 text-warning" />
            Pin to the top of the feed
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Create collection event ─────────────────────────────────────────────────────

export function CreateEventModal({ trigger }: { trigger?: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");
  const [collectorName, setCollectorName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [expectedMembers, setExpectedMembers] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setScheduledAt("");
    setLocation("");
    setCollectorName("");
    setTargetAmount("");
    setExpectedMembers("");
  };

  async function submit() {
    if (!name.trim()) return toast.error("Enter an event name.");
    if (!scheduledAt) return toast.error("Pick a schedule date.");
    setSaving(true);
    try {
      await createCollectionEvent({
        data: {
          name: name.trim(),
          scheduledAt: new Date(scheduledAt).toISOString(),
          location: location.trim(),
          collectorName: collectorName.trim(),
          targetAmount: parseFloat(targetAmount) || 0,
          expectedMembers: parseInt(expectedMembers) || 0,
        },
      });
      toast.success("Event scheduled", { description: name });
      setOpen(false);
      reset();
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event.");
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
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Create event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle>Schedule collection event</DialogTitle>
          <DialogDescription>Set the schedule, target, and assigned collector.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Event name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Monthly Collection — August 2026"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Schedule</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Barangay Hall"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Collector</Label>
              <Input
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                placeholder="Name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Target (₱)</Label>
              <Input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="24000"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Expected</Label>
              <Input
                type="number"
                value={expectedMembers}
                onChange={(e) => setExpectedMembers(e.target.value)}
                placeholder="48"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Schedule event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
