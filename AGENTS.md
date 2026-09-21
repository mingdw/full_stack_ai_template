# AGENTS.md — 本地密码本

本仓库是本地 Electron 密码本。优先保证可靠完成、可验证证据、可跨会话重启，而不是单纯堆代码。

## 开工流程 (Startup Workflow)

写代码前先做这些事：

1. 用 `pwd` 确认工作目录
2. 完整阅读本文件
3. 阅读 `docs/PRODUCT.md` 与 `docs/ARCHITECTURE.md`；选定功能后阅读 `docs/product-specs/<id>.md`
4. 运行 `./init.sh`（或 `bash init.sh`）
5. 阅读 `feature_list.json`，只选一个未完成功能
6. 用 `git log --oneline -5` 查看最近提交

如果基线验证已失败，先修复基线，再增加新范围。

## 工作规则

- One feature at a time：同一时间只做一个 `feature_list.json` 中的功能
- Stay in scope：除非为消除当前 blocker 的窄范围修复，否则不要改无关文件
- 交互与验收以 `docs/product-specs/<当前功能 id>.md` 为准；总览见 `docs/PRODUCT.md`
- 没有可运行证据时，不要把状态标为 `pass`
- Renderer 不得导入 Node 模块；保险箱操作一律通过 `window.vault`
- 优先依赖仓库持久文件（`progress.md`、`session-handoff.md`），而不是聊天记忆

## 必需产物

- `feature_list.json` — 功能状态的唯一事实来源
- `progress.md` — 会话进度与已验证状态
- `init.sh` — 标准启动与验证入口
- `session-handoff.md` — 跨会话简要交接
- `docs/PRODUCT.md` / `docs/product-specs/` / `docs/ARCHITECTURE.md` — 产品索引、单功能规格与分层地图

## 完成定义 (Definition of Done)

功能只在以下条件全部成立时算完成（done only when）：

- 目标行为已实现
- 要求的验证已实际执行（`npm run check`、`npm test`，以及功能相关检查）
- 证据已写入 `feature_list.json` 或 `progress.md`
- 仓库仍可从 `./init.sh` 干净重启（restartable / clean）

## Electron 分层边界

- Main：`src/main/`
- Preload：`src/preload/`
- Renderer：`src/renderer/`
- Services：`src/services/`
- 共享 IPC/类型：`src/shared/types.ts`

## 验证命令 (Verification Commands)

```bash
./init.sh
npm run check
npm test
npm run build
npm run dev          # Vite HMR + main/preload 变更自动重启 Electron
```

开发提示：

- 改 `src/renderer/**`：保存后窗口热更新，无需关窗
- 改 `src/main/**` / `src/preload/**` / `src/services/**`：自动重启 Electron
- 正式产物仍用 `npm run build`（加载 `dist/renderer`，不依赖开发服务器）

## 会话结束 (End of Session)

结束前：

1. 更新 `progress.md`
2. 更新 `feature_list.json`
3. 更新 `session-handoff.md`
4. 记录未解决 blocker
5. 让下一会话能立刻运行 `./init.sh`
