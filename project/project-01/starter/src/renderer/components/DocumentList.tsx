import { Document } from '../../shared/types';

interface Props {
  documents: Document[];
  onSelect: (doc: Document) => void;
  selectedId: string | null;
}

export function DocumentList({ documents, onSelect, selectedId }: Props) {
  if (documents.length === 0) {
    return (
      <div style={{ padding: '24px 16px', color: '#8899aa', textAlign: 'center' }}>
        <p style={{ marginBottom: 8 }}>No documents imported yet.</p>
        <p style={{ fontSize: 13 }}>Import documents to get started.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {documents.map((doc) => (
        <div
          key={doc.id}
          onClick={() => onSelect(doc)}
          style={{
            padding: '10px 16px',
            cursor: 'pointer',
            borderBottom: '1px solid #0f3460',
            background: selectedId === doc.id ? '#0f3460' : 'transparent',
            transition: 'background 0.15s',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{doc.title}</div>
          <div style={{ fontSize: 12, color: '#8899aa' }}>
            {doc.status === 'indexed' ? '✓ ' : ''}
            {(doc.size / 1024).toFixed(1)} KB · {doc.status}
          </div>
        </div>
      ))}
    </div>
  );
}
