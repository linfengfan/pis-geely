/**
 * LLM 分析引擎
 * 使用 Claude API 进行年报分析
 */

import Anthropic from '@anthropic-ai/sdk'

// 从环境变量读取 API Key
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  console.warn('Warning: ANTHROPIC_API_KEY not set. LLM analysis will fail.')
}

const anthropic = new Anthropic({ apiKey: apiKey || 'dummy-key' })

export interface LLMAnalysisRequest {
  markdown: string           // 年报 markdown 内容
  companyName?: string       // 公司名称
  code?: string             // 股票代码
  currentPrice?: number     // 当前价格
  macroData: {
    cn10y: number            // 10年期国债收益率
    usdcny: number          // 美元兑人民币
    lpr: number             // LPR
    socialFinancing: number // 社融增速
  }
  sharesOutstanding?: number // 总股本
  dividendPerShare?: number // 每股股息
}

export interface LLMAnalysisResponse {
  success: boolean
  data?: {
    companyName: string
    code?: string
    parsedData: {
      completeness: number
      years: number[]
      summary: Record<string, number>
    }
    fourDimensions: {
      macro: {
        riskFreeRate: number
        liquidityAssessment: string
        externalPressure: string
        proceedToAnalysis: boolean
        reasoning: string
      }
      cycle: {
        stage: string
        inventoryCycle: string
        confidence: number
      }
      policy: {
        industryPolicy: string
        fiscalPolicy: string
        monetaryPolicy: string
        impact: string
        description: string
      }
      liquidity: {
        cashFlowHealth: string
        freeCashFlow: number
        operatingCashFlow: number
        cashConversion: number
        workingCapital: number
        score: number
      }
    }
    valuation: {
      recommendedModel: string
      intrinsicValue: number
      currentPrice?: number
      marginOfSafety?: number
      conclusion: '买入' | '观望' | '清仓' | '规避'
      reasoning: string
      allModels: Record<string, {
        intrinsicValue: number
        marginOfSafety?: number
      }>
    }
    report: {
      macro: string
      fundamentals: string
      valuation: string
      strategy: string
    }
  }
  error?: string
}

/**
 * 使用 LLM 执行年报分析
 */
export async function analyzeWithLLM(request: LLMAnalysisRequest): Promise<LLMAnalysisResponse> {
  const { macroData, markdown, companyName, code, currentPrice, sharesOutstanding, dividendPerShare } = request

  // 构建提示词，包含分析框架和必要信息
  const systemPrompt = `你是顶级价值投资分析师。你的分析遵循以下四维框架：
- 骨（骨架）：经济数据（通胀、就业、PMI）
- 筋（周期）：资产周期（美林时钟、库存周期）
- 肉（政策）：宏观政策（财政扩张/收缩、产业扶持）
- 血（流动性）：跨市场资金流向与利率环境（汇率博弈、国债锚点、信贷脉冲）

分析步骤：
1. 从年报中提取关键财务数据（营收、净利润、ROE、现金流、资产负债率等）
2. 基于宏观数据评估当前市场环境（无风险利率=CN10Y，外资压力=USD/CNY，流动性=社融）
3. 计算估值（根据企业特征选择 DCF/DDM/PE/PEG/EV-EBITDA）
4. 给出投资结论（买入/观望/清仓/规避）和执行策略

输出格式：返回 JSON，包含结构化分析结果。`

  const userPrompt = `请分析以下公司年报：

公司名称：${companyName || '未知'}
股票代码：${code || '无'}

当前宏观数据：
- CN10Y（无风险利率）：${macroData.cn10y}%
- USD/CNY：${macroData.usdcny}
- LPR：${macroData.lpr}%
- 社融增速：${macroData.socialFinancing}%

${currentPrice ? `当前股价：¥${currentPrice}` : ''}
${sharesOutstanding ? `总股本：${sharesOutstanding}万股` : ''}
${dividendPerShare ? `每股股息：¥${dividendPerShare}` : ''}

年报内容：
${markdown}

请返回 JSON 格式的分析结果，包含：
1. parsedData: 提取的财务数据（years数组表示可用年份，summary是最新年度汇总）
2. fourDimensions: 四维分析结果
3. valuation: 估值结果（recommendedModel, intrinsicValue, conclusion等）
4. report: 四段式文字报告

JSON 示例：
{
  "parsedData": {
    "years": [2022, 2023, 2024, 2025],
    "completeness": 85,
    "summary": {
      "revenue": 1688.38,
      "netProfit": 823.20,
      "roe": 32.53,
      "debtRatio": 19.48,
      "operatingCashFlow": 615.22,
      "totalAssets": 3038.35
    }
  },
  "fourDimensions": {
    "macro": {
      "riskFreeRate": 0.01762,
      "liquidityAssessment": "中性",
      "externalPressure": "低",
      "proceedToAnalysis": true,
      "reasoning": "..."
    },
    "cycle": {
      "stage": "复苏",
      "inventoryCycle": "被动去库存",
      "confidence": 75
    },
    "policy": {
      "industryPolicy": "中性",
      "fiscalPolicy": "中性",
      "monetaryPolicy": "宽松",
      "impact": "中性",
      "description": "..."
    },
    "liquidity": {
      "cashFlowHealth": "良好",
      "freeCashFlow": 61522000000,
      "operatingCashFlow": 61522000000,
      "cashConversion": 74.7,
      "workingCapital": 244638000000,
      "score": 75
    }
  },
  "valuation": {
    "recommendedModel": "DCF",
    "intrinsicValue": 1850.00,
    "currentPrice": 1680.00,
    "marginOfSafety": 9.2,
    "conclusion": "观望",
    "reasoning": "安全边际不足，建议等待更好的买入时机",
    "allModels": {
      "DCF": { "intrinsicValue": 1850.00, "marginOfSafety": 9.2 },
      "DDM": { "intrinsicValue": 1720.00, "marginOfSafety": 2.3 },
      "PE": { "intrinsicValue": 1650.00, "marginOfSafety": -1.8 }
    }
  },
  "report": {
    "macro": "...",
    "fundamentals": "...",
    "valuation": "...",
    "strategy": "..."
  }
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from LLM')
    }

    // 解析 LLM 返回的 JSON
    const jsonText = content.text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return {
        success: false,
        error: 'LLM 返回格式错误，无法解析'
      }
    }

    const result = JSON.parse(jsonMatch[0])

    return {
      success: true,
      data: {
        companyName: result.companyName || companyName || '未知公司',
        code: result.code || code,
        ...result
      }
    }
  } catch (error) {
    console.error('LLM Analysis error:', error)
    return {
      success: false,
      error: `LLM 分析失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}