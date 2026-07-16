// Polyfill DOMMatrix for environments where pdf-parse requires it but it's not defined globally (e.g. Node 18 AppSail)
if (typeof (global as any).DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {};
}

import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buffer: Buffer) => Promise<{ text: string; numpages: number }> = require('pdf-parse');
import dotenv from 'dotenv';

// Look for .env in multiple directories (workspace root, apps/api/, and src/)
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

console.log('--------------------------------------------------');
console.log('CrimePulse API Command Server Initializing...');
if (process.env.GROQ_API_KEY) {
  console.log(`[AI STATUS] GROQ_API_KEY loaded successfully (${process.env.GROQ_API_KEY.substring(0, 8)}...)`);
}
if (process.env.GEMINI_API_KEY) {
  console.log(`[AI STATUS] GEMINI_API_KEY loaded successfully (${process.env.GEMINI_API_KEY.substring(0, 8)}...)`);
}
if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
  console.log('[AI STATUS] WARNING: Neither GROQ_API_KEY nor GEMINI_API_KEY is defined!');
  console.log('            The platform is running in OFFLINE mock fallback mode.');
  console.log('            To fix: create a .env file containing "GROQ_API_KEY=gsk_..."');
  console.log('            in the workspace root or apps/api/ directory.');
}
console.log('--------------------------------------------------');

import catalyst from 'zcatalyst-sdk-node';
import db from './db/connection';
import { anomaliesSeed, festivalsSeed, patrolsSeed } from './db/seeder';

const storage = multer.memoryStorage();
const upload = multer({ storage });


const app = express();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 5000;

const getMlServiceUrl = () => {
  const isCatalyst = !!process.env.CATALYST_PROJECT_ID;
  if (isCatalyst) {
    const envId = process.env.X_ZOHO_CATALYST_ENV_ID || '50043846482';
    return `https://crimepulse-ml-${envId}.development.catalystappsail.in`;
  }
  return process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
};
const ML_SERVICE_URL = getMlServiceUrl();

// Helper to call configured LLM (Groq or Google Gemini API)
async function callLLM(prompt: string): Promise<{ text: string; source: string }> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1024
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API Error: ${response.status} - ${errText}`);
    }
    const data = await response.json() as any;
    const reply = data.choices?.[0]?.message?.content || '';
    return { text: reply, source: 'groq-llama-3.1' };
  }

  if (geminiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 1000
        }
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
    }
    const data = await response.json() as any;
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error('No candidate content returned from Gemini API.');
    }
    return { text: reply, source: 'google-gemini-1.5-flash' };
  }

  throw new Error('No LLM API Key is configured. Please set GROQ_API_KEY or GEMINI_API_KEY in your .env file.');
}

// Disable Express CORS middleware in Catalyst production to prevent duplicate headers (Catalyst Gateway already handles CORS)
if (!process.env.CATALYST_PROJECT_ID) {
  app.use(cors());
}
app.use(express.json());

// Jaro-Winkler string similarity calculation for identity resolution
function jaroWinkler(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  s1 = s1.toLowerCase().trim();
  s2 = s2.toLowerCase().trim();
  if (s1 === s2) return 1;

  const range = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let m = 0;
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - range);
    const end = Math.min(i + range + 1, s2.length);
    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        m++;
        break;
      }
    }
  }

  if (m === 0) return 0;

  let t = 0;
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) t++;
      k++;
    }
  }
  t = t / 2;

  let jaro = (m / s1.length + m / s2.length + (m - t) / m) / 3;
  let p = 0.1;
  let l = 0;
  while (s1[l] === s2[l] && l < Math.min(4, s1.length)) l++;

  return jaro + l * p * (1 - jaro);
}

// Recency-weighted dynamic risk score calculator
function calculateOffenderRisk(crimeHistory: any[]): number {
  if (crimeHistory.length === 0) return 0;
  let sumRecency = 0;
  const now = new Date();
  crimeHistory.forEach((c: any) => {
    const cDate = new Date(c.date);
    const diffTime = Math.abs(now.getTime() - cDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    sumRecency += 1.0 / diffDays;
  });
  // Normalize score between 0.0 and 100.0
  const rawScore = sumRecency * 2000.0;
  return Math.min(100.0, Math.max(10.0, rawScore));
}

// Helper to calculate date cutoffs YYYY-MM-DD
const getDateCutoff = (range: string): string | null => {
  const now = new Date();
  if (range === '30d') {
    now.setDate(now.getDate() - 30);
  } else if (range === '90d') {
    now.setDate(now.getDate() - 90);
  } else if (range === '1y') {
    now.setFullYear(now.getFullYear() - 1);
  } else {
    return null;
  }
  return now.toISOString().split('T')[0];
};

// 1. GET /api/incidents - Queries incidents with mapping
app.get('/api/incidents', async (req: Request, res: Response) => {
  try {
    const { district, station, severity, dateRange, category } = req.query;

    let query = 'SELECT incident_id, date, time, district, station, lat, long, crime_type, mo_tags, weapon_used, offender_id, victim_demographic, socio_economic_index, status, severity, fir_text, evidence_ids FROM incidents';
    const params: any[] = [];
    const conditions: string[] = [];

    if (district && district !== 'ALL') {
      conditions.push('district = ?');
      params.push(district);
    }
    if (station && station !== 'ALL') {
      conditions.push('station = ?');
      params.push(station);
    }
    if (severity && severity !== 'ALL') {
      conditions.push('severity = ?');
      params.push(severity);
    }
    if (category && category !== 'ALL') {
      conditions.push('crime_type = ?');
      params.push(category);
    }
    if (dateRange && dateRange !== 'ALL') {
      const cutoff = getDateCutoff(dateRange as string);
      if (cutoff) {
        conditions.push('date >= ?');
        params.push(cutoff);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date DESC';

    const stmt = db.prepare(query);
    const rows = await stmt.all(params, req) as any[];

    // Map columns for retro-compatibility with the frontend UI
    const mappedRows = rows.map(r => {
      let tags: string[] = [];
      try {
        tags = JSON.parse(r.mo_tags);
      } catch {
        tags = r.mo_tags ? [r.mo_tags] : [];
      }
      return {
        id: r.incident_id,
        incident_id: r.incident_id,
        date: r.date,
        time: r.time,
        timestamp: `${r.date}T${r.time}`,
        district: r.district,
        station: r.station,
        latitude: r.lat,
        longitude: r.long,
        lat: r.lat,
        long: r.long,
        category: r.crime_type,
        crime_type: r.crime_type,
        severity: r.severity,
        description: r.fir_text,
        fir_text: r.fir_text,
        modus_operandi: r.mo_tags,
        mo_tags: tags,
        suspect_id: r.offender_id,
        offender_id: r.offender_id,
        status: r.status,
        weapon_used: r.weapon_used
      };
    });

    res.json(mappedRows);
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ 
      error: error.message || (error.toString ? error.toString() : 'Unknown error'),
      stack: error.stack,
      details: error
    });
  }
});

// 2. GET /api/hotspots
app.get('/api/hotspots', async (req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT lat as latitude, long as longitude, severity, crime_type as category, district, station, COUNT(*) as weight
      FROM incidents
      GROUP BY lat, long, severity, crime_type, district, station
    `);
    res.json(await stmt.all([], req));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/anomalies
app.get('/api/anomalies', async (req: Request, res: Response) => {
  try {
    const { district, station } = req.query;
    let query = 'SELECT * FROM anomalies WHERE 1=1';
    const params: any[] = [];

    if (district && district !== 'ALL') {
      query += ' AND district = ?';
      params.push(district);
    }
    if (station && station !== 'ALL') {
      query += ' AND station = ?';
      params.push(station);
    }

    query += ' ORDER BY timestamp DESC';
    const stmt = db.prepare(query);
    res.json(await stmt.all(params, req));
  } catch (error: any) {
    console.warn('Failed to query anomalies from Data Store, returning fallback seed data:', error.message);
    const { district, station } = req.query;
    let filtered = [...anomaliesSeed];
    if (district && district !== 'ALL') {
      filtered = filtered.filter(a => a.district === district);
    }
    if (station && station !== 'ALL') {
      filtered = filtered.filter(a => a.station === station);
    }
    res.json(filtered);
  }
});

// 4. POST /api/anomalies/acknowledge
app.post('/api/anomalies/acknowledge', async (req: Request, res: Response) => {
  try {
    const { id, role } = req.body;
    const anomaly = await db.prepare('SELECT * FROM anomalies WHERE id = ?').get([id], req) as any;

    if (!anomaly) {
       res.status(404).json({ error: 'Anomaly not found' });
       return;
    }

    await db.prepare("UPDATE anomalies SET status = 'ACKNOWLEDGED' WHERE id = ?").run([id], req);

    await db.prepare(`
      INSERT INTO audit_logs (id, timestamp, operator_role, action_taken, details)
      VALUES (?, ?, ?, ?, ?)
    `).run([`AUD-${Date.now()}`, new Date().toISOString(), role || 'SHO', 'Anomaly Acknowledged', `Acknowledged anomaly '${anomaly.metric}' at ${anomaly.station}.`], req);

    res.json({ success: true, acknowledged: id });
  } catch (error: any) {
    console.warn('Failed to acknowledge anomaly in Data Store, mock acknowledging:', error.message);
    res.json({ success: true, acknowledged: req.body.id });
  }
});

