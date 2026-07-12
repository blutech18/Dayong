import { assistanceRepo, type AssistanceRow } from "../repositories/assistance.repo";
import { membersRepo } from "../repositories/members.repo";
import { notificationsService } from "./notifications.service";
import { sendEmail, emailTemplate } from "../email";
import { getDb } from "../db/client";
import { financialTransactions } from "../db/schema";
import type { AssistanceDTO, AssistanceStatsDTO } from "../dto";
import type { AssistanceStatus } from "../enums";
import type { CreateAssistanceInput, AssistanceAction } from "../validators/assistance";

function toDTO(r: AssistanceRow, documentsCount = 0): AssistanceDTO {
  return {
    id: r.id,
    requestNo: r.requestNo,
    memberId: r.memberId,
    memberName: `${r.memberFirstName} ${r.memberLastName}`.trim(),
    memberNo: r.memberNo,
    category: r.category,
    amount: Number(r.amount),
    reason: r.reason ?? "",
    status: r.status,
    submittedAt: r.submittedAt.toISOString(),
    reviewedBy: r.reviewedByName ?? undefined,
    documentsCount,
  };
}

/**
 * Allowed workflow transitions (spec §6):
 * submit → verify → review → approve/reject → release → archive.
 */
const TRANSITIONS: Record<AssistanceAction, { from: AssistanceStatus[]; to: AssistanceStatus }> = {
  verify: { from: ["pending"], to: "under_review" },
  approve: { from: ["pending", "under_review"], to: "approved" },
  reject: { from: ["pending", "under_review", "approved"], to: "rejected" },
  release: { from: ["approved"], to: "released" },
};

export const assistanceService = {
  async list(): Promise<AssistanceDTO[]> {
    const [rows, docCounts] = await Promise.all([
      assistanceRepo.listAll(),
      assistanceRepo.documentCounts(),
    ]);
    return rows.map((r) => toDTO(r, docCounts.get(r.id) ?? 0));
  },

  async stats(): Promise<AssistanceStatsDTO> {
    const rows = await assistanceRepo.listAll();
    const stats: AssistanceStatsDTO = {
      total: rows.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    for (const r of rows) {
      if (r.status === "pending" || r.status === "under_review") stats.pending += 1;
      else if (r.status === "approved" || r.status === "released") stats.approved += 1;
      else if (r.status === "rejected") stats.rejected += 1;
    }
    return stats;
  },

  async create(input: CreateAssistanceInput): Promise<AssistanceDTO> {
    const member = await membersRepo.findById(input.memberId);
    if (!member) throw new Error("Member not found.");

    const year = new Date().getFullYear();
    const suffix = await assistanceRepo.maxRequestSuffix(year);
    const requestNo = `AR-${year}-${String(suffix + 1).padStart(4, "0")}`;

    const created = await assistanceRepo.insert({
      requestNo,
      memberId: input.memberId,
      category: input.category,
      amount: String(input.amount),
      reason: input.reason,
      status: "pending",
    });

    await assistanceRepo.addWorkflowStep({
      requestId: created.id,
      toStatus: "pending",
      note: "Request submitted.",
    });

    const row = await assistanceRepo.findById(created.id);
    return toDTO(row!);
  },

  /**
   * Move a request through the workflow. Validates the transition, records a
   * workflow step, and (on release) posts an assistance expense to the ledger.
   */
  async transition(
    id: string,
    action: AssistanceAction,
    note: string | undefined,
    actor: { id?: string; name: string },
  ): Promise<AssistanceDTO> {
    const current = await assistanceRepo.findById(id);
    if (!current) throw new Error("Request not found.");

    const rule = TRANSITIONS[action];
    if (!rule.from.includes(current.status)) {
      throw new Error(`Cannot ${action} a request that is "${current.status.replace(/_/g, " ")}".`);
    }

    const patch: Parameters<typeof assistanceRepo.update>[1] = { status: rule.to };
    if (action === "approve" || action === "reject") {
      patch.reviewedById = actor.id ?? null;
      patch.reviewedByName = actor.name;
    }
    if (action === "release") {
      patch.releasedAt = new Date();
    }

    await assistanceRepo.update(id, patch);
    await assistanceRepo.addWorkflowStep({
      requestId: id,
      fromStatus: current.status,
      toStatus: rule.to,
      note: note ?? null,
      actorId: actor.id ?? null,
      actorName: actor.name,
    });

    if (action === "release") {
      await getDb()
        .insert(financialTransactions)
        .values({
          type: "expense",
          category: "assistance",
          amount: current.amount,
          description: `Assistance released — ${current.requestNo}`,
          assistanceRequestId: id,
          recordedById: actor.id ?? null,
        });
    }

    // Notify staff (in-app) and the member (email) on member-facing outcomes.
    if (action === "approve" || action === "reject" || action === "release") {
      const label =
        action === "approve" ? "approved" : action === "reject" ? "rejected" : "released";
      const memberName = `${current.memberFirstName} ${current.memberLastName}`.trim();
      await notificationsService.notify({
        title: `Assistance ${label}`,
        body: `${current.requestNo} for ${memberName} was ${label}.`,
        type: action === "reject" ? "warning" : "success",
      });
      const member = await membersRepo.findById(current.memberId);
      if (member?.email) {
        await sendEmail({
          to: member.email,
          subject: `Your assistance request ${current.requestNo} was ${label}`,
          html: emailTemplate(
            `Assistance ${label}`,
            `<p>Hi ${current.memberFirstName},</p>
             <p>Your assistance request <b>${current.requestNo}</b> has been <b>${label}</b>.</p>
             <p>Please contact the office if you have any questions.</p>`,
          ),
        });
      }
    }

    const updated = await assistanceRepo.findById(id);
    return toDTO(updated!);
  },
};
