/** Audit-log server functions. */
import { createServerFn } from "@tanstack/react-start";
import { auditService, type AuditLogDTO } from "../services/audit.service";
import { requireSessionUser } from "../auth";

const AUDITORS = ["admin", "viewer"] as const;

/** Recent audit-log entries (admin/auditor only). */
export const getAuditLogs = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuditLogDTO[]> => {
    await requireSessionUser([...AUDITORS]);
    return auditService.list();
  },
);
