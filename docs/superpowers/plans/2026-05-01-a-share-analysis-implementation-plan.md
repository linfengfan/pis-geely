# A 股分析系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 A 股价值投资分析系统 v1.0，支持单公司分析、股票池对比、组合跟踪

**Architecture:** 
- 前端: Next.js 16 (App Router) + React 19 + TailwindCSS 4
- 后端: Next.js API Routes / Server Actions
- 数据库: PostgreSQL (Prisma ORM)
- 图表: Recharts + Ant Design Charts

**Tech Stack:** Next.js 16, React 19, TailwindCSS 4, Prisma, PostgreSQL, Recharts

---

## File Structure

```
├── prisma/
│   └── schema.prisma          # 数据库模型
├── src/
│   ├── app/
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首页
│   │   ├── analyze/
│   │   │   ├── page.tsx    # 分析页
│   │   │   └── [id]/      # 分析详情
│   │   ├── pool/
│   │   │   └── page.tsx   # 股票池
│   │   ├── portfolio/
│   │   │   └── page.tsx   # 组合
│   │   └── settings/
│   │       └── page.tsx   # 设置
│   ├── components/          # React 组件
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts      # 工具函数
│   └── styles/
│       └── globals.css   # 全局样式
├── public/                  # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── prisma/
    └── schema.prisma
```

---

## M1: 基础框架 (2周)

### Task 1: 初始化 Next.js 项目

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "a-share-analyst",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^6.0.0",
    "recharts": "^2.15.0",
    "ant-design-charts": "^2.2.0",
    "antd": "^5.24.0",
    "lucide-react": "^0.500.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.5.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: 创建 next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
```

- [ ] **Step 4: 创建 tailwind.config.ts (TailwindCSS 4)**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 5: 创建 postcss.config.mjs**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: 创建 src/app/globals.css**

```css
@import 'tailwindcss'

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

- [ ] **Step 7: 创建 src/app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'A 股分析系统',
  description: 'A 股价值投资分析工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: 创建 src/app/page.tsx**

```typescript
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">A 股分析系统</h1>
      <p className="mt-4 text-gray-600">价值投资分析工具 v1.0</p>
    </main>
  )
}
```

- [ ] **Step 9: 运行验证**

```bash
cd .worktrees/a-share-analysis
npm install
npm run dev
```

Expected: Next.js dev server starts on http://localhost:3000

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 16 project"
```

---

### Task 2: Prisma 数据库设置

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: 创建 prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum CompanyType {
  BANK_WATER  @map("银行/公用")
  CONSUMER   @map("消费/公用")
  GROWTH    @map("成长型")
  HEAVY_ASSET @map("重资产")
}

model Company {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique // 股票代码，如 "600519"
  industry   String?
  companyType CompanyType?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  financialData FinancialData[]
  analysis    Analysis[]
  holdings    Holding[]

  @@map("companies")
}

model FinancialData {
  id                 String   @id @default(cuid())
  companyId           String
  year               Int      // 2020-2024
  revenue            Float?   // 营业收入
  netProfit          Float?   // 净利润
  totalAssets        Float?   // 总资产
  totalLiabilities  Float?   // 总负债
  equity             Float?   // 所有者权益
  operatingCashFlow Float?   // 经营现金流
  investingCashFlow Float?   // 投资现金流
  financingCashFlow Float?   // 融资现金流
  grossMargin        Float?   // 毛利率
  netMargin         Float?   // 净利率
  roe               Float?   // 净资产收益率
  roic              Float?   // 投资资本回报率
  debtRatio         Float?   // 资产负债率
  dividendYield     Float?   // 股息率
  eps               Float?   // 每股收益
  ebitda            Float?   // EBITDA
  createdAt         DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([companyId, year])
  @@map("financial_data")
}

model Analysis {
  id            String   @id @default(cuid())
  companyId     String
  createdAt    DateTime @default(now())

  // 宏观数据快照
  cn10y           Float?  // 国债收益率
  usdcny         Float?  // 汇率
  lpr            Float?  // LPR
  socialFinancing Float?  // 社融

  // 分析结果
  conclusion     String? // 买入/观望/清仓/规避
  valuation      Float?  // 估值
  intrinsicValue Float? // 内在价值
  currentPrice  Float?  // 当前价格
  marginOfSafety Float?  // 安全边际
  riskScore     Float?  // 风险评分
  modelUsed     String? // 使用模型

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([companyId])
  @@map("analyses")
}

model Portfolio {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  holdings Holding[]

  @@map("portfolios")
}

model Holding {
  id            String   @id @default(cuid())
  portfolioId    String
  companyId     String
  buyPrice      Float    // 买入价
  buyQuantity   Float    // 买入数量
  currentPrice Float?   // 当前价，手动更新
  updatedAt    DateTime @updatedAt

  portfolio Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  company  Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([portfolioId])
  @@map("holdings")
}

model MacroSnapshot {
  id              String   @id @default(cuid())
  cn10y           Float?   // 10年期国债收益率
  usdcny         Float?   // 汇率
  lpr             Float?   // LPR
  m2              Float?   // M2
  socialFinancing  Float?   // 社融
  cpi             Float?   // CPI
  pmi             Float?   // PMI
  createdAt       DateTime @default(now())

  @@map("macro_snapshots")
}
```

