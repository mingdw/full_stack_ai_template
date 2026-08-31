import { AppStatus } from '../../shared/types';

interface Props {
  status: AppStatus;
}

export function StatusBar({ status }: Props) {
  const statusColor =
    {
      idle: '#888',
      indexing: '#f0ad4e',
      ready: '#5cb85c',
      error: '#d9534f',
    }[status.indexStatus] ?? '#888';

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '6px 16px',
        background: '#0f0f1a',
        borderTop: '1px solid #0f3460',
        fontSize: 12,
        color: '#8899aa',
        alignItems: 'center',
      }}
    >
      <span>
        Index:{' '}
        <span style={{ color: statusColor, fontWeight: 600 }}>{status.indexStatus}</span>
      </span>
      <span>Documents: {status.documentsLoaded}</span>
      {status.lastActivity && (
        <span>Last activity: {new Date(status.lastActivity).toLocaleTimeString()}</span>
      )}
    </div>
  );
}
