import { staffRepo } from "../repositories/staff.repo";
import { auditRepo } from "../repositories/audit.repo";
import type { Profile } from "../db/schema";
import type { AuditLogDTO } from "./audit.service";

export interface StaffDTO {
  id: string;
  name: string;
  email: string;
  role: Profile["role"];
  status: Profile["status"];
  lastActive: string | null;
  phone: string;
}

/** Default permission sets by role (reference display). */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "Manage members",
    "Approve assistance",
    "Manage staff",
    "Edit settings",
    "View audit logs",
    "Manage finances",
  ],
  treasurer: ["Record contributions", "Manage finances", "Generate reports", "View members"],
  collector: ["Record contributions", "View assigned members", "Manage own events"],
  secretary: ["Manage announcements", "Manage documents", "View members"],
  viewer: ["View reports", "View members (read-only)"],
  member: ["View own records"],
};

function toDTO(p: Profile): StaffDTO {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    status: p.status,
    lastActive: p.lastActiveAt ? p.lastActiveAt.toISOString() : null,
    phone: p.phone ?? "",
  };
}

export const staffService = {
  async list(): Promise<StaffDTO[]> {
    const rows = await staffRepo.listAll();
    return rows.map(toDTO);
  },

  async detail(id: string): Promise<{
    staff: StaffDTO;
    permissions: string[];
    activity: AuditLogDTO[];
  } | null> {
    const profile = await staffRepo.findById(id);
    if (!profile) return null;
    const logs = await auditRepo.listByActor(id, 6);
    return {
      staff: toDTO(profile),
      permissions: ROLE_PERMISSIONS[profile.role] ?? [],
      activity: logs.map((l) => ({
        id: l.id,
        actor: l.actorName,
        action: l.action,
        target: l.target ?? "",
        category: l.category,
        createdAt: l.createdAt.toISOString(),
        ip: l.ip ?? "—",
      })),
    };
  },
};
