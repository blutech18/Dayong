/**
 * Seed the database from the prototype's mock data so the UI keeps its
 * realistic content while running against real Postgres.
 *
 * Run with:  npm run db:seed
 * Requires DATABASE_URL, VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.
 *
 * Idempotency: this performs plain inserts. Run against a fresh/migrated DB,
 * or truncate tables first if re-seeding.
 */
import {
  members as mockMembers,
  contributions as mockContributions,
  collectionEvents as mockEvents,
  assistanceRequests as mockAssistance,
  announcements as mockAnnouncements,
  auditLogs as mockAudit,
  staffMembers as mockStaff,
} from "../../lib/mock-data";
import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { getSupabaseAdmin } from "../supabase";
import {
  profiles,
  members,
  collectionEvents,
  contributions,
  assistanceRequests,
  assistanceWorkflowSteps,
  announcements,
  auditLogs,
  appSettings,
} from "./schema";

const DEFAULT_PASSWORD = "Password123!";

const roleMap: Record<string, (typeof profiles.role.enumValues)[number]> = {
  admin: "admin",
  treasurer: "treasurer",
  collector: "collector",
  secretary: "secretary",
  viewer: "viewer",
};

async function main() {
  const db = getDb();
  const admin = getSupabaseAdmin();

  // 1. Staff/admin accounts (Supabase auth user + profile).
  const profileIdByName = new Map<string, string>();
  for (const s of mockStaff) {
    const { data, error } = await admin.auth.admin.createUser({
      email: s.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) {
      console.warn(`  skip ${s.email}: ${error?.message ?? "no user returned"}`);
      continue;
    }
    await db.insert(profiles).values({
      id: data.user.id,
      name: s.name,
      email: s.email,
      role: roleMap[s.role] ?? "viewer",
      status: s.status === "disabled" ? "disabled" : s.status === "invited" ? "invited" : "active",
      phone: s.phone,
      avatarSeed: s.name,
      lastActiveAt: new Date(s.lastActive),
    });
    profileIdByName.set(s.name, data.user.id);
  }
  console.log(`✓ ${profileIdByName.size} staff accounts (password: ${DEFAULT_PASSWORD})`);

  // 2. Members — capture generated ids keyed by member number.
  const memberIdByNo = new Map<string, string>();
  for (const m of mockMembers) {
    const [row] = await db
      .insert(members)
      .values({
        memberNo: m.memberNo,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phone,
        address: m.address,
        status: m.status,
        avatarSeed: m.avatarSeed,
        joinedAt: new Date(m.joinedAt),
        lastPaymentAt: new Date(m.lastPaymentAt),
        contributionsTotal: String(m.contributionsTotal),
      })
      .returning({ id: members.id });
    memberIdByNo.set(m.memberNo, row.id);
  }
  console.log(`✓ ${memberIdByNo.size} members`);

  // 2b. Give the first member a portal login (for testing the member portal).
  const portalMember = mockMembers[0];
  const portalMemberId = memberIdByNo.get(portalMember.memberNo);
  if (portalMemberId) {
    const { data: mu, error: muErr } = await admin.auth.admin.createUser({
      email: portalMember.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
    });
    if (mu?.user) {
      await db.update(members).set({ userId: mu.user.id }).where(eq(members.id, portalMemberId));
      console.log(`✓ member portal login: ${portalMember.email} / ${DEFAULT_PASSWORD}`);
    } else {
      console.warn(`  member login skipped: ${muErr?.message ?? "unknown"}`);
    }
  }

  // 3. Collection events.
  const eventIdByName = new Map<string, string>();
  for (const e of mockEvents) {
    const [row] = await db
      .insert(collectionEvents)
      .values({
        name: e.name,
        scheduledAt: new Date(e.scheduledAt),
        location: e.location,
        collectorId: profileIdByName.get(e.collector) ?? null,
        collectorName: e.collector,
        expectedMembers: e.expectedMembers,
        targetAmount: String(e.targetAmount),
        collectedAmount: String(e.collectedAmount),
        status: e.status,
      })
      .returning({ id: collectionEvents.id });
    eventIdByName.set(e.name, row.id);
  }
  console.log(`✓ ${eventIdByName.size} collection events`);

  // 4. Contributions.
  let contribCount = 0;
  for (const c of mockContributions) {
    const memberId = memberIdByNo.get(c.memberNo);
    if (!memberId) continue;
    await db.insert(contributions).values({
      memberId,
      eventId: c.eventName ? (eventIdByName.get(c.eventName) ?? null) : null,
      amount: String(c.amount),
      status: c.status,
      method: c.method,
      receiptNo: c.receiptNo,
      paidAt: new Date(c.paidAt),
      recordedById: profileIdByName.get(c.recordedBy) ?? null,
      recordedByName: c.recordedBy,
    });
    contribCount++;
  }
  console.log(`✓ ${contribCount} contributions`);

  // 5. Assistance requests + an initial workflow step.
  let assistCount = 0;
  for (const a of mockAssistance) {
    const memberId = memberIdByNo.get(a.memberNo);
    if (!memberId) continue;
    const [row] = await db
      .insert(assistanceRequests)
      .values({
        requestNo: a.requestNo,
        memberId,
        category: a.category,
        amount: String(a.amount),
        reason: a.reason,
        status: a.status,
        submittedAt: new Date(a.submittedAt),
        reviewedById: a.reviewedBy ? (profileIdByName.get(a.reviewedBy) ?? null) : null,
        reviewedByName: a.reviewedBy,
      })
      .returning({ id: assistanceRequests.id });
    await db.insert(assistanceWorkflowSteps).values({
      requestId: row.id,
      toStatus: "pending",
      note: "Request submitted.",
      createdAt: new Date(a.submittedAt),
    });
    assistCount++;
  }
  console.log(`✓ ${assistCount} assistance requests`);

  // 6. Announcements.
  for (const an of mockAnnouncements) {
    await db.insert(announcements).values({
      title: an.title,
      body: an.body,
      category: an.category,
      pinned: an.pinned,
      publishedAt: new Date(an.publishedAt),
      authorId: profileIdByName.get(an.author) ?? null,
      authorName: an.author,
    });
  }
  console.log(`✓ ${mockAnnouncements.length} announcements`);

  // 7. Audit logs.
  for (const log of mockAudit) {
    await db.insert(auditLogs).values({
      actorId: profileIdByName.get(log.actor) ?? null,
      actorName: log.actor,
      action: log.action,
      target: log.target,
      category: log.category,
      ip: log.ip,
      createdAt: new Date(log.createdAt),
    });
  }
  console.log(`✓ ${mockAudit.length} audit logs`);

  // 8. Default app settings (single row).
  await db
    .insert(appSettings)
    .values({
      id: "singleton",
      orgName: "Pagtukaw Lifecare Philippines",
      registrationNo: "CDA-2019-04021",
      contactEmail: "hello@dayong.org",
      phone: "+63 917 555 0142",
      address: "Barangay San Roque, Quezon City",
      monthlyDues: "500",
      receiptPrefix: "OR-",
    })
    .onConflictDoNothing();
  console.log("✓ default settings");

  console.log("\nSeed complete. Sign in with admin@dayong.org / " + DEFAULT_PASSWORD);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
