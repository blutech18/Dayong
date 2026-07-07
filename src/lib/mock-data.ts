// Realistic mock data for DAYONG prototype.

export type MemberStatus = "active" | "inactive" | "pending" | "archived";
export type AssistanceStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "released"
  | "rejected";
export type PaymentStatus = "paid" | "partial" | "unpaid";

export interface Member {
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

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  amount: number;
  status: PaymentStatus;
  method: "cash" | "gcash" | "bank" | "check";
  eventId?: string;
  eventName?: string;
  receiptNo: string;
  paidAt: string;
  recordedBy: string;
}

export interface CollectionEvent {
  id: string;
  name: string;
  scheduledAt: string;
  location: string;
  collector: string;
  expectedMembers: number;
  collectedAmount: number;
  targetAmount: number;
  status: "upcoming" | "in_progress" | "completed";
}

export interface AssistanceRequest {
  id: string;
  requestNo: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  category: "medical" | "burial" | "calamity" | "educational" | "other";
  amount: number;
  reason: string;
  status: AssistanceStatus;
  submittedAt: string;
  reviewedBy?: string;
  documentsCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: "general" | "event" | "policy" | "urgent";
  pinned: boolean;
  publishedAt: string;
  author: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  category: "auth" | "member" | "payment" | "assistance" | "document" | "settings";
  createdAt: string;
  ip: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "danger";
  read: boolean;
  createdAt: string;
}

const firstNames = [
  "Maria", "Juan", "Ana", "Jose", "Rosa", "Pedro", "Luz", "Ramon", "Elena",
  "Carlos", "Sofia", "Miguel", "Lorna", "Angelo", "Grace", "Ricardo", "Divina",
  "Roberto", "Cecilia", "Fernando", "Corazon", "Alberto", "Teresa", "Emilio",
  "Nenita", "Antonio", "Isabel", "Marcelo", "Cristina", "Reynaldo",
];
const lastNames = [
  "Dela Cruz", "Reyes", "Santos", "Ramos", "Mendoza", "Torres", "Aquino",
  "Villanueva", "Bautista", "Domingo", "Padilla", "Alvarez", "Navarro",
  "Salazar", "Castillo", "Fernandez", "Gutierrez", "Ocampo", "Marquez",
  "Villareal", "Guzman", "Pascual", "Ilagan", "Sarmiento", "Bernardo",
];

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

function pad(n: number, l = 4) {
  return String(n).padStart(l, "0");
}

function daysAgo(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}

export const members: Member[] = Array.from({ length: 48 }, (_, i) => {
  const first = pick(firstNames, i * 3 + 1);
  const last = pick(lastNames, i * 7 + 2);
  const statuses: MemberStatus[] = [
    "active", "active", "active", "active", "active",
    "inactive", "pending", "archived",
  ];
  return {
    id: `mbr_${pad(i + 1)}`,
    memberNo: `DYG-${pad(1000 + i)}`,
    firstName: first,
    lastName: last,
    email: `${first.toLowerCase().replace(/\s/g, "")}.${last.toLowerCase().replace(/\s/g, "")}@dayong.org`,
    phone: `+63 9${pad(10000000 + i * 12345, 9)}`.slice(0, 15),
    address: `${100 + i} ${pick(["Rizal", "Bonifacio", "Mabini", "Luna"], i)} St., Barangay ${pick(["San Roque", "Poblacion", "Sta. Cruz", "San Isidro"], i)}, ${pick(["Quezon City", "Manila", "Pasig", "Makati", "Cebu"], i)}`,
    joinedAt: daysAgo(30 + i * 12),
    status: pick(statuses, i),
    contributionsTotal: 500 * (5 + (i % 24)),
    assistanceCount: i % 4,
    lastPaymentAt: daysAgo(i % 60),
    avatarSeed: `${first}-${last}`,
  };
});

export const contributions: Contribution[] = Array.from({ length: 60 }, (_, i) => {
  const m = members[i % members.length];
  const amounts = [500, 500, 500, 1000, 250, 500, 750, 500];
  const methods = ["cash", "gcash", "bank", "cash", "cash", "check"] as const;
  const statuses: PaymentStatus[] = [
    "paid", "paid", "paid", "paid", "paid", "partial", "paid", "unpaid",
  ];
  return {
    id: `con_${pad(i + 1)}`,
    memberId: m.id,
    memberName: `${m.firstName} ${m.lastName}`,
    memberNo: m.memberNo,
    amount: pick(amounts, i),
    status: pick(statuses, i),
    method: pick([...methods], i),
    receiptNo: `OR-${pad(50000 + i, 6)}`,
    paidAt: daysAgo(i * 2),
    recordedBy: pick(["Admin Santos", "Staff Reyes", "Staff Cruz"], i),
    eventName: i % 3 === 0 ? "Monthly Collection — " + pick(["January", "February", "March"], i) : undefined,
  };
});

