import * as fs from 'fs';
import * as path from 'path';

export class PersistenceService {
  private dataDir: string;
  private documentsDir: string;
  private indexDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.documentsDir = path.join(dataDir, 'documents');
    this.indexDir = path.join(dataDir, 'index');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    fs.mkdirSync(this.dataDir, { recursive: true });
    fs.mkdirSync(this.documentsDir, { recursive: true });
    fs.mkdirSync(this.indexDir, { recursive: true });
  }

  readJson<T>(relativePath: string): T | null {
    const fullPath = path.join(this.dataDir, relativePath);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
  }

  writeJson<T>(relativePath: string, data: T): void {
    const fullPath = path.join(this.dataDir, relativePath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  readText(relativePath: string): string | null {
    const fullPath = path.join(this.dataDir, relativePath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath, 'utf-8');
  }

  writeText(relativePath: string, content: string): void {
    const fullPath = path.join(this.dataDir, relativePath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }

  copyFileToDocuments(sourcePath: string, filename: string): string {
    const destPath = path.join(this.documentsDir, filename);
    fs.mkdirSync(this.documentsDir, { recursive: true });
    fs.copyFileSync(sourcePath, destPath);
    return destPath;
  }

  deleteFromDocuments(filename: string): void {
    const filePath = path.join(this.documentsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  exists(relativePath: string): boolean {
    return fs.existsSync(path.join(this.dataDir, relativePath));
  }

  getDataDir(): string {
    return this.dataDir;
  }

  getDocumentsDir(): string {
    return this.documentsDir;
  }

  getIndexDir(): string {
    return this.indexDir;
  }
}
