import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth-service';
import {
  decryptUtf8,
  encryptUtf8,
  generateMnemonic,
  validateMnemonic,
  vaultKeyFromMnemonic,
} from './crypto';
import { EntryService } from './entry-service';
import { VaultDatabase } from './vault-database';

const openDbs: VaultDatabase[] = [];
const tempDirs: string[] = [];

async function tempDb(): Promise<VaultDatabase> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-test-'));
  tempDirs.push(dir);
  const db = await VaultDatabase.open(path.join(dir, 'vault.db'));
  openDbs.push(db);
  return db;
}

afterEach(() => {
  while (openDbs.length > 0) {
    const db = openDbs.pop();
    db?.close();
  }
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        // Windows may briefly lock files; ignore cleanup races in tests.
      }
    }
  }
});

describe('crypto', () => {
  it('generates a valid mnemonic and round-trips encryption', () => {
    const mnemonic = generateMnemonic();
    expect(validateMnemonic(mnemonic)).toBe(true);
    const key = vaultKeyFromMnemonic(mnemonic);
    const payload = encryptUtf8('secret-value', key);
    expect(decryptUtf8(payload, key)).toBe('secret-value');
  });
});

describe('vault-setup', () => {
  it('creates vault meta, unlocks session, and exposes mnemonic once', async () => {
    const db = await tempDb();
    const auth = new AuthService(db);
    expect(auth.getStatus()).toEqual({ initialized: false, unlocked: false });

    const result = auth.setup('master-pass-123');
    expect(result.ok).toBe(true);
    if (!result.ok || !('mnemonic' in result)) {
      throw new Error('expected setup success');
    }
    expect(validateMnemonic(result.mnemonic)).toBe(true);
    expect(auth.getStatus()).toEqual({ initialized: true, unlocked: true });
    expect(auth.getVaultKey()).not.toBeNull();

    const again = auth.setup('another-pass-123');
    expect(again.ok).toBe(false);
  });

  it('rejects short passwords', async () => {
    const auth = new AuthService(await tempDb());
    const result = auth.setup('short');
    expect(result).toEqual({ ok: false, error: 'Password must be at least 8 characters' });
  });
});

describe('login and entries scaffold', () => {
  it('logs in with password and supports entry CRUD after unlock', async () => {
    const db = await tempDb();
    const auth = new AuthService(db);
    const entries = new EntryService(db);
    const setup = auth.setup('master-pass-123');
    if (!setup.ok || !('mnemonic' in setup)) {
      throw new Error('setup failed');
    }

    auth.lock();
    expect(auth.login('wrong-password').ok).toBe(false);
    expect(auth.login('master-pass-123').ok).toBe(true);

    const key = auth.getVaultKey();
    expect(key).not.toBeNull();
    if (!key) {
      throw new Error('missing key');
    }

    const created = entries.create(
      {
        title: 'GitHub',
        username: 'me',
        password: 'p@ss',
        url: 'https://github.com',
        notes: '',
      },
      key,
    );
    expect(entries.list(key)).toHaveLength(1);
    expect(entries.get(created.id, key)?.title).toBe('GitHub');
    entries.update(
      created.id,
      {
        title: created.title,
        username: created.username,
        password: 'new-pass',
        url: created.url,
        notes: created.notes,
      },
      key,
    );
    expect(entries.get(created.id, key)?.password).toBe('new-pass');
    expect(entries.delete(created.id)).toBe(true);
  });

  it('restores vault key from mnemonic and sets a new password', async () => {
    const db = await tempDb();
    const auth = new AuthService(db);
    const setup = auth.setup('master-pass-123');
    if (!setup.ok || !('mnemonic' in setup)) {
      throw new Error('setup failed');
    }
    const mnemonic = setup.mnemonic;
    auth.lock();

    expect(auth.restore(mnemonic, 'replacement-pass-99').ok).toBe(true);
    auth.lock();
    expect(auth.login('master-pass-123').ok).toBe(false);
    expect(auth.login('replacement-pass-99').ok).toBe(true);
  });
});
