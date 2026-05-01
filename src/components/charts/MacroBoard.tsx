'use client'

import type { MacroData } from '@/lib/analysis'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MacroBoardProps {
  data: MacroData
  liquidityAssessment?: '宽松' | '中性' | '紧缩'
}

const assessmentConfig = {
  '宽松': {
    bg: 'from-success/20 to-emerald-500/20',
    border: 'border-success/50',
    text: 'text-success',
    icon: TrendingUp,
    label: '流动性充裕',
  },
  '中性': {
    bg: 'from-warning/20 to-amber-500/20',
    border: 'border-warning/50',
    text: 'text-warning',
    icon: Minus,
    label: '流动性平衡',
  },
  '紧缩': {
    bg: 'from-danger/20 to-red-500/20',
    border: 'border-danger/50',
    text: 'text-danger',
    icon: TrendingDown,
    label: '流动性紧缩',
  },
}

const macroItems = [
  { key: 'cn10y', label: '无风险利率', subLabel: 'CN10Y', format: (v: number) => `${v.toFixed(2)}%`, color: 'blue' },
  { key: 'usdcny', label: '汇率', subLabel: 'USD/CNY', format: (v: number) => v.toFixed(4), color: 'purple' },
  { key: 'lpr', label: 'LPR', subLabel: '贷款市场报价', format: (v: number) => `${v.toFixed(2)}%`, color: 'orange' },
  { key: 'socialFinancing', label: '社融增速', subLabel: '社会融资规模', format: (v: number) => `${v.toFixed(1)}%`, color: 'teal' },
]

const colorClasses = {
  blue: { bg: 'rgba(59,130,246,0.1)', text: 'text-primary', border: 'rgba(59,130,246,0.2)' },
  purple: { bg: 'rgba(168,85,247,0.1)', text: 'text-purple', border: 'rgba(168,85,247,0.2)' },
  orange: { bg: 'rgba(249,115,22,0.1)', text: 'text-accent', border: 'rgba(249,115,22,0.2)' },
  teal: { bg: 'rgba(16,185,129,0.1)', text: 'text-success', border: 'rgba(16,185,129,0.2)' },
  gray: { bg: 'rgba(255,255,255,0.03)', text: 'text-text-secondary', border: 'rgba(255,255,255,0.08)' },
}

export function MacroBoard({ data, liquidityAssessment = '中性' }: MacroBoardProps) {
  const config = assessmentConfig[liquidityAssessment]
  const Icon = config.icon

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
        宏观环境
      </h3>

      {/* 宏观指标网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {macroItems.map(({ key, label, subLabel, format, color }) => {
          const value = data[key as keyof MacroData] as number
          const style = colorClasses[color as keyof typeof colorClasses]
          return (
            <div
              key={key}
              className="p-3 rounded-lg border transition-all hover:border-primary/30"
              style={{ backgroundColor: style.bg, borderColor: style.border }}
            >
              <div className={`text-xs ${style.text} mb-1`}>{label}</div>
              <div className="text-xl font-bold font-mono text-text-primary">
                {value ? format(value) : '-'}
              </div>
              <div className="text-[10px] text-text-muted mt-1">{subLabel}</div>
            </div>
          )
        })}

        {/* M2 和 CPI (可选) */}
        {data.m2 && (
          <div
            className="p-3 rounded-lg border"
            style={{ backgroundColor: colorClasses.gray.bg, borderColor: colorClasses.gray.border }}
          >
            <div className={`text-xs ${colorClasses.gray.text} mb-1`}>M2 增速</div>
            <div className="text-xl font-bold font-mono text-text-primary">{data.m2.toFixed(1)}%</div>
            <div className="text-[10px] text-text-muted mt-1">广义货币</div>
          </div>
        )}

        {data.cpi && (
          <div
            className="p-3 rounded-lg border"
            style={{ backgroundColor: colorClasses.gray.bg, borderColor: colorClasses.gray.border }}
          >
            <div className={`text-xs ${colorClasses.gray.text} mb-1`}>CPI</div>
            <div className="text-xl font-bold font-mono text-text-primary">{data.cpi.toFixed(1)}%</div>
            <div className="text-[10px] text-text-muted mt-1">居民消费价格</div>
          </div>
        )}
      </div>

      {/* 流动性评估 */}
      <div
        className="p-4 rounded-xl border flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, var(--${config.bg.split('-')[0]}, ${config.bg.includes('from-success') ? '0.2' : config.bg.includes('from-warning') ? '0.2' : '0.2'}))`,
          borderColor: config.border,
        }}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${config.text}`} />
          <div>
            <div className={`text-lg font-semibold ${config.text}`}>
              流动性评估: {liquidityAssessment}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              {config.label}
            </div>
          </div>
        </div>
        <div className={`text-xs px-3 py-1.5 rounded-full border ${config.text}`} style={{ borderColor: config.border }}>
          {liquidityAssessment === '宽松' ? '适合做多' :
           liquidityAssessment === '紧缩' ? '风险防控' : '择机而动'}
        </div>
      </div>
    </div>
  )
}