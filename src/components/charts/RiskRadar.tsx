'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

interface RiskData {
  dimension: string
  score: number
  fullMark?: number
}

interface RiskRadarProps {
  data: RiskData[]
  title?: string
}

export function RiskRadar({ data, title = '风险雷达' }: RiskRadarProps) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="评分"
            dataKey="score"
            stroke="#3b82f6"
            fill="url(#radarGrad)"
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
            iconSize={8}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface RiskMetricsProps {
  debtRatio: number
  cashConversion: number
  revenueGrowth: number
  profitGrowth: number
  roe: number
  netMargin: number
}

const statusConfig = {
  good: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: 'text-success', label: '优秀' },
  caution: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: 'text-warning', label: '良好' },
  danger: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: 'text-danger', label: '较差' },
}

const thresholds = {
  debtRatio: { good: 50, warn: 70, inverted: true },
  cashConversion: { good: 100, warn: 80, inverted: false },
  revenueGrowth: { good: 15, warn: 5, inverted: false },
  profitGrowth: { good: 15, warn: 5, inverted: false },
  roe: { good: 15, warn: 10, inverted: false },
  netMargin: { good: 15, warn: 8, inverted: false },
}

export function RiskMetrics({
  debtRatio,
  cashConversion,
  revenueGrowth,
  profitGrowth,
  roe,
  netMargin,
}: RiskMetricsProps) {
  const getStatus = (value: number, config: { good: number; warn: number; inverted: boolean }) => {
    const isGood = config.inverted ? value <= config.good : value >= config.good
    const isWarn = config.inverted ? value <= config.warn : value >= config.warn
    if (isGood) return 'good'
    if (isWarn) return 'caution'
    return 'danger'
  }

  const metrics = [
    { label: '资产负债率', value: debtRatio, unit: '%', config: thresholds.debtRatio },
    { label: '净利润现金含量', value: cashConversion, unit: '%', config: thresholds.cashConversion },
    { label: '营收增速', value: revenueGrowth, unit: '%', config: thresholds.revenueGrowth },
    { label: '利润增速', value: profitGrowth, unit: '%', config: thresholds.profitGrowth },
    { label: 'ROE', value: roe, unit: '%', config: thresholds.roe },
    { label: '净利率', value: netMargin, unit: '%', config: thresholds.netMargin },
  ]

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
        关键指标
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((metric) => {
          const status = getStatus(metric.value, metric.config)
          const style = statusConfig[status]
          return (
            <div
              key={metric.label}
              className="p-3 rounded-lg border transition-all hover:border-primary/30"
              style={{ backgroundColor: style.bg, borderColor: style.border }}
            >
              <div className="text-xs text-text-muted mb-1">{metric.label}</div>
              <div className={`text-xl font-bold font-mono ${style.text}`}>
                {metric.value.toFixed(1)}{metric.unit}
              </div>
              <div className={`text-[10px] ${style.text} mt-1`}>{style.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}