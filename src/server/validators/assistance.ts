import { z } from "zod";
import { assistanceCategory } from "../db/schema";

export const createAssistanceSchema = z.object({
  memberId: z.string().uuid(),
  category: z.enum(assistanceCategory.enumValues),
  amount: z.number().positive("Amount must be greater than zero"),
  reason: z.string().trim().min(1, "Reason is required"),
});

export const assistanceActionSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["verify", "approve", "reject", "release"]),
  note: z.string().trim().optional(),
});

export type CreateAssistanceInput = z.infer<typeof createAssistanceSchema>;
export type AssistanceAction = z.infer<typeof assistanceActionSchema>["action"];
