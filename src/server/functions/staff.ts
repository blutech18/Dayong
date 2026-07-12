/** Staff server functions. */
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { staffService, type StaffDTO } from "../services/staff.service";
import { requireSessionUser } from "../auth";
import { getDb } from "../db/client";
import { profiles, accountStatus, userRole } from "../db/schema";
import { getSupabaseServer } from "../supabase";
import { serverEnv } from "../env";
import type { AuditLogDTO } from "../services/audit.service";

export type { StaffDTO };

export interface StaffMemberDetail {
  staff: StaffDTO;
  permissions: string[];
  activity: AuditLogDTO[];
}

/** List all staff/admin profiles (admin only). */
export const getStaff = createServerFn({ method: "GET" }).handler(async (): Promise<StaffDTO[]> => {
  await requireSessionUser(["admin"]);
  return staffService.list();
});

/** A single staff member with permissions and recent activity (admin only). */
export const getStaffMember = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data }): Promise<StaffMemberDetail | null> => {
    await requireSessionUser(["admin"]);
    return staffService.detail(data);
  });

/** Change a staff member's account status (admin only). */
export const setStaffStatus = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid(), status: z.enum(accountStatus.enumValues) }))
  .handler(async ({ data }): Promise<StaffDTO[]> => {
    await requireSessionUser(["admin"]);
    await getDb()
      .update(profiles)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(profiles.id, data.id));
    return staffService.list();
  });

/** Change a staff member's role (admin only). */
export const setStaffRole = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid(), role: z.enum(userRole.enumValues) }))
  .handler(async ({ data }): Promise<StaffDTO[]> => {
    await requireSessionUser(["admin"]);
    await getDb()
      .update(profiles)
      .set({ role: data.role, updatedAt: new Date() })
      .where(eq(profiles.id, data.id));
    return staffService.list();
  });

/** Send a password-reset email to a staff member (admin only). */
export const resetStaffPassword = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    await requireSessionUser(["admin"]);
    const supabase = getSupabaseServer();
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${serverEnv.appUrl}/auth/reset-password`,
    });
    return { ok: true };
  });
