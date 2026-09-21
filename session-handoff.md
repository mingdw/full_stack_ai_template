# 会话交接 (session-handoff)

## What Was Accomplished（已完成）

- 登录右侧按 mock：上区居中标题、下划线密码、眼睛显隐、记住/忘记、近黑胶囊 CTA、无 Google
- Setup/Restore 表单样式对齐；i18n 补 `login.passwordLabel` / `login.remember` 等
- `docs/DESIGN.md` + 规格同步；`npm run check` + `npm test` 通过

## What Remains（仍待完成）

- `npm run dev` 人工确认视觉与窗口切换

## Blockers / Decisions（阻塞与决策）

- 「记住密码」仅 localStorage 勾选偏好，绝不持久化主密码明文
- CTA 用近黑 `#111`（对齐 mock），焦点环仍用青绿 `#059669`

## Next Session Should（Recommended Next Step）

`npm run dev` 冒烟后刷新 `feature_list.json` evidence；或继续 VaultHome polish。
