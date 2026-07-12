import { desc } from "drizzle-orm";
import { getDb } from "../db/client";
import { financialTransactions } from "../db/schema";
import { contributionsRepo } from "../repositories/contributions.repo";

export interface LedgerEntry {
  id: string;
  date: string;
  ref: string;
  desc: string;
  type: "income" | "expense";
  amount: number;
}

export interface MonthlyPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface FinancialStats {
  incomeYTD: number;
  expenseYTD: number;
  net: number;
  cashOnHand: number;
}

export interface FinancialsOverview {
  stats: FinancialStats;
  monthly: MonthlyPoint[];
  ledger: LedgerEntry[];
}

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

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function lastNMonths(n: number) {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: monthKey(d), label: MONTH_LABELS[d.getMonth()] });
  }
  return out;
}

export interface DetailedMonth {
  month: string;
  income: number;
  assistance: number;
  operations: number;
  expense: number;
  net: number;
}

export const financialsService = {
  /** Per-month income + expense split (assistance vs operations), last 6 months. */
  async monthlyDetailed(): Promise<DetailedMonth[]> {
    const [contribRows, txnRows] = await Promise.all([
      contributionsRepo.listWithMember(),
      getDb().select().from(financialTransactions),
    ]);

    const months = lastNMonths(6);
    const buckets = new Map<string, { income: number; assistance: number; operations: number }>();
    for (const m of months) buckets.set(m.key, { income: 0, assistance: 0, operations: 0 });

    for (const c of contribRows) {
      if (c.status === "unpaid") continue;
      const b = buckets.get(monthKey(new Date(c.paidAt)));
      if (b) b.income += Number(c.amount);
    }
    for (const t of txnRows) {
      const b = buckets.get(monthKey(new Date(t.occurredAt)));
      if (!b) continue;
      if (t.type === "income") b.income += Number(t.amount);
      else if (t.category === "assistance") b.assistance += Number(t.amount);
      else b.operations += Number(t.amount);
    }

    return months.map((m) => {
      const b = buckets.get(m.key)!;
      const expense = b.assistance + b.operations;
      return {
        month: m.label,
        income: b.income,
        assistance: b.assistance,
        operations: b.operations,
        expense,
        net: b.income - expense,
      };
    });
  },

  async overview(): Promise<FinancialsOverview> {
    const [contribRows, txnRows] = await Promise.all([
      contributionsRepo.listWithMember(),
      getDb().select().from(financialTransactions).orderBy(desc(financialTransactions.occurredAt)),
    ]);

    // Unified ledger: contributions are income; transactions carry their own type.
    const ledger: LedgerEntry[] = [];

    for (const c of contribRows) {
      if (c.status === "unpaid") continue;
      ledger.push({
        id: `con_${c.id}`,
        date: c.paidAt.toISOString(),
        ref: c.receiptNo,
        desc: `Contribution — ${c.memberFirstName} ${c.memberLastName}`.trim(),
        type: "income",
        amount: Number(c.amount),
      });
    }

    for (const t of txnRows) {
      ledger.push({
        id: `txn_${t.id}`,
        date: t.occurredAt.toISOString(),
        ref: t.description?.match(/[A-Z]{2,}-[\d-]+/)?.[0] ?? t.category.toUpperCase(),
        desc: t.description ?? t.category,
        type: t.type,
        amount: Number(t.amount),
      });
    }

    ledger.sort((a, b) => +new Date(b.date) - +new Date(a.date));

    // Monthly buckets (last 6 months).
    const months = lastNMonths(6);
    const byMonth = new Map<string, { income: number; expense: number }>();
    for (const m of months) byMonth.set(m.key, { income: 0, expense: 0 });
    for (const e of ledger) {
      const bucket = byMonth.get(monthKey(new Date(e.date)));
      if (!bucket) continue;
      if (e.type === "income") bucket.income += e.amount;
      else bucket.expense += e.amount;
    }
    const monthly: MonthlyPoint[] = months.map((m) => {
      const b = byMonth.get(m.key)!;
      return { month: m.label, income: b.income, expense: b.expense, net: b.income - b.expense };
    });

    // Stats.
    const year = new Date().getFullYear();
    let incomeYTD = 0;
    let expenseYTD = 0;
    let allIncome = 0;
    let allExpense = 0;
    for (const e of ledger) {
      const d = new Date(e.date);
      if (e.type === "income") {
        allIncome += e.amount;
        if (d.getFullYear() === year) incomeYTD += e.amount;
      } else {
        allExpense += e.amount;
        if (d.getFullYear() === year) expenseYTD += e.amount;
      }
    }

    return {
      stats: {
        incomeYTD,
        expenseYTD,
        net: incomeYTD - expenseYTD,
        cashOnHand: allIncome - allExpense,
      },
      monthly,
      ledger: ledger.slice(0, 12),
    };
  },
};
