import db from './connection';

export const offendersSeed = [
  {
    offender_id: "OFF-001",
    name: "Ramesh Kumar",
    aliases: JSON.stringify(["Ramu", "Kulla Ramu", "Gunda Ramesh"]),
    dob: "1992-04-12",
    address: "Koramangala 3rd Block, Bengaluru, Karnataka",
    addresses: JSON.stringify([
      { address: "Indiranagar 5th Cross, Bengaluru", date: "2018-05-14" },
      { address: "Koramangala 3rd Block, Bengaluru, Karnataka", date: "2023-01-10" }
    ]),
    phone: "+91 98451 23456",
    first_offense_date: "2018-05-14",
    districts_active: JSON.stringify(["BENGALURU_CITY", "MYSURU"]),
    current_status: "OUT_ON_BAIL",
    risk_score: 85.0,
    photo_placeholder_id: "OFF-001",
    associates: JSON.stringify(["OFF-002", "OFF-005"]),
    crime_history: JSON.stringify([
      { date: "2018-05-14", ipc_section: "IPC 379", bns_section: "BNS 303", crime_type: "THEFT", custody_duration: "6 Months", status: "CONVICTED", district: "BENGALURU_CITY", station: "Indiranagar PS", mo_note: "Pickpocketing near transit center" },
      { date: "2021-08-11", ipc_section: "IPC 380", bns_section: "BNS 305", crime_type: "THEFT", custody_duration: "1 Year", status: "CONVICTED", district: "BENGALURU_CITY", station: "Indiranagar PS", mo_note: "House burglary at night, broke lock" },
      { date: "2026-06-03", ipc_section: "IPC 380", bns_section: "BNS 305", crime_type: "THEFT", custody_duration: "Pending", status: "UNDER_TRIAL", district: "BENGALURU_CITY", station: "Indiranagar PS", mo_note: "Ground floor kitchen grille cut with saw" }
    ])
  },
  {
    offender_id: "OFF-002",
    name: "Suresh Naik",
    aliases: JSON.stringify(["Naika", "Suri", "Mico Suresh"]),
    dob: "1995-09-20",
    address: "Lashkar Mohalla, Mysuru, Karnataka",
    addresses: JSON.stringify([
      { address: "Lashkar Mohalla, Mysuru, Karnataka", date: "2020-02-10" }
    ]),
    phone: "+91 99002 98765",
    first_offense_date: "2020-02-10",
    districts_active: JSON.stringify(["MYSURU", "MANGALURU"]),
    current_status: "UNDER_TRIAL",
    risk_score: 72.5,
    photo_placeholder_id: "OFF-002",
    associates: JSON.stringify(["OFF-001", "OFF-005"]),
    crime_history: JSON.stringify([
      { date: "2020-02-10", ipc_section: "IPC 379", bns_section: "BNS 303", crime_type: "THEFT", custody_duration: "3 Months", status: "CONVICTED", district: "MYSURU", station: "Lashkar PS", mo_note: "Two wheeler handle lock break in parking" },
      { date: "2026-06-09", ipc_section: "IPC 380", bns_section: "BNS 305", crime_type: "THEFT", custody_duration: "Pending", status: "UNDER_TRIAL", district: "BENGALURU_CITY", station: "Whitefield PS", mo_note: "Ground floor window steel grille cut with hacksaw" }
    ])
  },
  {
    offender_id: "OFF-003",
    name: "Anjali Gowda",
    aliases: JSON.stringify(["Anju", "Techie Anjali"]),
    dob: "1998-01-15",
    address: "Malleshwaram 8th Cross, Bengaluru, Karnataka",
    addresses: JSON.stringify([
      { address: "Malleshwaram 8th Cross, Bengaluru, Karnataka", date: "2021-08-30" }
    ]),
    phone: "+91 97412 55432",
    first_offense_date: "2021-08-30",
    districts_active: JSON.stringify(["BENGALURU_CITY"]),
    current_status: "OUT_ON_BAIL",
    risk_score: 65.0,
    photo_placeholder_id: "OFF-003",
    associates: JSON.stringify([]),
    crime_history: JSON.stringify([
      { date: "2021-08-30", ipc_section: "IPC 420", bns_section: "BNS 318", crime_type: "FRAUD", custody_duration: "Pending", status: "UNDER_TRIAL", district: "BENGALURU_CITY", station: "Malleshwaram PS", mo_note: "Techie support scam, remote access OTP swipe" }
    ])
  },
  {
    offender_id: "OFF-004",
    name: "Manjunath S.",
    aliases: JSON.stringify(["Manja", "Bullet Manja"]),
    dob: "1984-11-05",
    address: "Dharwad Suburban, Dharwad, Karnataka",
    addresses: JSON.stringify([
      { address: "Dharwad Suburban, Dharwad, Karnataka", date: "2012-04-03" }
    ]),
    phone: "+91 96112 44331",
    first_offense_date: "2012-04-03",
    districts_active: JSON.stringify(["HUBBALLI_DHARWAD", "BELAGAVI"]),
    current_status: "ABSCONDING",
    risk_score: 91.0,
    photo_placeholder_id: "OFF-004",
    associates: JSON.stringify(["OFF-005"]),
    crime_history: JSON.stringify([
      { date: "2012-04-03", ipc_section: "IPC 324", bns_section: "BNS 118", crime_type: "ASSAULT", custody_duration: "2 Years", status: "CONVICTED", district: "HUBBALLI_DHARWAD", station: "Dharwad Suburban PS", mo_note: "Brawl outside local bus stop using weapons" },
      { date: "2018-09-12", ipc_section: "IPC 302", bns_section: "BNS 103", crime_type: "ASSAULT", custody_duration: "Pending", status: "ABSCONDING", district: "BELAGAVI", station: "Camp PS", mo_note: "Assault on victim over property dispute, suspect fled" }
    ])
  },
  {
    offender_id: "OFF-005",
    name: "Prakash Shetty",
    aliases: JSON.stringify(["Shettru", "Paki"]),
    dob: "1990-07-22",
    address: "Pandeshwar, Mangaluru, Karnataka",
    addresses: JSON.stringify([
      { address: "Pandeshwar, Mangaluru, Karnataka", date: "2015-11-12" }
    ]),
    phone: "+91 88843 99001",
    first_offense_date: "2015-11-12",
    districts_active: JSON.stringify(["MANGALURU", "MYSURU"]),
    current_status: "CONVICTED",
    risk_score: 55.4,
    photo_placeholder_id: "OFF-005",
    associates: JSON.stringify(["OFF-001", "OFF-002", "OFF-004"]),
    crime_history: JSON.stringify([
      { date: "2015-11-12", ipc_section: "IPC 379", bns_section: "BNS 303", crime_type: "THEFT", custody_duration: "1 Year", status: "CONVICTED", district: "MANGALURU", station: "Pandeshwar PS", mo_note: "Gold chain snatching by bike-borne suspects" }
    ])
  }
];

