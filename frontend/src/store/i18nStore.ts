import { create } from 'zustand';
import { Locale } from '@/lib/i18n';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()((set) => ({
  locale: 'en',
  setLocale: (locale: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
    set({ locale });
  },
}));
