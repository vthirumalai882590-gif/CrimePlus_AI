import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Notification {
  id: number;
  type: 'urgent' | 'watch' | 'normal';
  text: string;
  time: string;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'urgent', text: 'Offender Ramesh Kumar spotted near prohibited zone.', time: '2 mins ago', read: false },
  { id: 2, type: 'watch', text: 'New scanned FIR upload from Belagavi PS pending validation.', time: '15 mins ago', read: false },
  { id: 3, type: 'normal', text: 'Daily beat patrol routes generated for Mysore district.', time: '1 hr ago', read: true },
  { id: 4, type: 'normal', text: 'System audit log backup completed successfully.', time: '2 hrs ago', read: true },
  { id: 5, type: 'urgent', text: 'High severity anomaly detected in Hubli station reports.', time: '4 hrs ago', read: false },
];

export interface UiPrefsState {
  // Notification state
  notifications: Notification[];
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  unreadCount: () => number;

  // Last active route (for restore on startup)
  lastRoute: string;
  setLastRoute: (route: string) => void;

  // Sidebar collapse
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Settings — cached API URL so Settings modal reflects current value
  cachedApiUrl: string;
  setCachedApiUrl: (url: string) => void;

  // Active page tab memory (e.g. AddRecord was on 'bulk' or 'manual')
  pageTabMemory: Record<string, string>;
  setPageTab: (page: string, tab: string) => void;
  getPageTab: (page: string, defaultTab: string) => string;

  // Theme support
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUiPrefsStore = create<UiPrefsState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,

      lastRoute: '/',
      setLastRoute: (route) => set({ lastRoute: route }),

      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      cachedApiUrl: localStorage.getItem('CRIMEPULSE_API_URL') || '',
      setCachedApiUrl: (url) => {
        if (url.trim() === '') {
          localStorage.removeItem('CRIMEPULSE_API_URL');
        } else {
          localStorage.setItem('CRIMEPULSE_API_URL', url.trim());
        }
        set({ cachedApiUrl: url.trim() });
      },

      pageTabMemory: {},
      setPageTab: (page, tab) =>
        set((state) => ({
          pageTabMemory: { ...state.pageTabMemory, [page]: tab },
        })),
      getPageTab: (page, defaultTab) => get().pageTabMemory[page] ?? defaultTab,

      theme: 'dark',
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        set({ theme: nextTheme });
      }
    }),
    {
      name: 'crimepulse_ui_prefs',
      storage: createJSONStorage(() => {
        try { return localStorage; } catch {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
      }),
      partialize: (state) => ({
        notifications: state.notifications,
        lastRoute: state.lastRoute,
        sidebarCollapsed: state.sidebarCollapsed,
        cachedApiUrl: state.cachedApiUrl,
        pageTabMemory: state.pageTabMemory,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme immediately after rehydration finishes
        if (state && state.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
