import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — Pagtukaw Lifecare" }] }),
  component: ResetPage,
});

function ResetPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong password to secure your account.
        </p>
      </div>
      <form className="space-y-4">
        <div className="grid gap-1.5">
          <Label>New password</Label>
          <Input type="password" placeholder="At least 12 characters" />
        </div>
        <div className="grid gap-1.5">
          <Label>Confirm password</Label>
          <Input type="password" placeholder="Re-enter password" />
        </div>
        <ul className="space-y-1 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-success" />
            At least 12 characters
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-success" />
            Mix of letters, numbers, and symbols
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
            Not used on other sites
          </li>
        </ul>
        <Button className="w-full gap-2">
          <KeyRound className="h-4 w-4" />
          Update password
        </Button>
      </form>
      <div className="mt-6 text-center">
        <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
