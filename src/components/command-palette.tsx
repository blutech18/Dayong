import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard, Users, Wallet, CalendarDays, HeartHandshake,
  Landmark, FileText, Megaphone, BarChart3, Bell, ShieldCheck,
  Settings, UserCircle, Sun, Moon, LogOut, Plus, Printer, Keyboard,
} from "lucide-react";
import { getTheme, setTheme } from "@/lib/theme";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  keywords?: string;
};

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, shortcut: "G D", keywords: "home overview" },
  { label: "Members", to: "/members", icon: Users, shortcut: "G M", keywords: "residents directory" },
  { label: "Contributions", to: "/contributions", icon: Wallet, shortcut: "G C", keywords: "payments dues" },
  { label: "Collection Events", to: "/collection-events", icon: CalendarDays, shortcut: "G E", keywords: "collectors" },
  { label: "Assistance Requests", to: "/assistance", icon: HeartHandshake, shortcut: "G A", keywords: "aid help" },
  { label: "Financials", to: "/financials", icon: Landmark, shortcut: "G F", keywords: "cash treasury" },
  { label: "Documents", to: "/documents", icon: FileText, keywords: "files uploads" },
  { label: "Announcements", to: "/announcements", icon: Megaphone, keywords: "posts news" },
  { label: "Reports", to: "/reports", icon: BarChart3, shortcut: "G R", keywords: "print export" },
  { label: "Notifications", to: "/notifications", icon: Bell, shortcut: "G N" },
  { label: "Audit Logs", to: "/audit", icon: ShieldCheck, keywords: "history trail" },
  { label: "Settings", to: "/settings", icon: Settings, shortcut: "G S" },
  { label: "Profile", to: "/profile", icon: UserCircle, shortcut: "G P" },
];

const REPORTS: NavItem[] = [
  { label: "Financial Report", to: "/report/financial", icon: Printer },
  { label: "Members Report", to: "/report/members", icon: Printer },
  { label: "Contributions Report", to: "/report/contributions", icon: Printer },
  { label: "Assistance Report", to: "/report/assistance", icon: Printer },
  { label: "Events Report", to: "/report/events", icon: Printer },
  { label: "Cash Flow Report", to: "/report/cash-flow", icon: Printer },
];

const CREATE: NavItem[] = [
  { label: "New Member", to: "/members/new", icon: Plus, keywords: "add register" },
  { label: "New Collection Event", to: "/collection-events", icon: Plus },
  { label: "New Announcement", to: "/announcements", icon: Plus },
];

export function CommandPalette({ onOpenShortcuts }: { onOpenShortcuts?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const isTyping = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" ||
        el.isContentEditable
      );
    };

    const onKey = (e: KeyboardEvent) => {
      // Open palette: Cmd/Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // "/" focuses palette (Gmail-style)
      if (e.key === "/" && !isTyping(e.target)) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (isTyping(e.target)) return;

      // "g <letter>" navigation shortcuts
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => (gPressed = false), 900);
        return;
      }
      if (gPressed) {
        const map: Record<string, string> = {
          d: "/dashboard", m: "/members", c: "/contributions",
          e: "/collection-events", a: "/assistance", f: "/financials",
          r: "/reports", n: "/notifications", s: "/settings", p: "/profile",
        };
        const dest = map[e.key.toLowerCase()];
        if (dest) {
          e.preventDefault();
          gPressed = false;
          navigate({ to: dest });
        }
        return;
      }
      // "?" opens palette to hint at shortcuts
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [navigate]);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  const toggleTheme = () => {
    const next = getTheme() === "dark" ? "light" : "dark";
    setTheme(next);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, reports, actions… (try 'members' or 'print')" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV.map((item) => (
            <CommandItem
              key={item.to}
              value={`${item.label} ${item.keywords ?? ""}`}
              onSelect={() => go(item.to)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Create">
          {CREATE.map((item) => (
            <CommandItem
              key={item.label}
              value={`${item.label} ${item.keywords ?? ""}`}
              onSelect={() => go(item.to)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Print Reports">
          {REPORTS.map((item) => (
            <CommandItem key={item.to} value={item.label} onSelect={() => go(item.to)}>
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Preferences">
          <CommandItem value="toggle theme dark light mode" onSelect={toggleTheme}>
            <Sun className="mr-2 h-4 w-4 dark:hidden" />
            <Moon className="mr-2 hidden h-4 w-4 dark:block" />
            <span>Toggle theme</span>
            <CommandShortcut>T</CommandShortcut>
          </CommandItem>
          {onOpenShortcuts && (
            <CommandItem
              value="keyboard shortcuts help"
              onSelect={() => {
                setOpen(false);
                onOpenShortcuts();
              }}
            >
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard shortcuts</span>
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          )}
          <CommandItem value="sign out logout" onSelect={() => go("/auth/login")}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
