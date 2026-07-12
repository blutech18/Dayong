import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TermsContent, LEGAL_EFFECTIVE_DATE } from "@/lib/legal-content";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — DAYONG" }] }),
  component: TermsPage,
});

function TermsPage() {
  const navigate = useNavigate();

  // These pages are opened in a new tab from the sign-up form, so "back"
  // should close that tab. If the page was opened directly (no script opener,
  // so window.close() is a no-op), fall back to navigating to sign up.
  function handleBack() {
    window.close();
    setTimeout(() => {
      if (!window.closed) navigate({ to: "/auth/signup" });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <img src="/dayong.png" alt="DAYONG logo" className="h-10 w-10 shrink-0 object-contain" />
          <div>
            <div className="font-display text-base font-semibold tracking-tight">DAYONG</div>
            <div className="text-xs text-muted-foreground">Member Assistance System</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Terms of Service
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">Effective {LEGAL_EFFECTIVE_DATE}</p>

          <div className="mt-6">
            <TermsContent />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" className="gap-2" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to sign up
          </Button>
          <Link
            to="/privacy"
            className="text-sm font-medium text-foreground underline hover:text-primary"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
