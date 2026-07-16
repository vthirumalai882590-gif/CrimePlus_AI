# Catalyst Data Store Schema (Official ERD Aligned)

Create these as tables in the Catalyst console (or via ZCQL). Types are Catalyst Data Store column types.

---

## 1. Reference Lookup Tables

### State
| Column | Type | Notes |
| :--- | :--- | :--- |
| StateID | Number (PK) | Unique state identifier |
| StateName | Text | Name of the state (e.g. Karnataka) |
| NationalityID | Number | Nationality reference |
| Active | Boolean | Whether active (1=Active, 0=Inactive) |

### District
| Column | Type | Notes |
| :--- | :--- | :--- |
| DistrictID | Number (PK) | Unique district identifier |
| DistrictName | Text (indexed) | Canonical spelling of district |
| StateID | Number | FK → State.StateID |
| Active | Boolean | Whether active |
| unemployment_rate | Decimal | Socio-economic correlation metric |
| literacy_rate | Decimal | Socio-economic correlation metric |
| population_density | Decimal | Socio-economic correlation metric |
| socio_economic_index | Decimal | Composite index |

### UnitType
| Column | Type | Notes |
| :--- | :--- | :--- |
| UnitTypeID | Number (PK) | Unique unit type identifier |
| UnitTypeName | Text | e.g. Police Station, Circle Office |
| CityDistState | Text | Operational level |
| Hierarchy | Number | Hierarchy level number |
| Active | Boolean | Whether active |

### Unit (Stations)
| Column | Type | Notes |
| :--- | :--- | :--- |
| UnitID | Number (PK) | Unique unit/station identifier |
| UnitName | Text (indexed) | Name of unit or station |
| TypeID | Number | FK → UnitType.UnitTypeID |
| ParentUnit | Number | Self-reference to UnitID |
| NationalityID | Number | Nationality ID |
| StateID | Number | FK → State.StateID |
| DistrictID | Number | FK → District.DistrictID |
| lat | Decimal | Latitude |
| long | Decimal | Longitude |
| status | Text | active / not_yet_onboarded |
| last_upload_at | DateTime | Last data ingestion timestamp |
| Active | Boolean | Whether active |

### Rank
| Column | Type | Notes |
| :--- | :--- | :--- |
| RankID | Number (PK) | Unique rank identifier |
| RankName | Text | Police rank (e.g. Constable, Inspector, DSP) |
| Hierarchy | Number | Rank level hierarchy |
| Active | Boolean | Whether active |

### Designation
| Column | Type | Notes |
| :--- | :--- | :--- |
| DesignationID | Number (PK) | Unique designation identifier |
| DesignationName | Text | Designation (e.g. Investigating Officer, SHO) |
| Active | Boolean | Whether active |
| SortOrder | Number | Sorting order |

### CaseCategory
| Column | Type | Notes |
| :--- | :--- | :--- |
| CaseCategoryID | Number (PK) | Unique category identifier |
| LookupValue | Text | Category name (FIR, UDR, Zero FIR, PAR) |

### GravityOffence
| Column | Type | Notes |
| :--- | :--- | :--- |
| GravityOffenceID | Number (PK) | Unique gravity identifier |
| LookupValue | Text | e.g. Heinous, Non-Heinous |

### CaseStatusMaster
| Column | Type | Notes |
| :--- | :--- | :--- |
| CaseStatusID | Number (PK) | Unique status identifier |
| CaseStatusName | Text | e.g. Under Investigation, Charge Sheeted, Closed |

### CasteMaster
| Column | Type | Notes |
| :--- | :--- | :--- |
| caste_master_id | Number (PK) | Unique caste identifier |
| caste_master_name | Text | Name of the caste |

### ReligionMaster
| Column | Type | Notes |
| :--- | :--- | :--- |
| ReligionID | Number (PK) | Unique religion identifier |
| ReligionName | Text | Name of the religion |

