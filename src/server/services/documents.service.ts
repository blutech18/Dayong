import { documentsRepo, type DocumentRow } from "../repositories/documents.repo";
import { getSupabaseAdmin } from "../supabase";

export const DOCUMENTS_BUCKET = "documents";

export type DocumentType = "pdf" | "image" | "sheet" | "other";

export interface DocumentDTO {
  id: string;
  name: string;
  category: string;
  type: DocumentType;
  sizeLabel: string;
  updatedAt: string;
  by: string;
}

export interface DocumentsPageData {
  files: DocumentDTO[];
  folders: { name: string; count: number }[];
}

function fileType(name: string, mime: string | null): DocumentType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (mime?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return "image";
  if (ext === "pdf" || mime === "application/pdf") return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext)) return "sheet";
  return "other";
}

function sizeLabel(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toDTO(r: DocumentRow): DocumentDTO {
  return {
    id: r.id,
    name: r.name,
    category: r.category ?? "Uncategorized",
    type: fileType(r.name, r.mimeType),
    sizeLabel: sizeLabel(r.sizeBytes),
    updatedAt: r.createdAt.toISOString(),
    by: r.uploaderName ?? "System",
  };
}

export const documentsService = {
  async page(): Promise<DocumentsPageData> {
    const [rows, counts] = await Promise.all([
      documentsRepo.listActive(),
      documentsRepo.categoryCounts(),
    ]);
    return {
      files: rows.map(toDTO),
      folders: [...counts.entries()].map(([name, count]) => ({ name, count })),
    };
  },

  /** Upload a base64-encoded file to storage and record its metadata. */
  async upload(
    input: { name: string; mimeType: string; category: string; dataBase64: string },
    uploadedById: string,
  ): Promise<DocumentDTO> {
    const admin = getSupabaseAdmin();
    const buffer = Buffer.from(input.dataBase64, "base64");
    const storagePath = `${crypto.randomUUID()}-${input.name}`;

    const { error } = await admin.storage
      .from(DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, { contentType: input.mimeType, upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const created = await documentsRepo.insert({
      name: input.name,
      storagePath,
      mimeType: input.mimeType,
      sizeBytes: buffer.byteLength,
      category: input.category,
      uploadedById,
    });

    return toDTO({
      id: created.id,
      name: created.name,
      storagePath: created.storagePath,
      mimeType: created.mimeType,
      sizeBytes: created.sizeBytes,
      category: created.category,
      archived: created.archived,
      createdAt: created.createdAt,
      uploaderName: null,
    });
  },

  /** A short-lived signed URL for downloading a document. */
  async downloadUrl(id: string): Promise<string> {
    const doc = await documentsRepo.findById(id);
    if (!doc) throw new Error("Document not found.");
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(doc.storagePath, 60);
    if (error || !data) throw new Error(`Could not create download link: ${error?.message}`);
    return data.signedUrl;
  },

  async archive(id: string) {
    await documentsRepo.setArchived(id, true);
    return { ok: true };
  },
};
