import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export function ReportShell({
  eyebrow,
  title,
  children,
  preparedBy = "Admin Santos",
  preparedRole = "Treasurer",
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  preparedBy?: string;
  preparedRole?: string;
}) {
  return (
    <div className="min-h-screen bg-muted/30 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-4xl items-center justify-between px-4 print:hidden">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link to="/reports">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print report
        </Button>
      </div>

      <div className="mx-auto max-w-4xl bg-white text-slate-900 shadow-lg print:shadow-none print:max-w-none">
        <div className="border-b-4 border-primary p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-xl font-bold tracking-tight">DAYONG</div>
                <div className="text-xs text-slate-600">
                  Member Assistance & Collection Management
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-slate-500">{eyebrow}</div>
              <div className="font-display text-lg font-semibold">{title}</div>
              <div className="mt-1 text-xs text-slate-600">
                Generated {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {children}

          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-slate-400 pb-1 text-center text-sm font-medium">
                {preparedBy}
              </div>
              <div className="mt-1 text-center text-xs text-slate-600">
                Prepared by · {preparedRole}
              </div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1">&nbsp;</div>
              <div className="mt-1 text-center text-xs text-slate-600">
                Approved by · Board President
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
            This is a computer-generated report. All figures in Philippine Peso (PHP).
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportTile({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: string;
  tone?: "emerald" | "rose" | "primary" | "amber" | "sky";
}) {
  const cls = {
    emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    rose: "bg-rose-50 text-rose-800 ring-rose-200",
    primary: "bg-primary/5 text-primary ring-primary/20",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    sky: "bg-sky-50 text-sky-800 ring-sky-200",
  }[tone];
  return (
    <div className={"rounded-lg p-4 ring-1 " + cls}>
      <div className="text-[10px] uppercase tracking-widest opacity-70">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
