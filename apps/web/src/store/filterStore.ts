import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FilterState {
  district: string;
  station: string;
  dateRange: string; // '30d' | '90d' | '1y' | 'ALL'
  severity: string;  // 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'
  crimeType: string; // 'ALL' | 'THEFT' | 'ASSAULT' | 'CYBER' | etc.
  setDistrict: (district: string) => void;
  setStation: (station: string) => void;
  setDateRange: (range: string) => void;
  setSeverity: (severity: string) => void;
  setCrimeType: (crimeType: string) => void;
  resetFilters: () => void;
}

const FILTER_DEFAULTS = {
  district: 'ALL',
  station: 'ALL',
  dateRange: '90d',
  severity: 'ALL',
  crimeType: 'ALL',
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...FILTER_DEFAULTS,
      setDistrict: (district) => set({ district, station: 'ALL' }),
      setStation: (station) => set({ station }),
      setDateRange: (dateRange) => set({ dateRange }),
      setSeverity: (severity) => set({ severity }),
      setCrimeType: (crimeType) => set({ crimeType }),
      resetFilters: () => set(FILTER_DEFAULTS),
    }),
    {
      name: 'crimepulse_filters',
      storage: createJSONStorage(() => {
        // Safe storage wrapper — falls back silently if localStorage is unavailable
        try {
          return localStorage;
        } catch {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
      }),
      // Only persist the data fields, not the action functions
      partialize: (state) => ({
        district: state.district,
        station: state.station,
        dateRange: state.dateRange,
        severity: state.severity,
        crimeType: state.crimeType,
      }),
      // Validate persisted state to handle corrupted data
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('[filterStore] Failed to rehydrate from localStorage, using defaults:', error);
        }
      },
    }
  )
);
