import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  UserCheck,
  UserX,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowRight,
  Calendar,
  Megaphone,
  Plus,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatPHP, formatDate } from "@/lib/format";
import { getDashboard } from "@/server/functions/dashboard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DAYONG" },
      {
        name: "description",
        content: "Overview of members, collections, assistance and financial health.",
      },
    ],
  }),
  loader: () => getDashboard(),
  component: DashboardPage,
});

function DashboardPage() {
  const {
    stats: dashboardStats,
    monthlyCollections,
    monthlyExpenses,
    assistanceDistribution,
    recentMembers,
    pendingAssistance: pending,
    upcomingEvents: upcoming,
    pinnedAnnouncements: pinned,
  } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live overview of your organization's members, collections, and assistance activity."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Record contribution
            </Button>
          </>
        }
      />

      {/* Stat grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total members"
          value={String(dashboardStats.totalMembers)}
          delta={4.2}
          deltaLabel="vs last month"
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Active members"
          value={String(dashboardStats.activeMembers)}
          delta={2.1}
          deltaLabel="new this month"
          icon={UserCheck}
          tone="success"
        />
        <StatCard
          label="Pending assistance"
          value={String(dashboardStats.pendingAssistance)}
          delta={-8}
          deltaLabel="vs last week"
          icon={HeartHandshake}
          tone="warning"
        />
        <StatCard
          label="Cash balance"
          value={formatPHP(dashboardStats.balance)}
          delta={5.6}
          deltaLabel="net this month"
          icon={PiggyBank}
          tone="secondary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly collections"
          value={formatPHP(dashboardStats.monthlyCollections)}
          delta={-3.4}
          deltaLabel="vs last month"
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Monthly expenses"
          value={formatPHP(dashboardStats.monthlyExpenses)}
          delta={1.8}
          deltaLabel="vs last month"
          icon={TrendingDown}
          tone="danger"
        />
        <StatCard
          label="Approved assistance"
          value={String(dashboardStats.approvedAssistance)}
          delta={12}
          deltaLabel="this quarter"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Rejected assistance"
          value={String(dashboardStats.rejectedAssistance)}
          delta={-2}
          deltaLabel="this quarter"
          icon={XCircle}
          tone="muted"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold">Collections vs Expected</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Collected
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                Expected
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyCollections}
                margin={{ left: -20, right: 8, top: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{
                    stroke: "var(--color-primary)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatPHP(v)}
                />
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke="var(--color-muted-foreground)"
                  strokeDasharray="4 4"
                  fill="transparent"
                  strokeWidth={1.5}
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="var(--color-primary)"
                  fill="url(#collectedGrad)"
                  strokeWidth={2}
                  activeDot={{ r: 5, stroke: "var(--color-background)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Assistance distribution</h3>
            <p className="text-xs text-muted-foreground">By category, YTD</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assistanceDistribution}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="var(--color-card)"
                  strokeWidth={2}
                >
                  {assistanceDistribution.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Monthly expenses</h3>
              <p className="text-xs text-muted-foreground">Assistance vs Operations</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" /> +6.2%
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpenses} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)", opacity: 0.35 }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatPHP(v)}
                />
                <Bar
                  dataKey="assistance"
                  stackId="a"
                  fill="var(--color-primary)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="operations"
                  stackId="a"
                  fill="var(--color-secondary)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Quick actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "New member", to: "/members", icon: Users },
              { label: "Record payment", to: "/contributions", icon: Wallet },
              { label: "New request", to: "/assistance", icon: HeartHandshake },
              { label: "Schedule event", to: "/collection-events", icon: Calendar },
              { label: "Announcement", to: "/announcements", icon: Megaphone },
              { label: "View reports", to: "/reports", icon: TrendingUp },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-background p-3 transition hover:border-primary/40 hover:bg-accent"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="text-xs font-medium leading-tight">{a.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="font-display text-base font-semibold">Pending assistance</h3>
              <p className="text-xs text-muted-foreground">Awaiting review or verification</p>
            </div>
            <Link to="/assistance" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {pending.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.memberName}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.requestNo} · {r.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatPHP(r.amount)}</div>
                  <StatusPill status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="font-display text-base font-semibold">Upcoming collections</h3>
              <p className="text-xs text-muted-foreground">Next scheduled events</p>
            </div>
            <Link
              to="/collection-events"
              className="text-xs font-medium text-primary hover:underline"
            >
              Calendar
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-start gap-3 px-5 py-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{e.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {formatDate(e.scheduledAt)} · {e.location}
                  </div>
                  <div className="mt-1 text-xs">
                    <span className="text-muted-foreground">Collector:</span>{" "}
                    <span className="font-medium">{e.collector}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="font-display text-base font-semibold">Recent members</h3>
              <p className="text-xs text-muted-foreground">Latest registrations</p>
            </div>
            <Link to="/members" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentMembers.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    to="/members/$id"
                    params={{ id: m.id }}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {m.firstName} {m.lastName}
                  </Link>
                  <div className="truncate text-xs text-muted-foreground">{m.memberNo}</div>
                </div>
                <StatusPill status={m.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Announcements strip */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-semibold">Pinned announcements</h3>
          </div>
          <Link
            to="/announcements"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Manage <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {pinned.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-background/60 p-4 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{a.title}</div>
                <Badge variant="outline" className="capitalize">
                  {a.category}
                </Badge>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                {formatDate(a.publishedAt)} · {a.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-success/15 text-success",
    inactive: "bg-muted text-muted-foreground",
    pending: "bg-warning/15 text-warning",
    under_review: "bg-info/15 text-info",
    approved: "bg-success/15 text-success",
    rejected: "bg-destructive/15 text-destructive",
    released: "bg-secondary/15 text-secondary",
    archived: "bg-muted text-muted-foreground",
  };
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize",
        map[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
