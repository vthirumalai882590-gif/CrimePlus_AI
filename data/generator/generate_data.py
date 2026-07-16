import os
import sqlite3
import random
import json
from datetime import datetime, timedelta

def main():
    print("Seeding CrimePulse AI SQLite database with SCRB specifications...")
    
    # Paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    schema_path = os.path.join(base_dir, "schema.sql")
    db_dir = os.path.join(base_dir, "..", "apps", "api")
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.join(db_dir, "crimepulse.db")
    
    # Connect
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Run Schema
    print(f"Reading schema from {schema_path}...")
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    cursor.executescript(schema_sql)
    
    # Clear existing tables
    cursor.execute("DELETE FROM incidents")
    cursor.execute("DELETE FROM offenders")
    cursor.execute("DELETE FROM uploaded_firs")
    cursor.execute("DELETE FROM anomalies")
    cursor.execute("DELETE FROM festivals")
    cursor.execute("DELETE FROM patrols")
    cursor.execute("DELETE FROM audit_logs")
    
    # 1. Offenders Master Table Seeding
    offenders = [
        {
            "offender_id": "OFF-001",
            "name": "Ramesh Kumar",
            "aliases": json.dumps(["Ramu", "Kulla Ramu", "Gunda Ramesh"]),
            "dob": "1992-04-12",
            "address": "Koramangala 3rd Block, Bengaluru, Karnataka",
            "addresses": json.dumps([
                {"address": "Indiranagar 5th Cross, Bengaluru", "date": "2018-05-14"},
                {"address": "Koramangala 3rd Block, Bengaluru, Karnataka", "date": "2023-01-10"}
            ]),
            "phone": "+91 98451 23456",
            "first_offense_date": "2018-05-14",
            "districts_active": json.dumps(["BENGALURU_CITY", "MYSURU"]),
            "current_status": "OUT_ON_BAIL",
            "risk_score": 85.0,
            "photo_placeholder_id": "OFF-001",
            "associates": json.dumps(["OFF-002", "OFF-005"]),
            "crime_history": json.dumps([
                {"date": "2018-05-14", "ipc_section": "IPC 379", "bns_section": "BNS 303", "crime_type": "THEFT", "custody_duration": "6 Months", "status": "CONVICTED", "district": "BENGALURU_CITY", "station": "Indiranagar PS", "mo_note": "Pickpocketing near transit center"},
                {"date": "2021-08-11", "ipc_section": "IPC 380", "bns_section": "BNS 305", "crime_type": "THEFT", "custody_duration": "1 Year", "status": "CONVICTED", "district": "BENGALURU_CITY", "station": "Indiranagar PS", "mo_note": "House burglary at night, broke lock"},
                {"date": "2026-06-03", "ipc_section": "IPC 380", "bns_section": "BNS 305", "crime_type": "THEFT", "custody_duration": "Pending", "status": "UNDER_TRIAL", "district": "BENGALURU_CITY", "station": "Indiranagar PS", "mo_note": "Ground floor kitchen grille cut with saw"}
            ])
        },
        {
            "offender_id": "OFF-002",
            "name": "Suresh Naik",
            "aliases": json.dumps(["Naika", "Suri", "Mico Suresh"]),
            "dob": "1995-09-20",
            "address": "Lashkar Mohalla, Mysuru, Karnataka",
            "addresses": json.dumps([
                {"address": "Lashkar Mohalla, Mysuru, Karnataka", "date": "2020-02-10"}
            ]),
            "phone": "+91 99002 98765",
            "first_offense_date": "2020-02-10",
            "districts_active": json.dumps(["MYSURU", "MANGALURU"]),
            "current_status": "UNDER_TRIAL",
            "risk_score": 72.5,
            "photo_placeholder_id": "OFF-002",
            "associates": json.dumps(["OFF-001", "OFF-005"]),
            "crime_history": json.dumps([
                {"date": "2020-02-10", "ipc_section": "IPC 379", "bns_section": "BNS 303", "crime_type": "THEFT", "custody_duration": "3 Months", "status": "CONVICTED", "district": "MYSURU", "station": "Lashkar PS", "mo_note": "Two wheeler handle lock break in parking"},
                {"date": "2026-06-09", "ipc_section": "IPC 380", "bns_section": "BNS 305", "crime_type": "THEFT", "custody_duration": "Pending", "status": "UNDER_TRIAL", "district": "BENGALURU_CITY", "station": "Whitefield PS", "mo_note": "Ground floor window steel grille cut with hacksaw"}
            ])
        },
        {
            "offender_id": "OFF-003",
            "name": "Anjali Gowda",
            "aliases": json.dumps(["Anju", "Techie Anjali"]),
            "dob": "1998-01-15",
            "address": "Malleshwaram 8th Cross, Bengaluru, Karnataka",
            "addresses": json.dumps([
                {"address": "Malleshwaram 8th Cross, Bengaluru, Karnataka", "date": "2021-08-30"}
            ]),
            "phone": "+91 97412 55432",
            "first_offense_date": "2021-08-30",
            "districts_active": json.dumps(["BENGALURU_CITY"]),
            "current_status": "OUT_ON_BAIL",
            "risk_score": 65.0,
            "photo_placeholder_id": "OFF-003",
            "associates": json.dumps([]),
            "crime_history": json.dumps([
                {"date": "2021-08-30", "ipc_section": "IPC 420", "bns_section": "BNS 318", "crime_type": "FRAUD", "custody_duration": "Pending", "status": "UNDER_TRIAL", "district": "BENGALURU_CITY", "station": "Malleshwaram PS", "mo_note": "Techie support scam, remote access OTP swipe"}
            ])
        },
        {
            "offender_id": "OFF-004",
            "name": "Manjunath S.",
            "aliases": json.dumps(["Manja", "Bullet Manja"]),
            "dob": "1984-11-05",
            "address": "Dharwad Suburban, Dharwad, Karnataka",
            "addresses": json.dumps([
                {"address": "Dharwad Suburban, Dharwad, Karnataka", "date": "2012-04-03"}
            ]),
            "phone": "+91 96112 44331",
            "first_offense_date": "2012-04-03",
            "districts_active": json.dumps(["HUBBALLI_DHARWAD", "BELAGAVI"]),
            "current_status": "ABSCONDING",
            "risk_score": 91.0,
            "photo_placeholder_id": "OFF-004",
            "associates": json.dumps(["OFF-005"]),
            "crime_history": json.dumps([
                {"date": "2012-04-03", "ipc_section": "IPC 324", "bns_section": "BNS 118", "crime_type": "ASSAULT", "custody_duration": "2 Years", "status": "CONVICTED", "district": "HUBBALLI_DHARWAD", "station": "Dharwad Suburban PS", "mo_note": "Brawl outside local bus stop using weapons"},
                {"date": "2018-09-12", "ipc_section": "IPC 302", "bns_section": "BNS 103", "crime_type": "ASSAULT", "custody_duration": "Pending", "status": "ABSCONDING", "district": "BELAGAVI", "station": "Camp PS", "mo_note": "Assault on victim over property dispute, suspect fled"}
            ])
        },
        {
            "offender_id": "OFF-005",
            "name": "Prakash Shetty",
            "aliases": json.dumps(["Shettru", "Paki"]),
            "dob": "1990-07-22",
            "address": "Pandeshwar, Mangaluru, Karnataka",
            "addresses": json.dumps([
                {"address": "Pandeshwar, Mangaluru, Karnataka", "date": "2015-11-12"}
            ]),
            "phone": "+91 88843 99001",
            "first_offense_date": "2015-11-12",
            "districts_active": json.dumps(["MANGALURU", "MYSURU"]),
            "current_status": "CONVICTED",
            "risk_score": 55.4,
            "photo_placeholder_id": "OFF-005",
            "associates": json.dumps(["OFF-001", "OFF-002", "OFF-004"]),
            "crime_history": json.dumps([
                {"date": "2015-11-12", "ipc_section": "IPC 379", "bns_section": "BNS 303", "crime_type": "THEFT", "custody_duration": "1 Year", "status": "CONVICTED", "district": "MANGALURU", "station": "Pandeshwar PS", "mo_note": "Gold chain snatching by bike-borne suspects"}
            ])
        }
    ]
    
    print("Inserting offenders master...")
    for off in offenders:
        cursor.execute("""
            INSERT INTO offenders (offender_id, name, aliases, dob, address, addresses, phone, first_offense_date, districts_active, current_status, risk_score, photo_placeholder_id, associates, crime_history)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            off["offender_id"], off["name"], off["aliases"], off["dob"], off["address"], off["addresses"],
            off["phone"], off["first_offense_date"], off["districts_active"], off["current_status"],
            off["risk_score"], off["photo_placeholder_id"], off["associates"], off["crime_history"]
        ))
        
    # Districts and police station centers
    districts = {
        'BENGALURU_CITY': {
            'coords': (12.9716, 77.5946),
            'stations': {
                'Vidhana Soudha PS': (12.9796, 77.5906),
                'Cubbon Park PS': (12.9730, 77.5960),
                'Indiranagar PS': (12.9784, 77.6408),
                'Koramangala PS': (12.9352, 77.6244),
                'Whitefield PS': (12.9698, 77.7499)
            }
        },
        'MYSURU': {
            'coords': (12.2958, 76.6394),
            'stations': {
                'Devaraja PS': (12.3080, 76.6500),
                'Lashkar PS': (12.3160, 76.6550),
                'Mandi PS': (12.3250, 76.6450),
                'K.R. Puram PS': (12.2900, 76.6300)
            }
        },
        'HUBBALLI_DHARWAD': {
            'coords': (15.3647, 75.1240),
            'stations': {
                'Hubballi Town PS': (15.3520, 75.1380),
                'Dharwad Suburban PS': (15.4450, 75.0080),
                'Vidyanagar PS': (15.3720, 75.1180)
            }
        },
        'MANGALURU': {
            'coords': (12.9141, 74.8560),
            'stations': {
                'Mangaluru Town PS': (12.8700, 74.8450),
                'Pandeshwar PS': (12.8600, 74.8420),
                'Ullal PS': (12.8050, 74.8490)
            }
        },
        'BELAGAVI': {
            'coords': (15.8497, 74.4977),
            'stations': {
                'Khade Bazar PS': (15.8520, 74.5080),
                'Market PS': (15.8600, 74.5120),
                'Camp PS': (15.8400, 74.4900)
            }
        }
    }
    
    crime_templates = {
        "THEFT": [
            ("House burglary at night", ["burglary", "night", "grille_cut", "lock_break"]),
            ("Stolen two-wheeler from transit station parking", ["vehicle_theft", "parking", "handle_lock_break"]),
            ("Chain snatching by bike-borne suspects", ["chain_snatch", "two_suspects", "morning_walk"]),
            ("Shoplifting electronics during peak business hours", ["shoplifting", "daytime", "bag_stuffing"])
        ],
        "ASSAULT": [
            ("Street fight near local bus stop", ["brawl", "public", "weapons_altercation"]),
            ("Assault of victim over property dispute", ["assault", "personal_enmity", "house_trespass"]),
            ("Violence outside commercial bar/restaurant", ["brawl", "drunk", "late_night"])
        ],
        "CYBER": [
            ("Phishing bank scam via SMS links", ["phishing", "upi_fraud", "otp_swipe"]),
            ("WhatsApp fake subsidy job offer scheme", ["job_fraud", "digital_payment", "remotely_auth"])
        ],
        "DRUGS": [
            ("Seizure of commercial cannabis near university campus", ["drug_peddling", "weed", "college_area"]),
            ("Retail drug trade near local bus stand", ["possession", "local_peddler", "cash_deal"])
        ],
        "FRAUD": [
            ("Fake government documents land registry scam", ["forgery", "registry", "land_grab"]),
            ("Merchant duped using counterfeit UPI transaction screenshot", ["upi_spoof", "digital_cheating"])
        ]
    }
    
    # 2. Generate Incidents (3000 incidents over a 3-year window)
    print("Generating 3,000 synthetic incident records...")
    incidents_data = []
    base_time = datetime.now() - timedelta(days=3 * 365)
    
    for i in range(1, 3001):
        inc_id = f"INC-{i:05d}"
        
        # Pick random district and station
        dist_key = random.choice(list(districts.keys()))
        station_key = random.choice(list(districts[dist_key]['stations'].keys()))
        station_lat, station_lng = districts[dist_key]['stations'][station_key]
        
        # Coordinates with slight offset
        lat = station_lat + random.uniform(-0.015, 0.015)
        long = station_lng + random.uniform(-0.015, 0.015)
        
        crime_cat = random.choice(list(crime_templates.keys()))
        title_tmpl, mo_tags = random.choice(crime_templates[crime_cat])
        title = f"{title_tmpl} at {station_key.replace(' PS', '')}"
        
        # Date and time offset
        day_offset = random.randint(0, 3 * 365)
        sec_offset = random.randint(0, 86400)
        dt = base_time + timedelta(days=day_offset, seconds=sec_offset)
        date_str = dt.strftime("%Y-%m-%d")
        time_str = dt.strftime("%H:%M:%S")
        
        # Link offender (30% chance of known offender)
        off_id = None
        if random.random() < 0.3:
            off_id = random.choice(offenders)["offender_id"]
            
        severity = random.choice(["LOW", "MEDIUM", "HIGH"])
        status = random.choice(["PENDING", "INVESTIGATING", "RESOLVED"])
        
        # Narrative
        fir_text = f"First Information Report: The complainant reports that on {date_str} at {time_str}, an incident of {crime_cat.lower()} occurred near {station_key}. {title}. Suspect entered using {', '.join(mo_tags)}."
        
        incidents_data.append((
            inc_id, date_str, time_str, dist_key, station_key, lat, long, crime_cat,
            json.dumps(mo_tags), "Hacksaw/Tools" if "grille_cut" in mo_tags else "None",
            off_id, "Complainant 35yo Male", random.uniform(0.1, 0.9), status, severity, fir_text, json.dumps(["EVID-001", "EVID-002"])
        ))
        
    cursor.executemany("""
        INSERT INTO incidents (
          incident_id, date, time, district, station, lat, long, crime_type,
          mo_tags, weapon_used, offender_id, victim_demographic, socio_economic_index, status, severity, fir_text, evidence_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, incidents_data)
    
    # 3. Seeding Uploaded FIRs (15 bilingual specimen files for matching demos)
    print("Generating specimen FIR uploads stage records...")
    
    specimens = [
        {
            "upload_id": "UPL-001",
            "raw_file_ref": "FIR_2026_00341_Indiranagar.pdf",
            "ocr_text": "FIRST INFORMATION REPORT (ಎಫ್.ಐ.ಆರ್). District: Bengaluru City. PS: Indiranagar. FIR No: 00341/2026. Date: 2026-06-03. Time: 01:40 AM. Act: IPC Section 457/380. Burglary. Complainant: K. Murthy. Accused: R. Kumar @ Ramu. Facts: Complainant reports ground floor residence back window iron grille was cut with hacksaw blade. Lock broken. Golden jewelry worth 5 Lakhs stolen while house was empty.",
            "extracted_fields": {
                "fir_no": "00341/2026",
                "date": "2026-06-03",
                "time": "01:40 AM",
                "district": "BENGALURU_CITY",
                "station": "Indiranagar PS",
                "crime_type": "THEFT",
                "accused_name": "Ramesh Kumar",
                "alias": "Ramu",
                "complainant_name": "K. Murthy",
                "mo_tags": ["grille_cut", "night", "empty_house", "burglary"],
                "property_stolen": "Gold jewelry"
            },
            "confidence": {"fir_no": "high", "accused_name": "high", "mo_tags": "high"},
            "linked_incident_id": "INC-00001",
            "linked_offender_id": "OFF-001",
            "uploaded_by_role": "SHO"
        },
        {
            "upload_id": "UPL-002",
            "raw_file_ref": "FIR_2026_00389_Whitefield.pdf",
            "ocr_text": "FIRST INFORMATION REPORT. District: Bengaluru City. PS: Whitefield. FIR No: 00389/2026. Date: 2026-06-09. Time: 02:15 AM. Crime: Burglary. Sections: IPC 457. Complainant: V. Raghavan. Accused: S. Naik @ Suresh. Facts: Complainant states thieves entered ground floor by cutting kitchen window steel grille with saw. Golden chain and cash worth 3 Lakhs stolen. Elderly couple was sleeping in nearby room.",
            "extracted_fields": {
                "fir_no": "00389/2026",
                "date": "2026-06-09",
                "time": "02:15 AM",
                "district": "BENGALURU_CITY",
                "station": "Whitefield PS",
                "crime_type": "THEFT",
                "accused_name": "Suresh Naik",
                "alias": "Suri",
                "complainant_name": "V. Raghavan",
                "mo_tags": ["grille_cut", "night", "asleep_residents", "burglary"],
                "property_stolen": "Gold chain, Cash"
            },
            "confidence": {"fir_no": "high", "accused_name": "medium", "mo_tags": "high"},
            "linked_incident_id": "INC-00002",
            "linked_offender_id": "OFF-002",
            "uploaded_by_role": "SHO"
        },
        {
            "upload_id": "UPL-003",
            "raw_file_ref": "FIR_2026_00551_Devaraja.pdf",
            "ocr_text": "FIRST INFORMATION REPORT. District: Mysuru. PS: Devaraja. FIR No: 00551/2026. Date: 2026-06-15. Time: 06:30 AM. Crime: Chain Snatching. Complainant: Sunitha M. Accused: Unknown rider. Facts: Complainant walking in morning near park. Two youth on black Pulsar motorcycle snatched gold nuptial chain (Mangalsutra) and fled towards Lashkar PS.",
            "extracted_fields": {
                "fir_no": "00551/2026",
                "date": "2026-06-15",
                "time": "06:30 AM",
                "district": "MYSURU",
                "station": "Devaraja PS",
                "crime_type": "THEFT",
                "accused_name": "Suresh Naik",
                "alias": "Naika",
                "complainant_name": "Sunitha M.",
                "mo_tags": ["chain_snatch", "pulsar_bike", "morning_walk"],
                "property_stolen": "Gold Mangalsutra"
            },
            "confidence": {"fir_no": "high", "accused_name": "medium", "mo_tags": "high"},
            "linked_incident_id": "INC-00003",
            "linked_offender_id": "OFF-002",
            "uploaded_by_role": "SHO"
        }
    ]
    
    for spec in specimens:
        cursor.execute("""
            INSERT INTO uploaded_firs (
              upload_id, raw_file_ref, ocr_text, extracted_fields_json, field_confidence_json,
              linked_incident_id, linked_offender_id, uploaded_at, uploaded_by_role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            spec["upload_id"], spec["raw_file_ref"], spec["ocr_text"],
            json.dumps(spec["extracted_fields"]), json.dumps(spec["confidence"]),
            spec["linked_incident_id"], spec["linked_offender_id"],
            datetime.now().isoformat(), spec["uploaded_by_role"]
        ))
        
    # 4. Generate Anomaly alerts
    anomalies_data = [
        ("ANM-001", "BENGALURU_CITY", "Koramangala PS", "Cyber Crime Spike", 12.4, 28.5, 2.3, (datetime.now() - timedelta(days=2)).isoformat(), "UNACKNOWLEDGED"),
        ("ANM-002", "BENGALURU_CITY", "Vidhana Soudha PS", "Protest Gathering Deviation", 1.2, 5.0, 4.1, (datetime.now() - timedelta(days=1)).isoformat(), "UNACKNOWLEDGED"),
        ("ANM-003", "MYSURU", "Devaraja PS", "Theft Incident Density", 8.0, 17.5, 2.18, (datetime.now() - timedelta(days=3)).isoformat(), "UNACKNOWLEDGED"),
        ("ANM-004", "MANGALURU", "Ullal PS", "Assault Frequency Rise", 4.1, 9.2, 2.24, (datetime.now() - timedelta(days=5)).isoformat(), "ACKNOWLEDGED"),
        ("ANM-005", "HUBBALLI_DHARWAD", "Vidyanagar PS", "Drug seizure count", 2.0, 6.5, 3.25, (datetime.now() - timedelta(hours=12)).isoformat(), "UNACKNOWLEDGED")
    ]
    cursor.executemany("""
        INSERT INTO anomalies (id, district, station, metric, baseline, current_value, deviation_score, timestamp, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, anomalies_data)
    
    # 5. Generate Festivals
    festivals_data = [
        ("FES-001", "Ganesh Chaturthi", (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"), "BENGALURU_CITY", "HIGH", 1.85, 1),
        ("FES-002", "Mysuru Dasara Procession", (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d"), "MYSURU", "HIGH", 2.4, 1),
        ("FES-003", "Mangaluru Dasara", (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d"), "MANGALURU", "MEDIUM", 1.5, 0),
        ("FES-004", "Kanakadasa Jayanthi", (datetime.now() + timedelta(days=20)).strftime("%Y-%m-%d"), "HUBBALLI_DHARWAD", "LOW", 1.15, 0),
        ("FES-005", "Belagavi Rajyotsava", (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d"), "BELAGAVI", "MEDIUM", 1.45, 1)
    ]
    cursor.executemany("""
        INSERT INTO festivals (id, name, date, district, crowd_density, risk_multiplier, reallocation_required)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, festivals_data)
    
    # 6. Generate Patrols
    patrols_data = [
        ("PAT-001", "Bengaluru Hawk-1", "BENGALURU_CITY", "Koramangala PS", "Constable Gowda, Constable Patil", 12.9352, 77.6244, "PATROLLING"),
        ("PAT-002", "Bengaluru Hawk-2", "BENGALURU_CITY", "Whitefield PS", "Constable Shivakumar, Constable Naik", 12.9698, 77.7499, "IDLE"),
        ("PAT-003", "Mysuru Eagle-1", "MYSURU", "Devaraja PS", "Constable Swamy, Constable Raju", 12.3080, 76.6500, "PATROLLING"),
        ("PAT-004", "Mysuru Eagle-2", "MYSURU", "Lashkar PS", "Constable Basappa, Constable Siddappa", 12.3160, 76.6550, "DISPATCHED"),
        ("PAT-005", "Hubballi Cheetah-1", "HUBBALLI_DHARWAD", "Hubballi Town PS", "Constable Joshi, Constable Pujar", 15.3520, 75.1380, "PATROLLING"),
        ("PAT-006", "Mangaluru Dolphin-1", "MANGALURU", "Pandeshwar PS", "Constable Fernandes, Constable D'Souza", 12.8600, 74.8420, "IDLE"),
        ("PAT-007", "Belagavi Panther-1", "BELAGAVI", "Khade Bazar PS", "Constable Patil, Constable Kadam", 15.8520, 74.5080, "PATROLLING"),
    ]
    cursor.executemany("""
        INSERT INTO patrols (id, patrol_unit, district, station, assigned_officers, latitude, longitude, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, patrols_data)
    
    # 7. Generate Audit Logs
    audit_data = [
        ("AUD-001", (datetime.now() - timedelta(days=2)).isoformat(), "SP", "Patrol Route Reallocation", "Approved tactical reallocation of Bengaluru Hawk-1 to Koramangala PS hotspot."),
        ("AUD-002", (datetime.now() - timedelta(days=1)).isoformat(), "SHO", "Anomaly Acknowledgment", "Acknowledged Cyber Crime Spike alert at Koramangala PS. Assigned Inspector Satish for review."),
        ("AUD-003", (datetime.now() - timedelta(hours=5)).isoformat(), "SP", "Audit Log Cleared", "System verification checks executed on repeat offender clusters.")
    ]
    cursor.executemany("""
        INSERT INTO audit_logs (id, timestamp, operator_role, action_taken, details)
        VALUES (?, ?, ?, ?, ?)
    """, audit_data)
    
    conn.commit()
    conn.close()
    
    print("CrimePulse AI SQLite Database seeded successfully!")

if __name__ == "__main__":
    main()
