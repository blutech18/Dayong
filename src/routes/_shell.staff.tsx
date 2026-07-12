import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  Users as UsersIcon,
  Mail,
  MailPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatDate } from "@/lib/format";
import {
  getStaff,
  setStaffStatus,
  resetStaffPassword,
  type StaffDTO,
} from "@/server/functions/staff";
import { createStaffAccount } from "@/server/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Role = StaffDTO["role"];

export const Route = createFileRoute("/_shell/staff")({
  head: () => ({ meta: [{ title: "Staff & Roles — DAYONG" }] }),
  loader: () => getStaff(),
  component: StaffPage,
});

const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  treasurer: "Treasurer",
  collector: "Collector",
  secretary: "Secretary",
  viewer: "Viewer",
  member: "Member",
};

const roleTone: Record<Role, string> = {
  admin: "bg-primary/15 text-primary",
  treasurer: "bg-emerald-500/15 text-emerald-500",
  collector: "bg-sky-500/15 text-sky-500",
  secretary: "bg-violet-500/15 text-violet-500",
  viewer: "bg-muted text-muted-foreground",
  member: "bg-muted text-muted-foreground",
};

const statusTone: Record<StaffDTO["status"], string> = {
  active: "bg-emerald-500/15 text-emerald-500",
  invited: "bg-amber-500/15 text-amber-500",
  inactive: "bg-muted text-muted-foreground",
  disabled: "bg-muted text-muted-foreground",
};

// Reference permission sets shown in the side panel.
const rolePermissions: Record<string, string[]> = {
  admin: [
    "Manage members",
    "Approve assistance",
    "Manage staff",
    "Edit settings",
    "View audit logs",
    "Manage finances",
  ],
  treasurer: ["Record contributions", "Manage finances", "Generate reports", "View members"],
  collector: ["Record contributions", "View assigned members", "Manage own events"],
  secretary: ["Manage announcements", "Manage documents", "View members"],
  viewer: ["View reports", "View members (read-only)"],
};

function StaffPage() {
  const staffMembers = Route.useLoaderData();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("collector");
  const [inviting, setInviting] = useState(false);

  const filtered = staffMembers.filter((s) => {
    if (!q) return true;
    return (s.name + s.email).toLowerCase().includes(q.toLowerCase());
  });

  const activeCount = staffMembers.filter((s) => s.status === "active").length;
  const invitedCount = staffMembers.filter((s) => s.status === "invited").length;
  const adminCount = staffMembers.filter((s) => s.role === "admin").length;

  async function handleResetPassword(email: string) {
    try {
      await resetStaffPassword({ data: { email } });
      toast.success("Password reset email sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email.");
    }
  }

  async function handleToggleStatus(s: StaffDTO) {
    try {
      await setStaffStatus({
        data: { id: s.id, status: s.status === "disabled" ? "active" : "disabled" },
      });
      toast.success(s.status === "disabled" ? "Account enabled." : "Account disabled.");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update account.");
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error("Enter the staff member's name and email.");
      return;
    }
    setInviting(true);
    try {
      await createStaffAccount({
        data: { email: inviteEmail.trim(), name: inviteName.trim(), role: inviteRole },
      });
      toast.success("Invitation sent", {
        description: "They'll receive an email to set their password.",
      });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("collector");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Roles"
        description="Manage team members, invite collaborators, and configure role-based access."
        actions={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Invite staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a staff member</DialogTitle>
                <DialogDescription>
                  They'll receive an email to set up their account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-1.5">
                  <Label>Email address</Label>
                  <Input
                    type="email"
                    placeholder="staff@dayong.org"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Full name</Label>
                  <Input
                    placeholder="Juan Dela Cruz"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Assign role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(roleLabels) as Role[])
                        .filter((k) => k !== "member")
                        .map((k) => (
                          <SelectItem key={k} value={k}>
                            {roleLabels[k]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>
                  Cancel
                </Button>
                <Button className="gap-1.5" onClick={handleInvite} disabled={inviting}>
                  <MailPlus className="h-4 w-4" /> Send invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total staff"
          value={String(staffMembers.length)}
          icon={UsersIcon}
          tone="primary"
        />
        <StatCard label="Active" value={String(activeCount)} icon={ShieldCheck} tone="success" />
        <StatCard label="Pending invites" value={String(invitedCount)} icon={Mail} tone="warning" />
        <StatCard label="Administrators" value={String(adminCount)} icon={Shield} tone="muted" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="font-display text-sm font-semibold">Team members</h3>
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search team..."
                className="h-9 w-full rounded-lg border border-input bg-muted/30 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last active</th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="group hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{s.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                          roleTone[s.role],
                        )}
                      >
                        {roleLabels[s.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold capitalize",
                          statusTone[s.status],
                        )}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.lastActive ? formatDate(s.lastActive) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            aria-label="Row actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to="/staff/$id" params={{ id: s.id }}>
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleResetPassword(s.email)}>
                            Reset password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={s.status === "disabled" ? "" : "text-destructive"}
                            onSelect={() => handleToggleStatus(s)}
                          >
                            {s.status === "disabled" ? "Enable account" : "Disable account"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h3 className="font-display text-sm font-semibold">Roles & permissions</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Default permission set for each role.
            </p>
          </div>
          <div className="divide-y divide-border">
            {Object.entries(rolePermissions).map(([role, perms]) => (
              <div key={role} className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                      roleTone[role as Role],
                    )}
                  >
                    {roleLabels[role as Role]}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {perms.map((p) => (
                    <li key={p} className="flex items-start gap-1.5">
                      <ShieldCheck className="mt-0.5 h-3 w-3 text-emerald-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
