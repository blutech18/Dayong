/**
 * Centralised, validated access to environment variables.
 *
 * - `VITE_*` values are public (available in the browser bundle).
 * - Everything else is server-only and must never be imported into client code.
 *
 * We read lazily so the app can build/boot even before `.env` is populated;
 * a missing value only throws when a feature that needs it is actually used.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

/**
 * Read a VITE_ variable from either Vite's `import.meta.env` (browser/SSR bundle)
 * or `process.env` (plain Node contexts like tsx scripts and the Nitro server).
 */
function viteVar(name: string): string | undefined {
  const meta = (import.meta as { env?: Record<string, string | undefined> }).env;
  return meta?.[name] ?? process.env[name];
}

/** Public config — safe for the browser. */
export const publicEnv = {
  get supabaseUrl() {
    return required("VITE_SUPABASE_URL", viteVar("VITE_SUPABASE_URL"));
  },
  get supabaseAnonKey() {
    // Supabase renamed the "anon" key to the "publishable" key — accept either.
    return required(
      "VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY)",
      viteVar("VITE_SUPABASE_PUBLISHABLE_KEY") ?? viteVar("VITE_SUPABASE_ANON_KEY"),
    );
  },
};

/** Server-only config — never import from client components. */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  get databaseUrl() {
    return required("DATABASE_URL", process.env.DATABASE_URL);
  },
  get appUrl() {
    return process.env.APP_URL ?? "http://localhost:3000";
  },
};
