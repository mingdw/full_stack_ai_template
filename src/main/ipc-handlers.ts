import { IpcMain } from 'electron';
import { AuthService } from '../services/auth-service';
import { EntryService } from '../services/entry-service';
import { IPC_CHANNELS, PasswordEntryInput } from '../shared/types';

export interface ServiceBundle {
  authService: AuthService;
  entryService: EntryService;
}

function requireVaultKey(authService: AuthService): Buffer {
  const key = authService.getVaultKey();
  if (!key) {
    throw new Error('Vault is locked');
  }
  return key;
}

export function registerIpcHandlers(ipcMain: IpcMain, services: ServiceBundle): void {
  const { authService, entryService } = services;

  ipcMain.handle(IPC_CHANNELS.AUTH_STATUS, () => authService.getStatus());

  ipcMain.handle(IPC_CHANNELS.AUTH_SETUP, (_event, password: string) => authService.setup(password));

  ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN, (_event, password: string) => authService.login(password));

  ipcMain.handle(IPC_CHANNELS.AUTH_RESTORE, (_event, mnemonic: string, newPassword: string) =>
    authService.restore(mnemonic, newPassword),
  );

  ipcMain.handle(IPC_CHANNELS.AUTH_LOCK, () => {
    authService.lock();
    return { ok: true };
  });

  ipcMain.handle(IPC_CHANNELS.ENTRIES_LIST, () => {
    const key = requireVaultKey(authService);
    return entryService.list(key);
  });

  ipcMain.handle(IPC_CHANNELS.ENTRIES_GET, (_event, id: string) => {
    const key = requireVaultKey(authService);
    return entryService.get(id, key);
  });

  ipcMain.handle(IPC_CHANNELS.ENTRIES_CREATE, (_event, input: PasswordEntryInput) => {
    const key = requireVaultKey(authService);
    return entryService.create(input, key);
  });

  ipcMain.handle(IPC_CHANNELS.ENTRIES_UPDATE, (_event, id: string, input: PasswordEntryInput) => {
    const key = requireVaultKey(authService);
    return entryService.update(id, input, key);
  });

  ipcMain.handle(IPC_CHANNELS.ENTRIES_DELETE, (_event, id: string) => {
    requireVaultKey(authService);
    return entryService.delete(id);
  });
}
