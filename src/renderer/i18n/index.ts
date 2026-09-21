import { en } from './messages/en';
import { zhCN } from './messages/zh-CN';
import type { Locale, MessageKey, Messages } from './types';
import { LOCALE_STORAGE_KEY } from './types';

const catalogs: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  en,
};

export function isLocale(value: string): value is Locale {
  return value === 'zh-CN' || value === 'en';
}

export function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw && isLocale(raw)) {
      return raw;
    }
  } catch {
    // Ignore storage access failures in locked-down environments.
  }
  return 'zh-CN';
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage access failures.
  }
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const template = catalogs[locale][key] ?? catalogs['zh-CN'][key] ?? key;
  if (!vars) {
    return template;
  }
  return Object.entries(vars).reduce(
    (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
    template,
  );
}

export function translateError(locale: Locale, error: string | undefined, fallbackKey: MessageKey): string {
  if (!error) {
    return translate(locale, fallbackKey);
  }
  const errorKey = `error.${error}`;
  const catalog = catalogs[locale];
  if (Object.prototype.hasOwnProperty.call(catalog, errorKey)) {
    return catalog[errorKey as MessageKey];
  }
  const fallbackCatalog = catalogs['zh-CN'];
  if (Object.prototype.hasOwnProperty.call(fallbackCatalog, errorKey)) {
    return fallbackCatalog[errorKey as MessageKey];
  }
  return error;
}
