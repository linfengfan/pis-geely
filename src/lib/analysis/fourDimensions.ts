/**
 * 四维分析框架
 * 骨(宏观) - 筋(周期) - 肉(政策) - 血(流动性)
 */

import type { FinancialTable } from './markdownParser'

export interface MacroData {
  cn10y: number          // 10年期国债收益率 (无风险利率 Rf)
  usdcny: number         // 美元兑人民币汇率
  lpr: number            // LPR 利率
  socialFinancing: number // 社融增速 %
  m2?: number            // M2 增速 %
  cpi?: number           // CPI %
  ppi?: number           // PPI %
}

export interface CycleAnalysis {
  stage: '复苏' | '繁荣' | '滞胀' | '衰退'
  inventoryCycle: '被动去库存' | '主动去库存' | '被动补库存' | '主动补库存'
  confidence: number     // 分析置信度 0-100
}

export interface PolicyAnalysis {
  industryPolicy: '支持' | '中性' | '限制'
  fiscalPolicy: '扩张' | '中性' | '收缩'
  monetaryPolicy: '宽松' | '中性' | '紧缩'
  impact: '正面' | '中性' | '负面'
  description: string
}

export interface LiquidityAnalysis {
  cashFlowHealth: '优秀' | '良好' | '一般' | '较差'
  freeCashFlow: number   // 自由现金流
  operatingCashFlow: number // 经营现金流
  cashConversion: number // 净利润现金含量 %
  workingCapital: number // 营运资本
  score: number          // 评分 0-100
}

export interface FourDimensionResult {
  // 骨 - 宏观环境
  macro: {
    riskFreeRate: number    // 无风险利率
    liquidityAssessment: '宽松' | '中性' | '紧缩'
    externalPressure: '高' | '中' | '低'  // 外资流出压力
    proceedToAnalysis: boolean // 是否继续分析
    reasoning: string
  }

  // 筋 - 周期分析
  cycle: CycleAnalysis

  // 肉 - 政策分析
  policy: PolicyAnalysis

  // 血 - 流动性分析
  liquidity: LiquidityAnalysis
}

export interface CompanyContext {
  financialData: FinancialTable[]
  companyType?: '银行/公用' | '消费/公用' | '成长型' | '重资产'
  industry?: string
}

/**
 * 四维分析主函数
 */
export function analyzeFourDimensions(
  context: CompanyContext,
  macroData: MacroData
): FourDimensionResult {
  return {
    macro: analyzeMacro(context, macroData),
    cycle: analyzeCycle(context),
    policy: analyzePolicy(context),
    liquidity: analyzeLiquidity(context),
  }
}

/**
 * 骨 - 宏观环境分析
 */
function analyzeMacro(context: CompanyContext, macro: MacroData): FourDimensionResult['macro'] {
  const reasoning: string[] = []

  // 1. 无风险利率
  const rf = macro.cn10y / 100
  reasoning.push(`无风险利率(Rf): ${macro.cn10y}%`)

  // 2. 流动性评估
  let liquidityAssessment: '宽松' | '中性' | '紧缩' = '中性'

  if (macro.socialFinancing > 12) {
    liquidityAssessment = '宽松'
    reasoning.push('社融增速 > 12%，流动性宽松')
  } else if (macro.socialFinancing < 8) {
    liquidityAssessment = '紧缩'
    reasoning.push('社融增速 < 8%，流动性紧缩')
  } else {
    reasoning.push(`社融增速 ${macro.socialFinancing}%，流动性中性`)
  }

  // 3. 外资压力评估
  let externalPressure: '高' | '中' | '低' = '中'

  if (macro.usdcny > 7.3) {
    externalPressure = '高'
    reasoning.push('USD/CNY > 7.3，汇率压力大，外资可能流出')
  } else if (macro.usdcny < 7.1) {
    externalPressure = '低'
    reasoning.push('USD/CNY < 7.1，汇率稳定')
  }

  // 4. 风险熔断检查
  const proceedToAnalysis = !(macro.usdcny > 7.5 && macro.cn10y > macro.lpr)

  if (!proceedToAnalysis) {
    reasoning.push('⚠️ 系统性流动性收缩风险，暂停分析')
  }

  return {
    riskFreeRate: rf,
    liquidityAssessment,
    externalPressure,
    proceedToAnalysis,
    reasoning: reasoning.join('; '),
  }
}

/**
 * 筋 - 周期分析（美林时钟）
 */
