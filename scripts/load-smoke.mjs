#!/usr/bin/env node
// Qisqa yuk sinovi (k6/autocannon o'rnatmasdan, faqat Node 22 fetch bilan).
//   node scripts/load-smoke.mjs <url> [--c 20] [--d 10] [--vary 20000]
// --vary N: URL ichidagi {n} har so'rovda 1..N oralig'idagi tasodifiy son bilan almashtiriladi
// (kesh va bitta qatorga tushib qolmaslik uchun). Natija: RPS, p50/p95/p99, status kodlari.
// Faqat o'z muhitingizga (lokal/staging) qarating — bu ataylab ko'p so'rov yuboradi.
const [url, ...rest] = process.argv.slice(2);
if (!url) {
  console.error('Foydalanish: node scripts/load-smoke.mjs <url> [--c 20] [--d 10] [--vary N]');
  process.exit(2);
}
const arg = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? Number(rest[i + 1]) : fallback;
};
const concurrency = arg('c', 20);
const seconds = arg('d', 10);
const vary = arg('vary', 0);

const latencies = [];
const statuses = {};
let errors = 0;
const stopAt = Date.now() + seconds * 1000;

async function worker() {
  while (Date.now() < stopAt) {
    const target = vary ? url.replaceAll('{n}', String(1 + Math.floor(Math.random() * vary))) : url;
    const started = performance.now();
    try {
      const res = await fetch(target, { redirect: 'manual' });
      await res.arrayBuffer();
      statuses[res.status] = (statuses[res.status] ?? 0) + 1;
    } catch {
      errors++;
    }
    latencies.push(performance.now() - started);
  }
}

const startedAt = Date.now();
await Promise.all(Array.from({ length: concurrency }, worker));
const elapsed = (Date.now() - startedAt) / 1000;
latencies.sort((a, b) => a - b);
const pct = (p) => (latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor((p / 100) * latencies.length))].toFixed(1) : '-');
console.log(
  JSON.stringify({
    url,
    concurrency,
    seconds: Number(elapsed.toFixed(1)),
    requests: latencies.length,
    rps: Math.round(latencies.length / elapsed),
    p50_ms: pct(50),
    p95_ms: pct(95),
    p99_ms: pct(99),
    max_ms: latencies.length ? latencies[latencies.length - 1].toFixed(1) : '-',
    statuses,
    network_errors: errors,
  }),
);
