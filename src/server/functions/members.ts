/** Members server functions (RPC surface for the UI). */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { membersService } from "../services/members.service";
import { contributionsService } from "../services/contributions.service";
import { assistanceRepo } from "../repositories/assistance.repo";
import { membersRepo } from "../repositories/members.repo";
import { getSupabaseAdmin, getSupabaseServer } from "../supabase";
import { serverEnv } from "../env";
import { requireSessionUser } from "../auth";
import {
  createMemberSchema,
  updateMemberSchema,
  setMemberStatusSchema,
  memberIdSchema,
} from "../validators/members";
import type { MemberDTO, MemberStats, ContributionDTO, AssistanceDTO } from "../dto";

const STAFF = ["admin", "treasurer", "collector", "secretary", "viewer"] as const;
const WRITERS = ["admin", "treasurer", "secretary"] as const;

/** List all members plus summary stats. */
export const getMembersPage = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ members: MemberDTO[]; stats: MemberStats }> => {
    await requireSessionUser([...STAFF]);
    const [members, stats] = await Promise.all([membersService.list(), membersService.stats()]);
    return { members, stats };
  },
);

/** Fetch a single member by id. */
export const getMember = createServerFn({ method: "GET" })
  .validator(memberIdSchema)
  .handler(async ({ data }): Promise<MemberDTO | null> => {
    await requireSessionUser([...STAFF]);
    return membersService.getById(data.id);
  });

/** Fetch a member with their contribution and assistance history. */
export const getMemberDetail = createServerFn({ method: "GET" })
  .validator(memberIdSchema)
  .handler(
    async ({
      data,
    }): Promise<{
      member: MemberDTO;
      portalEnabled: boolean;
      contributions: ContributionDTO[];
      assistance: AssistanceDTO[];
    } | null> => {
      await requireSessionUser([...STAFF]);
      const raw = await membersRepo.findById(data.id);
      if (!raw) return null;
      const member = await membersService.getById(data.id);
      if (!member) return null;
      const [contributions, assistanceRows] = await Promise.all([
        contributionsService.listByMember(data.id),
        assistanceRepo.listByMemberId(data.id),
      ]);
      const assistance: AssistanceDTO[] = assistanceRows.map((a) => ({
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
      return { member, portalEnabled: !!raw.userId, contributions, assistance };
    },
  );

/** Register a new member. */
export const createMember = createServerFn({ method: "POST" })
  .validator(createMemberSchema)
  .handler(async ({ data }): Promise<MemberDTO> => {
    await requireSessionUser([...WRITERS]);
    return membersService.create(data);
  });

/** Update an existing member. */
export const updateMember = createServerFn({ method: "POST" })
  .validator(updateMemberSchema)
  .handler(async ({ data }): Promise<MemberDTO> => {
    await requireSessionUser([...WRITERS]);
    const { id, ...patch } = data;
    return membersService.update(id, patch);
  });

/** Change a member's status (e.g. archive). */
export const setMemberStatus = createServerFn({ method: "POST" })
  .validator(setMemberStatusSchema)
  .handler(async ({ data }): Promise<MemberDTO> => {
    await requireSessionUser([...WRITERS]);
    return membersService.setStatus(data.id, data.status);
  });

/**
 * Enable member-portal access: creates a Supabase auth account for the member,
 * links it, and emails a password-reset link so they can set their password.
 * Admin only.
 */
export const enableMemberPortal = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireSessionUser(["admin"]);
    const member = await membersRepo.findById(data.id);
    if (!member) throw new Error("Member not found.");
    if (!member.email) throw new Error("This member needs an email address first.");
    if (member.userId) throw new Error("Portal access is already enabled for this member.");

    const admin = getSupabaseAdmin();
    const { data: created, error } = await admin.auth.admin.createUser({
      email: member.email,
      password: crypto.randomUUID() + "Aa1!",
      email_confirm: true,
    });
    if (error || !created.user) {
      throw new Error(error?.message ?? "Failed to create the member account.");
    }

    await membersRepo.update(member.id, { userId: created.user.id });

    const supabase = getSupabaseServer();
    await supabase.auth.resetPasswordForEmail(member.email, {
      redirectTo: `${serverEnv.appUrl}/auth/reset-password`,
    });

    return { ok: true };
  });

export type MemberOption = Pick<MemberDTO, "id" | "firstName" | "lastName" | "memberNo">;

/** Lightweight member list for select/search pickers. */
export const getMemberOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<MemberOption[]> => {
    await requireSessionUser([...STAFF]);
    const members = await membersService.list();
    return members.map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      memberNo: m.memberNo,
    }));
  },
);
