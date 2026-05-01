'use client'

import { useState } from 'react'
import { CheckCircle2, Info, Package } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Badge } from '@/components/ui'

export default function SettingsPage() {
  const [macroData, setMacroData] = useState({
    cn10y: '2.50',
    usdcny: '7.2500',
    lpr: '3.45',
    socialFinancing: '9.5',
    m2: '',
    cpi: '',
  })

  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 grid-bg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">设置</h1>
        <p className="text-sm text-muted-foreground mt-1">配置宏观参数，这些值将用于估值计算</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 宏观数据录入 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-primary" />
              宏观数据
            </CardTitle>
            <CardDescription>输入当前宏观数据，作为估值模型的折现率基础</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">
                  10年期国债收益率 (CN10Y) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={macroData.cn10y}
                    onChange={(e) => setMacroData({ ...macroData, cn10y: e.target.value })}
                    className="pr-12"
                    placeholder="2.50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
                <p className="text-xs text-muted-foreground">作为 DCF/DDM 模型的无风险利率 (Rf)</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">
                  美元兑人民币 (USD/CNY) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={macroData.usdcny}
                  onChange={(e) => setMacroData({ ...macroData, usdcny: e.target.value })}
                  placeholder="7.2500"
                />
                <p className="text-xs text-muted-foreground">监测汇率压力，外资重仓股估值敏感</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">
                  LPR 贷款市场报价利率 <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={macroData.lpr}
                    onChange={(e) => setMacroData({ ...macroData, lpr: e.target.value })}
                    className="pr-12"
                    placeholder="3.45"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">
                  社融增速 <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={macroData.socialFinancing}
                    onChange={(e) => setMacroData({ ...macroData, socialFinancing: e.target.value })}
                    className="pr-12"
                    placeholder="9.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">M2 增速 (可选)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={macroData.m2}
                      onChange={(e) => setMacroData({ ...macroData, m2: e.target.value })}
                      className="pr-10"
                      placeholder="10.0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">CPI (可选)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={macroData.cpi}
                      onChange={(e) => setMacroData({ ...macroData, cpi: e.target.value })}
                      className="pr-10"
                      placeholder="2.5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full mt-6">
                保存设置
              </Button>

              {saved && (
                <div className="flex items-center justify-center gap-2 text-emerald-500 text-sm py-2">
                  <CheckCircle2 className="size-4" />
                  <span>设置已保存</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* 右侧信息卡片 */}
        <div className="space-y-6">
          {/* 系统信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-accent" />
                系统信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">版本</span>
                <span className="text-foreground font-mono text-sm">v1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">技术栈</span>
                <Badge variant="secondary">Next.js 16 + React 19</Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">数据库</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">PostgreSQL</Badge>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground text-sm">估值模型</span>
                <span className="text-muted-foreground text-sm">DCF / PE / PEG / DDM</span>
              </div>
            </CardContent>
          </Card>

          {/* 数据来源 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-emerald-500" />
                数据来源
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {[
                  '年报数据：用户手动上传 Markdown 文件',
                  '宏观数据：用户手动输入（东方财富参考）',
                  '财务数据：从年报提取关键指标',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 bg-emerald-500 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 使用说明 */}
          <Card className="border-l-2 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="size-4 text-primary" />
                使用说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm list-decimal list-inside">
                {[
                  '在「分析」页面输入公司信息和上传年报 Markdown',
                  '在「设置」页面更新当前宏观经济数据',
                  '系统自动执行四维分析和估值计算',
                  '查看分析报告和可视化仪表盘',
                ].map((item, idx) => (
                  <li key={idx} className="text-muted-foreground leading-relaxed">{item}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}