import { createFileRoute } from "@tanstack/react-router";
import { ReportShell, ReportTile } from "@/components/report-shell";
import { members, formatDate, dashboardStats, formatPHP } from "@/lib/mock-data";

export const Route = createFileRoute("/report/members")({
  head: () => ({ meta: [{ title: "Member Report — DAYONG" }, { name: "robots", content: "noindex" }] }),
  component: MemberReportPage,
});

function MemberReportPage() {
  const rows = [...members].sort((a, b) => a.memberNo.localeCompare(b.memberNo));
  const active = members.filter((m) => m.status === "active").length;
  const inactive = members.filter((m) => m.status === "inactive").length;
  const pending = members.filter((m) => m.status === "pending").length;
  const totalContrib = members.reduce((s, m) => s + m.contributionsTotal, 0);

  return (
    <ReportShell eyebrow="Member Report" title="Full Directory">
      <div className="grid grid-cols-4 gap-4">
        <ReportTile label="Total members" value={String(dashboardStats.totalMembers)} />
        <ReportTile label="Active" value={String(active)} tone="emerald" />
        <ReportTile label="Inactive / pending" value={String(inactive + pending)} tone="amber" />
        <ReportTile label="Total contributions" value={formatPHP(totalContrib)} tone="sky" />
      </div>

      <h2 className="mt-8 font-display text-base font-semibold">Member directory</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-left uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Member No.</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2 text-right">Contributions</th>
              <th className="px-3 py-2 text-right">Claims</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((m) => (
              <tr key={m.id}>
                <td className="px-3 py-1.5 font-mono">{m.memberNo}</td>
                <td className="px-3 py-1.5">{m.firstName} {m.lastName}</td>
                <td className="px-3 py-1.5 capitalize">{m.status}</td>
                <td className="px-3 py-1.5">{formatDate(m.joinedAt)}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{formatPHP(m.contributionsTotal)}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{m.assistanceCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportShell>
  );
}
