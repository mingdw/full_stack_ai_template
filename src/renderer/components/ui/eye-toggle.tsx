import { cn } from '../../lib/utils';

interface EyeToggleProps {
  visible: boolean;
  onToggle: () => void;
  labelShow: string;
  labelHide: string;
  className?: string;
}

/** Password visibility control — icon only (no text). */
export function EyeToggle({ visible, onToggle, labelShow, labelHide, className }: EyeToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
      onClick={onToggle}
      aria-label={visible ? labelHide : labelShow}
    >
      {visible ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 9.3 3.1 11 7.5a12.3 12.3 0 01-4 5.1M6.1 6.1A12.3 12.3 0 001 12.5C2.7 16.9 7 20 12 20c1.4 0 2.7-.2 4-.7"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M1 12.5C2.7 8.1 7 5 12 5s9.3 3.1 11 7.5C21.3 16.9 17 20 12 20S2.7 16.9 1 12.5z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      )}
    </button>
  );
}
