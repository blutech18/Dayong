import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const groups: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: "General",
    items: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["Ctrl", "K"], label: "Open command palette (Win/Linux)" },
      { keys: ["/"], label: "Focus search / open palette" },
      { keys: ["?"], label: "Show this shortcuts guide" },
    ],
  },
  {
    title: "Jump to",
    items: [
      { keys: ["G", "D"], label: "Dashboard" },
      { keys: ["G", "M"], label: "Members" },
      { keys: ["G", "C"], label: "Contributions" },
      { keys: ["G", "E"], label: "Collection Events" },
      { keys: ["G", "A"], label: "Assistance" },
      { keys: ["G", "F"], label: "Financials" },
      { keys: ["G", "R"], label: "Reports" },
      { keys: ["G", "N"], label: "Notifications" },
      { keys: ["G", "S"], label: "Settings" },
      { keys: ["G", "P"], label: "Profile" },
    ],
  },
];

export function ShortcutsDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Move around DAYONG without leaving the keyboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {g.title}
              </h4>
              <ul className="space-y-1.5">
                {g.items.map((it) => (
                  <li key={it.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground">{it.label}</span>
                    <span className="flex items-center gap-1">
                      {it.keys.map((k) => (
                        <kbd
                          key={k}
                          className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border bg-muted px-1.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
