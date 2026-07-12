import { membersRepo } from "../repositories/members.repo";
import type { Member } from "../db/schema";
import type { MemberDTO, MemberStats } from "../dto";
import type { CreateMemberInput } from "../validators/members";

function toDTO(m: Member, assistanceCount = 0): MemberDTO {
  const name = `${m.firstName} ${m.lastName}`.trim();
  return {
    id: m.id,
    memberNo: m.memberNo,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.email ?? "",
    phone: m.phone ?? "",
    address: m.address ?? "",
    joinedAt: m.joinedAt.toISOString(),
    status: m.status,
    contributionsTotal: Number(m.contributionsTotal),
    assistanceCount,
    lastPaymentAt: (m.lastPaymentAt ?? m.joinedAt).toISOString(),
    avatarSeed: m.avatarSeed ?? name,
  };
}

export const membersService = {
  async list(): Promise<MemberDTO[]> {
    const [rows, counts] = await Promise.all([
      membersRepo.listAll(),
      membersRepo.assistanceCounts(),
    ]);
    return rows.map((m) => toDTO(m, counts.get(m.id) ?? 0));
  },

  async stats(): Promise<MemberStats> {
    const rows = await membersRepo.listAll();
    const stats: MemberStats = {
      total: rows.length,
      active: 0,
      inactive: 0,
      pending: 0,
      archived: 0,
    };
    for (const m of rows) stats[m.status] += 1;
    return stats;
  },

  async getById(id: string): Promise<MemberDTO | null> {
    const m = await membersRepo.findById(id);
    if (!m) return null;
    const count = await membersRepo.assistanceCountFor(id);
    return toDTO(m, count);
  },

  async update(id: string, patch: Partial<CreateMemberInput>): Promise<MemberDTO> {
    const updated = await membersRepo.update(id, {
      firstName: patch.firstName,
      lastName: patch.lastName,
      email: patch.email !== undefined ? patch.email || null : undefined,
      phone: patch.phone !== undefined ? patch.phone || null : undefined,
      address: patch.address !== undefined ? patch.address || null : undefined,
      status: patch.status,
    });
    const count = await membersRepo.assistanceCountFor(id);
    return toDTO(updated, count);
  },

  async setStatus(id: string, status: MemberDTO["status"]): Promise<MemberDTO> {
    const updated = await membersRepo.update(id, { status });
    const count = await membersRepo.assistanceCountFor(id);
    return toDTO(updated, count);
  },

  async create(input: CreateMemberInput): Promise<MemberDTO> {
    const suffix = await membersRepo.maxMemberNoSuffix();
    const memberNo = `DYG-${String(Math.max(suffix + 1, 1001)).padStart(4, "0")}`;
    const name = `${input.firstName} ${input.lastName}`.trim();
    const created = await membersRepo.insert({
      memberNo,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      status: input.status ?? "pending",
      avatarSeed: name,
    });
    return toDTO(created, 0);
  },
};
