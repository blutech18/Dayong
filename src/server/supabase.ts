/**
 * Server-side Supabase clients (never import into client components).
 *
 * - `getSupabaseServer()`  → request-scoped client that reads/writes the auth
 *   session via cookies (used for login, session checks, RLS-scoped queries).
 * - `getSupabaseAdmin()`   → service-role client that bypasses RLS (used for
 *   privileged admin actions and seeding). Handle with care.
 */
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { publicEnv, serverEnv } from "./env";

/** Request-scoped client bound to the current request's cookies. */
export function getSupabaseServer() {
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies() ?? {}).map(([name, value]) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options);
        }
      },
    },
  });
}

/** Privileged client — bypasses Row Level Security. Server-only. */
export function getSupabaseAdmin() {
  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
