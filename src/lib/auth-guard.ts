/**
 * Route guard helpers for use in `beforeLoad`.
 * They call the `getCurrentUser` server function (works during SSR and on the
 * client) and redirect when access is not permitted.
 */
import { redirect } from "@tanstack/react-router";
import { getCurrentUser, type SessionUser } from "@/server/auth";

/** Require any authenticated user. Redirects to login otherwise. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw redirect({ to: "/auth/login" });
  }
  return user;
}

/** Require one of the given roles. Redirects to /forbidden if role mismatch. */
export async function requireRole(roles: SessionUser["role"][]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw redirect({ to: "/forbidden" });
  }
  return user;
}

/** Staff/admin roles that may access the back-office shell. */
export const STAFF_ROLES: SessionUser["role"][] = [
  "admin",
  "treasurer",
  "collector",
  "secretary",
  "viewer",
];
