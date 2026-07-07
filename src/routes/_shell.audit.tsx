import { createFileRoute } from "@tanstack/react-router";
import {
  Search, Download, Shield, LogIn, User, Wallet, FileText, HeartHandshake, Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { auditLogs, formatDateTime } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const categoryIcon = {
  auth: LogIn, member: User, payment: Wallet, assistance: HeartHandshake,
  document: FileText, settings: Settings2,
} as const;

const categoryTone = {
  auth: "bg-info/15 text-info",
  member: "bg-primary/15 text-primary",
  payment: "bg-secondary/15 text-secondary",
  assistance: "bg-warning/15 text-warning",
  document: "bg-muted text-muted-foreground",
  settings: "bg-accent text-accent-foreground",
} as const;

export const Route = createFileRoute("/_shell/audit")({
  head: () => ({ meta: [{ title: "Audit Logs — DAYONG" }] }),
  component: AuditPage,
});

function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Every important action in the system, timestamped and attributed."
        actions={<Button size="sm" variant="outline" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>}
      />

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search actions, actors, targets…" className="h-9 w-full rounded-lg border border-input bg-muted/30 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            Retention: 12 months
          </div>
        </div>

        <ol className="relative divide-y divide-border">
          {auditLogs.slice(0, 20).map(l => {
            const Icon = categoryIcon[l.category];
            return (
              <li key={l.id} className="flex items-start gap-4 p-4">
                <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", categoryTone[l.category])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{l.actor}</span>{" "}
                    <span className="text-muted-foreground">{l.action}</span>{" "}
                    <span className="font-medium">{l.target}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(l.createdAt)} · IP {l.ip} · <span className="capitalize">{l.category}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
