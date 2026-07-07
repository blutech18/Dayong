import { createFileRoute } from "@tanstack/react-router";
import {
  Building2, Bell, ShieldCheck, Palette, Database, Mail, KeyRound, Users2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({ meta: [{ title: "Settings — DAYONG" }] }),
  component: SettingsPage,
});

const sections = [
  { key: "organization", label: "Organization", icon: Building2 },
  { key: "general", label: "General", icon: Palette },
  { key: "contributions", label: "Contributions", icon: KeyRound },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "staff", label: "Staff & Roles", icon: Users2 },
  { key: "email", label: "Email templates", icon: Mail },
  { key: "backup", label: "Backup & Restore", icon: Database },
] as const;

function SettingsPage() {
  const [active, setActive] = useState<string>("organization");
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your organization, workflows, and system preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card p-2">
          <nav className="space-y-0.5">
            {sections.map(s => (
              <button key={s.key} onClick={() => setActive(s.key)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active === s.key ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}>
                <s.icon className="h-4 w-4" /> {s.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          {active === "organization" && (
            <Section title="Organization profile" desc="Public information about your organization.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Organization name" defaultValue="DAYONG Neighborhood Mutual Aid" />
                <Field label="Registration number" defaultValue="CDA-2019-04021" />
                <Field label="Contact email" defaultValue="hello@dayong.org" />
                <Field label="Phone" defaultValue="+63 917 555 0142" />
                <Field label="Address" defaultValue="Barangay San Roque, Quezon City" className="md:col-span-2" />
              </div>
            </Section>
          )}
          {active === "general" && (
            <Section title="Appearance & general" desc="Theme, currency, and locale defaults.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Currency" defaultValue="Philippine Peso (PHP)" />
                <Field label="Time zone" defaultValue="Asia/Manila (UTC+8)" />
                <Toggle label="Enable dark mode by default" defaultChecked />
                <Toggle label="Compact table density" />
              </div>
            </Section>
          )}
          {active === "contributions" && (
            <Section title="Contribution settings" desc="Rates, receipts, and payment methods.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Monthly contribution amount" defaultValue="500" />
                <Field label="Receipt prefix" defaultValue="OR-" />
                <Toggle label="Auto-generate receipts" defaultChecked />
                <Toggle label="Allow partial payments" defaultChecked />
                <Toggle label="Accept GCash payments" defaultChecked />
                <Toggle label="Accept bank transfers" defaultChecked />
              </div>
            </Section>
          )}
          {active === "notifications" && (
            <Section title="Notification preferences" desc="Choose what triggers alerts.">
              {[
                "Email me for new assistance requests",
                "Notify me when contributions are recorded",
                "Send weekly cash-flow digest",
                "Alert on failed sign-in attempts",
              ].map(l => (
                <Toggle key={l} label={l} defaultChecked />
              ))}
            </Section>
          )}
          {active === "security" && (
            <Section title="Security" desc="Protect your organization's data.">
              <div className="grid gap-4">
                <Toggle label="Require two-factor authentication" defaultChecked />
                <Toggle label="Lock account after 5 failed sign-in attempts" defaultChecked />
                <Field label="Session timeout (minutes)" defaultValue="30" />
              </div>
            </Section>
          )}
          {active === "staff" && (
            <Section title="Staff & roles" desc="Manage staff accounts and role permissions.">
              <div className="rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Role</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { n: "Admin Santos", e: "admin@dayong.org", r: "Administrator" },
                      { n: "Staff Reyes", e: "reyes@dayong.org", r: "Staff" },
                      { n: "Staff Cruz", e: "cruz@dayong.org", r: "Staff" },
                    ].map(s => (
                      <tr key={s.e}>
                        <td className="px-4 py-2 font-medium">{s.n}</td>
                        <td className="px-3 py-2 text-muted-foreground">{s.e}</td>
                        <td className="px-3 py-2">{s.r}</td>
                        <td className="px-3 py-2"><span className="inline-flex items-center rounded-md bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
          {active === "email" && (
            <Section title="Email templates" desc="Customize outbound message templates.">
              <ul className="divide-y divide-border rounded-xl border border-border">
                {["Welcome email", "Contribution receipt", "Assistance approved", "Password reset"].map(t => (
                  <li key={t} className="flex items-center justify-between p-3">
                    <div className="text-sm font-medium">{t}</div>
                    <Button size="sm" variant="outline">Edit template</Button>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {active === "backup" && (
            <Section title="Backup & restore" desc="Nightly encrypted backups, retained for 30 days.">
              <div className="grid gap-3">
                <Toggle label="Enable nightly automatic backups" defaultChecked />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Download latest backup</Button>
                  <Button size="sm">Run backup now</Button>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm">Save changes</Button>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, className }: { label: string; defaultValue?: string; className?: string }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="text-sm">{label}</div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
