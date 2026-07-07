import { createFileRoute } from "@tanstack/react-router";
import { QrCode, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/member/profile")({
  head: () => ({ meta: [{ title: "My Profile — DAYONG" }] }),
  component: MemberProfile,
});

function MemberProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information and digital ID.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Personal Details</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Juan" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Dela Cruz" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="juan.delacruz@example.com" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+63 912 345 6789" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Example St., Brgy. San Juan" />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mb-4">
              <User className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg">Juan Dela Cruz</h3>
            <p className="text-sm text-muted-foreground">Member ID: DY-10023</p>
            
            <div className="mt-6 w-full pt-6 border-t flex flex-col items-center">
              <QrCode className="h-32 w-32 text-foreground mb-4 opacity-80" />
              <p className="text-xs text-muted-foreground mb-4">Scan for digital verification</p>
              <Button variant="outline" className="w-full">Download Digital ID</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
