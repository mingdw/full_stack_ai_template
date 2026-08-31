import { useState, useCallback, useEffect, useRef } from 'react';
import { DocumentList } from './components/DocumentList';
import { QuestionPanel } from './components/QuestionPanel';
import { DocumentDetail } from './components/DocumentDetail';
import { StatusBar } from './components/StatusBar';
import { Document, AppStatus, QAResponse } from '../shared/types';

/** Electron extends File with an absolute path when selected via <input type="file">. */
type ElectronFile = File & { path?: string };

export function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus>({
    documentsLoaded: 0,
    indexStatus: 'idle',
    lastActivity: '',
  });
  const [lastResponse, setLastResponse] = useState<QAResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await window.knowledgeBase.documents.list();
      setDocuments(docs);
      const status = await window.knowledgeBase.indexing.status();
      setAppStatus(status);
    } catch (err) {
      console.error('Failed to refresh documents:', err);
    }
  }, []);

  useEffect(() => {
    void refreshDocuments();
  }, [refreshDocuments]);

  const importByPath = useCallback(async (filePath: string) => {
    const doc = await window.knowledgeBase.documents.import(filePath);
    await refreshDocuments();
    setSelectedDoc(doc);
    setImportError(null);
  }, [refreshDocuments]);

  /** Prefer HTML file picker (reliable on Windows); fall back to Electron dialog. */
  const handleImport = useCallback(async () => {
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }

    try {
      const filePath = await window.knowledgeBase.documents.openFileDialog();
      if (!filePath) return;
      await importByPath(filePath);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Import failed:', err);
      setImportError(`Import failed: ${message}`);
    }
  }, [importByPath]);

  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] as ElectronFile | undefined;
    // Allow selecting the same file again later
    e.target.value = '';
    if (!file) return;

    try {
      let filePath = '';
      try {
        filePath = window.knowledgeBase.documents.getPathForFile(file);
      } catch {
        filePath = file.path ?? '';
      }

      if (!filePath) {
        const selected = await window.knowledgeBase.documents.openFileDialog();
        if (!selected) {
          setImportError('No file selected.');
          return;
        }
        filePath = selected;
      }

      await importByPath(filePath);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Import failed:', err);
      setImportError(`Import failed: ${message}`);
    }
  }, [importByPath]);

  const handleSelectDocument = useCallback((doc: Document) => {
    setSelectedDoc(doc);
  }, []);

  const handleAskQuestion = useCallback(async (question: string) => {
    try {
      const response = await window.knowledgeBase.qa.ask(question);
      setLastResponse(response);
    } catch (err) {
      console.error('Q&A failed:', err);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{
        padding: '12px 20px',
        background: '#16213e',
        borderBottom: '1px solid #0f3460',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Knowledge Base</h1>
        <button
          onClick={refreshDocuments}
          style={{
            padding: '6px 14px',
            background: '#0f3460',
            color: '#e0e0e0',
            border: '1px solid #1a1a4e',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Refresh
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: '280px',
          borderRight: '1px solid #0f3460',
          display: 'flex',
          flexDirection: 'column',
          background: '#16213e',
        }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid #0f3460',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#a0a0c0' }}>
              Documents ({documents.length})
            </span>
            <button
              type="button"
              onClick={() => void handleImport()}
              style={{
                padding: '4px 10px',
                background: '#533483',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              + Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              style={{ display: 'none' }}
              onChange={e => void handleFileInputChange(e)}
            />
          </div>
          {importError && (
            <div style={{
              padding: '8px 12px',
              fontSize: '12px',
              color: '#ff8a80',
              borderBottom: '1px solid #0f3460',
            }}>
              {importError}
            </div>
          )}
          <DocumentList
            documents={documents}
            onSelect={handleSelectDocument}
            selectedId={selectedDoc?.id ?? null}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
            {selectedDoc ? (
              <DocumentDetail document={selectedDoc} />
            ) : (
              <div style={{ color: '#666', textAlign: 'center', paddingTop: '40px' }}>
                Select a document or ask a question to get started
              </div>
            )}
            {lastResponse && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: '#1a1a3e',
                borderRadius: '6px',
                border: '1px solid #0f3460',
              }}>
                <div style={{ fontSize: '14px', lineHeight: 1.6 }}>{lastResponse.answer}</div>
                {lastResponse.citations.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#8888bb' }}>
                    <strong>Citations:</strong>
                    {lastResponse.citations.map((c, i) => (
                      <div key={i} style={{ marginTop: '4px', paddingLeft: '8px', borderLeft: '2px solid #533483' }}>
                        {c.documentTitle} (chunk {c.chunkIndex}): {c.excerpt.substring(0, 100)}...
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <QuestionPanel onAsk={handleAskQuestion} />
        </div>
      </div>

      <StatusBar status={appStatus} />
    </div>
  );
}
