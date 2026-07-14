import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forbidden")({
  head: () => ({
    meta: [{ title: "Access denied — Pagtukaw Lifecare" }, { name: "robots", content: "noindex" }],
  }),
  component: ForbiddenPage,
});

function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="mt-4 font-display text-4xl font-bold tracking-tight">403</div>
        <h1 className="mt-2 font-display text-xl font-semibold tracking-tight">
          You don't have access to this page
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role doesn't include permission for this resource. If you believe this is a mistake,
          contact your administrator.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/profile">View my profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
