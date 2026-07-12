import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { documents, profiles } from "../db/schema";

type DocumentInsert = typeof documents.$inferInsert;

const columns = {
  id: documents.id,
  name: documents.name,
  storagePath: documents.storagePath,
  mimeType: documents.mimeType,
  sizeBytes: documents.sizeBytes,
  category: documents.category,
  archived: documents.archived,
  createdAt: documents.createdAt,
  uploaderName: profiles.name,
};

export const documentsRepo = {
  listActive() {
    return getDb()
      .select(columns)
      .from(documents)
      .leftJoin(profiles, eq(documents.uploadedById, profiles.id))
      .where(eq(documents.archived, false))
      .orderBy(desc(documents.createdAt));
  },

  findById(id: string) {
    return getDb()
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  },

  async categoryCounts(): Promise<Map<string, number>> {
    const rows = await getDb()
      .select({ category: documents.category, count: sql<number>`count(*)::int` })
      .from(documents)
      .where(eq(documents.archived, false))
      .groupBy(documents.category);
    return new Map(rows.map((r) => [r.category ?? "Uncategorized", r.count]));
  },

  insert(value: DocumentInsert) {
    return getDb()
      .insert(documents)
      .values(value)
      .returning()
      .then((rows) => rows[0]);
  },

  setArchived(id: string, archived: boolean) {
    return getDb().update(documents).set({ archived }).where(eq(documents.id, id));
  },
};

export type DocumentRow = Awaited<ReturnType<typeof documentsRepo.listActive>>[number];
