import { useEffect, useState, type CSSProperties } from 'react';
import { Document, Chunk } from '../../shared/types';

interface Props {
  document: Document;
  onIndexed: () => void;
  onDelete: (id: string) => void;
}

export function DocumentDetail({ document, onIndexed, onDelete }: Props) {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [showChunks, setShowChunks] = useState(false);
  const [indexing, setIndexing] = useState(false);

  useEffect(() => {
    window.knowledgeBase.indexing.chunks(document.id).then(setChunks);
  }, [document.id, document.status]);

  const handleIndex = async () => {
    setIndexing(true);
    try {
      await window.knowledgeBase.indexing.start(document.id);
      onIndexed();
    } finally {
      setIndexing(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 12, fontSize: 20 }}>{document.title}</h2>
      <div style={{ fontSize: 13, color: '#8899aa', lineHeight: 1.8, marginBottom: 16 }}>
        <div>Filename: {document.filename}</div>
        <div>Imported: {new Date(document.importedAt).toLocaleString()}</div>
        <div>Size: {(document.size / 1024).toFixed(1)} KB</div>
        <div>Status: {document.status}</div>
        {document.chunks !== undefined && <div>Chunks: {document.chunks}</div>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setShowChunks(!showChunks)}
          style={btnStyle('#0f3460')}
        >
          {showChunks ? 'Hide' : 'Show'} Chunks ({chunks.length})
        </button>
        {document.status !== 'indexed' && (
          <button onClick={handleIndex} disabled={indexing} style={btnStyle('#533483')}>
            {indexing ? 'Indexing…' : 'Index Document'}
          </button>
        )}
        <button onClick={() => onDelete(document.id)} style={btnStyle('#6b2d3c')}>
          Delete
        </button>
      </div>

      {showChunks && (
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {chunks.length === 0 ? (
            <p style={{ color: '#8899aa' }}>No chunks yet. Index this document first.</p>
          ) : (
            chunks.map((chunk) => (
              <div
                key={chunk.id}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  background: '#16213e',
                  borderRadius: 6,
                  border: '1px solid #0f3460',
                }}
              >
                <div style={{ fontSize: 12, color: '#8899aa', marginBottom: 6 }}>
                  Chunk {chunk.index} ({chunk.metadata.charCount} chars)
                </div>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {chunk.content}
                </pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function btnStyle(bg: string): CSSProperties {
  return {
    padding: '6px 12px',
    background: bg,
    color: '#e0e0e0',
    border: '1px solid #1a1a4e',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
  };
}
