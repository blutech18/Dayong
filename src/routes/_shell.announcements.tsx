import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Megaphone, Pin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { getAnnouncements, createAnnouncement } from "@/server/functions/announcements";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/announcements")({
  head: () => ({ meta: [{ title: "Announcements — DAYONG" }] }),
  loader: () => getAnnouncements(),
  component: AnnouncementsPage,
});

type AnnouncementCategory = "general" | "event" | "policy" | "urgent";

const categoryTone: Record<string, string> = {
  general: "bg-info/15 text-info",
  event: "bg-primary/15 text-primary",
  policy: "bg-secondary/15 text-secondary",
  urgent: "bg-destructive/15 text-destructive",
};

function AnnouncementsPage() {
  const announcements = Route.useLoaderData();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Publish and manage messages visible to members and staff."
        actions={<NewAnnouncementModal />}
      />

      <div className="space-y-3">
        {announcements.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No announcements yet. Create one to notify members and staff.
          </div>
        )}
        {announcements.map((a) => (
          <div
            key={a.id}
            className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30"
          >
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
                <Button size="sm" variant="ghost">
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewAnnouncementModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("general");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle("");
    setBody("");
    setCategory("general");
    setPinned(false);
  }

  async function submit() {
    if (!title.trim() || !body.trim()) {
      return toast.error("Title and message are required.");
    }
    setSaving(true);
    try {
      await createAnnouncement({
        data: { title: title.trim(), body: body.trim(), category, pinned },
      });
      toast.success("Announcement published", { description: title });
      setOpen(false);
      reset();
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish announcement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Compose announcement</DialogTitle>
          <DialogDescription>Publish a message visible to members and staff.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reminder: July collection this Saturday"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as AnnouncementCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Message</Label>
            <Textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement here…"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={pinned} onCheckedChange={(v) => setPinned(!!v)} />
            <Pin className="h-3.5 w-3.5 text-warning" />
            Pin to the top of the feed
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
