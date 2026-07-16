-- SQLite schema for CrimePulse AI - SCRB Datathon (Aligned with Hackathon ERD)

-- Drop existing views and tables
DROP VIEW IF EXISTS incidents;
DROP VIEW IF EXISTS offenders;
DROP VIEW IF EXISTS victims;
DROP VIEW IF EXISTS audit_logs;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS offenders;
DROP TABLE IF EXISTS victims;
DROP TABLE IF EXISTS audit_logs;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS State;
DROP TABLE IF EXISTS District;
DROP TABLE IF EXISTS UnitType;
DROP TABLE IF EXISTS Unit;
DROP TABLE IF EXISTS Rank;
DROP TABLE IF EXISTS Designation;
DROP TABLE IF EXISTS CaseCategory;
DROP TABLE IF EXISTS GravityOffence;
DROP TABLE IF EXISTS CaseStatusMaster;
DROP TABLE IF EXISTS CasteMaster;
DROP TABLE IF EXISTS ReligionMaster;
DROP TABLE IF EXISTS OccupationMaster;
DROP TABLE IF EXISTS Court;
DROP TABLE IF EXISTS Employee;
DROP TABLE IF EXISTS Act;
DROP TABLE IF EXISTS Section;
DROP TABLE IF EXISTS CrimeHead;
DROP TABLE IF EXISTS CrimeSubHead;
DROP TABLE IF EXISTS CrimeHeadActSection;
DROP TABLE IF EXISTS CaseMaster;
DROP TABLE IF EXISTS ComplainantDetails;
DROP TABLE IF EXISTS ActSectionAssociation;
DROP TABLE IF EXISTS Victim;
DROP TABLE IF EXISTS Accused;
DROP TABLE IF EXISTS ArrestSurrender;
DROP TABLE IF EXISTS ChargesheetDetails;

DROP TABLE IF EXISTS uploaded_firs;
DROP TABLE IF EXISTS anomalies;
DROP TABLE IF EXISTS festivals;
DROP TABLE IF EXISTS patrols;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS station_column_mappings;
DROP TABLE IF EXISTS upload_batches;

