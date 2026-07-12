import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { contributions, members, collectionEvents } from "../db/schema";

type ContributionInsert = typeof contributions.$inferInsert;

const joinedColumns = {
  id: contributions.id,
  memberId: contributions.memberId,
  amount: contributions.amount,
  status: contributions.status,
  method: contributions.method,
  eventId: contributions.eventId,
  receiptNo: contributions.receiptNo,
  paidAt: contributions.paidAt,
  recordedByName: contributions.recordedByName,
  memberFirstName: members.firstName,
  memberLastName: members.lastName,
  memberNo: members.memberNo,
  eventName: collectionEvents.name,
};

export const contributionsRepo = {
  listWithMember() {
    return getDb()
      .select(joinedColumns)
      .from(contributions)
      .innerJoin(members, eq(contributions.memberId, members.id))
      .leftJoin(collectionEvents, eq(contributions.eventId, collectionEvents.id))
      .orderBy(desc(contributions.paidAt));
  },

  listByMemberId(memberId: string) {
    return getDb()
      .select(joinedColumns)
      .from(contributions)
      .innerJoin(members, eq(contributions.memberId, members.id))
      .leftJoin(collectionEvents, eq(contributions.eventId, collectionEvents.id))
      .where(eq(contributions.memberId, memberId))
      .orderBy(desc(contributions.paidAt));
  },

  findById(id: string) {
    return getDb()
      .select(joinedColumns)
      .from(contributions)
      .innerJoin(members, eq(contributions.memberId, members.id))
      .leftJoin(collectionEvents, eq(contributions.eventId, collectionEvents.id))
      .where(eq(contributions.id, id))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  },

  listByEventId(eventId: string) {
    return getDb()
      .select(joinedColumns)
      .from(contributions)
      .innerJoin(members, eq(contributions.memberId, members.id))
      .leftJoin(collectionEvents, eq(contributions.eventId, collectionEvents.id))
      .where(eq(contributions.eventId, eventId))
      .orderBy(desc(contributions.paidAt));
  },

  insert(value: ContributionInsert) {
    return getDb()
      .insert(contributions)
      .values(value)
      .returning()
      .then((rows) => rows[0]);
  },

  async maxReceiptSuffix(): Promise<number> {
    const rows = await getDb()
      .select({ receiptNo: contributions.receiptNo })
      .from(contributions)
      .orderBy(desc(contributions.receiptNo))
      .limit(1);
    const latest = rows[0]?.receiptNo ?? "";
    const digits = latest.replace(/\D/g, "");
    return digits ? Number(digits) : 0;
  },
};

export type ContributionRow = Awaited<ReturnType<typeof contributionsRepo.listWithMember>>[number];
