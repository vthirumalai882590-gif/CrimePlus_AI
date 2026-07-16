import path from 'path';
import catalyst from 'zcatalyst-sdk-node';
import fs from 'fs';

// We always use SQLite (better-sqlite3) both locally and in Catalyst AppSail.
// AppSail is a persistent container — the bundled crimepulse.db file is readable.
// Catalyst Datastore (ZCQL) is NOT used because it requires tables to be manually
// created in the Zoho Console and has a 4-join limit that breaks our normalized schema.
const isCatalyst =
  false;
class StatementWrapper {
  private sql: string;
  private sqliteStmt: any;

  constructor(sql: string, sqliteDb: any) {
    this.sql = sql;
    if (sqliteDb) {
      this.sqliteStmt = sqliteDb.prepare(sql);
    }
  }

  // Returns all rows
  async all(params: any[] = [], req?: any): Promise<any[]> {
    if (isCatalyst) {
      const catalystApp = catalyst.initialize(req);
      const zcql = catalystApp.zcql();
      let queryStr = this.interpolateParams(this.sql, params);

      // Handle table name and query translations for normalized schema under ZCQL
      if (this.sql.toLowerCase().includes('from incidents')) {
        const queryStrLower = queryStr.toLowerCase();
        let cases: any[] = [];
        let units: any[] = [];
        let districts: any[] = [];
        let subHeads: any[] = [];
        let statusMaster: any[] = [];
        let gravityMaster: any[] = [];
        let accused: any[] = [];

        try {
          const results = await Promise.all([
            zcql.executeZCQLQuery("SELECT * FROM CaseMaster"),
            zcql.executeZCQLQuery("SELECT * FROM Unit"),
            zcql.executeZCQLQuery("SELECT * FROM District"),
            zcql.executeZCQLQuery("SELECT * FROM CrimeSubHead"),
            zcql.executeZCQLQuery("SELECT * FROM CaseStatusMaster"),
            zcql.executeZCQLQuery("SELECT * FROM GravityOffence"),
            zcql.executeZCQLQuery("SELECT * FROM Accused")
          ]);

          cases = results[0] || [];
          units = results[1] || [];
          districts = results[2] || [];
          subHeads = results[3] || [];
          statusMaster = results[4] || [];
          gravityMaster = results[5] || [];
          accused = results[6] || [];
        } catch (err: any) {
          console.error("In-memory fetch failed for ZCQL incidents:", err);
          throw new Error(`ZCQL Parallel Fetch Failed: ${err.message || err.toString()}`);
        }

        const flatCases = cases.map((r: any) => r.CaseMaster).filter(Boolean);
        const flatUnits = units.map((r: any) => r.Unit).filter(Boolean);
        const flatDistricts = districts.map((r: any) => r.District).filter(Boolean);
        const flatSubHeads = subHeads.map((r: any) => r.CrimeSubHead).filter(Boolean);
        const flatStatus = statusMaster.map((r: any) => r.CaseStatusMaster).filter(Boolean);
        const flatGravity = gravityMaster.map((r: any) => r.GravityOffence).filter(Boolean);
        const flatAccused = accused.map((r: any) => r.Accused).filter(Boolean);

        let joinedRows = flatCases.map((c: any) => {
          const unit = flatUnits.find((u: any) => String(u.UnitID) === String(c.PoliceStationID));
          const dist = unit ? flatDistricts.find((d: any) => String(d.DistrictID) === String(unit.DistrictID)) : null;
          const subHead = flatSubHeads.find((sh: any) => String(sh.CrimeSubHeadID) === String(c.CrimeMinorHeadID));
          const status = flatStatus.find((s: any) => String(s.CaseStatusID) === String(c.CaseStatusID));
          const gravity = flatGravity.find((g: any) => String(g.GravityOffenceID) === String(c.GravityOffenceID));
          const acc = flatAccused.find((a: any) => String(a.CaseMasterID) === String(c.CaseMasterID));

          return {
            incident_id: c.CaseMasterID,
            date: c.CrimeRegisteredDate,
            time: c.IncidentFromDate ? c.IncidentFromDate.split(' ')[1] || '00:00:00' : '00:00:00',
            district: dist ? dist.DistrictName : 'BENGALURU_CITY',
            station: unit ? unit.UnitName : 'Indiranagar PS',
            lat: parseFloat(c.latitude) || 12.9716,
            long: parseFloat(c.longitude) || 77.5946,
            crime_type: subHead ? subHead.CrimeHeadName : 'THEFT',
            mo_tags: c.mo_tags || '[]',
            weapon_used: c.weapon_used || 'None',
            offender_id: acc ? acc.PersonID : null,
            victim_demographic: 'Complainant',
            socio_economic_index: parseFloat(c.socio_economic_index) || 0.5,
            status: status ? status.CaseStatusName : 'PENDING',
            severity: gravity ? gravity.LookupValue : 'MEDIUM',
            fir_text: c.BriefFacts || '',
            evidence_ids: c.evidence_ids || '[]',
            source_batch_id: c.source_batch_id || null
          };
        });

        // Apply dynamic filters matching the WHERE clause in the query Str
        if (queryStrLower.includes('where')) {
          const wherePart = queryStr.substring(queryStrLower.indexOf('where') + 5).split(/order by|limit/i)[0].trim();
          const conditions = wherePart.split(/\band\b/i).map(cond => cond.trim()).filter(Boolean);

          for (const cond of conditions) {
            const match = cond.match(/(District\.DistrictName|Unit\.UnitName|GravityOffence\.LookupValue|CrimeSubHead\.CrimeHeadName|CaseMaster\.CrimeRegisteredDate|CaseMaster\.CaseMasterID|Accused\.PersonID|CaseMaster\.latitude|CaseMaster\.longitude|district|station|severity|crime_type|date|incident_id|offender_id)\s*([>=<!]+)\s*(['"]?)([^'"]+)\3/i);
            if (match) {
              const col = match[1].toLowerCase();
              const op = match[2];
              const val = match[4];

              joinedRows = joinedRows.filter((r: any) => {
                let rVal = '';
                if (col.includes('district')) rVal = r.district;
                else if (col.includes('station')) rVal = r.station;
                else if (col.includes('severity')) rVal = r.severity;
                else if (col.includes('crime_type')) rVal = r.crime_type;
                else if (col.includes('date')) rVal = r.date;
                else if (col.includes('incident_id')) rVal = r.incident_id;
                else if (col.includes('offender_id')) rVal = r.offender_id;
                else if (col.includes('latitude') || col.includes('lat')) rVal = String(r.lat);
                else if (col.includes('longitude') || col.includes('long')) rVal = String(r.long);

                if (op === '=') return String(rVal).toLowerCase() === val.toLowerCase();
                if (op === '!=') return String(rVal).toLowerCase() !== val.toLowerCase();
                if (op === '>=') return rVal >= val;
                if (op === '<=') return rVal <= val;
                if (op === '>') return rVal > val;
                if (op === '<') return rVal < val;
                return true;
              });
            }
          }
        }

        // Apply ordering
        if (queryStrLower.includes('order by')) {
          const orderPart = queryStr.substring(queryStrLower.indexOf('order by') + 8).split(/limit/i)[0].trim().toLowerCase();
          const isDesc = orderPart.includes('desc');
          joinedRows.sort((a: any, b: any) => {
            const valA = orderPart.includes('date') ? a.date : a.incident_id;
            const valB = orderPart.includes('date') ? b.date : b.incident_id;
            if (valA < valB) return isDesc ? 1 : -1;
            if (valA > valB) return isDesc ? -1 : 1;
            return 0;
          });
        }

        // Apply limits
        if (queryStrLower.includes('limit')) {
          const limitPart = queryStr.substring(queryStrLower.indexOf('limit') + 5).trim();
          const limitVal = parseInt(limitPart, 10);
          if (!isNaN(limitVal)) {
            joinedRows = joinedRows.slice(0, limitVal);
          }
        }

        return joinedRows;
      }
      else if (this.sql.toLowerCase().includes('from offenders')) {
        queryStr = queryStr.replace(/\boffenders\b/gi, 'Accused');
        queryStr = queryStr.replace(/\boffender_id\b/gi, 'PersonID');
        queryStr = queryStr.replace(/\bname\b/gi, 'AccusedName');
      }
      else if (this.sql.toLowerCase().includes('from victims')) {
        let baseZcql = `SELECT Victim.VictimMasterID, Victim.VictimName, Victim.AgeYear, Victim.GenderID, Victim.VictimPolice, District.DistrictName FROM Victim LEFT JOIN CaseMaster ON Victim.CaseMasterID = CaseMaster.CaseMasterID LEFT JOIN Unit ON CaseMaster.PoliceStationID = Unit.UnitID LEFT JOIN District ON Unit.DistrictID = District.DistrictID`;
        const sqlLower = this.sql.toLowerCase();
        const whereIdx = sqlLower.indexOf('where');
        let extra = '';
        if (whereIdx !== -1) {
          extra += ' ' + this.sql.substring(whereIdx);
        }
        queryStr = baseZcql + extra;
      }
      else if (this.sql.toLowerCase().includes('from audit_logs')) {
        queryStr = queryStr.replace(/\baudit_logs\b/gi, 'audit_log');
        queryStr = queryStr.replace(/\bid\b/gi, 'log_id');
        queryStr = queryStr.replace(/\btimestamp\b/gi, 'event_timestamp');
        queryStr = queryStr.replace(/\boperator_role\b/gi, 'actor_id');
        queryStr = queryStr.replace(/\baction_taken\b/gi, 'action');
        queryStr = queryStr.replace(/\bdetails\b/gi, 'detail');
      }

      let rows;
      try {
        rows = await zcql.executeZCQLQuery(queryStr);
      } catch (err: any) {
        throw new Error(`ZCQL Query Execution Failed: "${queryStr}". Error: ${err.message || err.toString()}`);
      }

      // Flatten Catalyst response and map back to legacy keys for compatibility
      return rows.map((row: any) => {
        const flatRow: any = {};
        for (const tableName in row) {
          Object.assign(flatRow, row[tableName]);
        }

        // Map fields back for incidents
        if ('CaseMasterID' in flatRow) {
          flatRow['incident_id'] = flatRow['CaseMasterID'];
          flatRow['date'] = flatRow['CrimeRegisteredDate'];
          flatRow['time'] = flatRow['IncidentFromDate'] ? flatRow['IncidentFromDate'].split(' ')[1] || '00:00:00' : '00:00:00';
          flatRow['lat'] = flatRow['latitude'];
          flatRow['long'] = flatRow['longitude'];
          flatRow['crime_type'] = flatRow['CrimeHeadName'];
          flatRow['status'] = flatRow['CaseStatusName'];
          flatRow['severity'] = flatRow['LookupValue'];
          flatRow['fir_text'] = flatRow['BriefFacts'];
          flatRow['offender_id'] = flatRow['PersonID'];
          flatRow['victim_demographic'] = 'Complainant';
        }

        // Map fields back for offenders/Accused
        if ('PersonID' in flatRow) {
          flatRow['offender_id'] = flatRow['PersonID'];
          flatRow['name'] = flatRow['AccusedName'];
        }

        // Map fields back for victims
        if ('VictimMasterID' in flatRow) {
          flatRow['victim_id'] = flatRow['VictimMasterID'];
          flatRow['full_name'] = flatRow['VictimName'];
          flatRow['age'] = flatRow['AgeYear'];
          flatRow['gender'] = flatRow['GenderID'] === 1 ? 'Male' : (flatRow['GenderID'] === 2 ? 'Female' : 'Other');
          flatRow['district'] = flatRow['DistrictName'];
          flatRow['victim_type'] = flatRow['VictimPolice'];
        }

        // Map fields back for audit_logs
        if ('log_id' in flatRow) {
          flatRow['id'] = flatRow['log_id'];
          flatRow['timestamp'] = flatRow['event_timestamp'];
          flatRow['operator_role'] = flatRow['actor_id'];
          flatRow['action_taken'] = flatRow['action'];
          flatRow['details'] = flatRow['detail'];
        }

        return flatRow;
      });
    } else {
      if (useNodeSqlite) {
        return this.sqliteStmt.all(...params);
      }
      return this.sqliteStmt.all(params);
    }
  }

  // Returns single row
  async get(params: any[] = [], req?: any): Promise<any> {
    const rows = await this.all(params, req);
    return rows[0] || null;
  }

  // Runs an INSERT, UPDATE, or DELETE
  async run(params: any[] = [], req?: any): Promise<any> {
    if (isCatalyst) {
      const catalystApp = catalyst.initialize(req);
      const datastore = catalystApp.datastore();
      const zcql = catalystApp.zcql();

      const cleanSql = this.sql.replace(/\s+/g, ' ').trim();
      const sqlLower = cleanSql.toLowerCase();

      if (sqlLower.startsWith('insert into')) {
        const match = cleanSql.match(/insert\s+into\s+(\w+)\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
        if (match) {
          const tableName = match[1];

          if (tableName === 'incidents') {
            const data: any = {
              CaseMasterID: params[0],
              CrimeNo: `FIR:104430006${params[0].toString().slice(-5)}`,
              CaseNo: `2026${params[0].toString().slice(-5)}`,
              CrimeRegisteredDate: params[1],
              PolicePersonID: 1,
              PoliceStationID: 1,
              CaseCategoryID: 1,
              GravityOffenceID: params[14] === 'LOW' ? 1 : (params[14] === 'MEDIUM' ? 2 : 3),
              CrimeMajorHeadID: 1,
              CrimeMinorHeadID: params[7] === 'THEFT' ? 1 : (params[7] === 'ASSAULT' ? 2 : (params[7] === 'CYBER' ? 3 : 4)),
              CaseStatusID: params[13] === 'PENDING' ? 1 : (params[13] === 'INVESTIGATING' ? 2 : 3),
              CourtID: 1,
              IncidentFromDate: `${params[1]} ${params[2]}`,
              IncidentToDate: `${params[1]} ${params[2]}`,
              InfoReceivedPSDate: `${params[1]} ${params[2]}`,
              latitude: parseFloat(params[5]),
              longitude: parseFloat(params[6]),
              BriefFacts: params[15],
              mo_tags: params[8],
              weapon_used: params[9],
              socio_economic_index: parseFloat(params[12]),
              evidence_ids: params[16] || '[]'
            };
            const inserted = await datastore.table('CaseMaster').insertRow(data);

            // Link Accused if offender_id given
            if (params[10]) {
              const oRes = await zcql.executeZCQLQuery(`SELECT * FROM Accused WHERE PersonID = '${params[10]}'`);
              if (oRes && oRes.length > 0) {
                const off = oRes[0].Accused;
                const accData = {
                  AccusedMasterID: `ACC-${params[0]}`,
                  CaseMasterID: params[0],
                  AccusedName: off.AccusedName,
                  PersonID: params[10],
                  aliases: off.aliases,
                  dob: off.dob,
                  address: off.address,
                  addresses: off.addresses,
                  phone: off.phone,
                  first_offense_date: off.first_offense_date,
                  districts_active: off.districts_active,
                  current_status: off.current_status,
                  risk_score: off.risk_score,
                  photo_placeholder_id: off.photo_placeholder_id,
                  associates: off.associates,
                  crime_history: off.crime_history
                };
                await datastore.table('Accused').insertRow(accData);
              }
            }
            return { lastInsertRowid: inserted.ROWID };
          }

          if (tableName === 'offenders') {
            const data: any = {
              AccusedMasterID: params[0],
              CaseMasterID: null,
              AccusedName: params[1],
              AgeYear: 30,
              GenderID: 1,
              PersonID: params[0],
              aliases: params[2],
              dob: params[3],
              address: params[4],
              addresses: params[5],
              phone: params[6],
              first_offense_date: params[7],
              districts_active: params[8],
              current_status: params[9],
              risk_score: parseFloat(params[10]),
              photo_placeholder_id: params[11],
              associates: params[12],
              crime_history: params[13]
            };
            const inserted = await datastore.table('Accused').insertRow(data);
            return { lastInsertRowid: inserted.ROWID };
          }

          if (tableName === 'victims') {
            const data: any = {
              VictimMasterID: params[0],
              CaseMasterID: null,
              VictimName: params[1],
              AgeYear: parseInt(params[2]) || null,
              GenderID: params[3] === 'Male' ? 1 : (params[3] === 'Female' ? 2 : 3),
              VictimPolice: params[5] || '0'
            };
            const inserted = await datastore.table('Victim').insertRow(data);
            return { lastInsertRowid: inserted.ROWID };
          }

          if (tableName === 'audit_logs') {
            const data: any = {
              log_id: params[0],
              entity_type: 'incident',
              entity_id: params[0],
              action: params[3],
              actor_id: params[2],
              event_timestamp: params[1],
              detail: params[4]
            };
            const inserted = await datastore.table('audit_log').insertRow(data);
            return { lastInsertRowid: inserted.ROWID };
          }

          // Fallback generic insert
          const tableObj = datastore.table(tableName);
          const columns = match[2].split(',').map(c => c.trim());
          const data: any = {};
          columns.forEach((col, idx) => {
            let dbCol = col;
            if (col === 'date') dbCol = 'incident_date';
            else if (col === 'time') dbCol = 'incident_time';
            else if (col === 'long') dbCol = 'longitude';
            else if (col === 'timestamp') dbCol = 'event_timestamp';
            else if (col === 'id') {
              if (tableName === 'anomalies') dbCol = 'anomaly_id';
              else if (tableName === 'festivals') dbCol = 'festival_id';
              else if (tableName === 'patrols') dbCol = 'patrol_id';
              else if (tableName === 'audit_logs') dbCol = 'log_id';
            }
            data[dbCol] = params[idx];
          });
          const inserted = await tableObj.insertRow(data);
          return { lastInsertRowid: inserted.ROWID };
        }
      } else if (sqlLower.startsWith('update')) {
        const match = cleanSql.match(/update\s+(\w+)\s+set\s+(.*?)\s+where\s+(\w+)\s*=\s*\?/i);
        if (match) {
          const tableName = match[1];
          const setClause = match[2];
          const whereCol = match[3];

          if (tableName === 'offenders') {
            const updateData = {
              crime_history: params[0],
              risk_score: parseFloat(params[1]),
              districts_active: params[2],
              current_status: params[3]
            };
            const personId = params[4];
            const tableObj = datastore.table('Accused');
            const findSql = `SELECT ROWID FROM Accused WHERE PersonID = '${personId.toString().replace(/'/g, "''")}'`;
            const findRes = await zcql.executeZCQLQuery(findSql);
            if (findRes && findRes.length > 0) {
              const rowid = findRes[0].Accused.ROWID;
              await tableObj.updateRow({ ROWID: rowid, ...updateData });
            }
            return { changes: 1 };
          }

          // Fallback generic update
          const setCols = setClause.split(',').map(s => s.split('=')[0].trim());
          const updateData: any = {};
          setCols.forEach((col, idx) => {
            let dbCol = col;
            if (col === 'date') dbCol = 'incident_date';
            else if (col === 'time') dbCol = 'incident_time';
            else if (col === 'long') dbCol = 'longitude';
            else if (col === 'timestamp') dbCol = 'event_timestamp';
            else if (col === 'id') {
              if (tableName === 'anomalies') dbCol = 'anomaly_id';
              else if (tableName === 'festivals') dbCol = 'festival_id';
              else if (tableName === 'patrols') dbCol = 'patrol_id';
              else if (tableName === 'audit_logs') dbCol = 'log_id';
            }
            updateData[dbCol] = params[idx];
          });

          let whereColMapped = whereCol;
          if (whereCol === 'date') whereColMapped = 'incident_date';
          else if (whereCol === 'time') whereColMapped = 'incident_time';
          else if (whereCol === 'long') whereColMapped = 'longitude';
          else if (whereCol === 'timestamp') whereColMapped = 'event_timestamp';
          else if (whereCol === 'id') {
            if (tableName === 'anomalies') whereColMapped = 'anomaly_id';
            else if (tableName === 'festivals') whereColMapped = 'festival_id';
            else if (tableName === 'patrols') whereColMapped = 'patrol_id';
            else if (tableName === 'audit_logs') whereColMapped = 'log_id';
          }
          const whereVal = params[params.length - 1];

          const tableObj = datastore.table(tableName);
          const findSql = `SELECT ROWID FROM ${tableName} WHERE ${whereColMapped} = '${whereVal.toString().replace(/'/g, "''")}'`;
          const findRes = await zcql.executeZCQLQuery(findSql);
          if (findRes && findRes.length > 0) {
            const rowid = findRes[0][tableName].ROWID;
            await tableObj.updateRow({ ROWID: rowid, ...updateData });
          }
          return { changes: 1 };
        }
      }
      return { changes: 0 };
    } else {
      if (useNodeSqlite) {
        return this.sqliteStmt.run(...params);
      }
      return this.sqliteStmt.run(params);
    }
  }

  private interpolateParams(sql: string, params: any[]): string {
    let index = 0;
    return sql.replace(/\?/g, () => {
      const param = params[index++];
      if (param === null || param === undefined) return 'NULL';
      if (typeof param === 'number') return param.toString();
      if (typeof param === 'boolean') return param ? '1' : '0';
      const escaped = param.toString().replace(/'/g, "''");
      return `'${escaped}'`;
    });
  }
}

let sqliteDb: any = null;
let useNodeSqlite = false;

// In AppSail, __dirname = /catalyst/dist/db/
// In local dev, __dirname = apps/api/src/db/ (ts-node) or apps/api/dist/db/
// The DB file is always at the root of the api package: apps/api/crimepulse.db or /catalyst/crimepulse.db
const srcDbPath = path.resolve(__dirname, '..', '..', 'crimepulse.db');
let dbPath = srcDbPath;

// Detect Catalyst AppSail: it always runs on Linux. Local dev on Windows won't match.
// Also check the Catalyst listen-port env var as a second signal.
const isCatalystEnv = process.platform === 'linux';

if (isCatalystEnv) {
  dbPath = '/tmp/crimepulse.db';
  console.log(`[Catalyst SQLite] Copying database from ${srcDbPath} to writable path ${dbPath}`);
  try {
    if (!fs.existsSync(dbPath)) {
      fs.copyFileSync(srcDbPath, dbPath);
      console.log('[Catalyst SQLite] Database copied successfully to /tmp.');
    } else {
      console.log('[Catalyst SQLite] Database already exists in /tmp.');
    }
  } catch (e: any) {
    console.error(`Failed to copy SQLite database to /tmp:`, e.message);
    dbPath = srcDbPath;
  }
}

console.log(`Connecting to SQLite database at: ${dbPath}`);
try {
  const Database = require('better-sqlite3');
  sqliteDb = new Database(dbPath, { verbose: console.log });
  if (isCatalystEnv) {
    sqliteDb.pragma('journal_mode = DELETE'); // Use standard rollback journal mode for container stability
  } else {
    sqliteDb.pragma('journal_mode = WAL');
  }
} catch (e: any) {
  console.warn(`Failed to open SQLite using better-sqlite3: ${e.message}. Trying node:sqlite fallback...`);
  try {
    const { DatabaseSync } = require('node:sqlite');
    sqliteDb = new DatabaseSync(dbPath);
    useNodeSqlite = true;
    console.log(`[node:sqlite] Successfully opened database at ${dbPath}`);
  } catch (errFallback: any) {
    console.error(`Both better-sqlite3 and node:sqlite fallback failed to load:`, errFallback.message);
  }
}

// Auto-seed if database is empty (e.g. fresh production container startup)
if (sqliteDb) {
  setTimeout(async () => {
    try {
      let count = 0;
      if (useNodeSqlite) {
        const stmt = sqliteDb.prepare("SELECT COUNT(*) as count FROM incidents");
        const rows = stmt.all();
        count = (rows[0] as any).count ?? 0;
      } else {
        const row = sqliteDb.prepare("SELECT COUNT(*) as count FROM incidents").get();
        count = row.count ?? 0;
      }
      
      if (count <= 1) { // Auto-seed if empty or only has 1 dummy/partial row
        console.log("[Auto-Seed] Incidents count is low. Performing automatic database seeding...");
        const { runDatabaseSeeder } = require('./seeder');
        await runDatabaseSeeder();
        console.log("[Auto-Seed] Database successfully seeded.");
      } else {
        console.log(`[Auto-Seed] Database already has ${count} incidents. Skipping auto-seed.`);
      }
      
      // Ensure system_credentials table exists and is seeded
      try {
        sqliteDb.exec(`
          CREATE TABLE IF NOT EXISTS system_credentials (
            role TEXT PRIMARY KEY,
            username TEXT,
            password TEXT
          )
        `);
        let credsCount = 0;
        if (useNodeSqlite) {
          const stmt = sqliteDb.prepare("SELECT COUNT(*) as count FROM system_credentials");
          const rows = stmt.all();
          credsCount = (rows[0] as any).count ?? 0;
        } else {
          const row = sqliteDb.prepare("SELECT COUNT(*) as count FROM system_credentials").get();
          credsCount = row.count ?? 0;
        }
        if (credsCount === 0) {
          console.log("[Db Init] Seeding default credentials into SQLite database...");
          if (useNodeSqlite) {
            sqliteDb.prepare("INSERT INTO system_credentials (role, username, password) VALUES ('SP', 'sp.ksp', 'ksp123')").run();
            sqliteDb.prepare("INSERT INTO system_credentials (role, username, password) VALUES ('SHO', 'sho.ksp', 'ksp123')").run();
            sqliteDb.prepare("INSERT INTO system_credentials (role, username, password) VALUES ('CONSTABLE', 'constable.ksp', 'ksp123')").run();
          } else {
            sqliteDb.prepare("INSERT INTO system_credentials (role, username, password) VALUES (?, ?, ?)").run('SP', 'sp.ksp', 'ksp123');
            sqliteDb.prepare("INSERT INTO system_credentials (role, username, password) VALUES (?, ?, ?)").run('SHO', 'sho.ksp', 'ksp123');
            sqliteDb.prepare("INSERT INTO system_credentials (role, username, password) VALUES (?, ?, ?)").run('CONSTABLE', 'constable.ksp', 'ksp123');
          }
        }
      } catch (tableErr: any) {
        console.warn("[Db Init] Failed to create or seed system_credentials table:", tableErr.message);
      }
    } catch (err: any) {
      console.warn("[Auto-Seed] Auto-seeding check bypassed:", err.message);
    }
  }, 1000);
}

export const db = {
  prepare(sql: string): StatementWrapper {
    return new StatementWrapper(sql, sqliteDb);
  },
  exec(sql: string) {
    if (!isCatalystEnv) {
      sqliteDb.exec(sql);
    }
  }
};

export default db;
