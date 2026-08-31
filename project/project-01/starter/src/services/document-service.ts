import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Document } from '../shared/types';
import { PersistenceService } from './persistence-service';

const DOCUMENTS_META = 'documents-meta.json';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class DocumentService {
  private persistence: PersistenceService;

  constructor(persistence: PersistenceService) {
    this.persistence = persistence;
  }

  listDocuments(): Document[] {
    return this.persistence.readJson<Document[]>(DOCUMENTS_META) ?? [];
  }

  importDocument(filePath: string): Document {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.txt' && ext !== '.md') {
      throw new Error(`Unsupported format: ${ext}. Only .txt and .md are allowed.`);
    }

    const stats = fs.statSync(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error('File exceeds the 10 MB size limit.');
    }

    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');

    const doc: Document = {
      id: uuidv4(),
      title: filename.replace(/\.[^.]+$/, ''),
      filename,
      importedAt: new Date().toISOString(),
      size: stats.size,
      status: 'imported',
    };

    this.persistence.copyFileToDocuments(filePath, `${doc.id}-${filename}`);
    this.persistence.writeText(`content/${doc.id}.txt`, content);

    const docs = this.listDocuments();
    docs.push(doc);
    this.persistence.writeJson(DOCUMENTS_META, docs);

    return doc;
  }

  getDocument(id: string): Document | null {
    return this.listDocuments().find((d) => d.id === id) ?? null;
  }

  getDocumentContent(id: string): string | null {
    return this.persistence.readText(`content/${id}.txt`);
  }

  updateDocument(id: string, updates: Partial<Document>): Document | null {
    const docs = this.listDocuments();
    const index = docs.findIndex((d) => d.id === id);
    if (index === -1) return null;

    docs[index] = { ...docs[index], ...updates };
    this.persistence.writeJson(DOCUMENTS_META, docs);
    return docs[index];
  }

  deleteDocument(id: string): boolean {
    const docs = this.listDocuments();
    const doc = docs.find((d) => d.id === id);
    if (!doc) return false;

    const storedName = `${doc.id}-${doc.filename}`;
    this.persistence.deleteFromDocuments(storedName);
    const contentPath = path.join(this.persistence.getDataDir(), 'content', `${id}.txt`);
    if (fs.existsSync(contentPath)) {
      fs.unlinkSync(contentPath);
    }

    this.persistence.writeJson(
      DOCUMENTS_META,
      docs.filter((d) => d.id !== id)
    );
    return true;
  }
}
