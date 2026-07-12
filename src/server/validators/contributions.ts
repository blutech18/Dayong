import { z } from "zod";
import { paymentMethod, paymentStatus } from "../db/schema";

export const recordContributionSchema = z.object({
  memberId: z.string().uuid(),
  amount: z.number().positive("Amount must be greater than zero"),
  method: z.enum(paymentMethod.enumValues).default("cash"),
  status: z.enum(paymentStatus.enumValues).default("paid"),
  eventId: z.string().uuid().optional(),
  paidAt: z.string().datetime().optional(),
});

export const recordBatchSchema = z.object({
  eventId: z.string().uuid().optional(),
  entries: z
    .array(
      z.object({
        memberId: z.string().uuid(),
        amount: z.number().positive(),
        method: z.enum(paymentMethod.enumValues).default("cash"),
      }),
    )
    .min(1, "Add at least one entry"),
});

export type RecordContributionInput = z.infer<typeof recordContributionSchema>;
