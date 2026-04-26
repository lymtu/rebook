# @rebook/miniapp

Taro 4 + React + TypeScript + NutUI-React-Taro 小程序。

## Local dev

```bash
# 在仓库根目录
pnpm install
# 设置后端地址（可选）
TARO_APP_API_BASE_URL=http://localhost:3000 pnpm dev:miniapp
```

编译产物在 `apps/miniapp/dist/`。用「微信开发者工具」导入这个目录即可调试。

> 微信小程序需要将本地 API 域名加入「不校验合法域名」开发者设置，或使用 ngrok/frp 给后端套一个 https。

## 添加新功能

请遵循 `.cursor/skills/taro-page`。
