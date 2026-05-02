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
