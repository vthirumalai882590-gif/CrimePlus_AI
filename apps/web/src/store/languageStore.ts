import { create } from 'zustand';
import en from '../i18n/en.json';
import kn from '../i18n/kn.json';

export type Language = 'en' | 'kn';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const translations = {
  en: en as Record<string, string>,
  kn: kn as Record<string, string>
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: (localStorage.getItem('crimepulse_lang') as Language) || 'en',
  setLanguage: (language) => {
    set({ language });
    localStorage.setItem('crimepulse_lang', language);
  },
  t: (key, replacements) => {
    const lang = get().language;
    const dict = translations[lang];
    let text = dict[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replaceAll(`{${k}}`, String(v));
      });
    }
    return text;
  }
}));
