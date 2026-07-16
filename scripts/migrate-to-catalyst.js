/**
 * migrate-to-catalyst.js
 *
 * Migrates local SQLite data → Zoho Catalyst Data Store via REST API.
 *
 * Usage (run from project root):
 *   node scripts/migrate-to-catalyst.js
 *   node scripts/migrate-to-catalyst.js --dry-run
 *
 * Prerequisites:
 *   1. Set CATALYST_PROJECT_ID and CATALYST_AUTH_TOKEN in a .env.migrate file
 *      (see instructions printed when this file runs without them)
 *   2. All target tables must already exist in Catalyst Data Store console
 */

'use strict';

const path = require('path');
const fs = require('fs');
const https = require('https');
const Database = require('better-sqlite3');

// ─── Load env from .env.migrate ────────────────────────────────────────────
const envFile = path.resolve(__dirname, '../.env.migrate');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const PROJECT_ID = process.env.CATALYST_PROJECT_ID;
const AUTH_TOKEN = process.env.CATALYST_AUTH_TOKEN;
const DOMAIN = process.env.CATALYST_DOMAIN || 'api.catalyst.zoho.in';
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 100;

if (!PROJECT_ID || !AUTH_TOKEN) {
  console.error(`
❌  Missing credentials!

Create a file called .env.migrate in the project root with:

  CATALYST_PROJECT_ID=<your project id>
  CATALYST_AUTH_TOKEN=<your personal auth token>
  CATALYST_DOMAIN=api.catalyst.zoho.in

To get your project ID:
  → Open https://catalyst.zoho.com → Your Project → Settings → Project Details

To get a personal auth token:
  → catalyst auth:token   (or use an OAuth token from the Zoho API Console)
`);
  process.exit(1);
}

// ─── Column name mappings: SQLite → Catalyst Data Store ────────────────────
const COL_MAP = {
  date:      'incident_date',
  time:      'incident_time',
  long:      'longitude',
  timestamp: 'event_timestamp',
};

function mapRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const key = COL_MAP[k] || k;
    // Convert null to empty string (Catalyst REST API doesn't accept null)
    out[key] = v === null || v === undefined ? '' : String(v);
  }
  return out;
}

// ─── REST API helper ────────────────────────────────────────────────────────
function catalystRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: DOMAIN,
      path: urlPath,
      method,
      headers: {
        'Authorization': `Zoho-oauthtoken ${AUTH_TOKEN}`,
        'Environment': 'Development',
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Insert batch into Catalyst table via REST ──────────────────────────────
async function insertBatch(tableName, rows) {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would insert ${rows.length} rows into ${tableName}`);
    return { ok: rows.length, fail: 0 };
  }

  // Catalyst Data Store bulk insert: POST /baas/v1/project/{id}/table/{name}/row
  const url = `/baas/v1/project/${PROJECT_ID}/table/${tableName}/row`;

  try {
    // API expects an array of row objects
    await catalystRequest('POST', url, rows);
    return { ok: rows.length, fail: 0 };
  } catch (err) {
    console.error(`  ✗ Batch insert of ${rows.length} rows failed:`, err.message?.slice(0, 300));
    return { ok: 0, fail: rows.length };
  }
}

// ─── Migrate one SQLite table → Catalyst table ─────────────────────────────
async function migrateTable(sqlite, sqliteTable, catalystTable) {
  console.log(`\n📦  ${sqliteTable} → ${catalystTable}`);

  let rows;
  try {
    rows = sqlite.prepare(`SELECT * FROM ${sqliteTable}`).all();
  } catch {
    console.log(`  ⚠  Table "${sqliteTable}" not found in SQLite — skipping.`);
    return;
  }

  if (!rows.length) {
    console.log(`  ℹ  No rows — skipping.`);
    return;
  }

  console.log(`  Found ${rows.length} rows.`);

  let totalOk = 0, totalFail = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE).map(mapRow);
    const { ok, fail } = await insertBatch(catalystTable, batch);
    totalOk += ok;
    totalFail += fail;
    const done = Math.min(i + BATCH_SIZE, rows.length);
    process.stdout.write(`  ${done}/${rows.length} rows processed...\r`);
  }
  console.log(`  ✅ Done: ${totalOk} inserted, ${totalFail} failed.        `);
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   CrimePulse AI — SQLite → Catalyst Data Store   ');
  console.log('═══════════════════════════════════════════════════');
  if (DRY_RUN) console.log('   ⚠  DRY RUN — no data will be written\n');
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Domain:  ${DOMAIN}\n`);

  const sqlite = new Database(path.resolve(__dirname, '../apps/api/crimepulse.db'), { readonly: true });
  console.log('✅ SQLite opened');

  // Order matters — reference tables first (districts, stations) before FKs
  const tables = [
    ['anomalies',   'anomalies'],
    ['festivals',   'festivals'],
    ['patrols',     'patrols'],
    ['offenders',   'offenders'],
    ['incidents',   'incidents'],
  ];

  for (const [sqliteTable, catalystTable] of tables) {
    await migrateTable(sqlite, sqliteTable, catalystTable);
  }

  sqlite.close();
  console.log('\n🎉  Migration complete!\n');
  if (DRY_RUN) console.log('    Run without --dry-run to write to Catalyst.\n');
}

main().catch(err => {
  console.error('\n❌ Migration failed:', err.message || err);
  process.exit(1);
});
