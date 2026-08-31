# Product Description -- Knowledge Base

## What Is This?

A desktop application for managing a personal knowledge base. Users import text and Markdown documents, the system indexes them into searchable chunks, and a question-answering interface provides grounded answers with citations.

## Core Features (Project 01 Baseline)

- Electron window launches at 1200x800 with secure preload.
- Left sidebar shows the document list (empty state when none imported).
- Right panel includes Q&A input that submits via IPC.
- PersistenceService creates and uses a local data directory under userData.

## User Interface

```
+------------------+----------------------------------------+
| Header           |                                Refresh |
+------------------+----------------------------------------+
| Document List    | Document Detail / Welcome              |
| (sidebar)        |                                        |
|                  | Q&A Response                           |
| [+ Import]       |                                        |
+------------------+----------------------------------------+
| Question Input                              [Ask]         |
+-----------------------------------------------------------+
| Status: idle | Documents: 0                                |
+-----------------------------------------------------------+
```

## Constraints

- Maximum supported file size: 10 MB.
- Supported formats: `.txt`, `.md`.
- Q&A uses mock patterns -- no LLM integration in this version.
- All data is local; no network requests.
