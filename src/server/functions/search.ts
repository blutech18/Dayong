/** Global search dataset (filtered client-side for live results). */
import { createServerFn } from "@tanstack/react-start";
import { membersService } from "../services/members.service";
import { contributionsService } from "../services/contributions.service";
import { assistanceService } from "../services/assistance.service";
import { announcementsService, type AnnouncementDTO } from "../services/announcements.service";
import { requireSessionUser } from "../auth";
import type { MemberDTO, ContributionDTO, AssistanceDTO } from "../dto";

export interface SearchDataset {
  members: MemberDTO[];
  contributions: ContributionDTO[];
  assistance: AssistanceDTO[];
  announcements: AnnouncementDTO[];
}

export const getSearchDataset = createServerFn({ method: "GET" }).handler(
  async (): Promise<SearchDataset> => {
    await requireSessionUser();
    const [members, contributions, assistance, announcements] = await Promise.all([
      membersService.list(),
      contributionsService.list(),
      assistanceService.list(),
      announcementsService.list(),
    ]);
    return { members, contributions, assistance, announcements };
  },
);
