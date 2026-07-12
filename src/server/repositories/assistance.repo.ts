import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { assistanceRequests, assistanceWorkflowSteps, documents, members } from "../db/schema";

type AssistanceInsert = typeof assistanceRequests.$inferInsert;
type WorkflowInsert = typeof assistanceWorkflowSteps.$inferInsert;

const columns = {
  id: assistanceRequests.id,
  requestNo: assistanceRequests.requestNo,
  memberId: assistanceRequests.memberId,
  category: assistanceRequests.category,
  amount: assistanceRequests.amount,
  reason: assistanceRequests.reason,
  status: assistanceRequests.status,
  submittedAt: assistanceRequests.submittedAt,
  reviewedByName: assistanceRequests.reviewedByName,
  releasedAt: assistanceRequests.releasedAt,
  memberFirstName: members.firstName,
  memberLastName: members.lastName,
  memberNo: members.memberNo,
};

export const assistanceRepo = {
  listAll() {
    return getDb()
      .select(columns)
      .from(assistanceRequests)
      .innerJoin(members, eq(assistanceRequests.memberId, members.id))
      .orderBy(desc(assistanceRequests.submittedAt));
  },

  listByMemberId(memberId: string) {
    return getDb()
      .select(columns)
      .from(assistanceRequests)
      .innerJoin(members, eq(assistanceRequests.memberId, members.id))
      .where(eq(assistanceRequests.memberId, memberId))
      .orderBy(desc(assistanceRequests.submittedAt));
  },

  findById(id: string) {
    return getDb()
      .select(columns)
      .from(assistanceRequests)
      .innerJoin(members, eq(assistanceRequests.memberId, members.id))
      .where(eq(assistanceRequests.id, id))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  },

  /** Map of assistanceRequestId → attached document count. */
  async documentCounts(): Promise<Map<string, number>> {
    const rows = await getDb()
      .select({
        requestId: documents.assistanceRequestId,
        count: sql<number>`count(*)::int`,
      })
      .from(documents)
      .where(sql`${documents.assistanceRequestId} is not null`)
      .groupBy(documents.assistanceRequestId);
    return new Map(rows.filter((r) => r.requestId).map((r) => [r.requestId as string, r.count]));
  },

  workflowSteps(requestId: string) {
    return getDb()
      .select()
      .from(assistanceWorkflowSteps)
      .where(eq(assistanceWorkflowSteps.requestId, requestId))
      .orderBy(assistanceWorkflowSteps.createdAt);
  },

  insert(value: AssistanceInsert) {
    return getDb()
      .insert(assistanceRequests)
      .values(value)
      .returning()
      .then((rows) => rows[0]);
  },

  update(id: string, patch: Partial<AssistanceInsert>) {
    return getDb()
      .update(assistanceRequests)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(assistanceRequests.id, id))
      .returning()
      .then((rows) => rows[0]);
  },

  addWorkflowStep(value: WorkflowInsert) {
    return getDb().insert(assistanceWorkflowSteps).values(value);
  },

  /** Highest request-number suffix used this year (AR-YYYY-####). */
  async maxRequestSuffix(year: number): Promise<number> {
    const prefix = `AR-${year}-`;
    const [row] = await getDb()
      .select({
        max: sql<number>`coalesce(max(nullif(regexp_replace(${assistanceRequests.requestNo}, '\\D', '', 'g'), '')::bigint) % 10000, 0)::int`,
      })
      .from(assistanceRequests)
      .where(sql`${assistanceRequests.requestNo} like ${prefix + "%"}`);
    return row?.max ?? 0;
  },
};

export type AssistanceRow = Awaited<ReturnType<typeof assistanceRepo.listAll>>[number];
