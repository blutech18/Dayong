import { createFileRoute } from "@tanstack/react-router";
import { Camera, KeyRound, Bell, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { auditLogs, formatDateTime } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/profile")({
  head: () => ({ meta: [{ title: "Profile — DAYONG" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Your profile" description="Manage your account details, credentials, and activity." />

      <div className="rounded-2xl border border-border bg-card">
        <Tabs defaultValue="profile">
          <div className="border-b border-border px-4">
            <TabsList className="h-11 bg-transparent p-0">
              <TabsTrigger value="profile" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Profile
              </TabsTrigger>
              <TabsTrigger value="password" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Password
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="p-6">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-lg font-semibold text-primary-foreground">AS</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border border-background bg-card shadow">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <FieldRow label="Full name" defaultValue="Admin Santos" />
                <FieldRow label="Role" defaultValue="Administrator" readOnly />
                <FieldRow label="Email" defaultValue="admin@dayong.org" type="email" />
                <FieldRow label="Phone" defaultValue="+63 917 555 0142" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="password" className="p-6">
            <div className="max-w-md space-y-4">
              <FieldRow label="Current password" type="password" />
              <FieldRow label="New password" type="password" />
              <FieldRow label="Confirm new password" type="password" />
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                Passwords should be at least 12 characters and include letters, numbers, and symbols.
              </div>
              <Button className="gap-1.5"><KeyRound className="h-4 w-4" />Update password</Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="p-6">
            <div className="space-y-3">
              {[
                "Email me for new assistance requests",
                "Notify me when contributions are recorded",
                "Weekly financial digest",
                "Announcements & policy updates",
              ].map(l => (
                <label key={l} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-sm"><Bell className="h-4 w-4 text-muted-foreground" />{l}</div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
                </label>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="p-6">
            <ol className="space-y-3">
              {auditLogs.slice(0, 6).map(l => (
                <li key={l.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm"><span className="font-medium">{l.action}</span> {l.target}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(l.createdAt)} · IP {l.ip}</div>
                  </div>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FieldRow({ label, defaultValue, type = "text", readOnly }: { label: string; defaultValue?: string; type?: string; readOnly?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} type={type} readOnly={readOnly} />
    </div>
  );
}
