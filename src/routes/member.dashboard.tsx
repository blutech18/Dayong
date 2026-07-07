import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CreditCard, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/member/dashboard")({
  head: () => ({ meta: [{ title: "Member Dashboard — DAYONG" }] }),
  component: MemberDashboard,
});

function MemberDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back, Juan!</h1>
        <p className="text-sm text-muted-foreground">Here is your membership overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Status</h3>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-green-500">Active</div>
          <p className="text-xs text-muted-foreground">Member since 2022</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Outstanding Balance</h3>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">₱0.00</div>
          <p className="text-xs text-muted-foreground">Up to date on contributions</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending Assistance</h3>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">No active requests</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Bell className="h-4 w-4" /> Recent Announcements</h2>
          <div className="space-y-4">
            <div className="border-b pb-4 last:border-0 last:pb-0">
              <h4 className="font-medium">Upcoming Monthly Meeting</h4>
              <p className="text-sm text-muted-foreground mt-1">Please join us for the monthly general assembly this coming Sunday.</p>
            </div>
            <div className="border-b pb-4 last:border-0 last:pb-0">
              <h4 className="font-medium">New Bereavement Assistance Policy</h4>
              <p className="text-sm text-muted-foreground mt-1">We have updated the document requirements for bereavement claims.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">Quick Actions</h2>
          <Button asChild className="w-full justify-between h-auto p-4" variant="outline">
            <Link to="/member/assistance">
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">Request Assistance</span>
                <span className="text-xs text-muted-foreground font-normal">Apply for medical, bereavement, or other assistance</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild className="w-full justify-between h-auto p-4" variant="outline">
            <Link to="/member/contributions">
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">View Contribution Ledger</span>
                <span className="text-xs text-muted-foreground font-normal">Check your payment history and printable receipts</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
