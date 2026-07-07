import { createFileRoute } from "@tanstack/react-router";
import {
  FolderOpen, FileText, Image as ImageIcon, Upload, Grid3x3, List,
  MoreHorizontal, Download, Search, Folder,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/documents")({
  head: () => ({ meta: [{ title: "Documents — DAYONG" }] }),
  component: DocumentsPage,
});

const folders = [
  { name: "Member Applications", count: 48, color: "primary" },
  { name: "Assistance Documents", count: 132, color: "secondary" },
  { name: "Financial Records", count: 74, color: "warning" },
  { name: "Board Resolutions", count: 18, color: "info" },
];

const files = [
  { name: "March-2026-Financials.pdf", type: "pdf", size: "2.4 MB", updated: "Mar 5, 2026", by: "Admin Santos" },
  { name: "Member-Application-DYG-1042.pdf", type: "pdf", size: "812 KB", updated: "Mar 4, 2026", by: "Staff Reyes" },
  { name: "Medical-Cert-AR-2026-0018.jpg", type: "image", size: "1.1 MB", updated: "Mar 3, 2026", by: "Staff Cruz" },
  { name: "Board-Resolution-2026-03.pdf", type: "pdf", size: "684 KB", updated: "Mar 1, 2026", by: "Admin Santos" },
  { name: "OR-050220-Batch-Receipt.pdf", type: "pdf", size: "445 KB", updated: "Mar 1, 2026", by: "Staff Reyes" },
  { name: "February-Attendance.xlsx", type: "sheet", size: "88 KB", updated: "Feb 28, 2026", by: "Admin Santos" },
];

function DocumentsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Central library for member forms, assistance documents, and official records."
        actions={<Button size="sm" className="gap-1.5"><Upload className="h-4 w-4" />Upload</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {folders.map((f) => (
          <div key={f.name} className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30">
            <div className={cn(
              "grid h-11 w-11 place-items-center rounded-xl",
              f.color === "primary" && "bg-primary/10 text-primary",
              f.color === "secondary" && "bg-secondary/15 text-secondary",
              f.color === "warning" && "bg-warning/15 text-warning",
              f.color === "info" && "bg-info/15 text-info",
            )}>
              <Folder className="h-5 w-5" />
            </div>
            <div className="mt-3 font-medium">{f.name}</div>
            <div className="text-xs text-muted-foreground">{f.count} files</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium">All files</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search files…" className="h-9 w-64 rounded-lg border border-input bg-muted/30 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
            </div>
            <div className="flex rounded-lg border border-border p-0.5">
              <Button size="icon" variant={view === "grid" ? "default" : "ghost"} className="h-7 w-7" onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"}>
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant={view === "list" ? "default" : "ghost"} className="h-7 w-7" onClick={() => setView("list")} aria-label="List view" aria-pressed={view === "list"}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {files.map((f) => (
              <div key={f.name} className="group rounded-xl border border-border p-3 transition hover:border-primary/30 hover:bg-accent/40">
                <div className="aspect-square rounded-lg bg-muted/50 grid place-items-center mb-3">
                  {f.type === "image"
                    ? <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    : <FileText className="h-8 w-8 text-muted-foreground" />}
                </div>
                <div className="truncate text-xs font-medium">{f.name}</div>
                <div className="text-[10px] text-muted-foreground">{f.size} · {f.updated}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Size</th>
                  <th className="px-3 py-3 font-medium">Updated</th>
                  <th className="px-3 py-3 font-medium">By</th>
                  <th className="w-16 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {files.map((f) => (
                  <tr key={f.name} className="hover:bg-muted/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted/60">
                          {f.type === "image" ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <span className="font-medium">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{f.size}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{f.updated}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{f.by}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Download file"><Download className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="File actions"><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
