import { useCallback, useMemo, useState } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';

interface MnemonicGridProps {
  mnemonic: string;
}

interface GridItem {
  /** The original word (immutable) */
  word: string;
  /** The display text — letters may be shuffled */
  display: string;
  /** Sequential number 1–12 for reference */
  index: number;
}

/** Fisher-Yates shuffle for a string's characters. */
function shuffleString(s: string): string {
  const arr = s.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/** Check if a string is already in shuffled order (all chars differ from original). */
function isShuffled(original: string, current: string): boolean {
  if (original.length !== current.length) return false;
  for (let i = 0; i < original.length; i++) {
    if (original[i] !== current[i]) return true;
  }
  return false;
}

export function MnemonicGrid({ mnemonic }: MnemonicGridProps) {
  const { t } = useLocale();
  const words = useMemo(() => mnemonic.trim().split(/\s+/), [mnemonic]);

  const [items, setItems] = useState<GridItem[]>(() =>
    words.map((word, i) => ({
      word,
      display: word,
      index: i + 1,
    })),
  );
  const [copied, setCopied] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setItems((prev) => {
      const next = [...prev];
      [next[dragIndex], next[index]] = [next[index], next[dragIndex]];
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleShuffleWord = useCallback((index: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        // If already shuffled, restore original; if not, shuffle letters
        const isAlreadyShuffled = isShuffled(item.word, item.display);
        return {
          ...item,
          display: isAlreadyShuffled ? item.word : shuffleString(item.word),
        };
      }),
    );
  }, []);

  const handleCopy = useCallback(async () => {
    // Copy the original mnemonic (not the display order, since words don't change)
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = mnemonic;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* ignore */
      }
      document.body.removeChild(textarea);
    }
  }, [mnemonic]);

  return (
    <div className="flex flex-col gap-4">
      {/* Copy button row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{t('setup.mnemonicShuffleHint')}</p>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors',
            copied
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {copied ? t('setup.mnemonicCopied') : t('setup.mnemonicCopy')}
        </button>
      </div>

      {/* 4×3 grid of mnemonic words */}
      <div className="grid grid-cols-4 gap-2">
        {items.map((item, i) => {
          const isShuffledWord = isShuffled(item.word, item.display);
          const isDragging = dragIndex === i;
          const isDragOver = dragOverIndex === i && dragIndex !== null && dragIndex !== i;

          return (
            <div
              key={item.index}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              onClick={() => handleShuffleWord(i)}
              className={cn(
                'group relative flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border px-2 py-3 transition-all duration-200',
                'hover:border-foreground/40 hover:shadow-sm',
                isDragging && 'opacity-40',
                isDragOver && 'border-accent border-2 bg-accent/5',
                !isDragging && !isDragOver && 'border-border bg-card',
              )}
              title={t('setup.mnemonicShuffleHint')}
            >
              {/* Position number */}
              <span className="absolute left-1.5 top-1 text-[10px] font-medium tabular-nums text-muted-foreground/60">
                {item.index}
              </span>

              {/* Drag handle icon */}
              <span className="absolute right-1.5 top-1.5 text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <circle cx="9" cy="5" r="1.5" />
                  <circle cx="15" cy="5" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="19" r="1.5" />
                  <circle cx="15" cy="19" r="1.5" />
                </svg>
              </span>

              {/* Word display */}
              <span
                className={cn(
                  'font-mono text-[13px] font-medium leading-tight tracking-wide text-foreground',
                  isShuffledWord && 'text-accent',
                )}
              >
                {item.display}
              </span>

              {/* Shuffle indicator */}
              {isShuffledWord && (
                <span className="mt-0.5 text-[9px] text-accent/70">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden className="inline-block">
                    <path
                      d="M16 3h5v5M4 20l5-5M20 4l-7 7M4 4l5 5M16 21h5v-5M4 4l5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
