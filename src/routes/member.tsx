import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, CreditCard, HeartPulse, User } from "lucide-react";
import { redirect } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";
import { logout } from "@/server/auth";

export const Route = createFileRoute("/member")({
  beforeLoad: async () => {
    const user = await requireAuth();
    // Staff/admin accounts belong in the back-office, not the member portal.
    if (user.role !== "member") {
      throw redirect({ to: "/dashboard" });
    }
    return { user };
  },
  component: MemberShell,
});

function MemberShell() {
  const navigate = useNavigate();
  const navItems = [
    { name: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
    { name: "My Contributions", href: "/member/contributions", icon: CreditCard },
    { name: "My Assistance", href: "/member/assistance", icon: HeartPulse },
    { name: "My Profile", href: "/member/profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
              D
            </div>
            <span className="font-display font-semibold tracking-tight">DAYONG Member Portal</span>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              await navigate({ to: "/auth/login" });
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:flex-row md:p-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row overflow-x-auto gap-2 md:flex-col md:gap-1 pb-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
