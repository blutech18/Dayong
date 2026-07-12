/** Document server functions (metadata in Postgres, files in Supabase Storage). */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  documentsService,
  type DocumentsPageData,
  type DocumentDTO,
} from "../services/documents.service";
import { requireSessionUser } from "../auth";

const STAFF = ["admin", "treasurer", "collector", "secretary", "viewer"] as const;
const WRITERS = ["admin", "treasurer", "secretary"] as const;

/** Active documents plus folder (category) counts. */
export const getDocuments = createServerFn({ method: "GET" }).handler(
  async (): Promise<DocumentsPageData> => {
    await requireSessionUser([...STAFF]);
    return documentsService.page();
  },
);

/** Upload a document (base64 payload) and record it. */
export const uploadDocument = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1),
      mimeType: z.string().min(1),
      category: z.string().min(1),
      dataBase64: z.string().min(1),
    }),
  )
  .handler(async ({ data }): Promise<DocumentDTO> => {
    const user = await requireSessionUser([...WRITERS]);
    return documentsService.upload(data, user.id);
  });

/** Signed, short-lived download URL for a document. */
export const getDocumentDownloadUrl = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }): Promise<string> => {
    await requireSessionUser([...STAFF]);
    return documentsService.downloadUrl(data);
  });

/** Archive (soft-delete) a document. */
export const archiveDocument = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    await requireSessionUser([...WRITERS]);
    return documentsService.archive(data);
  });
