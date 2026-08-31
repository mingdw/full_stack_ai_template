import { IpcMain, dialog, BrowserWindow } from 'electron';
import { DocumentService } from '../services/document-service';
import { IndexingService } from '../services/indexing-service';
import { QaService } from '../services/qa-service';
import { AppStatus, IPC_CHANNELS } from '../shared/types';

export interface Services {
  documentService: DocumentService;
  indexingService: IndexingService;
  qaService: QaService;
}

function toAppStatus(
  indexStatus: ReturnType<IndexingService['getStatus']>,
  documentCount: number
): AppStatus {
  return {
    documentsLoaded: documentCount,
    indexStatus: indexStatus.status,
    lastActivity: indexStatus.lastIndexed ?? new Date().toISOString(),
  };
}

export function registerIpcHandlers(ipcMain: IpcMain, services: Services): void {
  const { documentService, indexingService, qaService } = services;

  ipcMain.handle(IPC_CHANNELS.LIST_DOCUMENTS, async () => {
    return documentService.listDocuments();
  });

  ipcMain.handle(IPC_CHANNELS.IMPORT_DOCUMENT, async (_event, filePath: string) => {
    const doc = documentService.importDocument(filePath);
    await indexingService.startIndexing(doc.id);
    return documentService.getDocument(doc.id);
  });

  ipcMain.handle(IPC_CHANNELS.PICK_AND_IMPORT, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const dialogOpts = {
      title: 'Import Document',
      properties: ['openFile' as const],
      filters: [{ name: 'Documents', extensions: ['txt', 'md'] }],
    };
    const result = win
      ? await dialog.showOpenDialog(win, dialogOpts)
      : await dialog.showOpenDialog(dialogOpts);

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const doc = documentService.importDocument(result.filePaths[0]);
    await indexingService.startIndexing(doc.id);
    return documentService.getDocument(doc.id);
  });

  ipcMain.handle(IPC_CHANNELS.GET_DOCUMENT, async (_event, id: string) => {
    return documentService.getDocument(id);
  });

  ipcMain.handle(IPC_CHANNELS.DELETE_DOCUMENT, async (_event, id: string) => {
    return documentService.deleteDocument(id);
  });

  ipcMain.handle(IPC_CHANNELS.START_INDEXING, async (_event, documentId?: string) => {
    const status = await indexingService.startIndexing(documentId);
    return toAppStatus(status, documentService.listDocuments().length);
  });

  ipcMain.handle(IPC_CHANNELS.GET_INDEXING_STATUS, async () => {
    return toAppStatus(indexingService.getStatus(), documentService.listDocuments().length);
  });

  ipcMain.handle(IPC_CHANNELS.GET_CHUNKS, async (_event, documentId: string) => {
    return indexingService.getChunksForDocument(documentId);
  });

  ipcMain.handle(IPC_CHANNELS.ASK_QUESTION, async (_event, question: string) => {
    return qaService.ask(question);
  });

  ipcMain.handle(IPC_CHANNELS.GET_HISTORY, async () => {
    return qaService.getHistory();
  });

  ipcMain.handle(IPC_CHANNELS.GET_STATUS, async () => {
    return toAppStatus(indexingService.getStatus(), documentService.listDocuments().length);
  });
}
