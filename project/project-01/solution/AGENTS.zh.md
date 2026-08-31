# AGENTS.md -- 项目 01：基线 vs 最小 Harness

## 开工规则

写任何代码之前，请按顺序完成以下步骤：

1. **完整阅读本文件。** 它定义了本项目的边界与约定。
2. **阅读 `docs/ARCHITECTURE.md`**，理解 Electron 分层结构。
3. **阅读 `docs/PRODUCT.md`**，理解功能需求。
4. **运行 `bash init.sh`**，确认项目能干净构建。若失败，先修复构建错误再继续。
5. **阅读 `feature_list.json`**，了解各功能的当前状态。

## Electron 分层边界

本项目有四个严格分层。代码必须遵守这些边界：

### 主进程（`src/main/`）
- 负责 `BrowserWindow` 生命周期与 IPC 注册。
- 可导入 services，但不得导入 renderer 代码。
- 所有文件系统访问都通过 services 完成。

### Preload（`src/preload/`）
- 主进程与渲染进程之间的**唯一**桥梁。
- 使用 `contextBridge.exposeInMainWorld` 暴露类型化 API。
- 不得导入 React 或 renderer 代码。

### 渲染进程（`src/renderer/`）
- React + TypeScript UI 层。
- 仅通过 `window.knowledgeBase` API 与主进程通信。
- 不得导入 Node.js 模块（`fs`、`path`、`electron`）。
- 使用 `types.d.ts` 中的类型声明。

### Services（`src/services/`）
- 运行在主进程中的纯 TypeScript 业务逻辑。
- 可从 `src/shared/` 导入，但不得从 `src/renderer/` 导入。
- 每个 service 通过构造函数注入接收 `PersistenceService`。

## 约定

- 启用 TypeScript strict 模式。使用 `any` 时必须写注释说明原因。
- 仅使用命名导出（禁止 default export）。
- IPC 通道名统一在 `src/shared/types.ts`（`IPC_CHANNELS`）中定义一次。
- 所有异步操作返回 Promise；渲染进程中禁止同步 I/O。

## 完成定义（Definition of Done）

满足以下全部条件时，功能才算「完成」：

1. TypeScript 编译无错误（`npm run check`）。
2. 应用能启动且窗口可见（`npm run dev`）。
3. 该功能在 `feature_list.json` 中状态为 `"pass"`，并附有证据。
4. 代码遵守上文 Electron 分层边界。
5. 正常操作期间无 console 错误。

## 如何使用功能清单

`feature_list.json` 是项目进度的唯一事实来源：

- 每个功能有 `status`：`"pass"`、`"fail"`、`"not-started"`。
- 实现某功能后，将其状态更新为 `"pass"` 并附上证据。
- 若功能被阻塞，将状态设为 `"fail"` 并写明原因。
- 永远不要从清单中删除功能。
