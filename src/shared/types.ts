/** Shared types and IPC channel constants for the password vault. */

export interface VaultStatus {
  initialized: boolean;
  unlocked: boolean;
}

export interface SetupResult {
  ok: true;
  mnemonic: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type PasswordEntryInput = Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>;

/** Browser window presentation: compact auth vs full main shell. */
export type WindowMode = 'auth' | 'main';

export const IPC_CHANNELS = {
  AUTH_STATUS: 'auth:status',
  AUTH_SETUP: 'auth:setup',
  AUTH_LOGIN: 'auth:login',
  AUTH_RESTORE: 'auth:restore',
  AUTH_LOCK: 'auth:lock',
  ENTRIES_LIST: 'entries:list',
  ENTRIES_GET: 'entries:get',
  ENTRIES_CREATE: 'entries:create',
  ENTRIES_UPDATE: 'entries:update',
  ENTRIES_DELETE: 'entries:delete',
  APP_SET_LOCALE: 'app:set-locale',
  APP_LOCALE_CHANGED: 'app:locale-changed',
  APP_SET_WINDOW_MODE: 'app:set-window-mode',
} as const;
