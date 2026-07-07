import { useEffect, useState } from "react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { CommandPalette } from "@/components/command-palette";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";

// MOCK AUTH: In a real app, you would check a real auth provider here.
// For the prototype, we assume if they hit a shell route, they are logged in.
const isAuthenticated = () => true; 

export const Route = createFileRoute("/_shell")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: ShellLayout,
});

function ShellLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);

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
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
        <AppTopbar 
          onOpenSidebar={() => setOpen(true)} 
        />
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
      <CommandPalette onOpenShortcuts={() => setShortcuts(true)} />
      <ShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
    </div>
  );
}
