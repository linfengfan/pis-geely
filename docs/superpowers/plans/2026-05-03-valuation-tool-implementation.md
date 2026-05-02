# 估值工具第一期实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个估值工具，用户输入财务数据 + 宏观数据 + 估值参数，系统调用 LLM 计算股票的内在价值

**Architecture:** 表单输入 → /api/valuation → 组装 Prompt → LLM 计算 → 返回结构化估值结果（内在价值、安全边际、结论、多模型对比）

**Tech Stack:** Next.js 16 + TypeScript + Tailwind CSS + Anthropic SDK + Prisma + PostgreSQL

---

## 文件结构

```
src/
├── app/
│   ├── analyze/
│   │   └── page.tsx              # 重写为估值表单
│   ├── settings/
│   │   └── page.tsx              # 增加 API Key 配置区块
│   └── api/
│       └── valuation/
│           └── route.ts          # 新建估值 API
├── components/
│   ├── ValuationForm.tsx         # 新建：估值表单组件
│   ├── ValuationResult.tsx       # 新建：估值结果展示组件
│   └── ApiKeyStatus.tsx          # 新建：API Key 状态检测组件
└── lib/
    └── llmAnalyzer.ts            # 已有：LLM 调用工具（可能需要修改）
```

---

## 任务列表

### Task 1: Settings 页面 - 增加 API Key 配置

**Files:**
- Modify: `src/app/settings/page.tsx:1-239`

- [ ] **Step 1: 添加 API Key 配置区块到 Settings 页面**

在 Settings 页面顶部增加 API Key 配置区块，包含：
- API Key 输入框（password 类型）
- 保存按钮
- 状态显示（已配置/未配置）

```tsx
// 在 Settings 页面顶部添加（位置在现有卡片之前）

{/* API 配置区块 */}
<Card className="mb-6 border-l-4 border-l-amber-500">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Key className="size-4" />
      API 配置
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Anthropic API Key</label>
        <div className="flex gap-3">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-xxxxx"
            className="font-mono"
          />
          <Button onClick={saveApiKey}>保存</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          用于 LLM 估值计算。获取 Key: https://console.anthropic.com/settings/keys
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">状态:</span>
        {apiKey ? (
          <Badge variant="default" className="bg-emerald-500">已配置</Badge>
        ) : (
          <Badge variant="destructive">未配置</Badge>
        )}
      </div>
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 2: 添加状态管理**

```tsx
// 在组件内添加 state
const [apiKey, setApiKey] = useState('')
const [apiKeySaved, setApiKeySaved] = useState(false)

// 保存 API Key 到 localStorage（或者可以改造成 Prisma 持久化）
const saveApiKey = () => {
  localStorage.setItem('ANTHROPIC_API_KEY', apiKey)
  setApiKeySaved(true)
  setTimeout(() => setApiKeySaved(false), 3000)
}

// 页面加载时读取
useEffect(() => {
  const saved = localStorage.getItem('ANTHROPIC_API_KEY')
  if (saved) setApiKey(saved)
}, [])
```

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/page.tsx
git commit -m "feat(settings): add API Key configuration block"
```

---

### Task 2: 创建 /api/valuation 接口

**Files:**
- Create: `src/app/api/valuation/route.ts`

- [ ] **Step 1: 创建 valuation API 路由**

```ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证必填字段
    const required = ['companyName', 'financialData', 'macroData', 'valuationParams', 'currentPrice']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `缺少必填字段: ${field}` },
          { status: 400 }
        )
      }
    }

    // 检测 API Key
    const apiKey = process.env.ANTHROPIC_API_KEY || localStorage?.getItem?.('ANTHROPIC_API_KEY')
    // 注意: localStorage 在服务端不可用，实际从环境变量读取
    // 前端需要在请求时通过 header 传递，或者存储到服务端

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API_KEY_NOT_CONFIGURED', message: '请先在设置页面配置 API Key' },
        { status: 400 }
      )
    }

    // 调用 LLM 进行估值计算
    const result = await callLLMValuation(body)

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('Valuation error:', error)
    return NextResponse.json(
      { success: false, error: '估值计算失败', details: error.message },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 实现 LLM 调用逻辑**

```ts
import Anthropic from '@anthropic-ai/sdk'

async function callLLMValuation(data: {
  companyName: string
  code?: string
  financialData: {
    netProfit: number
    shares: number
    operatingCashFlow: number
    dividendPerShare: number
    equity: number
    roe: number
  }
  macroData: {
    cn10y: number
    usdcny: number
    socialFinancing: number
  }
  valuationParams: {
    wacc: number
    terminalGrowthRate: number
    dividendRatio: number
    projectionYears: number
  }
  currentPrice: number
}) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = buildValuationPrompt(data)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  })

  // 解析 LLM 返回的 JSON
  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('LLM 返回格式错误')
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('无法解析 LLM 返回结果')
  }

  return JSON.parse(jsonMatch[0])
}

