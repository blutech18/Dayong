/**
 * Authentication & session server functions (Supabase Auth).
 *
 * These run on the server (via TanStack Start RPC) and can be called from
 * route `beforeLoad` guards, loaders, and client components.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSupabaseServer, getSupabaseAdmin } from "./supabase";
import { profiles, auditLogs } from "./db/schema";
import { serverEnv } from "./env";

/**
 * Lazily load the DB handle.
 *
 * `auth.ts` is reachable from client code (route `beforeLoad` guards, the
 * top bar's logout button, etc.) because it exposes server functions. Importing
 * the Postgres driver at module scope would drag it — and its Node-only
 * `Buffer` usage — into the browser bundle and break hydration. These helpers
 * only ever run on the server, so we import the driver on demand instead.
 */
async function getDb() {
  const { getDb: get } = await import("./db/client");
  return get();
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: (typeof profiles.role.enumValues)[number];
  status: (typeof profiles.status.enumValues)[number];
  avatarSeed: string | null;
  /** Set only for member-portal sessions — the linked `members.id`. */
  memberId?: string;
};

/** Best-effort audit log write; never throws into the caller. */
async function writeAudit(entry: {
  actorId?: string | null;
  actorName: string;
  action: string;
  target?: string;
  category: (typeof auditLogs.category.enumValues)[number];
}) {
  try {
    const db = await getDb();
    await db.insert(auditLogs).values({
      actorId: entry.actorId ?? null,
      actorName: entry.actorName,
      action: entry.action,
      target: entry.target,
      category: entry.category,
      ip: getRequestIP({ xForwardedFor: true }) ?? null,
    });
  } catch (err) {
    console.error("audit log failed", err);
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/** Sign in with email + password. Establishes the session cookie. */
export const login = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }): Promise<SessionUser> => {
    const supabase = getSupabaseServer();
    const { data: auth, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error || !auth.user) {
      throw new Error(error?.message ?? "Invalid email or password.");
    }

    const db = await getDb();
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, auth.user.id))
      .limit(1);

    if (!profile) {
      // Not a staff account — allow member-portal accounts to sign in.
      const { membersRepo } = await import("./repositories/members.repo");
      const member = await membersRepo.findByUserId(auth.user.id);
      if (!member || member.status === "archived") {
        await supabase.auth.signOut();
        throw new Error("No account found. Contact an administrator.");
      }
      await writeAudit({
        actorName: `${member.firstName} ${member.lastName}`.trim(),
        action: "Signed in",
        target: "member portal",
        category: "auth",
      });
      return {
        id: auth.user.id,
        email: member.email ?? auth.user.email ?? "",
        name: `${member.firstName} ${member.lastName}`.trim(),
        role: "member",
        status: member.status === "inactive" ? "inactive" : "active",
        avatarSeed: member.avatarSeed,
        memberId: member.id,
      };
    }
    if (profile.status === "disabled" || profile.status === "inactive") {
      await supabase.auth.signOut();
      throw new Error("This account is not active. Contact an administrator.");
    }

    await db.update(profiles).set({ lastActiveAt: new Date() }).where(eq(profiles.id, profile.id));

    await writeAudit({
      actorId: profile.id,
      actorName: profile.name,
      action: "Signed in",
      target: "session",
      category: "auth",
    });

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      status: profile.status,
      avatarSeed: profile.avatarSeed,
    };
  });

/** Sign out and clear the session cookie. */
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServer();
  await supabase.auth.signOut();
  return { ok: true };
});

/**
 * Plain (non-RPC) helper to resolve the current session user from cookies.
 * Safe to call inside other server functions and services.
 */
export async function resolveSessionUser(): Promise<SessionUser | null> {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const db = await getDb();
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

  if (profile) {
    if (profile.status === "disabled" || profile.status === "inactive") return null;
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      status: profile.status,
      avatarSeed: profile.avatarSeed,
    };
  }

  // No staff profile — check for a linked member (member-portal session).
  const { membersRepo } = await import("./repositories/members.repo");
  const member = await membersRepo.findByUserId(user.id);
  if (member && member.status !== "archived") {
    return {
      id: user.id,
      email: member.email ?? user.email ?? "",
      name: `${member.firstName} ${member.lastName}`.trim(),
      role: "member",
      status: member.status === "inactive" ? "inactive" : "active",
      avatarSeed: member.avatarSeed,
      memberId: member.id,
    };
  }

  return null;
}

/** Require a member-portal session; returns the linked member id. */
export async function requireMember(): Promise<{ user: SessionUser; memberId: string }> {
  const user = await resolveSessionUser();
  if (!user) throw new Error("Not authenticated.");
  if (user.role !== "member" || !user.memberId) {
    throw new Error("This area is for members.");
  }
  return { user, memberId: user.memberId };
}

/** Throws if there is no permitted session user. Returns the user otherwise. */
export async function requireSessionUser(
  allowedRoles?: SessionUser["role"][],
): Promise<SessionUser> {
  const user = await resolveSessionUser();
  if (!user) throw new Error("Not authenticated.");
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return user;
}

/** Returns the current session user, or null if unauthenticated. */
export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  (): Promise<SessionUser | null> => resolveSessionUser(),
);

/** Send a password-reset email with a redirect back to the reset page. */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServer();
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${serverEnv.appUrl}/auth/reset-password`,
    });
    // Always report success to avoid leaking which emails are registered.
    return { ok: true };
  });

/** Update the signed-in user's password (used on the reset-password page). */
export const updatePassword = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(8) }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServer();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Admin-only: create a staff/admin account (Supabase auth user + profile row).
 * Uses the service-role client so it works before any user is signed in
 * (e.g. seeding the first administrator).
 */
export const createStaffAccount = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string().min(8).optional(),
      name: z.string().min(1),
      role: z.enum(profiles.role.enumValues),
      phone: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    // Only administrators may provision new staff accounts.
    await requireSessionUser(["admin"]);

    const admin = getSupabaseAdmin();
    // Invite flow: with no password we generate a temporary one and email a
    // reset link so the new staff member sets their own password.
    const isInvite = !data.password;
    const password = data.password ?? crypto.randomUUID() + "Aa1!";

    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email,
      password,
      email_confirm: true,
    });
    if (error || !created.user) {
      throw new Error(error?.message ?? "Failed to create account.");
    }

    const db = await getDb();
    await db.insert(profiles).values({
      id: created.user.id,
      email: data.email,
      name: data.name,
      role: data.role,
      status: isInvite ? "invited" : "active",
      phone: data.phone,
      avatarSeed: data.name,
    });

    if (isInvite) {
      const supabase = getSupabaseServer();
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${serverEnv.appUrl}/auth/reset-password`,
      });
    }

    return { id: created.user.id };
  });
