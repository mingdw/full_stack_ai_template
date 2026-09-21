import * as React from 'react';
import { cn } from '../../lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** `underline` = auth form (bottom border only); `boxed` = default bordered field */
  variant?: 'underline' | 'boxed';
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, variant = 'boxed', ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'flex w-full bg-transparent text-sm text-foreground outline-none transition-[border-color,box-shadow,background-color] duration-200',
          'placeholder:text-muted-foreground/70',
          variant === 'boxed' &&
            'h-11 rounded-md border border-input bg-card px-3 py-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
          variant === 'underline' &&
            'h-11 rounded-none border-0 border-b border-[#d1d5db] px-0 focus-visible:border-foreground focus-visible:ring-0',
          className,
        )}
        {...props}
      />
    );
  },
);