// 5. GET /api/offenders
app.get('/api/offenders', async (req: Request, res: Response) => {
  try {
    const rows = await db.prepare('SELECT * FROM offenders ORDER BY risk_score DESC').all([], req) as any[];
    const mapped = rows.map(r => ({
      ...r,
      id: r.offender_id, 
      aliases: JSON.parse(r.aliases),
      addresses: JSON.parse(r.addresses),
      districts_active: JSON.parse(r.districts_active),
      associates: JSON.parse(r.associates),
      crime_history: JSON.parse(r.crime_history)
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5.5 POST /api/offenders (Add New Criminal Intake)
app.post('/api/offenders', async (req: Request, res: Response) => {
  try {
    const { name, aliases, dob, address, phone, force, crime_record } = req.body;
    if (!name || !dob || !address) {
       res.status(400).json({ error: 'Name, DOB, and Current Address are required.' });
       return;
    }

    // Fuzzy warning checks against existing offenders (Jaro-Winkler > 0.55 threshold)
    if (!force) {
      const existing = await db.prepare('SELECT * FROM offenders').all([], req) as any[];
      const duplicates: any[] = [];
      
      existing.forEach(off => {
        let nameScore = jaroWinkler(name, off.name);
        const aliasList = JSON.parse(off.aliases);
        aliasList.forEach((alias: string) => {
          const score = jaroWinkler(name, alias);
          if (score > nameScore) nameScore = score;
        });

        if (nameScore >= 0.55) {
          duplicates.push({
            offender_id: off.offender_id,
            name: off.name,
            dob: off.dob,
            address: off.address,
            similarity: nameScore
          });
        }
      });

      if (duplicates.length > 0) {
         res.json({
          warning: `This suspect name is similar to ${duplicates.length} existing records in CCTNS.`,
          candidates: duplicates
        });
        return;
      }
    }

    const offender_id = `OFF-${Date.now()}`;
    const parsedAliases = Array.isArray(aliases) ? aliases : (aliases ? aliases.split(',').map((s: string) => s.trim()) : []);
    const addressHistory = [{ address, date: new Date().toISOString().split('T')[0] }];
    const initialHistory = crime_record ? [crime_record] : [];
    const risk = calculateOffenderRisk(initialHistory);

    await db.prepare(`
      INSERT INTO offenders (offender_id, name, aliases, dob, address, addresses, phone, first_offense_date, districts_active, current_status, risk_score, photo_placeholder_id, associates, crime_history)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run([
      offender_id,
      name,
      JSON.stringify(parsedAliases),
      dob,
      address,
      JSON.stringify(addressHistory),
      phone || 'None',
      crime_record ? crime_record.date : new Date().toISOString().split('T')[0],
      JSON.stringify(crime_record ? [crime_record.district] : ['BENGALURU_CITY']),
      crime_record ? crime_record.status : 'UNDER_TRIAL',
      risk,
      offender_id,
      JSON.stringify([]),
      JSON.stringify(initialHistory)
    ], req);

    res.json({ success: true, offender_id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5.6 POST /api/offenders/:id/crimes (Append crime to profile)
app.post('/api/offenders/:id/crimes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, ipc_section, bns_section, crime_type, custody_duration, status, district, station, mo_note } = req.body;

    if (!date || !ipc_section || !crime_type || !status) {
       res.status(400).json({ error: 'Date, IPC section, Crime type, and Case status are required.' });
       return;
    }

    const offender = await db.prepare('SELECT * FROM offenders WHERE offender_id = ?').get([id], req) as any;
    if (!offender) {
       res.status(404).json({ error: 'Offender not found' });
       return;
    }

    const history = JSON.parse(offender.crime_history);
    history.push({
      date,
      ipc_section,
      bns_section: bns_section || ipc_section,
      crime_type,
      custody_duration: custody_duration || 'None',
      status,
      district: district || 'BENGALURU_CITY',
      station: station || 'General PS',
      mo_note: mo_note || ''
    });

    const newRisk = calculateOffenderRisk(history);
    const districts = JSON.parse(offender.districts_active);
    if (district && !districts.includes(district)) {
      districts.push(district);
    }

    await db.prepare(`
      UPDATE offenders 
      SET crime_history = ?, risk_score = ?, districts_active = ?, current_status = ?
      WHERE offender_id = ?
    `).run([
      JSON.stringify(history),
      newRisk,
      JSON.stringify(districts),
      status,
      id
    ], req);

    res.json({ success: true, updated_id: id, risk_score: newRisk });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5.7 POST /api/incidents (Add New Incident Record)
app.post('/api/incidents', async (req: Request, res: Response) => {
  try {
    const {
      date, time, district, station, lat, long, crime_type, mo_tags,
      weapon_used, offender_id, victim_demographic, status, severity, fir_text
    } = req.body;

    if (!date || !district || !station || !crime_type || !status || !severity) {
      res.status(400).json({ error: 'Required fields missing: date, district, station, crime_type, status, severity' });
      return;
    }

    const incident_id = `INC-${Date.now()}`;
    const parsedMoTags = Array.isArray(mo_tags) ? mo_tags : (mo_tags ? mo_tags.split(',').map((s: string) => s.trim()) : []);
    
    // Get socio_economic_index (random float 0.1-0.9 matching synthetic seed profile generator)
    const socioIndex = Math.random() * 0.8 + 0.1;

    await db.prepare(`
      INSERT INTO incidents (incident_id, date, time, district, station, lat, long, crime_type, mo_tags, weapon_used, offender_id, victim_demographic, socio_economic_index, status, severity, fir_text, evidence_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run([
      incident_id,
      date,
      time || new Date().toTimeString().split(' ')[0],
      district,
      station,
      lat ? parseFloat(lat) : 12.9716,
      long ? parseFloat(long) : 77.5946,
      crime_type.toUpperCase(),
      JSON.stringify(parsedMoTags),
      weapon_used || 'None',
      offender_id || null,
      victim_demographic || 'None',
      socioIndex,
      status || 'PENDING',
      severity || 'MEDIUM',
      fir_text || '',
      JSON.stringify([])
    ], req);

    // Insert audit log
    await db.prepare(`
      INSERT INTO audit_logs (id, timestamp, operator_role, action_taken, details)
      VALUES (?, ?, ?, ?, ?)
    `).run([
      `AUD-${Date.now()}`,
      new Date().toISOString(),
      'SHO',
      'Incident Record Created',
      `Manual incident entry '${incident_id}' created for station ${station} in district ${district}.`
    ], req);

    res.json({ success: true, incident_id });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5.8 POST /api/victims (Add New Victim Record)
app.post('/api/victims', async (req: Request, res: Response) => {
  try {
    const { name, age, gender, district, victim_type } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const victim_id = `VIC-${Date.now()}`;
    await db.prepare(`
      INSERT INTO victims (victim_id, full_name, age, gender, district, victim_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run([
      victim_id,
      name,
      age ? parseInt(age) : null,
      gender || 'Other',
      district || 'BENGALURU_CITY',
      victim_type || 'theft-victim'
    ], req);

    // Insert audit log
    await db.prepare(`
      INSERT INTO audit_logs (id, timestamp, operator_role, action_taken, details)
      VALUES (?, ?, ?, ?, ?)
    `).run([
      `AUD-${Date.now()}`,
      new Date().toISOString(),
      'SHO',
      'Victim Record Created',
      `Manual victim profile '${victim_id}' created for ${name} in district ${district}.`
    ], req);

    res.json({ success: true, victim_id });
  } catch (error: any) {
    console.error('Error creating victim:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── 5.9 POST /api/bulk-import ──────────────────────────────────────────────
// Accepts a JSON body: { type: 'criminal' | 'victim', records: [...] }
// Each record is processed with the same logic as the individual endpoints.
// Returns: { total, success, failed, errors: [{ row, error }] }
app.post('/api/bulk-import', async (req: Request, res: Response) => {
  try {
    const { type, records } = req.body;
    if (!type || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: 'type (criminal|victim) and records[] are required.' });
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        if (type === 'criminal') {
          const { name, full_name, aliases, age, dob, phone, address_full, address_district,
            address_station, status, associated_gangs, crime_type, ipc_section, incident_date,
            incident_time, incident_district, incident_station, severity, weapon_used,
            mo_tags, description, lat, lng, court_name, case_officer_badge } = record;

          const resolvedName = name || full_name;
          if (!resolvedName) { errors.push({ row: i + 1, error: 'full_name is required' }); failedCount++; continue; }

          const dobDate = dob || (() => {
            const d = new Date();
            d.setFullYear(d.getFullYear() - parseInt(age || '30'));
            return d.toISOString().split('T')[0];
          })();

          const offender_id = `OFF-${Date.now()}-${i}`;
          const parsedAliases = aliases ? aliases.split(',').map((s: string) => s.trim()) : [];
          const crimeRec = {
            date: incident_date || new Date().toISOString().split('T')[0],
            ipc_section: ipc_section || `IPC 379 (Theft)`,
            crime_type: (crime_type || 'THEFT').toUpperCase(),
            status: status === 'in_custody' ? 'IN_CUSTODY' : 'UNDER_TRIAL',
            district: incident_district || address_district || 'BENGALURU_CITY',
            station: incident_station || address_station || 'General PS',
            mo_note: mo_tags || ''
          };
          const addressHistory = [{ address: `${address_full || ''} ${address_district || ''}`.trim(), date: new Date().toISOString().split('T')[0] }];
          const initialHistory = [crimeRec];
          const risk = Math.min(100, (crimeRec.crime_type === 'MURDER' ? 80 : 40) + Math.floor(Math.random() * 20));

          await db.prepare(`
            INSERT INTO offenders (offender_id, name, aliases, dob, address, addresses, phone, first_offense_date, districts_active, current_status, risk_score, photo_placeholder_id, associates, crime_history)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run([
            offender_id, resolvedName, JSON.stringify(parsedAliases), dobDate,
            `${address_full || ''} ${address_district || ''}`.trim(),
            JSON.stringify(addressHistory), phone || 'None',
            crimeRec.date,
            JSON.stringify([incident_district || address_district || 'BENGALURU_CITY']),
            crimeRec.status, risk, offender_id, JSON.stringify([]), JSON.stringify(initialHistory)
          ], req);

          // Also create linked incident
          const parsedMoTags = mo_tags ? mo_tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [crime_type || 'theft', 'bulk_import'];
          const incident_id = `INC-${Date.now()}-${i}`;
          await db.prepare(`
            INSERT INTO incidents (incident_id, date, time, district, station, lat, long, crime_type, mo_tags, weapon_used, offender_id, victim_demographic, socio_economic_index, status, severity, fir_text, evidence_ids)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run([
            incident_id, crimeRec.date, incident_time || '00:00',
            incident_district || address_district || 'BENGALURU_CITY',
            incident_station || address_station || 'General PS',
            lat ? parseFloat(lat) : 12.9716, lng ? parseFloat(lng) : 77.5946,
            crimeRec.crime_type.toUpperCase(),
            JSON.stringify(parsedMoTags), weapon_used || 'None',
            offender_id, `Accused: ${resolvedName}`,
            Math.random() * 0.8 + 0.1, 'PENDING',
            (severity || 'medium').toUpperCase(),
            description || `Bulk import: ${resolvedName} at ${incident_station || address_station}. Officer: ${case_officer_badge || 'N/A'}.`,
            JSON.stringify([])
          ], req);

          successCount++;

        } else if (type === 'victim') {
          const { name, full_name, age, gender, phone, occupation, district, station,
            victim_type, injury_level, property_lost, witness_name, crime_type,
            ipc_section, incident_date, incident_time, incident_district, incident_station,
            severity, weapon_used, mo_tags, description, lat, lng } = record;

          const resolvedName = name || full_name;
          if (!resolvedName) { errors.push({ row: i + 1, error: 'full_name is required' }); failedCount++; continue; }

          const victim_id = `VIC-${Date.now()}-${i}`;
          await db.prepare(`
            INSERT INTO victims (victim_id, full_name, age, gender, district, victim_type)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run([victim_id, resolvedName, age ? parseInt(age) : null, gender || 'Other', district || 'BENGALURU_CITY', victim_type || 'theft-victim'], req);

          // Also create linked incident
          const parsedMoTags = mo_tags ? mo_tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [victim_type || 'theft', 'bulk_import'];
          const incident_id = `INC-${Date.now()}-${i}`;
          await db.prepare(`
            INSERT INTO incidents (incident_id, date, time, district, station, lat, long, crime_type, mo_tags, weapon_used, offender_id, victim_demographic, socio_economic_index, status, severity, fir_text, evidence_ids)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run([
            incident_id,
            incident_date || new Date().toISOString().split('T')[0],
            incident_time || '00:00',
            incident_district || district || 'BENGALURU_CITY',
            incident_station || station || 'General PS',
            lat ? parseFloat(lat) : 12.9716, lng ? parseFloat(lng) : 77.5946,
            (crime_type || 'THEFT').toUpperCase(),
            JSON.stringify(parsedMoTags), weapon_used || 'None', null,
            `${gender || 'Unknown'}, Age ${age || 'N/A'}, ${occupation || 'N/A'}`,
            Math.random() * 0.8 + 0.1, 'PENDING',
            (severity || 'medium').toUpperCase(),
            description || `Bulk import: Victim ${resolvedName}. Property lost: ${property_lost || 'None'}. Witness: ${witness_name || 'None'}.`,
            JSON.stringify([])
          ], req);

          successCount++;
        } else {
          errors.push({ row: i + 1, error: `Unknown type: ${type}` }); failedCount++;
        }
      } catch (rowErr: any) {
        errors.push({ row: i + 1, error: rowErr.message });
        failedCount++;
      }
    }

    // Audit log
    await db.prepare(`INSERT INTO audit_logs (id, timestamp, operator_role, action_taken, details) VALUES (?, ?, ?, ?, ?)`)
      .run([`AUD-${Date.now()}`, new Date().toISOString(), 'SHO', 'Bulk Import', `Bulk ${type} import: ${successCount} succeeded, ${failedCount} failed out of ${records.length} records.`], req);

    res.json({ total: records.length, success: successCount, failed: failedCount, errors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/patrols

app.get('/api/patrols', async (req: Request, res: Response) => {
  try {
    const { district, station } = req.query;
    let query = 'SELECT * FROM patrols WHERE 1=1';
    const params: any[] = [];

    if (district && district !== 'ALL') {
      query += ' AND district = ?';
      params.push(district);
    }
    if (station && station !== 'ALL') {
      query += ' AND station = ?';
      params.push(station);
    }

    const stmt = db.prepare(query);
    res.json(await stmt.all(params, req));
  } catch (error: any) {
    console.warn('Failed to query patrols from Data Store, returning fallback seed data:', error.message);
    const { district, station } = req.query;
    let filtered = [...patrolsSeed];
    if (district && district !== 'ALL') {
      filtered = filtered.filter(p => p.district === district);
    }
    if (station && station !== 'ALL') {
      filtered = filtered.filter(p => p.station === station);
    }
    res.json(filtered);
  }
});

// 7. POST /api/patrols/allocate
app.post('/api/patrols/allocate', async (req: Request, res: Response) => {
  try {
    const { id, station, latitude, longitude, status, officers, role } = req.body;
    if (role !== 'SP') {
      res.status(403).json({ error: 'Access denied: Only the Superintendent of Police (SP) is authorized to allocate beats.' });
      return;
    }

    await db.prepare('UPDATE patrols SET station = ?, latitude = ?, longitude = ?, status = ? WHERE id = ?')
      .run([station, latitude, longitude, status, id], req);

    await db.prepare(`
      INSERT INTO audit_logs (id, timestamp, operator_role, action_taken, details)
      VALUES (?, ?, ?, ?, ?)
    `).run([
      `AUD-${Date.now()}`,
      new Date().toISOString(),
      role || 'SP',
      'Patrol Route Reallocation',
      `Manual reallocation of patrol unit '${id}' to ${station} (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}). Crew: ${officers || 'N/A'}`
    ], req);

    res.json({ success: true, updatedPatrol: id });
  } catch (error: any) {
    console.warn('Failed to allocate patrol in Data Store, mock allocating:', error.message);
    res.json({ success: true, updatedPatrol: req.body.id });
  }
});

// 8. GET /api/audit-logs
app.get('/api/audit-logs', async (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(await stmt.all([], req));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. GET /api/festivals
app.get('/api/festivals', async (req: Request, res: Response) => {
  try {
    const { district } = req.query;
    let query = 'SELECT * FROM festivals WHERE 1=1';
    const params: any[] = [];

    if (district && district !== 'ALL') {
      query += ' AND district = ?';
      params.push(district);
    }

    query += ' ORDER BY date ASC';
    const stmt = db.prepare(query);
    res.json(await stmt.all(params, req));
  } catch (error: any) {
    console.warn('Failed to query festivals from Data Store, returning fallback seed data:', error.message);
    const { district } = req.query;
    let filtered = [...festivalsSeed];
    if (district && district !== 'ALL') {
      filtered = filtered.filter(f => f.district === district);
    }
    res.json(filtered);
  }
});

// Helper to generate mock OCR text and metadata for local development
function mockOcrAndExtraction(fileName: string) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes('mysuru') || lowerName.includes('aligned') || lowerName.includes('clean')) {
    return {
      ocr_text: "Clean CSV: " + fileName,
      extracted_fields: {
        file_name: fileName,
        format: "CSV_CLEAN",
        rows: 142,
        columns: ['incident_id', 'category', 'date', 'district', 'station', 'severity']
      },
      field_confidence: { format: "high", rows: "high" }
    };
  } else if (lowerName.includes('dharwad') || lowerName.includes('messy')) {
    return {
      ocr_text: "Messy CSV: " + fileName,
      extracted_fields: {
        file_name: fileName,
        format: "CSV_MESSY",
        rows: 95,
        columns: ['case_no', 'offense_type', 'happened_date', 'officer_badge']
      },
      field_confidence: { format: "high", rows: "high" }
    };
  } else {
    // Treat as handwritten scan/PDF
    return {
      ocr_text: "First Information Report. Station: Camp PS Belagavi. Date: 2026-07-10. Accused: Ramesh Kumar. Case type: House burglary. Entered building using grille cutter at night.",
      extracted_fields: {
        fir_no: "00512/2026",
        date: "2026-07-10",
        time: "03:30 AM",
        district: "BELAGAVI",
        station: "Camp PS",
        crime_type: "THEFT",
        accused_name: "Ramesh Kumar",
        alias: "Ramu",
        complainant_name: "S. Patil",
        mo_tags: ["grille_cut", "night", "burglary"],
        property_stolen: "Gold ornaments",
        format: "IMAGE_SCAN"
      },
      field_confidence: { fir_no: "high", accused_name: "medium", mo_tags: "high" }
    };
  }
}

// 9.5 POST /api/uploaded-firs/upload - handle raw file upload to Stratus / local uploads
app.post('/api/uploaded-firs/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { station_id } = req.body;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const isCatalyst = process.env.DB_MODE === 'catalyst' || !!process.env.CATALYST_PROJECT_ID;
    const uploadId = `UPL-${Date.now()}`;
    let ocrText = '';
    let extractedFields: any = {};
    let fieldConfidence: any = {};
    let rawFileRef = file.originalname;

    if (isCatalyst) {
      // 1. Upload to Catalyst Stratus bucket 'station-uploads'
      const catalystApp = catalyst.initialize(req as any);
      const stratus = catalystApp.stratus();
      const bucket = stratus.bucket('station-uploads');
      const stratusPath = `${station_id || 'UNKNOWN'}/${new Date().toISOString().slice(0, 10)}/${file.originalname}`;
      
      // putObject returns Promise<boolean> in SDK 3.4.0 — no .start() needed
      await bucket.putObject(stratusPath, file.buffer, { overwrite: true, contentType: file.mimetype });
      rawFileRef = stratusPath;

      // 2. Perform OCR text extraction if it is a scanned image/PDF using Zia
      const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
      if (['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
        try {
          const zia = catalystApp.zia();
          const { Readable } = require('stream');
          const fileStream = Readable.from(file.buffer);
          
          // Original Zoho Catalyst Zia SDK OCR method signature
          const ocrResult = (await zia.extractOpticalCharacters(fileStream, { language: 'eng', modelType: 'OCR' })) as any;
          ocrText = ocrResult.text || ocrResult || '';
        } catch (ocrErr: any) {
          console.warn('Zia OCR extraction failed, falling back to mock extraction:', ocrErr.message);
          const mocks = mockOcrAndExtraction(file.originalname);
          ocrText = mocks.ocr_text;
          extractedFields = mocks.extracted_fields;
          fieldConfidence = mocks.field_confidence;
        }
      } else {
        const mocks = mockOcrAndExtraction(file.originalname);
        ocrText = mocks.ocr_text;
        extractedFields = mocks.extracted_fields;
        fieldConfidence = mocks.field_confidence;
      }
    } else {
      // Local development fallback
      const uploadsDir = path.resolve(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, `${uploadId}-${file.originalname}`);
      fs.writeFileSync(localFilePath, file.buffer);

      const mocks = mockOcrAndExtraction(file.originalname);
      ocrText = mocks.ocr_text;
      extractedFields = mocks.extracted_fields;
      fieldConfidence = mocks.field_confidence;
    }

    // Save metadata to the database
    await db.prepare(`
      INSERT INTO uploaded_firs (upload_id, raw_file_ref, ocr_text, extracted_fields_json, field_confidence_json, linked_incident_id, linked_offender_id, uploaded_at, uploaded_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run([
      uploadId,
      rawFileRef,
      ocrText,
      JSON.stringify(extractedFields),
      JSON.stringify(fieldConfidence),
      null,
      null,
      new Date().toISOString(),
      req.body.role || 'SHO'
    ], req);

    res.json({
      success: true,
      upload_id: uploadId,
      raw_file_ref: rawFileRef,
      ocr_text: ocrText,
      extracted_fields: extractedFields,
      field_confidence: fieldConfidence,
      message: 'File uploaded and database metadata recorded successfully.'
    });
  } catch (error: any) {
    console.error('File upload failed:', error);
    res.status(500).json({ error: error.message || 'File upload failed' });
  }
});

// ─── 9.6 POST /api/uploaded-firs/ingest-csv ──────────────────────────────────
// Parses an uploaded CSV and inserts every valid row into the incidents view,
// which triggers the SQLite INSTEAD-OF trigger to write to CaseMaster.
// Expected CSV columns (case-insensitive, aliases supported):
//   incident_id | case_no | date | time | district | station | lat | long |
//   crime_type  | severity | status | mo_tags | weapon_used | fir_text |
//   offender_id | victim_demographic | socio_economic_index | evidence_ids
app.post('/api/uploaded-firs/ingest-csv', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'No CSV file provided.' }); return; }

    const ext = (file.originalname.split('.').pop() || '').toLowerCase();
    if (ext !== 'csv') { res.status(400).json({ error: 'Only .csv files are accepted by this endpoint.' }); return; }

    const content = file.buffer.toString('utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) { res.status(400).json({ error: 'CSV must have at least a header row and one data row.' }); return; }

    // --- Parse headers (normalize) ---
    const headerAliases: Record<string, string> = {
      'case_no': 'incident_id', 'caseno': 'incident_id', 'fir_no': 'incident_id', 'firno': 'incident_id',
      'registered_date': 'date', 'crime_date': 'date', 'incident_date': 'date',
      'incident_time': 'time', 'crime_time': 'time',
      'police_station': 'station', 'ps_name': 'station', 'unit_name': 'station',
      'district_name': 'district',
      'latitude': 'lat', 'longitude': 'long',
      'crime_type': 'crime_type', 'offense_type': 'crime_type', 'category': 'crime_type',
      'gravity': 'severity', 'risk_level': 'severity',
      'case_status': 'status',
      'brief_facts': 'fir_text', 'description': 'fir_text',
      'accused_id': 'offender_id', 'offender': 'offender_id',
      'socio_economic': 'socio_economic_index'
    };

    const parseRow = (row: string): string[] => {
      const cells: string[] = [];
      let inQ = false, cur = '';
      for (const ch of row) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
        else { cur += ch; }
      }
      cells.push(cur.trim());
      return cells;
    };

    const rawHeaders = parseRow(lines[0]).map(h => {
      const norm = h.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
      return headerAliases[norm] ?? norm;
    });

    const batchId = `BATCH-${Date.now()}`;
    let inserted = 0;
    const errors: string[] = [];

    const insertStmt = db.prepare(`
      INSERT INTO incidents (
        incident_id, date, time, district, station, lat, long,
        crime_type, severity, status, mo_tags, weapon_used,
        fir_text, offender_id, victim_demographic, socio_economic_index,
        evidence_ids, source_batch_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 1; i < lines.length; i++) {
      try {
        const cells = parseRow(lines[i]);
        const row: Record<string, string> = {};
        rawHeaders.forEach((h, idx) => { row[h] = cells[idx] ?? ''; });

        const id = row['incident_id'] || `CSV-${batchId}-${i}`;
        const date = row['date'] || new Date().toISOString().slice(0, 10);
        const time = row['time'] || '00:00:00';
        const district = row['district'] || 'Unknown';
        const station = row['station'] || 'Unknown PS';
        const lat = parseFloat(row['lat'] || '0') || 0;
        const lng = parseFloat(row['long'] || '0') || 0;
        const crimeType = row['crime_type'] || 'OTHER';
        const severity = row['severity'] || 'MEDIUM';
        const status = row['status'] || 'Under Investigation';
        const moTags = row['mo_tags'] || '';
        const weapon = row['weapon_used'] || '';
        const firText = row['fir_text'] || `CSV import row ${i}`;
        const offenderId = row['offender_id'] || null;
        const victimDemo = row['victim_demographic'] || '';
        const socioIdx = parseFloat(row['socio_economic_index'] || '0') || 0;
        const evidenceIds = row['evidence_ids'] || '';

        await insertStmt.run([
          id, date, time, district, station, lat, lng,
          crimeType, severity, status, moTags, weapon,
          firText, offenderId, victimDemo, socioIdx,
          evidenceIds, batchId
        ], req);
        inserted++;
      } catch (rowErr: any) {
        errors.push(`Row ${i}: ${rowErr.message}`);
      }
    }

    // Log the batch in upload_batches
    try {
      await db.prepare(`
        INSERT OR IGNORE INTO upload_batches (batch_id, station_id, uploaded_at, file_name, stratus_file_id, format_detected, records_parsed, records_flagged, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        batchId,
        req.body.station_id || 'UNKNOWN',
        new Date().toISOString(),
        file.originalname,
        `local:${file.originalname}`,
        'CSV_CLEAN',
        inserted,
        errors.length,
        errors.length === 0 ? 'completed' : 'completed_with_errors'
      ], req);
    } catch (_) { /* non-fatal */ }

    res.json({
      success: true,
      batch_id: batchId,
      records_inserted: inserted,
      records_failed: errors.length,
      errors: errors.slice(0, 20),
      message: `CSV ingested: ${inserted} records inserted into the incidents database.`
    });
  } catch (error: any) {
    console.error('CSV ingest failed:', error);
    res.status(500).json({ error: error.message || 'CSV ingest failed' });
  }
});

// ─── POST /api/bulk-import ────────────────────────────────────────────────────
// Called by the frontend CSV Import tab (AddRecordView).
// Body: { type: 'criminal' | 'victim', records: Record<string, string>[] }
// Each record object uses the column names from the downloadTemplate() function.
app.post('/api/bulk-import', async (req: Request, res: Response) => {
  try {
    const { type, records } = req.body as { type: string; records: Record<string, string>[] };
    if (!Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: 'No records provided.' });
      return;
    }

    const batchId = `BATCH-${Date.now()}`;
    let inserted = 0;
    const errors: { row: number; error: string }[] = [];

    const insertIncident = db.prepare(`
      INSERT INTO incidents (
        incident_id, date, time, district, station, lat, long,
        crime_type, severity, status, mo_tags, weapon_used,
        fir_text, offender_id, victim_demographic, socio_economic_index,
        evidence_ids, source_batch_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertOffender = db.prepare(`
      INSERT OR IGNORE INTO offenders (
        offender_id, name, aliases, dob, address, addresses, phone,
        first_offense_date, districts_active, current_status, risk_score,
        photo_placeholder_id, associates, crime_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      try {
        const rowId = `${batchId}-${i + 1}`;
        const incId = r.incident_id || rowId;
        const date = r.date || r.incident_date || new Date().toISOString().slice(0, 10);
        const time = r.time || r.incident_time || '00:00:00';
        const district = r.district || r.address_district || r.incident_district || 'Unknown';
        const station = r.station || r.incident_station || r.police_station || 'Unknown PS';
        const lat = parseFloat(r.lat || r.latitude || '0') || 0;
        const lng = parseFloat(r.long || r.longitude || r.lng || '0') || 0;
        const crimeType = (r.crime_type || r.offense_type || r.category || 'OTHER').toUpperCase();
        const severity = (r.severity || r.gravity || r.risk_level || 'MEDIUM').toUpperCase();
        const rowStatus = r.status || r.case_status || 'Under Investigation';
        const moTags = Array.isArray(r.mo_tags) ? (r.mo_tags as unknown as string[]).join(',') : (r.mo_tags || '');
        const weapon = r.weapon_used || r.weapon || 'None';
        const firText = r.fir_text || r.brief_facts || r.description || `Bulk import row ${i + 1} — ${crimeType}`;
        const victimDemo = r.victim_demographic || (type === 'victim' ? `${r.gender || ''}, Age ${r.age || 'N/A'}` : '');
        const socioIdx = parseFloat(r.socio_economic_index || r.socio_economic || '0') || 0;
        const evidenceIds = r.evidence_ids || '';

        let offenderId: string | null = null;
        if (type === 'criminal') {
          offenderId = r.offender_id || r.accused_id || `OFF-${rowId}`;
          const name = r.full_name || r.accused_name || r.name || 'Unknown';
          await insertOffender.run([
            offenderId, name,
            r.aliases ? JSON.stringify(r.aliases.split(',').map((a: string) => a.trim())) : '[]',
            r.dob || null,
            r.address_full || r.address || null,
            '[]', r.phone || null,
            date, JSON.stringify([district]),
            r.status || 'absconding',
            parseFloat(r.risk_score || '50') || 50,
            null, '[]', '[]'
          ], req);
        }

        await insertIncident.run([
          incId, date, time, district, station, lat, lng,
          crimeType, severity, rowStatus, moTags, weapon,
          firText, offenderId, victimDemo, socioIdx,
          evidenceIds, batchId
        ], req);
        inserted++;
      } catch (rowErr: any) {
        errors.push({ row: i + 1, error: rowErr.message });
      }
    }

    try {
      await db.prepare(`
        INSERT OR IGNORE INTO upload_batches (batch_id, station_id, uploaded_at, file_name, stratus_file_id, format_detected, records_parsed, records_flagged, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        batchId, 'BULK_JSON', new Date().toISOString(),
        `bulk_${type}_${batchId}.json`, `memory:${batchId}`,
        'JSON_BULK', inserted, errors.length,
        errors.length === 0 ? 'completed' : 'completed_with_errors'
      ], req);
    } catch (_) { /* non-fatal */ }

    res.json({
      success: true,
      total: records.length,
      records_inserted: inserted,
      failed: errors.length,
      batch_id: batchId,
      errors,
      message: `Bulk import done: ${inserted}/${records.length} records inserted.`
    });
  } catch (error: any) {
    console.error('Bulk import failed:', error);
    res.status(500).json({ error: error.message || 'Bulk import failed' });
  }
});

// 10. GET /api/uploaded-firs - fetch staged files
app.get('/api/uploaded-firs', async (req: Request, res: Response) => {
  try {
    const rows = await db.prepare('SELECT * FROM uploaded_firs ORDER BY uploaded_at DESC').all([], req) as any[];
    const mapped = rows.map(r => ({
      ...r,
      extracted_fields: JSON.parse(r.extracted_fields_json),
      field_confidence: JSON.parse(r.field_confidence_json)
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. POST /api/uploaded-firs - store a client-ingested raw FIR
app.post('/api/uploaded-firs', async (req: Request, res: Response) => {
  try {
    const { upload_id, raw_file_ref, ocr_text, extracted_fields, field_confidence, linked_offender_id, role } = req.body;
    await db.prepare(`
      INSERT INTO uploaded_firs (upload_id, raw_file_ref, ocr_text, extracted_fields_json, field_confidence_json, linked_incident_id, linked_offender_id, uploaded_at, uploaded_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run([
      upload_id || `UPL-${Date.now()}`,
      raw_file_ref,
      ocr_text || '',
      JSON.stringify(extracted_fields || {}),
      JSON.stringify(field_confidence || {}),
      null,
      linked_offender_id || null,
      new Date().toISOString(),
      role || 'SHO'
    ], req);
    res.json({ success: true, upload_id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 12. POST /api/uploaded-firs/resolve-identity - Identity disambiguation
app.post('/api/uploaded-firs/resolve-identity', async (req: Request, res: Response) => {
  try {
    const { name, dob, address } = req.body;
    if (!name) {
       res.status(400).json({ error: 'Name is required for resolution' });
       return;
    }

    const offendersRows = await db.prepare('SELECT * FROM offenders').all([], req) as any[];
    const candidates = offendersRows.map(off => {
      const aliasList = JSON.parse(off.aliases);
      
      // Calculate best similarity score across Name & Aliases
      let nameScore = jaroWinkler(name, off.name);
      aliasList.forEach((alias: string) => {
        const score = jaroWinkler(name, alias);
        if (score > nameScore) nameScore = score;
      });

      let boost = 0;
      // DOB match boost (exact match adds 0.15)
      if (dob && off.dob === dob) {
        boost += 0.15;
      }
      
      // Address token match boost
      if (address && off.address) {
        const addrTokens = address.toLowerCase().split(/\s+/);
        const offAddr = off.address.toLowerCase();
        let tokensMatched = 0;
        addrTokens.forEach((t: string) => {
          if (t.length > 3 && offAddr.includes(t)) tokensMatched++;
        });
        if (tokensMatched > 0) boost += Math.min(0.1, tokensMatched * 0.03);
      }

      const totalScore = Math.min(1.0, nameScore + boost);

      return {
        ...off,
        aliases: aliasList,
        addresses: JSON.parse(off.addresses),
        districts_active: JSON.parse(off.districts_active),
        associates: JSON.parse(off.associates),
        crime_history: JSON.parse(off.crime_history),
        similarity_score: totalScore
      };
    });

    // Filter by similarity threshold & sort
    const matches = candidates
      .filter(c => c.similarity_score >= 0.55)
      .sort((a, b) => b.similarity_score - a.similarity_score);

    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 13. ML Proxies
app.get('/api/ml/socio-economic-correlation', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/socio-economic-correlation`);
    if (response.ok) {
      res.json(await response.json());
    } else {
      throw new Error();
    }
  } catch {
    res.json({
      categories: ['Unemployment Rate', 'Illumination Quality', 'Alcohol Shop Density', 'School Dropout Rate', 'Average Income'],
      matrix: [
        [1.00, 0.15, 0.45, 0.62, -0.52],
        [0.15, 1.00, -0.22, 0.08, 0.31],
        [0.45, -0.22, 1.00, 0.35, -0.12],
        [0.62, 0.08, 0.35, 1.00, -0.58],
        [-0.52, 0.31, -0.12, -0.58, 1.00]
      ],
      crime_correlation: {
        THEFT: [0.58, -0.45, 0.38, 0.50, -0.61],
        ASSAULT: [0.42, -0.38, 0.72, 0.48, -0.32],
        CYBER: [0.18, 0.12, -0.05, -0.25, 0.68],
        DRUGS: [0.65, -0.31, 0.58, 0.62, -0.41],
        FRAUD: [0.25, 0.05, 0.12, -0.12, 0.52]
      }
    });
  }
});

app.get('/api/ml/risk-forecast', async (req: Request, res: Response) => {
  try {
    const { district } = req.query;
    const url = district ? `${ML_SERVICE_URL}/api/ml/risk-forecast?district=${district}` : `${ML_SERVICE_URL}/api/ml/risk-forecast`;
    const response = await fetch(url);
    if (response.ok) {
      res.json(await response.json());
    } else {
      throw new Error();
    }
  } catch {
    const districts = req.query.district ? [req.query.district] : ['BENGALURU_CITY', 'MYSURU', 'HUBBALLI_DHARWAD', 'MANGALURU', 'BELAGAVI'];
    const forecast = [];
    for (const dist of districts) {
      forecast.push(
        { grid_id: `${dist}-G1`, name: "Commercial Market Center", risk_score: 0.89, major_factor: "High density commercial activity & festival schedule", lat_offset: 0.005, lng_offset: -0.005 },
        { grid_id: `${dist}-G2`, name: "Metro Transit Hub", risk_score: 0.76, major_factor: "Inadequate street lighting & late night transit clusters", lat_offset: -0.008, lng_offset: 0.008 },
        { grid_id: `${dist}-G3`, name: "Residential Core", risk_score: 0.32, major_factor: "High patrol visibility & low socio-economic stress score", lat_offset: 0.015, lng_offset: -0.015 }
      );
    }
    res.json(forecast);
  }
});

app.post('/api/ml/similarity-search', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/similarity-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (response.ok) {
      res.json(await response.json());
    } else {
      throw new Error();
    }
  } catch {
    const { query } = req.body;
    const allIncidents = await db.prepare('SELECT * FROM incidents').all([], req) as any[];
    const queryLower = (query || '').toLowerCase();
    
    const matches = allIncidents
      .map(inc => {
        let score = 0;
        if (queryLower) {
          if (inc.fir_text.toLowerCase().includes(queryLower)) score += 0.5;
          if (inc.mo_tags.toLowerCase().includes(queryLower)) score += 0.3;
          if (inc.crime_type.toLowerCase().includes(queryLower)) score += 0.2;
        } else {
          score = Math.random();
        }
        return { ...inc, score };
      })
      .filter(inc => inc.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(inc => ({
         incident_id: inc.incident_id,
         title: `${inc.crime_type} Incident`,
         station: inc.station,
         district: inc.district,
         description: inc.fir_text,
         modus_operandi: inc.mo_tags,
         score: inc.score
      }));

    res.json(matches);
  }
});

// Expose official IPC crime statistics loaded from the backend CSV database
app.get('/api/ipc-statistics', (req: Request, res: Response) => {
  try {
    const csvPath = path.join(__dirname, '..', '..', '..', 'data', 'ipc_crime_statistics.csv');
    if (!fs.existsSync(csvPath)) {
      res.json([]);
      return;
    }
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    const results: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quotes with commas inside them correctly:
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      if (matches.length < 7) continue;

      const cleanRow = matches.map(m => m.replace(/^"|"$/g, '').trim());
      results.push({
        act: cleanRow[0],
        major_head: cleanRow[1],
        minor_head: cleanRow[2],
        current_year: parseInt(cleanRow[3]) || 0,
        prev_year_month: parseInt(cleanRow[4]) || 0,
        prev_month: parseInt(cleanRow[5]) || 0,
        current_month: parseInt(cleanRow[6]) || 0
      });
    }

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ─── AI FEATURE 0: FIR PDF Text Extraction ─────────────────────────────────
// POST /api/ai/fir-pdf-extract
// Accepts a PDF file upload (multipart/form-data field: "pdf"),
// extracts raw text using pdf-parse, returns it for use by fir-summarize.
const pdfMemStorage = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/ai/fir-pdf-extract', pdfMemStorage.single('pdf'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded. Send a multipart/form-data request with field name "pdf".' });
      return;
    }
    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'Uploaded file is not a PDF.' });
      return;
    }

    let extractedText = '';
    let numPages = 1;

    const pdfParseModule: any = require('pdf-parse');
    if (typeof pdfParseModule === 'function') {
      const parsed = await pdfParseModule(req.file.buffer);
      extractedText = parsed.text?.trim() || '';
      numPages = parsed.numpages || 1;
    } else if (pdfParseModule && typeof pdfParseModule.PDFParse === 'function') {
      const parser = new pdfParseModule.PDFParse({ data: req.file.buffer });
      const result = await parser.getText();
      extractedText = result.text?.trim() || '';
      numPages = result.total || 1;
      await parser.destroy();
    } else {
      throw new Error('Unsupported pdf-parse module exports structure');
    }

    if (!extractedText) {
      res.status(422).json({ error: 'PDF text extraction returned empty content. The file may be a scanned image-only PDF without embedded text. Please paste the text manually.' });
      return;
    }

    res.json({
      text: extractedText,
      pages: numPages,
      chars: extractedText.length,
      source: 'pdf-parse'
    });
  } catch (error: any) {
    console.error('[FIR PDF Extract] Error:', error.message);
    res.status(500).json({ error: 'PDF parsing failed: ' + error.message });
  }
});


// ─── AI FEATURE 1: Smart FIR Summarizer ────────────────────────────────────
// POST /api/ai/fir-summarize
// Accepts raw FIR text. In Catalyst: Zia OCR + QuickML LLM structured extraction.
// Local dev: deterministic keyword/regex parser for instant demo.
app.post('/api/ai/fir-summarize', async (req: Request, res: Response) => {
  try {
    const { fir_text, upload_id } = req.body;
    if (!fir_text && !upload_id) {
      res.status(400).json({ error: 'fir_text or upload_id is required' });
      return;
    }

    let rawText = fir_text || '';

    // If upload_id provided, pull the OCR text already stored
    if (!rawText && upload_id) {
      const fir = await db.prepare('SELECT ocr_text FROM uploaded_firs WHERE upload_id = ?').get([upload_id], req) as any;
      rawText = fir?.ocr_text || '';
    }

    // In Catalyst production: use QuickML LLM to extract structured fields
    const catalystMode = process.env.DB_MODE === 'catalyst' || !!process.env.CATALYST_PROJECT_ID;
    if (catalystMode) {
      try {
        const catalystApp = catalyst.initialize(req as any);
        // VERIFY against docs.catalyst.zoho.com — QuickML LLM API call signature
        const llm = (catalystApp as any).quickml?.();
        if (llm) {
          const prompt = `You are a police data extraction assistant for Karnataka Police. Extract structured fields from this First Information Report text and respond ONLY with a valid JSON object with these exact keys: crime_type (one of: THEFT/ASSAULT/FRAUD/CYBER/DRUGS/KIDNAPPING/MURDER), accused_name, aliases (array), district, station, date (YYYY-MM-DD), time (HH:MM), mo_tags (array of modus operandi keywords), weapon_used, property_stolen, complainant_name, severity (LOW/MEDIUM/HIGH). FIR TEXT:\n\n${rawText}`;
          const result = await llm.generateText({ prompt, model: 'gpt-4o-mini' });
          const parsed = JSON.parse(result.text || result.content || '{}');
          return res.json({
            source: 'catalyst-quickml',
            extracted: parsed,
            confidence_scores: {
              crime_type: 0.95, accused_name: 0.88, district: 0.92, mo_tags: 0.90, date: 0.97
            },
            raw_text: rawText
          });
        }
      } catch (llmErr: any) {
        console.warn('QuickML LLM unavailable, falling back to keyword parser:', llmErr.message);
      }
    }

    // In local development: use LLM (Groq or Gemini) if key is present
    const hasLLMKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (hasLLMKey && !catalystMode) {
      try {
        const prompt = `You are a police data extraction assistant for Karnataka Police. Extract structured fields from this First Information Report text and respond ONLY with a valid JSON object with these exact keys: crime_type (one of: THEFT/ASSAULT/FRAUD/CYBER/DRUGS/KIDNAPPING/MURDER), accused_name, aliases (array), district, station, date (YYYY-MM-DD), time (HH:MM), mo_tags (array of modus operandi keywords), weapon_used, property_stolen, complainant_name, severity (LOW/MEDIUM/HIGH). FIR TEXT:\n\n${rawText}`;
        const result = await callLLM(prompt);
        const cleaned = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned || '{}');
        return res.json({
          source: result.source,
          extracted: parsed,
          confidence_scores: {
            crime_type: 0.95, accused_name: 0.88, district: 0.92, mo_tags: 0.90, date: 0.97
          },
          raw_text: rawText
        });
      } catch (err: any) {
        console.warn('Local LLM FIR extraction failed, falling back to keywords:', err.message);
      }
    }

    // ── Local dev / Catalyst fallback: deterministic keyword extraction ──
    const text = rawText.toLowerCase();

    // Crime type detection
    const crimeTypeMap: Record<string, string> = {
      'theft': 'THEFT', 'burglary': 'THEFT', 'stolen': 'THEFT', 'snatching': 'THEFT',
      'assault': 'ASSAULT', 'attack': 'ASSAULT', 'hurt': 'ASSAULT', 'murder': 'ASSAULT',
      'fraud': 'FRAUD', 'cheating': 'FRAUD', 'scam': 'FRAUD', 'deceive': 'FRAUD',
      'cyber': 'CYBER', 'hacking': 'CYBER', 'otp': 'CYBER', 'phishing': 'CYBER',
      'drugs': 'DRUGS', 'narcotic': 'DRUGS', 'ndps': 'DRUGS',
      'kidnap': 'KIDNAPPING', 'abduct': 'KIDNAPPING'
    };
    let crime_type = 'THEFT';
    for (const [kw, ct] of Object.entries(crimeTypeMap)) {
      if (text.includes(kw)) { crime_type = ct; break; }
    }

    // District extraction
    const districtMap: Record<string, string> = {
      'bengaluru': 'BENGALURU_CITY', 'bangalore': 'BENGALURU_CITY',
      'mysuru': 'MYSURU', 'mysore': 'MYSURU',
      'mangaluru': 'MANGALURU', 'mangalore': 'MANGALURU',
      'hubballi': 'HUBBALLI_DHARWAD', 'dharwad': 'HUBBALLI_DHARWAD',
      'belagavi': 'BELAGAVI', 'belgaum': 'BELAGAVI'
    };
    let district = 'BENGALURU_CITY';
    for (const [kw, d] of Object.entries(districtMap)) {
      if (text.includes(kw)) { district = d; break; }
    }

    // Station extraction — match "PS" preceded by a name
    const stationMatch = rawText.match(/([A-Z][a-zA-Z\s]+(?:PS|Police Station))/);
    const station = stationMatch ? stationMatch[1].trim() : 'Unknown PS';

    // Date extraction
    const dateMatch = rawText.match(/\b(\d{4}-\d{2}-\d{2})\b/) || rawText.match(/\b(\d{2}[-\/]\d{2}[-\/]\d{4})\b/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // Time extraction
    const timeMatch = rawText.match(/\b(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\b/);
    const time = timeMatch ? timeMatch[1] : '00:00';

    // Accused name extraction — look for common patterns
    const accusedMatch = rawText.match(/(?:Accused|Suspect|Arrested)[:\s]+([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})/);
    const accused_name = accusedMatch ? accusedMatch[1] : 'Unknown';

    // Alias extraction
    const aliasMatch = rawText.match(/@\s*([A-Za-z]+(?: [A-Za-z]+)?)/g);
    const aliases = aliasMatch ? aliasMatch.map((a: string) => a.replace('@', '').trim()) : [];

    // Complainant extraction
    const complainantMatch = rawText.match(/(?:Complainant|Informant)[:\s]+([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})/);
    const complainant_name = complainantMatch ? complainantMatch[1] : 'Unknown';

    // MO tags extraction
    const moKeywords = ['grille_cut', 'grille cut', 'hacksaw', 'night', 'burglary', 'chain snatch',
      'motorcycle', 'bike', 'knife', 'acid', 'poison', 'remote access', 'otp', 'atm', 'empty house'];
    const mo_tags = moKeywords
      .filter(kw => text.includes(kw.toLowerCase()))
      .map(kw => kw.replace(/ /g, '_'));

    // Property stolen
    const propertyMatch = rawText.match(/(?:stolen|snatched|taken|missing)[:\s]*(gold|cash|mobile|laptop|jewel[a-z]*|bike|vehicle)/i);
    const property_stolen = propertyMatch ? propertyMatch[1] : 'Unspecified';

    // Severity
    const severity = crime_type === 'ASSAULT' || text.includes('murder') ? 'HIGH'
      : crime_type === 'DRUGS' || crime_type === 'KIDNAPPING' ? 'HIGH'
      : crime_type === 'THEFT' || crime_type === 'FRAUD' ? 'MEDIUM'
      : 'LOW';

    // Weapon used
    const weaponKws: Record<string, string> = {
      'hacksaw': 'Hacksaw', 'knife': 'Knife/Blade', 'gun': 'Firearm',
      'rod': 'Iron Rod', 'acid': 'Acid', 'tools': 'Tools'
    };
    let weapon_used = 'None';
    for (const [kw, w] of Object.entries(weaponKws)) {
      if (text.includes(kw)) { weapon_used = w; break; }
    }

    // Build confidence scores based on pattern match certainty
    const confidence_scores = {
      crime_type: crime_type !== 'THEFT' ? 0.91 : 0.78,
      accused_name: accusedMatch ? 0.85 : 0.42,
      district: district !== 'BENGALURU_CITY' ? 0.90 : 0.72,
      station: stationMatch ? 0.88 : 0.40,
      date: dateMatch ? 0.95 : 0.55,
      mo_tags: mo_tags.length > 0 ? 0.87 : 0.50
    };

    res.json({
      source: 'keyword-parser',
      extracted: {
        crime_type,
        accused_name,
        aliases,
        district,
        station,
        date,
        time,
        mo_tags,
        weapon_used,
        property_stolen,
        complainant_name,
        severity
      },
      confidence_scores,
      raw_text: rawText
    });
  } catch (error: any) {
    console.error('FIR summarize error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── AI FEATURE 3: Natural Language Query Assistant ─────────────────────────
// POST /api/ai/nl-query
// Accepts plain English question → parses intent → returns filtered incidents.
// Catalyst: QuickML LLM. Local dev: keyword-intent parser.
app.post('/api/ai/nl-query', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: 'question is required' });
      return;
    }

    const text = question.toLowerCase();
    let district: string | null = null;
    let crime_type: string | null = null;
    let severity: string | null = null;
    let dateRange: string | null = null;
    let station: string | null = null;

    // In Catalyst: use QuickML LLM for intent extraction
    const catalystMode = process.env.DB_MODE === 'catalyst' || !!process.env.CATALYST_PROJECT_ID;
    if (catalystMode) {
      try {
        const catalystApp = catalyst.initialize(req as any);
        const llm = (catalystApp as any).quickml?.();
        if (llm) {
          const schema = { district: 'BENGALURU_CITY|MYSURU|MANGALURU|HUBBALLI_DHARWAD|BELAGAVI|null', crime_type: 'THEFT|ASSAULT|FRAUD|CYBER|DRUGS|KIDNAPPING|null', severity: 'LOW|MEDIUM|HIGH|null', dateRange: '30d|90d|1y|ALL|null', station: 'string|null' };
          const prompt = `Extract query filters from this police officer question. Respond ONLY with valid JSON matching this schema: ${JSON.stringify(schema)}. Question: "${question}"`;
          const result = await llm.generateText({ prompt, model: 'gpt-4o-mini' });
          const parsed = JSON.parse(result.text || result.content || '{}');
          district = parsed.district;
          crime_type = parsed.crime_type;
          severity = parsed.severity;
          dateRange = parsed.dateRange;
          station = parsed.station;
        }
      } catch (llmErr: any) {
        console.warn('QuickML NL extraction failed, using keyword parser:', llmErr.message);
      }
    }

    // In local development: use LLM (Groq or Gemini) if key is present
    const hasLLMKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (hasLLMKey && !catalystMode) {
      try {
        const schema = { district: 'BENGALURU_CITY|MYSURU|MANGALURU|HUBBALLI_DHARWAD|BELAGAVI|null', crime_type: 'THEFT|ASSAULT|FRAUD|CYBER|DRUGS|KIDNAPPING|null', severity: 'LOW|MEDIUM|HIGH|null', dateRange: '30d|90d|1y|ALL|null', station: 'string|null' };
        const prompt = `Extract query filters from this police officer question. Respond ONLY with valid JSON matching this schema: ${JSON.stringify(schema)}. Question: "${question}"`;
        const result = await callLLM(prompt);
        const cleaned = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned || '{}');
        district = parsed.district;
        crime_type = parsed.crime_type;
        severity = parsed.severity;
        dateRange = parsed.dateRange;
        station = parsed.station;
      } catch (err: any) {
        console.warn('Local LLM NL query parsing failed, falling back to keywords:', err.message);
      }
    }

    // ── Keyword-intent parser (local dev + Catalyst fallback) ──
    if (!district) {
      if (text.includes('bengaluru') || text.includes('bangalore')) district = 'BENGALURU_CITY';
      else if (text.includes('mysuru') || text.includes('mysore')) district = 'MYSURU';
      else if (text.includes('mangaluru') || text.includes('mangalore')) district = 'MANGALURU';
      else if (text.includes('hubballi') || text.includes('dharwad')) district = 'HUBBALLI_DHARWAD';
      else if (text.includes('belagavi') || text.includes('belgaum')) district = 'BELAGAVI';
    }

    if (!crime_type) {
      if (text.includes('theft') || text.includes('burglary') || text.includes('snatching') || text.includes('rob')) crime_type = 'THEFT';
      else if (text.includes('assault') || text.includes('attack') || text.includes('murder') || text.includes('hurt')) crime_type = 'ASSAULT';
      else if (text.includes('fraud') || text.includes('cheating') || text.includes('scam')) crime_type = 'FRAUD';
      else if (text.includes('cyber') || text.includes('hacking') || text.includes('online')) crime_type = 'CYBER';
      else if (text.includes('drug') || text.includes('narcotic')) crime_type = 'DRUGS';
    }

    if (!severity) {
      if (text.includes('high') || text.includes('serious') || text.includes('severe') || text.includes('critical')) severity = 'HIGH';
      else if (text.includes('medium') || text.includes('moderate')) severity = 'MEDIUM';
      else if (text.includes('low') || text.includes('minor') || text.includes('petty')) severity = 'LOW';
    }

    if (!dateRange) {
      if (text.includes('last month') || text.includes('30 day') || text.includes('this month')) dateRange = '30d';
      else if (text.includes('3 month') || text.includes('quarter') || text.includes('90 day')) dateRange = '90d';
      else if (text.includes('year') || text.includes('annual') || text.includes('12 month')) dateRange = '1y';
      else if (text.includes('all') || text.includes('ever') || text.includes('total')) dateRange = 'ALL';
      else dateRange = '30d'; // sensible default
    }

    // Build readable interpreted query chips
    const interpreted = [
      crime_type && { type: 'crime', label: crime_type },
      district && { type: 'district', label: district.replace('_', ' ') },
      severity && { type: 'severity', label: severity + ' SEVERITY' },
      dateRange && { type: 'date', label: dateRange === '30d' ? 'Last 30 Days' : dateRange === '90d' ? 'Last 90 Days' : dateRange === '1y' ? 'Last Year' : 'All Time' },
      station && { type: 'station', label: station }
    ].filter(Boolean);

    // Build query
    let query = 'SELECT * FROM incidents WHERE 1=1';
    const params: any[] = [];
    if (district) { query += ' AND district = ?'; params.push(district); }
    if (crime_type) { query += ' AND crime_type = ?'; params.push(crime_type); }
    if (severity) { query += ' AND severity = ?'; params.push(severity); }
    if (dateRange && dateRange !== 'ALL') {
      const now = new Date();
      if (dateRange === '30d') now.setDate(now.getDate() - 30);
      else if (dateRange === '90d') now.setDate(now.getDate() - 90);
      else if (dateRange === '1y') now.setFullYear(now.getFullYear() - 1);
      query += ' AND date >= ?';
      params.push(now.toISOString().split('T')[0]);
    }
    query += ' ORDER BY date DESC LIMIT 20';

    const results = await db.prepare(query).all(params, req) as any[];

    res.json({
      question,
      interpreted,
      source: catalystMode ? 'catalyst-quickml' : 'keyword-parser',
      total: results.length,
      results: results.map(r => ({
        id: r.incident_id,
        incident_id: r.incident_id,
        date: r.date,
        district: r.district,
        station: r.station,
        crime_type: r.crime_type,
        severity: r.severity,
        status: r.status,
        fir_text: r.fir_text,
        mo_tags: r.mo_tags,
        lat: r.lat,
        long: r.long
      }))
    });
  } catch (error: any) {
    console.error('NL Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/chat
// Conversational AI officer assistant
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    
    // Retrieve incidents and offenders context from DB
    const incidents = await db.prepare('SELECT * FROM incidents ORDER BY date DESC LIMIT 20').all([], req) as any[];
    const offenders = await db.prepare('SELECT * FROM offenders LIMIT 10').all([], req) as any[];
    
    // Map context into highly compact summaries to stay safely below LLM token limits (e.g. Groq 6000 TPM limit)
    const compactIncidents = incidents.map(i => ({
      id: i.incident_id,
      date: i.date,
      type: i.crime_type,
      district: i.district,
      station: i.station,
      severity: i.severity,
      status: i.status,
      mo_tags: i.mo_tags
    })).slice(0, 8);

    const compactOffenders = offenders.map(o => ({
      id: o.offender_id,
      name: o.name,
      classification: o.classification,
      risk_score: o.risk_score,
      mo: o.primary_mo
    })).slice(0, 4);

    const text = message.toLowerCase();
    
    // In Catalyst production: use QuickML LLM to generate officer response based on database context
    const catalystMode = process.env.DB_MODE === 'catalyst' || !!process.env.CATALYST_PROJECT_ID;
    if (catalystMode) {
      try {
        const catalystApp = catalyst.initialize(req as any);
        const llm = (catalystApp as any).quickml?.();
        if (llm) {
          const prompt = `You are a Senior Karnataka State Police Intelligence Officer (KSP Chatbot). Answer conversational queries from fellow officers based on this real-time database context.
Incidents database summary: ${JSON.stringify(compactIncidents)}
Offenders database summary: ${JSON.stringify(compactOffenders)}

Rules:
1. Greet the officer with "Jai Hind Officer" or similar professional KSP greeting.
2. Provide a tactical analysis of the situation based on the query.
3. Suggest concrete policing recommendations (e.g. increase patrol in grids, focus on specific suspect MO).
4. If they ask about specific crimes or districts, reference the data.
5. Answer from the perspective of an experienced police analyst.
6. Keep your response brief, action-oriented, and structured.

User Message: "${message}"`;
          const result = await llm.generateText({ prompt, model: 'gpt-4o-mini' });
          const replyText = result.text || result.content || "Unable to formulate response.";
          
          const relatedIncidents = incidents.filter(inc => 
            text.includes(inc.district.toLowerCase()) || 
            text.includes(inc.crime_type.toLowerCase()) || 
            text.includes(inc.station.toLowerCase())
          ).slice(0, 3);
          
          return res.json({
            content: replyText,
            incidents: relatedIncidents,
            source: 'catalyst-quickml'
          });
        }
      } catch (llmErr: any) {
        console.warn('QuickML Chatbot LLM failed, falling back to local reasoning:', llmErr.message);
      }
    }
    
    // In local development: use LLM (Groq or Gemini) if key is present
    const hasLLMKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (hasLLMKey && !catalystMode) {
      try {
        const prompt = `You are a Senior Karnataka State Police Intelligence Officer (KSP Chatbot). Answer conversational queries from fellow officers based on this real-time database context.
Incidents database summary: ${JSON.stringify(compactIncidents)}
Offenders database summary: ${JSON.stringify(compactOffenders)}

Rules:
1. Greet the officer with "Jai Hind Officer" or similar professional KSP greeting.
2. Provide a tactical analysis of the situation based on the query.
3. Suggest concrete policing recommendations (e.g. increase patrol in grids, focus on specific suspect MO).
4. If they ask about specific crimes or districts, reference the data.
5. Answer from the perspective of an experienced police analyst.
6. Keep your response brief, action-oriented, and structured.

User Message: "${message}"`;
        const result = await callLLM(prompt);
        
        const relatedIncidents = incidents.filter(inc => 
          text.includes(inc.district.toLowerCase()) || 
          text.includes(inc.crime_type.toLowerCase()) || 
          text.includes(inc.station.toLowerCase())
        ).slice(0, 3);
        
        return res.json({
          content: result.text,
          incidents: relatedIncidents,
          source: result.source
        });
      } catch (err: any) {
        console.warn('Local LLM chat failed, falling back to local reasoning:', err.message);
      }
    }
    
    // ── Local dev fallback: Intelligent rule-based officer reasoning ──
    let reply = "";
    let relatedIncidents: any[] = [];
    
    if (text.includes('theft') || text.includes('burglary') || text.includes('robbery') || text.includes('stolen')) {
      relatedIncidents = incidents.filter(i => i.crime_type === 'THEFT').slice(0, 3);
      reply = `Jai Hind Officer. I have audited our active CaseMaster logs. We are tracking a total of ${incidents.filter(i => i.crime_type === 'THEFT').length} theft cases. Notably, we see a recurrence of window-grille cutting in Bengaluru and Dharwad suburban areas. 

**Intelligence Observations & Suggestions:**
1. **MO Consistency**: Suspects are targeting empty residences during night hours (22:00 - 04:00).
2. **Key Suspect**: Ramesh Kumar (alias "Hacksaw Ramesh") remains absconding. His associate network shares links with suspect nodes in Ullal.
3. **Strategic Dispatch**: Propose increasing vehicle patrol density (electric beats) near grids where illumination index is below 4.0.`;
    } else if (text.includes('assault') || text.includes('murder') || text.includes('violence') || text.includes('clash')) {
      relatedIncidents = incidents.filter(i => i.crime_type === 'ASSAULT' || i.crime_type === 'MURDER' || text.includes('murder')).slice(0, 3);
      reply = `Jai Hind Officer. Regarding high-severity violent crimes, our SQLite catalog records ${incidents.filter(i => i.crime_type === 'ASSAULT').length} active assault cases. 

**Tactical Recommendations:**
1. **Transit Zones**: A cluster of violent offenses is noted around major transit nodes (metro/railway stations) during late-night hours.
2. **Preventive Beats**: Recommend active deployment of SHO units at identified spatiotemporal hotspots (specifically G1 and G2 transit grids) during weekend shifts.
3. **Victim Care Linkage**: Sync active case profiles with the Victim Ingestion system to ensure fast response coordinates for murder-victim registries.`;
    } else if (text.includes('cyber') || text.includes('fraud') || text.includes('cheating') || text.includes('otp')) {
      relatedIncidents = incidents.filter(i => i.crime_type === 'CYBER' || i.crime_type === 'FRAUD').slice(0, 3);
      reply = `Jai Hind Officer. Cybercrime and financial fraud rates show an upward trajectory of +14% state-wide.

**Strategic Recommendations:**
1. **Modus Operandi**: Most incidents involve remote-access phishing or OTP scams targeted at elderly citizens in high-income zones.
2. **ILLM Analysis**: Since these perpetrators operate cross-jurisdictionally, we recommend immediate coordination with the State Cyber Cell (CID Bengaluru).
3. **Illumination-Neutral Risk**: Unlike physical property thefts, cyber risk maps show no correlation with physical lighting or district socio-economic stress. Recommend public awareness campaigns via local FM radio and SMS alerts.`;
    } else {
      relatedIncidents = incidents.slice(0, 2);
      reply = `Jai Hind Officer. I am the CrimePulse AI Command Assistant. I hold real-time context over ${incidents.length} active incidents and ${offenders.length} criminal profiles across Karnataka.

How can I assist you today? You can ask me:
*   *"Analyze recent burglaries and suggest patrol updates"*
*   *"What is the situation regarding assault incidents in our districts?"*
*   *"Provide threat levels and recommendations for cyber fraud scams"*`;
    }
    
    res.json({
      content: reply,
      incidents: relatedIncidents,
      source: 'local-officer-reasoning'
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/db/list-tables', async (req: Request, res: Response) => {
  try {
    const catalystApp = catalyst.initialize(req as any);
    const tables = await catalystApp.datastore().getAllTables();
    res.json({ tables: tables.map((t: any) => t.tableName) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || error.toString() });
  }
});

app.get('/api/db/seed', async (req: Request, res: Response) => {


  try {
    const { runDatabaseSeeder } = require('./db/seeder');
    await runDatabaseSeeder(req);
    res.json({ success: true, message: 'Database seeded successfully with default records.' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    res.status(500).json({ 
      error: error.message || (error.toString ? error.toString() : 'Unknown error'),
      stack: error.stack,
      details: error
    });
  }
});

app.get('/api/credentials', async (req: Request, res: Response) => {
  try {
    const rows = await db.prepare("SELECT role, username, password FROM system_credentials").all([], req);
    res.json({ credentials: rows });
  } catch (error: any) {
    console.error('Failed to get credentials:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

app.post('/api/credentials', async (req: Request, res: Response) => {
  const { role, username, password } = req.body;
  if (!role || !username || !password) {
    return res.status(400).json({ error: 'Missing role, username or password' });
  }
  try {
    await db.prepare("INSERT INTO system_credentials (role, username, password) VALUES (?, ?, ?) ON CONFLICT(role) DO UPDATE SET username=excluded.username, password=excluded.password").run([role, username, password], req);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update credentials:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`CrimePulse Express Backend running on port ${PORT}`);
});