### OccupationMaster
| Column | Type | Notes |
| :--- | :--- | :--- |
| OccupationID | Number (PK) | Unique occupation identifier |
| OccupationName | Text | Name of occupation (e.g. Farmer, Employee) |

### Court
| Column | Type | Notes |
| :--- | :--- | :--- |
| CourtID | Number (PK) | Unique court identifier |
| CourtName | Text | Full name of the court |
| DistrictID | Number | FK → District.DistrictID |
| StateID | Number | FK → State.StateID |
| Active | Boolean | Whether active |

---

## 2. Employee & Core Police Records

### Employee (Officers)
| Column | Type | Notes |
| :--- | :--- | :--- |
| EmployeeID | Number (PK) | Unique employee identifier |
| DistrictID | Number | FK → District.DistrictID |
| UnitID | Number | FK → Unit.UnitID |
| RankID | Number | FK → Rank.RankID |
| DesignationID | Number | FK → Designation.DesignationID |
| KGID | Text (unique) | Karnataka Government ID number |
| FirstName | Text | First name of employee |
| EmployeeDOB | Text | DOB YYYY-MM-DD |
| GenderID | Number | Gender lookup (1=M, 2=F, 3=T) |
| BloodGroupID | Number | Blood group lookup value |
| PhysicallyChallenged | Boolean | Physically challenged flag |
| AppointmentDate | Text | Appointment date YYYY-MM-DD |

---

## 3. Law & Legal Offenses

### Act
| Column | Type | Notes |
| :--- | :--- | :--- |
| ActCode | Text (PK) | Unique code (e.g. IPC, NDPS, IT Act) |
| ActDescription | Text | Full description of the act |
| ShortName | Text | Abbreviated name of the act |
| Active | Boolean | Active flag |

### Section
| Column | Type | Notes |
| :--- | :--- | :--- |
| ActCode | Text | FK → Act.ActCode |
| SectionCode | Text (PK) | Section number/code (e.g. 302, 307) |
| SectionDescription | Text | Full description of the section |
| Active | Boolean | Active flag |

### CrimeHead
| Column | Type | Notes |
| :--- | :--- | :--- |
| CrimeHeadID | Number (PK) | Unique major crime head identifier |
| CrimeGroupName | Text | Name of the crime group (e.g. Crimes Against Body) |
| Active | Boolean | Active flag |

### CrimeSubHead
| Column | Type | Notes |
| :--- | :--- | :--- |
| CrimeSubHeadID | Number (PK) | Unique crime sub-head identifier |
| CrimeHeadID | Number | FK → CrimeHead.CrimeHeadID |
| CrimeHeadName | Text | Name of the sub-head (e.g. Murder, Robbery) |
| SeqID | Number | Sorting order sequence |

### CrimeHeadActSection
| Column | Type | Notes |
| :--- | :--- | :--- |
| CrimeHeadID | Number | FK → CrimeHead.CrimeHeadID |
| ActCode | Text | FK → Act.ActCode |
| SectionCode | Text | FK → Section.SectionCode |

---

## 4. Cases, Complainants, Victims & Accused

### CaseMaster (Incidents)
| Column | Type | Notes |
| :--- | :--- | :--- |
| CaseMasterID | Number (PK) | Unique case identifier |
| CrimeNo | Text | Structured code (Category + District + Station + Year + Serial) |
| CaseNo | Text | Station/year running serial (Last 9 digits of CrimeNo) |
| CrimeRegisteredDate | Text | Date when FIR registered YYYY-MM-DD |
| PolicePersonID | Number | FK → Employee.EmployeeID (registering officer) |
| PoliceStationID | Number | FK → Unit.UnitID (police station where registered) |
| CaseCategoryID | Number | FK → CaseCategory.CaseCategoryID |
| GravityOffenceID | Number | FK → GravityOffence.GravityOffenceID |
| CrimeMajorHeadID | Number | FK → CrimeHead.CrimeHeadID |
| CrimeMinorHeadID | Number | FK → CrimeSubHead.CrimeSubHeadID |
| CaseStatusID | Number | FK → CaseStatusMaster.CaseStatusID |
| CourtID | Number | FK → Court.CourtID |
| IncidentFromDate | Text | Incident start date YYYY-MM-DD HH:MM:SS |
| IncidentToDate | Text | Incident end date YYYY-MM-DD HH:MM:SS |
| InfoReceivedPSDate | Text | Date/time info received by PS |
| latitude | Decimal | GPS latitude coordinate |
| longitude | Decimal | GPS longitude coordinate |
| BriefFacts | Text | Summary of case / FIR text |
| mo_tags | Text | JSON array of modus operandi tags |
| weapon_used | Text | Weapon details |
| socio_economic_index | Decimal | Socio economic index of incident location |
| evidence_ids | Text | JSON array of evidence identifiers |
| source_batch_id | Text | FK → upload_batches.batch_id |

