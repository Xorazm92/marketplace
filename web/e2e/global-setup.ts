import { execSync } from "child_process";

// Brauzer testi uchun alohida baza: har ishga tushirishda tozalanadi.
// Faqat nomi `_test` bilan tugaydigan bazaga yoziladi (backend harness bilan bir xil qoida).
export default function globalSetup() {
  const url = process.env.E2E_DATABASE_URL!;
  const name = new URL(url).pathname.slice(1);
  if (!name.endsWith("_test")) throw new Error(`Xavfsizlik: E2E bazasi "_test" bilan tugashi kerak, berilgan: ${name}`);

  const backend = { cwd: "../backend-main", env: { ...process.env, DATABASE_URL: url }, stdio: "inherit" as const };
  execSync("npx prisma migrate deploy", backend);
  execSync(`psql "${url}" -qc "DO \\$\\$ DECLARE t text; BEGIN FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename<>'_prisma_migrations' LOOP EXECUTE 'TRUNCATE ' || quote_ident(t) || ' RESTART IDENTITY CASCADE'; END LOOP; END \\$\\$;"`, backend);
  execSync("npx ts-node prisma/seed.ts", { ...backend, env: { ...backend.env, SEED_DEMO: "true" } });
  execSync("node create-admin.js", { ...backend, env: { ...backend.env, ADMIN_PHONE: "+998909990000", ADMIN_PASSWORD: "e2e-admin-password" } });
}
