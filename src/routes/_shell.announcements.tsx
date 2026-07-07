import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Megaphone, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { announcements, formatDate } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/announcements")({
  head: () => ({ meta: [{ title: "Announcements — DAYONG" }] }),
  component: AnnouncementsPage,
});

const categoryTone: Record<string, string> = {
  general: "bg-info/15 text-info",
  event: "bg-primary/15 text-primary",
  policy: "bg-secondary/15 text-secondary",
  urgent: "bg-destructive/15 text-destructive",
};

function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Publish and manage messages visible to members and staff."
        actions={<Button size="sm" asChild className="gap-1.5"><Link to="/announcements/new"><Plus className="h-4 w-4" />New announcement</Link></Button>}
      />

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold">{a.title}</h3>
                    {a.pinned && <Pin className="h-3.5 w-3.5 text-warning" />}
                    <Badge variant="outline" className={cn("capitalize", categoryTone[a.category])}>
                      {a.category}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(a.publishedAt)} · {a.author}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">Preview</Button>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
