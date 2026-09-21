# 本地密码本（Local Password Vault）

本地 Electron 桌面密码本：主密码 + 恢复提示词离线管理加密凭证，密钥不离开本机。

本仓库同时实践 **Harness Engineering**：用 `AGENTS.md`、产品规格、`feature_list.json` 与验证命令约束 AI 协作，优先可靠完成与可跨会话续作。

## 功能概览

- 首次设置主密码，备份 BIP39 **恢复提示词**
- 日常主密码解锁；忘记密码可用提示词恢复
- 横向宽认证窗（左角色 / 右表单，无完整原生菜单；设密与恢复分步）→ 解锁后进入主窗口
- 密码条目本地加密增删改查（`sql.js` / SQLite）
- 界面默认简体中文，Settings 预留语言切换

非目标（云同步、浏览器扩展、自动填充等）见 [`docs/PRODUCT.md`](docs/PRODUCT.md)。

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面壳 | Electron（main / preload / renderer） |
| UI | React 18 + TypeScript + Tailwind |
| 存储 | `sql.js`（WASM SQLite）+ 本地加密 |
| 密钥 | Node `crypto` + BIP39 |

## 快速开始

```bash
# 安装依赖 + 类型检查 + 测试 + 构建（推荐首次）
# Windows 可用 Git Bash，或逐步执行下方 npm 命令
./init.sh

npm install
npm run check
npm test
npm run build
npm run dev          # 开发：Vite HMR + main/preload 变更自动重启
```

开发提示：

- 改 `src/renderer/**`：窗口内热更新
- 改 `src/main/**` / `src/preload/**` / `src/services/**`：自动重启 Electron
- 生产加载 `dist/renderer`；开发态通过 `VITE_DEV_SERVER_URL` 连 Vite

## 仓库文档地图

| 文件 | 用途 |
|------|------|
| [`AGENTS.md`](AGENTS.md) | AI / 开发者开工规则与完成定义 |
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | 产品概览、全局约定、功能索引 |
| [`docs/product-specs/<id>.md`](docs/product-specs/) | **单功能**交互与验收（改交互先改这里） |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Electron 分层、IPC、窗口模式 |
| [`feature_list.json`](feature_list.json) | 功能状态队列与证据 |
| [`progress.md`](progress.md) / [`session-handoff.md`](session-handoff.md) | 会话进度与交接 |

## 用 AI 开发功能（标准提示词）

**先改规格，再开实现。** 同一时间只做一个 `feature_list.json` 中的功能。

1. 在 `docs/PRODUCT.md` 索引加行（若新功能）
2. 新建或编辑 `docs/product-specs/<id>.md`
3. 在 `feature_list.json` 增加/更新条目（新做可设 `not-started`）
4. 新开 Agent 会话，粘贴下方模板（替换 `<id>` 与范围说明）

### 标准提示词模板

```text
请严格按 AGENTS.md 开工：
1. 确认工作目录；读 docs/PRODUCT.md、docs/ARCHITECTURE.md
2. 跑 npm run check（或 ./init.sh）确认基线；基线红则先修基线
3. 只做 feature_list.json 中的 <id>
4. 交互与验收以 docs/product-specs/<id>.md 为准
   （若只改某一节，写明如：仅「用户路径 / 交互细节」第 N 节）
5. Stay in scope：不改无关功能；遵守规格中的「本功能非目标 / 明确不做」
6. Renderer 只通过 window.vault；不得在 renderer 导入 Node 模块
7. 完成后执行 npm run check 与 npm test（及功能相关验证），
   更新 feature_list.json 的 evidence，并更新 progress.md / session-handoff.md
```

### 示例：只改登录窗布局某一节

```text
请严格按 AGENTS.md 开工：
1. 确认工作目录；读 docs/PRODUCT.md、docs/ARCHITECTURE.md
2. 跑 npm run check 确认基线
3. 只做 feature_list.json 中的 login-window-flow
4. 以 docs/product-specs/login-window-flow.md 为准，
   本次范围仅「用户路径 / 交互细节」第 5 节「布局与细节」
5. Stay in scope；不做规格「明确不做」项（如 Google 登录、记住密码、宽双栏）
6. 完成后 npm run check / npm test，并更新 evidence 与交接文件
```

## 目录结构（简）

```text
src/
  main/       # 窗口、菜单、IPC 注册
  preload/    # contextBridge → window.vault
  renderer/   # React UI
  services/   # 认证 / 条目 / 数据库（主进程）
  shared/     # 类型与 IPC 通道名
docs/
  PRODUCT.md
  ARCHITECTURE.md
  product-specs/
```

## License

MIT
