import { z } from "zod";
import { announcementCategory } from "../db/schema";

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Message is required"),
  category: z.enum(announcementCategory.enumValues).default("general"),
  pinned: z.boolean().default(false),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
