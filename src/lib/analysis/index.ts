/**
 * 分析引擎主入口
 */

import { parseMarkdownReport, type ParsedReport, type FinancialTable } from './markdownParser'
import { analyzeFourDimensions, type MacroData, type FourDimensionResult } from './fourDimensions'
import { runValuation, type CompanyFinancials, DEFAULT_PARAMS, type ValuationParams } from './valuation'

export { parseMarkdownReport, type ParsedReport, type FinancialTable }
export { analyzeFourDimensions, type MacroData, type FourDimensionResult }
export { runValuation, DEFAULT_PARAMS, type ValuationParams }

export interface AnalysisRequest {
  markdown: string           // 年报 markdown 内容
  companyName?: string      // 公司名称
  code?: string             // 股票代码
  currentPrice?: number     // 当前价格
  macroData: MacroData      // 宏观数据
  sharesOutstanding?: number // 总股本
  dividendPerShare?: number // 每股股息
  netDebt?: number          // 净负债
}

export interface AnalysisResponse {
  success: boolean
  data?: {
    companyName: string
    code?: string
    parsedData: {
      completeness: number
      years: number[]
      summary: Record<string, number>
    }
    fourDimensions: FourDimensionResult
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
 * 执行完整分析流程
 */
export function analyzeCompany(request: AnalysisRequest): AnalysisResponse {
  try {
    // 1. 解析 markdown
    const parsed = parseMarkdownReport(request.markdown)

    if (parsed.tables.length === 0) {
      return {
        success: false,
        error: '无法从 markdown 中提取财务数据，请检查格式',
      }
    }

    // 2. 四维分析
    const fourDimensions = analyzeFourDimensions(
      {
        financialData: parsed.tables,
        industry: request.code ? undefined : undefined,
      },
      request.macroData
    )

    // 3. 估值
    const company: CompanyFinancials = {
      financials: parsed.tables,
      currentPrice: request.currentPrice || 0,
      sharesOutstanding: request.sharesOutstanding || 1000000000, // 默认 10 亿股
      dividendPerShare: request.dividendPerShare,
      netDebt: request.netDebt,
    }

    const valuationParams: Partial<ValuationParams> = {
      riskFreeRate: request.macroData.cn10y / 100,
    }

    const valuationResult = runValuation(company, fourDimensions, valuationParams)

    // 4. 生成报告
    const report = generateReport(
      parsed.companyName || request.companyName || '未知公司',
      request.code,
      fourDimensions,
      valuationResult
    )

    return {
      success: true,
      data: {
        companyName: parsed.companyName || request.companyName || '未知公司',
        code: request.code,
        parsedData: {
          completeness: calculateCompleteness(parsed.tables),
          years: parsed.tables.map(t => t.year),
          summary: summarizeFinancials(parsed.tables),
        },
        fourDimensions,
        valuation: {
          recommendedModel: valuationResult.recommendedModel,
          intrinsicValue: valuationResult.results[valuationResult.recommendedModel].intrinsicValue,
          currentPrice: request.currentPrice,
          marginOfSafety: valuationResult.results[valuationResult.recommendedModel].marginOfSafety,
          conclusion: valuationResult.conclusion,
          reasoning: valuationResult.reasoning,
          allModels: Object.fromEntries(
            Object.entries(valuationResult.results).map(([key, val]) => [
              key,
              { intrinsicValue: val.intrinsicValue, marginOfSafety: val.marginOfSafety },
            ])
          ),
        },
        report,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: `分析失败: ${error instanceof Error ? error.message : '未知错误'}`,
    }
  }
}

/**
 * 计算数据完整度
 */
function calculateCompleteness(tables: FinancialTable[]): number {
  if (tables.length === 0) return 0

  const latest = tables[tables.length - 1]
  const fields = ['revenue', 'netProfit', 'totalAssets', 'equity', 'operatingCashFlow', 'roe'] as const

  const filled = fields.filter(f => latest[f] !== undefined).length
  return Math.round((filled / fields.length) * 100)
}

/**
 * 汇总财务数据
 */
function summarizeFinancials(tables: FinancialTable[]): Record<string, number> {
  const latest = tables[tables.length - 1]
  const summary: Record<string, number> = {}

  for (const [key, value] of Object.entries(latest)) {
    if (value !== undefined && typeof value === 'number') {
      summary[key] = value
    }
  }

  return summary
}

/**
 * 生成四段式报告
 */
function generateReport(
  companyName: string,
  code: string | undefined,
  fourDim: FourDimensionResult,
  valuation: ReturnType<typeof runValuation>
): { macro: string; fundamentals: string; valuation: string; strategy: string } {
  const latestResult = valuation.results[valuation.recommendedModel]

  return {
    // 第一段：宏观与流动性环境
    macro: `【宏观环境】无风险利率 ${(fourDim.macro.riskFreeRate * 100).toFixed(2)}%，流动性${fourDim.macro.liquidityAssessment}，外资压力${fourDim.macro.externalPressure}。

${fourDim.macro.reasoning}

【周期判断】当前处于${fourDim.cycle.stage}阶段，库存周期为${fourDim.cycle.inventoryCycle}，置信度${fourDim.cycle.confidence}%。

【政策评估】${fourDim.policy.description}，影响${fourDim.policy.impact}。`,

    // 第二段：基本面手术
    fundamentals: `【现金流评估】${fourDim.liquidity.cashFlowHealth}，评分 ${fourDim.liquidity.score}/100。
- 净利润现金含量: ${fourDim.liquidity.cashConversion.toFixed(1)}%
- 营运资本: ${formatNum(fourDim.liquidity.workingCapital)}
- 自由现金流: ${formatNum(fourDim.liquidity.freeCashFlow)}`,

    // 第三段：估值测算
    valuation: `【推荐模型】${valuation.recommendedModel}
【内在价值】¥${latestResult.intrinsicValue.toFixed(2)}
${latestResult.currentPrice ? `【当前价格】¥${latestResult.currentPrice.toFixed(2)}` : ''}
${latestResult.marginOfSafety !== undefined ? `【安全边际】${latestResult.marginOfSafety.toFixed(1)}%` : ''}

【所有模型估值】
${Object.entries(valuation.results).map(([m, r]) => `- ${m}: ¥${r.intrinsicValue.toFixed(2)}${r.marginOfSafety !== undefined ? ` (安全边际 ${r.marginOfSafety.toFixed(1)}%)` : ''}`).join('\n')}

${latestResult.reasoning.join('\n')}`,

    // 第四段：执行策略
    strategy: `【结论】${valuation.conclusion}

${valuation.conclusion === '买入' ? '✅ 安全边际充足，建议建仓' :
      valuation.conclusion === '观望' ? '⚠️ 安全边际一般，等待更好时机' :
        valuation.conclusion === '清仓' ? '❌ 估值偏高，建议减仓' :
          '⚠️ 系统性风险，禁止入场'}

【风险提示】
- 宏观风险: ${fourDim.macro.externalPressure === '高' ? '外资流出压力较大' : '外资压力可控'}
- 现金流风险: ${fourDim.liquidity.cashFlowHealth === '较差' ? '需关注现金流' : '现金流状况良好'}
- 估值风险: ${latestResult.marginOfSafety && latestResult.marginOfSafety < 20 ? '安全边际不足' : '估值合理'}`,
  }
}

function formatNum(num: number): string {
  if (Math.abs(num) >= 1e8) return `${(num / 1e8).toFixed(2)}亿`
  if (Math.abs(num) >= 1e4) return `${(num / 1e4).toFixed(2)}万`
  return num.toFixed(2)
}