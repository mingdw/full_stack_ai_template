/** Cross-boundary type definitions shared between main, preload, and renderer. */

export interface Document {
  id: string;
  title: string;
  filename: string;
  importedAt: string;
  size: number;
  status: 'imported' | 'indexing' | 'indexed' | 'error';
  chunks?: number;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  metadata: Record<string, string>;
}

export interface Citation {
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  excerpt: string;
}

export interface QAResponse {
  answer: string;
  citations: Citation[];
  confidence: number;
  timestamp: string;
}

export interface QAHistory {
  question: string;
  response: QAResponse;
}

export interface AppStatus {
  documentsLoaded: number;
  indexStatus: 'idle' | 'indexing' | 'ready' | 'error';
  lastActivity: string;
}

/** IPC channel names -- single source of truth. */
export const IPC_CHANNELS = {
  LIST_DOCUMENTS: 'documents:list',
  IMPORT_DOCUMENT: 'documents:import',
  PICK_AND_IMPORT: 'documents:pickAndImport',
  GET_DOCUMENT: 'documents:get',
  DELETE_DOCUMENT: 'documents:delete',

  START_INDEXING: 'indexing:start',
  GET_INDEXING_STATUS: 'indexing:status',
  GET_CHUNKS: 'indexing:chunks',

  ASK_QUESTION: 'qa:ask',
  GET_HISTORY: 'qa:history',

  GET_STATUS: 'app:status',
} as const;
