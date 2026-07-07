import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Wallet, CalendarDays, HeartHandshake,
  Landmark, FolderOpen, Megaphone, BarChart3, Bell, ScrollText,
  Settings, UserCircle, Shield, Sparkles, UsersRound, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Members & Collections",
    items: [
      { to: "/members", label: "Members", icon: Users, badge: "48" },
      { to: "/contributions", label: "Contributions", icon: Wallet },
      { to: "/collection-events", label: "Collection Events", icon: CalendarDays },
    ],
  },
  {
    label: "Assistance",
    items: [
      { to: "/assistance", label: "Assistance Requests", icon: HeartHandshake, badge: "6" },
    ],
  },
  {
    label: "Finance & Records",
    items: [
      { to: "/financials", label: "Financial Management", icon: Landmark },
      { to: "/documents", label: "Documents", icon: FolderOpen },
      { to: "/announcements", label: "Announcements", icon: Megaphone },
      { to: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/staff", label: "Staff & Roles", icon: UsersRound },
      { to: "/notifications", label: "Notifications", icon: Bell, badge: "3" },
      { to: "/audit", label: "Audit Logs", icon: ScrollText },
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/profile", label: "Profile", icon: UserCircle },
    ],
  },
] as const;

export function AppSidebar({ open, onClose, collapsed, onToggleCollapse }: { open: boolean; onClose: () => void; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:sticky lg:top-0 lg:h-screen",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-[4.5rem]" : "w-72"
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border pl-5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className={cn("flex flex-col min-w-0 overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0 ml-0" : "w-[200px] opacity-100 ml-3")}>
            <div className="truncate text-sm font-semibold tracking-tight">DAYONG</div>
            <div className="truncate text-[11px] text-muted-foreground">Member Assistance System</div>
          </div>
        </div>

        <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="relative mb-2 mt-4 px-2">
                <div className={cn("text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 overflow-hidden whitespace-nowrap transition-all duration-300", collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100")}>
                  {group.label}
                </div>
                {collapsed && <div className="absolute left-1/2 top-1/2 w-6 -translate-x-1/2 -translate-y-1/2 border-t border-sidebar-border" />}
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.to ||
                    (item.to !== "/dashboard" && pathname.startsWith(item.to));
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors relative",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                        )}
                      >
                        <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
                        <div className={cn("flex flex-1 items-center overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3")}>
                          <span className="flex-1 truncate">{item.label}</span>
                          {"badge" in item && item.badge && (
                            <span className={cn(
                              "ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                              active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-3.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-background text-foreground shadow-sm transition-transform duration-300 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring lg:flex z-50"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </aside>
    </>
  );
}
