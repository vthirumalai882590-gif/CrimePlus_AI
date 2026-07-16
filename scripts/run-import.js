/**
 * run-import.js
 * Runs catalyst ds:import for all tables non-interactively
 * by pre-generating config JSON files that specify the bucket.
 *
 * Usage: node scripts/run-import.js
 */
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUCKET = 'migration-uploads';
const CSV_DIR = path.resolve(__dirname, 'csv-export');
const CFG_DIR = path.resolve(__dirname, 'import-configs');

if (!fs.existsSync(CFG_DIR)) fs.mkdirSync(CFG_DIR, { recursive: true });

// Tables to import in order
const tables = ['anomalies', 'festivals', 'patrols', 'offenders', 'incidents'];

// Find the latest suffixed CSV for each table
function findLatestCSV(table) {
  const files = fs.readdirSync(CSV_DIR)
    .filter(f => f.startsWith(table) && f.endsWith('.csv'))
    .sort()
    .reverse();
  return files[0] ? path.join(CSV_DIR, files[0]) : null;
}

for (const table of tables) {
  const csvFile = findLatestCSV(table);
  if (!csvFile) {
    console.log(`⚠  No CSV found for ${table}, skipping.`);
    continue;
  }

  // Write per-table import config JSON
  // This pre-selects the bucket so CLI doesn't prompt
  const configFile = path.join(CFG_DIR, `${table}.json`);
  const config = {
    table_identifier: table,
    operation: 'insert',
    object_details: {
      bucket_name: BUCKET,
      object_key: path.basename(csvFile)
    }
  };
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

  console.log(`\n📦 Importing ${table} (${csvFile})...`);
  try {
    // First upload the CSV to Stratus bucket using catalyst ds:import with config
    // The config pre-selects the bucket — no interactive prompt needed
    const cmd = `catalyst ds:import "${csvFile}" --table ${table} --config "${configFile}"`;
    console.log(`   Running: ${cmd}`);
    const out = execSync(cmd, { cwd: path.resolve(__dirname, '..'), timeout: 120000 }).toString();
    console.log(`   ✅ ${out.trim()}`);
  } catch (err) {
    const msg = (err.stdout || err.stderr || err.message || '').toString().slice(0, 300);
    console.error(`   ✗ Failed: ${msg}`);
  }
}

console.log('\nAll imports submitted!');
