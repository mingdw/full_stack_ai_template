import { v4 as uuidv4 } from 'uuid';
import { PasswordEntry, PasswordEntryInput } from '../shared/types';
import { decryptUtf8, encryptUtf8 } from './crypto';
import { VaultDatabase } from './vault-database';

export class EntryService {
  constructor(private readonly db: VaultDatabase) {}

  list(vaultKey: Buffer): PasswordEntry[] {
    return this.db.listEntries().map((row) => this.decryptRow(row.payload, vaultKey));
  }

  get(id: string, vaultKey: Buffer): PasswordEntry | null {
    const row = this.db.getEntry(id);
    if (!row) {
      return null;
    }
    return this.decryptRow(row.payload, vaultKey);
  }

  create(input: PasswordEntryInput, vaultKey: Buffer): PasswordEntry {
    const now = new Date().toISOString();
    const entry: PasswordEntry = {
      id: uuidv4(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.db.upsertEntry({
      id: entry.id,
      payload: encryptUtf8(JSON.stringify(entry), vaultKey),
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    });
    return entry;
  }

  update(id: string, input: PasswordEntryInput, vaultKey: Buffer): PasswordEntry | null {
    const existing = this.get(id, vaultKey);
    if (!existing) {
      return null;
    }
    const updated: PasswordEntry = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.db.upsertEntry({
      id: updated.id,
      payload: encryptUtf8(JSON.stringify(updated), vaultKey),
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
    });
    return updated;
  }

  delete(id: string): boolean {
    return this.db.deleteEntry(id);
  }

  private decryptRow(payload: string, vaultKey: Buffer): PasswordEntry {
    return JSON.parse(decryptUtf8(payload, vaultKey)) as PasswordEntry;
  }
}
