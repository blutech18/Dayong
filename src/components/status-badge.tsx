import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  active: "bg-success/15 text-success ring-success/20",
  inactive: "bg-muted text-muted-foreground ring-border",
  pending: "bg-warning/15 text-warning ring-warning/20",
  under_review: "bg-info/15 text-info ring-info/20",
  approved: "bg-success/15 text-success ring-success/20",
  rejected: "bg-destructive/15 text-destructive ring-destructive/20",
  released: "bg-secondary/15 text-secondary ring-secondary/25",
  archived: "bg-muted text-muted-foreground ring-border",
  paid: "bg-success/15 text-success ring-success/20",
  partial: "bg-warning/15 text-warning ring-warning/20",
  unpaid: "bg-destructive/15 text-destructive ring-destructive/20",
  upcoming: "bg-info/15 text-info ring-info/20",
  in_progress: "bg-primary/15 text-primary ring-primary/20",
  completed: "bg-success/15 text-success ring-success/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset",
        map[status] ?? "bg-muted text-muted-foreground ring-border",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
