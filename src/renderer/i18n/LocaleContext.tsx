import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isLocale, persistLocale, readStoredLocale, translate, translateError } from './index';
import type { Locale, MessageKey } from './types';
import { SUPPORTED_LOCALES } from './types';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  te: (error: string | undefined, fallbackKey: MessageKey) => string;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, 'app.name');
    void window.vault?.app.setLocale(locale);
  }, [locale]);

  useEffect(() => {
    if (!window.vault?.app?.onLocaleChanged) {
      return;
    }
    return window.vault.app.onLocaleChanged((next) => {
      if (!isLocale(next) || next === locale) {
        return;
      }
      setLocaleState(next);
      persistLocale(next);
    });
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    function setLocale(next: Locale) {
      setLocaleState(next);
      persistLocale(next);
    }

    return {
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
      te: (error, fallbackKey) => translateError(locale, error, fallbackKey),
      supportedLocales: SUPPORTED_LOCALES,
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
