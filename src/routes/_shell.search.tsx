import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search as SearchIcon, User, Receipt, HeartHandshake, Megaphone, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { members, contributions, assistanceRequests, announcements, formatPHP, formatDate } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({ meta: [{ title: "Search — DAYONG" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial);
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return { members: [], contributions: [], assistance: [], announcements: [] };
    const has = (s: string) => s.toLowerCase().includes(query);
    return {
      members: members.filter((m) => has(`${m.firstName} ${m.lastName}`) || has(m.memberNo) || has(m.email ?? "")).slice(0, 8),
      contributions: contributions.filter((c) => has(c.receiptNo) || has(c.memberName)).slice(0, 8),
      assistance: assistanceRequests.filter((a) => has(a.requestNo) || has(a.memberName) || has(a.category)).slice(0, 8),
      announcements: announcements.filter((a) => has(a.title) || has(a.body)).slice(0, 8),
    };
  }, [query]);

  const totalCount = results.members.length + results.contributions.length + results.assistance.length + results.announcements.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Search" description="Look across members, contributions, assistance, and announcements." />

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search DAYONG…" className="h-12 pl-11 text-base"
          />
        </div>
        {query && (
          <div className="mt-2 text-xs text-muted-foreground">
            {totalCount} result{totalCount === 1 ? "" : "s"} for <span className="font-medium text-foreground">"{q}"</span>
          </div>
        )}
      </div>

      {!query && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Start typing to search members, contributions, assistance requests, and announcements.
        </div>
      )}

      {query && totalCount === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No matches found. Try a different keyword or member number.
        </div>
      )}

      {query && totalCount > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Group title="Members" icon={User} count={results.members.length}>
            {results.members.map((m) => (
              <Link key={m.id} to="/members/$id" params={{ id: m.id }} className="block rounded-lg px-3 py-2 hover:bg-muted/40">
                <div className="text-sm font-medium">{m.firstName} {m.lastName}</div>
                <div className="text-xs text-muted-foreground">{m.memberNo} · {m.status}</div>
              </Link>
            ))}
          </Group>
          <Group title="Contributions" icon={Receipt} count={results.contributions.length}>
            {results.contributions.map((c) => (
              <div key={c.id} className="rounded-lg px-3 py-2 hover:bg-muted/40">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.receiptNo}</span>
                  <span className="tabular-nums">{formatPHP(c.amount)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{c.memberName} · {formatDate(c.paidAt)}</div>
              </div>
            ))}
          </Group>
          <Group title="Assistance" icon={HeartHandshake} count={results.assistance.length}>
            {results.assistance.map((a) => (
              <div key={a.id} className="rounded-lg px-3 py-2 hover:bg-muted/40">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{a.requestNo}</span>
                  <span className="tabular-nums">{formatPHP(a.amount)}</span>
                </div>
                <div className="text-xs capitalize text-muted-foreground">{a.category} · {a.memberName}</div>
              </div>
            ))}
          </Group>
          <Group title="Announcements" icon={Megaphone} count={results.announcements.length}>
            {results.announcements.map((a) => (
              <div key={a.id} className="rounded-lg px-3 py-2 hover:bg-muted/40">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="line-clamp-1 text-xs text-muted-foreground">{a.body}</div>
              </div>
            ))}
          </Group>
        </div>
      )}
    </div>
  );
}

function Group({ title, icon: Icon, count, children }: { title: string; icon: typeof FileText; count: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-display text-sm font-semibold">{title}</h3>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
      </div>
      <div className="divide-y divide-border p-2">
        {count === 0 ? <div className="p-3 text-xs text-muted-foreground">No matches</div> : children}
      </div>
    </div>
  );
}
