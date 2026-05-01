/**
 * 估值模型
 * 支持 DCF / DDM / PE-PEG / EV-EBITDA
 */

import type { FinancialTable } from './markdownParser'
import type { FourDimensionResult } from './fourDimensions'

export type ValuationModel = 'DCF' | 'DDM' | 'PE' | 'PEG' | 'EV_EBITDA'

export interface ValuationParams {
  riskFreeRate: number         // 无风险利率 (Rf)
  beta: number                 // Beta 风险系数
  marketRiskPremium: number    // 市场风险溢价 (默认 5%)
  terminalGrowthRate: number   // 永续增长率 (默认 2.5%)
  projectionYears: number      // 预测年数 (默认 5年)
}

export interface ValuationResult {
  model: ValuationModel
  intrinsicValue: number       // 内在价值
  currentPrice?: number         // 当前价格
  marginOfSafety?: number      // 安全边际 %
  reasoning: string[]
  details: {
    [key: string]: number | string
  }
}

export interface CompanyFinancials {
  financials: FinancialTable[]
  currentPrice: number         // 当前股价
  sharesOutstanding: number    // 总股本
  dividendPerShare?: number    // 每股股息
  netDebt?: number             // 净负债
  industry?: string            // 行业
}

/**
 * 默认估值参数
 */
export const DEFAULT_PARAMS: ValuationParams = {
  riskFreeRate: 0.025,        // 2.5%
  beta: 1.0,
  marketRiskPremium: 0.05,     // 5%
  terminalGrowthRate: 0.025,  // 2.5%
  projectionYears: 5,
}

/**
 * 估值模型路由器 - 根据公司特征选择最佳模型
 */
export function selectBestModel(
  financials: FinancialTable[],
  companyType?: string,
  dividendYield?: number
): ValuationModel {
  if (financials.length === 0) return 'DCF'

  const latest = financials[financials.length - 1]

  // 1. 重资产优先 EV/EBITDA
  if (latest.debtRatio && latest.debtRatio > 60) {
    return 'EV_EBITDA'
  }

  if (latest.totalAssets && latest.equity &&
      latest.totalAssets > latest.equity * 3) {
    return 'EV_EBITDA'
  }

  // 2. 高股息优先 DDM
  if (dividendYield && dividendYield > 5) {
    return 'DDM'
  }

  // 3. 银行/公用 DDM
  if (companyType === '银行/公用' || companyType === '银行') {
    return 'DDM'
  }

  // 4. 成长型 PE/PEG
  const revenueGrowth = calculateGrowthRate(financials, 'revenue')
  const profitGrowth = calculateGrowthRate(financials, 'netProfit')

  if (revenueGrowth > 20 && profitGrowth > 15) {
    return 'PEG'
  }

  // 5. 默认 DCF
  return 'DCF'
}

/**
 * 计算复合增长率
 */
function calculateGrowthRate(financials: FinancialTable[], field: keyof FinancialTable): number {
  if (financials.length < 2) return 0

  const latest = financials[financials.length - 1]
  const oldest = financials[0]

  const latestValue = latest[field] as number | undefined
  const oldestValue = oldest[field] as number | undefined

  if (!latestValue || !oldestValue || oldestValue <= 0) return 0

  const years = financials.length - 1
  const cagr = (Math.pow(latestValue / oldestValue, 1 / years) - 1) * 100

  return cagr
}

/**
 * DCF 现金流折现估值
 */
