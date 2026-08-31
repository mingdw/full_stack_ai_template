import { QAResponse, QAHistory, Citation } from '../shared/types';
import { PersistenceService } from './persistence-service';
import { IndexingService } from './indexing-service';

const QA_HISTORY_FILE = 'qa-history.json';

const MOCK_PATTERNS: Array<{
  keywords: string[];
  answer: string;
}> = [
  {
    keywords: ['design', 'architecture', 'pattern', '架构'],
    answer:
      'The system uses a layered architecture with clear boundaries between the main process, preload scripts, and renderer. Each layer communicates through typed IPC channels, and the services layer handles business logic independently of the UI.',
  },
  {
    keywords: ['import', 'document', 'file', '导入'],
    answer:
      'Documents are imported by copying the source file to the local data directory. The system extracts text content and creates metadata including title, filename, size, and import timestamp. After import, documents can be indexed for search.',
  },
  {
    keywords: ['index', 'chunk', 'search', '索引'],
    answer:
      'The indexing pipeline splits documents into chunks of approximately 500 characters at paragraph boundaries. Each chunk includes metadata like character count and word count. The index enables grounded Q&A with citations pointing to specific document sections.',
  },
  {
    keywords: ['retrieval', 'query', '问答'],
    answer:
      'Retrieval works by matching query keywords against indexed chunks. The system ranks chunks by keyword overlap and returns the most relevant excerpts as citations alongside the generated answer.',
  },
];

export class QaService {
  private persistence: PersistenceService;
  private indexingService: IndexingService;

  constructor(persistence: PersistenceService, indexingService: IndexingService) {
    this.persistence = persistence;
    this.indexingService = indexingService;
  }

  async ask(question: string): Promise<QAResponse> {
    await new Promise((resolve) => setTimeout(resolve, 120));

    const chunks = this.indexingService.getAllChunks();
    const citations: Citation[] = [];

    if (chunks.length > 0) {
      const questionWords = question
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 1);

      const scored = chunks.map((chunk) => {
        const contentLower = chunk.content.toLowerCase();
        const score = questionWords.reduce(
          (acc, word) => acc + (contentLower.includes(word) ? 1 : 0),
          0
        );
        return { chunk, score };
      });

      const relevant = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      const docs =
        this.persistence.readJson<Array<{ id: string; title: string }>>('documents-meta.json') ??
        [];

      for (const { chunk } of relevant) {
        const doc = docs.find((d) => d.id === chunk.documentId);
        citations.push({
          documentId: chunk.documentId,
          documentTitle: doc?.title ?? 'Unknown Document',
          chunkIndex: chunk.index,
          excerpt: chunk.content.substring(0, 200),
        });
      }
    }

    const answer = this.generateAnswer(question, citations);

    const response: QAResponse = {
      answer,
      citations,
      confidence: citations.length > 0 ? 0.85 : 0.3,
      timestamp: new Date().toISOString(),
    };

    this.saveToHistory(question, response);
    return response;
  }

  getHistory(): QAHistory[] {
    return this.persistence.readJson<QAHistory[]>(QA_HISTORY_FILE) ?? [];
  }

  private generateAnswer(question: string, citations: Citation[]): string {
    const questionLower = question.toLowerCase();

    for (const pattern of MOCK_PATTERNS) {
      if (pattern.keywords.some((kw) => questionLower.includes(kw))) {
        if (citations.length > 0) {
          return `${pattern.answer} Based on "${citations[0].documentTitle}": ${citations[0].excerpt.substring(0, 100)}.`;
        }
        return pattern.answer;
      }
    }

    if (citations.length > 0) {
      return `Based on "${citations[0].documentTitle}": ${citations[0].excerpt.substring(0, 150)}.`;
    }

    return 'No relevant documents have been indexed yet. Please import and index documents before asking questions.';
  }

  private saveToHistory(question: string, response: QAResponse): void {
    const history = this.getHistory();
    history.push({ question, response });
    this.persistence.writeJson(QA_HISTORY_FILE, history);
  }
}
