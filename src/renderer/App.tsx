import { useEffect, useState } from 'react';
import type { VaultStatus, WindowMode } from '../shared/types';
import { LoginScreen } from './components/LoginScreen';
import { SetupScreen } from './components/SetupScreen';
import { VaultHome } from './components/VaultHome';
import { LocaleProvider, useLocale } from './i18n/LocaleContext';

type View = 'loading' | 'setup' | 'login' | 'home' | 'error';

async function setWindowMode(mode: WindowMode): Promise<void> {
  if (!window.vault?.app?.setWindowMode) return;
  await window.vault.app.setWindowMode(mode);
}

function AppBody() {
  const { t } = useLocale();
  const [view, setView] = useState<View>('loading');
  const [error, setError] = useState('');

  async function enterHome() {
    await setWindowMode('main');
    setView('home');
  }

  async function enterAuth(next: 'setup' | 'login') {
    await setWindowMode('auth');
    setView(next);
  }

  async function refreshStatus() {
    try {
      if (!window.vault) {
        setError(t('common.error.preloadMissing'));
        setView('error');
        return;
      }
      const status: VaultStatus = await window.vault.auth.status();
      if (!status.initialized) {
        await enterAuth('setup');
        return;
      }
      if (status.unlocked) {
        await enterHome();
        return;
      }
      await enterAuth('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setView('error');
    }
  }

  useEffect(() => {
    void refreshStatus();
  }, []);

  return (
    <div
      className={
        view === 'home'
          ? 'min-h-screen bg-[radial-gradient(ellipse_at_top,_#ebe6dc_0%,_#f3efe8_52%,_#efeae2_100%)] text-foreground'
          : 'min-h-screen bg-card text-foreground'
      }
    >
      <div
        className={
          view === 'home'
            ? 'flex min-h-screen items-center justify-center p-6'
            : view === 'setup' || view === 'login'
              ? 'min-h-screen w-full'
              : 'flex min-h-screen items-center justify-center p-5'
        }
      >
        {view === 'loading' ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}
        {view === 'error' ? (
          <div className="max-w-md space-y-2 rounded-lg border border-destructive/30 bg-card p-6 text-sm">
            <p className="font-medium text-destructive">{t('common.error.startTitle')}</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : null}
        {view === 'setup' ? <SetupScreen onComplete={() => void enterHome()} /> : null}
        {view === 'login' ? <LoginScreen onUnlocked={() => void enterHome()} /> : null}
        {view === 'home' ? (
          <VaultHome
            onLock={() => {
              void enterAuth('login');
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export function App() {
  return (
    <LocaleProvider>
      <AppBody />
    </LocaleProvider>
  );
}
