/** Member-portal server functions — scoped to the signed-in member's own data. */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireMember } from "../auth";
import { membersService } from "../services/members.service";
import { contributionsService } from "../services/contributions.service";
import { assistanceService } from "../services/assistance.service";
import { announcementsService } from "../services/announcements.service";
import { assistanceRepo } from "../repositories/assistance.repo";
import type { MemberDTO, ContributionDTO, AssistanceDTO } from "../dto";
import type { AnnouncementDTO } from "../services/announcements.service";

export interface MemberOverview {
  member: MemberDTO;
  pendingAssistance: number;
  contributionsTotal: number;
  announcements: AnnouncementDTO[];
}

/** Dashboard summary for the signed-in member. */
export const getMemberOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<MemberOverview> => {
    const { memberId } = await requireMember();
    const [member, assistance, announcements] = await Promise.all([
      membersService.getById(memberId),
      assistanceService.list(),
      announcementsService.list(),
    ]);
    if (!member) throw new Error("Member record not found.");
    const mine = assistance.filter((a) => a.memberId === memberId);
    return {
      member,
      pendingAssistance: mine.filter((a) => a.status === "pending" || a.status === "under_review")
        .length,
      contributionsTotal: member.contributionsTotal,
      announcements: announcements.slice(0, 4),
    };
  },
);

/** The signed-in member's contribution ledger. */
export const getMyContributions = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContributionDTO[]> => {
    const { memberId } = await requireMember();
    return contributionsService.listByMember(memberId);
  },
);

/** The signed-in member's assistance requests. */
export const getMyAssistance = createServerFn({ method: "GET" }).handler(
  async (): Promise<AssistanceDTO[]> => {
    const { memberId } = await requireMember();
    const rows = await assistanceRepo.listByMemberId(memberId);
    return rows.map((a) => ({
      id: a.id,
      requestNo: a.requestNo,
      memberId: a.memberId,
      memberName: `${a.memberFirstName} ${a.memberLastName}`.trim(),
      memberNo: a.memberNo,
      category: a.category,
      amount: Number(a.amount),
      reason: a.reason ?? "",
      status: a.status,
      submittedAt: a.submittedAt.toISOString(),
      reviewedBy: a.reviewedByName ?? undefined,
      documentsCount: 0,
    }));
  },
);

/** The signed-in member's own profile. */
export const getMyMemberProfile = createServerFn({ method: "GET" }).handler(
  async (): Promise<MemberDTO> => {
    const { memberId } = await requireMember();
    const member = await membersService.getById(memberId);
    if (!member) throw new Error("Member record not found.");
    return member;
  },
);

/** Update the signed-in member's own contact details. */
export const updateMyMemberProfile = createServerFn({ method: "POST" })
  .validator(
    z.object({
      firstName: z.string().trim().min(1),
      lastName: z.string().trim().min(1),
      email: z.string().trim().email().optional().or(z.literal("")),
      phone: z.string().trim().optional().or(z.literal("")),
      address: z.string().trim().optional().or(z.literal("")),
    }),
  )
  .handler(async ({ data }): Promise<MemberDTO> => {
    const { memberId } = await requireMember();
    return membersService.update(memberId, data);
  });

/** File an assistance request as the signed-in member. */
export const submitMyAssistance = createServerFn({ method: "POST" })
  .validator(
    z.object({
      category: z.enum(["medical", "burial", "calamity", "educational", "other"]),
      amount: z.number().positive(),
      reason: z.string().trim().min(1),
    }),
  )
  .handler(async ({ data }): Promise<AssistanceDTO> => {
    const { memberId } = await requireMember();
    return assistanceService.create({ memberId, ...data });
  });
