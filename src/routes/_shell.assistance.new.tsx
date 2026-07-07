import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Send, Upload, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/assistance/new")({
  head: () => ({ meta: [{ title: "New Assistance Request — DAYONG" }] }),
  component: NewAssistancePage,
});

function NewAssistancePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 gap-1.5 text-muted-foreground">
          <Link to="/assistance"><ArrowLeft className="h-4 w-4" />All requests</Link>
        </Button>
        <PageHeader title="New assistance request" description="File a request on behalf of a member. It will enter the review queue." />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Request submitted", { description: "Assigned request no. AR-2026-00042" });
          navigate({ to: "/assistance" });
        }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card title="Requestor">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Member" required>
                <Input placeholder="Search by name or member no." />
              </Field>
              <Field label="Relationship to beneficiary">
                <Select><SelectTrigger><SelectValue placeholder="Self" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Card>

          <Card title="Request details">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Category" required>
                <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="burial">Burial</SelectItem>
                    <SelectItem value="calamity">Calamity</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="livelihood">Livelihood</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Amount requested (PHP)" required>
                <Input type="number" placeholder="5000" min={0} />
              </Field>
              <Field label="Incident date"><Input type="date" /></Field>
              <Field label="Priority">
                <Select defaultValue="normal"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Reason / description" required className="md:col-span-2">
                <Textarea rows={4} placeholder="Explain the situation and how the assistance will be used…" />
              </Field>
            </div>
          </Card>

          <Card title="Supporting documents">
            <div className="space-y-2">
              {["Valid ID", "Medical certificate / receipts", "Barangay endorsement", "Other supporting file"].map((d) => (
                <div key={d} className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/10 p-3">
                  <div className="text-sm">{d}</div>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5"><Upload className="h-3.5 w-3.5" />Upload</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><HeartHandshake className="h-5 w-5" /></div>
            <h3 className="font-display text-sm font-semibold">Before you submit</h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>· Verify the member is active and in good standing.</li>
              <li>· Attach at least one identifying document.</li>
              <li>· A treasurer or admin will review within 3 working days.</li>
              <li>· You'll be notified when the request status changes.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="gap-1.5"><Send className="h-4 w-4" />Submit request</Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/assistance" })}>Cancel</Button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3"><h3 className="font-display text-sm font-semibold">{title}</h3></div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children, required, className = "" }: { label: string; children: React.ReactNode; required?: boolean; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