export const uploadedFirsSeed = [
  {
    upload_id: "UPL-001",
    raw_file_ref: "FIR_2026_00341_Indiranagar.pdf",
    ocr_text: "FIRST INFORMATION REPORT (ಎಫ್.ಐ.ಆರ್). District: Bengaluru City. PS: Indiranagar. FIR No: 00341/2026. Date: 2026-06-03. Time: 01:40 AM. Act: IPC Section 457/380. Burglary. Complainant: K. Murthy. Accused: R. Kumar @ Ramu. Facts: Complainant reports ground floor residence back window iron grille was cut with hacksaw blade. Lock broken. Golden jewelry worth 5 Lakhs stolen while house was empty.",
    extracted_fields_json: JSON.stringify({
      fir_no: "00341/2026",
      date: "2026-06-03",
      time: "01:40 AM",
      district: "BENGALURU_CITY",
      station: "Indiranagar PS",
      crime_type: "THEFT",
      accused_name: "Ramesh Kumar",
      alias: "Ramu",
      complainant_name: "K. Murthy",
      mo_tags: ["grille_cut", "night", "empty_house", "burglary"],
      property_stolen: "Gold jewelry"
    }),
    field_confidence_json: JSON.stringify({ fir_no: "high", accused_name: "high", mo_tags: "high" }),
    linked_incident_id: "INC-00001",
    linked_offender_id: "OFF-001",
    uploaded_at: new Date().toISOString(),
    uploaded_by_role: "SHO"
  },
  {
    upload_id: "UPL-002",
    raw_file_ref: "FIR_2026_00389_Whitefield.pdf",
    ocr_text: "FIRST INFORMATION REPORT. District: Bengaluru City. PS: Whitefield. FIR No: 00389/2026. Date: 2026-06-09. Time: 02:15 AM. Crime: Burglary. Sections: IPC 457. Complainant: V. Raghavan. Accused: S. Naik @ Suresh. Facts: Complainant states thieves entered ground floor by cutting kitchen window steel grille with saw. Golden chain and cash worth 3 Lakhs stolen. Elderly couple was sleeping in nearby room.",
    extracted_fields_json: JSON.stringify({
      fir_no: "00389/2026",
      date: "2026-06-09",
      time: "02:15 AM",
      district: "BENGALURU_CITY",
      station: "Whitefield PS",
      crime_type: "THEFT",
      accused_name: "Suresh Naik",
      alias: "Suri",
      complainant_name: "V. Raghavan",
      mo_tags: ["grille_cut", "night", "asleep_residents", "burglary"],
      property_stolen: "Gold chain, Cash"
    }),
    field_confidence_json: JSON.stringify({ fir_no: "high", accused_name: "medium", mo_tags: "high" }),
    linked_incident_id: "INC-00002",
    linked_offender_id: "OFF-002",
    uploaded_at: new Date().toISOString(),
    uploaded_by_role: "SHO"
  },
  {
    upload_id: "UPL-003",
    raw_file_ref: "FIR_2026_00551_Devaraja.pdf",
    ocr_text: "FIRST INFORMATION REPORT. District: Mysuru. PS: Devaraja. FIR No: 00551/2026. Date: 2026-06-15. Time: 06:30 AM. Crime: Chain Snatching. Complainant: Sunitha M. Accused: Unknown rider. Facts: Complainant walking in morning near park. Two youth on black Pulsar motorcycle snatched gold nuptial chain (Mangalsutra) and fled towards Lashkar PS.",
    extracted_fields_json: JSON.stringify({
      fir_no: "00551/2026",
      date: "2026-06-15",
      time: "06:30 AM",
      district: "MYSURU",
      station: "Devaraja PS",
      crime_type: "THEFT",
      accused_name: "Suresh Naik",
      alias: "Naika",
      complainant_name: "Sunitha M.",
      mo_tags: ["chain_snatch", "pulsar_bike", "morning_walk"],
      property_stolen: "Gold Mangalsutra"
    }),
    field_confidence_json: JSON.stringify({ fir_no: "high", accused_name: "medium", mo_tags: "high" }),
    linked_incident_id: "INC-00003",
    linked_offender_id: "OFF-002",
    uploaded_at: new Date().toISOString(),
    uploaded_by_role: "SHO"
  }
];

