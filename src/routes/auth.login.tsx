import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — DAYONG" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to your DAYONG workspace.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); nav({ to: "/dashboard" }); }}
        className="space-y-6"
      >
        <div className="grid gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="admin@dayong.org" defaultValue="admin@dayong.org" className="bg-transparent" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pwd">Password</Label>
            <Link to="/auth/forgot-password" className="text-xs font-medium text-foreground underline hover:text-primary transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input id="pwd" type={show ? "text" : "password"} defaultValue="••••••••" className="bg-transparent" />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-muted-foreground pt-1">
          <Checkbox defaultChecked /> Keep me signed in
        </label>

        <Button size="lg" className="w-full mt-2" type="submit">
          Sign in
        </Button>

        <p className="pt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/auth/signup" className="font-medium text-foreground underline hover:text-primary transition-colors">Create one</Link>
        </p>
      </form>
    </div>
  );
}
