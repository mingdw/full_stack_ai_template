import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { AuthService } from '../services/auth-service';
import { EntryService } from '../services/entry-service';
import { VaultDatabase } from '../services/vault-database';
import type { WindowMode } from '../shared/types';
import { IPC_CHANNELS } from '../shared/types';
import {
  applyApplicationMenu,
  applyAuthMenu,
  getAppTitle,
  isAppLocale,
  type AppLocale,
} from './app-menu';
import { registerIpcHandlers } from './ipc-handlers';

const AUTH_WINDOW = { width: 780, height: 480, minWidth: 700, minHeight: 420 };
const MAIN_WINDOW = { width: 1100, height: 720, minWidth: 800, minHeight: 560 };

let mainWindow: BrowserWindow | null = null;
let vaultDb: VaultDatabase | null = null;
let currentLocale: AppLocale = 'zh-CN';
let currentWindowMode: WindowMode = 'auth';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: AUTH_WINDOW.width,
    height: AUTH_WINDOW.height,
    minWidth: AUTH_WINDOW.minWidth,
    minHeight: AUTH_WINDOW.minHeight,
    resizable: true,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    title: getAppTitle(currentLocale),
  });

  applyWindowMode('auth');

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    void mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function installApplicationMenu(): void {
  if (currentWindowMode === 'auth') {
    applyAuthMenu(currentLocale);
    return;
  }

  applyApplicationMenu(
    currentLocale,
    () => mainWindow,
    (next) => {
      currentLocale = next;
      mainWindow?.setTitle(getAppTitle(next));
    },
  );
}

function applyWindowMode(mode: WindowMode): void {
  currentWindowMode = mode;
  const win = mainWindow;
  if (!win || win.isDestroyed()) {
    return;
  }

  const size = mode === 'auth' ? AUTH_WINDOW : MAIN_WINDOW;
  win.setMinimumSize(size.minWidth, size.minHeight);
  win.setSize(size.width, size.height, true);
  win.setMaximizable(mode === 'main');
  if (mode === 'auth' && win.isMaximized()) {
    win.unmaximize();
  }
  win.center();
  installApplicationMenu();
}

async function initializeServices(): Promise<void> {
  const dataDir = path.join(app.getPath('userData'), 'password-vault');
  vaultDb = await VaultDatabase.open(path.join(dataDir, 'vault.db'));
  const authService = new AuthService(vaultDb);
  const entryService = new EntryService(vaultDb);
  registerIpcHandlers(ipcMain, { authService, entryService });

  ipcMain.handle('app:set-locale', (_event, locale: unknown) => {
    if (!isAppLocale(locale)) {
      return { ok: false, error: 'Unsupported locale' };
    }
    currentLocale = locale;
    installApplicationMenu();
    mainWindow?.setTitle(getAppTitle(locale));
    return { ok: true, locale };
  });

  ipcMain.handle(IPC_CHANNELS.APP_SET_WINDOW_MODE, (_event, mode: unknown) => {
    if (mode !== 'auth' && mode !== 'main') {
      return { ok: false, error: 'Unsupported window mode' };
    }
    applyWindowMode(mode);
    return { ok: true, mode };
  });
}

app.whenReady().then(async () => {
  await initializeServices();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  vaultDb?.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
