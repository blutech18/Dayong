import { useState } from "react";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  QrCode,
  Printer,
  Edit2,
  Archive,
  Wallet,
  HeartHandshake,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatPHP, formatDate, formatDateTime } from "@/lib/format";
import {
  getMemberDetail,
  updateMember,
  setMemberStatus,
  enableMemberPortal,
} from "@/server/functions/members";
import type { MemberDTO } from "@/server/dto";

export const Route = createFileRoute("/_shell/members/$id")({
  loader: async ({ params }) => {
    const detail = await getMemberDetail({ data: { id: params.id } });
    if (!detail) throw notFound();
    return detail;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.member.firstName} ${loaderData.member.lastName} — DAYONG`
          : "Member — DAYONG",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">Member not found.</div>
  ),
  component: MemberDetail,
});

function MemberDetail() {
  const { member, portalEnabled, contributions, assistance } = Route.useLoaderData();
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const memberContribs = contributions.slice(0, 8);
  const memberReqs = assistance;

  async function handleEnablePortal() {
    setEnabling(true);
    try {
      await enableMemberPortal({ data: { id: member.id } });
      toast.success("Portal access enabled", {
        description: "The member was emailed a link to set their password.",
      });
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to enable portal access.");
    } finally {
      setEnabling(false);
    }
  }

  async function handleArchive() {
    setArchiving(true);
    try {
      await setMemberStatus({ data: { id: member.id, status: "archived" } });
      toast.success("Member archived.");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive member.");
    } finally {
      setArchiving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/members"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to members
        </Link>
      </div>

      <PageHeader
        title={`${member.firstName} ${member.lastName}`}
        description={`${member.memberNo} · Joined ${formatDate(member.joinedAt)}`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Printer className="h-4 w-4" />
              Print ID
            </Button>
            <EditMemberDialog member={member} />
            <Button size="sm" className="gap-1.5" asChild>
              <Link to="/contributions">
                <Wallet className="h-4 w-4" />
                Record payment
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: profile card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <h2 className="font-display text-xl font-semibold">
                {member.firstName} {member.lastName}
              </h2>
              <div className="mt-1 text-sm text-muted-foreground">{member.memberNo}</div>
              <div className="mt-2">
                <StatusBadge status={member.status} />
              </div>
            </div>
            <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row icon={Mail} label="Email" value={member.email} />
              <Row icon={Phone} label="Phone" value={member.phone} />
              <Row icon={MapPin} label="Address" value={member.address} />
              <Row icon={Calendar} label="Joined" value={formatDate(member.joinedAt)} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">Digital Member ID</h3>
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                <QrCode className="h-3 w-3" /> Download
              </Button>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary via-primary to-secondary p-5 text-primary-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-70">DAYONG</div>
                  <div className="mt-1 font-display text-lg font-semibold leading-tight">
                    {member.firstName}
                    <br />
                    {member.lastName}
                  </div>
                </div>
                <div className="grid h-16 w-16 place-items-center rounded-lg bg-primary-foreground text-primary">
                  <QrCode className="h-10 w-10" />
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between text-xs">
                <div>
                  <div className="opacity-70">Member No.</div>
                  <div className="font-semibold">{member.memberNo}</div>
                </div>
                <div className="text-right">
                  <div className="opacity-70">Since</div>
                  <div className="font-semibold">{new Date(member.joinedAt).getFullYear()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: tabs */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              label="Total contributions"
              value={formatPHP(member.contributionsTotal)}
              icon={Wallet}
            />
            <StatBox
              label="Assistance received"
              value={String(memberReqs.length)}
              icon={HeartHandshake}
            />
            <StatBox label="Last payment" value={formatDate(member.lastPaymentAt)} icon={Clock} />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card">
            <Tabs defaultValue="timeline">
              <div className="border-b border-border px-4">
                <TabsList className="h-11 bg-transparent p-0">
                  <TabsTrigger
                    value="timeline"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value="contributions"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    Contributions
                  </TabsTrigger>
                  <TabsTrigger
                    value="assistance"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    Assistance
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    Documents
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="timeline" className="p-6">
                <ol className="relative space-y-6 border-l border-border pl-6">
                  {memberContribs.slice(0, 5).map((c) => (
                    <li key={c.id} className="relative">
                      <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-primary" />
                      <div className="text-sm font-medium">Contribution received</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(c.paidAt)} · {c.receiptNo} · {formatPHP(c.amount)}
                      </div>
                    </li>
                  ))}
                  {memberReqs.slice(0, 2).map((r) => (
                    <li key={r.id} className="relative">
                      <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-warning" />
                      <div className="text-sm font-medium">
                        Assistance request {r.status.replace(/_/g, " ")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(r.submittedAt)} · {r.requestNo} · {formatPHP(r.amount)}
                      </div>
                    </li>
                  ))}
                </ol>
              </TabsContent>

              <TabsContent value="contributions" className="p-0">
                <div className="scroll-thin overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">Receipt</th>
                        <th className="px-3 py-3 font-medium">Date</th>
                        <th className="px-3 py-3 font-medium">Method</th>
                        <th className="px-3 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {memberContribs.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/40">
                          <td className="px-6 py-3 font-medium">{c.receiptNo}</td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">
                            {formatDate(c.paidAt)}
                          </td>
                          <td className="px-3 py-3 text-xs capitalize">{c.method}</td>
                          <td className="px-3 py-3">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-6 py-3 text-right font-medium tabular-nums">
                            {formatPHP(c.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="assistance" className="p-0">
                {memberReqs.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
                      <HeartHandshake className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No assistance history</p>
                    <p className="text-xs text-muted-foreground">
                      This member hasn't requested assistance yet.
                    </p>
                  </div>
                ) : (
                  <div className="scroll-thin overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-6 py-3 font-medium">Request</th>
                          <th className="px-3 py-3 font-medium">Category</th>
                          <th className="px-3 py-3 font-medium">Submitted</th>
                          <th className="px-3 py-3 font-medium">Status</th>
                          <th className="px-6 py-3 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {memberReqs.map((r) => (
                          <tr key={r.id} className="hover:bg-muted/40">
                            <td className="px-6 py-3 font-medium">{r.requestNo}</td>
                            <td className="px-3 py-3 capitalize text-xs">{r.category}</td>
                            <td className="px-3 py-3 text-xs text-muted-foreground">
                              {formatDate(r.submittedAt)}
                            </td>
                            <td className="px-3 py-3">
                              <StatusBadge status={r.status} />
                            </td>
                            <td className="px-6 py-3 text-right font-medium tabular-nums">
                              {formatPHP(r.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {["Membership form", "Valid ID", "Barangay clearance"].map((d) => (
                    <div
                      key={d}
                      className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/30"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{d}.pdf</div>
                        <div className="text-xs text-muted-foreground">
                          Uploaded {formatDate(member.joinedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {portalEnabled ? (
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
                Portal access enabled
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnablePortal}
                disabled={enabling}
                className="gap-1.5"
              >
                {enabling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enable portal access
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={handleArchive}
              disabled={archiving || member.status === "archived"}
            >
              {archiving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              {member.status === "archived" ? "Archived" : "Archive member"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="break-words text-sm">{value}</div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}

function EditMemberDialog({ member }: { member: MemberDTO }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone);
  const [address, setAddress] = useState(member.address);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      return toast.error("First and last name are required.");
    }
    setSaving(true);
    try {
      await updateMember({
        data: {
          id: member.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
      });
      toast.success("Member updated.");
      setOpen(false);
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update member.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit member</DialogTitle>
          <DialogDescription>Update this member's contact details.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>First name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Last name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
