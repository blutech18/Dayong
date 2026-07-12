/** Assistance server functions (RPC surface for the UI). */
import { createServerFn } from "@tanstack/react-start";
import { assistanceService } from "../services/assistance.service";
import { requireSessionUser } from "../auth";
import { createAssistanceSchema, assistanceActionSchema } from "../validators/assistance";
import type { AssistanceDTO, AssistanceStatsDTO } from "../dto";

const STAFF = ["admin", "treasurer", "collector", "secretary", "viewer"] as const;
// Filing a request on a member's behalf.
const FILERS = ["admin", "treasurer", "collector", "secretary"] as const;
// Verifying documents (staff step).
const VERIFIERS = ["admin", "treasurer", "secretary"] as const;
// Approving / rejecting / releasing funds (admin + treasurer).
const APPROVERS = ["admin", "treasurer"] as const;

/** List all assistance requests plus summary stats. */
export const getAssistancePage = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ requests: AssistanceDTO[]; stats: AssistanceStatsDTO }> => {
    await requireSessionUser([...STAFF]);
    const [requests, stats] = await Promise.all([
      assistanceService.list(),
      assistanceService.stats(),
    ]);
    return { requests, stats };
  },
);

/** File a new assistance request. */
export const createAssistance = createServerFn({ method: "POST" })
  .validator(createAssistanceSchema)
  .handler(async ({ data }): Promise<AssistanceDTO> => {
    await requireSessionUser([...FILERS]);
    return assistanceService.create(data);
  });

/** Advance a request through the approval workflow. */
export const transitionAssistance = createServerFn({ method: "POST" })
  .validator(assistanceActionSchema)
  .handler(async ({ data }): Promise<AssistanceDTO> => {
    // "verify" is a staff step; approve/reject/release require an approver.
    const allowed = data.action === "verify" ? VERIFIERS : APPROVERS;
    const user = await requireSessionUser([...allowed]);
    return assistanceService.transition(data.id, data.action, data.note, {
      id: user.id,
      name: user.name,
    });
  });
