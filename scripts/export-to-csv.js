/**
 * export-to-csv.js
 * Exports all SQLite tables to CSV files in scripts/csv-export/
 * Run: node scripts/export-to-csv.js
 */
'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.resolve(__dirname, '../apps/api/crimepulse.db');
const OUT_DIR = path.resolve(__dirname, 'csv-export');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const sqlite = new Database(DB_PATH, { readonly: true });

// Global column name mappings (SQLite → Catalyst reserved word fixes)
const GLOBAL_COL_MAP = {
  date:      'incident_date',
  time:      'incident_time',
  long:      'longitude',
  timestamp: 'event_timestamp',
};

// Table-specific column mappings (id → table-prefixed id)
const TABLE_COL_MAP = {
  anomalies: { id: 'anomaly_id',  timestamp: 'event_timestamp' },
  festivals:  { id: 'festival_id', date: 'incident_date' },
  patrols:    { id: 'patrol_id' },
};

function mapCol(table, col) {
  if (TABLE_COL_MAP[table] && TABLE_COL_MAP[table][col] !== undefined) {
    return TABLE_COL_MAP[table][col];
  }
  return GLOBAL_COL_MAP[col] || col;
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const tables = ['anomalies', 'festivals', 'patrols', 'offenders', 'incidents'];

for (const table of tables) {
  try {
    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
    if (!rows.length) { console.log(`⚠  ${table}: empty`); continue; }

    const cols = Object.keys(rows[0]);
    const mappedCols = cols.map(c => mapCol(table, c));
    const lines = [mappedCols.join(',')];
    for (const row of rows) {
      lines.push(cols.map(c => escapeCSV(row[c])).join(','));
    }

    const outFile = path.join(OUT_DIR, `${table}_final.csv`);
    fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
    console.log(`✅ ${table}: ${rows.length} rows → ${outFile}`);
    console.log(`   Columns: ${mappedCols.join(', ')}`);
  } catch (e) {
    console.log(`⚠  ${table}: ${e.message}`);
  }
}

sqlite.close();
console.log('\nDone! CSV files are in scripts/csv-export/');
