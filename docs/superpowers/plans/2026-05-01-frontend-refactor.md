# A-Share-Analyst 前端重构计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 推翻现有混乱的前端代码，建立统一的设计系统和清晰的组件结构。

**Architecture:** 基于 Tailwind CSS v4 的原子化设计 + CSS 变量统一主题。组件职责单一，页面布局简洁务实。

**Tech Stack:** Next.js 16 + React 19 + Tailwind CSS v4 + Recharts + Lucide React

---

## 问题诊断

### CSS 类名混乱
- 混用 `terminal-bg` (CSS变量) 和 `bg-terminal-bg` (Tailwind extend)
- 混用 `card` (CSS定义) 和 `bg-terminal-card` (Tailwind extend)
- 导致编译警告和样式覆盖不可预期

### 组件职责不清
- `Header.tsx` 包含 Logo + 导航 + 时间显示，职责过多
- 图表组件直接内嵌 card wrapper，应该只负责图表本身

### 页面结构问题
- 首页 Hero 区过于花哨（渐变背景、光晕效果）
- 分析页所有组件堆砌在一起，没有视觉层次

---

## 文件结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局（字体、全局背景）
│   ├── page.tsx            # 首页（极简）
│   ├── analyze/page.tsx    # 分析页
│   ├── pool/page.tsx       # 股票池
│   ├── portfolio/page.tsx   # 组合
│   └── settings/page.tsx   # 设置
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # 只负责导航
│   │   └── Logo.tsx        # Logo 组件（可复用）
│   ├── charts/
│   │   ├── LineChart.tsx   # 原始图表（无 card wrapper）
│   │   ├── BarChart.tsx
│   │   └── RadarChart.tsx
│   ├── ui/
│   │   ├── Card.tsx        # 统一卡片容器
│   │   ├── Button.tsx      # 按钮组件
│   │   ├── Input.tsx        # 输入框组件
│   │   └── Badge.tsx       # 标签组件
│   └── dashboard/           # 业务组件（组合 ui 组件）
│       ├── ValuationPanel.tsx
│       └── MacroPanel.tsx
├── lib/
│   └── utils.ts
└── styles/
    └── globals.css         # CSS 变量定义
```

---

## 重构任务

### Task 1: 清理 globals.css 设计系统

**Files:**
- Modify: `src/app/globals.css`

**Steps:**
- [ ] **Step 1: 重写 globals.css**

```css
@import 'tailwindcss'

:root {
  /* 背景色 - 深色主题 */
  --bg-base: #0a0b0d;
  --bg-surface: #13151a;
  --bg-elevated: #1a1d23;
  --bg-hover: #22262e;

  /* 文字色 */
  --text-primary: #e8eaed;
  --text-secondary: #9aa0a6;
  --text-muted: #5f6368;

  /* 强调色 */
  --color-green: #10b981;
  --color-gold: #f59e0b;
  --color-red: #ef4444;
  --color-blue: #3b82f6;

  /* 边框 */
  --border-subtle: rgba(255, 255, 255, 0.06);
}

/* 全局重置 */
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Noto Sans SC', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* 数字字体 */
.font-mono {
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
}

