# ARCHITECTURE.md — 本地密码本

## Docs Hierarchy

```
docs/
  PRODUCT.md              -- 概览、全局约定、功能索引
  product-specs/<id>.md   -- 单功能交互与验收（统一骨架）
  ARCHITECTURE.md         -- Electron 分层、IPC、窗口模式
```

改交互细节时编辑对应 `product-specs/<id>.md`；状态仍以仓库根目录 `feature_list.json` 为准。

## 分层模型

四个严格的 Electron 分层：

| 分层 | 路径 | 职责 |
|------|------|------|
| Main | `src/main/` | 窗口生命周期、IPC 注册、service 装配、原生应用菜单（File/Edit/View/Window/Help + Settings；菜单文案随语言切换） |
| Preload | `src/preload/` | 仅通过 `contextBridge` 暴露类型化 API |
| Renderer | `src/renderer/` | React UI；只通过 `window.vault` 通信；文案经 `src/renderer/i18n/` 分层（默认 `zh-CN`） |
| Services | `src/services/` | 认证、保险箱数据库、加解密；仅运行于主进程 |

## 依赖规则

- Renderer 不得导入 Node 模块（`fs`、`path`、`better-sqlite3`、`crypto`）。
- Services 不得导入 renderer 或 React。
- Preload 不得导入 React、services，或其他本地项目模块（Electron sandbox 无法解析 `../shared/*`）。IPC 通道字符串须在 preload 内联写死。
- IPC 通道名只定义在 `src/shared/types.ts`。

## 数据流（MVP）

```
UI（Setup / Login / EntryList）
  → window.vault.*（preload）
  → ipcMain handlers
  → AuthService / EntryService
  → SQLite（userData）+ 加密载荷
```

## 窗口模式（login-window-flow）

| 模式 | 触发 | 窗口 | 菜单 |
|------|------|------|------|
| `auth` | 启动默认；设置/登录/恢复；锁定后 | ~880×560 宽模式，居中；左角色右表单 | 隐藏（Windows/Linux `null`；macOS 仅保留最小应用菜单） |
| `main` | 设置完成 / 登录成功 / 恢复成功 | ~1100×720 | 完整 File/Edit/View/Window/Help/Settings |

- Renderer 通过 `window.vault.app.setWindowMode('auth' \| 'main')` 请求切换。
- Main 负责 `setSize` / `center` / `Menu.setApplicationMenu`；不新建第二个 BrowserWindow。

## 安全概要

1. 主密码 → PBKDF2 → 校验值（verifier）+ 加密密钥材料。
2. 首次设置时生成 BIP39 助记词，用于密钥恢复。
3. 密码条目字段在 SQLite 中加密落盘（`sql.js` WASM；避免 Electron 原生 ABI 重建）。
4. 解锁会话仅在主进程内存中持有 vault key。

## 验证命令

```bash
./init.sh          # install + typecheck + tests + build
npm run check      # tsc 两个 tsconfig
npm test           # vitest
npm run dev        # Vite HMR + main/preload 变更自动重启 Electron
```

开发模式下 Electron 通过环境变量 `VITE_DEV_SERVER_URL` 加载 Vite；生产/常规 build 仍加载 `dist/renderer`。
