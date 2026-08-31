import { v4 as uuidv4 } from 'uuid';
import { Chunk, Document } from '../shared/types';
import { PersistenceService } from './persistence-service';
import { DocumentService } from './document-service';

const INDEX_META = 'index-meta.json';
const CHUNKS_DIR = 'chunks';

export interface IndexStatus {
  status: 'idle' | 'indexing' | 'ready' | 'error';
  currentIndexed: number;
  totalDocuments: number;
  lastIndexed: string | null;
}

export class IndexingService {
  private persistence: PersistenceService;
  private documentService: DocumentService;

  constructor(persistence: PersistenceService, documentService: DocumentService) {
    this.persistence = persistence;
    this.documentService = documentService;
  }

  async startIndexing(documentId?: string): Promise<IndexStatus> {
    if (documentId) {
      const content = this.persistence.readText(`content/${documentId}.txt`);
      if (!content) {
        return { ...this.getStatus(), status: 'error' };
      }

      const chunks = this.chunkDocument(documentId, content);
      this.persistence.writeJson(`${CHUNKS_DIR}/${documentId}.json`, chunks);

      const chunksMeta = this.persistence.readJson<Record<string, string[]>>(INDEX_META) ?? {};
      chunksMeta[documentId] = chunks.map((c) => c.id);
      this.persistence.writeJson(INDEX_META, chunksMeta);

      this.documentService.updateDocument(documentId, {
        status: 'indexed',
        chunks: chunks.length,
      });

      return this.getStatus();
    }

    const docs = this.persistence.readJson<Document[]>('documents-meta.json') ?? [];
    const chunksMeta = this.persistence.readJson<Record<string, string[]>>(INDEX_META) ?? {};

    for (const doc of docs) {
      if (chunksMeta[doc.id]) continue;

      const content = this.persistence.readText(`content/${doc.id}.txt`);
      if (!content) continue;

      const chunks = this.chunkDocument(doc.id, content);
      this.persistence.writeJson(`${CHUNKS_DIR}/${doc.id}.json`, chunks);
      chunksMeta[doc.id] = chunks.map((c) => c.id);
      this.documentService.updateDocument(doc.id, {
        status: 'indexed',
        chunks: chunks.length,
      });
    }

    this.persistence.writeJson(INDEX_META, chunksMeta);
    return this.getStatus();
  }

  getStatus(): IndexStatus {
    const docs = this.persistence.readJson<Document[]>('documents-meta.json') ?? [];
    const chunksMeta = this.persistence.readJson<Record<string, string[]>>(INDEX_META) ?? {};

    const currentIndexed = Object.keys(chunksMeta).length;
    const totalDocuments = docs.length;
    const isReady = currentIndexed === totalDocuments && totalDocuments > 0;

    return {
      status: isReady ? 'ready' : currentIndexed > 0 ? 'indexing' : 'idle',
      currentIndexed,
      totalDocuments,
      lastIndexed: new Date().toISOString(),
    };
  }

  getChunksForDocument(documentId: string): Chunk[] {
    return this.persistence.readJson<Chunk[]>(`${CHUNKS_DIR}/${documentId}.json`) ?? [];
  }

  getAllChunks(): Chunk[] {
    const chunksMeta = this.persistence.readJson<Record<string, string[]>>(INDEX_META) ?? {};
    const allChunks: Chunk[] = [];

    for (const docId of Object.keys(chunksMeta)) {
      allChunks.push(...this.getChunksForDocument(docId));
    }

    return allChunks;
  }

  private chunkDocument(documentId: string, content: string): Chunk[] {
    const CHUNK_SIZE = 500;
    const chunks: Chunk[] = [];
    const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    let buffer = '';
    let chunkIndex = 0;

    for (const para of paragraphs) {
      if (buffer.length + para.length > CHUNK_SIZE && buffer.length > 0) {
        chunks.push(this.createChunk(documentId, chunkIndex++, buffer.trim()));
        buffer = para;
      } else {
        buffer += (buffer ? '\n\n' : '') + para;
      }
    }

    if (buffer.trim()) {
      chunks.push(this.createChunk(documentId, chunkIndex, buffer.trim()));
    }

    // Fallback: single chunk if no paragraph breaks
    if (chunks.length === 0 && content.trim()) {
      chunks.push(this.createChunk(documentId, 0, content.trim()));
    }

    return chunks;
  }

  private createChunk(documentId: string, index: number, content: string): Chunk {
    return {
      id: uuidv4(),
      documentId,
      content,
      index,
      metadata: {
        charCount: String(content.length),
        wordCount: String(content.split(/\s+/).filter(Boolean).length),
      },
    };
  }
}
