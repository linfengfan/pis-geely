# 投研平台后端架构设计文档

**版本：** v1.0
**作者：** 后端架构师
**日期：** 2026-05-10
**状态：** 初稿

---

## 1. 系统架构决策

### 1.1 架构模式选择

**决策：Next.js Monolithic + Serverless API Routes**

| 方案 | 优势 | 劣势 | 适用性 |
|------|------|------|--------|
| Next.js Monolithic | 部署简单、SSR/CSR 统一、API 同构 | 单体扩展受限 | ✅ 当前首选 |
| 独立 Node.js 微服务 | 独立扩缩容、语言灵活 | 服务治理复杂、运维成本高 | ❌ 过度设计 |
| BFF + 微服务 | 前端友好、职责分离 | 架构复杂度高 | ❌ 当前阶段不适用 |

**结论：** 投研平台当前阶段为中小型应用，用户量有限，采用 Next.js API Routes 单体架构，可在后续业务增长时平滑拆分为独立服务。

### 1.2 架构分层

```
┌─────────────────────────────────────────────┐
│              Presentation Layer              │
│         (Next.js Pages / App Router)        │
├─────────────────────────────────────────────┤
│               API Layer                      │
│    (Next.js API Routes - Route Handlers)    │
├─────────────────────────────────────────────┤
│             Service Layer                    │
│  (lib/services/*.ts - 业务逻辑封装)          │
├─────────────────────────────────────────────┤
│            Data Access Layer                 │
│        (lib/repositories/*.ts)              │
├─────────────────────────────────────────────┤
│          Infrastructure Layer               │
│    (Prisma ORM / PostgreSQL / Cache)        │
└─────────────────────────────────────────────┘
```

### 1.3 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # 主布局路由组
│   ├── api/               # API Routes
│   │   ├── company/
│   │   ├── financial/
│   │   ├── macro/
│   │   ├── pool/
│   │   ├── portfolio/
│   │   ├── valuation/
│   │   └── settings/
│   └── page.tsx
├── lib/                    # 核心库
│   ├── prisma.ts          # Prisma 客户端单例
│   ├── services/          # 业务服务层
│   │   ├── companyService.ts
│   │   ├── valuationService.ts
│   │   ├── analysisService.ts
│   │   └── portfolioService.ts
│   ├── repositories/      # 数据访问层
│   │   ├── companyRepo.ts
│   │   └── macroRepo.ts
│   ├── analysis/          # 分析相关
│   │   ├── llmAnalyzer.ts
│   │   └── valuationModels.ts
│   ├── utils/             # 工具函数
│   │   ├── validation.ts
│   │   └── formatters.ts
│   └── constants.ts       # 常量定义
├── components/            # React 组件
└── types/                 # TypeScript 类型
    └── index.ts
```

---

## 2. 数据库设计

### 2.1 当前 Prisma Schema 分析

**已建模实体：**

| 模型 | 用途 | 关联关系 |
|------|------|----------|
| Company | 上市公司基本信息 | 一对多：FinancialData, Analysis; 多对多：Holding |
| FinancialData | 财务数据（年报） | 属于 Company |
| Analysis | 投资分析记录 | 属于 Company |
| Portfolio | 投资组合 | 一对多：Holding |
| Holding | 持仓记录 | 属于 Portfolio + Company |
| MacroSnapshot | 宏观数据快照 | 独立实体 |

### 2.2 Schema 优化建议

#### 2.2.1 缺失索引

```prisma
// FinancialData - 按年份范围查询
@@index([companyId, year])

// Analysis - 按公司+创建时间排序
@@index([companyId, createdAt])

// Holding - 按组合查询
@@index([portfolioId])

// MacroSnapshot - 按创建时间范围查询
@@index([createdAt])
```

#### 2.2.2 建议新增模型

```prisma
// 2.2.2.1 用户配置模型（支持多用户）
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  apiKey        String?  // 加密存储
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  portfolios    Portfolio[]
  macroSnapshots MacroSnapshot[]

  @@map("users")
}

// 2.2.2.2 估值模型配置（支持自定义参数）
model ValuationConfig {
  id              String   @id @default(cuid())
  userId          String
  companyType     CompanyType
  defaultWacc     Float
  terminalGrowth  Float
  projectionYears Int
  createdAt      DateTime @default(now())

  @@index([userId, companyType])
  @@map("valuation_configs")
}