### ComplainantDetails
| Column | Type | Notes |
| :--- | :--- | :--- |
| ComplainantID | Number (PK) | Unique complainant identifier |
| CaseMasterID | Number | FK → CaseMaster.CaseMasterID |
| ComplainantName | Text | Full name of the complainant |
| AgeYear | Number | Age of the complainant |
| OccupationID | Number | FK → OccupationMaster.OccupationID |
| ReligionID | Number | FK → ReligionMaster.ReligionID |
| CasteID | Number | FK → CasteMaster.caste_master_id |
| GenderID | Number | Gender lookup value |

### ActSectionAssociation
| Column | Type | Notes |
| :--- | :--- | :--- |
| CaseMasterID | Number | FK → CaseMaster.CaseMasterID |
| ActID | Text | FK → Act.ActCode |
| SectionID | Text | FK → Section.SectionCode |
| ActOrderID | Number | Display order of act |
| SectionOrderID | Number | Display order of section |

### Victim
| Column | Type | Notes |
| :--- | :--- | :--- |
| VictimMasterID | Number (PK) | Unique victim identifier |
| CaseMasterID | Number | FK → CaseMaster.CaseMasterID |
| VictimName | Text | Full name of the victim |
| AgeYear | Number | Age of the victim |
| GenderID | Number | Gender lookup (1=M, 2=F, 3=T) |
| VictimPolice | Text | "1" if police officer, "0" otherwise |

### Accused
| Column | Type | Notes |
| :--- | :--- | :--- |
| AccusedMasterID | Number (PK) | Unique accused person identifier |
| CaseMasterID | Number | FK → CaseMaster.CaseMasterID |
| AccusedName | Text | Full name of the accused |
| AgeYear | Number | Age of the accused |
| GenderID | Number | Gender lookup value |
| PersonID | Text | Accused sorting ID (e.g. OFF-001, A1, A2...) |
| aliases | Text | JSON array of aliases |
| dob | Text | Date of birth YYYY-MM-DD |
| address | Text | Current address |
| addresses | Text | JSON array of historical addresses |
| phone | Text | Phone number |
| first_offense_date | Text | First offense date YYYY-MM-DD |
| districts_active | Text | JSON array of districts where active |
| current_status | Text | absconding / in_custody / on_bail / deceased |
| risk_score | Decimal | Recidivism risk forecast metric |
| photo_placeholder_id | Text | Suspect ID for photo loading |
| associates | Text | JSON array of associate Accused IDs |
| crime_history | Text | JSON array of history objects |

### ArrestSurrender
| Column | Type | Notes |
| :--- | :--- | :--- |
| ArrestSurrenderID | Number (PK) | Unique arrest identifier |
| CaseMasterID | Number | FK → CaseMaster.CaseMasterID |
| ArrestSurrenderTypeID | Number | Lookup: 1=Arrest, 2=Surrender |
| ArrestSurrenderDate | Text | Date of arrest YYYY-MM-DD |
| ArrestSurrenderStateId | Number | FK → State.StateID |
| ArrestSurrenderDistrictId | Number | FK → District.DistrictID |
| PoliceStationID | Number | FK → Unit.UnitID |
| IOID | Number | FK → Employee.EmployeeID (arresting officer) |
| CourtID | Number | FK → Court.CourtID |
| AccusedMasterID | Number | FK → Accused.AccusedMasterID |
| IsAccused | Boolean | Whether primary accused |
| IsComplainantAccused | Boolean | Complainant listed as accused flag |

