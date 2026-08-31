import { useState, useCallback, useEffect } from 'react';
import { DocumentList } from './components/DocumentList';
import { QuestionPanel } from './components/QuestionPanel';
import { DocumentDetail } from './components/DocumentDetail';
import { StatusBar } from './components/StatusBar';
import { Document, AppStatus, QAResponse } from '../shared/types';

export function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus>({
    documentsLoaded: 0,
    indexStatus: 'idle',
    lastActivity: '',
  });
  const [lastResponse, setLastResponse] = useState<QAResponse | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const docs = await window.knowledgeBase.documents.list();
      setDocuments(docs);
      const status = await window.knowledgeBase.indexing.status();
      setAppStatus(status);
      setSelectedDoc((prev) => {
        if (!prev) return null;
        return docs.find((d) => d.id === prev.id) ?? null;
      });
      setError(null);
    } catch (err) {
      console.error('Failed to refresh:', err);
      setError(err instanceof Error ? err.message : 'Refresh failed');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleImport = useCallback(async () => {
    try {
      const doc = await window.knowledgeBase.documents.pickAndImport();
      if (doc) {
        await refresh();
        setSelectedDoc(doc);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    }
  }, [refresh]);

  const handleAskQuestion = useCallback(async (question: string) => {
    setAsking(true);
    setError(null);
    try {
      const response = await window.knowledgeBase.qa.ask(question);
      setLastResponse(response);
      const status = await window.knowledgeBase.indexing.status();
      setAppStatus(status);
    } catch (err) {
      console.error('Q&A failed:', err);
      setError(err instanceof Error ? err.message : 'Q&A failed');
    } finally {
      setAsking(false);
    }
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      await window.knowledgeBase.documents.delete(id);
      setSelectedDoc(null);
      await refresh();
    },
    [refresh]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#16213e',
          borderBottom: '1px solid #0f3460',
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Knowledge Base</h1>
        <button
          onClick={() => void refresh()}
          style={{
            padding: '6px 14px',
            background: '#0f3460',
            color: '#e0e0e0',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Refresh
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside
          style={{
            width: 260,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #0f3460',
            background: '#1a1a2e',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #0f3460',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              Documents ({documents.length})
            </span>
            <button
              onClick={() => void handleImport()}
              style={{
                padding: '4px 10px',
                background: '#533483',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              + Import
            </button>
          </div>
          <DocumentList
            documents={documents}
            onSelect={setSelectedDoc}
            selectedId={selectedDoc?.id ?? null}
          />
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selectedDoc ? (
              <DocumentDetail
                document={selectedDoc}
                onIndexed={() => void refresh()}
                onDelete={(id) => void handleDelete(id)}
              />
            ) : (
              <div
                style={{
                  padding: 40,
                  color: '#8899aa',
                  textAlign: 'center',
                  marginTop: 60,
                }}
              >
                Select a document or ask a question to get started
              </div>
            )}

            {error && (
              <div style={{ padding: '0 20px 12px', color: '#d9534f', fontSize: 13 }}>
                {error}
              </div>
            )}

            {lastResponse && (
              <div
                style={{
                  margin: '0 20px 20px',
                  padding: 16,
                  background: '#16213e',
                  borderRadius: 8,
                  border: '1px solid #0f3460',
                }}
              >
                <div style={{ fontSize: 12, color: '#8899aa', marginBottom: 8 }}>
                  Answer · confidence {(lastResponse.confidence * 100).toFixed(0)}%
                </div>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>{lastResponse.answer}</p>
                {lastResponse.citations.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: '#8899aa', marginBottom: 6 }}>
                      Citations:
                    </div>
                    {lastResponse.citations.map((c, i) => (
                      <div
                        key={`${c.documentId}-${c.chunkIndex}-${i}`}
                        style={{
                          fontSize: 12,
                          color: '#aab',
                          padding: '6px 0',
                          borderTop: '1px solid #0f3460',
                        }}
                      >
                        <strong>{c.documentTitle}</strong> (chunk {c.chunkIndex}):{' '}
                        {c.excerpt.substring(0, 100)}
                        {c.excerpt.length > 100 ? '…' : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <QuestionPanel onAsk={(q) => void handleAskQuestion(q)} disabled={asking} />
        </main>
      </div>

      <StatusBar status={appStatus} />
    </div>
  );
}