export function calculateDCF(
  company: CompanyFinancials,
  params: Partial<ValuationParams> = {}
): ValuationResult {
  const p = { ...DEFAULT_PARAMS, ...params }
  const financials = company.financials

  if (financials.length === 0) {
    return createEmptyResult('DCF')
  }

  const reasoning: string[] = []
  const details: Record<string, number | string> = {}

  // 1. 计算 WACC (加权平均资本成本)
  const wacc = p.riskFreeRate + p.beta * p.marketRiskPremium
  reasoning.push(`WACC: ${(wacc * 100).toFixed(2)}% (Rf=${(p.riskFreeRate * 100).toFixed(2)}%, β=${p.beta})`)
  details['wacc'] = wacc * 100
  details['wacc_display'] = `${(wacc * 100).toFixed(2)}%`

  // 2. 计算历史 FCF 并预测未来
  const projectedFCF: number[] = []
  const latestFCF = financials[financials.length - 1].operatingCashFlow || 0

  // 简化：假设 FCF 增长与利润增长一致
  const profitGrowthRate = calculateGrowthRate(financials, 'netProfit') / 100

  for (let i = 1; i <= p.projectionYears; i++) {
    const fcf = latestFCF * Math.pow(1 + profitGrowthRate, i)
    projectedFCF.push(fcf)
    reasoning.push(`第${i}年FCF预测: ${formatMoney(fcf)}`)
  }

  details['fcf_growth'] = profitGrowthRate * 100

  // 3. 折现计算
  let pvSum = 0
  for (let i = 0; i < projectedFCF.length; i++) {
    const pv = projectedFCF[i] / Math.pow(1 + wacc, i + 1)
    pvSum += pv
  }

  reasoning.push(`预测期 PV 合计: ${formatMoney(pvSum)}`)
  details['pv_sum'] = pvSum

  // 4. 永续价值
  const terminalFCF = projectedFCF[projectedFCF.length - 1] * (1 + p.terminalGrowthRate)
  const terminalValue = terminalFCF / (wacc - p.terminalGrowthRate)
  const pvTerminal = terminalValue / Math.pow(1 + wacc, p.projectionYears)

  reasoning.push(`永续价值: ${formatMoney(terminalValue)} (PV: ${formatMoney(pvTerminal)})`)
  details['terminal_value'] = terminalValue
  details['pv_terminal'] = pvTerminal

  // 5. 总内在价值
  const totalValue = pvSum + pvTerminal
  const perShareValue = totalValue / company.sharesOutstanding

  reasoning.push(`内在价值: ${formatMoney(totalValue)}`)
  reasoning.push(`每股价值: ¥${perShareValue.toFixed(2)}`)
  details['total_value'] = totalValue
  details['per_share'] = perShareValue

  // 6. 安全边际
  const marginOfSafety = company.currentPrice
    ? ((perShareValue - company.currentPrice) / perShareValue) * 100
    : undefined

  if (marginOfSafety !== undefined) {
    reasoning.push(`当前价格: ¥${company.currentPrice.toFixed(2)}`)
    reasoning.push(`安全边际: ${marginOfSafety.toFixed(1)}%`)
    details['margin_of_safety'] = marginOfSafety
  }

  return {
    model: 'DCF',
    intrinsicValue: perShareValue,
    currentPrice: company.currentPrice,
    marginOfSafety,
    reasoning,
    details,
  }
}

/**
 * PE 估值
 */
export function calculatePE(
  company: CompanyFinancials,
  params: Partial<ValuationParams> = {}
): ValuationResult {
  const p = { ...DEFAULT_PARAMS, ...params }
  const financials = company.financials

  if (financials.length === 0) {
    return createEmptyResult('PE')
  }

  const reasoning: string[] = []
  const details: Record<string, number | string> = {}

  const latest = financials[financials.length - 1]
  const eps = latest.eps || (latest.netProfit || 0) / company.sharesOutstanding

  reasoning.push(`每股收益(EPS): ¥${eps.toFixed(4)}`)

  // 合理 PE = 100 / (Rf - 1) 简化公式
  // 或者用 Growth / (Rf - 1) * 100
  const profitGrowth = calculateGrowthRate(financials, 'netProfit') / 100
  const reasonablePE = profitGrowth > 0
    ? (profitGrowth / (p.riskFreeRate - 0.01)) * 100
    : 20 // 默认 PE 20

  const reasonablePEClamped = Math.max(5, Math.min(50, reasonablePE))

  reasoning.push(`合理PE: ${reasonablePEClamped.toFixed(1)} (增速: ${(profitGrowth * 100).toFixed(1)}%)`)
  details['reasonable_pe'] = reasonablePEClamped

  const intrinsicValue = eps * reasonablePEClamped
  reasoning.push(`内在价值: ¥${intrinsicValue.toFixed(2)}`)
  details['per_share'] = intrinsicValue

  const marginOfSafety = company.currentPrice
    ? ((intrinsicValue - company.currentPrice) / intrinsicValue) * 100
    : undefined

  if (marginOfSafety !== undefined) {
    reasoning.push(`当前价格: ¥${company.currentPrice.toFixed(2)}`)
    reasoning.push(`安全边际: ${marginOfSafety.toFixed(1)}%`)
    details['margin_of_safety'] = marginOfSafety
  }

  return {
    model: 'PE',
    intrinsicValue,
    currentPrice: company.currentPrice,
    marginOfSafety,
    reasoning,
    details,
  }
}

/**
 * PEG 估值
 */
