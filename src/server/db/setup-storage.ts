/** One-off: ensure the private "documents" storage bucket exists. */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.VITE_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;

  if (buckets.some((b) => b.name === "documents")) {
    console.log('✓ Bucket "documents" already exists.');
    return;
  }

  const { error } = await supabase.storage.createBucket("documents", {
    public: false,
    fileSizeLimit: "25MB",
  });
  if (error) throw error;
  console.log('✓ Created private bucket "documents".');
}

main().catch((e) => {
  console.error("Storage setup failed:", e);
  process.exit(1);
});
