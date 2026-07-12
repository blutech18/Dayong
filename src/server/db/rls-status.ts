/** Report RLS status + anon/authenticated grants for public tables. */
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });

  const rls = await sql`
    select c.relname as table, c.relrowsecurity as rls_enabled,
           c.relforcerowsecurity as rls_forced
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
    order by c.relname
  `;
  console.log("RLS status (public schema):");
  for (const r of rls) {
    console.log(`  ${r.rls_enabled ? "ON " : "OFF"}  ${r.table}`);
  }

  const grants = await sql`
    select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privs
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee in ('anon','authenticated')
    group by table_name, grantee
    order by table_name, grantee
  `;
  console.log("\nanon/authenticated grants:");
  if (grants.length === 0) console.log("  (none)");
  for (const g of grants) console.log(`  ${g.table_name} [${g.grantee}]: ${g.privs}`);

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
