import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证必填字段
    const required = ['companyName', 'financialData', 'macroData', 'valuationParams', 'currentPrice']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `缺少必填字段: ${field}` },
          { status: 400 }
        )
      }
    }

    // 检测 API Key (从前端 localStorage 传递或环境变量)
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API_KEY_NOT_CONFIGURED', message: '请先在设置页面配置 API Key' },
        { status: 400 }
      )
    }

    // 调用 LLM 进行估值计算
    const result = await callLLMValuation(body, apiKey)

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('Valuation error:', error)
    return NextResponse.json(
      { success: false, error: '估值计算失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

interface ValuationRequest {
  companyName: string
  code?: string
  financialData: {
    netProfit: number
    shares: number
    operatingCashFlow: number
    dividendPerShare: number
    equity: number
    roe: number
  }
  macroData: {
    cn10y: number
    usdcny: number
    socialFinancing: number
  }
  valuationParams: {
    wacc: number
    terminalGrowthRate: number
    dividendRatio: number
    projectionYears: number
  }
  currentPrice: number
}

async function callLLMValuation(data: ValuationRequest, apiKey: string) {
  const anthropic = new Anthropic({ apiKey })

  const prompt = buildValuationPrompt(data)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  })

  // 解析 LLM 返回的 JSON
  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('LLM 返回格式错误')
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('无法解析 LLM 返回结果')
  }

  return JSON.parse(jsonMatch[0])
}

function buildValuationPrompt(data: ValuationRequest): string {
  return `你是一位专业估值分析师。请根据以下数据计算股票的内在价值。

【财务数据】
- 公司：${data.companyName} ${data.code ? `(${data.code})` : ''}
- 净利润：${data.financialData.netProfit}亿元
- 总股本：${data.financialData.shares}亿股
- 经营现金流：${data.financialData.operatingCashFlow}亿元
- 每股股息：${data.financialData.dividendPerShare}元
- 净资产：${data.financialData.equity}亿元
- ROE：${data.financialData.roe}%

【宏观数据】
- 无风险利率(Rf)：${data.macroData.cn10y}%
- USD/CNY：${data.macroData.usdcny}
- 社融增速：${data.macroData.socialFinancing}%

【估值参数】
- WACC/折现率：${data.valuationParams.wacc}%
- 永续增长率：${data.valuationParams.terminalGrowthRate}%
- 分红回购比例：${data.valuationParams.dividendRatio}%
- 预测年数：${data.valuationParams.projectionYears}年

【当前股价】${data.currentPrice}元

请使用以下模型计算内在价值：
1. PE 市盈率模型
2. DCF 现金流折现模型
3. DDM 股息折现模型
4. PB-ROE 模型

输出格式（必须返回有效 JSON）：
{
  "intrinsicValue": 1850,
  "recommendedModel": "DCF",
  "conclusion": "观望",
  "allModels": {
    "PE": { "intrinsicValue": 1720, "marginOfSafety": 2.3 },
    "DCF": { "intrinsicValue": 1850, "marginOfSafety": 10.1 },
    "DDM": { "intrinsicValue": 1680, "marginOfSafety": 0 },
    "PB-ROE": { "intrinsicValue": 1750, "marginOfSafety": 4.0 }
  },
  "reasoning": "计算逻辑说明",
  "calculationProcess": "各模型详细计算过程"
}`
}
