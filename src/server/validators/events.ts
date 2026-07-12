import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().trim().min(1, "Event name is required"),
  scheduledAt: z.string().min(1, "Schedule date is required"),
  location: z.string().trim().optional(),
  collectorName: z.string().trim().optional(),
  expectedMembers: z.number().int().nonnegative().default(0),
  targetAmount: z.number().nonnegative().default(0),
});

export const eventIdSchema = z.object({ id: z.string().uuid() });

export type CreateEventInput = z.infer<typeof createEventSchema>;
