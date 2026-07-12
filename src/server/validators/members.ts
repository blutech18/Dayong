import { z } from "zod";
import { memberStatus } from "../db/schema";

export const createMemberSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  status: z.enum(memberStatus.enumValues).optional(),
});

export const updateMemberSchema = createMemberSchema.partial().extend({
  id: z.string().uuid(),
});

export const memberIdSchema = z.object({ id: z.string().uuid() });

export const setMemberStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(memberStatus.enumValues),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
