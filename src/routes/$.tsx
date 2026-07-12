import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [{ title: "Page not found — DAYONG" }, { name: "robots", content: "noindex" }],
  }),
  component: NotFoundPage,
});

function NotFoundPage() {
  const { _splat } = Route.useParams();
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-8 w-8" />
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          404 · Not found
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold">We couldn't find that page</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The path <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/{_splat}</code> doesn't
          match any route in DAYONG. It may have been moved or renamed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button asChild className="gap-1.5">
            <Link to="/dashboard">
              <Home className="h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Landing page</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
