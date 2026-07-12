/** Announcement server functions. */
import { createServerFn } from "@tanstack/react-start";
import { announcementsService, type AnnouncementDTO } from "../services/announcements.service";
import { requireSessionUser } from "../auth";
import { createAnnouncementSchema } from "../validators/announcements";

const STAFF = ["admin", "treasurer", "collector", "secretary", "viewer"] as const;
const WRITERS = ["admin", "secretary"] as const;

/** All announcements (pinned first). */
export const getAnnouncements = createServerFn({ method: "GET" }).handler(
  async (): Promise<AnnouncementDTO[]> => {
    await requireSessionUser([...STAFF]);
    return announcementsService.list();
  },
);

/** Publish a new announcement. */
export const createAnnouncement = createServerFn({ method: "POST" })
  .validator(createAnnouncementSchema)
  .handler(async ({ data }): Promise<AnnouncementDTO> => {
    const user = await requireSessionUser([...WRITERS]);
    return announcementsService.create(data, { id: user.id, name: user.name });
  });
