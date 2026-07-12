/** Read-only report data server functions. */
import { createServerFn } from "@tanstack/react-start";
import { membersService } from "../services/members.service";
import { contributionsService } from "../services/contributions.service";
import { eventsService, type CollectionEventDTO } from "../services/events.service";
import { assistanceService } from "../services/assistance.service";
import { financialsService, type DetailedMonth } from "../services/financials.service";
import { requireSessionUser } from "../auth";
import type { MemberDTO, MemberStats, ContributionDTO, AssistanceDTO } from "../dto";

const STAFF = ["admin", "treasurer", "collector", "secretary", "viewer"] as const;

export const getMembersReport = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ members: MemberDTO[]; stats: MemberStats }> => {
    await requireSessionUser([...STAFF]);
    const [members, stats] = await Promise.all([membersService.list(), membersService.stats()]);
    return { members, stats };
  },
);

export const getContributionsReport = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContributionDTO[]> => {
    await requireSessionUser([...STAFF]);
    return contributionsService.list();
  },
);

export const getEventsReport = createServerFn({ method: "GET" }).handler(
  async (): Promise<CollectionEventDTO[]> => {
    await requireSessionUser([...STAFF]);
    return eventsService.list();
  },
);

export const getAssistanceReport = createServerFn({ method: "GET" }).handler(
  async (): Promise<AssistanceDTO[]> => {
    await requireSessionUser([...STAFF]);
    return assistanceService.list();
  },
);

export interface FinancialReport {
  monthly: DetailedMonth[];
  fund: {
    balance: number;
    activeMembers: number;
    approvedAssistance: number;
    pendingAssistance: number;
  };
}

export const getFinancialReport = createServerFn({ method: "GET" }).handler(
  async (): Promise<FinancialReport> => {
    await requireSessionUser([...STAFF]);
    const [monthly, overview, memberStats, assistStats] = await Promise.all([
      financialsService.monthlyDetailed(),
      financialsService.overview(),
      membersService.stats(),
      assistanceService.stats(),
    ]);
    return {
      monthly,
      fund: {
        balance: overview.stats.cashOnHand,
        activeMembers: memberStats.active,
        approvedAssistance: assistStats.approved,
        pendingAssistance: assistStats.pending,
      },
    };
  },
);
