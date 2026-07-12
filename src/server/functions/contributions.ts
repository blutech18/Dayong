/** Contributions server functions (RPC surface for the UI). */
import { createServerFn } from "@tanstack/react-start";
import { contributionsService } from "../services/contributions.service";
import { membersService } from "../services/members.service";
import { requireSessionUser } from "../auth";
import { recordContributionSchema, recordBatchSchema } from "../validators/contributions";
import type { ContributionDTO, ContributionStats, MemberDTO } from "../dto";

const STAFF = ["admin", "treasurer", "collector", "secretary", "viewer"] as const;
const WRITERS = ["admin", "treasurer", "collector"] as const;

/** List all contributions with member/event details, plus stats. */
export const getContributionsPage = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    contributions: ContributionDTO[];
    stats: ContributionStats;
    members: Pick<MemberDTO, "id" | "firstName" | "lastName" | "memberNo">[];
  }> => {
    await requireSessionUser([...STAFF]);
    const [contributions, stats, allMembers] = await Promise.all([
      contributionsService.list(),
      contributionsService.stats(),
      membersService.list(),
    ]);
    return {
      contributions,
      stats,
      members: allMembers.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        memberNo: m.memberNo,
      })),
    };
  },
);

/** Fetch a single contribution (for the official receipt). */
export const getReceipt = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data }): Promise<ContributionDTO | null> => {
    await requireSessionUser([...STAFF]);
    return contributionsService.getById(data);
  });

/** Record a single contribution and update the member ledger. */
export const recordContribution = createServerFn({ method: "POST" })
  .validator(recordContributionSchema)
  .handler(async ({ data }): Promise<ContributionDTO> => {
    const user = await requireSessionUser([...WRITERS]);
    return contributionsService.record(data, { id: user.id, name: user.name });
  });

/** Record a batch of contributions in one go. */
export const recordContributionBatch = createServerFn({ method: "POST" })
  .validator(recordBatchSchema)
  .handler(async ({ data }): Promise<{ count: number; total: number }> => {
    const user = await requireSessionUser([...WRITERS]);
    return contributionsService.recordBatch(data, { id: user.id, name: user.name });
  });
