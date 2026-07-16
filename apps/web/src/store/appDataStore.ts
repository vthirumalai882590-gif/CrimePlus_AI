import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Maximum age of cached data before it's considered stale (5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface CachedDataEntry<T> {
  data: T;
  cachedAt: number; // unix timestamp ms
}

function isFresh<T>(entry: CachedDataEntry<T> | null): boolean {
  if (!entry) return false;
  return Date.now() - entry.cachedAt < CACHE_TTL_MS;
}

export interface AppDataState {
  // Dashboard summary data
  incidentsSummary: CachedDataEntry<any[]> | null;
  setIncidentsSummary: (data: any[]) => void;
  getIncidentsSummary: () => any[] | null;

  // Alerts / anomalies
  alertsData: CachedDataEntry<any[]> | null;
  setAlertsData: (data: any[]) => void;
  getAlertsData: () => any[] | null;

  // Hotspot data
  hotspotData: CachedDataEntry<any[]> | null;
  setHotspotData: (data: any[]) => void;
  getHotspotData: () => any[] | null;

  // Offenders list
  offendersData: CachedDataEntry<any[]> | null;
  setOffendersData: (data: any[]) => void;
  getOffendersData: () => any[] | null;

  // Patrol data
  patrolData: CachedDataEntry<any[]> | null;
  setPatrolData: (data: any[]) => void;
  getPatrolData: () => any[] | null;

  // Festival data
  festivalData: CachedDataEntry<any[]> | null;
  setFestivalData: (data: any[]) => void;
  getFestivalData: () => any[] | null;

  // Last global sync time
  lastSyncedAt: number | null;
  markSynced: () => void;

  // Clear all caches (e.g. after logout)
  clearAll: () => void;
}

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set, get) => ({
      incidentsSummary: null,
      setIncidentsSummary: (data) => set({ incidentsSummary: { data, cachedAt: Date.now() } }),
      getIncidentsSummary: () => {
        const entry = get().incidentsSummary;
        return isFresh(entry) ? entry!.data : null;
      },

      alertsData: null,
      setAlertsData: (data) => set({ alertsData: { data, cachedAt: Date.now() } }),
      getAlertsData: () => {
        const entry = get().alertsData;
        return isFresh(entry) ? entry!.data : null;
      },

      hotspotData: null,
      setHotspotData: (data) => set({ hotspotData: { data, cachedAt: Date.now() } }),
      getHotspotData: () => {
        const entry = get().hotspotData;
        return isFresh(entry) ? entry!.data : null;
      },

      offendersData: null,
      setOffendersData: (data) => set({ offendersData: { data, cachedAt: Date.now() } }),
      getOffendersData: () => {
        const entry = get().offendersData;
        return isFresh(entry) ? entry!.data : null;
      },

      patrolData: null,
      setPatrolData: (data) => set({ patrolData: { data, cachedAt: Date.now() } }),
      getPatrolData: () => {
        const entry = get().patrolData;
        return isFresh(entry) ? entry!.data : null;
      },

      festivalData: null,
      setFestivalData: (data) => set({ festivalData: { data, cachedAt: Date.now() } }),
      getFestivalData: () => {
        const entry = get().festivalData;
        return isFresh(entry) ? entry!.data : null;
      },

      lastSyncedAt: null,
      markSynced: () => set({ lastSyncedAt: Date.now() }),

      clearAll: () =>
        set({
          incidentsSummary: null,
          alertsData: null,
          hotspotData: null,
          offendersData: null,
          patrolData: null,
          festivalData: null,
          lastSyncedAt: null,
        }),
    }),
    {
      name: 'crimepulse_app_data',
      storage: createJSONStorage(() => {
        try { return localStorage; } catch {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
      }),
      partialize: (state) => ({
        incidentsSummary: state.incidentsSummary,
        alertsData: state.alertsData,
        hotspotData: state.hotspotData,
        offendersData: state.offendersData,
        patrolData: state.patrolData,
        festivalData: state.festivalData,
        lastSyncedAt: state.lastSyncedAt,
      }),
      onRehydrateStorage: () => (_, error) => {
        if (error) {
          console.warn('[appDataStore] Cache rehydration error, starting fresh:', error);
        }
      },
    }
  )
);
