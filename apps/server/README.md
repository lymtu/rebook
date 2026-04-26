# @rebook/server

Elysia + Bun + Drizzle ORM backend.

## Local dev

```bash
cp .env.example .env
# 启动数据库（在仓库根目录）
docker compose up -d postgres
# 在仓库根目录
pnpm install
pnpm db:generate    # only when schema changes
pnpm db:migrate
pnpm db:seed        # optional, creates admin / demo users
pnpm dev:server
```

接口文档：http://localhost:3000/docs

种子用户（仅本地）：

| 用户名 | 密码 | 角色 |
| --- | --- | --- |
| `admin` | `password123` | admin |
| `demo` | `password123` | user |

## 添加新功能

请遵循 `.cursor/skills/elysia-route` 与 `.cursor/skills/db-schema`，并先在 `packages/shared` 定义类型与 Zod schema。
