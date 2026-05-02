'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'

interface ValuationResultProps {
  result: {
    intrinsicValue: number
    marginOfSafety: number
    conclusion: '买入' | '观望' | '清仓' | '规避'
    recommendedModel: string
    allModels: Record<string, { intrinsicValue: number; marginOfSafety: number }>
    reasoning: string
    calculationProcess: string
  }
}

export function ValuationResult({ result }: ValuationResultProps) {
  const getConclusionIcon = () => {
    switch (result.conclusion) {
      case '买入':
        return <TrendingUp className="size-5 text-emerald-500" />
      case '清仓':
        return <TrendingDown className="size-5 text-red-500" />
      default:
        return <Minus className="size-5 text-amber-500" />
    }
  }

  const getConclusionColor = () => {
    switch (result.conclusion) {
      case '买入':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case '清仓':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* 主要结论卡片 */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">内在价值</p>
              <p className="text-3xl font-bold">¥{result.intrinsicValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">安全边际</p>
              <p className={`text-3xl font-bold ${result.marginOfSafety >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {result.marginOfSafety >= 0 ? '+' : ''}{result.marginOfSafety.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">结论</p>
              <Badge className={`text-lg px-4 py-1 ${getConclusionColor()}`}>
                <span className="flex items-center gap-2">
                  {getConclusionIcon()}
                  {result.conclusion}
                </span>
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            推荐模型: {result.recommendedModel}
          </p>
        </CardContent>
      </Card>

      {/* 多模型对比 */}
      <Card>
        <CardHeader>
          <CardTitle>多模型估值对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(result.allModels).map(([model, data]) => (
              <div key={model} className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground mb-1">{model}</p>
                <p className="text-xl font-bold">¥{data.intrinsicValue.toFixed(2)}</p>
                <p className={`text-xs ${data.marginOfSafety >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  安全边际 {data.marginOfSafety >= 0 ? '+' : ''}{data.marginOfSafety.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 计算过程 */}
      <Card>
        <CardHeader>
          <CardTitle>计算过程与推理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">计算逻辑</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.reasoning}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">详细计算过程</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.calculationProcess}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
