'use client'

import { useState } from 'react'
import { Plus, TrendingUp, DollarSign, PieChart, RefreshCw } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { Button } from '@/components/ui'

const MOCK_PORTFOLIOS = [
  {
    id: '1',
    name: '核心持仓',
    stats: { totalCost: 500000, totalValue: 580000, totalProfit: 80000, totalProfitRate: 16, holdingCount: 3 },
    holdings: [
      { id: 'h1', company: { name: '贵州茅台', code: '600519' }, buyPrice: 1800, buyQuantity: 100, currentPrice: 2100, profit: 30000, profitRate: 16.67 },
      { id: 'h2', company: { name: '招商银行', code: '600036' }, buyPrice: 35, buyQuantity: 5000, currentPrice: 42, profit: 35000, profitRate: 20 },
      { id: 'h3', company: { name: '宁德时代', code: '300750' }, buyPrice: 200, buyQuantity: 500, currentPrice: 230, profit: 15000, profitRate: 15 },
    ],
  },
]

export default function PortfolioPage() {
  const [portfolios] = useState(MOCK_PORTFOLIOS)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">组合管理</h1>
          <p className="text-sm text-muted-foreground mt-1">跟踪持仓与风险敞口，动态调整仓位</p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          新建组合
        </Button>
      </div>

      <div className="space-y-6">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="card overflow-hidden">
            {/* Portfolio Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                    <PieChart className="size-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{portfolio.name}</h2>
                    <p className="text-sm text-muted-foreground">持仓 {portfolio.stats.holdingCount} 只</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold font-mono ${portfolio.stats.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {portfolio.stats.totalProfit >= 0 ? '+' : ''}¥{portfolio.stats.totalProfit.toLocaleString()}
                  </div>
                  <div className={`text-sm ${portfolio.stats.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {portfolio.stats.totalProfitRate >= 0 ? '+' : ''}{portfolio.stats.totalProfitRate.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="size-4" />
                    <span className="text-xs">总成本</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground">
                    ¥{portfolio.stats.totalCost.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <PieChart className="size-4" />
                    <span className="text-xs">当前价值</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-primary">
                    ¥{portfolio.stats.totalValue.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="size-4" />
                    <span className="text-xs">浮盈收益率</span>
                  </div>
                  <div className={`text-xl font-bold font-mono ${portfolio.stats.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {portfolio.stats.totalProfitRate >= 0 ? '+' : ''}{portfolio.stats.totalProfitRate.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>股票</TableHead>
                  <TableHead className="text-right">买入价</TableHead>
                  <TableHead className="text-right">现价</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">浮盈金额</TableHead>
                  <TableHead className="text-right">收益率</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.holdings.map((holding) => (
                  <TableRow key={holding.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{holding.company.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">{holding.company.code}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">¥{holding.buyPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-foreground">¥{holding.currentPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{holding.buyQuantity.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono font-medium ${holding.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {holding.profit >= 0 ? '+' : ''}¥{holding.profit.toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-medium ${holding.profitRate >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {holding.profitRate >= 0 ? '+' : ''}{holding.profitRate.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="size-3 mr-1" />
                        更新
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}

        {portfolios.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-muted-foreground">还没有组合，点击右上角创建一个</p>
          </div>
        )}
      </div>
    </div>
  )
}