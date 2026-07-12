/** Collection-event server functions. */
import { createServerFn } from "@tanstack/react-start";
import { eventsService, type CollectionEventDTO } from "../services/events.service";
import { requireSessionUser } from "../auth";
import { createEventSchema, eventIdSchema } from "../validators/events";
import type { ContributionDTO } from "../dto";

const STAFF = ["admin", "treasurer", "collector", "secretary", "viewer"] as const;
const WRITERS = ["admin", "treasurer", "collector"] as const;

/** All collection events. */
export const getCollectionEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<CollectionEventDTO[]> => {
    await requireSessionUser([...STAFF]);
    return eventsService.list();
  },
);

/** A single event with its recorded payments and paid members. */
export const getCollectionEventDetail = createServerFn({ method: "GET" })
  .validator(eventIdSchema)
  .handler(
    async ({
      data,
    }): Promise<{
      event: CollectionEventDTO;
      contributions: ContributionDTO[];
      paidMembers: { id: string; name: string; memberNo: string }[];
    } | null> => {
      await requireSessionUser([...STAFF]);
      return eventsService.detail(data.id);
    },
  );

/** Schedule a new collection event. */
export const createCollectionEvent = createServerFn({ method: "POST" })
  .validator(createEventSchema)
  .handler(async ({ data }): Promise<CollectionEventDTO> => {
    await requireSessionUser([...WRITERS]);
    return eventsService.create(data);
  });