export const collectionEvents: CollectionEvent[] = [
  {
    id: "evt_01",
    name: "Monthly Collection — March 2026",
    scheduledAt: daysAgo(-3),
    location: "Barangay San Roque Hall",
    collector: "Admin Santos",
    expectedMembers: 48,
    collectedAmount: 18500,
    targetAmount: 24000,
    status: "upcoming",
  },
  {
    id: "evt_02",
    name: "Monthly Collection — February 2026",
    scheduledAt: daysAgo(25),
    location: "Barangay San Roque Hall",
    collector: "Staff Reyes",
    expectedMembers: 48,
    collectedAmount: 22750,
    targetAmount: 24000,
    status: "completed",
  },
  {
    id: "evt_03",
    name: "Special Fundraising Drive",
    scheduledAt: daysAgo(-14),
    location: "Community Center",
    collector: "Admin Santos",
    expectedMembers: 60,
    collectedAmount: 0,
    targetAmount: 50000,
    status: "upcoming",
  },
  {
    id: "evt_04",
    name: "Monthly Collection — January 2026",
    scheduledAt: daysAgo(55),
    location: "Barangay San Roque Hall",
    collector: "Staff Cruz",
    expectedMembers: 48,
    collectedAmount: 23500,
    targetAmount: 24000,
    status: "completed",
  },
];

export const assistanceRequests: AssistanceRequest[] = Array.from(
  { length: 24 },
  (_, i) => {
    const m = members[(i * 3) % members.length];
    const cats = ["medical", "burial", "calamity", "educational", "medical", "other"] as const;
    const statuses: AssistanceStatus[] = [
      "pending", "under_review", "approved", "released", "rejected",
      "pending", "released", "approved",
    ];
    const reasons: Record<string, string> = {
      medical: "Hospitalization support for family member",
      burial: "Burial assistance for deceased spouse",
      calamity: "Typhoon damage — home repairs",
      educational: "Tuition assistance for scholar",
      other: "Financial hardship — livelihood support",
    };
    const cat = pick([...cats], i);
    return {
      id: `req_${pad(i + 1)}`,
      requestNo: `AR-2026-${pad(i + 1)}`,
      memberId: m.id,
      memberName: `${m.firstName} ${m.lastName}`,
      memberNo: m.memberNo,
      category: cat,
      amount: 2000 + (i % 6) * 1500,
      reason: reasons[cat],
      status: pick(statuses, i),
      submittedAt: daysAgo(i * 3),
      reviewedBy: i % 2 === 0 ? "Admin Santos" : undefined,
      documentsCount: 2 + (i % 4),
    };
  },
);

export const announcements: Announcement[] = [
  {
    id: "ann_01",
    title: "General Assembly — April 12, 2026",
    body: "All members are invited to our quarterly general assembly. Attendance is required for officers and highly encouraged for all members. Snacks will be provided.",
    category: "event",
    pinned: true,
    publishedAt: daysAgo(2),
    author: "Admin Santos",
  },
  {
    id: "ann_02",
    title: "Updated Assistance Guidelines Effective April 1",
    body: "Please review the new assistance request guidelines. Documentary requirements have been streamlined and the approval turnaround has been reduced to 5 working days.",
    category: "policy",
    pinned: true,
    publishedAt: daysAgo(5),
    author: "Admin Santos",
  },
  {
    id: "ann_03",
    title: "March Contribution Deadline",
    body: "Reminder to all members: March contributions are due on or before March 31. GCash payments are now accepted — please coordinate with your assigned collector.",
    category: "general",
    pinned: false,
    publishedAt: daysAgo(9),
    author: "Staff Reyes",
  },
  {
    id: "ann_04",
    title: "System Maintenance — Sunday 10PM to 12AM",
    body: "The DAYONG portal will be temporarily unavailable this Sunday for scheduled maintenance. Thank you for your patience.",
    category: "urgent",
    pinned: false,
    publishedAt: daysAgo(14),
    author: "System",
  },
];

export const auditLogs: AuditLog[] = Array.from({ length: 40 }, (_, i) => {
  const actions = [
    { a: "Approved assistance request", c: "assistance" as const, t: "AR-2026-0007" },
    { a: "Recorded contribution", c: "payment" as const, t: "OR-050231" },
    { a: "Created member", c: "member" as const, t: "DYG-1042" },
    { a: "Updated organization settings", c: "settings" as const, t: "General" },
    { a: "Uploaded document", c: "document" as const, t: "medical-cert.pdf" },
    { a: "Signed in", c: "auth" as const, t: "session" },
    { a: "Rejected assistance request", c: "assistance" as const, t: "AR-2026-0011" },
    { a: "Edited member profile", c: "member" as const, t: "DYG-1015" },
  ];
  const act = pick(actions, i);
  return {
    id: `log_${pad(i + 1)}`,
    actor: pick(["Admin Santos", "Staff Reyes", "Staff Cruz"], i),
    action: act.a,
    target: act.t,
    category: act.c,
    createdAt: daysAgo(Math.floor(i / 3)),
    ip: `192.168.${i % 10}.${(i * 7) % 255}`,
  };
});

