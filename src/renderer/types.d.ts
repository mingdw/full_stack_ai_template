import type {
  AuthResult,
  PasswordEntry,
  PasswordEntryInput,
  SetupResult,
  VaultStatus,
  WindowMode,
} from '../shared/types';

export interface VaultApi {
  auth: {
    status: () => Promise<VaultStatus>;
    setup: (password: string) => Promise<SetupResult | AuthResult>;
    login: (password: string) => Promise<AuthResult>;
    restore: (mnemonic: string, newPassword: string) => Promise<AuthResult>;
    lock: () => Promise<AuthResult>;
  };
  entries: {
    list: () => Promise<PasswordEntry[]>;
    get: (id: string) => Promise<PasswordEntry | null>;
    create: (input: PasswordEntryInput) => Promise<PasswordEntry>;
    update: (id: string, input: PasswordEntryInput) => Promise<PasswordEntry | null>;
    delete: (id: string) => Promise<boolean>;
  };
  app: {
    setLocale: (locale: string) => Promise<{ ok: boolean; locale?: string; error?: string }>;
    setWindowMode: (mode: WindowMode) => Promise<{ ok: boolean; mode?: WindowMode; error?: string }>;
    onLocaleChanged: (callback: (locale: string) => void) => () => void;
  };
}

declare global {
  interface Window {
    vault: VaultApi;
  }
}

export {};
