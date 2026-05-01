'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Layers, Briefcase, Settings } from 'lucide-react'

const navItems = [
  { href: '/analyze', label: '分析', icon: TrendingUp },
  { href: '/pool', label: '股票池', icon: Layers },
  { href: '/portfolio', label: '组合', icon: Briefcase },
  { href: '/settings', label: '设置', icon: Settings },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ backgroundColor: 'rgba(10,10,15,0.9)', borderBottom: '1px solid var(--border-subtle)' }}>
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-success))',
              boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
            }}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 3v18h18" strokeLinecap="round" />
              <path d="M7 12l4-4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-text-primary leading-none">A-Share Analyst</span>
            <span className="text-[10px] text-text-muted leading-none mt-0.5">Value Investment</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="text-xs font-mono text-primary">
              {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </nav>
    </header>
  )
}