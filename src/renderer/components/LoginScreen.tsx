import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { AuthShell } from './AuthShell';
import type { AuthMascotMood } from './AuthMascots';
import { Button } from './ui/button';
import { EyeToggle } from './ui/eye-toggle';
import { Input } from './ui/input';

interface LoginScreenProps {
  onUnlocked: () => void;
}

type RestoreStep = 1 | 2 | 3;

const REMEMBER_KEY = 'vault.ui.rememberPasswordChecked';

export function LoginScreen({ onUnlocked }: LoginScreenProps) {
  const { t, te } = useLocale();
  const [mode, setMode] = useState<'login' | 'restore'>('login');
  const [restoreStep, setRestoreStep] = useState<RestoreStep>(1);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [surprised, setSurprised] = useState(false);

  useEffect(() => {
    try {
      setRemember(localStorage.getItem(REMEMBER_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  const secretFilled =
    mode === 'login'
      ? password.trim().length > 0
      : restoreStep === 2
        ? newPassword.trim().length > 0
        : restoreStep === 3
          ? confirmPassword.trim().length > 0
          : false;
  const mnemonicFilled = mode === 'restore' && restoreStep === 1 && mnemonic.trim().length > 0;

  const mood: AuthMascotMood = useMemo(
    () => ({
      lean: mnemonicFilled && !surprised,
      peeking: secretFilled && !surprised,
      surprised,
      hidden: false,
    }),
    [mnemonicFilled, secretFilled, surprised],
  );

  function clearSurprise() {
    if (surprised) setSurprised(false);
  }

  function switchMode(next: 'login' | 'restore') {
    setError('');
    setSurprised(false);
    setMode(next);
    setRestoreStep(1);
  }

  function setRememberChecked(next: boolean) {
    setRemember(next);
    try {
      localStorage.setItem(REMEMBER_KEY, next ? '1' : '0');
    } catch {
      /* ignore — preference only, never stores master password */
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!password.trim()) {
      setSurprised(true);
      setError(t('login.failed'));
      return;
    }
    setSurprised(false);
    setBusy(true);
    try {
      const result = await window.vault.auth.login(password);
      if (!result.ok) {
        setError(te(result.error, 'login.failed'));
        return;
      }
      onUnlocked();
    } finally {
      setBusy(false);
    }
  }

  function handleRestoreNext(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (restoreStep === 1) {
      if (!mnemonic.trim()) {
        setSurprised(true);
        setError(t('restore.failed'));
        return;
      }
      setSurprised(false);
      setRestoreStep(2);
      return;
    }
    if (restoreStep === 2) {
      if (!newPassword.trim() || newPassword.length < 8) {
        setSurprised(true);
        setError(te('Password must be at least 8 characters', 'restore.failed'));
        return;
      }
      setSurprised(false);
      setRestoreStep(3);
      return;
    }
    void submitRestore();
  }

  async function submitRestore() {
    setError('');
    if (newPassword !== confirmPassword) {
      setSurprised(false);
      setError(t('setup.mismatch'));
      return;
    }
    if (!confirmPassword.trim()) {
      setSurprised(true);
      setError(t('restore.failed'));
      return;
    }
    setSurprised(false);
    setBusy(true);
    try {
      const result = await window.vault.auth.restore(mnemonic, newPassword);
      if (!result.ok) {
        setError(te(result.error, 'restore.failed'));
        return;
      }
      onUnlocked();
    } finally {
      setBusy(false);
    }
  }

  const restoreTitle =
    restoreStep === 1
      ? t('restore.stepMnemonicTitle')
      : restoreStep === 2
        ? t('restore.stepPasswordTitle')
        : t('restore.stepConfirmTitle');
  const restoreDescription =
    restoreStep === 1
      ? t('restore.stepMnemonicDescription')
      : restoreStep === 2
        ? t('restore.stepPasswordDescription')
        : t('restore.stepConfirmDescription');

  return (
    <AuthShell
      title={mode === 'login' ? t('login.unlockTitle') : restoreTitle}
      description={mode === 'login' ? t('login.unlockDescription') : restoreDescription}
      mood={mood}
      stepCurrent={mode === 'restore' ? restoreStep : undefined}
      stepTotal={mode === 'restore' ? 3 : undefined}
      headerAlign="center"
    >
      {mode === 'login' ? (
        <form className="flex flex-col gap-7" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground" htmlFor="login-password">
              {t('login.passwordLabel')}
            </label>
            <div className="relative">
              <Input
                id="login-password"
                variant="underline"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                autoFocus
                className="pr-10"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => {
                  clearSurprise();
                  setPassword(e.target.value);
                }}
              />
              <EyeToggle
                className="absolute bottom-1 right-0"
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                labelShow={t('home.show')}
                labelHide={t('home.hide')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer accent-blue-600"
                checked={remember}
                onChange={(e) => setRememberChecked(e.target.checked)}
              />
              {t('login.remember')}
            </label>
            <Button type="button" variant="link" onClick={() => switchMode('restore')}>
              {t('login.forgot')}
            </Button>
          </div>

          {error ? <p className="-mt-3 text-sm text-destructive">{error}</p> : null}

          <Button size="lg" className="w-full" disabled={busy} type="submit">
            {busy ? t('login.unlocking') : t('login.unlock')}
          </Button>
        </form>
      ) : (
        <form className="flex flex-col gap-6" onSubmit={handleRestoreNext}>
          {restoreStep === 1 ? (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium" htmlFor="restore-mnemonic">
                {t('restore.mnemonicLabel')}
              </label>
              <textarea
                id="restore-mnemonic"
                className="min-h-[108px] w-full resize-none rounded-none border-0 border-b border-[#d1d5db] bg-transparent px-0 py-2 text-sm leading-relaxed outline-none transition-[border-color] duration-200 focus-visible:border-foreground"
                placeholder={t('restore.mnemonicPlaceholder')}
                autoFocus
                value={mnemonic}
                onChange={(e) => {
                  clearSurprise();
                  setMnemonic(e.target.value);
                }}
              />
            </div>
          ) : null}

          {restoreStep === 2 ? (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium" htmlFor="restore-password">
                {t('restore.newPassword')}
              </label>
              <div className="relative">
                <Input
                  id="restore-password"
                  variant="underline"
                  type={showNewPassword ? 'text' : 'password'}
                  autoFocus
                  className="pr-10"
                  placeholder={t('restore.newPassword')}
                  value={newPassword}
                  onChange={(e) => {
                    clearSurprise();
                    setNewPassword(e.target.value);
                  }}
                  minLength={8}
                />
                <EyeToggle
                  className="absolute bottom-1 right-0"
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((v) => !v)}
                  labelShow={t('home.show')}
                  labelHide={t('home.hide')}
                />
              </div>
            </div>
          ) : null}

          {restoreStep === 3 ? (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium" htmlFor="restore-confirm">
                {t('restore.confirmPassword')}
              </label>
              <Input
                id="restore-confirm"
                variant="underline"
                type="password"
                autoFocus
                placeholder={t('restore.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => {
                  clearSurprise();
                  setConfirmPassword(e.target.value);
                }}
                minLength={8}
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex gap-3">
            {restoreStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 rounded-full"
                onClick={() => {
                  setError('');
                  setSurprised(false);
                  setRestoreStep((s) => (s === 3 ? 2 : 1));
                }}
              >
                {t('common.back')}
              </Button>
            ) : (
              <Button type="button" variant="link" className="mr-auto" onClick={() => switchMode('login')}>
                {t('login.back')}
              </Button>
            )}
            <Button size="lg" className={restoreStep > 1 ? 'flex-1' : 'w-full'} disabled={busy} type="submit">
              {restoreStep < 3 ? t('common.next') : busy ? t('restore.submitting') : t('restore.submit')}
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