export const notifications: Notification[] = [
  { id: "n1", title: "New assistance request", body: "Maria Dela Cruz submitted AR-2026-0024 for medical assistance.", type: "info", read: false, createdAt: daysAgo(0) },
  { id: "n2", title: "Contribution recorded", body: "OR-050231 recorded for Juan Santos — ₱500.00", type: "success", read: false, createdAt: daysAgo(0) },
  { id: "n3", title: "Approval pending review", body: "AR-2026-0018 has been waiting 3 days for your review.", type: "warning", read: false, createdAt: daysAgo(1) },
  { id: "n4", title: "Backup completed", body: "Nightly database backup finished successfully.", type: "success", read: true, createdAt: daysAgo(1) },
  { id: "n5", title: "Failed sign-in attempt", body: "3 failed sign-in attempts for staff@dayong.org from 192.168.1.42.", type: "danger", read: true, createdAt: daysAgo(2) },
];

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "treasurer" | "collector" | "secretary" | "viewer";
  status: "active" | "invited" | "disabled";
  lastActive: string;
  phone: string;
}

export const staffMembers: StaffMember[] = [
  { id: "stf_01", name: "Admin Santos", email: "admin@dayong.org", role: "admin", status: "active", lastActive: daysAgo(0), phone: "+63 917 555 0101" },
  { id: "stf_02", name: "Corazon Reyes", email: "treasurer@dayong.org", role: "treasurer", status: "active", lastActive: daysAgo(0), phone: "+63 917 555 0102" },
  { id: "stf_03", name: "Miguel Cruz", email: "collector1@dayong.org", role: "collector", status: "active", lastActive: daysAgo(1), phone: "+63 917 555 0103" },
  { id: "stf_04", name: "Grace Domingo", email: "collector2@dayong.org", role: "collector", status: "active", lastActive: daysAgo(2), phone: "+63 917 555 0104" },
  { id: "stf_05", name: "Roberto Villanueva", email: "secretary@dayong.org", role: "secretary", status: "active", lastActive: daysAgo(1), phone: "+63 917 555 0105" },
  { id: "stf_06", name: "Elena Bautista", email: "auditor@dayong.org", role: "viewer", status: "invited", lastActive: daysAgo(5), phone: "+63 917 555 0106" },
  { id: "stf_07", name: "Fernando Torres", email: "former@dayong.org", role: "collector", status: "disabled", lastActive: daysAgo(45), phone: "+63 917 555 0107" },
];

export const rolePermissions: Record<StaffMember["role"], string[]> = {
  admin: ["Manage members", "Approve assistance", "Manage staff", "Edit settings", "View audit logs", "Manage finances"],
  treasurer: ["Record contributions", "Manage finances", "Generate reports", "View members"],
  collector: ["Record contributions", "View assigned members", "Manage own events"],
  secretary: ["Manage announcements", "Manage documents", "View members"],
  viewer: ["View reports", "View members (read-only)"],
};

// ---- Aggregates ----

export const monthlyCollections = [
  { month: "Oct", collected: 21500, expected: 24000 },
  { month: "Nov", collected: 22800, expected: 24000 },
  { month: "Dec", collected: 24000, expected: 24000 },
  { month: "Jan", collected: 23500, expected: 24000 },
  { month: "Feb", collected: 22750, expected: 24000 },
  { month: "Mar", collected: 18500, expected: 24000 },
];

export const monthlyExpenses = [
  { month: "Oct", assistance: 12000, operations: 3200 },
  { month: "Nov", assistance: 8500, operations: 3100 },
  { month: "Dec", assistance: 15400, operations: 4200 },
  { month: "Jan", assistance: 10800, operations: 3400 },
  { month: "Feb", assistance: 13600, operations: 3300 },
  { month: "Mar", assistance: 9200, operations: 3500 },
];

export const assistanceDistribution = [
  { name: "Medical", value: 42, color: "var(--color-chart-1)" },
  { name: "Burial", value: 18, color: "var(--color-chart-2)" },
  { name: "Calamity", value: 14, color: "var(--color-chart-3)" },
  { name: "Educational", value: 16, color: "var(--color-chart-4)" },
  { name: "Other", value: 10, color: "var(--color-chart-5)" },
];

export const dashboardStats = {
  totalMembers: members.length,
  activeMembers: members.filter((m) => m.status === "active").length,
  inactiveMembers: members.filter((m) => m.status === "inactive").length,
  pendingAssistance: assistanceRequests.filter((a) => a.status === "pending" || a.status === "under_review").length,
  approvedAssistance: assistanceRequests.filter((a) => a.status === "approved" || a.status === "released").length,
  rejectedAssistance: assistanceRequests.filter((a) => a.status === "rejected").length,
  monthlyCollections: 18500,
  monthlyExpenses: 12700,
  cashFlow: 5800,
  balance: 187450,
};

export function formatPHP(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