- [ ] **Step 2: 创建 .env 示例**

```bash
# PostgreSQL Database URL
DATABASE_URL="postgresql://user:password@localhost:5432/a_share_analyst"
```

- [ ] **Step 3: 创建 src/lib/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 4: 生成 Prisma Client**

```bash
npm run db:generate
```

Expected: Prisma Client generated successfully

- [ ] **Step 5: Commit**

```bash
git add prisma src/lib
git commit -m "feat: add Prisma schema and database models"
```

---

### Task 3: 基础 API 路由

**Files:**
- Create: `src/app/api/company/route.ts`
- Create: `src/app/api/financial/route.ts`
- Create: `src/lib/actions/company.ts`

- [ ] **Step 1: 创建公司列表API (GET /api/company)**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: companies })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch companies' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 创建公司API (POST /api/company)**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, code, industry, companyType } = body

    const company = await prisma.company.create({
      data: {
        name,
        code,
        industry,
        companyType,
      },
    })

    return NextResponse.json({ success: true, data: company })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create company' }, { status: 500 })
  }
}
```

- [ ] **Step 3: 创建财务数据API (POST /api/financial)**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { companyId, year, revenue, netProfit, totalAssets, totalLiabilities, equity, operatingCashFlow, investingCashFlow, financingCashFlow, grossMargin, netMargin, roe, roic, debtRatio, dividendYield, eps, ebitda } = body

    const financialData = await prisma.financialData.create({
      data: {
        companyId,
        year,
        revenue,
        netProfit,
        totalAssets,
        totalLiabilities,
        equity,
        operatingCashFlow,
        investingCashFlow,
        financingCashFlow,
        grossMargin,
        netMargin,
        roe,
        roic,
        debtRatio,
        dividendYield,
        eps,
        ebitda,
      },
    })

    return NextResponse.json({ success: true, data: financialData })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create financial data' }, { status: 500 })
  }
}
```

- [ ] **Step 4: 运行验证**

```bash
npm run dev
# 打开 http://localhost:3000/api/company
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api
git commit -m "feat: add company and financial data API routes"
```

---

### Task 4: 基础页面

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/Header.tsx`

- [ ] **Step 1: 创建 Header 组件**

```typescript
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">A 股分析系统</Link>
        <div className="flex gap-6">
          <Link href="/analyze" className="hover:text-primary-600">分析</Link>
          <Link href="/pool" className="hover:text-primary-600">股票池</Link>
          <Link href="/portfolio" className="hover:text-primary-600">组合</Link>
          <Link href="/settings" className="hover:text-primary-600">设置</Link>
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: 更新首页**

```typescript
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-8">
        <h1 className="text-3xl font-bold">欢迎使用 A 股分析系统</h1>
        <p className="mt-4 text-gray-600">价值投资分析工具 v1.0</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/analyze" className="p-6 border rounded-lg hover:shadow-md">
            <h2 className="text-xl font-semibold">单公司分析</h2>
            <p className="mt-2 text-gray-600">输入公司，获取估值分析</p>
          </Link>
          <Link href="/pool" className="p-6 border rounded-lg hover:shadow-md">
            <h2 className="text-xl font-semibold">股票池</h2>
            <p className="mt-2 text-gray-600">批量对比多家公司</p>
          </Link>
          <Link href="/portfolio" className="p-6 border rounded-lg hover:shadow-md">
            <h2 className="text-xl font-semibold">组合管理</h2>
            <p className="mt-2 text-gray-600">跟踪持仓盈亏</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: 创建分析页占位符**

```typescript
import { Header } from '@/components/Header'

export default function AnalyzePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold">单公司分析</h1>
        <p className="mt-4 text-gray-600">功能开发中...</p>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: 运行验证**

```bash
npm run dev
# 访问 http://localhost:3000
```

- [ ] **Step 5: Commit**

```bash
git add src/components src/app
git commit -m "feat: add basic pages and navigation"
```

---

## M2: 分析核心 (2周)

后续任务待 M1 完成后再继续。

---

## 执行选项

**Plan complete and saved to `docs/superpowers/plans/2026-05-01-a-share-analysis-implementation-plan.md`. Two execution options:**

**1. Subagent-Driven (推荐)** - 我作为主控协调 Product Agent → Dev Agent → Test Agent 并行开发

**2. Inline Execution** - 我在这个 session 直接执行任务，通过 checkpoints 审查

**你想用哪种方式？**