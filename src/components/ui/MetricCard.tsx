interface MetricCardProps {
  label: string
  value: string | number
  variant?: 'primary' | 'accent' | 'success' | 'neutral'
  suffix?: string
  className?: string
}

export function MetricCard({ label, value, variant = 'primary', suffix = '', className = '' }: MetricCardProps) {
  const valueStyles = {
    primary: 'metric-value metric-value-primary',
    accent: 'metric-value metric-value-accent',
    success: 'metric-value metric-value-success',
    neutral: 'metric-value text-text-primary',
  }

  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-label">{label}</div>
      <div className={valueStyles[variant]}>
        {value}{suffix && <span className="text-base ml-1">{suffix}</span>}
      </div>
    </div>
  )
}