import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Default form shapes (mirrors AddRecordView) ───────────────────────────────
export const DEFAULT_CRIMINAL_FORM = {
  full_name: '', aliases: '', age: '', gender: 'Male', dob: '', phone: '',
  phone2: '', aadhaar_last4: '', address_full: '', address_district: 'BENGALURU_CITY',
  address_station: '', status: 'absconding', associated_gangs: '', known_associates: '',
  crime_type: 'theft', ipc_section: 'IPC 379 (Theft)', bns_section: '', date: '',
  time: '', severity: 'medium', incident_district: 'BENGALURU_CITY', incident_station: '',
  lat: '', lng: '', weapon_used: 'None', mo_tags: '', property_stolen: '',
  case_officer_name: '', case_officer_badge: '', court_name: '', description: '',
  bail_date: '', bail_court: '', risk_score: ''
};

export const DEFAULT_VICTIM_FORM = {
  full_name: '', age: '', gender: 'Female', dob: '', phone: '', occupation: '',
  aadhaar_last4: '', address_full: '', district: 'BENGALURU_CITY', station: '',
  victim_type: 'murder-victim', linked_incident: '', injury_level: 'Minor',
  property_lost: '', witness_name: '', witness_phone: '', case_officer_name: '',
  case_officer_badge: '', incident_date: '', incident_time: '', description: ''
};

export const DEFAULT_INCIDENT_FORM = {
  crime_type: 'theft', ipc_section: 'IPC 379 (Theft)', bns_section: '',
  date: '', time: '', severity: 'medium', incident_district: 'BENGALURU_CITY',
  incident_station: '', lat: '', lng: '', weapon_used: 'None', mo_tags: '',
  property_stolen: '', case_officer_name: '', case_officer_badge: '',
  description: ''
};

export type CriminalForm = typeof DEFAULT_CRIMINAL_FORM;
export type VictimForm = typeof DEFAULT_VICTIM_FORM;
export type IncidentForm = typeof DEFAULT_INCIDENT_FORM;

export interface FormDraftState {
  // Active record type
  recordType: 'criminal' | 'victim';
  setRecordType: (type: 'criminal' | 'victim') => void;

  // Upload mode
  uploadMode: 'manual' | 'bulk';
  setUploadMode: (mode: 'manual' | 'bulk') => void;

  // Current form step
  step: number;
  setStep: (step: number) => void;

  // Criminal form draft
  crimDraft: CriminalForm;
  setCrimDraft: (updates: Partial<CriminalForm>) => void;
  resetCrimDraft: () => void;

  // Victim form draft
  vicDraft: VictimForm;
  setVicDraft: (updates: Partial<VictimForm>) => void;
  resetVicDraft: () => void;

  // Incident (shared across criminal/victim)
  incDraft: IncidentForm;
  setIncDraft: (updates: Partial<IncidentForm>) => void;
  resetIncDraft: () => void;

  // Clear everything (called on successful submit)
  clearAllDrafts: () => void;

  // Indicates if a draft is in progress (any field non-empty)
  hasDraft: () => boolean;
}

export const useFormDraftStore = create<FormDraftState>()(
  persist(
    (set, get) => ({
      recordType: 'criminal',
      setRecordType: (recordType) => set({ recordType, step: 1 }),

      uploadMode: 'manual',
      setUploadMode: (uploadMode) => set({ uploadMode }),

      step: 1,
      setStep: (step) => set({ step }),

      crimDraft: { ...DEFAULT_CRIMINAL_FORM },
      setCrimDraft: (updates) =>
        set((state) => ({ crimDraft: { ...state.crimDraft, ...updates } })),
      resetCrimDraft: () => set({ crimDraft: { ...DEFAULT_CRIMINAL_FORM } }),

      vicDraft: { ...DEFAULT_VICTIM_FORM },
      setVicDraft: (updates) =>
        set((state) => ({ vicDraft: { ...state.vicDraft, ...updates } })),
      resetVicDraft: () => set({ vicDraft: { ...DEFAULT_VICTIM_FORM } }),

      incDraft: { ...DEFAULT_INCIDENT_FORM },
      setIncDraft: (updates) =>
        set((state) => ({ incDraft: { ...state.incDraft, ...updates } })),
      resetIncDraft: () => set({ incDraft: { ...DEFAULT_INCIDENT_FORM } }),

      clearAllDrafts: () =>
        set({
          crimDraft: { ...DEFAULT_CRIMINAL_FORM },
          vicDraft: { ...DEFAULT_VICTIM_FORM },
          incDraft: { ...DEFAULT_INCIDENT_FORM },
          step: 1,
          uploadMode: 'manual',
        }),

      hasDraft: () => {
        const { crimDraft, vicDraft, recordType } = get();
        if (recordType === 'criminal') {
          return crimDraft.full_name !== '' || crimDraft.date !== '';
        }
        return vicDraft.full_name !== '' || vicDraft.incident_date !== '';
      },
    }),
    {
      name: 'crimepulse_form_drafts',
      storage: createJSONStorage(() => {
        try { return localStorage; } catch {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
      }),
      partialize: (state) => ({
        recordType: state.recordType,
        uploadMode: state.uploadMode,
        step: state.step,
        crimDraft: state.crimDraft,
        vicDraft: state.vicDraft,
        incDraft: state.incDraft,
      }),
      onRehydrateStorage: () => (_, error) => {
        if (error) {
          console.warn('[formDraftStore] Draft rehydration error, starting fresh:', error);
        }
      },
    }
  )
);
