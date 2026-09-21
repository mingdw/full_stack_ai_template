# 进度日志 (progress.md)

## 当前状态

- **活动功能：** `login-window-flow`（右侧登录区对齐产品 mock）
- **基线：** `npm run check` + `npm test`（5/5）于 2026-09-03 通过

## 本会话

### 右侧登录区按 mock 对齐

- 标题「欢迎回来！」上区居中；副标题 muted
- 下划线密码输入 + 眼睛 icon 显隐
- 「记住密码」勾选（仅存偏好，不存主密码）+「忘记密码？」链接
- 近黑胶囊「登录」按钮；无 Google 登录
- Setup / Restore 同步 underline + EyeToggle + 胶囊主按钮
- 写入 `docs/DESIGN.md`；更新 `login-window-flow` / `PRODUCT.md`

### 验证

- `npm run check` ✅
- `npm test` ✅ 5/5

## 下一步

- `npm run dev` 人工冒烟：右侧上区标题、下划线输入、记住/忘记、黑胶囊、无 Google
