import { createFileRoute } from "@tanstack/react-router";
import { ReportShell, ReportTile } from "@/components/report-shell";
import { formatDate, formatPHP } from "@/lib/format";
import { requireAuth } from "@/lib/auth-guard";
import { getMembersReport } from "@/server/functions/reports";

export const Route = createFileRoute("/report/members")({
  head: () => ({
    meta: [{ title: "Member Report — DAYONG" }, { name: "robots", content: "noindex" }],
  }),
  beforeLoad: () => requireAuth(),
  loader: () => getMembersReport(),
  component: MemberReportPage,
});

function MemberReportPage() {
  const { members, stats } = Route.useLoaderData();
  const rows = [...members].sort((a, b) => a.memberNo.localeCompare(b.memberNo));

  return (
    <ReportShell eyebrow="Member Report" title="Full Directory">
      <div className="grid grid-cols-4 gap-4">
        <ReportTile label="Total members" value={String(stats.total)} />
        <ReportTile label="Active" value={String(stats.active)} tone="emerald" />
        <ReportTile
          label="Inactive / pending"
          value={String(stats.inactive + stats.pending)}
          tone="amber"
        />
        <ReportTile
          label="Total contributions"
          value={formatPHP(members.reduce((s, m) => s + m.contributionsTotal, 0))}
          tone="sky"
        />
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
                <td className="px-3 py-1.5">
                  {m.firstName} {m.lastName}
                </td>
                <td className="px-3 py-1.5 capitalize">{m.status}</td>
                <td className="px-3 py-1.5">{formatDate(m.joinedAt)}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {formatPHP(m.contributionsTotal)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">{m.assistanceCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportShell>
  );
}
