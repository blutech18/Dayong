import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { members, assistanceRequests, type NewMember } from "../db/schema";

export const membersRepo = {
  listAll() {
    return getDb().select().from(members).orderBy(desc(members.createdAt));
  },

  findById(id: string) {
    return getDb()
      .select()
      .from(members)
      .where(eq(members.id, id))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  },

  /** Map of memberId → number of assistance requests. */
  async assistanceCounts(): Promise<Map<string, number>> {
    const rows = await getDb()
      .select({
        memberId: assistanceRequests.memberId,
        count: sql<number>`count(*)::int`,
      })
      .from(assistanceRequests)
      .groupBy(assistanceRequests.memberId);
    return new Map(rows.map((r) => [r.memberId, r.count]));
  },

  async assistanceCountFor(memberId: string): Promise<number> {
    const [row] = await getDb()
      .select({ count: sql<number>`count(*)::int` })
      .from(assistanceRequests)
      .where(eq(assistanceRequests.memberId, memberId));
    return row?.count ?? 0;
  },

  insert(value: NewMember) {
    return getDb()
      .insert(members)
      .values(value)
      .returning()
      .then((rows) => rows[0]);
  },

  update(id: string, patch: Partial<NewMember>) {
    return getDb()
      .update(members)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning()
      .then((rows) => rows[0]);
  },

  findByUserId(userId: string) {
    return getDb()
      .select()
      .from(members)
      .where(eq(members.userId, userId))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  },

  /** Highest numeric suffix currently used in member numbers (DYG-####). */
  async maxMemberNoSuffix(): Promise<number> {
    const [row] = await getDb()
      .select({
        max: sql<number>`coalesce(max(nullif(regexp_replace(${members.memberNo}, '\\D', '', 'g'), '')::int), 0)`,
      })
      .from(members);
    return row?.max ?? 0;
  },
};
