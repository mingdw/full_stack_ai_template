import { useRef, useState, type FormEvent } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { AuthShell } from './AuthShell';
import type { AuthMascotMood } from './AuthMascots';
import { Button } from './ui/button';
import { EyeToggle } from './ui/eye-toggle';
import { Input } from './ui/input';
import { MnemonicGrid } from './MnemonicGrid';

interface SetupScreenProps {
  onComplete: () => void;
}

type SetupStep = 1 | 2;

/** 3-step bar: 确认主密码 / 确认助记词 / 完成 */
function StepBar({ current }: { current: number }) {
  const { t } = useLocale();
  const steps = [
    { n: 1, name: t('setup.step1Name') },
    { n: 2, name: t('setup.step2Name') },
    { n: 3, name: t('setup.step3Name') },
  ];

  return (
    <div className="mb-5 flex items-start justify-center gap-3">
      {steps.map((s, i) => {
        const active = s.n === current;
        const done = s.n < current;
        return (
          <div key={s.n} className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1">
              <span
                className={
                  active || done
                    ? 'flex h-5 w-5 items-center justify-center rounded-full bg-[#059669] text-[10px] font-bold text-white transition-all duration-200'
                    : 'flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-[#059669] text-[10px] font-bold text-[#059669] transition-all duration-200'
                }
              >
                {s.n}
              </span>
              <span
                className={
                  active
                    ? 'text-[10px] font-semibold text-foreground transition-all duration-200'
                    : done
                      ? 'text-[10px] font-medium text-muted-foreground transition-all duration-200'
                      : 'text-[10px] font-medium text-muted-foreground/60 transition-all duration-200'
                }
              >
                {s.name}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <span
                className={
                  done
                    ? 'mt-2 h-px w-4 bg-[#059669] transition-all duration-200'
                    : 'mt-2 h-px w-4 bg-border transition-all duration-200'
                }
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const { t, te } = useLocale();
  const [step, setStep] = useState<SetupStep>(1);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [mnemonicRevealed, setMnemonicRevealed] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [busy, setBusy] = useState(false);
  const [surprised, setSurprised] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const [focusedField, setFocusedField] = useState<'password' | 'confirm' | null>(null);

  const secretFilled = step === 1 && (password.trim().length > 0 || confirm.trim().length > 0);

  // hidden = the currently focused password field is in hidden (masked) mode
  const focusedHidden =
    step === 1 &&
    !surprised &&
    focusedField === 'password' && !showPassword && password.trim().length > 0;
  const focusedConfirmHidden =
    step === 1 &&
    !surprised &&
    focusedField === 'confirm' && !showConfirm && confirm.trim().length > 0;
  const hidden = focusedHidden || focusedConfirmHidden;

  // The focus target ref — whichever input is currently focused
  const focusTargetRef =
    focusedField === 'password' ? passwordInputRef
    : focusedField === 'confirm' ? confirmInputRef
    : null;

  const setupMood: AuthMascotMood = {
    lean: secretFilled && !surprised,
    peeking: false,
    surprised,
    hidden,
  };

  // stepBar uses 1-based mapping: step 1 → current=1; step 2 → current=2 or 3
  const stepBarCurrent = step === 2 ? (mnemonicRevealed ? 2 : 2) : 1;

  async function handleStep(event: FormEvent) {
    event.preventDefault();
    setPasswordError('');
    setConfirmError('');

    if (step === 1) {
      let hasError = false;

      if (!password.trim() || password.length < 8) {
        setSurprised(true);
        setPasswordError(te('Password must be at least 8 characters', 'setup.failed'));
        hasError = true;
      }

      if (!confirm.trim()) {
        setSurprised(true);
        setConfirmError(t('setup.failed'));
        hasError = true;
      }

      if (hasError) return;

      if (password !== confirm) {
        setSurprised(false);
        setConfirmError(t('setup.mismatch'));
        return;
      }

      setSurprised(false);
      setBusy(true);
      try {
        const result = await window.vault.auth.setup(password);
        if (!result.ok || !('mnemonic' in result)) {
          setPasswordError(te('error' in result ? result.error : undefined, 'setup.failed'));
          return;
        }
        setMnemonic(result.mnemonic);
        setStep(2);
      } finally {
        setBusy(false);
      }
    }
  }

  const title =
    step === 1
      ? t('setup.stepPasswordTitle')
      : mnemonicRevealed
        ? t('setup.mnemonicTitle')
        : t('setup.mnemonicGenerate');
  const description =
    step === 1
      ? t('setup.stepPasswordDescription')
      : mnemonicRevealed
        ? t('setup.mnemonicDescription')
        : t('setup.mnemonicGenerateSubtitle');

  return (
    <AuthShell
      title={title}
      description={description}
      mood={step === 2 ? { lean: false, peeking: false, surprised: false, hidden: false } : setupMood}
      stepBar={<StepBar current={stepBarCurrent} />}
      headerAlign="center"
      focusTargetRef={focusTargetRef ?? undefined}
    >
      {step === 2 && mnemonic ? (
        mnemonicRevealed ? (
          <div className="flex flex-col gap-4">
            <MnemonicGrid mnemonic={mnemonic} />
            <Button size="lg" className="w-full" onClick={onComplete}>
              {t('setup.mnemonicConfirm')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => setMnemonicRevealed(true)}
            >
              {t('setup.mnemonicGenerate')}
            </Button>
          </div>
        )
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleStep}>
          {/* 主密码 */}
          <div className="space-y-1">
            <label className="text-[13px] font-medium" htmlFor="password">
              {t('setup.password')}
            </label>
            <div className="relative">
              <Input
                id="password"
                variant="underline"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                autoFocus
                className="pr-10"
                placeholder={t('setup.passwordPlaceholder')}
                value={password}
                ref={passwordInputRef}
                onFocus={() => setFocusedField('password')}
                onChange={(e) => {
                  if (surprised) setSurprised(false);
                  setPasswordError('');
                  setPassword(e.target.value);
                }}
                minLength={8}
              />
              <EyeToggle
                className="absolute bottom-1 right-0"
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                labelShow={t('home.show')}
                labelHide={t('home.hide')}
              />
            </div>
            {passwordError ? (
              <p className="text-xs text-destructive">{passwordError}</p>
            ) : null}
          </div>

          {/* 确认密码 */}
          <div className="space-y-1">
            <label className="text-[13px] font-medium" htmlFor="confirm">
              {t('setup.confirmPassword')}
            </label>
            <div className="relative">
              <Input
                id="confirm"
                variant="underline"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                className="pr-10"
                placeholder={t('setup.confirmPlaceholder')}
                value={confirm}
                ref={confirmInputRef}
                onFocus={() => setFocusedField('confirm')}
                onChange={(e) => {
                  if (surprised) setSurprised(false);
                  setConfirmError('');
                  setConfirm(e.target.value);
                }}
                minLength={8}
              />
              <EyeToggle
                className="absolute bottom-1 right-0"
                visible={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                labelShow={t('home.show')}
                labelHide={t('home.hide')}
              />
            </div>
            {confirmError ? (
              <p className="text-xs text-destructive">{confirmError}</p>
            ) : null}
          </div>

          <Button size="lg" className="w-full mt-1" disabled={busy} type="submit">
            {busy ? t('setup.submitting') : t('common.next')}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
