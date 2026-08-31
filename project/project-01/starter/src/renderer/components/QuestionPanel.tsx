import { useState } from 'react';

interface Props {
  onAsk: (question: string) => void;
  disabled?: boolean;
}

export function QuestionPanel({ onAsk, disabled }: Props) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || disabled) return;
    onAsk(question.trim());
    setQuestion('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: 10,
        padding: '12px 16px',
        borderTop: '1px solid #0f3460',
        background: '#16213e',
      }}
    >
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about your documents..."
        disabled={disabled}
        style={{
          flex: 1,
          padding: '10px 14px',
          background: '#1a1a2e',
          color: '#e0e0e0',
          border: '1px solid #0f3460',
          borderRadius: 6,
          fontSize: 14,
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={disabled || !question.trim()}
        style={{
          padding: '10px 20px',
          background: '#533483',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
          opacity: disabled || !question.trim() ? 0.5 : 1,
        }}
      >
        Ask
      </button>
    </form>
  );
}
