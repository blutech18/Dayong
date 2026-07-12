import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [{ title: "System Maintenance — DAYONG" }, { name: "robots", content: "noindex" }],
  }),
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-warning/15 text-warning">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">We'll be right back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          DAYONG is undergoing scheduled maintenance. Contributions, requests, and reports will be
          available again shortly. Thank you for your patience.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/">Try again</Link>
          </Button>
          <Button asChild>
            <a href="mailto:admin@dayong.org">Contact admin</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
