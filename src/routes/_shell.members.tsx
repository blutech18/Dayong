import { useMemo, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Search,
  Download,
  Filter,
  Users,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
  ArrowUpDown,
  Pencil,
  Wallet,
  Loader2,
} from "lucide-react";
import { TablePagination } from "@/components/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import { formatPHP, formatDate } from "@/lib/format";
import { getMembersPage, updateMember } from "@/server/functions/members";
import { NewMemberModal } from "@/components/action-modals";
import type { MemberDTO } from "@/server/dto";

export const Route = createFileRoute("/_shell/members")({
  head: () => ({
    meta: [
      { title: "Members — Pagtukaw Lifecare" },
      {
        name: "description",
        content: "Manage member records, contributions, and assistance history.",
      },
    ],
  }),
  loader: () => getMembersPage(),
  component: MembersPage,
});

function MembersPage() {
  const { members, stats } = Route.useLoaderData();
  const [tab, setTab] = useState<"all" | "active" | "inactive" | "pending" | "archived">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (tab !== "all" && m.status !== tab) return false;
      if (q) {
        const hay = `${m.firstName} ${m.lastName} ${m.memberNo} ${m.email}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [members, tab, q]);

  const { page, setPage, paged, pageSize, total } = usePagination(filtered);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Directory of every registered member and their status."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <NewMemberModal />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total members" value={String(stats.total)} icon={Users} tone="primary" />
        <StatCard label="Active" value={String(stats.active)} icon={UserCheck} tone="success" />
        <StatCard label="Inactive" value={String(stats.inactive)} icon={UserX} tone="muted" />
        <StatCard label="Pending" value={String(stats.pending)} icon={Clock} tone="warning" />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as typeof tab);
              setPage(1);
            }}
          >
            <TabsList>
              <TabsTrigger value="all">
                All{" "}
                <span className="ml-1.5 text-[10px] text-muted-foreground">{members.length}</span>
              </TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-72 lg:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, ID, email…"
                className="h-9 w-full rounded-lg border border-input bg-muted/30 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-3 font-medium" style={{ textAlign: "left" }}>
                  <button className="inline-flex items-center gap-1">
                    Member <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-3 py-3 text-center font-medium">Contact</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Contributions</th>
                <th className="px-3 py-3 font-medium">Joined</th>
                <th className="px-3 py-3 font-medium">Last payment</th>
                <th className="px-3 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No members found</p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search or filters.
                    </p>
                  </td>
                </tr>
              )}
              {paged.map((m) => (
                <tr key={m.id} className="group hover:bg-muted/40">
                  <td className="px-3 py-3">
                    <div className="min-w-0">
                      <Link
                        to="/members/$id"
                        params={{ id: m.id }}
                        className="block truncate font-medium hover:text-primary"
                      >
                        {m.firstName} {m.lastName}
                      </Link>
                      <div className="truncate text-xs text-muted-foreground">{m.memberNo}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center text-xs">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3 w-3" /> <span className="truncate">{m.email}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {m.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">
                    {formatPHP(m.contributionsTotal)}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {formatDate(m.joinedAt)}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {formatDate(m.lastPaymentAt)}
                  </td>
                  <td className="px-3 py-3">
                    <MemberActionsModal member={m} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          label="members"
        />
      </div>
    </div>
  );
}

function MemberActionsModal({ member }: { member: MemberDTO }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone);
  const [address, setAddress] = useState(member.address);

  function reset() {
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setEmail(member.email);
    setPhone(member.phone);
    setAddress(member.address);
    setEditing(false);
  }

  async function save() {
    if (!firstName.trim() || !lastName.trim()) {
      return toast.error("First and last name are required.");
    }
    setSaving(true);
    try {
      await updateMember({
        data: {
          id: member.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
      });
      toast.success("Member updated.");
      setEditing(false);
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update member.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>
              {member.firstName} {member.lastName}
            </DialogTitle>
            <StatusBadge status={member.status} />
          </div>
          <DialogDescription>
            {member.memberNo} · Joined {formatDate(member.joinedAt)} ·{" "}
            {formatPHP(member.contributionsTotal)} contributed
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>First name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!editing}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Last name</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!editing}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editing}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!editing}
            />
          </div>
        </div>

        <DialogFooter>
          {editing ? (
            <>
              <Button variant="outline" onClick={reset} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving} className="gap-1.5">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild className="gap-1.5">
                <Link to="/contributions">
                  <Wallet className="h-4 w-4" />
                  Record contribution
                </Link>
              </Button>
              <Button onClick={() => setEditing(true)} className="gap-1.5">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