function analyzeCycle(context: CompanyContext): CycleAnalysis {
  const { financialData } = context

  if (financialData.length < 2) {
    return {
      stage: '复苏',
      inventoryCycle: '被动去库存',
      confidence: 30,
    }
  }

  // 计算营收和利润增速
  const latest = financialData[financialData.length - 1]
  const previous = financialData[financialData.length - 2]

  const revenueGrowth = latest.revenue && previous.revenue
    ? ((latest.revenue - previous.revenue) / previous.revenue) * 100
    : 0

  const profitGrowth = latest.netProfit && previous.netProfit
    ? ((latest.netProfit - previous.netProfit) / previous.netProfit) * 100
    : 0

  // 美林时钟判断
  let stage: FourDimensionResult['cycle']['stage'] = '复苏'

  if (revenueGrowth > 15 && profitGrowth > 20) {
    stage = '繁荣'
  } else if (revenueGrowth > 5 && profitGrowth > 10) {
    stage = '复苏'
  } else if (revenueGrowth < 0 && profitGrowth < 0) {
    stage = '衰退'
  } else {
    stage = '滞胀'
  }

  // 库存周期判断
  let inventoryCycle: FourDimensionResult['cycle']['inventoryCycle'] = '被动去库存'

  if (revenueGrowth > 0 && profitGrowth > 0) {
    inventoryCycle = '主动补库存'
  } else if (revenueGrowth > 0 && profitGrowth < 0) {
    inventoryCycle = '被动补库存'
  } else if (revenueGrowth < 0 && profitGrowth > 0) {
    inventoryCycle = '主动去库存'
  } else {
    inventoryCycle = '被动去库存'
  }

  // 置信度
  const confidence = Math.min(95, 50 + financialData.length * 10)

  return {
    stage,
    inventoryCycle,
    confidence,
  }
}

/**
 * 肉 - 政策分析
 */
function analyzePolicy(context: CompanyContext): PolicyAnalysis {
  // 默认分析 - 实际需要从 .md 文件中提取政策相关信息
  // 这里先基于公司类型做基础判断

  const industry = context.industry || ''

  let industryPolicy: '支持' | '中性' | '限制' = '中性'
  let fiscalPolicy: '扩张' | '中性' | '收缩' = '中性'
  let monetaryPolicy: '宽松' | '中性' | '紧缩' = '中性'
  let impact: '正面' | '中性' | '负面' = '中性'
  let description = '基于公司类型和行业的基础政策评估'

  // 行业政策判断
  const supportIndustries = ['新能源', '半导体', '医药', '高端制造', '科技']
  const restrictIndustries = ['房地产', '教育培训', '互联网金融', '传统能源']

  if (supportIndustries.some(i => industry.includes(i))) {
    industryPolicy = '支持'
    impact = '正面'
    description = '属于政策支持行业'
  } else if (restrictIndustries.some(i => industry.includes(i))) {
    industryPolicy = '限制'
    impact = '负面'
    description = '行业面临政策压力'
  }

  return {
    industryPolicy,
    fiscalPolicy,
    monetaryPolicy,
    impact,
    description,
  }
}

/**
 * 血 - 流动性分析
 */
function analyzeLiquidity(context: CompanyContext): LiquidityAnalysis {
  const { financialData } = context

  if (financialData.length === 0) {
    return {
      cashFlowHealth: '一般',
      freeCashFlow: 0,
      operatingCashFlow: 0,
      cashConversion: 0,
      workingCapital: 0,
      score: 50,
    }
  }

  const latest = financialData[financialData.length - 1]

  const operatingCF = latest.operatingCashFlow || 0
  const netProfit = latest.netProfit || 0

  // 净利润现金含量
  const cashConversion = netProfit > 0 ? (operatingCF / netProfit) * 100 : 0

  // 自由现金流 = 经营现金流 - 投资现金流（简化）
  const freeCashFlow = operatingCF

  // 营运资本 = 总资产 - 总负债
  const workingCapital = (latest.totalAssets || 0) - (latest.totalLiabilities || 0)

  // 综合评分
  let score = 50

  if (cashConversion >= 100 && operatingCF > 0) {
    score += 20
  } else if (cashConversion >= 80) {
    score += 10
  } else if (cashConversion < 50) {
    score -= 20
  }

  if (latest.roe && latest.roe > 15) score += 15
  else if (latest.roe && latest.roe > 10) score += 5

  if (latest.debtRatio && latest.debtRatio < 50) score += 10
  else if (latest.debtRatio && latest.debtRatio > 70) score -= 15

  score = Math.max(0, Math.min(100, score))

  // 现金流健康度判断
  let cashFlowHealth: '优秀' | '良好' | '一般' | '较差' = '一般'

  if (score >= 80) cashFlowHealth = '优秀'
  else if (score >= 60) cashFlowHealth = '良好'
  else if (score < 40) cashFlowHealth = '较差'

  return {
    cashFlowHealth,
    freeCashFlow,
    operatingCashFlow: operatingCF,
    cashConversion,
    workingCapital,
    score,
  }
}

/**
 * 生成综合分析摘要
 */
export function generateAnalysisSummary(result: FourDimensionResult): string {
  const lines: string[] = []

  lines.push('## 四维分析摘要\n')

  lines.push(`**宏观环境**: ${result.macro.liquidityAssessment} | 外资压力: ${result.macro.externalPressure}`)
  lines.push(`**周期阶段**: ${result.cycle.stage} | 库存周期: ${result.cycle.inventoryCycle}`)
  lines.push(`**政策评估**: ${result.policy.impact} | ${result.policy.description}`)
  lines.push(`**现金流**: ${result.liquidity.cashFlowHealth} (评分: ${result.liquidity.score}/100)`)

  if (!result.macro.proceedToAnalysis) {
    lines.push('\n⚠️ 系统性风险，禁止入场')
  }

  return lines.join('\n')
}