import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3, Users, Wallet, HeartHandshake, Landmark, CalendarDays,
  FileDown, Printer, FileSpreadsheet, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_shell/reports")({
  head: () => ({ meta: [{ title: "Reports — DAYONG" }] }),
  component: ReportsPage,
});

const reports = [
  { key: "members", to: "/report/members", title: "Member Report", desc: "Full member directory with status and contribution totals.", icon: Users, tone: "primary" },
  { key: "contribs", to: "/report/contributions", title: "Contribution Report", desc: "Detailed collections by member, month, or event.", icon: Wallet, tone: "primary" },
  { key: "events", to: "/report/events", title: "Collection Events Report", desc: "Event outcomes, targets, and collector performance.", icon: CalendarDays, tone: "secondary" },
  { key: "assist", to: "/report/assistance", title: "Assistance Report", desc: "Requests by category, approval times, released amounts.", icon: HeartHandshake, tone: "warning" },
  { key: "fin", to: "/report/financial", title: "Financial Report", desc: "Income, expenses, cash flow with charts.", icon: Landmark, tone: "success" },
  { key: "cash", to: "/report/cash-flow", title: "Cash Flow Report", desc: "Monthly cash-in vs cash-out with running balance.", icon: BarChart3, tone: "info" },
] as const;

const toneClass: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
};

function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and export detailed reports for the board, auditors, and members."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <div key={r.key} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm">
            <div className={"grid h-11 w-11 place-items-center rounded-xl " + toneClass[r.tone]}>
              <r.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display text-base font-semibold">{r.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{r.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1.5"><FileDown className="h-4 w-4" />PDF</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><FileSpreadsheet className="h-4 w-4" />Excel</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><Printer className="h-4 w-4" />Print</Button>
              <Button size="sm" className="ml-auto gap-1.5" asChild>
                <Link to={r.to}>Preview <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
