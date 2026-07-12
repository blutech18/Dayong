import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ConsentDialog } from "@/components/consent-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create account — DAYONG" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join the DAYONG community management platform.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => {
            toast.success("Account created", {
              description: "Check your email to verify your address.",
            });
            navigate({ to: "/auth/login" });
          }, 600);
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>First name</Label>
            <Input placeholder="Maria" className="bg-transparent" required />
          </div>
          <div className="grid gap-2">
            <Label>Last name</Label>
            <Input placeholder="Dela Cruz" className="bg-transparent" required />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Email address</Label>
          <Input type="email" placeholder="you@example.com" className="bg-transparent" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input type="password" placeholder="8+ chars" className="bg-transparent" required />
          </div>
          <div className="grid gap-2">
            <Label>Confirm password</Label>
            <Input type="password" placeholder="Repeat" className="bg-transparent" required />
          </div>
        </div>

        <div className="flex items-start gap-3 pt-1 text-xs text-muted-foreground">
          <Checkbox
            id="agree"
            className="mt-0.5"
            checked={agreed}
            onClick={(e) => {
              // Ticking must go through the review modal; unticking is free.
              if (!agreed) {
                e.preventDefault();
                setConsentOpen(true);
              }
            }}
            onCheckedChange={(checked) => {
              if (!checked) setAgreed(false);
            }}
          />
          <span className="leading-relaxed">
            I agree to the DAYONG{" "}
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-foreground"
            >
              terms of service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-foreground"
            >
              privacy policy
            </Link>
            .
          </span>
        </div>

        <Button type="submit" size="lg" className="w-full mt-2" disabled={loading || !agreed}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <ConsentDialog
        open={consentOpen}
        onOpenChange={setConsentOpen}
        onAccept={() => setAgreed(true)}
      />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-foreground underline hover:text-primary transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
