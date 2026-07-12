import { auditRepo } from "../repositories/audit.repo";
import type { AuditLog } from "../db/schema";

export interface AuditLogDTO {
  id: string;
  actor: string;
  action: string;
  target: string;
  category: AuditLog["category"];
  createdAt: string;
  ip: string;
}

export const auditService = {
  async list(): Promise<AuditLogDTO[]> {
    const rows = await auditRepo.listRecent(100);
    return rows.map((l) => ({
      id: l.id,
      actor: l.actorName,
      action: l.action,
      target: l.target ?? "",
      category: l.category,
      createdAt: l.createdAt.toISOString(),
      ip: l.ip ?? "—",
    }));
  },
};