// 2.2.2.3 缓存模型（用于存储LLM分析结果）
model AnalysisCache {
  id          String   @id @default(cuid())
  cacheKey    String   @unique
  result      Json
  createdAt   DateTime @default(now())
  expiresAt   DateTime

  @@map("analysis_cache")
}
```

### 2.3 数据库迁移策略

```bash
# 开发环境：prisma db push（快速同步）
npm run db:push

# 生产环境：prisma migrate（版本化管理）
npx prisma migrate dev --name add_user_model
npx prisma migrate deploy
```

---

## 3. API 设计规范

### 3.1 RESTful 规范

| 资源 | GET | POST | PUT | DELETE |
|------|-----|------|-----|--------|
| /api/company | 列表 | 创建 | - | - |
| /api/company/[id] | 单条 | - | 更新 | 删除 |
| /api/financial | - | 创建财务数据 | - | - |
| /api/macro | 获取最新 | 创建快照 | - | - |
| /api/pool | 股票池列表 | - | - | - |
| /api/portfolio | 组合列表 | 创建组合 | - | - |
| /api/portfolio/holding | 持仓列表 | 添加持仓 | - | - |
| /api/valuation | - | 估值计算 | - | - |
| /api/analyze | - | LLM分析 | - | - |

### 3.2 统一响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-05-10T12:00:00Z"
}

// 错误响应
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "详细错误信息",
  "details": { ... }  // 可选，开发环境额外信息
}
```

### 3.3 错误码规范

| 错误码 | HTTP状态 | 说明 |
|--------|----------|------|
| VALIDATION_ERROR | 400 | 请求参数校验失败 |
| API_KEY_NOT_CONFIGURED | 400 | 未配置 API Key |
| NOT_FOUND | 404 | 资源不存在 |
| UNAUTHORIZED | 401 | 未授权访问 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

### 3.4 API 版本管理

**当前策略：** 无版本前缀（v1 阶段）
**后续演进：** `/api/v1/*` → 保持向后兼容

```typescript
// 当前：/api/company
// 演进后：/api/v1/company（兼容旧路由）
```

---

## 4. 安全性设计

### 4.1 认证与授权

#### 4.1.1 API Key 管理

```typescript
// lib/security/apiKeyGuard.ts
export function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key')
  return apiKey === process.env.VALID_API_KEY
}

// Middleware 应用
export async function withApiKeyAuth(
  handler: NextRequestHandler
): Promise<NextResponse> {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { success: false, error: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }
  return handler(request)
}
```

#### 4.1.2 敏感数据加密

```typescript
// lib/security/encryption.ts
import { createCipheriv, createDecipheriv } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY = process.env.ENCRYPTION_KEY!

export function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, SECRET_KEY, iv)
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}
```

### 4.2 输入校验

#### 4.2.1 Zod Schema 校验

```typescript
// lib/utils/validation.ts
import { z } from 'zod'

export const CompanySchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().regex(/^\d{6}$/, '股票代码必须为6位数字'),
  industry: z.string().optional(),
  companyType: z.enum(['BANK_WATER', 'CONSUMER', 'GROWTH', 'HEAVY_ASSET']).optional(),
})

export const MacroSnapshotSchema = z.object({
  cn10y: z.number().min(0).max(10),
  usdcny: z.number().min(6).max(8),
  lpr: z.number().min(0).max(10),
  m2: z.number().optional(),
  socialFinancing: z.number().optional(),
  cpi: z.number().optional(),
  pmi: z.number().optional(),
})

export const ValuationRequestSchema = z.object({
  companyName: z.string().min(1),
  financialData: z.object({
    netProfit: z.number().min(0),
    shares: z.number().min(0),
    operatingCashFlow: z.number(),
    dividendPerShare: z.number().min(0),
    equity: z.number().min(0),
    roe: z.number().min(-100).max(100),
  }),
  macroData: MacroSnapshotSchema,
  valuationParams: z.object({
    wacc: z.number().min(0).max(30),
    terminalGrowthRate: z.number().min(-5).max(10),
    dividendRatio: z.number().min(0).max(1),
    projectionYears: z.number().int().min(1).max(10),
  }),
  currentPrice: z.number().min(0),
})
```