function buildValuationPrompt(data: any): string {
  return `你是一位专业估值分析师。请根据以下数据计算股票的内在价值。

【财务数据】
- 公司：${data.companyName} ${data.code ? `(${data.code})` : ''}
- 净利润：${data.financialData.netProfit}亿元
- 总股本：${data.financialData.shares}亿股
- 经营现金流：${data.financialData.operatingCashFlow}亿元
- 每股股息：${data.financialData.dividendPerShare}元
- 净资产：${data.financialData.equity}亿元
- ROE：${data.financialData.roe}%

【宏观数据】
- 无风险利率(Rf)：${data.macroData.cn10y}%
- USD/CNY：${data.macroData.usdcny}
- 社融增速：${data.macroData.socialFinancing}%

【估值参数】
- WACC/折现率：${data.valuationParams.wacc}%
- 永续增长率：${data.valuationParams.terminalGrowthRate}%
- 分红回购比例：${data.valuationParams.dividendRatio}%
- 预测年数：${data.valuationParams.projectionYears}年

【当前股价】${data.currentPrice}元

请使用以下模型计算内在价值：
1. PE 市盈率模型
2. DCF 现金流折现模型
3. DDM 股息折现模型
4. PB-ROE 模型

输出格式（必须返回有效 JSON）：
{
  "intrinsicValue": 1850,
  "recommendedModel": "DCF",
  "conclusion": "观望",
  "allModels": {
    "PE": { "intrinsicValue": 1720, "marginOfSafety": 2.3 },
    "DCF": { "intrinsicValue": 1850, "marginOfSafety": 10.1 },
    "DDM": { "intrinsicValue": 1680, "marginOfSafety": 0 },
    "PB-ROE": { "intrinsicValue": 1750, "marginOfSafety": 4.0 }
  },
  "reasoning": "计算逻辑说明",
  "calculationProcess": "各模型详细计算过程"
}`
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/valuation/route.ts
git commit -m "feat(api): add /api/valuation endpoint with LLM integration"
```

---

### Task 3: 创建 ValuationForm 组件

**Files:**
- Create: `src/components/ValuationForm.tsx`

- [ ] **Step 1: 创建表单组件**

```tsx
'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface ValuationFormProps {
  onSubmit: (data: any) => void
  isLoading: boolean
}

