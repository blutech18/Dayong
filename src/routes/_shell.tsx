import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { CommandPalette } from "@/components/command-palette";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";
import { requireRole, STAFF_ROLES } from "@/lib/auth-guard";

export const Route = createFileRoute("/_shell")({
  // Only staff/admin roles may access the back-office shell.
  beforeLoad: async () => {
    const user = await requireRole(STAFF_ROLES);
    return { user };
  },
  component: ShellLayout,
});

function ShellLayout() {
  const [open, setOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);

  const handleToggleCollapse = () => {
    const root = document.documentElement;
    const isCollapsed = root.classList.toggle("sidebar-collapsed");
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      const typing =
        t instanceof HTMLElement &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (typing) return;
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setShortcuts(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar
        open={open}
        onClose={() => setOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
        <AppTopbar onOpenSidebar={() => setOpen(true)} />
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
      <CommandPalette onOpenShortcuts={() => setShortcuts(true)} />
      <ShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
    </div>
  );
}