### 4.3 速率限制

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; resetAt: number }>()

export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const limit = 100 // 每分钟100次
  const windowMs = 60000

  const current = rateLimit.get(ip)

  if (current && Date.now() < current.resetAt) {
    if (current.count >= limit) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }
    current.count++
  } else {
    rateLimit.set(ip, { count: 1, resetAt: Date.now() + windowMs })
  }

  return null // 继续处理请求
}
```

### 4.4 SQL 注入防护

**Prisma ORM 本身提供参数化查询，但仍需注意：**

```typescript
// ❌ 危险：动态表名
await prisma.$queryRaw`SELECT * FROM ${tableName}`

// ✅ 安全：Prisma 查询构建器
await prisma.company.findMany({
  where: {
    code: { equals: userInput }  // 自动转义
  }
})
```

---

## 5. 性能与可扩展性规划

### 5.1 数据库性能优化

#### 5.1.1 查询优化

```typescript
// lib/repositories/companyRepo.ts
export async function getCompanyWithLatestAnalysis(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      financialData: {
        orderBy: { year: 'desc' },
        take: 5,  // 仅获取最近5年
      },
      analysis: {
        orderBy: { createdAt: 'desc' },
        take: 1,  // 仅获取最新分析
      },
    },
  })
}
```

#### 5.1.2 N+1 问题解决

```typescript
// 在 Prisma 查询中使用 include 预加载
const portfolios = await prisma.portfolio.findMany({
  include: {
    holdings: {
      include: {
        company: true,  // 预加载，避免 N+1
      },
    },
  },
})
```

### 5.2 缓存策略

#### 5.2.1 应用层缓存

```typescript
// lib/cache/macroCache.ts
import { NodeCache } from 'node-cache'

const macroCache = new NodeCache({ ttl: 300 }) // 5分钟缓存

export function getCachedMacroData(): MacroSnapshot | null {
  return macroCache.get<MacroSnapshot>('latest') || null
}

export function setCachedMacroData(data: MacroSnapshot): void {
  macroCache.set('latest', data)
}
```

#### 5.2.2 Redis 缓存（生产环境）

```typescript
// lib/cache/redis.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function cacheValuationResult(
  key: string,
  result: ValuationResult,
  ttl = 3600
): Promise<void> {
  await redis.setex(`valuation:${key}`, ttl, JSON.stringify(result))
}

export async function getCachedValuation(key: string): Promise<ValuationResult | null> {
  const cached = await redis.get(`valuation:${key}`)
  return cached ? JSON.parse(cached) : null
}
```

### 5.3 LLM 调用优化

#### 5.3.1 结果缓存

```typescript
// lib/services/valuationService.ts
import { getCachedValuation, cacheValuationResult } from '@/lib/cache/redis'

export async function calculateValuation(params: ValuationParams) {
  const cacheKey = generateCacheKey(params)

  // 先查缓存
  const cached = await getCachedValuation(cacheKey)
  if (cached) {
    return { ...cached, fromCache: true }
  }

  // 缓存未命中，执行 LLM 调用
  const result = await callLLMValuation(params)

  // 写入缓存（1小时）
  await cacheValuationResult(cacheKey, result, 3600)

  return { ...result, fromCache: false }
}

function generateCacheKey(params: ValuationParams): string {
  return crypto.createHash('md5')
    .update(JSON.stringify(params))
    .digest('hex')
}
```

#### 5.3.2 并发控制

```typescript
// lib/utils/semaphore.ts
class Semaphore {
  private count: number
  private queue: (() => void)[] = []

  constructor(count: number) {
    this.count = count
  }

  async acquire(): Promise<void> {
    if (this.count > 0) {
      this.count--
      return
    }
    return new Promise(resolve => this.queue.push(resolve))
  }

  release(): void {
    this.count++
    const next = this.queue.shift()
    if (next) {
      this.count--
      next()
    }
  }
}

const llmSemaphore = new Semaphore(3) // 同时最多3个LLM请求

export async function callLLMWithLimit(prompt: string): Promise<string> {
  await llmSemaphore.acquire()
  try {
    return await anthropic.messages.create({ ... })
  } finally {
    llmSemaphore.release()
  }
}
```

### 5.4 水平扩展路径

```
当前阶段 (v1)
├── 单实例 Next.js + PostgreSQL
└── 限制：单进程 LLM 调用

