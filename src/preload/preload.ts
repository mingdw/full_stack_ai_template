import { contextBridge, ipcRenderer } from 'electron';

/** Keep channel names inlined — sandboxed preload cannot require ../shared/*. */
const CHANNELS = {
  AUTH_STATUS: 'auth:status',
  AUTH_SETUP: 'auth:setup',
  AUTH_LOGIN: 'auth:login',
  AUTH_RESTORE: 'auth:restore',
  AUTH_LOCK: 'auth:lock',
  ENTRIES_LIST: 'entries:list',
  ENTRIES_GET: 'entries:get',
  ENTRIES_CREATE: 'entries:create',
  ENTRIES_UPDATE: 'entries:update',
  ENTRIES_DELETE: 'entries:delete',
  APP_SET_LOCALE: 'app:set-locale',
  APP_LOCALE_CHANGED: 'app:locale-changed',
  APP_SET_WINDOW_MODE: 'app:set-window-mode',
} as const;

const api = {
  auth: {
    status: () => ipcRenderer.invoke(CHANNELS.AUTH_STATUS),
    setup: (password: string) => ipcRenderer.invoke(CHANNELS.AUTH_SETUP, password),
    login: (password: string) => ipcRenderer.invoke(CHANNELS.AUTH_LOGIN, password),
    restore: (mnemonic: string, newPassword: string) =>
      ipcRenderer.invoke(CHANNELS.AUTH_RESTORE, mnemonic, newPassword),
    lock: () => ipcRenderer.invoke(CHANNELS.AUTH_LOCK),
  },
  entries: {
    list: () => ipcRenderer.invoke(CHANNELS.ENTRIES_LIST),
    get: (id: string) => ipcRenderer.invoke(CHANNELS.ENTRIES_GET, id),
    create: (input: unknown) => ipcRenderer.invoke(CHANNELS.ENTRIES_CREATE, input),
    update: (id: string, input: unknown) => ipcRenderer.invoke(CHANNELS.ENTRIES_UPDATE, id, input),
    delete: (id: string) => ipcRenderer.invoke(CHANNELS.ENTRIES_DELETE, id),
  },
  app: {
    setLocale: (locale: string) => ipcRenderer.invoke(CHANNELS.APP_SET_LOCALE, locale),
    setWindowMode: (mode: 'auth' | 'main') => ipcRenderer.invoke(CHANNELS.APP_SET_WINDOW_MODE, mode),
    onLocaleChanged: (callback: (locale: string) => void) => {
      const listener = (_event: unknown, locale: string) => {
        callback(locale);
      };
      ipcRenderer.on(CHANNELS.APP_LOCALE_CHANGED, listener);
      return () => {
        ipcRenderer.removeListener(CHANNELS.APP_LOCALE_CHANGED, listener);
      };
    },
  },
};

contextBridge.exposeInMainWorld('vault', api);
