import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, Plus, Download, Filter, MoreHorizontal, Users,
  UserCheck, UserX, Clock, ChevronLeft, ChevronRight, Mail, Phone,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import {
  members, formatPHP, formatDate, initialsOf, dashboardStats,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/members")({
  head: () => ({
    meta: [
      { title: "Members — DAYONG" },
      { name: "description", content: "Manage member records, contributions, and assistance history." },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  const [tab, setTab] = useState<"all" | "active" | "inactive" | "pending" | "archived">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (tab !== "all" && m.status !== tab) return false;
      if (q) {
        const hay = `${m.firstName} ${m.lastName} ${m.memberNo} ${m.email}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [tab, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

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
            <Button size="sm" className="gap-1.5" asChild>
              <Link to="/members/new"><Plus className="h-4 w-4" /> New member</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total members" value={String(dashboardStats.totalMembers)} icon={Users} tone="primary" />
        <StatCard label="Active" value={String(dashboardStats.activeMembers)} icon={UserCheck} tone="success" />
        <StatCard label="Inactive" value={String(dashboardStats.inactiveMembers)} icon={UserX} tone="muted" />
        <StatCard label="Pending" value={String(members.filter(m=>m.status==="pending").length)} icon={Clock} tone="warning" />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setPage(1); }}>
            <TabsList>
              <TabsTrigger value="all">All <span className="ml-1.5 text-[10px] text-muted-foreground">{members.length}</span></TabsTrigger>
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
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
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
                <th className="w-10 px-4 py-3"><Checkbox /></th>
                <th className="px-3 py-3 font-medium">
                  <button className="inline-flex items-center gap-1">Member <ArrowUpDown className="h-3 w-3" /></button>
                </th>
                <th className="px-3 py-3 font-medium">Contact</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Contributions</th>
                <th className="px-3 py-3 font-medium">Joined</th>
                <th className="px-3 py-3 font-medium">Last payment</th>
                <th className="w-12 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No members found</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
              {paged.map((m) => (
                <tr key={m.id} className="group hover:bg-muted/40">
                  <td className="px-4 py-3"><Checkbox /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initialsOf(m.firstName + " " + m.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link to="/members/$id" params={{ id: m.id }}
                          className="block truncate font-medium hover:text-primary">
                          {m.firstName} {m.lastName}
                        </Link>
                        <div className="truncate text-xs text-muted-foreground">{m.memberNo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col text-xs">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3 w-3" /> <span className="truncate">{m.email}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {m.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">
                    {formatPHP(m.contributionsTotal)}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{formatDate(m.joinedAt)}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{formatDate(m.lastPaymentAt)}</td>
                  <td className="px-3 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100" aria-label="Row actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to="/members/$id" params={{ id: m.id }}>View profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit member</DropdownMenuItem>
                        <DropdownMenuItem>Record contribution</DropdownMenuItem>
                        <DropdownMenuItem>Print member ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(page - 1) * pageSize + 1}</span>–
            <span className="font-medium text-foreground">{Math.min(page * pageSize, filtered.length)}</span> of{" "}
            <span className="font-medium text-foreground">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
