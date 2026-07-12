import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Upload,
  Grid3x3,
  List,
  Download,
  Search,
  Folder,
  Archive,
  Loader2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import {
  getDocuments,
  uploadDocument,
  getDocumentDownloadUrl,
  archiveDocument,
} from "@/server/functions/documents";
import type { DocumentDTO } from "@/server/services/documents.service";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Member Applications",
  "Assistance Documents",
  "Financial Records",
  "Board Resolutions",
  "Other",
];

export const Route = createFileRoute("/_shell/documents")({
  head: () => ({ meta: [{ title: "Documents — DAYONG" }] }),
  loader: () => getDocuments(),
  component: DocumentsPage,
});

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function DocumentsPage() {
  const { files, folders } = Route.useLoaderData();
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");

  const filtered = q ? files.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())) : files;

  async function handleDownload(id: string) {
    try {
      const url = await getDocumentDownloadUrl({ data: id });
      window.open(url, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed.");
    }
  }

  async function handleArchive(id: string) {
    try {
      await archiveDocument({ data: id });
      toast.success("Document archived.");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Central library for member forms, assistance documents, and official records."
        actions={<UploadDialog onUploaded={() => router.invalidate()} />}
      />

      {folders.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {folders.map((f) => (
            <div key={f.name} className="rounded-2xl border border-border bg-card p-5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Folder className="h-5 w-5" />
              </div>
              <div className="mt-3 font-medium">{f.name}</div>
              <div className="text-xs text-muted-foreground">{f.count} files</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium">All files</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search files…"
                className="h-9 w-64 rounded-lg border border-input bg-muted/30 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="flex rounded-lg border border-border p-0.5">
              <Button
                size="icon"
                variant={view === "grid" ? "default" : "ghost"}
                className="h-7 w-7"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={view === "list" ? "default" : "ghost"}
                className="h-7 w-7"
                onClick={() => setView("list")}
                aria-label="List view"
                aria-pressed={view === "list"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No documents yet. Use the Upload button to add files.
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => handleDownload(f.id)}
                className="group rounded-xl border border-border p-3 text-left transition hover:border-primary/30 hover:bg-accent/40"
              >
                <div className="mb-3 grid aspect-square place-items-center rounded-lg bg-muted/50">
                  <FileIcon type={f.type} />
                </div>
                <div className="truncate text-xs font-medium">{f.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {f.sizeLabel} · {formatDate(f.updatedAt)}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Size</th>
                  <th className="px-3 py-3 font-medium">Updated</th>
                  <th className="px-3 py-3 font-medium">By</th>
                  <th className="w-24 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted/60">
                          <FileIcon type={f.type} small />
                        </div>
                        <span className="font-medium">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{f.category}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{f.sizeLabel}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {formatDate(f.updatedAt)}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{f.by}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          aria-label="Download file"
                          onClick={() => handleDownload(f.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          aria-label="Archive file"
                          onClick={() => handleArchive(f.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
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

function FileIcon({ type, small }: { type: DocumentDTO["type"]; small?: boolean }) {
  const cls = small ? "h-4 w-4" : "h-8 w-8 text-muted-foreground";
  return type === "image" ? <ImageIcon className={cls} /> : <FileText className={cls} />;
}

function UploadDialog({ onUploaded }: { onUploaded: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return toast.error("Choose a file to upload.");
    setUploading(true);
    try {
      const dataBase64 = await fileToBase64(file);
      await uploadDocument({
        data: {
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          category,
          dataBase64,
        },
      });
      toast.success("Document uploaded", { description: file.name });
      setOpen(false);
      setFile(null);
      onUploaded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>Add a file to the document library.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>File</Label>
            <Input
              ref={inputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading} className="gap-1.5">
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