export function calculatePEG(
  company: CompanyFinancials,
  params: Partial<ValuationParams> = {}
): ValuationResult {
  const p = { ...DEFAULT_PARAMS, ...params }
  const financials = company.financials

  if (financials.length === 0) {
    return createEmptyResult('PEG')
  }

  const reasoning: string[] = []
  const details: Record<string, number | string> = {}

  const latest = financials[financials.length - 1]
  const eps = latest.eps || (latest.netProfit || 0) / company.sharesOutstanding
  const profitGrowth = calculateGrowthRate(financials, 'netProfit')

  reasoning.push(`净利润增速: ${profitGrowth.toFixed(1)}%/年`)

  // PEG = PE / (Growth * 100)
  const currentPE = company.currentPrice / eps
  const peg = profitGrowth > 0 ? currentPE / profitGrowth : 1

  reasoning.push(`当前PE: ${currentPE.toFixed(1)}, PEG: ${peg.toFixed(2)}`)

  // PEG < 1 被低估, = 1 合理, > 1 被高估
  let assessment = '合理'
  if (peg < 0.8) assessment = '低估'
  else if (peg > 1.2) assessment = '高估'

  reasoning.push(`评估: ${assessment}`)
  details['peg'] = peg
  details['assessment'] = assessment

  // 合理价格
  const targetPE = profitGrowth / (p.riskFreeRate - 0.01) * 100
  const intrinsicValue = eps * Math.min(50, Math.max(5, targetPE))

  reasoning.push(`内在价值: ¥${intrinsicValue.toFixed(2)}`)
  details['per_share'] = intrinsicValue

  const marginOfSafety = company.currentPrice
    ? ((intrinsicValue - company.currentPrice) / intrinsicValue) * 100
    : undefined

  if (marginOfSafety !== undefined) {
    reasoning.push(`安全边际: ${marginOfSafety.toFixed(1)}%`)
    details['margin_of_safety'] = marginOfSafety
  }

  return {
    model: 'PEG',
    intrinsicValue,
    currentPrice: company.currentPrice,
    marginOfSafety,
    reasoning,
    details,
  }
}

/**
 * DDM 股息折现估值
 */
export function calculateDDM(
  company: CompanyFinancials,
  params: Partial<ValuationParams> = {}
): ValuationResult {
  const p = { ...DEFAULT_PARAMS, ...params }
  const financials = company.financials

  if (financials.length === 0) {
    return createEmptyResult('DDM')
  }

  const reasoning: string[] = []
  const details: Record<string, number | string> = {}

  // 使用最近的股息
  const dps = company.dividendPerShare || 0.5

  reasoning.push(`每股股息(DPS): ¥${dps.toFixed(4)}`)

  // 假设股息增长与利润增长一致
  const dividendGrowth = calculateGrowthRate(financials, 'netProfit') / 100

  // 永续增长率不能超过折现率
  const effectiveTG = Math.min(p.terminalGrowthRate, dividendGrowth)

  reasoning.push(`股息增速: ${(dividendGrowth * 100).toFixed(1)}%`)

  // 简化 Gordon 增长模型
  // V = D1 / (Ke - g)
  const d1 = dps * (1 + dividendGrowth)
  const ke = p.riskFreeRate + p.beta * p.marketRiskPremium
  const intrinsicValue = d1 / (ke - effectiveTG)

  reasoning.push(`折现率(Ke): ${(ke * 100).toFixed(2)}%`)
  reasoning.push(`内在价值: ¥${intrinsicValue.toFixed(2)}`)

  details['dividend_growth'] = dividendGrowth * 100
  details['ke'] = ke * 100
  details['per_share'] = intrinsicValue

  const marginOfSafety = company.currentPrice
    ? ((intrinsicValue - company.currentPrice) / intrinsicValue) * 100
    : undefined

  if (marginOfSafety !== undefined) {
    reasoning.push(`安全边际: ${marginOfSafety.toFixed(1)}%`)
    details['margin_of_safety'] = marginOfSafety
  }

  return {
    model: 'DDM',
    intrinsicValue,
    currentPrice: company.currentPrice,
    marginOfSafety,
    reasoning,
    details,
  }
}

/**
 * EV/EBITDA 估值
 */
