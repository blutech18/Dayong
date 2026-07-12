/**
 * Browser Supabase client (client-safe — uses only public env vars).
 * Persists the auth session in cookies so the server can read it during SSR.
 */
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/server/env";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (_client) return _client;
  _client = createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
  return _client;
}
