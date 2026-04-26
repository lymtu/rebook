# rebook

> 二手书交易应用 — C2C 模式，覆盖书目浏览、上架、搜索、订单、聊天与评价。
> 三端单仓：**Elysia 后端 + React Web + Taro 小程序**，共享类型契约。

---

## 技术栈

| 分层 | 技术选型 |
| --- | --- |
| 后端运行时 | [Bun](https://bun.sh) ≥ 1.1 |
| 后端框架 | [Elysia.js](https://elysiajs.com) |
| ORM / 数据库 | [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL ≥ 15 |
| 校验 | [Zod](https://zod.dev) + [drizzle-zod](https://orm.drizzle.team/docs/zod) |
| Web 框架 | React 18 + [Vite](https://vitejs.dev) + TypeScript |
| Web UI | [Ant Design 5](https://ant.design) + [Tailwind CSS](https://tailwindcss.com) |
| Web 状态 | [TanStack Query](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs) |
| 小程序框架 | [Taro 4](https://taro-docs.jd.com) + React + TypeScript |
| 小程序 UI | [NutUI-React-Taro](https://nutui.jd.com) |
| 鉴权 | JWT（Web httpOnly Cookie + 小程序 Bearer Token） |
| 对象存储 | 抽象 `StorageProvider`，默认腾讯云 COS |
| 包管理器 | pnpm 9+ |
| 代码规范 | ESLint + Prettier |

---

## 目录结构

```
rebook/
├── apps/
│   ├── server/        # Elysia + Bun 后端（API、鉴权、订单、推送）
│   ├── web/           # React + Vite 网页端（管理后台 + 用户站）
│   └── miniapp/       # Taro 小程序（主投放微信）
├── packages/
│   └── shared/        # 跨端共享：DTO、Zod schema、常量、API 契约
├── .cursor/
│   ├── rules/         # Cursor 常驻规则
│   └── skills/        # 领域 SKILL.md（按需自动加载）
├── pnpm-workspace.yaml
├── package.json       # 根 workspace
├── README.md
└── AGENTS.md          # AI Agent 工作守则
```

---

## 环境要求

- **Node.js** ≥ 20（用于 Web/小程序工具链；通过 `.nvmrc` 锁版本）
- **Bun** ≥ 1.1（仅后端运行时）
- **pnpm** ≥ 9（统一包管理器）
- **PostgreSQL** ≥ 15（建议本地用 Docker 起一个）
- **Docker**（可选，用于本地 DB / 对象存储模拟）
- **微信开发者工具**（开发小程序时）

---

## 快速开始

```bash
# 1. 安装依赖（根目录执行，会装好三端）
pnpm install

# 2. 启动 PostgreSQL + MinIO（COS 本地替身）
docker compose up -d

# 3. 配置环境变量
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
# 按需修改 DATABASE_URL / JWT_SECRET / COS_* 等

# 4. 执行数据库迁移 + 写入种子用户（admin / demo，密码 password123）
pnpm db:migrate
pnpm db:seed

# 5. 同时启动三端（也可分别启动，见下方脚本）
pnpm dev
```

> 默认本地账号：`admin` / `password123`（管理员）、`demo` / `password123`（普通用户）。
> MinIO 控制台：http://localhost:9001 （账号 `rebook` / `rebook12345`）。

服务启动后：

| 端 | 地址 |
| --- | --- |
| 后端 API | http://localhost:3000 |
| Web 网页 | http://localhost:5173 |
| 小程序 | 用微信开发者工具导入 `apps/miniapp/dist`（编译产物目录） |

---

## 常用脚本（均从根目录运行）

### 开发

```bash
pnpm dev              # 三端并行启动
pnpm dev:server       # 仅后端
pnpm dev:web          # 仅 Web
pnpm dev:miniapp      # 仅小程序（默认编译微信）
```

### 构建 / 检查

```bash
pnpm build            # 全量构建
pnpm typecheck        # 类型检查
pnpm lint             # 代码风格检查
pnpm format           # Prettier 格式化
pnpm test             # 单元测试
```

### 数据库

```bash
pnpm db:generate      # 由 schema 生成迁移文件
pnpm db:migrate       # 应用迁移
pnpm db:studio        # 启动 Drizzle Studio 浏览数据
pnpm db:seed          # 写入种子数据
```

---

## 新增功能的标准流程

```
1. packages/shared      → 定义 DTO + Zod schema
2. apps/server          → 加 route + service + 单元测试
3. db-schema (如需新表) → 改 Drizzle schema → generate → migrate
4. apps/web             → 加页面 + Query hook
5. apps/miniapp         → 加页面 + Taro.request 调用
6. 联调与回归
```

> 详细规范见 [AGENTS.md](./AGENTS.md)。每一步都有对应的 Cursor Skill 自动加载。

---

## 分支与提交规范

- **分支命名**：`feat/<scope>-<short-desc>` / `fix/<scope>-<short-desc>` / `chore/<...>`
- **提交信息**：[Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)
  - `feat(server): add book listing endpoint`
  - `fix(web): correct cart total calculation`
  - `chore: bump pnpm to 9.15`
- **Pull Request**：标题用同样格式，描述包含「动机 / 改动 / 验证方式」三段

---

## License

MIT
