import { desc, eq, gte, asc } from "drizzle-orm";
import { getDb } from "../db/client";
import { collectionEvents, announcements, financialTransactions } from "../db/schema";
import { membersService } from "./members.service";
import { assistanceService } from "./assistance.service";
import { financialsService } from "./financials.service";
import type { MemberDTO, AssistanceDTO } from "../dto";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const CHART_COLORS: Record<string, string> = {
  medical: "var(--color-chart-1)",
  burial: "var(--color-chart-2)",
  calamity: "var(--color-chart-3)",
  educational: "var(--color-chart-4)",
  other: "var(--color-chart-5)",
};
const MONTHLY_DUES = 500;

export interface DashboardData {
  stats: {
    totalMembers: number;
    activeMembers: number;
    pendingAssistance: number;
    approvedAssistance: number;
    rejectedAssistance: number;
    balance: number;
    monthlyCollections: number;
    monthlyExpenses: number;
  };
  monthlyCollections: { month: string; collected: number; expected: number }[];
  monthlyExpenses: { month: string; assistance: number; operations: number }[];
  assistanceDistribution: { name: string; value: number; color: string }[];
  recentMembers: MemberDTO[];
  pendingAssistance: AssistanceDTO[];
  upcomingEvents: {
    id: string;
    name: string;
    scheduledAt: string;
    location: string;
    collector: string;
  }[];
  pinnedAnnouncements: {
    id: string;
    title: string;
    body: string;
    category: string;
    publishedAt: string;
    author: string;
  }[];
}

function lastNMonths(n: number) {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()] });
  }
  return out;
}

export const dashboardService = {
  async overview(): Promise<DashboardData> {
    const db = getDb();
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [members, memberStats, assistance, assistStats, financials, txns, events, pinned] =
      await Promise.all([
        membersService.list(),
        membersService.stats(),
        assistanceService.list(),
        assistanceService.stats(),
        financialsService.overview(),
        db
          .select()
          .from(financialTransactions)
          .where(gte(financialTransactions.occurredAt, sixMonthsAgo)),
        db
          .select()
          .from(collectionEvents)
          .where(eq(collectionEvents.status, "upcoming"))
          .orderBy(asc(collectionEvents.scheduledAt))
          .limit(3),
        db
          .select()
          .from(announcements)
          .where(eq(announcements.pinned, true))
          .orderBy(desc(announcements.publishedAt))
          .limit(2),
      ]);

    const expectedMonthly = memberStats.active * MONTHLY_DUES;
    const monthlyCollections = financials.monthly.map((m) => ({
      month: m.month,
      collected: m.income,
      expected: expectedMonthly,
    }));

    // Split expenses into assistance vs operations by month.
    const months = lastNMonths(6);
    const expByMonth = new Map<string, { assistance: number; operations: number }>();
    for (const m of months) expByMonth.set(m.key, { assistance: 0, operations: 0 });
    for (const t of txns) {
      if (t.type !== "expense") continue;
      const d = new Date(t.occurredAt);
      const bucket = expByMonth.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (!bucket) continue;
      if (t.category === "assistance") bucket.assistance += Number(t.amount);
      else bucket.operations += Number(t.amount);
    }
    const monthlyExpenses = months.map((m) => {
      const b = expByMonth.get(m.key)!;
      return { month: m.label, assistance: b.assistance, operations: b.operations };
    });

    // Current-month totals.
    const curKey = `${now.getFullYear()}-${now.getMonth()}`;
    const curCollections =
      financials.monthly.find((m) => m.month === MONTH_LABELS[now.getMonth()])?.income ?? 0;
    const curExpenses = (() => {
      const b = expByMonth.get(curKey);
      return b ? b.assistance + b.operations : 0;
    })();

    // Assistance distribution by category.
    const catCounts = new Map<string, number>();
    for (const a of assistance) catCounts.set(a.category, (catCounts.get(a.category) ?? 0) + 1);
    const assistanceDistribution = Object.keys(CHART_COLORS)
      .map((cat) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: catCounts.get(cat) ?? 0,
        color: CHART_COLORS[cat],
      }))
      .filter((d) => d.value > 0);

    return {
      stats: {
        totalMembers: memberStats.total,
        activeMembers: memberStats.active,
        pendingAssistance: assistStats.pending,
        approvedAssistance: assistStats.approved,
        rejectedAssistance: assistStats.rejected,
        balance: financials.stats.cashOnHand,
        monthlyCollections: curCollections,
        monthlyExpenses: curExpenses,
      },
      monthlyCollections,
      monthlyExpenses,
      assistanceDistribution,
      recentMembers: members.slice(0, 5),
      pendingAssistance: assistance
        .filter((a) => a.status === "pending" || a.status === "under_review")
        .slice(0, 4),
      upcomingEvents: events.map((e) => ({
        id: e.id,
        name: e.name,
        scheduledAt: e.scheduledAt.toISOString(),
        location: e.location ?? "",
        collector: e.collectorName ?? "Unassigned",
      })),
      pinnedAnnouncements: pinned.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        category: a.category,
        publishedAt: a.publishedAt.toISOString(),
        author: a.authorName ?? "System",
      })),
    };
  },
};
