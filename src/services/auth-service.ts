import {
  AuthResult,
  SetupResult,
  VaultStatus,
} from '../shared/types';
import {
  derivePasswordKey,
  derivePasswordVerifier,
  encryptUtf8,
  decryptUtf8,
  generateMnemonic,
  normalizeMnemonic,
  randomSalt,
  timingSafeEqual,
  validateMnemonic,
  vaultKeyFromMnemonic,
} from './crypto';
import { VaultDatabase } from './vault-database';

export class AuthService {
  private vaultKey: Buffer | null = null;

  constructor(private readonly db: VaultDatabase) {}

  getStatus(): VaultStatus {
    return {
      initialized: this.db.isInitialized(),
      unlocked: this.vaultKey !== null,
    };
  }

  getVaultKey(): Buffer | null {
    return this.vaultKey;
  }

  setup(password: string): SetupResult | AuthResult {
    if (this.db.isInitialized()) {
      return { ok: false, error: 'Vault already initialized' };
    }
    if (password.length < 8) {
      return { ok: false, error: 'Password must be at least 8 characters' };
    }

    const mnemonic = generateMnemonic();
    const vaultKey = vaultKeyFromMnemonic(mnemonic);
    const salt = randomSalt();
    const verifier = derivePasswordVerifier(password, salt);
    const passwordKey = derivePasswordKey(password, salt);
    const wrappedVaultKey = encryptUtf8(vaultKey.toString('base64'), passwordKey);

    this.db.insertMeta({
      password_salt: salt,
      password_verifier: verifier,
      wrapped_vault_key: wrappedVaultKey,
      created_at: new Date().toISOString(),
    });

    this.vaultKey = vaultKey;
    return { ok: true, mnemonic };
  }

  login(password: string): AuthResult {
    const meta = this.db.getMeta();
    if (!meta) {
      return { ok: false, error: 'Vault not initialized' };
    }

    const verifier = derivePasswordVerifier(password, meta.password_salt);
    if (!timingSafeEqual(verifier, meta.password_verifier)) {
      return { ok: false, error: 'Incorrect password' };
    }

    try {
      const passwordKey = derivePasswordKey(password, meta.password_salt);
      const vaultKeyB64 = decryptUtf8(meta.wrapped_vault_key, passwordKey);
      this.vaultKey = Buffer.from(vaultKeyB64, 'base64');
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to unlock vault' };
    }
  }

  restore(mnemonic: string, newPassword: string): AuthResult {
    if (!validateMnemonic(mnemonic)) {
      return { ok: false, error: 'Invalid mnemonic' };
    }
    if (newPassword.length < 8) {
      return { ok: false, error: 'Password must be at least 8 characters' };
    }
    if (!this.db.isInitialized()) {
      return { ok: false, error: 'Vault not initialized' };
    }

    const vaultKey = vaultKeyFromMnemonic(normalizeMnemonic(mnemonic));
    const salt = randomSalt();
    const verifier = derivePasswordVerifier(newPassword, salt);
    const passwordKey = derivePasswordKey(newPassword, salt);
    const wrappedVaultKey = encryptUtf8(vaultKey.toString('base64'), passwordKey);

    this.db.updateWrappedKey(wrappedVaultKey, salt, verifier);
    this.vaultKey = vaultKey;
    return { ok: true };
  }

  lock(): void {
    this.vaultKey = null;
  }
}
