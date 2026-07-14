import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { QrCode, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyMemberProfile, updateMyMemberProfile } from "@/server/functions/member-portal";

export const Route = createFileRoute("/member/profile")({
  head: () => ({ meta: [{ title: "My Profile — Pagtukaw Lifecare" }] }),
  loader: () => getMyMemberProfile(),
  component: MemberProfile,
});

function MemberProfile() {
  const member = Route.useLoaderData();
  const router = useRouter();

  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone);
  const [address, setAddress] = useState(member.address);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      return toast.error("First and last name are required.");
    }
    setSaving(true);
    try {
      await updateMyMemberProfile({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
      });
      toast.success("Profile updated.");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and digital ID.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Personal Details</h3>
            <form className="space-y-4" onSubmit={save}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="gap-1.5">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mb-4">
              <User className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">Member ID: {member.memberNo}</p>

            <div className="mt-6 w-full pt-6 border-t flex flex-col items-center">
              <QrCode className="h-32 w-32 text-foreground mb-4 opacity-80" />
              <p className="text-xs text-muted-foreground mb-4">Scan for digital verification</p>
              <Button variant="outline" className="w-full">
                Download Digital ID
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