export const anomaliesSeed = [
  { id: "ANM-001", district: "BENGALURU_CITY", station: "Koramangala PS", metric: "Cyber Crime Spike", baseline: 12.4, current_value: 28.5, deviation_score: 2.3, timestamp: new Date().toISOString(), status: "UNACKNOWLEDGED" },
  { id: "ANM-002", district: "BENGALURU_CITY", station: "Vidhana Soudha PS", metric: "Protest Gathering Deviation", baseline: 1.2, current_value: 5.0, deviation_score: 4.1, timestamp: new Date().toISOString(), status: "UNACKNOWLEDGED" },
  { id: "ANM-003", district: "MYSURU", station: "Devaraja PS", metric: "Theft Incident Density", baseline: 8.0, current_value: 17.5, deviation_score: 2.18, timestamp: new Date().toISOString(), status: "UNACKNOWLEDGED" },
  { id: "ANM-004", district: "MANGALURU", station: "Ullal PS", metric: "Assault Frequency Rise", baseline: 4.1, current_value: 9.2, deviation_score: 2.24, timestamp: new Date().toISOString(), status: "ACKNOWLEDGED" },
  { id: "ANM-005", district: "HUBBALLI_DHARWAD", station: "Vidyanagar PS", metric: "Drug seizure count", baseline: 2.0, current_value: 6.5, deviation_score: 3.25, timestamp: new Date().toISOString(), status: "UNACKNOWLEDGED" }
];

export const festivalsSeed = [
  { id: "FES-001", name: "Ganesh Chaturthi", date: "2026-09-05", district: "BENGALURU_CITY", crowd_density: "HIGH", risk_multiplier: 1.85, reallocation_required: 1 },
  { id: "FES-002", name: "Mysuru Dasara Procession", date: "2026-10-12", district: "MYSURU", crowd_density: "HIGH", risk_multiplier: 2.4, reallocation_required: 1 },
  { id: "FES-003", name: "Mangaluru Dasara", date: "2026-10-14", district: "MANGALURU", crowd_density: "MEDIUM", risk_multiplier: 1.5, reallocation_required: 0 },
  { id: "FES-004", name: "Kanakadasa Jayanthi", date: "2026-11-20", district: "HUBBALLI_DHARWAD", crowd_density: "LOW", risk_multiplier: 1.15, reallocation_required: 0 },
  { id: "FES-005", name: "Belagavi Rajyotsava", date: "2026-11-01", district: "BELAGAVI", crowd_density: "MEDIUM", risk_multiplier: 1.45, reallocation_required: 1 }
];

export const patrolsSeed = [
  { id: "PAT-001", patrol_unit: "Bengaluru Hawk-1", district: "BENGALURU_CITY", station: "Koramangala PS", assigned_officers: "Constable Gowda, Constable Patil", latitude: 12.9352, longitude: 77.6244, status: "PATROLLING" },
  { id: "PAT-002", patrol_unit: "Bengaluru Hawk-2", district: "BENGALURU_CITY", station: "Whitefield PS", assigned_officers: "Constable Shivakumar, Constable Naik", latitude: 12.9698, longitude: 77.7499, status: "IDLE" },
  { id: "PAT-003", patrol_unit: "Mysuru Eagle-1", district: "MYSURU", station: "Devaraja PS", assigned_officers: "Constable Swamy, Constable Raju", latitude: 12.3080, longitude: 76.6500, status: "PATROLLING" },
  { id: "PAT-004", patrol_unit: "Mysuru Eagle-2", district: "MYSURU", station: "Lashkar PS", assigned_officers: "Constable Basappa, Constable Siddappa", latitude: 12.3160, longitude: 76.6550, status: "DISPATCHED" },
  { id: "PAT-005", patrol_unit: "Hubballi Cheetah-1", district: "HUBBALLI_DHARWAD", station: "Hubballi Town PS", assigned_officers: "Constable Joshi, Constable Pujar", latitude: 15.3520, longitude: 75.1380, status: "PATROLLING" },
  { id: "PAT-006", patrol_unit: "Mangaluru Dolphin-1", district: "MANGALURU", station: "Pandeshwar PS", assigned_officers: "Constable Fernandes, Constable D'Souza", latitude: 12.8600, longitude: 74.8420, status: "IDLE" },
  { id: "PAT-007", patrol_unit: "Belagavi Panther-1", district: "BELAGAVI", station: "Khade Bazar PS", assigned_officers: "Constable Patil, Constable Kadam", latitude: 15.8520, longitude: 74.5080, status: "PATROLLING" }
];

export const incidentsSeed = [
  {
    incident_id: "INC-00001",
    date: "2026-06-03",
    time: "01:40:00",
    district: "BENGALURU_CITY",
    station: "Indiranagar PS",
    lat: 12.9784,
    long: 77.6408,
    crime_type: "THEFT",
    mo_tags: JSON.stringify(["grille_cut", "night", "empty_house", "burglary"]),
    weapon_used: "Hacksaw/Tools",
    offender_id: "OFF-001",
    victim_demographic: "K. Murthy",
    socio_economic_index: 0.65,
    status: "PENDING",
    severity: "HIGH",
    fir_text: "First Information Report: Burglary reported in Koramangala. Ground floor kitchen window iron grille was sawed off. Gold jewelry stolen.",
    evidence_ids: JSON.stringify(["EVID-001", "EVID-002"])
  },
  {
    incident_id: "INC-00002",
    date: "2026-06-09",
    time: "02:15:00",
    district: "BENGALURU_CITY",
    station: "Whitefield PS",
    lat: 12.9698,
    long: 77.7499,
    crime_type: "THEFT",
    mo_tags: JSON.stringify(["grille_cut", "night", "burglary"]),
    weapon_used: "Hacksaw/Tools",
    offender_id: "OFF-002",
    victim_demographic: "V. Raghavan",
    socio_economic_index: 0.72,
    status: "INVESTIGATING",
    severity: "HIGH",
    fir_text: "First Information Report: Burglary reported in Whitefield. Back grill cut with hacksaw. Jewelry stolen.",
    evidence_ids: JSON.stringify(["EVID-003"])
  },
  {
    incident_id: "INC-00003",
    date: "2026-06-15",
    time: "06:30:00",
    district: "MYSURU",
    station: "Devaraja PS",
    lat: 12.3080,
    long: 76.6500,
    crime_type: "THEFT",
    mo_tags: JSON.stringify(["chain_snatch", "pulsar_bike", "morning_walk"]),
    weapon_used: "None",
    offender_id: "OFF-002",
    victim_demographic: "Sunitha M.",
    socio_economic_index: 0.55,
    status: "RESOLVED",
    severity: "MEDIUM",
    fir_text: "First Information Report: Nuptial gold chain snatched from morning walker near park by two youth on motorcycle.",
    evidence_ids: JSON.stringify([])
  }
];

