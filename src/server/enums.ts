/** Enum value unions derived from the DB schema, safe to import anywhere. */
import {
  memberStatus,
  paymentStatus,
  paymentMethod,
  assistanceStatus,
  assistanceCategory,
} from "./db/schema";

export type MemberStatus = (typeof memberStatus.enumValues)[number];
export type PaymentStatus = (typeof paymentStatus.enumValues)[number];
export type PaymentMethod = (typeof paymentMethod.enumValues)[number];
export type AssistanceStatus = (typeof assistanceStatus.enumValues)[number];
export type AssistanceCategory = (typeof assistanceCategory.enumValues)[number];
