import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, Shield, ShieldCheck, KeyRound, Ban, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { staffMembers, rolePermissions, auditLogs, formatDate, formatDateTime, initialsOf, type StaffMember } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/staff/$id")({
  head: ({ params }) => ({ meta: [{ title: `Staff · ${params.id} — DAYONG` }] }),
  loader: ({ params }) => {
    const staff = staffMembers.find((s) => s.id === params.id);
    if (!staff) throw notFound();
    return { staff };
  },
  notFoundComponent: () => (
    <div className="p-8 text-sm text-muted-foreground">Staff member not found.</div>
  ),
  component: StaffDetail,
});

const roleLabels: Record<string, string> = {
  admin: "Administrator", treasurer: "Treasurer", collector: "Collector",
  secretary: "Secretary", viewer: "Viewer",
};
const roleTone: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  treasurer: "bg-emerald-500/15 text-emerald-500",
  collector: "bg-sky-500/15 text-sky-500",
  secretary: "bg-violet-500/15 text-violet-500",
  viewer: "bg-muted text-muted-foreground",
};

function StaffDetail() {
  const { staff } = Route.useLoaderData() as { staff: StaffMember };
  const perms: string[] = rolePermissions[staff.role];
  const activity = auditLogs.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 gap-1.5 text-muted-foreground">
          <Link to="/staff"><ArrowLeft className="h-4 w-4" />All staff</Link>
        </Button>
        <PageHeader
          title={staff.name}
          description={`${roleLabels[staff.role]} · ${staff.email}`}
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5"><KeyRound className="h-4 w-4" />Reset password</Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive"><Ban className="h-4 w-4" />Disable</Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {initialsOf(staff.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-semibold">{staff.name}</div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className={cn("inline-flex rounded-md px-2 py-0.5 font-semibold", roleTone[staff.role])}>
                  {roleLabels[staff.role]}
                </span>
                <span className="capitalize text-muted-foreground">· {staff.status}</span>
              </div>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <Row icon={Mail} label="Email" value={staff.email} />
            <Row icon={Clock} label="Last active" value={formatDateTime(staff.lastActive)} />
            <Row icon={Shield} label="Phone" value={staff.phone} />
          </dl>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-display text-sm font-semibold">Role permissions</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Rights granted by the {roleLabels[staff.role]} role.</p>
            </div>
            <ul className="divide-y divide-border">
              {perms.map((p: string) => (
                <li key={p} className="flex items-center gap-2 px-4 py-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />{p}
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
                  <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-muted"><Activity className="h-4 w-4 text-muted-foreground" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{a.action}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.target} · {formatDateTime(a.createdAt)}</div>
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
