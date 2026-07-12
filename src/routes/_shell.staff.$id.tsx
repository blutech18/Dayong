import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, Shield, ShieldCheck, KeyRound, Ban, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { formatDateTime } from "@/lib/format";
import {
  getStaffMember,
  setStaffStatus,
  setStaffRole,
  resetStaffPassword,
  type StaffMemberDetail,
} from "@/server/functions/staff";
import type { StaffDTO } from "@/server/functions/staff";
import { cn } from "@/lib/utils";

type Role = StaffDTO["role"];
const ROLE_OPTIONS: Role[] = ["admin", "treasurer", "collector", "secretary", "viewer"];

export const Route = createFileRoute("/_shell/staff/$id")({
  head: ({ params }) => ({ meta: [{ title: `Staff · ${params.id} — DAYONG` }] }),
  loader: async ({ params }): Promise<StaffMemberDetail> => {
    const detail = await getStaffMember({ data: params.id });
    if (!detail) throw notFound();
    return detail;
  },
  notFoundComponent: () => (
    <div className="p-8 text-sm text-muted-foreground">Staff member not found.</div>
  ),
  component: StaffDetail,
});

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  treasurer: "Treasurer",
  collector: "Collector",
  secretary: "Secretary",
  viewer: "Viewer",
  member: "Member",
};
const roleTone: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  treasurer: "bg-emerald-500/15 text-emerald-500",
  collector: "bg-sky-500/15 text-sky-500",
  secretary: "bg-violet-500/15 text-violet-500",
  viewer: "bg-muted text-muted-foreground",
  member: "bg-muted text-muted-foreground",
};

function StaffDetail() {
  const { staff, permissions: perms, activity } = Route.useLoaderData() as StaffMemberDetail;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isDisabled = staff.status === "disabled";

  async function resetPassword() {
    setBusy(true);
    try {
      await resetStaffPassword({ data: { email: staff.email } });
      toast.success("Password reset email sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(role: Role) {
    if (role === staff.role) return;
    setBusy(true);
    try {
      await setStaffRole({ data: { id: staff.id, role } });
      toast.success(`Role changed to ${roleLabels[role]}.`);
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change role.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus() {
    setBusy(true);
    try {
      await setStaffStatus({
        data: { id: staff.id, status: isDisabled ? "active" : "disabled" },
      });
      toast.success(isDisabled ? "Account enabled." : "Account disabled.");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-3 -ml-2 gap-1.5 text-muted-foreground"
        >
          <Link to="/staff">
            <ArrowLeft className="h-4 w-4" />
            All staff
          </Link>
        </Button>
        <PageHeader
          title={staff.name}
          description={`${roleLabels[staff.role]} · ${staff.email}`}
          actions={
            <div className="flex flex-wrap gap-2">
              <Select
                value={staff.role}
                onValueChange={(v) => changeRole(v as Role)}
                disabled={busy}
              >
                <SelectTrigger className="h-9 w-40" aria-label="Change role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabels[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={resetPassword}
                disabled={busy}
              >
                <KeyRound className="h-4 w-4" />
                Reset password
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={cn("gap-1.5", !isDisabled && "text-destructive hover:text-destructive")}
                onClick={toggleStatus}
                disabled={busy}
              >
                <Ban className="h-4 w-4" />
                {isDisabled ? "Enable" : "Disable"}
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-semibold">{staff.name}</div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "inline-flex rounded-md px-2 py-0.5 font-semibold",
                    roleTone[staff.role],
                  )}
                >
                  {roleLabels[staff.role]}
                </span>
                <span className="capitalize text-muted-foreground">· {staff.status}</span>
              </div>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <Row icon={Mail} label="Email" value={staff.email} />
            <Row
              icon={Clock}
              label="Last active"
              value={staff.lastActive ? formatDateTime(staff.lastActive) : "—"}
            />
            <Row icon={Shield} label="Phone" value={staff.phone} />
          </dl>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-display text-sm font-semibold">Role permissions</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Rights granted by the {roleLabels[staff.role]} role.
              </p>
            </div>
            <ul className="divide-y divide-border">
              {perms.map((p: string) => (
                <li key={p} className="flex items-center gap-2 px-4 py-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-display text-sm font-semibold">Recent activity</h3>
            </div>
            <ul className="divide-y divide-border">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 p-4 text-sm">
                  <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-muted">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{a.action}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {a.target} · {formatDateTime(a.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate text-sm">{value}</div>
      </div>
    </div>
  );
}
