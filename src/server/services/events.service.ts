import { eventsRepo } from "../repositories/events.repo";
import { contributionsService } from "./contributions.service";
import type { CollectionEvent } from "../db/schema";
import type { ContributionDTO } from "../dto";
import type { CreateEventInput } from "../validators/events";

export interface CollectionEventDTO {
  id: string;
  name: string;
  scheduledAt: string;
  location: string;
  collector: string;
  expectedMembers: number;
  collectedAmount: number;
  targetAmount: number;
  status: CollectionEvent["status"];
}

function toDTO(e: CollectionEvent): CollectionEventDTO {
  return {
    id: e.id,
    name: e.name,
    scheduledAt: e.scheduledAt.toISOString(),
    location: e.location ?? "",
    collector: e.collectorName ?? "Unassigned",
    expectedMembers: e.expectedMembers,
    collectedAmount: Number(e.collectedAmount),
    targetAmount: Number(e.targetAmount),
    status: e.status,
  };
}

export const eventsService = {
  async list(): Promise<CollectionEventDTO[]> {
    const rows = await eventsRepo.listAll();
    return rows.map(toDTO);
  },

  async detail(id: string): Promise<{
    event: CollectionEventDTO;
    contributions: ContributionDTO[];
    paidMembers: { id: string; name: string; memberNo: string }[];
  } | null> {
    const event = await eventsRepo.findById(id);
    if (!event) return null;
    const contributions = await contributionsService.listByEvent(id);

    // Distinct members who paid toward this event.
    const seen = new Map<string, { id: string; name: string; memberNo: string }>();
    for (const c of contributions) {
      if (!seen.has(c.memberId)) {
        seen.set(c.memberId, { id: c.memberId, name: c.memberName, memberNo: c.memberNo });
      }
    }

    return {
      event: toDTO(event),
      contributions,
      paidMembers: [...seen.values()],
    };
  },

  async create(input: CreateEventInput): Promise<CollectionEventDTO> {
    const created = await eventsRepo.insert({
      name: input.name,
      scheduledAt: new Date(input.scheduledAt),
      location: input.location || null,
      collectorName: input.collectorName || null,
      expectedMembers: input.expectedMembers,
      targetAmount: String(input.targetAmount),
      collectedAmount: "0",
      status: "upcoming",
    });
    return toDTO(created);
  },
};
