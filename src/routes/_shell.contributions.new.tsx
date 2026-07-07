import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, Save, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { formatPHP } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/contributions/new")({
  head: () => ({ meta: [{ title: "Post Contributions — DAYONG" }] }),
  component: NewContributionPage,
});

type Row = { id: number; member: string; amount: string; method: string };

function NewContributionPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([
    { id: 1, member: "", amount: "", method: "cash" },
    { id: 2, member: "", amount: "", method: "cash" },
    { id: 3, member: "", amount: "", method: "cash" },
  ]);

  const total = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  const update = (id: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 gap-1.5 text-muted-foreground">
          <Link to="/contributions"><ArrowLeft className="h-4 w-4" />All contributions</Link>
        </Button>
        <PageHeader title="Post contributions" description="Record multiple member contributions in a single batch." />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Field label="Collection event">
            <Select><SelectTrigger><SelectValue placeholder="General collection" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General collection</SelectItem>
                <SelectItem value="fiesta">Fiesta 2026</SelectItem>
                <SelectItem value="disaster">Disaster relief drive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" defaultValue="2026-07-07" /></Field>
          <Field label="Collector">
            <Select defaultValue="me"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="me">You (signed in)</SelectItem>
                <SelectItem value="s1">Ana Reyes</SelectItem>
                <SelectItem value="s2">Ben Cruz</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Reference / batch no."><Input placeholder="Auto-generated" /></Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-display text-sm font-semibold">Batch entries</h3>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setRows([...rows, { id: Date.now(), member: "", amount: "", method: "cash" }])}>
            <Plus className="h-3.5 w-3.5" />Add row
          </Button>
        </div>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-10 px-4 py-3">#</th>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Input value={r.member} onChange={(e) => update(r.id, { member: e.target.value })} placeholder="Search member…" className="h-9" />
                  </td>
                  <td className="px-4 py-2">
                    <Select value={r.method} onValueChange={(v) => update(r.id, { method: v })}>
                      <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="gcash">GCash</SelectItem>
                        <SelectItem value="bank">Bank transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2">
                    <Input value={r.amount} onChange={(e) => update(r.id, { amount: e.target.value })} type="number" placeholder="0.00" className="h-9 text-right tabular-nums" />
                  </td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Remove row"
                      onClick={() => setRows(rows.filter((x) => x.id !== r.id))}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td colSpan={3} className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted-foreground">Batch total</td>
                <td className="px-4 py-3 text-right font-display text-base font-semibold tabular-nums">{formatPHP(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => navigate({ to: "/contributions" })}>Cancel</Button>
        <Button variant="outline" className="gap-1.5"><Save className="h-4 w-4" />Save as draft</Button>
        <Button className="gap-1.5"
          onClick={() => {
            toast.success("Batch posted", { description: `${rows.length} entries · ${formatPHP(total)} recorded.` });
            navigate({ to: "/contributions" });
          }}>
          <Receipt className="h-4 w-4" />Post batch
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
