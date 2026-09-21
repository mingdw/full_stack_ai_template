import * as React from 'react';
import { cn } from '../../lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'lg' | 'sm';
};

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center text-sm font-semibold tracking-[-0.01em] transition-[transform,background-color,opacity,color,box-shadow] duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50',
        size === 'default' && 'h-10 rounded-xl px-4',
        size === 'lg' && 'h-12 rounded-full px-5 text-[15px]',
        size === 'sm' && 'h-8 rounded-lg px-3 text-xs',
        variant === 'default' && 'bg-primary text-primary-foreground hover:brightness-110',
        variant === 'outline' && 'border border-border bg-card text-foreground hover:bg-muted',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:brightness-110',
        variant === 'ghost' && 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
        variant === 'link' &&
          'h-auto rounded-none px-0 font-medium text-muted-foreground shadow-none hover:text-foreground hover:underline active:scale-100',
        className,
      )}
      {...props}
    />
  );
}
