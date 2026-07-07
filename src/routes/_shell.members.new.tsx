import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, User, MapPin, Users, FileCheck, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/members/new")({
  head: () => ({ meta: [{ title: "New Member — DAYONG" }] }),
  component: NewMemberPage,
});

type Step = { id: number; label: string; icon: typeof User; description: string };
const steps: Step[] = [
  { id: 1, label: "Personal", icon: User, description: "Basic identification" },
  { id: 2, label: "Contact", icon: MapPin, description: "Contact & address" },
  { id: 3, label: "Beneficiaries", icon: Users, description: "Family and dependents" },
  { id: 4, label: "Documents", icon: FileCheck, description: "Upload requirements" },
  { id: 5, label: "Review", icon: Check, description: "Confirm & submit" },
];

function NewMemberPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const next = () => setStep((s) => Math.min(steps.length, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const submit = () => {
    toast.success("Member registration submitted", { description: "The record is now pending verification." });
    navigate({ to: "/members" });
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 gap-1.5 text-muted-foreground">
          <Link to="/members"><ArrowLeft className="h-4 w-4" />All members</Link>
        </Button>
        <PageHeader
          title="Register new member"
          description="Complete the multi-step form to enroll a new member into the system."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Stepper */}
        <aside className="lg:col-span-1">
          <ol className="space-y-1 rounded-2xl border border-border bg-card p-3">
            {steps.map((s) => {
              const done = s.id < step;
              const active = s.id === step;
              const Icon = done ? Check : s.icon;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setStep(s.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      active ? "bg-primary/10" : "hover:bg-muted/40",
                    )}
                  >
                    <span className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      done ? "bg-emerald-500/15 text-emerald-500" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}>
                      {done ? <Icon className="h-4 w-4" /> : s.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                        {s.label}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">{s.description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {step} of {steps.length}</div>
              <h2 className="mt-1 font-display text-xl font-semibold">{steps[step - 1].label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{steps[step - 1].description}</p>
            </div>

            <div className="p-6">
              {step === 1 && <PersonalStep />}
              {step === 2 && <ContactStep />}
              {step === 3 && <BeneficiariesStep />}
              {step === 4 && <DocumentsStep />}
              {step === 5 && <ReviewStep />}
            </div>

            <div className="flex items-center justify-between border-t border-border p-4">
              <Button variant="outline" size="sm" onClick={back} disabled={step === 1} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="text-xs text-muted-foreground">Draft auto-saved</div>
              {step < steps.length ? (
                <Button size="sm" onClick={next} className="gap-1.5">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={submit} className="gap-1.5">
                  <Check className="h-4 w-4" /> Submit registration
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, required, className }: { label: string; children: React.ReactNode; required?: boolean; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function PersonalStep() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label="First name" required><Input placeholder="Maria" /></Field>
      <Field label="Last name" required><Input placeholder="Dela Cruz" /></Field>
      <Field label="Middle name"><Input placeholder="Santos" /></Field>
      <Field label="Suffix"><Input placeholder="Jr., Sr., III" /></Field>
      <Field label="Date of birth" required><Input type="date" /></Field>
      <Field label="Sex" required>
        <Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Civil status" required>
        <Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married">Married</SelectItem>
            <SelectItem value="widowed">Widowed</SelectItem>
            <SelectItem value="separated">Separated</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Occupation"><Input placeholder="Teacher" /></Field>
    </div>
  );
}

function ContactStep() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label="Mobile number" required><Input placeholder="+63 917 000 0000" /></Field>
      <Field label="Email address"><Input type="email" placeholder="maria@example.com" /></Field>
      <Field label="Street address" required className="md:col-span-2">
        <Input placeholder="123 Rizal St." />
      </Field>
      <Field label="Barangay" required><Input placeholder="San Roque" /></Field>
      <Field label="City / Municipality" required><Input placeholder="Quezon City" /></Field>
      <Field label="Province" required><Input placeholder="Metro Manila" /></Field>
      <Field label="ZIP code"><Input placeholder="1100" /></Field>
      <Field label="Emergency contact name" className="md:col-span-2"><Input placeholder="Juan Dela Cruz" /></Field>
      <Field label="Relationship"><Input placeholder="Spouse" /></Field>
      <Field label="Emergency contact number"><Input placeholder="+63 917 000 0000" /></Field>
    </div>
  );
}

function BeneficiariesStep() {
  const [rows, setRows] = useState([{ id: 1 }, { id: 2 }]);
  return (
    <div className="space-y-4">
      {rows.map((r, i) => (
        <div key={r.id} className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">Beneficiary {i + 1}</div>
            {rows.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => setRows(rows.filter((x) => x.id !== r.id))} className="h-7 gap-1 text-destructive">
                <X className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Full name" required><Input placeholder="Beneficiary name" /></Field>
            <Field label="Relationship" required><Input placeholder="Child" /></Field>
            <Field label="Date of birth"><Input type="date" /></Field>
            <Field label="Contact number"><Input placeholder="+63 917 000 0000" /></Field>
            <Field label="Share (%)"><Input type="number" placeholder="50" /></Field>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox /> Primary beneficiary
              </label>
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setRows([...rows, { id: Date.now() }])}>
        + Add beneficiary
      </Button>
    </div>
  );
}

function DocumentsStep() {
  const docs = [
    { name: "Valid government ID (front & back)", required: true },
    { name: "Barangay clearance", required: true },
    { name: "1x1 ID photo", required: true },
    { name: "Proof of income (optional)", required: false },
    { name: "Marriage certificate (if applicable)", required: false },
  ];
  return (
    <div className="space-y-3">
      {docs.map((d) => (
        <div key={d.name} className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/10 p-4">
          <div>
            <div className="text-sm font-medium">{d.name}</div>
            <div className="text-xs text-muted-foreground">PDF, JPG or PNG · Max 5MB</div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
      ))}
      <Field label="Additional notes">
        <Textarea rows={3} placeholder="Anything the reviewer should know..." />
      </Field>
    </div>
  );
}

function ReviewStep() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <h4 className="mb-2 text-sm font-semibold">Registration summary</h4>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><dt className="text-xs text-muted-foreground">Full name</dt><dd className="font-medium">Maria Santos Dela Cruz</dd></div>
          <div><dt className="text-xs text-muted-foreground">Date of birth</dt><dd className="font-medium">Jan 15, 1980</dd></div>
          <div><dt className="text-xs text-muted-foreground">Mobile</dt><dd className="font-medium">+63 917 000 0000</dd></div>
          <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="font-medium">maria@example.com</dd></div>
          <div className="col-span-2"><dt className="text-xs text-muted-foreground">Address</dt><dd className="font-medium">123 Rizal St., Barangay San Roque, Quezon City</dd></div>
          <div><dt className="text-xs text-muted-foreground">Beneficiaries</dt><dd className="font-medium">2 registered</dd></div>
          <div><dt className="text-xs text-muted-foreground">Documents</dt><dd className="font-medium">3 of 5 uploaded</dd></div>
        </dl>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <Checkbox className="mt-0.5" />
        <span>I confirm the information provided is accurate and complete. I agree to the DAYONG member terms and privacy policy.</span>
      </label>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-500">
        Once submitted, the record enters <span className="font-semibold">Pending</span> status until verified by an administrator.
      </div>
    </div>
  );
}
