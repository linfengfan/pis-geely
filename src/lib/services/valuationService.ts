import Anthropic from '@anthropic-ai/sdk'
import { ValuationRequestSchema, type ValuationRequest } from '@/lib/utils/validation'

export interface ValuationModelResult {
  intrinsicValue: number
  marginOfSafety: number
  calculationDetails?: string
}

export interface ValuationResult {
  intrinsicValue: number
  recommendedModel: 'PE' | 'DCF' | 'DDM' | 'PB-ROE'
  conclusion: '低估' | '合理' | '观望' | '高估'
  allModels: {
    PE: ValuationModelResult
    DCF: ValuationModelResult
    DDM: ValuationModelResult
    'PB-ROE': ValuationModelResult
  }
  reasoning: string
  calculationProcess: string
}

interface LLMValuationResponse {
  intrinsicValue: number
  recommendedModel: 'PE' | 'DCF' | 'DDM' | 'PB-ROE'
  conclusion: '低估' | '合理' | '观望' | '高估'
  allModels: Record<string, { intrinsicValue: number; marginOfSafety: number }>
  reasoning: string
  calculationProcess?: string
}

/**
 * 执行估值计算
 */
export async function executeValuation(
  params: unknown,
  apiKey: string
): Promise<ValuationResult> {
  // 1. 参数校验
  const validated = ValuationRequestSchema.parse(params)

  // 2. 调用 LLM 进行估值计算
  const result = await callLLMValuation(validated, apiKey)

  // 3. 返回标准化结果
  return normalizeValuationResult(result)
}

/**
 * 调用 LLM 进行估值
 */
async function callLLMValuation(
  data: ValuationRequest,
  apiKey: string
): Promise<LLMValuationResponse> {
  const anthropic = new Anthropic({ apiKey })

  const prompt = buildValuationPrompt(data)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
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

/**
 * 构建估值 Prompt
 */
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
- 社融增速：${data.macroData.socialFinancing ?? 'N/A'}%

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

/**
 * 标准化估值结果
 */
function normalizeValuationResult(result: LLMValuationResponse): ValuationResult {
  return {
    intrinsicValue: result.intrinsicValue,
    recommendedModel: result.recommendedModel,
    conclusion: result.conclusion,
    allModels: {
      PE: result.allModels.PE || { intrinsicValue: 0, marginOfSafety: 0 },
      DCF: result.allModels.DCF || { intrinsicValue: 0, marginOfSafety: 0 },
      DDM: result.allModels.DDM || { intrinsicValue: 0, marginOfSafety: 0 },
      'PB-ROE': result.allModels['PB-ROE'] || { intrinsicValue: 0, marginOfSafety: 0 },
    },
    reasoning: result.reasoning,
    calculationProcess: result.calculationProcess || result.reasoning,
  }
}
