# claude-progress.md -- Session Log

## Project 01: Baseline vs Minimal Harness

### Session 1 -- 2026-08-31

**Goal**: 在 solution 中实现 Electron 知识库基线：左侧文档列表、右侧问答面板、本地数据目录。

**What was done**:
- 补齐完整 Electron + React + TypeScript 应用源码（main / preload / renderer / services）
- 左侧 `DocumentList` 空态与列表；右侧 `QuestionPanel` 经 IPC 提交问答
- `PersistenceService` 在 `userData/knowledge-base-data` 下创建 data / documents / index
- 写入 `docs/ARCHITECTURE.md`、`docs/PRODUCT.md` 与示例文档
- 验证：`npm run check` 通过；`npm run build` 通过；PersistenceService 目录创建 smoke 通过

**Decisions**:
- IndexingService.getStatus() 直接返回 `AppStatus`，与 StatusBar 字段对齐
- QaService 注入共享的 IndexingService，避免重复索引实例

**Issues**:
- 首次 `npm install` 因 Electron 下载 TLS 失败；改用 `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/` 后成功

**Next session**: 可按 Project 02 继续完善导入、详情与持久化体验；或运行 `npm run dev` 做手动 UI 冒烟。
