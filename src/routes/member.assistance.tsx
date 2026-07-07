import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/member/assistance")({
  head: () => ({ meta: [{ title: "My Assistance — DAYONG" }] }),
  component: MemberAssistance,
});

function MemberAssistance() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Assistance Requests</h1>
          <p className="text-sm text-muted-foreground">Track your applications for financial or medical aid.</p>
        </div>
        <Button className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Apply for Assistance
        </Button>
      </div>

      <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-24 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground mb-4">
          <HeartPulseIcon className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-lg">No assistance requests</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          You haven't applied for any assistance yet. When you do, you can track the approval status here.
        </p>
        <Button variant="outline" className="mt-6">
          Learn about Assistance Programs
        </Button>
      </div>
    </div>
  );
}

function HeartPulseIcon(props: any) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}
