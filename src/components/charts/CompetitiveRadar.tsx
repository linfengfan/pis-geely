'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ComparisonData {
  name: string
  value: number
}

interface CompetitiveBarProps {
  company: string
  industryAvg: number
  peer: number
  companyValue: number
  title: string
  unit?: string
}

export function CompetitiveBar({ company, industryAvg, peer, companyValue, title, unit = '%' }: CompetitiveBarProps) {
  const data = [
    { name: company, value: companyValue },
    { name: '行业平均', value: industryAvg },
    { name: '头部对手', value: peer },
  ]

  const colors = ['#3b82f6', '#6b7280', '#10b981']

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            type="number"
            tickFormatter={(v) => `${v}${unit}`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            width={70}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}${unit}`, '']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface ComparisonTableProps {
  metrics: {
    name: string
    company: number
    industry: number
    peer: number
    unit?: string
  }[]
}

export function ComparisonTable({ metrics }: ComparisonTableProps) {
  const getDiff = (company: number, benchmark: number) => {
    const diff = ((company - benchmark) / benchmark) * 100
    return diff
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
        竞争力对比表
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs text-text-muted">指标</th>
              <th className="px-4 py-3 text-right text-xs text-text-muted">公司</th>
              <th className="px-4 py-3 text-right text-xs text-text-muted">行业平均</th>
              <th className="px-4 py-3 text-right text-xs text-text-muted">对比</th>
              <th className="px-4 py-3 text-right text-xs text-text-muted">头部对手</th>
              <th className="px-4 py-3 text-right text-xs text-text-muted">对比</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              const industryDiff = getDiff(metric.company, metric.industry)
              const peerDiff = getDiff(metric.company, metric.peer)

              return (
                <tr key={metric.name} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-text-primary">{metric.name}</td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">
                    {metric.company.toFixed(1)}{metric.unit || ''}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary">
                    {metric.industry.toFixed(1)}{metric.unit || ''}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    industryDiff > 0 ? 'text-success' : industryDiff < 0 ? 'text-danger' : 'text-text-secondary'
                  }`}>
                    {industryDiff > 0 ? '+' : ''}{industryDiff.toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary">
                    {metric.peer.toFixed(1)}{metric.unit || ''}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    peerDiff > 0 ? 'text-success' : peerDiff < 0 ? 'text-danger' : 'text-text-secondary'
                  }`}>
                    {peerDiff > 0 ? '+' : ''}{peerDiff.toFixed(0)}%
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