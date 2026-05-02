'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { ValuationForm } from '@/components/ValuationForm'
import { ValuationResult } from '@/components/ValuationResult'
import { ApiKeyStatus } from '@/components/ApiKeyStatus'

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const res = await response.json()

      if (!res.success) {
        if (res.error === 'API_KEY_NOT_CONFIGURED') {
          setError('请先在设置页面配置 API Key')
        } else {
          setError(res.message || res.error || '估值计算失败')
        }
        return
      }

      setResult(res.data)
    } catch (err) {
      setError('网络请求失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">估值工具</h1>
        <span className="text-sm text-muted-foreground ml-2">第一期</span>
      </div>

      {/* API Key 状态检测 */}
      <ApiKeyStatus />

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      {/* 估值表单 */}
      <div className="mb-8">
        <ValuationForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* 估值结果 */}
      {result && <ValuationResult result={result} />}
    </div>
  )
}