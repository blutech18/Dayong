import { contributionsRepo, type ContributionRow } from "../repositories/contributions.repo";
import { membersRepo } from "../repositories/members.repo";
import { notificationsService } from "./notifications.service";
import type { ContributionDTO, ContributionStats } from "../dto";
import type { RecordContributionInput } from "../validators/contributions";

function toDTO(r: ContributionRow): ContributionDTO {
  return {
    id: r.id,
    memberId: r.memberId,
    memberName: `${r.memberFirstName} ${r.memberLastName}`.trim(),
    memberNo: r.memberNo,
    amount: Number(r.amount),
    status: r.status,
    method: r.method,
    eventId: r.eventId ?? undefined,
    eventName: r.eventName ?? undefined,
    receiptNo: r.receiptNo,
    paidAt: r.paidAt.toISOString(),
    recordedBy: r.recordedByName ?? "System",
  };
}

export const contributionsService = {
  async list(): Promise<ContributionDTO[]> {
    const rows = await contributionsRepo.listWithMember();
    return rows.map(toDTO);
  },

  async listByMember(memberId: string): Promise<ContributionDTO[]> {
    const rows = await contributionsRepo.listByMemberId(memberId);
    return rows.map(toDTO);
  },

  async getById(id: string): Promise<ContributionDTO | null> {
    const row = await contributionsRepo.findById(id);
    return row ? toDTO(row) : null;
  },

  async listByEvent(eventId: string): Promise<ContributionDTO[]> {
    const rows = await contributionsRepo.listByEventId(eventId);
    return rows.map(toDTO);
  },

  async recordBatch(
    input: {
      eventId?: string;
      entries: { memberId: string; amount: number; method: "cash" | "gcash" | "bank" | "check" }[];
    },
    recordedBy: { id?: string; name: string },
  ): Promise<{ count: number; total: number }> {
    let total = 0;
    for (const entry of input.entries) {
      await this.record({ ...entry, status: "paid", eventId: input.eventId }, recordedBy);
      total += entry.amount;
    }
    return { count: input.entries.length, total };
  },

  async stats(): Promise<ContributionStats> {
    const rows = await contributionsRepo.listWithMember();
    let collectedPaid = 0;
    let partial = 0;
    for (const r of rows) {
      const amt = Number(r.amount);
      if (r.status === "paid") collectedPaid += amt;
      else if (r.status === "partial") partial += amt;
    }
    return { collectedPaid, partial, count: rows.length };
  },

  /**
   * Record a contribution: generates a receipt number, then updates the
   * member's running total and last-payment date. Paid amounts count toward
   * the ledger total.
   */
  async record(
    input: RecordContributionInput,
    recordedBy: { id?: string; name: string },
  ): Promise<ContributionDTO> {
    const member = await membersRepo.findById(input.memberId);
    if (!member) throw new Error("Member not found.");

    const suffix = await contributionsRepo.maxReceiptSuffix();
    const receiptNo = `OR-${String(Math.max(suffix + 1, 50001)).padStart(6, "0")}`;
    const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();

    const created = await contributionsRepo.insert({
      memberId: input.memberId,
      eventId: input.eventId ?? null,
      amount: String(input.amount),
      method: input.method,
      status: input.status,
      receiptNo,
      paidAt,
      recordedById: recordedBy.id ?? null,
      recordedByName: recordedBy.name,
    });

    if (input.status !== "unpaid") {
      const newTotal = Number(member.contributionsTotal) + input.amount;
      await membersRepo.update(member.id, {
        contributionsTotal: String(newTotal),
        lastPaymentAt: paidAt,
      });
    }

    await notificationsService.notify({
      title: "Contribution recorded",
      body: `${receiptNo} for ${member.firstName} ${member.lastName} — recorded by ${recordedBy.name}.`,
      type: "success",
    });

    const [row] = await contributionsRepo.listByMemberId(input.memberId);
    // `row` is the newest (ordered desc); fall back to a minimal map if needed.
    return row && row.id === created.id
      ? toDTO(row)
      : toDTO({
          id: created.id,
          memberId: created.memberId,
          amount: created.amount,
          status: created.status,
          method: created.method,
          eventId: created.eventId,
          receiptNo: created.receiptNo,
          paidAt: created.paidAt,
          recordedByName: created.recordedByName,
          memberFirstName: member.firstName,
          memberLastName: member.lastName,
          memberNo: member.memberNo,
          eventName: null,
        });
  },
};
