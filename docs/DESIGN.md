# DESIGN.md — 认证与产品视觉约定

面向 `login-window-flow` 与后续界面的轻量设计系统。交互细节仍以 `docs/product-specs/` 为准。

## 方向

- Soft UI Evolution + Minimalism；趣味信任感来自左侧角色，右侧表单保持克制。
- 混合参考：Password Manager（可信、清晰）+ Productivity Tool（青绿焦点）。
- 登录右侧布局对齐产品 mock（非 Google 登录页）：上区居中标题、下划线输入、眼睛显隐、记住/忘记、黑胶囊 CTA。

## 色板

| Token | 值 | 用途 |
|-------|-----|------|
| Primary CTA | `#111111`（近黑） | 登录 / 主操作胶囊按钮 |
| Navy | `#1E3A5F` | 品牌/导航强调（主界面可复用） |
| Focus / accent | `#059669` | 焦点环、成功态 |
| 角色区底 | `#e9e9e9` | 左栏背景 |
| 表单区底 | `#ffffff` | 右栏背景 |
| 下划线 | `#d1d5db` | 输入底边；聚焦时加深为前景色 |

## 排版

- 字体：Plus Jakarta Sans（回退 Segoe UI / system）。
- 登录标题：约 1.75–1.875rem、粗体、右侧上区**水平居中**。
- 副标题：`text-sm`、muted 灰。
- 表单标签：约 13px medium。

## 组件规则

- **输入（认证）**：仅底边框（underline），无盒形边框。
- **密码显隐**：icon only（`EyeToggle`），无「显示/隐藏」文字。
- **主按钮**：`h-12`、`rounded-full`、近黑底白字。
- **链接**：muted，「忘记密码？」等；hover 加深并下划线。
- **记住密码**：仅存勾选偏好；禁止持久化主密码明文。
- **不做**：Google / 第三方登录按钮、紫色渐变 chrome、认证窗卡片圆角浮层。

## 窗口

- 认证态约 `780×480`；主窗口约 `1100×720`。
- 左栏角色底边与右栏主 CTA 底边视觉对齐。

## 动效

- 按钮 hover/active 轻缩放；角色 lean / peek / surprise 克制使用。
- 尊重 `prefers-reduced-motion`。
