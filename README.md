# full_stack_ai_template

一个面向产研一线的全栈 AI 项目模板，基于 **Node.js + PostgreSQL + Redis** 构建，内置对 AI 编码助手友好的工程结构与 **Harness Engineering** 最佳实践，帮助团队更可靠地使用 AI 完成真实开发任务。

## 项目简介

本仓库旨在提供一套可直接复用的全栈项目脚手架，覆盖从本地开发到 AI 协作的完整工作流：

- **全栈技术栈**：Node.js 后端 + PostgreSQL 持久化 + Redis 缓存与会话
- **产研 AI 友好**：仓库结构、文档与约定面向产品、研发一线日常使用 AI 助手
- **Harness Engineering**：围绕 AI Agent 的环境、状态、验证与控制机制，沉淀可落地的最佳实践

> 核心理念：**模型决定写什么代码，Harness 决定何时、在哪、按什么标准写。**

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 运行时 | Node.js | 后端与工具链 |
| 数据库 | PostgreSQL | 主数据存储 |
| 缓存 | Redis | 缓存、Session、限流、队列 |
| AI 协作 | Cursor / Codex / Claude Code | 支持主流 AI 编码助手 |

## Harness Engineering 实践

本模板遵循 [Learn Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering) 的五子系统模型，在仓库中逐步落地以下组件：

| 子系统 | 组件 | 作用 |
|--------|------|------|
| **Instructions** | `AGENTS.md`、Rules、Skills | 项目操作手册与按需工作流 |
| **Tools** | MCP、Shell、Sub-agents | 扩展 Agent 可执行能力 |
| **Environment** | `init.sh`、依赖锁定、CI | 可复现的开发与验证环境 |
| **State** | `progress.md`、`feature_list.json` | 跨会话进度与任务边界 |
| **Feedback** | 测试、Lint、Hooks 门禁 | 可验证的完成标准 |

## 目录结构

```text
full_stack_ai_template/
├── README.md           # 项目说明
├── AGENTS.md           # AI Agent 操作手册（规划中）
├── project/            # Harness Engineering 学习与实战目录
│   └── project-01/     # 课程项目实践
└── ...                 # 应用代码与配置（逐步完善）
```

## 快速开始

> 项目脚手架正在完善中，以下为预期工作流。

```bash
# 克隆仓库
git clone https://github.com/mingdw/full_stack_ai_template.git
cd full_stack_ai_template

# 初始化环境（规划中）
# ./init.sh

# 安装依赖（规划中）
# npm install

# 启动开发服务（规划中）
# npm run dev
```

## 适用场景

- 需要 **Node + PostgreSQL + Redis** 技术栈的新项目起步
- 产研团队希望 **规范化 AI 协作流程**，减少 Agent 失控与返工
- 学习并实践 **Harness Engineering**，从 Prompt 升级到可验证的工程体系
- 作为 **AI 友好型全栈模板**，快速 scaffold 业务项目

## 学习资源

- [Learn Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering) — 系统化 Harness 课程
- [Awesome Harness Engineering](https://github.com/walkinglabs/awesome-harness-engineering) — 相关资源索引
- [OpenAI: Harness Engineering](https://openai.com/index/harness-engineering/) — 业界实践参考

## License

MIT
