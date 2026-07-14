import { useEffect, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { logout } from "@/server/auth";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  Plus,
  Command,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/server/functions/notifications";
import { getTheme, setTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/members": "Members",
  "/contributions": "Contributions",
  "/collection-events": "Collection Events",
  "/assistance": "Assistance Requests",
  "/financials": "Financial Management",
  "/documents": "Documents",
  "/announcements": "Announcements",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/audit": "Audit Logs",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function AppTopbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => setThemeState(getTheme()), []);

  const crumbs = pathname.split("/").filter(Boolean);
  const pageTitle =
    routeTitles["/" + crumbs[0]] ?? (crumbs[0] ? crumbs[0].replace(/-/g, " ") : "Dashboard");

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  const { data: notifs = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
  });
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b dark:border-border border-sidebar-border bg-sidebar dark:bg-background/80 text-sidebar-foreground dark:text-foreground px-4 backdrop-blur-md lg:px-6">
      <Button
        size="icon"
        variant="ghost"
        onClick={onOpenSidebar}
        className="lg:hidden text-sidebar-foreground dark:text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="hidden min-w-0 items-center gap-1.5 text-sm text-sidebar-foreground/70 dark:text-muted-foreground md:flex">
        <Link to="/dashboard" className="hover:text-sidebar-foreground dark:hover:text-foreground">
          Pagtukaw Lifecare
        </Link>
        {crumbs.length > 0 && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate font-medium text-sidebar-foreground dark:text-foreground capitalize">
              {pageTitle}
            </span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:block">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }),
              )
            }
            className="relative flex h-9 w-72 items-center rounded-lg border dark:border-input border-sidebar-border bg-sidebar-accent/50 dark:bg-muted/30 pl-9 pr-16 text-left text-sm text-sidebar-foreground/80 dark:text-muted-foreground/80 hover:bg-sidebar-accent dark:hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-sidebar-ring dark:focus:ring-ring/40"
            aria-label="Open command palette"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/70 dark:text-muted-foreground" />
            <span className="truncate">Search or jump to…</span>
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border dark:border-border border-sidebar-border dark:bg-background bg-sidebar-accent px-1.5 py-0.5 text-[10px] text-sidebar-foreground/90 dark:text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={toggle}
          aria-label="Toggle theme"
          className="text-sidebar-foreground dark:text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="relative text-sidebar-foreground dark:text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 dark:ring-background ring-sidebar" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[400px] sm:w-[540px] p-0 flex flex-col border-l [&>button]:top-6"
          >
            <div className="flex items-center gap-2 px-6 h-16 border-b">
              <SheetTitle className="text-base font-semibold">Notifications</SheetTitle>
              <Badge variant="secondary" className="text-[10px]">
                {unread} new
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto scroll-thin">
              {notifs.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No notifications.
                </div>
              )}
              {notifs.map((n) => (
                <div
                  key={n.id}
                  className="flex flex-col items-start gap-1 p-5 border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex w-full items-center gap-2">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        n.type === "success" && "bg-success",
                        n.type === "warning" && "bg-warning",
                        n.type === "danger" && "bg-destructive",
                        n.type === "info" && "bg-info",
                      )}
                    />
                    <div className="min-w-0 flex-1 text-sm font-medium">{n.title}</div>
                    {!n.read && <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 ml-3.5">{n.body}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t mt-auto">
              <Button variant="outline" className="w-full text-primary" asChild>
                <Link to="/notifications">View all notifications</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-sidebar-accent dark:hover:bg-accent focus:outline-none focus:ring-2 focus:ring-sidebar-ring dark:focus:ring-ring">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-sidebar-primary/20 text-sidebar-foreground dark:bg-primary/15 dark:text-primary">
                <User className="h-4 w-4" />
              </span>
              <div className="hidden text-left leading-tight sm:block">
                <div className="text-xs font-semibold text-sidebar-foreground dark:text-foreground">
                  Admin Santos
                </div>
                <div className="text-[10px] text-sidebar-foreground/70 dark:text-muted-foreground">
                  Administrator
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/50 dark:text-muted-foreground dark:opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/notifications">Notifications</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onSelect={async () => {
                await logout();
                await navigate({ to: "/auth/login" });
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