-- 1. Reference Lookup Tables
CREATE TABLE IF NOT EXISTS State (
  StateID INTEGER PRIMARY KEY AUTOINCREMENT,
  StateName TEXT NOT NULL,
  NationalityID INTEGER,
  Active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS District (
  DistrictID INTEGER PRIMARY KEY AUTOINCREMENT,
  DistrictName TEXT NOT NULL UNIQUE,
  StateID INTEGER,
  Active INTEGER DEFAULT 1,
  unemployment_rate REAL,
  literacy_rate REAL,
  population_density REAL,
  socio_economic_index REAL,
  FOREIGN KEY (StateID) REFERENCES State(StateID)
);

CREATE TABLE IF NOT EXISTS UnitType (
  UnitTypeID INTEGER PRIMARY KEY AUTOINCREMENT,
  UnitTypeName TEXT NOT NULL,
  CityDistState TEXT,
  Hierarchy INTEGER,
  Active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Unit (
  UnitID INTEGER PRIMARY KEY AUTOINCREMENT,
  UnitName TEXT NOT NULL UNIQUE,
  TypeID INTEGER,
  ParentUnit INTEGER,
  NationalityID INTEGER,
  StateID INTEGER,
  DistrictID INTEGER,
  lat REAL,
  long REAL,
  status TEXT DEFAULT 'active',
  last_upload_at TEXT,
  Active INTEGER DEFAULT 1,
  FOREIGN KEY (TypeID) REFERENCES UnitType(UnitTypeID),
  FOREIGN KEY (StateID) REFERENCES State(StateID),
  FOREIGN KEY (DistrictID) REFERENCES District(DistrictID)
);

CREATE TABLE IF NOT EXISTS Rank (
  RankID INTEGER PRIMARY KEY AUTOINCREMENT,
  RankName TEXT NOT NULL,
  Hierarchy INTEGER,
  Active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Designation (
  DesignationID INTEGER PRIMARY KEY AUTOINCREMENT,
  DesignationName TEXT NOT NULL,
  Active INTEGER DEFAULT 1,
  SortOrder INTEGER
);

CREATE TABLE IF NOT EXISTS CaseCategory (
  CaseCategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
  LookupValue TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS GravityOffence (
  GravityOffenceID INTEGER PRIMARY KEY AUTOINCREMENT,
  LookupValue TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS CaseStatusMaster (
  CaseStatusID INTEGER PRIMARY KEY AUTOINCREMENT,
  CaseStatusName TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS CasteMaster (
  caste_master_id INTEGER PRIMARY KEY AUTOINCREMENT,
  caste_master_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ReligionMaster (
  ReligionID INTEGER PRIMARY KEY AUTOINCREMENT,
  ReligionName TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS OccupationMaster (
  OccupationID INTEGER PRIMARY KEY AUTOINCREMENT,
  OccupationName TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Court (
  CourtID INTEGER PRIMARY KEY AUTOINCREMENT,
  CourtName TEXT NOT NULL,
  DistrictID INTEGER,
  StateID INTEGER,
  Active INTEGER DEFAULT 1,
  FOREIGN KEY (DistrictID) REFERENCES District(DistrictID),
  FOREIGN KEY (StateID) REFERENCES State(StateID)
);

-- 2. Employee & Core Police Records
CREATE TABLE IF NOT EXISTS Employee (
  EmployeeID INTEGER PRIMARY KEY AUTOINCREMENT,
  DistrictID INTEGER,
  UnitID INTEGER,
  RankID INTEGER,
  DesignationID INTEGER,
  KGID TEXT NOT NULL UNIQUE,
  FirstName TEXT NOT NULL,
  EmployeeDOB TEXT,
  GenderID INTEGER,
  BloodGroupID INTEGER,
  PhysicallyChallenged INTEGER DEFAULT 0,
  AppointmentDate TEXT,
  FOREIGN KEY (DistrictID) REFERENCES District(DistrictID),
  FOREIGN KEY (UnitID) REFERENCES Unit(UnitID),
  FOREIGN KEY (RankID) REFERENCES Rank(RankID),
  FOREIGN KEY (DesignationID) REFERENCES Designation(DesignationID)
);

-- 3. Law & Legal Offenses
CREATE TABLE IF NOT EXISTS Act (
  ActCode TEXT PRIMARY KEY,
  ActDescription TEXT,
  ShortName TEXT,
  Active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Section (
  ActCode TEXT NOT NULL,
  SectionCode TEXT NOT NULL,
  SectionDescription TEXT,
  Active INTEGER DEFAULT 1,
  PRIMARY KEY (ActCode, SectionCode),
  FOREIGN KEY (ActCode) REFERENCES Act(ActCode)
);

CREATE TABLE IF NOT EXISTS CrimeHead (
  CrimeHeadID INTEGER PRIMARY KEY AUTOINCREMENT,
  CrimeGroupName TEXT NOT NULL UNIQUE,
  Active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS CrimeSubHead (
  CrimeSubHeadID INTEGER PRIMARY KEY AUTOINCREMENT,
  CrimeHeadID INTEGER,
  CrimeHeadName TEXT NOT NULL,
  SeqID INTEGER,
  FOREIGN KEY (CrimeHeadID) REFERENCES CrimeHead(CrimeHeadID)
);

CREATE TABLE IF NOT EXISTS CrimeHeadActSection (
  CrimeHeadID INTEGER,
  ActCode TEXT,
  SectionCode TEXT,
  PRIMARY KEY (CrimeHeadID, ActCode, SectionCode),
  FOREIGN KEY (CrimeHeadID) REFERENCES CrimeHead(CrimeHeadID),
  FOREIGN KEY (ActCode, SectionCode) REFERENCES Section(ActCode, SectionCode)
);

-- 4. Cases, Complainants, Victims & Accused
CREATE TABLE IF NOT EXISTS CaseMaster (
  CaseMasterID TEXT PRIMARY KEY,
  CrimeNo TEXT NOT NULL UNIQUE,
  CaseNo TEXT NOT NULL,
  CrimeRegisteredDate TEXT NOT NULL,
  PolicePersonID INTEGER,
  PoliceStationID INTEGER,
  CaseCategoryID INTEGER,
  GravityOffenceID INTEGER,
  CrimeMajorHeadID INTEGER,
  CrimeMinorHeadID INTEGER,
  CaseStatusID INTEGER,
  CourtID INTEGER,
  IncidentFromDate TEXT,
  IncidentToDate TEXT,
  InfoReceivedPSDate TEXT,
  latitude REAL,
  longitude REAL,
  BriefFacts TEXT,
  mo_tags TEXT,
  weapon_used TEXT,
  socio_economic_index REAL,
  evidence_ids TEXT,
  source_batch_id TEXT,
  FOREIGN KEY (PolicePersonID) REFERENCES Employee(EmployeeID),
  FOREIGN KEY (PoliceStationID) REFERENCES Unit(UnitID),
  FOREIGN KEY (CaseCategoryID) REFERENCES CaseCategory(CaseCategoryID),
  FOREIGN KEY (GravityOffenceID) REFERENCES GravityOffence(GravityOffenceID),
  FOREIGN KEY (CrimeMajorHeadID) REFERENCES CrimeHead(CrimeHeadID),
  FOREIGN KEY (CrimeMinorHeadID) REFERENCES CrimeSubHead(CrimeSubHeadID),
  FOREIGN KEY (CaseStatusID) REFERENCES CaseStatusMaster(CaseStatusID),
  FOREIGN KEY (CourtID) REFERENCES Court(CourtID)
);

CREATE TABLE IF NOT EXISTS ComplainantDetails (
  ComplainantID INTEGER PRIMARY KEY AUTOINCREMENT,
  CaseMasterID TEXT,
  ComplainantName TEXT NOT NULL,
  AgeYear INTEGER,
  OccupationID INTEGER,
  ReligionID INTEGER,
  CasteID INTEGER,
  GenderID INTEGER,
  FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID),
  FOREIGN KEY (OccupationID) REFERENCES OccupationMaster(OccupationID),
  FOREIGN KEY (ReligionID) REFERENCES ReligionMaster(ReligionID),
  FOREIGN KEY (CasteID) REFERENCES CasteMaster(caste_master_id)
);

CREATE TABLE IF NOT EXISTS ActSectionAssociation (
  CaseMasterID TEXT,
  ActID TEXT,
  SectionID TEXT,
  ActOrderID INTEGER,
  SectionOrderID INTEGER,
  PRIMARY KEY (CaseMasterID, ActID, SectionID),
  FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID),
  FOREIGN KEY (ActID, SectionID) REFERENCES Section(ActCode, SectionCode)
);

CREATE TABLE IF NOT EXISTS Victim (
  VictimMasterID TEXT PRIMARY KEY,
  CaseMasterID TEXT,
  VictimName TEXT NOT NULL,
  AgeYear INTEGER,
  GenderID INTEGER,
  VictimPolice TEXT,
  FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID)
);

CREATE TABLE IF NOT EXISTS Accused (
  AccusedMasterID TEXT PRIMARY KEY,
  CaseMasterID TEXT,
  AccusedName TEXT NOT NULL,
  AgeYear INTEGER,
  GenderID INTEGER,
  PersonID TEXT NOT NULL,
  aliases TEXT,           -- JSON array of strings
  dob TEXT,               -- Date of birth YYYY-MM-DD
  address TEXT,           -- Current address
  addresses TEXT,          -- JSON array of prior addresses [{address, date}]
  phone TEXT,
  first_offense_date TEXT,-- YYYY-MM-DD
  districts_active TEXT,   -- JSON array of strings
  current_status TEXT,    -- e.g. OUT_ON_BAIL, UNDER_TRIAL, ABSCONDING, CONVICTED
  risk_score REAL,        -- Recidivism risk metric 0.0 - 100.0
  photo_placeholder_id TEXT,
  associates TEXT,        -- JSON array of offender_ids (for network graph)
  crime_history TEXT,      -- JSON array of crime objects
  FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID)
);

CREATE TABLE IF NOT EXISTS ArrestSurrender (
  ArrestSurrenderID INTEGER PRIMARY KEY AUTOINCREMENT,
  CaseMasterID TEXT,
  ArrestSurrenderTypeID INTEGER,
  ArrestSurrenderDate TEXT,
  ArrestSurrenderStateId INTEGER,
  ArrestSurrenderDistrictId INTEGER,
  PoliceStationID INTEGER,
  IOID INTEGER,
  CourtID INTEGER,
  AccusedMasterID TEXT,
  IsAccused INTEGER,
  IsComplainantAccused INTEGER,
  FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID),
  FOREIGN KEY (ArrestSurrenderStateId) REFERENCES State(StateID),
  FOREIGN KEY (ArrestSurrenderDistrictId) REFERENCES District(DistrictID),
  FOREIGN KEY (PoliceStationID) REFERENCES Unit(UnitID),
  FOREIGN KEY (IOID) REFERENCES Employee(EmployeeID),
  FOREIGN KEY (CourtID) REFERENCES Court(CourtID),
  FOREIGN KEY (AccusedMasterID) REFERENCES Accused(AccusedMasterID)
);

CREATE TABLE IF NOT EXISTS ChargesheetDetails (
  CSID INTEGER PRIMARY KEY AUTOINCREMENT,
  CaseMasterID TEXT,
  csdate TEXT,
  cstype TEXT,
  PolicePersonID INTEGER,
  FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID),
  FOREIGN KEY (PolicePersonID) REFERENCES Employee(EmployeeID)
);

-- 5. Platform Ingestion & Utility Tables
CREATE TABLE IF NOT EXISTS uploaded_firs (
  upload_id TEXT PRIMARY KEY,
  raw_file_ref TEXT NOT NULL,
  ocr_text TEXT NOT NULL,
  extracted_fields_json TEXT NOT NULL,
  field_confidence_json TEXT NOT NULL,
  linked_incident_id TEXT,
  linked_offender_id TEXT,
  uploaded_at TEXT NOT NULL,
  uploaded_by_role TEXT NOT NULL,
  FOREIGN KEY (linked_incident_id) REFERENCES CaseMaster(CaseMasterID)
);

CREATE TABLE IF NOT EXISTS anomalies (
  id TEXT PRIMARY KEY,
  district TEXT NOT NULL,
  station TEXT NOT NULL,
  metric TEXT NOT NULL,
  baseline REAL NOT NULL,
  current_value REAL NOT NULL,
  deviation_score REAL NOT NULL,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS festivals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  district TEXT NOT NULL,
  crowd_density TEXT NOT NULL,
  risk_multiplier REAL NOT NULL,
  reallocation_required INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS patrols (
  id TEXT PRIMARY KEY,
  patrol_unit TEXT NOT NULL,
  district TEXT NOT NULL,
  station TEXT NOT NULL,
  assigned_officers TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  log_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  event_timestamp TEXT NOT NULL,
  detail TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS upload_batches (
  batch_id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  file_name TEXT NOT NULL,
  stratus_file_id TEXT NOT NULL,
  format_detected TEXT,
  records_parsed INTEGER DEFAULT 0,
  records_flagged INTEGER DEFAULT 0,
  status TEXT,
  FOREIGN KEY (station_id) REFERENCES Unit(UnitName)
);

CREATE TABLE IF NOT EXISTS station_column_mappings (
  station_id TEXT PRIMARY KEY,
  mapping_json TEXT NOT NULL,
  confirmed_by TEXT,
  confirmed_at TEXT,
  FOREIGN KEY (station_id) REFERENCES Unit(UnitName)
);


-- ─── COMPATIBILITY VIEWS ───────────────────────────────────────────────────

-- incidents view maps columns from CaseMaster back to the legacy schema
CREATE VIEW IF NOT EXISTS incidents AS
SELECT
  cm.CaseMasterID AS incident_id,
  cm.CrimeRegisteredDate AS date,
  strftime('%H:%M:%S', cm.IncidentFromDate) AS time,
  d.DistrictName AS district,
  u.UnitName AS station,
  cm.latitude AS lat,
  cm.longitude AS long,
  csh.CrimeHeadName AS crime_type,
  cm.mo_tags AS mo_tags,
  cm.weapon_used AS weapon_used,
  acc.PersonID AS offender_id,
  (SELECT group_concat(v.VictimName, ', ') FROM Victim v WHERE v.CaseMasterID = cm.CaseMasterID) AS victim_demographic,
  cm.socio_economic_index AS socio_economic_index,
  csm.CaseStatusName AS status,
  go.LookupValue AS severity,
  cm.BriefFacts AS fir_text,
  cm.evidence_ids AS evidence_ids,
  cm.source_batch_id AS source_batch_id
FROM CaseMaster cm
LEFT JOIN Unit u ON cm.PoliceStationID = u.UnitID
LEFT JOIN District d ON u.DistrictID = d.DistrictID
LEFT JOIN CrimeSubHead csh ON cm.CrimeMinorHeadID = csh.CrimeSubHeadID
LEFT JOIN CaseStatusMaster csm ON cm.CaseStatusID = csm.CaseStatusID
LEFT JOIN GravityOffence go ON cm.GravityOffenceID = go.GravityOffenceID
LEFT JOIN Accused acc ON cm.CaseMasterID = acc.CaseMasterID;

-- offenders view maps columns from Accused back to legacy schema
CREATE VIEW IF NOT EXISTS offenders AS
SELECT
  a.PersonID AS offender_id,
  a.AccusedName AS name,
  a.aliases AS aliases,
  a.dob AS dob,
  a.address AS address,
  a.addresses AS addresses,
  a.phone AS phone,
  a.first_offense_date AS first_offense_date,
  a.districts_active AS districts_active,
  a.current_status AS current_status,
  a.risk_score AS risk_score,
  a.photo_placeholder_id AS photo_placeholder_id,
  a.associates AS associates,
  a.crime_history AS crime_history
FROM Accused a;

-- victims view maps columns from Victim back to legacy schema
CREATE VIEW IF NOT EXISTS victims AS
SELECT
  v.VictimMasterID AS victim_id,
  v.VictimName AS full_name,
  v.AgeYear AS age,
  CASE v.GenderID WHEN 1 THEN 'Male' WHEN 2 THEN 'Female' ELSE 'Other' END AS gender,
  d.DistrictName AS district,
  v.VictimPolice AS victim_type
FROM Victim v
LEFT JOIN CaseMaster cm ON v.CaseMasterID = cm.CaseMasterID
LEFT JOIN Unit u ON cm.PoliceStationID = u.UnitID
LEFT JOIN District d ON u.DistrictID = d.DistrictID;

-- audit_logs view maps columns from audit_log back to legacy schema
CREATE VIEW IF NOT EXISTS audit_logs AS
SELECT
  log_id AS id,
  event_timestamp AS timestamp,
  actor_id AS operator_role,
  action AS action_taken,
  detail AS details
FROM audit_log;


-- ─── INSTEAD OF TRIGGERS FOR WRITES ────────────────────────────────────────

-- Trigger to intercept INSERTs on the incidents view
CREATE TRIGGER IF NOT EXISTS incidents_insert_trigger
INSTEAD OF INSERT ON incidents
BEGIN
  -- Insert into CaseMaster
  INSERT OR REPLACE INTO CaseMaster (
    CaseMasterID, CrimeNo, CaseNo, CrimeRegisteredDate, PoliceStationID, 
    CaseCategoryID, GravityOffenceID, CrimeMajorHeadID, CrimeMinorHeadID, CaseStatusID,
    IncidentFromDate, latitude, longitude, BriefFacts, mo_tags, weapon_used, 
    socio_economic_index, evidence_ids, source_batch_id
  ) VALUES (
    NEW.incident_id,
    'FIR: ' || CAST(strftime('%d%m%Y%H%M%S', 'now') AS TEXT) || '-' || NEW.incident_id,
    strftime('%Y', NEW.date) || '-' || substr(NEW.incident_id, -5),
    NEW.date,
    COALESCE((SELECT UnitID FROM Unit WHERE UnitName = NEW.station LIMIT 1), 1),
    COALESCE((SELECT CaseCategoryID FROM CaseCategory WHERE LookupValue = 'FIR' LIMIT 1), 1),
    COALESCE((SELECT GravityOffenceID FROM GravityOffence WHERE LookupValue = NEW.severity LIMIT 1), 1),
    1, -- CrimeMajorHead (general)
    COALESCE((SELECT CrimeSubHeadID FROM CrimeSubHead WHERE CrimeHeadName = NEW.crime_type LIMIT 1), 1),
    COALESCE((SELECT CaseStatusID FROM CaseStatusMaster WHERE CaseStatusName = NEW.status LIMIT 1), 1),
    NEW.date || ' ' || NEW.time,
    NEW.lat,
    NEW.long,
    NEW.fir_text,
    NEW.mo_tags,
    NEW.weapon_used,
    NEW.socio_economic_index,
    NEW.evidence_ids,
    NEW.source_batch_id
  );

  -- Associate Accused if offender_id is given
  INSERT OR REPLACE INTO Accused (
    AccusedMasterID, CaseMasterID, AccusedName, PersonID, aliases, dob, address, addresses, phone, first_offense_date, districts_active, current_status, risk_score, photo_placeholder_id, associates, crime_history
  )
  SELECT
    'ACC-' || NEW.incident_id,
    NEW.incident_id,
    o.name,
    NEW.offender_id,
    o.aliases,
    o.dob,
    o.address,
    o.addresses,
    o.phone,
    o.first_offense_date,
    o.districts_active,
    o.current_status,
    o.risk_score,
    o.photo_placeholder_id,
    o.associates,
    o.crime_history
  FROM offenders o
  WHERE o.offender_id = NEW.offender_id;
END;

-- Trigger to intercept INSERTs on offenders view
CREATE TRIGGER IF NOT EXISTS offenders_insert_trigger
INSTEAD OF INSERT ON offenders
BEGIN
  INSERT OR REPLACE INTO Accused (
    AccusedMasterID, CaseMasterID, AccusedName, PersonID, aliases, dob, address, addresses, phone, first_offense_date, districts_active, current_status, risk_score, photo_placeholder_id, associates, crime_history
  ) VALUES (
    NEW.offender_id,
    NULL,
    NEW.name,
    NEW.offender_id,
    NEW.aliases,
    NEW.dob,
    NEW.address,
    NEW.addresses,
    NEW.phone,
    NEW.first_offense_date,
    NEW.districts_active,
    NEW.current_status,
    NEW.risk_score,
    NEW.photo_placeholder_id,
    NEW.associates,
    NEW.crime_history
  );
END;

-- Trigger to intercept UPDATEs on offenders view
CREATE TRIGGER IF NOT EXISTS offenders_update_trigger
INSTEAD OF UPDATE ON offenders
BEGIN
  UPDATE Accused SET
    crime_history = NEW.crime_history,
    risk_score = NEW.risk_score,
    districts_active = NEW.districts_active,
    current_status = NEW.current_status
  WHERE PersonID = OLD.offender_id;
END;

-- Trigger to intercept INSERTs on victims view
CREATE TRIGGER IF NOT EXISTS victims_insert_trigger
INSTEAD OF INSERT ON victims
BEGIN
  INSERT OR REPLACE INTO Victim (
    VictimMasterID, CaseMasterID, VictimName, AgeYear, GenderID, VictimPolice
  ) VALUES (
    NEW.victim_id,
    NULL,
    NEW.full_name,
    NEW.age,
    CASE NEW.gender WHEN 'Male' THEN 1 WHEN 'Female' THEN 2 ELSE 3 END,
    NEW.victim_type
  );
END;

-- Trigger to intercept INSERTs on audit_logs view
CREATE TRIGGER IF NOT EXISTS audit_logs_insert_trigger
INSTEAD OF INSERT ON audit_logs
BEGIN
  INSERT OR REPLACE INTO audit_log (
    log_id, entity_type, entity_id, action, actor_id, event_timestamp, detail
  ) VALUES (
    NEW.id,
    'incident',
    NEW.id,
    NEW.action_taken,
    NEW.operator_role,
    NEW.timestamp,
    NEW.details
  );
END;