/* 滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-surface);
}
::-webkit-scrollbar-thumb {
  background: var(--bg-hover);
  border-radius: 3px;
}
```

- [ ] **Step 2: 更新 tailwind.config.ts**（删除 extend.colors 中的 terminal/text/accent，保留 primary 色阶）

- [ ] **Step 3: 删除无用的 CSS 类** - 检查哪些 animation/keyframes 被删除

- [ ] **Step 4: 运行验证**

```bash
cd /Users/hyxl/hyxl/pis-geely
npx next build 2>&1 | grep -E "(error|warning|✓)" | head -20
```

---

### Task 2: 统一 UI 组件

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Badge.tsx`

**Steps:**
- [ ] **Step 1: 创建 Card 组件**

```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-[var(--border-subtle)]
        bg-[var(--bg-elevated)] p-5
        ${hoverable ? 'hover:border-[var(--color-green)]/30 transition-colors cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: 创建 Button 组件**

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-[var(--color-green)] text-white hover:opacity-90',
    secondary: 'bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--color-green)]/30',
    ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3: 创建 Input 组件**

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-xs text-[var(--text-muted)] mb-1.5">{label}</label>}
      <input
        className={`
          w-full px-3 py-2 rounded-lg
          bg-[var(--bg-surface)] text-[var(--text-primary)]
          border border-[var(--border-subtle)]
          placeholder:text-[var(--text-muted)]
          focus:outline-none focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)]/20
          ${className}
        `}
        {...props}
      />
    </div>
  )
}
```

- [ ] **Step 4: 创建 Badge 组件**

```tsx
interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'gold' | 'red' | 'gray'
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  const variants = {
    green: 'bg-[var(--color-green)]/10 text-[var(--color-green)]',
    gold: 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
    red: 'bg-[var(--color-red)]/10 text-[var(--color-red)]',
    gray: 'bg-[var(--bg-hover)] text-[var(--text-secondary)]',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
```

- [ ] **Step 5: 导出全部**

```ts
// src/components/ui/index.ts
export { Card } from './Card'
export { Button } from './Button'
export { Input } from './Input'
export { Badge } from './Badge'
```

---

### Task 3: 重构 Header 组件

**Files:**
- Modify: `src/components/Header.tsx`

**Steps:**
- [ ] **Step 1: 重写 Header**（纯导航，移除 Logo 部分）

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Layers, Briefcase, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: '首页', icon: TrendingUp },
  { href: '/analyze', label: '分析', icon: Layers },
  { href: '/pool', label: '股票池', icon: Briefcase },
  { href: '/portfolio', label: '组合', icon: Briefcase },
  { href: '/settings', label: '设置', icon: Settings },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/95 backdrop-blur">
      <nav className="max-w-5xl mx-auto h-full px-6 flex items-center gap-6">
        <Link href="/" className="font-bold text-[var(--text-primary)] mr-4">
          A股分析
        </Link>
        {navItems.filter(item => item.href !== '/').map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-sm
                transition-colors
                ${isActive
                  ? 'text-[var(--color-green)] bg-[var(--color-green)]/10'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: 运行验证**

```bash
npx next build 2>&1 | grep -E "(error|✓)" | head -10
```

---

### Task 4: 重构首页 page.tsx

**Files:**
- Modify: `src/app/page.tsx`

**Steps:**
- [ ] **Step 1: 重写首页**（极简，保留核心入口）

```tsx
import Link from 'next/link'
import { Card } from '@/components/ui'
import { TrendingUp, Layers, Briefcase } from 'lucide-react'

const features = [
  { href: '/analyze', icon: TrendingUp, title: '单公司分析', desc: '输入年报，获取估值与安全边际' },
  { href: '/pool', icon: Layers, title: '股票池', desc: '批量对比，筛选高安全边际标的' },
  { href: '/portfolio', icon: Briefcase, title: '组合管理', desc: '跟踪持仓与风险敞口' },
]

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">A 股深度分析</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        基于四维框架（骨、筋、肉、血）的价值投资分析工具
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {features.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href}>
            <Card hoverable className="h-full">
              <Icon className="w-5 h-5 text-[var(--color-green)] mb-3" />
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="text-center">
        <h2 className="font-semibold mb-4">四维分析框架</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { char: '骨', name: '经济数据', desc: '通胀/就业/PMI' },
            { char: '筋', name: '资产周期', desc: '美林时钟' },
            { char: '肉', name: '宏观政策', desc: '财政/产业' },
            { char: '血', name: '流动性', desc: '汇率/信贷' },
          ].map(({ char, name, desc }) => (
            <div key={char} className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <div className="text-xl font-bold text-[var(--color-gold)]">{char}</div>
              <div className="text-sm font-medium mt-1">{name}</div>
              <div className="text-xs text-[var(--text-muted)]">{desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: 运行验证**

```bash
npx next build 2>&1 | grep -E "(error|✓)" | head -10
```

---

### Task 5: 重构分析页 analyze/page.tsx

**Files:**
- Modify: `src/app/analyze/page.tsx`
- Modify: `src/components/dashboard/ValuationDashboard.tsx`

**Steps:**
- [ ] **Step 1: 创建纯图表组件**（去掉内嵌的 card wrapper）

创建 `src/components/charts/PureChart.tsx`:

```tsx
// 图表组件只负责图表，不含容器
// 使用 Recharts 的 ResponsivContainer
// 所有样式使用 Tailwind 类，不依赖 CSS 变量
```

- [ ] **Step 2: 重构 ValuationDashboard**（移除冗余样式，使用 Card 组件）

```tsx
import { Card, Badge } from '@/components/ui'
import { ShieldCheck, AlertTriangle, TrendingDown } from 'lucide-react'

export function ValuationDashboard({ ... }) {
  const config = conclusionConfig[conclusion]
  const Icon = config.icon

  return (
    <Card className="p-5">
      {/* 公司信息 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg">📊</span>
        <div>
          <h2 className="font-bold">{companyName}</h2>
          {code && <span className="text-sm text-[var(--text-muted)] font-mono">{code}</span>}
        </div>
        <Badge variant={conclusion === '买入' ? 'green' : conclusion === '观望' ? 'gold' : 'red'}>
          {conclusion}
        </Badge>
      </div>

      {/* 核心数据 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <DataCell label="当前价格" value={currentPrice ? `¥${currentPrice.toFixed(2)}` : '-'} />
        <DataCell label="内在价值" value={`¥${intrinsicValue.toFixed(2)}`} highlight />
        <DataCell label="安全边际" value={marginOfSafety ? `${marginOfSafety.toFixed(1)}%` : '-'} color={marginColor} />
      </div>
    </Card>
  )
}
```

- [ ] **Step 3: 重写 analyze/page.tsx**（使用 UI 组件简化结构）

```tsx
import { Card, Button, Input } from '@/components/ui'
import { ValuationDashboard } from '@/components/dashboard/ValuationDashboard'
import { DEMO_DATA } from '@/components/dashboard'

export default function AnalyzePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">单公司分析</h1>
      </div>

      {/* 示例数据展示 */}
      <ValuationDashboard {...DEMO_DATA.valuation} companyName={DEMO_DATA.companyName} />

      {/* 分析表单 */}
      <Card className="mt-6">
        <h2 className="font-semibold mb-4">新建分析</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="公司名称" placeholder="输入公司名称" />
          <Input label="股票代码" placeholder="600519" className="font-mono" />
        </div>
        <div className="mt-4">
          <Input label="年报 Markdown" placeholder="粘贴年报内容..." />
        </div>
        <div className="mt-4 flex gap-3">
          <Button>执行分析</Button>
          <Button variant="secondary">重置</Button>
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: 运行验证**

```bash
npx next build 2>&1 | grep -E "(error|✓)" | head -10
```

---

### Task 6: 清理旧组件

**Files:**
- Delete: `src/components/Header.tsx` (已被重构)
- Modify: `src/components/index.ts` (更新导出)
- Modify: `src/app/layout.tsx` (移除 Google Fonts 导入，简化)

**Steps:**
- [ ] **Step 1: 更新 components/index.ts**（只导出业务组件）

```ts
export { Card, Button, Input, Badge } from './ui'
export { ValuationDashboard } from './dashboard/ValuationDashboard'
export { DEMO_DATA } from './dashboard'
```

- [ ] **Step 2: 简化 layout.tsx**

```tsx
import './globals.css'
import { Header } from '@/components/Header'

export const metadata = {
  title: 'A 股分析系统',
  description: '价值投资分析工具',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: 运行验证**

```bash
npx next build 2>&1 | tail -20
```

---

## 验证清单

每个 Task 完成后检查：
1. `npx next build` 无错误
2. 浏览器访问 http://localhost:3000 正常显示
3. 无控制台警告（尤其是 CSS 类名相关）

---

## 执行选择

**Plan complete and saved to `docs/superpowers/plans/2026-05-01-frontend-refactor.md`**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**