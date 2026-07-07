import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create account — DAYONG" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Join the DAYONG community management platform.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => {
            toast.success("Account created", { description: "Check your email to verify your address." });
            navigate({ to: "/auth/login" });
          }, 600);
        }}
        className="space-y-5"
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
        <div className="grid gap-2">
          <Label>Password</Label>
          <Input type="password" placeholder="At least 8 characters" className="bg-transparent" required />
        </div>
        <div className="grid gap-2">
          <Label>Confirm password</Label>
          <Input type="password" placeholder="Repeat password" className="bg-transparent" required />
        </div>
        <label className="flex items-start gap-3 text-xs text-muted-foreground pt-2">
          <Checkbox className="mt-0.5" required />
          <span className="leading-relaxed">I agree to the DAYONG <a className="underline hover:text-foreground cursor-pointer transition-colors">terms of service</a> and <a className="underline hover:text-foreground cursor-pointer transition-colors">privacy policy</a>.</span>
        </label>
        <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="font-medium text-foreground underline hover:text-primary transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
