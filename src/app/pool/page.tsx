'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Trash2, ArrowUpDown } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'

const MOCK_POOL = [
  { id: '1', name: '贵州茅台', code: '600519', industry: '白酒', latestConclusion: '买入', latestMarginOfSafety: 32.5, roe: 45.2 },
  { id: '2', name: '宁德时代', code: '300750', industry: '新能源', latestConclusion: '观望', latestMarginOfSafety: 18.2, roe: 28.5 },
  { id: '3', name: '招商银行', code: '600036', industry: '银行', latestConclusion: '买入', latestMarginOfSafety: 35.8, roe: 18.3 },
  { id: '4', name: '中国平安', code: '601318', industry: '保险', latestConclusion: '清仓', latestMarginOfSafety: -5.2, roe: 12.1 },
]

const conclusionConfig = {
  '买入': { variant: 'default' as const, className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  '观望': { variant: 'secondary' as const, className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  '清仓': { variant: 'destructive' as const, className: 'bg-red-500/10 text-red-500 border-red-500/20' },
}

export default function PoolPage() {
  const [pool] = useState(MOCK_POOL)
  const [sortBy, setSortBy] = useState<'name' | 'marginOfSafety' | 'roe'>('marginOfSafety')

  const sortedPool = [...pool].sort((a, b) => {
    switch (sortBy) {
      case 'marginOfSafety': return (b.latestMarginOfSafety || 0) - (a.latestMarginOfSafety || 0)
      case 'roe': return (b.roe || 0) - (a.roe || 0)
      default: return a.name.localeCompare(b.name)
    }
  })

  const getMarginStyle = (margin?: number) => {
    if (margin === undefined) return { color: 'text-muted-foreground', icon: null }
    if (margin >= 30) return { color: 'text-emerald-500', icon: TrendingUp }
    if (margin >= 15) return { color: 'text-amber-500', icon: TrendingUp }
    return { color: 'text-red-500', icon: TrendingDown }
  }

  const sortOptions = [
    { value: 'marginOfSafety', label: '安全边际' },
    { value: 'roe', label: 'ROE' },
    { value: 'name', label: '名称' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">股票池</h1>
          <p className="text-sm text-muted-foreground mt-1">筛选高安全边际标的，建立投资备选库</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === 'marginOfSafety' ? 'roe' : sortBy === 'roe' ? 'name' : 'marginOfSafety')}
          >
            <ArrowUpDown className="size-4 mr-2" />
            排序: {sortOptions.find(o => o.value === sortBy)?.label}
          </Button>
          <Button>
            <Plus className="size-4 mr-2" />
            添加公司
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-xs text-muted-foreground">标的数量</div>
          <div className="text-2xl font-bold font-mono text-foreground">{pool.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground">买入信号</div>
          <div className="text-2xl font-bold font-mono text-emerald-500">{pool.filter(p => p.latestConclusion === '买入').length}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground">观望信号</div>
          <div className="text-2xl font-bold font-mono text-amber-500">{pool.filter(p => p.latestConclusion === '观望').length}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground">清仓信号</div>
          <div className="text-2xl font-bold font-mono text-red-500">{pool.filter(p => p.latestConclusion === '清仓').length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>公司</TableHead>
              <TableHead>行业</TableHead>
              <TableHead className="text-right">ROE</TableHead>
              <TableHead className="text-right">安全边际</TableHead>
              <TableHead className="text-center">结论</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPool.map((company) => {
              const marginStyle = getMarginStyle(company.latestMarginOfSafety)
              const marginIcon = marginStyle.icon
              const config = conclusionConfig[company.latestConclusion as keyof typeof conclusionConfig]

              return (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{company.name}</div>
                    <div className="text-sm text-muted-foreground font-mono">{company.code}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {company.industry}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono ${company.roe >= 15 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      {company.roe.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className={`font-mono font-medium ${marginStyle.color}`}>
                        {company.latestMarginOfSafety?.toFixed(1) || '-'}%
                      </span>
                      {marginIcon && <marginIcon className={`size-4 ${marginStyle.color}`} />}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={config.variant}
                      className={config.className}
                    >
                      {company.latestConclusion}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {sortedPool.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-muted-foreground">股票池为空，点击右上角添加公司</p>
          </div>
        )}
      </div>
    </div>
  )
}