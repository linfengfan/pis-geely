import Link from 'next/link'
import { TrendingUp, Layers, Briefcase, Sparkles, ArrowRight } from 'lucide-react'

const features = [
  { href: '/analyze', icon: TrendingUp, title: '单公司分析', desc: '输入年报，获取估值与安全边际', color: 'primary' },
  { href: '/pool', icon: Layers, title: '股票池', desc: '批量对比，筛选高安全边际标的', color: 'accent' },
  { href: '/portfolio', icon: Briefcase, title: '组合管理', desc: '跟踪持仓与风险敞口', color: 'purple' },
]

const frameworks = [
  { char: '骨', name: '经济数据', desc: '通胀/就业/PMI', color: 'primary' },
  { char: '筋', name: '资产周期', desc: '美林时钟', color: 'accent' },
  { char: '肉', name: '宏观政策', desc: '财政/产业', color: 'purple' },
  { char: '血', name: '流动性', desc: '汇率/信贷', color: 'success' },
]

const colorMap = {
  primary: { text: 'text-primary', glow: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.1)' },
  accent: { text: 'text-accent', glow: 'rgba(249,115,22,0.3)', bg: 'rgba(249,115,22,0.1)' },
  purple: { text: 'text-purple', glow: 'rgba(168,85,247,0.3)', bg: 'rgba(168,85,247,0.1)' },
  success: { text: 'text-success', glow: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.1)' },
}

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-16 grid-bg">
      {/* Hero */}
      <div className="text-center mb-16 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs text-text-secondary">价值投资分析工具</span>
        </div>

        <h1 className="text-5xl font-bold mb-6">
          <span className="text-text-primary">A 股</span>
          <span className="gradient-text"> 深度分析</span>
        </h1>

        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
          基于宏观流动性、基本面、周期定位、经济数据<span className="text-primary font-semibold"> 四维框架</span>，
          <br className="hidden sm:block" />
          精准测算安全边际，识别价值拐点。
        </p>

        <Link
          href="/analyze"
          className="btn-neon inline-flex items-center gap-2 text-base px-8 py-4"
        >
          <span>开始分析</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* 功能区 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {features.map(({ href, icon: Icon, title, desc, color }, idx) => {
          const c = colorMap[color as keyof typeof colorMap]
          return (
            <Link
              key={href}
              href={href}
              className={`glass-card p-6 transition-all hover:-translate-y-1 stagger-${idx + 1}`}
              style={{ animationFillMode: 'both' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: c.bg }}
              >
                <Icon className={`w-6 h-6 ${c.text}`} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-sm text-text-secondary">{desc}</p>
            </Link>
          )
        })}
      </div>

      {/* 四维框架 */}
      <div className="glass-card p-8 animate-fade-in-up stagger-4">
        <h3 className="text-lg font-semibold text-text-primary mb-8 flex items-center gap-3">
          <span className="w-1.5 h-5 rounded-full bg-accent" />
          四维分析框架
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {frameworks.map(({ char, name, desc, color }) => {
            const c = colorMap[color as keyof typeof colorMap]
            return (
              <div
                key={char}
                className={`dim-card text-center transition-all`}
              >
                <div className={`dim-char ${c.text}`}>{char}</div>
                <div className="dim-title">{name}</div>
                <div className="dim-desc">{desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="mt-12 text-center text-sm text-text-muted">
        <p>严格遵循「骨-筋-肉-血」四维框架 · 绝对不做左侧交易 · 鳄鱼法则风控</p>
      </div>
    </div>
  )
}