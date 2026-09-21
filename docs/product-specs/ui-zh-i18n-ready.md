# `ui-zh-i18n-ready` — 中文界面与语言菜单预留

**阶段：** S1 | **依赖：** `entry-crud` | **交互类型：** 菜单/设置流  
**状态：** 见 `feature_list.json`

## 目标

用户可见文案默认简体中文；原生菜单在 Help 后提供 Settings（含 Language），为后续完整国际化预留。

## 用户路径 / 交互细节

1. 默认语言 `zh-CN`；界面与菜单标签中文。
2. Settings → Language 可切换中/英（菜单与窗口标题跟随）。
3. Help 之后为 Settings；Language 下可有「更多」预留项（禁用）。

## 状态与反馈

| 场景 | 表现 |
|------|------|
| 切换语言 | 菜单立即重建；renderer 收到 locale 变更 |
| 认证态 | 完整 Settings 菜单隐藏（见 `login-window-flow`）；文案仍走 i18n |

## 窗口或界面形态

主窗口显示完整菜单时可用 Settings；认证态不依赖菜单改语言（可后续补 UI 入口）。

## 验收清单

- [ ] 默认中文文案覆盖设置/登录/主界面主要路径
- [ ] Settings 位于 Help 之后，含 Language
- [ ] 切换语言后面板与菜单标签一致

## 本功能非目标

- 跟随系统语言自动切换
- 完整多语言包（仅 en 预留）
