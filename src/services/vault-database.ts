import * as fs from 'fs';
import * as path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

export interface VaultMetaRow {
  id: number;
  password_salt: Buffer;
  password_verifier: Buffer;
  wrapped_vault_key: string;
  created_at: string;
}

export interface EntryRow {
  id: string;
  payload: string;
  created_at: string;
  updated_at: string;
}

let sqlPromise: Promise<SqlJsStatic> | null = null;

function loadSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file) => require.resolve(`sql.js/dist/${file}`),
    });
  }
  return sqlPromise;
}

/**
 * SQLite via sql.js (WASM). Avoids Electron native ABI rebuild issues with better-sqlite3.
 */
export class VaultDatabase {
  private constructor(
    private readonly dbPath: string,
    private readonly db: Database,
  ) {}

  static async open(dbPath: string): Promise<VaultDatabase> {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const SQL = await loadSql();
    const db = fs.existsSync(dbPath)
      ? new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)))
      : new SQL.Database();

    const vault = new VaultDatabase(dbPath, db);
    vault.migrate();
    vault.persist();
    return vault;
  }

  private migrate(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS vault_meta (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        password_salt BLOB NOT NULL,
        password_verifier BLOB NOT NULL,
        wrapped_vault_key TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS password_entries (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  private persist(): void {
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, Buffer.from(data));
  }

  isInitialized(): boolean {
    const result = this.db.exec('SELECT id FROM vault_meta WHERE id = 1');
    return result.length > 0 && result[0].values.length > 0;
  }

  getMeta(): VaultMetaRow | null {
    const stmt = this.db.prepare('SELECT * FROM vault_meta WHERE id = 1');
    try {
      if (!stmt.step()) {
        return null;
      }
      const row = stmt.getAsObject() as {
        id: number;
        password_salt: Uint8Array;
        password_verifier: Uint8Array;
        wrapped_vault_key: string;
        created_at: string;
      };
      return {
        id: row.id,
        password_salt: Buffer.from(row.password_salt),
        password_verifier: Buffer.from(row.password_verifier),
        wrapped_vault_key: row.wrapped_vault_key,
        created_at: row.created_at,
      };
    } finally {
      stmt.free();
    }
  }

  insertMeta(meta: Omit<VaultMetaRow, 'id'>): void {
    this.db.run(
      `INSERT INTO vault_meta (id, password_salt, password_verifier, wrapped_vault_key, created_at)
       VALUES (1, ?, ?, ?, ?)`,
      [meta.password_salt, meta.password_verifier, meta.wrapped_vault_key, meta.created_at],
    );
    this.persist();
  }

  updateWrappedKey(wrappedVaultKey: string, passwordSalt: Buffer, passwordVerifier: Buffer): void {
    this.db.run(
      `UPDATE vault_meta
       SET wrapped_vault_key = ?, password_salt = ?, password_verifier = ?
       WHERE id = 1`,
      [wrappedVaultKey, passwordSalt, passwordVerifier],
    );
    this.persist();
  }

  listEntries(): EntryRow[] {
    const stmt = this.db.prepare('SELECT * FROM password_entries ORDER BY updated_at DESC');
    const rows: EntryRow[] = [];
    try {
      while (stmt.step()) {
        const row = stmt.getAsObject() as unknown as EntryRow;
        rows.push(row);
      }
    } finally {
      stmt.free();
    }
    return rows;
  }

  getEntry(id: string): EntryRow | null {
    const stmt = this.db.prepare('SELECT * FROM password_entries WHERE id = ?');
    try {
      stmt.bind([id]);
      if (!stmt.step()) {
        return null;
      }
      return stmt.getAsObject() as unknown as EntryRow;
    } finally {
      stmt.free();
    }
  }

  upsertEntry(row: EntryRow): void {
    this.db.run(
      `INSERT INTO password_entries (id, payload, created_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at`,
      [row.id, row.payload, row.created_at, row.updated_at],
    );
    this.persist();
  }

  deleteEntry(id: string): boolean {
    this.db.run('DELETE FROM password_entries WHERE id = ?', [id]);
    const changes = this.db.getRowsModified();
    this.persist();
    return changes > 0;
  }

  close(): void {
    this.persist();
    this.db.close();
  }
}
