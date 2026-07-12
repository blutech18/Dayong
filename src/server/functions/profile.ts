/** Current-user profile server functions. */
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db/client";
import { profiles } from "../db/schema";
import { auditRepo } from "../repositories/audit.repo";
import { requireSessionUser, type SessionUser } from "../auth";
import type { AuditLogDTO } from "../services/audit.service";

export interface ProfilePage {
  profile: {
    name: string;
    email: string;
    role: SessionUser["role"];
    phone: string;
    avatarSeed: string;
  };
  activity: AuditLogDTO[];
}

/** The signed-in user's profile plus their recent activity. */
export const getProfilePage = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProfilePage> => {
    const user = await requireSessionUser();
    const [row] = await getDb().select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
    const logs = await auditRepo.listByActor(user.id, 6);
    return {
      profile: {
        name: row?.name ?? user.name,
        email: row?.email ?? user.email,
        role: user.role,
        phone: row?.phone ?? "",
        avatarSeed: row?.avatarSeed ?? user.name,
      },
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
);

/** Update the signed-in user's own name and phone. */
export const updateMyProfile = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().trim().min(1, "Name is required"),
      phone: z.string().trim().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await getDb()
      .update(profiles)
      .set({ name: data.name, phone: data.phone || null, updatedAt: new Date() })
      .where(eq(profiles.id, user.id));
    return { ok: true };
  });
