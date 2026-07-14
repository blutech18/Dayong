import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CalendarDays,
  HeartHandshake,
  Landmark,
  FolderOpen,
  Megaphone,
  BarChart3,
  Bell,
  ScrollText,
  Settings,
  UserCircle,
  Shield,
  UsersRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groupsTemplate = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Members & Collections",
    items: [
      { to: "/members", label: "Members", icon: Users, badgeId: "members", badgeCount: "48" },
      { to: "/contributions", label: "Contributions", icon: Wallet },
      { to: "/collection-events", label: "Collection Events", icon: CalendarDays },
    ],
  },
  {
    label: "Assistance",
    items: [{ to: "/assistance", label: "Assistance Requests", icon: HeartHandshake, badgeId: "assistance", badgeCount: "6" }],
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
      { to: "/audit", label: "Audit Logs", icon: ScrollText },
    ],
  },
] as const;

export function AppSidebar({
  open,
  onClose,
  onToggleCollapse,
}: {
  open: boolean;
  onClose: () => void;
  onToggleCollapse?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);
  const [seen, setSeen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    setSeen({
      members: localStorage.getItem("seen-members") === "true",
      assistance: localStorage.getItem("seen-assistance") === "true",
    });
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/members") && !seen.members) {
      localStorage.setItem("seen-members", "true");
      setSeen((s) => ({ ...s, members: true }));
    }
    if (pathname.startsWith("/assistance") && !seen.assistance) {
      localStorage.setItem("seen-assistance", "true");
      setSeen((s) => ({ ...s, assistance: true }));
    }
  }, [pathname, seen]);

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
          "w-72 [.sidebar-collapsed_&]:w-[4.5rem]",
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border pl-5">
          <img
            src="/dayong.png"
            alt="Pagtukaw Lifecare Philippines logo"
            className="h-8 w-8 shrink-0 object-contain"
          />
          <div className="flex flex-col min-w-0 overflow-hidden transition-all duration-300 w-[200px] opacity-100 ml-3 [.sidebar-collapsed_&]:w-0 [.sidebar-collapsed_&]:opacity-0 [.sidebar-collapsed_&]:ml-0">
            <div className="truncate text-sm font-semibold tracking-tight">Pagtukaw Lifecare</div>
            <div className="truncate text-[11px] text-sidebar-foreground/70 dark:text-muted-foreground">
              Member Assistance System
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {groupsTemplate.map((group) => (
            <div key={group.label} className="mb-3">
              <div className="relative mb-1 mt-3 px-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/70 dark:text-muted-foreground/80 overflow-hidden whitespace-nowrap transition-all duration-300 max-w-[200px] opacity-100 [.sidebar-collapsed_&]:max-w-0 [.sidebar-collapsed_&]:opacity-0">
                  {group.label}
                </div>
                <div className="absolute left-5 top-1/2 w-6 -translate-x-1/2 -translate-y-1/2 border-t border-sidebar-border opacity-0 transition-opacity duration-300 [.sidebar-collapsed_&]:opacity-100 pointer-events-none" />
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.to ||
                    (item.to !== "/dashboard" && pathname.startsWith(item.to));
                  const Icon = item.icon;
                  
                  let badge = null;
                  if ("badgeId" in item && mounted) {
                    if (!seen[item.badgeId]) badge = item.badgeCount;
                  }

                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center rounded-lg h-10 text-sm font-medium relative overflow-hidden transition-all duration-300",
                          "w-full [.sidebar-collapsed_&]:w-10",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                        )}
                      >
                        <div className="flex w-10 shrink-0 items-center justify-center">
                          {/* Icon inherits the link's text color (white when
                              active, off-white otherwise) for proper contrast. */}
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex items-center overflow-hidden transition-all duration-300 flex-1 opacity-100 pr-3 [.sidebar-collapsed_&]:w-0 [.sidebar-collapsed_&]:opacity-0">
                          <span className="flex-1 truncate">{item.label}</span>
                          {badge && (
                            <span
                              className={cn(
                                "ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                                active
                                  ? "bg-sidebar-accent-foreground/20 text-sidebar-accent-foreground"
                                  : "bg-sidebar-foreground/15 text-sidebar-foreground/80",
                              )}
                            >
                              {badge}
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
            <ChevronLeft className="h-4 w-4 block [.sidebar-collapsed_&]:hidden" />
            <ChevronRight className="h-4 w-4 hidden [.sidebar-collapsed_&]:block" />
          </button>
        )}
      </aside>
    </>
  );
}
