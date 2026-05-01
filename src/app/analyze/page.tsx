'use client'

import { useState } from 'react'
import { DEMO_DATA } from '@/components'
import { FinancialTrendChart, ROEChart, CashFlowChart, RiskRadar, RiskMetrics, MacroBoard, ValuationDashboard, ValuationSummary } from '@/components'
import { Play, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

export default function AnalyzePage() {
  const [showDemo, setShowDemo] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    code: '',
    annualReport: '',
    cn10y: '',
    usdcny: '',
    lpr: '',
    socialFinancing: '',
  })

  const data = DEMO_DATA

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-foreground">单公司分析</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowDemo(!showDemo)}>
          {showDemo ? <EyeOff className="w-3.5 h-3.5 mr-2" /> : <Eye className="w-3.5 h-3.5 mr-2" />}
          {showDemo ? '隐藏示例' : '显示示例'}
        </Button>
      </div>

      {showDemo && (
        <div className="space-y-5">
          {/* 估值仪表盘 */}
          <ValuationDashboard
            companyName={data.companyName}
            code={data.code}
            currentPrice={data.valuation.currentPrice}
            intrinsicValue={data.valuation.intrinsicValue}
            marginOfSafety={data.valuation.marginOfSafety}
            conclusion={data.valuation.conclusion}
            modelUsed={data.valuation.modelUsed}
          />

          {/* 估值模型对比 */}
          <ValuationSummary
            models={data.valuation.allModels}
            recommendedModel={data.valuation.modelUsed}
          />

          {/* 宏观看板 */}
          <MacroBoard data={data.macroData} liquidityAssessment="中性" />

          {/* 财务图表 */}
          <div className="grid grid-cols-2 gap-5">
            <FinancialTrendChart
              data={data.financialData.map(d => ({
                year: d.year,
                revenue: d.revenue,
                netProfit: d.netProfit,
                grossMargin: d.grossMargin,
                netMargin: d.netMargin,
              }))}
            />
            <ROEChart
              data={data.financialData.map(d => ({
                year: d.year,
                roe: d.roe,
                roic: d.roic,
              }))}
            />
          </div>

          {/* 现金流 */}
          <CashFlowChart
            data={data.financialData.map(d => ({
              year: d.year,
              operatingCashFlow: d.operatingCashFlow,
              investingCashFlow: d.investingCashFlow,
              financingCashFlow: d.financingCashFlow,
            }))}
          />

          {/* 风险指标 */}
          <RiskMetrics
            debtRatio={45}
            cashConversion={120}
            revenueGrowth={15}
            profitGrowth={12}
            roe={15}
            netMargin={10}
          />

          {/* 风险雷达 */}
          <RiskRadar
            data={[
              { dimension: '资产负债率', score: 75, fullMark: 100 },
              { dimension: '现金流', score: 85, fullMark: 100 },
              { dimension: '利润质量', score: 78, fullMark: 100 },
              { dimension: '成长性', score: 72, fullMark: 100 },
              { dimension: '盈利能力', score: 80, fullMark: 100 },
              { dimension: '营运效率', score: 68, fullMark: 100 },
            ]}
          />
        </div>
      )}

      {/* 分析表单 */}
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>新建分析</CardTitle>
          <CardDescription>输入公司信息，系统将自动执行四维分析和估值计算</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">公司名称</label>
              <Input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="输入公司名称"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">股票代码</label>
              <Input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="600519"
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">年报 Markdown</label>
            <Textarea
              name="annualReport"
              value={formData.annualReport}
              onChange={handleInputChange}
              placeholder="粘贴年报内容..."
              className="font-mono text-xs min-h-[120px] resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">宏观参数</label>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">CN10Y</label>
                <Input
                  type="number"
                  name="cn10y"
                  value={formData.cn10y}
                  onChange={handleInputChange}
                  placeholder="2.50%"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">USD/CNY</label>
                <Input
                  type="number"
                  name="usdcny"
                  value={formData.usdcny}
                  onChange={handleInputChange}
                  placeholder="7.25"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">LPR</label>
                <Input
                  type="number"
                  name="lpr"
                  value={formData.lpr}
                  onChange={handleInputChange}
                  placeholder="3.45%"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">社融增速</label>
                <Input
                  type="number"
                  name="socialFinancing"
                  value={formData.socialFinancing}
                  onChange={handleInputChange}
                  placeholder="9.5%"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              <Play className="w-4 h-4 mr-2" />
              {isAnalyzing ? '分析中...' : '执行分析'}
            </Button>
            <Button variant="outline">重置</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}