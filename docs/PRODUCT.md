# PRODUCT.md — 本地密码本

## 一句话说明

一款本地 Electron 密码本，用于日常工作账号凭证：首次用主密码与恢复提示词完成设置后，即可离线管理加密的密码条目。

## 目标用户

需要桌面端保险箱管理办公登录信息、且不希望把密钥发送到云端服务的个人用户。

## 文档怎么用

| 文件 | 职责 |
|------|------|
| 本文件 | 产品概览、全局约定、功能索引 |
| [`product-specs/<id>.md`](./product-specs/) | **单个功能**的交互与验收（统一骨架） |
| [`feature_list.json`](../feature_list.json) | 功能状态队列（pass / not-started / evidence） |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 分层与 IPC，不写细交互 |
| [`DESIGN.md`](./DESIGN.md) | 认证与产品视觉 token / 组件约定 |

新功能：先在索引表加一行 → 参考任一已有 `product-specs/<id>.md` 新建同结构文件 → 在 `feature_list.json` 加条目。  
改交互：只改对应 `product-specs/<id>.md`，并视需要更新 `feature_list` 的 `description` / `status`。

## 全局 UI 约定

- 未解锁（设置 / 登录 / 恢复）：**横向宽认证窗**（左角色 / 右表单），无完整原生菜单；设置与恢复中密码与确认为分步（详见 `login-window-flow`）。
- 视觉 token 与 mock 对齐规则见 [`DESIGN.md`](./DESIGN.md)（上区居中标题、下划线输入、黑胶囊 CTA、无第三方登录）。
- 已解锁：主窗口 + 完整原生菜单。
- 用户可见文案默认简体中文，经 `src/renderer/i18n/`；错误态有明确文案，不静默失败。
- Renderer 只通过 `window.vault` 访问保险箱；机密不离开本机。

## 功能索引

| ID | 交互类型 | 一句话 | 规格 |
|----|----------|--------|------|
| `vault-setup` | 表单流 | 首次设置主密码并备份恢复提示词 | [product-specs/vault-setup.md](./product-specs/vault-setup.md) |
| `vault-login-restore` | 表单流 | 主密码解锁或提示词恢复 | [product-specs/vault-login-restore.md](./product-specs/vault-login-restore.md) |
| `login-window-flow` | 窗口流 | 登录与助记词忘记密码交互体验优化 | [product-specs/login-window-flow.md](./product-specs/login-window-flow.md) |
| `entry-list` | 列表流 | 解锁后展示条目列表 | [product-specs/entry-list.md](./product-specs/entry-list.md) |
| `entry-crud` | 表单流 | 条目增删改查 | [product-specs/entry-crud.md](./product-specs/entry-crud.md) |
| `ui-zh-i18n-ready` | 菜单/设置流 | 中文 UI 与语言菜单预留 | [product-specs/ui-zh-i18n-ready.md](./product-specs/ui-zh-i18n-ready.md) |
| `dev-hmr` | 工程能力 | 开发热更新与主进程自动重启 | [product-specs/dev-hmr.md](./product-specs/dev-hmr.md) |

状态与证据以 `feature_list.json` 为准；上表不维护 pass/fail。

## 当前非目标（Non-goals）

- 云同步 / 多设备
- 浏览器扩展
- 密码分享 / 团队协作
- 向其他应用自动填充
- 生物识别解锁（可后续再加）
- 完整多语言包与系统语言自动跟随（当前仅预留语言菜单与文案分层）
- 用户自定义「密码提示」短句（恢复仍使用系统生成的 BIP39 提示词）

## 技术栈

- Electron（main / preload / renderer）
- 通过 `sql.js` 使用 SQLite（本地加密保险箱存储；WASM，无需原生重建）
- React + TypeScript
- Tailwind CSS + shadcn 风格 UI 组件
- Node crypto + BIP39 助记词（产品文案称「恢复提示词」）

## 验收原则

- 密钥与机密数据不得离开本机。
- Renderer 不得直接触碰文件系统或 SQLite；全部保险箱操作必须经 IPC。
- 功能只有在具备可运行验证证据、并已写入 `feature_list.json` 后，才算完成。
- 实现与改交互时，以对应 `product-specs/<id>.md` 为验收合同。
