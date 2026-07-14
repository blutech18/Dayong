/**
 * DAYONG database schema (Drizzle ORM / PostgreSQL).
 *
 * Maps the domain described in docs/DAYONG_Member_Assistance_System.md and the
 * shapes currently used by the UI (see src/lib/mock-data.ts).
 *
 * Staff/admin authentication is handled by Supabase Auth (auth.users). The
 * `profiles` table extends an auth user with role, status and contact info.
 */
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ── Enums ───────────────────────────────────────────────────────────────────

export const userRole = pgEnum("user_role", [
  "admin",
  "treasurer",
  "collector",
  "secretary",
  "viewer",
  "member",
]);

export const accountStatus = pgEnum("account_status", [
  "active",
  "invited",
  "inactive",
  "disabled",
]);

export const memberStatus = pgEnum("member_status", ["active", "inactive", "pending", "archived"]);

export const paymentStatus = pgEnum("payment_status", ["paid", "partial", "unpaid"]);

export const paymentMethod = pgEnum("payment_method", ["cash", "gcash", "bank", "check"]);

export const eventStatus = pgEnum("event_status", ["upcoming", "in_progress", "completed"]);

export const assistanceStatus = pgEnum("assistance_status", [
  "pending",
  "under_review",
  "approved",
  "released",
  "rejected",
]);

export const assistanceCategory = pgEnum("assistance_category", [
  "medical",
  "burial",
  "calamity",
  "educational",
  "other",
]);

export const announcementCategory = pgEnum("announcement_category", [
  "general",
  "event",
  "policy",
  "urgent",
]);

export const auditCategory = pgEnum("audit_category", [
  "auth",
  "member",
  "payment",
  "assistance",
  "document",
  "settings",
]);

export const notificationType = pgEnum("notification_type", [
  "info",
  "success",
  "warning",
  "danger",
]);

export const transactionType = pgEnum("transaction_type", ["income", "expense"]);

// ── Profiles (staff/admin — extends Supabase auth.users) ─────────────────────

export const profiles = pgTable("profiles", {
  // Matches auth.users.id from Supabase Auth.
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRole("role").notNull().default("viewer"),
  status: accountStatus("status").notNull().default("active"),
  phone: text("phone"),
  avatarSeed: text("avatar_seed"),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Members ──────────────────────────────────────────────────────────────────

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Links a member record to a Supabase auth user for the member portal.
    userId: uuid("user_id").unique(),
    memberNo: text("member_no").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    status: memberStatus("status").notNull().default("pending"),
    avatarSeed: text("avatar_seed"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    lastPaymentAt: timestamp("last_payment_at", { withTimezone: true }),
    // Denormalised cache; source of truth is the contributions ledger.
    contributionsTotal: numeric("contributions_total", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("members_status_idx").on(t.status),
    nameIdx: index("members_name_idx").on(t.lastName, t.firstName),
  }),
);

// ── Collection events ─────────────────────────────────────────────────────────

export const collectionEvents = pgTable("collection_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  location: text("location"),
  collectorId: uuid("collector_id").references(() => profiles.id, { onDelete: "set null" }),
  collectorName: text("collector_name"),
  expectedMembers: integer("expected_members").notNull().default(0),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  collectedAmount: numeric("collected_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: eventStatus("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Contributions (ledger) ─────────────────────────────────────────────────────

export const contributions = pgTable(
  "contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    eventId: uuid("event_id").references(() => collectionEvents.id, { onDelete: "set null" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    status: paymentStatus("status").notNull().default("paid"),
    method: paymentMethod("method").notNull().default("cash"),
    receiptNo: text("receipt_no").notNull().unique(),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
    recordedById: uuid("recorded_by_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    recordedByName: text("recorded_by_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    memberIdx: index("contributions_member_idx").on(t.memberId),
    paidAtIdx: index("contributions_paid_at_idx").on(t.paidAt),
  }),
);

// ── Assistance requests + approval workflow ─────────────────────────────────────

export const assistanceRequests = pgTable(
  "assistance_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestNo: text("request_no").notNull().unique(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    category: assistanceCategory("category").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
    reason: text("reason"),
    status: assistanceStatus("status").notNull().default("pending"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    reviewedById: uuid("reviewed_by_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    reviewedByName: text("reviewed_by_name"),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    memberIdx: index("assistance_member_idx").on(t.memberId),
    statusIdx: index("assistance_status_idx").on(t.status),
  }),
);

/** One row per workflow transition (submit → verify → review → approve/reject → release → archive). */
export const assistanceWorkflowSteps = pgTable("assistance_workflow_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => assistanceRequests.id, { onDelete: "cascade" }),
  fromStatus: assistanceStatus("from_status"),
  toStatus: assistanceStatus("to_status").notNull(),
  note: text("note"),
  actorId: uuid("actor_id").references(() => profiles.id, { onDelete: "set null" }),
  actorName: text("actor_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Documents (Supabase Storage refs) ───────────────────────────────────────────

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  storagePath: text("storage_path").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  category: text("category"),
  archived: boolean("archived").notNull().default(false),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }),
  assistanceRequestId: uuid("assistance_request_id").references(() => assistanceRequests.id, {
    onDelete: "cascade",
  }),
  uploadedById: uuid("uploaded_by_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Financial ledger ─────────────────────────────────────────────────────────

export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: transactionType("type").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  contributionId: uuid("contribution_id").references(() => contributions.id, {
    onDelete: "set null",
  }),
  assistanceRequestId: uuid("assistance_request_id").references(() => assistanceRequests.id, {
    onDelete: "set null",
  }),
  recordedById: uuid("recorded_by_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Announcements ─────────────────────────────────────────────────────────────

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: announcementCategory("category").notNull().default("general"),
  pinned: boolean("pinned").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  authorId: uuid("author_id").references(() => profiles.id, { onDelete: "set null" }),
  authorName: text("author_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Audit logs ─────────────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => profiles.id, { onDelete: "set null" }),
    actorName: text("actor_name").notNull(),
    action: text("action").notNull(),
    target: text("target"),
    category: auditCategory("category").notNull(),
    metadata: jsonb("metadata"),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    createdAtIdx: index("audit_created_at_idx").on(t.createdAt),
  }),
);

// ── Notifications ─────────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: notificationType("type").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Application settings (single row) ────────────────────────────────────────────

export const appSettings = pgTable("app_settings", {
  id: text("id").primaryKey().default("singleton"),
  orgName: text("org_name").notNull().default("Pagtukaw Lifecare Philippines"),
  registrationNo: text("registration_no"),
  contactEmail: text("contact_email"),
  phone: text("phone"),
  address: text("address"),
  monthlyDues: numeric("monthly_dues", { precision: 12, scale: 2 }).notNull().default("500"),
  receiptPrefix: text("receipt_prefix").notNull().default("OR-"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Convenience type exports ────────────────────────────────────────────────────

export type Profile = typeof profiles.$inferSelect;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Contribution = typeof contributions.$inferSelect;
export type CollectionEvent = typeof collectionEvents.$inferSelect;
export type AssistanceRequest = typeof assistanceRequests.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;
