'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, ComposedChart, Bar } from 'recharts'
import { formatYAxis } from '@/lib/utils'

// Chart wrapper with Cyber Finance styling
function ChartContainer({ children, title, accentColor = 'var(--color-primary)' }: { children: React.ReactNode; title: string; accentColor?: string }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: accentColor }} />
        {title}
      </h3>
      {children}
    </div>
  )
}

interface DataPoint {
  year: number
  revenue?: number
  netProfit?: number
  grossMargin?: number
  netMargin?: number
}

interface FinancialTrendChartProps {
  data: DataPoint[]
  title?: string
  showMargin?: boolean
}

export function FinancialTrendChart({ data, title = '财务趋势', showMargin = true }: FinancialTrendChartProps) {
  return (
    <ChartContainer title={title} accentColor="var(--color-primary)">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={formatYAxis}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          {showMargin && (
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
          )}
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value: number) => [formatYAxis(value), '']}
            labelFormatter={(label) => `${label}年`}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            name="营业收入"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#3b82f6' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="netProfit"
            stroke="#10b981"
            name="净利润"
            strokeWidth={2}
            dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#10b981' }}
          />
          {showMargin && (
            <>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="grossMargin"
                stroke="#f97316"
                name="毛利率"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="netMargin"
                stroke="#a855f7"
                name="净利率"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface ROEChartProps {
  data: { year: number; roe?: number; roic?: number }[]
}

export function ROEChart({ data }: ROEChartProps) {
  return (
    <ChartContainer title="ROE/ROIC 趋势" accentColor="var(--color-accent)">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="roeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            domain={[0, 50]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
            labelFormatter={(label) => `${label}年`}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" iconSize={8} />
          <Area
            type="monotone"
            dataKey="roe"
            stroke="#f97316"
            fill="url(#roeGrad)"
            name="ROE"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="roic"
            stroke="#a855f7"
            name="ROIC"
            strokeWidth={2}
            dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface CashFlowChartProps {
  data: { year: number; operating?: number; investing?: number; financing?: number }[]
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <ChartContainer title="现金流趋势" accentColor="var(--color-success)">
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [formatYAxis(value), '']}
            labelFormatter={(label) => `${label}年`}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" iconSize={8} />
          <Bar dataKey="operating" fill="#10b981" name="经营现金流" radius={[4, 4, 0, 0]} />
          <Bar dataKey="investing" fill="#f97316" name="投资现金流" radius={[4, 4, 0, 0]} opacity={0.7} />
          <Bar dataKey="financing" fill="#ef4444" name="融资现金流" radius={[4, 4, 0, 0]} opacity={0.7} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// Valuation bar chart component
interface ValuationBarChartProps {
  models: { name: string; value: number; recommended?: boolean }[]
}

export function ValuationBarChart({ models }: ValuationBarChartProps) {
  const maxValue = Math.max(...models.map(m => m.value))

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        多模型估值对比
      </h3>
      <div className="space-y-4">
        {models.map((model) => (
          <div key={model.name} className="relative">
            <div className="flex justify-between text-xs mb-1">
              <span className={model.recommended ? 'text-primary' : 'text-text-secondary'}>
                {model.name} {model.recommended && '(推荐)'}
              </span>
              <span className="font-mono text-text-primary">¥{model.value.toFixed(2)}</span>
            </div>
            <div className="h-6 bg-white/5 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${(model.value / maxValue) * 100}%`,
                  backgroundColor: model.recommended ? '#3b82f6' : 'rgba(59,130,246,0.4)',
                  boxShadow: model.recommended ? '0 0 20px rgba(59,130,246,0.4)' : 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}