中期扩展 (v2)
├── Next.js 多实例 + 负载均衡
├── PostgreSQL 主从复制
└── Redis 集群缓存

远期扩展 (v3)
├── 拆分独立估值服务（Python/FastAPI）
├── LLM 服务独立部署
└── Kafka 异步任务队列
```

---

## 6. 服务层设计

### 6.1 估值服务（核心）

```typescript
// lib/services/valuationService.ts
import { ValuationRequestSchema } from '@/lib/utils/validation'
import { prisma } from '@/lib/prisma'

export interface ValuationResult {
  intrinsicValue: number
  recommendedModel: 'PE' | 'DCF' | 'DDM' | 'PB-ROE'
  conclusion: '低估' | '合理' | '观望' | '高估'
  allModels: Record<string, ModelResult>
  reasoning: string
}

export async function executeValuation(params: unknown): Promise<ValuationResult> {
  // 1. 参数校验
  const validated = ValuationRequestSchema.parse(params)

  // 2. 业务逻辑：调用 LLM
  const result = await callLLMValuation(validated)

  // 3. 结果持久化
  await saveValuationRecord(validated, result)

  return result
}
```

### 6.2 分析服务

```typescript
// lib/services/analysisService.ts
export interface AnalysisContext {
  markdown: string
  companyName: string
  code?: string
  currentPrice?: number
  macroData: MacroSnapshot
  sharesOutstanding?: number
  dividendPerShare?: number
}

export async function analyzeCompany(context: AnalysisContext): Promise<AnalysisResult> {
  // 1. 调用 LLM 分析
  const result = await analyzeWithLLM(context)

  // 2. 保存分析记录
  await saveAnalysisRecord(context, result)

  return result
}
```

---

## 7. 环境配置

### 7.1 环境变量清单

```bash
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/research_db"

# LLM API
ANTHROPIC_API_KEY="sk-ant-xxxxx"

# 安全
ENCRYPTION_KEY="32字节十六进制字符串"

# 缓存（生产环境）
REDIS_URL="redis://localhost:6379"

# 速率限制
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=100
```

### 7.2 配置验证

```typescript
// lib/config/validate.ts
import { z } from 'zod'

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export function validateEnv(): void {
  EnvSchema.parse(process.env)
}
```

---

## 8. 监控与日志

### 8.1 结构化日志

```typescript
// lib/utils/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

// API 日志中间件
export function logApiRequest(
  method: string,
  path: string,
  duration: number,
  status: number
) {
  logger.info({
    type: 'api_request',
    method,
    path,
    duration,
    status,
  })
}
```

### 8.2 关键指标

| 指标 | 告警阈值 | 采集方式 |
|------|----------|----------|
| API 响应时间 P95 | > 5000ms | APM |
| LLM 调用失败率 | > 5% | 业务日志 |
| 数据库连接数 | > 80% 最大连接 | PostgreSQL metrics |
| 错误率 | > 1% | 日志聚合 |

---

## 9. 待细化事项

以下内容需等待投研顾问确认后补充：

- [ ] **估值模型参数体系**：各企业生命周期对应的默认 WACC、永续增长率
- [ ] **财务数据接口**：数据源（东方财富/同花顺）对接方式
- [ ] **LLM 分析模板**：投研顾问的分析 Prompt 模板
- [ ] **实时行情接入**：股价实时/定时更新方案
- [ ] **用户体系**：多用户数据隔离方案

---

## 10. 实施计划

| 阶段 | 内容 | 优先级 | 依赖 |
|------|------|--------|------|
| **Phase 1** | 目录结构重构 + Service 层封装 | P0 | - |
| **Phase 2** | 输入校验完善（Zod） + 错误处理统一 | P0 | Phase 1 |
| **Phase 3** | API Key 安全加固 + 速率限制 | P1 | - |
| **Phase 4** | 缓存层实现（NodeCache → Redis） | P2 | Phase 1 |
| **Phase 5** | LLM 并发控制 + 结果缓存 | P2 | Phase 1 |
| **Phase 6** | 监控日志集成 + APM 接入 | P3 | Phase 1 |

---

**文档状态：** 待评审
**后续动作：** 后端开发工程师根据本文档实施 Phase 1-2
