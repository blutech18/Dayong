import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { KeyRound, Bell, Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { formatDateTime } from "@/lib/format";
import { getProfilePage, updateMyProfile } from "@/server/functions/profile";
import { updatePassword } from "@/server/auth";

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  treasurer: "Treasurer",
  collector: "Collector",
  secretary: "Secretary",
  viewer: "Viewer",
  member: "Member",
};

export const Route = createFileRoute("/_shell/profile")({
  head: () => ({ meta: [{ title: "Profile — Pagtukaw Lifecare" }] }),
  loader: () => getProfilePage(),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, activity } = Route.useLoaderData();
  const router = useRouter();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  async function saveProfile() {
    if (!name.trim()) return toast.error("Name is required.");
    setSavingProfile(true);
    try {
      await updateMyProfile({ data: { name: name.trim(), phone: phone.trim() } });
      toast.success("Profile updated.");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (newPwd.length < 8) return toast.error("Password must be at least 8 characters.");
    if (newPwd !== confirmPwd) return toast.error("Passwords do not match.");
    setSavingPwd(true);
    try {
      await updatePassword({ data: { password: newPwd } });
      toast.success("Password updated.");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setSavingPwd(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your profile"
        description="Manage your account details, credentials, and activity."
      />

      <div className="rounded-2xl border border-border bg-card">
        <Tabs defaultValue="profile">
          <div className="border-b border-border px-4">
            <TabsList className="h-11 bg-transparent p-0">
              <TabsTrigger
                value="profile"
                className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Password
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="p-6">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Full name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Role</Label>
                  <Input value={roleLabels[profile.role] ?? profile.role} readOnly />
                </div>
                <div className="grid gap-1.5">
                  <Label>Email</Label>
                  <Input value={profile.email} type="email" readOnly />
                </div>
                <div className="grid gap-1.5">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setName(profile.name);
                  setPhone(profile.phone);
                }}
                disabled={savingProfile}
              >
                Reset
              </Button>
              <Button onClick={saveProfile} disabled={savingProfile} className="gap-1.5">
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}Save changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="password" className="p-6">
            <div className="max-w-md space-y-4">
              <div className="grid gap-1.5">
                <Label>New password</Label>
                <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                Passwords should be at least 8 characters and include letters, numbers, and symbols.
              </div>
              <Button onClick={changePassword} disabled={savingPwd} className="gap-1.5">
                {savingPwd ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Update password
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="p-6">
            <div className="space-y-3">
              {[
                "Email me for new assistance requests",
                "Notify me when contributions are recorded",
                "Weekly financial digest",
                "Announcements & policy updates",
              ].map((l) => (
                <label
                  key={l}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    {l}
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
                </label>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="p-6">
            {activity.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent activity.
              </div>
            ) : (
              <ol className="space-y-3">
                {activity.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{l.action}</span> {l.target}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(l.createdAt)} · IP {l.ip}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
