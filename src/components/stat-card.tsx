import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, delta, deltaLabel, icon: Icon, tone = "primary",
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "warning" | "danger" | "success" | "muted";
}) {
  const positive = (delta ?? 0) >= 0;
  const toneMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/15 text-secondary",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/15 text-destructive",
    success: "bg-success/15 text-success",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {value}
          </div>
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof delta === "number" && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
            positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
