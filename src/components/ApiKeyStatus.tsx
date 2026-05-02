'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function ApiKeyStatus() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  useEffect(() => {
    // 检测 API Key 是否配置（通过调用一个检查接口）
    fetch('/api/settings/check-apikey')
      .then(res => res.json())
      .then(data => setHasApiKey(data.hasApiKey))
      .catch(() => setHasApiKey(false))
  }, [])

  if (hasApiKey === null) {
    return null // 加载中不显示
  }

  if (hasApiKey) {
    return null // 已配置则不显示提示
  }

  return (
    <div className="w-full p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertCircle className="size-5 text-amber-500" />
        <span className="text-sm">API Key 未配置，估值功能不可用</span>
      </div>
      <Link
        href="/settings"
        className="flex items-center gap-2 text-sm text-amber-500 hover:underline"
      >
        去配置
        <ExternalLink className="size-3" />
      </Link>
    </div>
  )
}
