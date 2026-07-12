/**
 * Data-transfer types returned by server functions to the UI.
 * Shapes intentionally mirror the original prototype types so route components
 * need minimal changes when switching from mock data to the database.
 */
import type {
  MemberStatus,
  PaymentStatus,
  PaymentMethod,
  AssistanceStatus,
  AssistanceCategory,
} from "./enums";

export interface MemberDTO {
  id: string;
  memberNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  joinedAt: string;
  status: MemberStatus;
  contributionsTotal: number;
  assistanceCount: number;
  lastPaymentAt: string;
  avatarSeed: string;
}

export interface ContributionDTO {
  id: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  eventId?: string;
  eventName?: string;
  receiptNo: string;
  paidAt: string;
  recordedBy: string;
}

export interface AssistanceDTO {
  id: string;
  requestNo: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  category: AssistanceCategory;
  amount: number;
  reason: string;
  status: AssistanceStatus;
  submittedAt: string;
  reviewedBy?: string;
  documentsCount: number;
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  archived: number;
}

export interface ContributionStats {
  collectedPaid: number;
  partial: number;
  count: number;
}

export interface AssistanceStatsDTO {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