export function ValuationForm({ onSubmit, isLoading }: ValuationFormProps) {
  const [formData, setFormData] = useState({
    // 公司信息
    companyName: '',
    code: '',
    // 财务数据
    netProfit: '',
    shares: '',
    operatingCashFlow: '',
    dividendPerShare: '',
    equity: '',
    roe: '',
    // 宏观数据
    cn10y: '',
    usdcny: '',
    socialFinancing: '',
    // 估值参数
    wacc: '',
    terminalGrowthRate: '',
    dividendRatio: '',
    projectionYears: '',
    // 当前股价
    currentPrice: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      companyName: formData.companyName,
      code: formData.code,
      financialData: {
        netProfit: parseFloat(formData.netProfit),
        shares: parseFloat(formData.shares),
        operatingCashFlow: parseFloat(formData.operatingCashFlow),
        dividendPerShare: parseFloat(formData.dividendPerShare) || 0,
        equity: parseFloat(formData.equity),
        roe: parseFloat(formData.roe),
      },
      macroData: {
        cn10y: parseFloat(formData.cn10y),
        usdcny: parseFloat(formData.usdcny),
        socialFinancing: parseFloat(formData.socialFinancing) || 0,
      },
      valuationParams: {
        wacc: parseFloat(formData.wacc),
        terminalGrowthRate: parseFloat(formData.terminalGrowthRate),
        dividendRatio: parseFloat(formData.dividendRatio),
        projectionYears: parseInt(formData.projectionYears) || 5,
      },
      currentPrice: parseFloat(formData.currentPrice),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 公司信息 */}
      <Card>
        <CardHeader>
          <CardTitle>公司信息</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">公司名称</label>
            <Input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="贵州茅台" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">股票代码</label>
            <Input name="code" value={formData.code} onChange={handleChange} placeholder="600519" className="font-mono" />
          </div>
        </CardContent>
      </Card>

      {/* 财务数据 */}
      <Card>
        <CardHeader>
          <CardTitle>财务数据（从年报提取）</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">净利润（亿元）</label>
            <Input name="netProfit" type="number" step="0.01" value={formData.netProfit} onChange={handleChange} placeholder="823.20" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">总股本（亿股）</label>
            <Input name="shares" type="number" step="0.01" value={formData.shares} onChange={handleChange} placeholder="12.56" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">经营现金流（亿元）</label>
            <Input name="operatingCashFlow" type="number" step="0.01" value={formData.operatingCashFlow} onChange={handleChange} placeholder="615.22" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">每股股息（元）</label>
            <Input name="dividendPerShare" type="number" step="0.01" value={formData.dividendPerShare} onChange={handleChange} placeholder="30.00" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">净资产（亿元）</label>
            <Input name="equity" type="number" step="0.01" value={formData.equity} onChange={handleChange} placeholder="2446" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">ROE（%）</label>
            <Input name="roe" type="number" step="0.01" value={formData.roe} onChange={handleChange} placeholder="32.53" />
          </div>
        </CardContent>
      </Card>

      {/* 宏观数据 */}
      <Card>
        <CardHeader>
          <CardTitle>宏观数据</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">CN10Y（%）</label>
            <Input name="cn10y" type="number" step="0.001" value={formData.cn10y} onChange={handleChange} placeholder="1.762" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">USD/CNY</label>
            <Input name="usdcny" type="number" step="0.0001" value={formData.usdcny} onChange={handleChange} placeholder="6.82" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">社融增速（%）</label>
            <Input name="socialFinancing" type="number" step="0.1" value={formData.socialFinancing} onChange={handleChange} placeholder="7.9" />
          </div>
        </CardContent>
      </Card>

      {/* 估值参数 */}
      <Card>
        <CardHeader>
          <CardTitle>估值参数（每次手动输入）</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">折现率 WACC（%）</label>
            <Input name="wacc" type="number" step="0.01" value={formData.wacc} onChange={handleChange} placeholder="6.76" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">永续增长率（%）</label>
            <Input name="terminalGrowthRate" type="number" step="0.1" value={formData.terminalGrowthRate} onChange={handleChange} placeholder="2.5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">分红回购比例（%）</label>
            <Input name="dividendRatio" type="number" step="1" value={formData.dividendRatio} onChange={handleChange} placeholder="50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">预测年数</label>
            <Input name="projectionYears" type="number" step="1" value={formData.projectionYears} onChange={handleChange} placeholder="5" />
          </div>
        </CardContent>
      </Card>

      {/* 当前股价 + 执行按钮 */}
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm text-muted-foreground">当前股价（元）</label>
          <Input name="currentPrice" type="number" step="0.01" value={formData.currentPrice} onChange={handleChange} placeholder="1680" />
        </div>
        <Button type="submit" disabled={isLoading} className="gap-2">
          <Calculator className="size-4" />
          {isLoading ? '计算中...' : '执行估值'}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ValuationForm.tsx
git commit -m "feat(components): add ValuationForm component"
```

---

### Task 4: 创建 ValuationResult 组件

**Files:**
- Create: `src/components/ValuationResult.tsx`

- [ ] **Step 1: 创建结果展示组件**

```tsx
'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'

interface ValuationResultProps {
  result: {
    intrinsicValue: number
    marginOfSafety: number
    conclusion: '买入' | '观望' | '清仓' | '规避'
    recommendedModel: string
    allModels: Record<string, { intrinsicValue: number; marginOfSafety: number }>
    reasoning: string
    calculationProcess: string
  }
}

export function ValuationResult({ result }: ValuationResultProps) {
  const getConclusionIcon = () => {
    switch (result.conclusion) {
      case '买入':
        return <TrendingUp className="size-5 text-emerald-500" />
      case '清仓':
        return <TrendingDown className="size-5 text-red-500" />
      default:
        return <Minus className="size-5 text-amber-500" />
    }
  }

  const getConclusionColor = () => {
    switch (result.conclusion) {
      case '买入':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case '清仓':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* 主要结论卡片 */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">内在价值</p>
              <p className="text-3xl font-bold">¥{result.intrinsicValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">安全边际</p>
              <p className={`text-3xl font-bold ${result.marginOfSafety >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {result.marginOfSafety >= 0 ? '+' : ''}{result.marginOfSafety.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">结论</p>
              <Badge className={`text-lg px-4 py-1 ${getConclusionColor()}`}>
                <span className="flex items-center gap-2">
                  {getConclusionIcon()}
                  {result.conclusion}
                </span>
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            推荐模型: {result.recommendedModel}
          </p>
        </CardContent>
      </Card>

      {/* 多模型对比 */}
      <Card>
        <CardHeader>
          <CardTitle>多模型估值对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(result.allModels).map(([model, data]) => (
              <div key={model} className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground mb-1">{model}</p>
                <p className="text-xl font-bold">¥{data.intrinsicValue.toFixed(2)}</p>
                <p className={`text-xs ${data.marginOfSafety >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  安全边际 {data.marginOfSafety >= 0 ? '+' : ''}{data.marginOfSafety.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 计算过程 */}
      <Card>
        <CardHeader>
          <CardTitle>计算过程与推理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">计算逻辑</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.reasoning}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">详细计算过程</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.calculationProcess}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ValuationResult.tsx
git commit -m "feat(components): add ValuationResult component"
```

---

### Task 5: 创建 ApiKeyStatus 组件

**Files:**
- Create: `src/components/ApiKeyStatus.tsx`

- [ ] **Step 1: 创建 API Key 状态检测组件**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function ApiKeyStatus() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  useEffect(() => {
    // 检测 API Key 是否配置（通过调用一个检查接口）
    fetch('/api/settings/check-apikey')
      .then(res => res.json())
      .then(data => setHasApiKey(data.hasApiKey))
      .catch(() => setHasApiKey(false))
  }, [])

  if (hasApiKey === null) {
    return null // 加载中不显示
  }

  if (hasApiKey) {
    return null // 已配置则不显示提示
  }

  return (
    <div className="w-full p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertCircle className="size-5 text-amber-500" />
        <span className="text-sm">API Key 未配置，估值功能不可用</span>
      </div>
      <Link
        href="/settings"
        className="flex items-center gap-2 text-sm text-amber-500 hover:underline"
      >
        去配置
        <ExternalLink className="size-3" />
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: 创建检查接口**

```ts
// src/app/api/settings/check-apikey/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY
  return NextResponse.json({ hasApiKey })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ApiKeyStatus.tsx src/app/api/settings/check-apikey/route.ts
git commit -m "feat(components): add ApiKeyStatus component with check API"
```

---

### Task 6: 重写 Analyze 页面

**Files:**
- Modify: `src/app/analyze/page.tsx`

- [ ] **Step 1: 重写 Analyze 页面为估值表单**

```tsx
'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { ValuationForm } from '@/components/ValuationForm'
import { ValuationResult } from '@/components/ValuationResult'
import { ApiKeyStatus } from '@/components/ApiKeyStatus'

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const res = await response.json()

      if (!res.success) {
        if (res.error === 'API_KEY_NOT_CONFIGURED') {
          setError('请先在设置页面配置 API Key')
        } else {
          setError(res.message || res.error || '估值计算失败')
        }
        return
      }

      setResult(res.data)
    } catch (err) {
      setError('网络请求失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">估值工具</h1>
        <span className="text-sm text-muted-foreground ml-2">第一期</span>
      </div>

      {/* API Key 状态检测 */}
      <ApiKeyStatus />

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      {/* 估值表单 */}
      <div className="mb-8">
        <ValuationForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* 估值结果 */}
      {result && <ValuationResult result={result} />}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/analyze/page.tsx
git commit -m "feat(analyze): rewrite page with valuation form and result display"
```

---

### Task 7: 最终验证

- [ ] **Step 1: 构建项目**

```bash
npm run build
```

预期：构建成功，无错误

- [ ] **Step 2: 测试 API**

```bash
curl -X POST http://localhost:3000/api/valuation \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "贵州茅台",
    "code": "600519",
    "financialData": {
      "netProfit": 823.20,
      "shares": 12.56,
      "operatingCashFlow": 615.22,
      "dividendPerShare": 30.0,
      "equity": 2446,
      "roe": 32.53
    },
    "macroData": {
      "cn10y": 1.762,
      "usdcny": 6.82,
      "socialFinancing": 7.9
    },
    "valuationParams": {
      "wacc": 6.76,
      "terminalGrowthRate": 2.5,
      "dividendRatio": 50,
      "projectionYears": 5
    },
    "currentPrice": 1680
  }'
```

预期：返回包含 `intrinsicValue` 的 JSON（非 0）

- [ ] **Step 3: 提交最终 commit**

```bash
git add -A
git commit -m "feat: complete valuation tool phase 1 - form + LLM valuation + result display"
```

---

## 验收标准检查

- [ ] Settings 页面有 API Key 配置区块
- [ ] Analyze 页面显示估值表单
- [ ] API Key 未配置时显示黄色提示条
- [ ] 点击提示可跳转到 Settings
- [ ] 填写表单后点击"执行估值"
- [ ] 调用 /api/valuation 并返回实际价格（不是 0）
- [ ] 估值结果包含：内在价值、安全边际、结论、多模型对比、计算过程