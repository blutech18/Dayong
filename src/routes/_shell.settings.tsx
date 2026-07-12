import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  Building2,
  Bell,
  ShieldCheck,
  Palette,
  Database,
  Mail,
  KeyRound,
  Users2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/page-header";
import { getSettings, updateSettings } from "@/server/functions/settings";
import { getBackup, restoreBackup } from "@/server/functions/backup";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({ meta: [{ title: "Settings — DAYONG" }] }),
  loader: () => getSettings(),
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
  const settings = Route.useLoaderData();
  const router = useRouter();
  const [active, setActive] = useState<string>("organization");

  // Organization form
  const [orgName, setOrgName] = useState(settings.orgName);
  const [registrationNo, setRegistrationNo] = useState(settings.registrationNo);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);

  // Contribution form
  const [monthlyDues, setMonthlyDues] = useState(String(settings.monthlyDues));
  const [receiptPrefix, setReceiptPrefix] = useState(settings.receiptPrefix);

  const [saving, setSaving] = useState(false);

  async function save(patch: Parameters<typeof updateSettings>[0]["data"]) {
    setSaving(true);
    try {
      await updateSettings({ data: patch });
      toast.success("Settings saved.");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your organization, workflows, and system preferences."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card p-2">
          <nav className="space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active === s.key
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <s.icon className="h-4 w-4" /> {s.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          {active === "organization" && (
            <Section
              title="Organization profile"
              desc="Public information about your organization."
              saving={saving}
              onSave={() => save({ orgName, registrationNo, contactEmail, phone, address })}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Organization name" value={orgName} onChange={setOrgName} />
                <Field
                  label="Registration number"
                  value={registrationNo}
                  onChange={setRegistrationNo}
                />
                <Field label="Contact email" value={contactEmail} onChange={setContactEmail} />
                <Field label="Phone" value={phone} onChange={setPhone} />
                <Field
                  label="Address"
                  value={address}
                  onChange={setAddress}
                  className="md:col-span-2"
                />
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
            <Section
              title="Contribution settings"
              desc="Rates, receipts, and payment methods."
              saving={saving}
              onSave={() => save({ monthlyDues: parseFloat(monthlyDues) || 0, receiptPrefix })}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Monthly contribution amount"
                  value={monthlyDues}
                  onChange={setMonthlyDues}
                />
                <Field label="Receipt prefix" value={receiptPrefix} onChange={setReceiptPrefix} />
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
              ].map((l) => (
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
              <div className="rounded-xl border border-border p-6 text-center">
                <Users2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm">
                  Staff accounts and roles are managed on the dedicated page.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link to="/staff">Go to Staff &amp; Roles</Link>
                </Button>
              </div>
            </Section>
          )}
          {active === "email" && (
            <Section title="Email templates" desc="Customize outbound message templates.">
              <ul className="divide-y divide-border rounded-xl border border-border">
                {[
                  "Welcome email",
                  "Contribution receipt",
                  "Assistance approved",
                  "Password reset",
                ].map((t) => (
                  <li key={t} className="flex items-center justify-between p-3">
                    <div className="text-sm font-medium">{t}</div>
                    <Button size="sm" variant="outline">
                      Edit template
                    </Button>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {active === "backup" && <BackupSection />}
        </div>
      </div>
    </div>
  );
}

function BackupSection() {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function downloadBackup() {
    setDownloading(true);
    try {
      const json = await getBackup();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dayong-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Backup failed.");
    } finally {
      setDownloading(false);
    }
  }

  async function doRestore() {
    if (!file) return toast.error("Choose a backup file first.");
    setRestoring(true);
    try {
      const content = await file.text();
      const result = await restoreBackup({ data: { content } });
      const total = Object.values(result.restored).reduce((s, n) => s + n, 0);
      toast.success("Restore complete", { description: `${total} records restored.` });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restore failed.");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h3 className="font-display text-base font-semibold">Backup &amp; restore</h3>
        <p className="text-sm text-muted-foreground">
          Export all application data as a JSON file, or restore from a previous backup.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 text-sm font-medium">Backup</div>
          <Button size="sm" onClick={downloadBackup} disabled={downloading}>
            {downloading ? "Preparing…" : "Download backup"}
          </Button>
        </div>

        <div className="border-t border-border pt-5">
          <div className="mb-2 text-sm font-medium">Restore</div>
          <p className="mb-3 text-xs text-muted-foreground">
            Restoring replaces <span className="font-semibold text-destructive">all</span> current
            application data with the contents of the backup file. This cannot be undone.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="max-w-xs"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={!file || restoring}>
                  {restoring ? "Restoring…" : "Restore from file"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Replace all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all current members, contributions, assistance
                    records, and everything else, then load the backup file. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={doRestore}>Yes, restore</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
  onSave,
  saving,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="space-y-4">{children}</div>
      {onSave && (
        <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  defaultValue,
  value,
  onChange,
  className,
}: {
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      {onChange ? (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input defaultValue={defaultValue} />
      )}
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
