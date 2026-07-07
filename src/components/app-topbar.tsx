import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Search, Bell, Sun, Moon, Menu, ChevronRight, Plus, Command, LogOut,
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { notifications as mockNotifs } from "@/lib/mock-data";
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
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => setThemeState(getTheme()), []);

  const crumbs = pathname.split("/").filter(Boolean);
  const pageTitle =
    routeTitles["/" + crumbs[0]] ??
    (crumbs[0] ? crumbs[0].replace(/-/g, " ") : "Dashboard");

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  const unread = mockNotifs.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Button
        size="icon"
        variant="ghost"
        onClick={onOpenSidebar}
        className="lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="hidden min-w-0 items-center gap-1.5 text-sm text-muted-foreground md:flex">
        <Link to="/dashboard" className="hover:text-foreground">DAYONG</Link>
        {crumbs.length > 0 && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate font-medium text-foreground capitalize">
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
                new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true })
              )
            }
            className="relative flex h-9 w-72 items-center rounded-lg border border-input bg-muted/30 pl-9 pr-16 text-left text-sm text-muted-foreground/80 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
            aria-label="Open command palette"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <span className="truncate">Search or jump to…</span>
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>


        <Button size="sm" className="hidden gap-1.5 sm:inline-flex">
          <Plus className="h-4 w-4" /> New
        </Button>

        <Button size="icon" variant="ghost" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="text-[10px]">{unread} new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {mockNotifs.slice(0, 5).map((n) => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-1 py-2.5">
                  <div className="flex w-full items-center gap-2">
                    <span className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      n.type === "success" && "bg-success",
                      n.type === "warning" && "bg-warning",
                      n.type === "danger" && "bg-destructive",
                      n.type === "info" && "bg-info",
                    )} />
                    <div className="min-w-0 flex-1 truncate text-sm font-medium">{n.title}</div>
                    {!n.read && <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center text-sm font-medium text-primary">
              <Link to="/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  AS
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <div className="text-xs font-semibold">Admin Santos</div>
                <div className="text-[10px] text-muted-foreground">Administrator</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/notifications">Notifications</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-destructive">
              <Link to="/auth/login">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Sign out">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out of your account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Link to="/auth/login">Sign out</Link>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
