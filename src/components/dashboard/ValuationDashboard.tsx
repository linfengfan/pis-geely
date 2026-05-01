'use client'

import { TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react'

interface ValuationDashboardProps {
  companyName: string
  code?: string
  currentPrice?: number
  intrinsicValue: number
  marginOfSafety?: number
  conclusion: '买入' | '观望' | '清仓' | '规避'
  modelUsed: string
  analyzedAt?: string
}

const conclusionConfig = {
  '买入': {
    bg: 'from-success/20 to-emerald-500/20',
    border: 'border-success/50',
    text: 'text-success',
    icon: ShieldCheck,
    label: '安全边际充足，建议建仓',
    tagBg: 'bg-success/10',
  },
  '观望': {
    bg: 'from-warning/20 to-amber-500/20',
    border: 'border-warning/50',
    text: 'text-warning',
    icon: AlertTriangle,
    label: '安全边际一般，等待时机',
    tagBg: 'bg-warning/10',
  },
  '清仓': {
    bg: 'from-danger/20 to-red-500/20',
    border: 'border-danger/50',
    text: 'text-danger',
    icon: TrendingDown,
    label: '估值偏高，建议减仓',
    tagBg: 'bg-danger/10',
  },
  '规避': {
    bg: 'from-gray-500/20 to-slate-500/20',
    border: 'border-gray-500/50',
    text: 'text-text-muted',
    icon: XCircle,
    label: '系统性风险，禁止入场',
    tagBg: 'bg-gray-500/10',
  },
}

export function ValuationDashboard({
  companyName,
  code,
  currentPrice,
  intrinsicValue,
  marginOfSafety,
  conclusion,
  modelUsed,
  analyzedAt,
}: ValuationDashboardProps) {
  const config = conclusionConfig[conclusion]
  const Icon = config.icon

  const getMarginIcon = () => {
    if (marginOfSafety === undefined) return <Minus className="w-8 h-8 text-text-muted" />
    if (marginOfSafety >= 30) return <TrendingUp className="w-8 h-8 text-success" />
    if (marginOfSafety >= 15) return <Minus className="w-8 h-8 text-warning" />
    return <TrendingDown className="w-8 h-8 text-danger" />
  }

  const getMarginColor = () => {
    if (marginOfSafety === undefined) return 'text-text-muted'
    if (marginOfSafety >= 30) return 'text-success'
    if (marginOfSafety >= 15) return 'text-warning'
    return 'text-danger'
  }

  const priceRatio = currentPrice ? (currentPrice / intrinsicValue) * 100 : 0

  return (
    <div className={`glass-card p-6 border-2`} style={{ borderColor: config.border }}>
      {/* 头部 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center border-primary/30">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{companyName}</h2>
            {code && <span className="text-sm text-text-muted font-mono">{code}</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-muted">{analyzedAt || new Date().toLocaleDateString('zh-CN')}</div>
          <div className="text-xs text-text-muted mt-1">模型: {modelUsed}</div>
        </div>
      </div>

      {/* 核心数据 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* 当前价格 */}
        <div className="p-4 rounded-xl glass-card border-white/10">
          <div className="text-xs text-text-muted mb-2">当前价格</div>
          <div className="text-3xl font-bold font-mono text-text-primary">
            {currentPrice ? `¥${currentPrice.toFixed(2)}` : '-'}
          </div>
        </div>

        {/* 内在价值 */}
        <div className="p-4 rounded-xl glass-card border-primary/30">
          <div className="text-xs text-text-muted mb-2">内在价值</div>
          <div className="text-3xl font-bold font-mono text-primary">
            ¥{intrinsicValue.toFixed(2)}
          </div>
        </div>

        {/* 安全边际 */}
        <div className="p-4 rounded-xl glass-card border-white/10">
          <div className="text-xs text-text-muted mb-2">安全边际</div>
          <div className="flex items-center gap-2">
            {getMarginIcon()}
            <div className={`text-3xl font-bold font-mono ${getMarginColor()}`}>
              {marginOfSafety !== undefined ? `${marginOfSafety.toFixed(1)}%` : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* 结论 */}
      <div className={`p-5 rounded-xl border flex items-center gap-4`} style={{ borderColor: config.border }}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: config.tagBg }}>
          <Icon className={`w-6 h-6 ${config.text}`} />
        </div>
        <div className="flex-1">
          <div className={`text-xl font-bold ${config.text}`}>{conclusion}</div>
          <div className="text-sm text-text-secondary mt-1">{config.label}</div>
        </div>
      </div>

      {/* 价格区间指示 */}
      {currentPrice && (
        <div className="mt-6">
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>¥0</span>
            <span>当前: ¥{currentPrice.toFixed(2)}</span>
            <span>内在价值: ¥{intrinsicValue.toFixed(2)}</span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, priceRatio)}%`,
                background: 'linear-gradient(to right, #3b82f6, #10b981)',
              }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-success"
              style={{ left: '100%' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>低估</span>
            <span>合理区间</span>
            <span>高估</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface ValuationSummaryProps {
  models: {
    name: string
    intrinsicValue: number
    marginOfSafety?: number
  }[]
  recommendedModel: string
}

export function ValuationSummary({ models, recommendedModel }: ValuationSummaryProps) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        估值模型对比
      </h3>
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">模型</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted">内在价值</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted">安全边际</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">推荐</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => {
              const isRecommended = model.name === recommendedModel
              const marginColor = model.marginOfSafety !== undefined
                ? model.marginOfSafety >= 30 ? 'text-success'
                : model.marginOfSafety >= 15 ? 'text-warning'
                : 'text-danger'
                : 'text-text-muted'

              return (
                <tr
                  key={model.name}
                  className={`border-b border-white/5 transition-colors hover:bg-white/5 ${isRecommended ? 'bg-success/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{model.name}</span>
                      {isRecommended && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-success/10 text-success border border-success/20">
                          推荐
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-mono text-text-primary">¥{model.intrinsicValue.toFixed(2)}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono text-sm font-medium ${marginColor}`}>
                    {model.marginOfSafety !== undefined ? `${model.marginOfSafety.toFixed(1)}%` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isRecommended && <span className="text-warning">★</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}