export async function runDatabaseSeeder(req?: any): Promise<void> {
  console.log("Seeder execution started...");

  // 1. Seed State
  try {
    console.log("Seeding States...");
    await db.prepare("INSERT OR REPLACE INTO State (StateID, StateName, NationalityID, Active) VALUES (?, ?, ?, ?)").run([1, "Karnataka", 1, 1], req);
  } catch (err: any) {
    console.error("Failed to seed State:", err.message);
  }

  // 2. Seed Districts
  const districtsData = [
    [1, "BENGALURU_CITY", 1, 1, 4.5, 88.7, 4378.0, 0.78],
    [2, "MYSURU", 1, 1, 6.2, 72.8, 450.0, 0.62],
    [3, "MANGALURU", 1, 1, 5.0, 84.1, 320.0, 0.70],
    [4, "HUBBALLI_DHARWAD", 1, 1, 7.1, 75.3, 380.0, 0.58],
    [5, "BELAGAVI", 1, 1, 8.0, 68.2, 290.0, 0.52]
  ];
  try {
    console.log("Seeding Districts...");
    for (const d of districtsData) {
      await db.prepare("INSERT OR REPLACE INTO District (DistrictID, DistrictName, StateID, Active, unemployment_rate, literacy_rate, population_density, socio_economic_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(d, req);
    }
  } catch (err: any) {
    console.error("Failed to seed Districts:", err.message);
  }

  // 3. Seed UnitTypes
  try {
    console.log("Seeding UnitTypes...");
    await db.prepare("INSERT OR REPLACE INTO UnitType (UnitTypeID, UnitTypeName, CityDistState, Hierarchy, Active) VALUES (?, ?, ?, ?, ?)").run([1, "Police Station", "District", 1, 1], req);
  } catch (err: any) {
    console.error("Failed to seed UnitType:", err.message);
  }

  // 4. Seed Units (Stations)
  const unitsData = [
    [1, "Indiranagar PS", 1, null, 1, 1, 1, 12.9784, 77.6408, "active", 1],
    [2, "Whitefield PS", 1, null, 1, 1, 1, 12.9698, 77.7499, "active", 1],
    [3, "Devaraja PS", 1, null, 1, 1, 2, 12.3080, 76.6500, "active", 1],
    [4, "Lashkar PS", 1, null, 1, 1, 2, 12.3160, 76.6550, "active", 1],
    [5, "Hubballi Town PS", 1, null, 1, 1, 4, 15.3520, 75.1380, "active", 1],
    [6, "Pandeshwar PS", 1, null, 1, 1, 3, 12.8600, 74.8420, "active", 1],
    [7, "Khade Bazar PS", 1, null, 1, 1, 5, 15.8520, 74.5080, "active", 1],
    [8, "Camp PS", 1, null, 1, 1, 5, 15.8500, 74.5100, "active", 1],
    [9, "Koramangala PS", 1, null, 1, 1, 1, 12.9352, 77.6244, "active", 1],
    [10, "Vidhana Soudha PS", 1, null, 1, 1, 1, 12.9796, 77.5906, "active", 1],
    [11, "Vidyanagar PS", 1, null, 1, 1, 4, 15.3647, 75.1240, "active", 1],
    [12, "Ullal PS", 1, null, 1, 1, 3, 12.8000, 74.8500, "active", 1],
    [13, "Malleshwaram PS", 1, null, 1, 1, 1, 12.9900, 77.5700, "active", 1]
  ];
  try {
    console.log("Seeding Units...");
    for (const u of unitsData) {
      await db.prepare("INSERT OR REPLACE INTO Unit (UnitID, UnitName, TypeID, ParentUnit, NationalityID, StateID, DistrictID, lat, long, status, Active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(u, req);
    }
  } catch (err: any) {
    console.error("Failed to seed Units:", err.message);
  }

  // 5. Seed Ranks & Designations
  try {
    console.log("Seeding Ranks...");
    await db.prepare("INSERT OR REPLACE INTO Rank (RankID, RankName, Hierarchy, Active) VALUES (?, ?, ?, ?)").run([1, "Constable", 5, 1], req);
    await db.prepare("INSERT OR REPLACE INTO Rank (RankID, RankName, Hierarchy, Active) VALUES (?, ?, ?, ?)").run([2, "Inspector", 3, 1], req);
    await db.prepare("INSERT OR REPLACE INTO Rank (RankID, RankName, Hierarchy, Active) VALUES (?, ?, ?, ?)").run([3, "DSP", 1, 1], req);

    console.log("Seeding Designations...");
    await db.prepare("INSERT OR REPLACE INTO Designation (DesignationID, DesignationName, Active, SortOrder) VALUES (?, ?, ?, ?)").run([1, "Investigating Officer", 1, 2], req);
    await db.prepare("INSERT OR REPLACE INTO Designation (DesignationID, DesignationName, Active, SortOrder) VALUES (?, ?, ?, ?)").run([2, "SHO", 1, 1], req);
    await db.prepare("INSERT OR REPLACE INTO Designation (DesignationID, DesignationName, Active, SortOrder) VALUES (?, ?, ?, ?)").run([3, "Beat Constable", 1, 3], req);
  } catch (err: any) {
    console.error("Failed to seed Ranks/Designations:", err.message);
  }

  // 6. Seed CaseCategories, GravityOffences, CaseStatusMasters
  try {
    console.log("Seeding Lookup Masters...");
    await db.prepare("INSERT OR REPLACE INTO CaseCategory (CaseCategoryID, LookupValue) VALUES (?, ?)").run([1, "FIR"], req);
    await db.prepare("INSERT OR REPLACE INTO CaseCategory (CaseCategoryID, LookupValue) VALUES (?, ?)").run([2, "UDR"], req);
    await db.prepare("INSERT OR REPLACE INTO CaseCategory (CaseCategoryID, LookupValue) VALUES (?, ?)").run([3, "Zero FIR"], req);
    await db.prepare("INSERT OR REPLACE INTO CaseCategory (CaseCategoryID, LookupValue) VALUES (?, ?)").run([4, "PAR"], req);

    await db.prepare("INSERT OR REPLACE INTO GravityOffence (GravityOffenceID, LookupValue) VALUES (?, ?)").run([1, "LOW"], req);
    await db.prepare("INSERT OR REPLACE INTO GravityOffence (GravityOffenceID, LookupValue) VALUES (?, ?)").run([2, "MEDIUM"], req);
    await db.prepare("INSERT OR REPLACE INTO GravityOffence (GravityOffenceID, LookupValue) VALUES (?, ?)").run([3, "HIGH"], req);

    await db.prepare("INSERT OR REPLACE INTO CaseStatusMaster (CaseStatusID, CaseStatusName) VALUES (?, ?)").run([1, "PENDING"], req);
    await db.prepare("INSERT OR REPLACE INTO CaseStatusMaster (CaseStatusID, CaseStatusName) VALUES (?, ?)").run([2, "INVESTIGATING"], req);
    await db.prepare("INSERT OR REPLACE INTO CaseStatusMaster (CaseStatusID, CaseStatusName) VALUES (?, ?)").run([3, "RESOLVED"], req);
  } catch (err: any) {
    console.error("Failed to seed Masters:", err.message);
  }

  // 7. Seed Caste, Religion, Occupation Masters & Courts
  try {
    console.log("Seeding Caste, Religion, Occupation, Courts...");
    await db.prepare("INSERT OR REPLACE INTO CasteMaster (caste_master_id, caste_master_name) VALUES (?, ?)").run([1, "General"], req);
    await db.prepare("INSERT OR REPLACE INTO ReligionMaster (ReligionID, ReligionName) VALUES (?, ?)").run([1, "Hindu"], req);
    await db.prepare("INSERT OR REPLACE INTO ReligionMaster (ReligionID, ReligionName) VALUES (?, ?)").run([2, "Muslim"], req);
    await db.prepare("INSERT OR REPLACE INTO ReligionMaster (ReligionID, ReligionName) VALUES (?, ?)").run([3, "Christian"], req);
    await db.prepare("INSERT OR REPLACE INTO OccupationMaster (OccupationID, OccupationName) VALUES (?, ?)").run([1, "Farmer"], req);
    await db.prepare("INSERT OR REPLACE INTO OccupationMaster (OccupationID, OccupationName) VALUES (?, ?)").run([2, "Government Employee"], req);
    await db.prepare("INSERT OR REPLACE INTO OccupationMaster (OccupationID, OccupationName) VALUES (?, ?)").run([3, "Self-employed"], req);
    await db.prepare("INSERT OR REPLACE INTO OccupationMaster (OccupationID, OccupationName) VALUES (?, ?)").run([4, "Unemployed"], req);

    await db.prepare("INSERT OR REPLACE INTO Court (CourtID, CourtName, DistrictID, StateID, Active) VALUES (?, ?, ?, ?, ?)").run([1, "First Class Judicial Magistrate Court", 1, 1, 1], req);
    await db.prepare("INSERT OR REPLACE INTO Court (CourtID, CourtName, DistrictID, StateID, Active) VALUES (?, ?, ?, ?, ?)").run([2, "District and Sessions Court", 2, 1, 1], req);
  } catch (err: any) {
    console.error("Failed to seed Master tables part 2:", err.message);
  }

  // 8. Seed Employees
  try {
    console.log("Seeding Employees...");
    await db.prepare(`
      INSERT OR REPLACE INTO Employee (EmployeeID, DistrictID, UnitID, RankID, DesignationID, KGID, FirstName, EmployeeDOB, GenderID, BloodGroupID, PhysicallyChallenged, AppointmentDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run([1, 1, 1, 2, 2, "EMP10001", "Inspector Kumar", "1980-05-15", 1, 1, 0, "2010-06-01"], req);
    await db.prepare(`
      INSERT OR REPLACE INTO Employee (EmployeeID, DistrictID, UnitID, RankID, DesignationID, KGID, FirstName, EmployeeDOB, GenderID, BloodGroupID, PhysicallyChallenged, AppointmentDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run([2, 1, 2, 2, 2, "EMP10002", "Inspector Gowda", "1982-11-20", 1, 2, 0, "2012-08-10"], req);
  } catch (err: any) {
    console.error("Failed to seed Employees:", err.message);
  }

  // 9. Seed Acts & Sections
  const sectionsData = [
    ["IPC", "379", "Punishment for theft"],
    ["IPC", "380", "Theft in dwelling house"],
    ["IPC", "420", "Cheating and dishonestly inducing delivery of property"],
    ["IPC", "324", "Voluntarily causing hurt by dangerous weapons"],
    ["IPC", "302", "Punishment for murder"],
    ["BNS", "303", "Theft"],
    ["BNS", "305", "Theft in dwelling house"],
    ["BNS", "318", "Cheating"],
    ["BNS", "118", "Voluntarily causing hurt"],
    ["BNS", "103", "Murder"]
  ];
  try {
    console.log("Seeding Acts & Sections...");
    await db.prepare("INSERT OR REPLACE INTO Act (ActCode, ActDescription, ShortName, Active) VALUES (?, ?, ?, ?)").run(["IPC", "Indian Penal Code", "IPC", 1], req);
    await db.prepare("INSERT OR REPLACE INTO Act (ActCode, ActDescription, ShortName, Active) VALUES (?, ?, ?, ?)").run(["BNS", "Bharatiya Nyaya Sanhita", "BNS", 1], req);
    for (const sec of sectionsData) {
      await db.prepare("INSERT OR REPLACE INTO Section (ActCode, SectionCode, SectionDescription, Active) VALUES (?, ?, ?, ?)").run([sec[0], sec[1], sec[2], 1], req);
    }
  } catch (err: any) {
    console.error("Failed to seed Acts & Sections:", err.message);
  }

  // 10. Seed CrimeHead & CrimeSubHead
  try {
    console.log("Seeding CrimeHead & SubHeads...");
    await db.prepare("INSERT OR REPLACE INTO CrimeHead (CrimeHeadID, CrimeGroupName, Active) VALUES (?, ?, ?)").run([1, "Crimes Against Property", 1], req);
    await db.prepare("INSERT OR REPLACE INTO CrimeHead (CrimeHeadID, CrimeGroupName, Active) VALUES (?, ?, ?)").run([2, "Crimes Against Body", 1], req);
    await db.prepare("INSERT OR REPLACE INTO CrimeHead (CrimeHeadID, CrimeGroupName, Active) VALUES (?, ?, ?)").run([3, "Cyber Crimes", 1], req);
    await db.prepare("INSERT OR REPLACE INTO CrimeHead (CrimeHeadID, CrimeGroupName, Active) VALUES (?, ?, ?)").run([4, "Financial Crimes", 1], req);

    await db.prepare("INSERT OR REPLACE INTO CrimeSubHead (CrimeSubHeadID, CrimeHeadID, CrimeHeadName, SeqID) VALUES (?, ?, ?, ?)").run([1, 1, "THEFT", 1], req);
    await db.prepare("INSERT OR REPLACE INTO CrimeSubHead (CrimeSubHeadID, CrimeHeadID, CrimeHeadName, SeqID) VALUES (?, ?, ?, ?)").run([2, 2, "ASSAULT", 2], req);
    await db.prepare("INSERT OR REPLACE INTO CrimeSubHead (CrimeSubHeadID, CrimeHeadID, CrimeHeadName, SeqID) VALUES (?, ?, ?, ?)").run([3, 3, "CYBER", 3], req);
    await db.prepare("INSERT OR REPLACE INTO CrimeSubHead (CrimeSubHeadID, CrimeHeadID, CrimeHeadName, SeqID) VALUES (?, ?, ?, ?)").run([4, 1, "DRUGS", 4], req);
    await db.prepare("INSERT OR REPLACE INTO CrimeSubHead (CrimeSubHeadID, CrimeHeadID, CrimeHeadName, SeqID) VALUES (?, ?, ?, ?)").run([5, 4, "FRAUD", 5], req);
  } catch (err: any) {
    console.error("Failed to seed Crime Heads:", err.message);
  }

  // 11. Seed Accused (Offenders)
  try {
    console.log("Seeding Accused (Offenders)...");
    for (const row of offendersSeed) {
      await db.prepare(`
        INSERT OR REPLACE INTO Accused (AccusedMasterID, CaseMasterID, AccusedName, PersonID, aliases, dob, address, addresses, phone, first_offense_date, districts_active, current_status, risk_score, photo_placeholder_id, associates, crime_history)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        row.offender_id, null, row.name, row.offender_id, row.aliases, row.dob, row.address, row.addresses,
        row.phone, row.first_offense_date, row.districts_active, row.current_status,
        row.risk_score, row.photo_placeholder_id, row.associates, row.crime_history
      ], req);
    }
    console.log("Accused seeded successfully.");
  } catch (err: any) {
    console.error("Failed to seed Accused:", err.message || err);
  }

  // 12. Seed CaseMaster & Complainant & Victim
  try {
    console.log("Seeding CaseMaster (Incidents)...");
    
    // Seed initial list of incidents
    const allIncidents: any[] = [...incidentsSeed];

    // Let's generate 45 additional diverse incidents dynamically to give a realistic density
    const crimeTypes = ["THEFT", "ASSAULT", "CYBER", "DRUGS", "FRAUD"];
    const severities = ["LOW", "MEDIUM", "HIGH"];
    const statuses = ["PENDING", "INVESTIGATING", "RESOLVED"];
    const offenderIds = ["OFF-001", "OFF-002", "OFF-003", "OFF-004", "OFF-005"];
    
    const moTagsMap: Record<string, string[][]> = {
      THEFT: [["grille_cut", "night", "burglary"], ["chain_snatch", "pulsar_bike", "morning_walk"], ["shoplift", "daylight", "commercial"], ["vehicle_theft", "handle_lock_break", "night"]],
      ASSAULT: [["street_fight", "bar_brawl", "weapons"], ["domestic_dispute", "indoor", "verbal_argument"], ["trespass_assault", "night", "iron_rod"]],
      CYBER: [["phishing_email", "remote_access_otp", "bank_account_drain"], ["social_engineering", "impersonation", "gift_card"], ["ransomware", "business_email", "crypto"]],
      DRUGS: [["peddling", "college_campus", "transit_hub"], ["marijuana_possession", "night_patrol", "intercept"], ["ndps_smuggling", "vehicle_check", "border"]],
      FRAUD: [["land_scam", "forged_documents", "impersonation"], ["investment_scam", "ponzi", "high_returns"], ["identity_theft", "credit_card_clone", "atm_skimmer"]]
    };

    const weaponMap: Record<string, string[]> = {
      THEFT: ["Hacksaw/Tools", "Iron Rod", "None"],
      ASSAULT: ["Knife/Blade", "Iron Rod", "None", "Stick"],
      CYBER: ["None"],
      DRUGS: ["None"],
      FRAUD: ["None"]
    };

    const victimNames = [
      "Sunitha M.", "K. Murthy", "V. Raghavan", "Rajesh Gowda", "Aisha Khan",
      "Priya Sharma", "David D'Souza", "Manjunath Rao", "Shashank H.S.", "Deepa Patil",
      "Naveen Kumar", "Kavitha R.", "Vijay Patil", "Ananya Hegde", "Siddharth Naik"
    ];

    const factTemplates: Record<string, string[]> = {
      THEFT: [
        "Complainant reported that locks of the warehouse were broken and copper wires stolen.",
        "Pickpocket incident reported at the busy market entrance during morning rush hours.",
        "Complainant parked two-wheeler in front of residence at night; found missing in morning.",
        "A residence was broken into by breaking the backyard glass window; gold jewelry snatched."
      ],
      ASSAULT: [
        "A physical altercation broke out between two groups over a trivial parking dispute.",
        "Complainant assaulted by an acquaintance with a wooden stick following a verbal argument.",
        "Two individuals initiated a brawl outside a local restaurant, injuring a security guard.",
        "An incident of physical attack reported near the metro station; suspect fled the scene."
      ],
      CYBER: [
        "Victim received a call from an imposter claiming to be bank manager and lost OTP credentials.",
        "Victim clicked on a scam link offering a work-from-home job and lost deposit money.",
        "Unauthorized transfers noticed on credit card; suspects cloned details at an offline kiosk.",
        "Business email compromised by hackers, directing payments to an offshore bank account."
      ],
      DRUGS: [
        "Special squad intercepted a suspect carrying contraband near college hostel premises.",
        "Police checking led to seizure of narcotics packages from a local logistics container.",
        "Suspect arrested with illegal substances during routine vehicle scanning on the highway.",
        "Beat police spotted suspicious transaction in park; recovered NDPS packages from peddler."
      ],
      FRAUD: [
        "Complainant cheated of Rs. 10 Lakhs under the guise of an allotment of residential plot.",
        "Suspect created duplicate stamp papers and forged signatures to claim inheritance property.",
        "Victim invested in a high-yield online scheme which shut down operations after three months.",
        "Forged identity documents used by suspect to secure multiple bank loans under fake names."
      ]
    };

    // Generate 47 extra incidents to reach 50 total records
    for (let i = 1; i <= 47; i++) {
      const idNum = i + 3;
      const incident_id = `INC-${String(idNum).padStart(5, '0')}`;
      
      // Select random station
      const stationRow = unitsData[Math.floor(Math.random() * unitsData.length)];
      const stationName = stationRow[1] as string;
      const distId = stationRow[6];
      const districtName = (districtsData.find(d => d[0] === distId)?.[1] || "BENGALURU_CITY") as string;
      
      // Coordinates close to the station (with minor random offset)
      const lat = (stationRow[7] as number) + (Math.random() * 0.03 - 0.015);
      const long = (stationRow[8] as number) + (Math.random() * 0.03 - 0.015);
      
      const crime_type = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const mo_tags = moTagsMap[crime_type][Math.floor(Math.random() * moTagsMap[crime_type].length)];
      const weapon_used = weaponMap[crime_type][Math.floor(Math.random() * weaponMap[crime_type].length)];
      const offender_id = offenderIds[Math.floor(Math.random() * offenderIds.length)] as string;
      const victim_demographic = victimNames[Math.floor(Math.random() * victimNames.length)];
      
      // Randomized index (stress score indicator)
      const socio_economic_index = parseFloat((Math.random() * 0.65 + 0.18).toFixed(2));
      
      // Random date in the last 120 days
      const daysAgo = Math.floor(Math.random() * 120);
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const dateStr = d.toISOString().split('T')[0];
      
      const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
      const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const timeStr = `${hour}:${min}:00`;
      
      const facts = factTemplates[crime_type][Math.floor(Math.random() * factTemplates[crime_type].length)];
      
      allIncidents.push({
        incident_id,
        date: dateStr,
        time: timeStr,
        district: districtName,
        station: stationName,
        lat,
        long,
        crime_type,
        mo_tags: JSON.stringify(mo_tags),
        weapon_used,
        offender_id,
        victim_demographic,
        socio_economic_index,
        status,
        severity,
        fir_text: `First Information Report: ${facts} Registered under relevant IPC/BNS sections at ${stationName}.`,
        evidence_ids: JSON.stringify([`EVID-${idNum}-1`, `EVID-${idNum}-2`])
      });
    }

    // Save to DB
    for (const row of allIncidents) {
      const stationId = unitsData.find(u => u[1] === row.station)?.[0] || 1;
      const severityId = row.severity === "LOW" ? 1 : (row.severity === "MEDIUM" ? 2 : 3);
      const minorHeadId = row.crime_type === "THEFT" ? 1 : (row.crime_type === "ASSAULT" ? 2 : (row.crime_type === "CYBER" ? 3 : 4));
      const statusId = row.status === "PENDING" ? 1 : (row.status === "INVESTIGATING" ? 2 : 3);

      await db.prepare(`
        INSERT OR REPLACE INTO CaseMaster (CaseMasterID, CrimeNo, CaseNo, CrimeRegisteredDate, PolicePersonID, PoliceStationID, CaseCategoryID, GravityOffenceID, CrimeMajorHeadID, CrimeMinorHeadID, CaseStatusID, CourtID, IncidentFromDate, IncidentToDate, InfoReceivedPSDate, latitude, longitude, BriefFacts, mo_tags, weapon_used, socio_economic_index, evidence_ids, source_batch_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        row.incident_id, 
        `FIR:104430006${row.incident_id.slice(-5)}`,
        `2026${row.incident_id.slice(-5)}`,
        row.date, 
        1, // Officer ID
        stationId, 
        1, // CaseCategoryID (FIR)
        severityId, 
        1, // Major head
        minorHeadId, 
        statusId, 
        1, // Court ID
        `${row.date} ${row.time}`, 
        `${row.date} ${row.time}`, 
        `${row.date} ${row.time}`, 
        row.lat, 
        row.long,
        row.fir_text, 
        row.mo_tags, 
        row.weapon_used, 
        row.socio_economic_index, 
        row.evidence_ids, 
        null
      ], req);

      // Seed Complainant
      await db.prepare(`
        INSERT OR REPLACE INTO ComplainantDetails (CaseMasterID, ComplainantName, AgeYear, OccupationID, ReligionID, CasteID, GenderID)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run([row.incident_id, `Complainant ${row.victim_demographic}`, 40, 3, 1, 1, 1], req);

      // Seed Victim
      await db.prepare(`
        INSERT OR REPLACE INTO Victim (VictimMasterID, CaseMasterID, VictimName, AgeYear, GenderID, VictimPolice)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run([`VIC-${row.incident_id}`, row.incident_id, row.victim_demographic, 35, 1, "0"], req);
    }
    console.log("CaseMaster seeded successfully.");
  } catch (err: any) {
    console.error("Failed to seed CaseMaster:", err.message || err);
  }

  // 13. Seed Uploaded Firs
  try {
    console.log("Seeding uploaded FIRs...");
    for (const row of uploadedFirsSeed) {
      await db.prepare(`
        INSERT OR REPLACE INTO uploaded_firs (upload_id, raw_file_ref, ocr_text, extracted_fields_json, field_confidence_json, linked_incident_id, linked_offender_id, uploaded_at, uploaded_by_role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        row.upload_id, row.raw_file_ref, row.ocr_text, row.extracted_fields_json, row.field_confidence_json,
        row.linked_incident_id, row.linked_offender_id, row.uploaded_at, row.uploaded_by_role
      ], req);
    }
    console.log("Uploaded FIRs seeded successfully.");
  } catch (err: any) {
    console.error("Failed to seed uploaded FIRs:", err.message || err);
  }

  // 14. Seed Anomalies
  try {
    console.log("Seeding anomalies...");
    for (const row of anomaliesSeed) {
      await db.prepare(`
        INSERT OR REPLACE INTO anomalies (id, district, station, metric, baseline, current_value, deviation_score, timestamp, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        row.id, row.district, row.station, row.metric, row.baseline, row.current_value,
        row.deviation_score, row.timestamp, row.status
      ], req);
    }
    console.log("Anomalies seeded successfully.");
  } catch (err: any) {
    console.error("Failed to seed anomalies:", err.message || err);
  }

  // 15. Seed Festivals
  try {
    console.log("Seeding festivals...");
    for (const row of festivalsSeed) {
      await db.prepare(`
        INSERT OR REPLACE INTO festivals (id, name, date, district, crowd_density, risk_multiplier, reallocation_required)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run([
        row.id, row.name, row.date, row.district, row.crowd_density, row.risk_multiplier, row.reallocation_required
      ], req);
    }
    console.log("Festivals seeded successfully.");
  } catch (err: any) {
    console.error("Failed to seed festivals:", err.message || err);
  }

  // 16. Seed Patrols
  try {
    console.log("Seeding patrols...");
    for (const row of patrolsSeed) {
      await db.prepare(`
        INSERT OR REPLACE INTO patrols (id, patrol_unit, district, station, assigned_officers, latitude, longitude, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        row.id, row.patrol_unit, row.district, row.station, row.assigned_officers, row.latitude, row.longitude, row.status
      ], req);
    }
    console.log("Patrols seeded successfully.");
  } catch (err: any) {
    console.error("Failed to seed patrols:", err.message || err);
  }

  // 17. Seed Audit Logs
  try {
    console.log("Seeding audit logs...");
    const auditLogsSeed = [
      { log_id: "AUD-001", entity_type: "ALERT", entity_id: "AL-109", action: "ACKNOWLEDGE", actor_id: "Beat Constable", event_timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), detail: "Beat Constable acknowledged high-risk burglary alert in Malleshwaram grid-1 and initiated patrol route." },
      { log_id: "AUD-002", entity_type: "CASE", entity_id: "INC-00001", action: "INGEST", actor_id: "Station House Officer", event_timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), detail: "SHO approved automated ingestion of FIR INC-00001 extracted via Zia OCR Intelligence Suite." },
      { log_id: "AUD-003", entity_type: "PATROL", entity_id: "PAT-001", action: "REALLOCATE", actor_id: "Superintendent of Police", event_timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), detail: "SP reallocated Bengaluru Hawk-1 to Cubbon Park PS based on festival predictive surge models." },
      { log_id: "AUD-004", entity_type: "OFFENDER", entity_id: "OFF-004", action: "UPDATE_STATUS", actor_id: "Superintendent of Police", event_timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), detail: "Updated status of suspect Manjunath S. to ABSCONDING in repeat offenders registry." },
      { log_id: "AUD-005", entity_type: "MAPPING", entity_id: "Cubbon Park PS", action: "CONFIRM_MAPPING", actor_id: "Station House Officer", event_timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), detail: "SHO confirmed and locked CSV-to-Relational column mappings for incoming historical data ingestion." }
    ];
    for (const log of auditLogsSeed) {
      await db.prepare(`
        INSERT OR REPLACE INTO audit_log (log_id, entity_type, entity_id, action, actor_id, event_timestamp, detail)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run([
        log.log_id, log.entity_type, log.entity_id, log.action, log.actor_id, log.event_timestamp, log.detail
      ], req);
    }
    console.log("Audit logs seeded successfully.");
  } catch (err: any) {
    console.error("Failed to seed audit logs:", err.message || err);
  }
}