### ChargesheetDetails
| Column | Type | Notes |
| :--- | :--- | :--- |
| CSID | Number (PK) | Unique chargesheet identifier |
| CaseMasterID | Number | FK → CaseMaster.CaseMasterID |
| csdate | Text | Chargesheet date YYYY-MM-DD HH:MM:SS |
| cstype | Text | Final report type: A->Chargesheet, B->False, C->Undetected |
| PolicePersonID | Number | FK → Employee.EmployeeID |

---

## 5. Platform Ingestion & Utility Tables

### upload_batches
Tracks every file a station uploads.
| Column | Type | Notes |
| :--- | :--- | :--- |
| batch_id | Text (unique) | Unique ID |
| station_id | Text | FK → Unit.UnitID |
| uploaded_at | DateTime | Date uploaded |
| file_name | Text | Name of the file |
| stratus_file_id | Text | Stratus storage key |
| format_detected | Text | csv / xlsx / pdf / image |
| records_parsed | Number | Parsed count |
| records_flagged | Number | Review needed count |
| status | Text | uploaded / parsing / merged |

### station_column_mappings
| Column | Type | Notes |
| :--- | :--- | :--- |
| station_id | Text (unique) | FK → Unit.UnitID |
| mapping_json | Text | JSON mapping string |
| confirmed_by | Text | User badge ID |
| confirmed_at | DateTime | Timestamp |

### uploaded_firs
| Column | Type | Notes |
| :--- | :--- | :--- |
| upload_id | Text (unique) | Unique upload ID |
| raw_file_ref | Text | Storage path or filename |
| ocr_text | Text | Scanned text output |
| extracted_fields_json | Text | Parsed attributes JSON |
| field_confidence_json | Text | Field validation confidence |
| linked_incident_id | Text | CaseMasterID |
| linked_offender_id | Text | PersonID |
| uploaded_at | DateTime | Upload timestamp |
| uploaded_by_role | Text | Operator role |

### anomalies
| Column | Type | Notes |
| :--- | :--- | :--- |
| anomaly_id | Text (unique) | Unique anomaly ID |
| district | Text | District name |
| station | Text | Station name |
| metric | Text | Spiking metric |
| baseline | Decimal | Historical average baseline |
| current_value | Decimal | Current value |
| deviation_score | Decimal | Z-score deviation |
| event_timestamp | DateTime | Trigger timestamp |
| status | Text | UNACKNOWLEDGED / ACKNOWLEDGED |

### festivals
| Column | Type | Notes |
| :--- | :--- | :--- |
| festival_id | Text (unique) | Unique festival ID |
| name | Text | Festival name |
| date | Date | Festival date |
| district | Text | District name |
| crowd_density | Text | LOW / MEDIUM / HIGH |
| risk_multiplier | Decimal | Safety risk multiplier |
| reallocation_required | Boolean | Reallocation trigger |

### patrols
| Column | Type | Notes |
| :--- | :--- | :--- |
| patrol_id | Text (unique) | Unique patrol ID |
| patrol_unit | Text | Unit/vehicle name |
| district | Text | District name |
| station | Text | Station name |
| assigned_officers | Text | Officers' names |
| latitude | Decimal | Current latitude |
| longitude | Decimal | Current longitude |
| status | Text | PATROLLING / IDLE / DISPATCHED |

### audit_log
| Column | Type | Notes |
| :--- | :--- | :--- |
| log_id | Text (unique) | Unique log ID |
| entity_type | Text | e.g. incident, offender |
| entity_id | Text | ID of entity |
| action | Text | created / updated / merged |
| actor_id | Text | Operator badge / role |
| event_timestamp | DateTime | Trigger timestamp |
| detail | Text | JSON details string |