export function calculateEV_EBITDA(
  company: CompanyFinancials,
  params: Partial<ValuationParams> = {}
): ValuationResult {
  const p = { ...DEFAULT_PARAMS, ...params }
  const financials = company.financials

  if (financials.length === 0) {
    return createEmptyResult('EV_EBITDA')
  }

  const reasoning: string[] = []
  const details: Record<string, number | string> = {}

  const latest = financials[financials.length - 1]
  const ebitda = latest.ebitda || (latest.netProfit || 0) * 1.5 // 估算

  reasoning.push(`EBITDA: ${formatMoney(ebitda)}`)

  // 行业平均 EV/EBITDA 倍数
  const industryMultiples: Record<string, number> = {
    '银行': 4,
    '证券': 12,
    '保险': 8,
    '房地产': 6,
    '制造业': 8,
    '科技': 15,
    '消费': 12,
    '能源': 6,
    '默认': 10,
  }

  let multiple = industryMultiples['默认']
  for (const [industry, m] of Object.entries(industryMultiples)) {
    if (company.industry?.includes(industry)) {
      multiple = m
      break
    }
  }

  reasoning.push(`行业倍数: ${multiple}x`)

  // EV = EBITDA * Multiple
  const ev = ebitda * multiple

  // 每股价值 = (EV - 净负债) / 股本
  const netDebt = company.netDebt || 0
  const equityValue = ev - netDebt
  const perShareValue = equityValue / company.sharesOutstanding

  reasoning.push(`企业价值(EV): ${formatMoney(ev)}`)
  reasoning.push(`股权价值: ${formatMoney(equityValue)}`)
  reasoning.push(`每股价值: ¥${perShareValue.toFixed(2)}`)

  details['ebitda'] = ebitda
  details['multiple'] = multiple
  details['ev'] = ev
  details['per_share'] = perShareValue

  const marginOfSafety = company.currentPrice
    ? ((perShareValue - company.currentPrice) / perShareValue) * 100
    : undefined

  if (marginOfSafety !== undefined) {
    reasoning.push(`安全边际: ${marginOfSafety.toFixed(1)}%`)
    details['margin_of_safety'] = marginOfSafety
  }

  return {
    model: 'EV_EBITDA',
    intrinsicValue: perShareValue,
    currentPrice: company.currentPrice,
    marginOfSafety,
    reasoning,
    details,
  }
}

/**
 * 执行完整估值分析
 */
export function runValuation(
  company: CompanyFinancials,
  fourDimensions: FourDimensionResult,
  params: Partial<ValuationParams> = {}
): {
  recommendedModel: ValuationModel
  results: Record<ValuationModel, ValuationResult>
  conclusion: '买入' | '观望' | '清仓' | '规避'
  reasoning: string
} {
  // 确定最佳模型
  const recommendedModel = selectBestModel(
    company.financials,
    fourDimensions.policy.industryPolicy === '支持' ? '成长型' : undefined
  )

  // 计算所有模型结果
  const results: Record<string, ValuationResult> = {
    DCF: calculateDCF(company, params),
    PE: calculatePE(company, params),
    PEG: calculatePEG(company, params),
    DDM: calculateDDM(company, params),
    EV_EBITDA: calculateEV_EBITDA(company, params),
  }

  // 使用推荐模型的结果
  const result = results[recommendedModel]
  const reasoning: string[] = []

  reasoning.push(`推荐模型: ${recommendedModel}`)
  reasoning.push(`内在价值: ¥${result.intrinsicValue.toFixed(2)}`)

  if (result.marginOfSafety !== undefined) {
    reasoning.push(`安全边际: ${result.marginOfSafety.toFixed(1)}%`)
  }

  // 买入信号判断
  let conclusion: '买入' | '观望' | '清仓' | '规避' = '观望'

  if (!fourDimensions.macro.proceedToAnalysis) {
    conclusion = '规避'
    reasoning.push('⚠️ 系统性风险，禁止入场')
  } else if (result.marginOfSafety !== undefined) {
    if (result.marginOfSafety >= 30) {
      conclusion = '买入'
      reasoning.push('✅ 安全边际充足，建议买入')
    } else if (result.marginOfSafety >= 15) {
      conclusion = '观望'
      reasoning.push('⚠️ 安全边际一般，保持观望')
    } else {
      conclusion = '清仓'
      reasoning.push('❌ 估值偏高，建议减仓')
    }
  }

  return {
    recommendedModel,
    results,
    conclusion,
    reasoning: reasoning.join('\n'),
  }
}

/**
 * 工具函数
 */
function formatMoney(value: number): string {
  if (Math.abs(value) >= 1e8) {
    return `${(value / 1e8).toFixed(2)}亿`
  } else if (Math.abs(value) >= 1e4) {
    return `${(value / 1e4).toFixed(2)}万`
  }
  return value.toFixed(2)
}

function createEmptyResult(model: ValuationModel): ValuationResult {
  return {
    model,
    intrinsicValue: 0,
    reasoning: ['数据不足，无法计算'],
    details: {},
  }
}