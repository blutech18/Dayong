import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Send, Megaphone, Pin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/announcements/new")({
  head: () => ({ meta: [{ title: "New Announcement — DAYONG" }] }),
  component: NewAnnouncementPage,
});

const tone: Record<string, string> = {
  general: "bg-info/15 text-info",
  event: "bg-primary/15 text-primary",
  policy: "bg-secondary/15 text-secondary",
  urgent: "bg-destructive/15 text-destructive",
};

function NewAnnouncementPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [pinned, setPinned] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 gap-1.5 text-muted-foreground">
          <Link to="/announcements"><ArrowLeft className="h-4 w-4" />All announcements</Link>
        </Button>
        <PageHeader title="Compose announcement" description="Write a message and choose the audience that should see it." />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Announcement published", { description: title || "Untitled announcement" });
          navigate({ to: "/announcements" });
        }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reminder: July collection this Saturday" required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Audience</Label>
                <Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All members & staff</SelectItem>
                    <SelectItem value="members">Members only</SelectItem>
                    <SelectItem value="staff">Staff only</SelectItem>
                    <SelectItem value="active">Active members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Message</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Write your announcement here…" required />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={pinned} onCheckedChange={(v) => setPinned(!!v)} />
              <Pin className="h-3.5 w-3.5 text-warning" />
              Pin to the top of the feed
            </label>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/announcements" })}>Cancel</Button>
            <Button type="button" variant="outline" className="gap-1.5"><Eye className="h-4 w-4" />Save draft</Button>
            <Button type="submit" className="gap-1.5"><Send className="h-4 w-4" />Publish</Button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Live preview</div>
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-display text-sm font-semibold">{title || "Announcement title"}</div>
                    {pinned && <Pin className="h-3 w-3 text-warning" />}
                    <Badge variant="outline" className={cn("capitalize", tone[category])}>{category}</Badge>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Just now · You</div>
                  <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                    {body || "The message body will appear here as you type."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
