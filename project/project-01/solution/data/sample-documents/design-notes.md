# Software Design Notes

## Architecture Overview

The knowledge base application follows a layered architecture pattern with clear separation of concerns. The system is divided into four primary layers: the main process, preload scripts, the renderer layer, and services.

## Main Process

The main process is responsible for window management, IPC handler registration, and lifecycle management. It serves as the entry point for the Electron application and coordinates between the operating system and the renderer process.

## Preload Layer

The preload script acts as a secure bridge between the main and renderer processes. It uses Electron's contextBridge to expose a typed API to the renderer without granting full Node.js access.

## Renderer Layer

The renderer uses React with TypeScript to build the user interface. Components communicate exclusively through the preload bridge API.

## Services Layer

Business logic lives in service classes that run in the main process:
- PersistenceService - Filesystem read/write operations
- DocumentService - Document import, storage, and retrieval
- IndexingService - Text chunking and index building
- QaService - Mock Q&A with citation support
