import type { ReactNode } from 'react';
import { AuthMascots, type AuthMascotMood } from './AuthMascots';

interface AuthShellProps {
  title: string;
  description: string;
  mood: AuthMascotMood;
  children: ReactNode;
  /** Custom step bar content rendered above the title */
  stepBar?: ReactNode;
  /** e.g. "2 / 3" for setup/restore wizards */
  stepLabel?: string;
  stepCurrent?: number;
  stepTotal?: number;
  /** Center title block in upper right (login reference layout). */
  headerAlign?: 'center' | 'start';
  /** Ref to the focused input element — eyes will look toward it */
  focusTargetRef?: React.RefObject<HTMLElement>;
}

/**
 * Full-bleed auth shell: left mascots / right form.
 * Reference: katavii/animated-login + product mock (title upper-center on right).
 */
export function AuthShell({
  title,
  description,
  mood,
  children,
  stepBar,
  stepLabel,
  stepCurrent,
  stepTotal,
  headerAlign = 'center',
  focusTargetRef,
}: AuthShellProps) {
  const showSteps = typeof stepCurrent === 'number' && typeof stepTotal === 'number' && stepTotal > 1;
  const headerCentered = headerAlign === 'center';

  return (
    <div className="auth-shell relative grid h-full min-h-screen w-full grid-cols-2 overflow-hidden bg-card">
      <aside className="relative flex items-end justify-center bg-[#e9e9e9] px-6 pb-10">
        <AuthMascots mood={mood} focusTargetRef={focusTargetRef} />
      </aside>

      <section className="flex h-full flex-col bg-white px-8 pb-8 pt-8 md:px-10 md:pt-10">
        <header className={headerCentered ? 'mx-auto w-full max-w-[360px] text-center' : 'mx-auto w-full max-w-[360px] text-left'}>
          {stepBar ?? null}
          {showSteps && !stepBar ? (
            <div
              className={`mb-4 flex items-center gap-2 ${headerCentered ? 'justify-center' : ''}`}
              aria-label={stepLabel ?? `${stepCurrent} / ${stepTotal}`}
            >
              {Array.from({ length: stepTotal }, (_, i) => {
                const n = i + 1;
                const active = n === stepCurrent;
                const done = n < stepCurrent;
                return (
                  <span
                    key={n}
                    className={
                      active
                        ? 'h-1.5 w-7 rounded-full bg-foreground transition-all duration-200'
                        : done
                          ? 'h-1.5 w-4 rounded-full bg-foreground/40 transition-all duration-200'
                          : 'h-1.5 w-4 rounded-full bg-border transition-all duration-200'
                    }
                  />
                );
              })}
              <span className="ml-1 text-[11px] font-medium tracking-wide text-muted-foreground">
                {stepCurrent} / {stepTotal}
              </span>
            </div>
          ) : null}
          <h1 className="text-balance text-[1.5rem] font-bold leading-tight tracking-[-0.02em] text-foreground md:text-[1.625rem]">
            {title}
          </h1>
          <p className="mt-1.5 text-pretty text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        </header>

        <div className="mx-auto mt-6 flex w-full max-w-[360px] flex-1 flex-col overflow-hidden">{children}</div>
      </section>
    </div>
  );
}
