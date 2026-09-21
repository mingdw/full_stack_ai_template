# `dev-hmr` — 开发热更新与主进程自动重启

**阶段：** S1 | **依赖：** `ui-zh-i18n-ready` | **交互类型：** 工程能力  
**状态：** 见 `feature_list.json`

## 目标

本地开发时：改 renderer 可热更新；改 main/preload/services 后自动重启 Electron，减少手动关窗。

## 用户路径 / 交互细节

（面向开发者，非终端用户）

1. `npm run dev` 启动 Vite 开发服务器与 Electron。
2. 保存 `src/renderer/**` → 窗口内 HMR。
3. 保存 main/preload/services 并编译输出变更 → 自动重启 Electron。

## 状态与反馈

| 场景 | 表现 |
|------|------|
| Vite 就绪 | 终端出现 ready；Electron 加载 `VITE_DEV_SERVER_URL` |
| 重启 | 终端提示重启；窗口重新打开 |

## 窗口或界面形态

不影响产品窗口模式约定；生产/常规 `build` 仍加载 `dist/renderer`。

## 验收清单

- [ ] `npm run check` / `test` / `build` 仍可通过
- [ ] `npm run dev` 能拉起 Vite + Electron
- [ ] renderer 修改可热更新；main 修改可触发自动重启

## 本功能非目标

- 引入 concurrently 等额外进程编排依赖（当前自建 `scripts/dev.js`）
