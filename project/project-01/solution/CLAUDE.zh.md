# CLAUDE.md -- Claude Code 快速参考

@AGENTS.md

> 中文译本见：`AGENTS.zh.md`

## 项目概览

这是一个基于 Electron + TypeScript + React 的知识库应用。代码库分为四层：主进程、preload、渲染进程、services。

## 构建与运行

```bash
npm install        # 安装依赖
npm run check      # 类型检查（不输出文件）
npm run build      # 编译 main/preload + 打包 renderer
npm run dev        # 构建并启动 Electron
```

## 关键文件

| 文件 | 用途 |
|------|------|
| `src/main/main.ts` | Electron 入口，窗口创建，服务接线 |
| `src/main/ipc-handlers.ts` | IPC 通道注册 |
| `src/preload/preload.ts` | contextBridge API 暴露 |
| `src/renderer/App.tsx` | 根 React 组件 |
| `src/services/*.ts` | 业务逻辑（文档、索引、问答、持久化） |
| `src/shared/types.ts` | 共享类型与 IPC 通道常量 |
| `feature_list.json` | 功能跟踪（pass/fail 状态） |

## 架构规则

- 渲染进程不得导入 Node.js 模块。
- 主进程与渲染进程的通信全部通过 IPC。
- Services 通过构造函数注入使用 `PersistenceService`。
- IPC 通道名统一放在 `src/shared/types.ts`。

## 如何添加功能

1. 在 `src/shared/types.ts` 中定义 IPC 通道。
2. 在 `src/main/ipc-handlers.ts` 中添加 handler。
3. 在 `src/preload/preload.ts` 中暴露 API。
4. 在 `src/renderer/types.d.ts` 中补充类型声明。
5. 在 `src/renderer/components/` 中实现 UI。
6. 更新 `feature_list.json` 记录结果。

## 测试

```bash
npm test           # 运行 vitest 套件
npm run test:watch # watch 模式运行测试
```
