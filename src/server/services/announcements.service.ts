import { announcementsRepo } from "../repositories/announcements.repo";
import type { Announcement } from "../db/schema";
import type { CreateAnnouncementInput } from "../validators/announcements";

export interface AnnouncementDTO {
  id: string;
  title: string;
  body: string;
  category: Announcement["category"];
  pinned: boolean;
  publishedAt: string;
  author: string;
}

function toDTO(a: Announcement): AnnouncementDTO {
  return {
    id: a.id,
    title: a.title,
    body: a.body,
    category: a.category,
    pinned: a.pinned,
    publishedAt: a.publishedAt.toISOString(),
    author: a.authorName ?? "System",
  };
}

export const announcementsService = {
  async list(): Promise<AnnouncementDTO[]> {
    const rows = await announcementsRepo.listAll();
    return rows.map(toDTO);
  },

  async create(
    input: CreateAnnouncementInput,
    author: { id?: string; name: string },
  ): Promise<AnnouncementDTO> {
    const created = await announcementsRepo.insert({
      title: input.title,
      body: input.body,
      category: input.category,
      pinned: input.pinned,
      authorId: author.id ?? null,
      authorName: author.name,
    });
    return toDTO(created);
  },
};
