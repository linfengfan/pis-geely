import { z } from 'zod'

// ============ Company Schemas ============
export const CompanyCreateSchema = z.object({
  name: z.string().min(1, '公司名称不能为空').max(200, '公司名称过长'),
  code: z.string().regex(/^\d{6}$/, '股票代码必须为6位数字').optional(),
  industry: z.string().optional(),
  companyType: z.enum(['BANK_WATER', 'CONSUMER', 'GROWTH', 'HEAVY_ASSET']).optional(),
})

export const CompanyUpdateSchema = CompanyCreateSchema.partial()

// ============ Macro Data Schemas ============
export const MacroSnapshotSchema = z.object({
  cn10y: z.number().min(0).max(10, '中国10年期国债收益率超出合理范围'),
  usdcny: z.number().min(6).max(8, 'USD/CNY 汇率超出合理范围'),
  lpr: z.number().min(0).max(10, 'LPR 超出合理范围'),
  m2: z.number().optional(),
  socialFinancing: z.number().optional(),
  cpi: z.number().optional(),
  ppi: z.number().optional(),
  pmi: z.number().optional(),
})

// ============ Financial Data Schemas ============
export const FinancialDataSchema = z.object({
  companyId: z.string().min(1, '公司ID不能为空'),
  year: z.number().int().min(2000).max(2100),
  revenue: z.number().optional(),
  netProfit: z.number().optional(),
  totalAssets: z.number().optional(),
  totalLiabilities: z.number().optional(),
  equity: z.number().optional(),
  operatingCashFlow: z.number().optional(),
  investingCashFlow: z.number().optional(),
  financingCashFlow: z.number().optional(),
  grossMargin: z.number().optional(),
  netMargin: z.number().optional(),
  roe: z.number().optional(),
  roic: z.number().optional(),
  debtRatio: z.number().optional(),
  dividendYield: z.number().optional(),
  eps: z.number().optional(),
  ebitda: z.number().optional(),
})

// ============ Valuation Schemas ============
export const FinancialDataInputSchema = z.object({
  netProfit: z.number().min(0, '净利润不能为负'),
  shares: z.number().min(0, '股本不能为负'),
  operatingCashFlow: z.number(),
  dividendPerShare: z.number().min(0, '每股股息不能为负'),
  equity: z.number().min(0, '净资产不能为负'),
  roe: z.number().min(-100, 'ROE 超出合理范围').max(100, 'ROE 超出合理范围'),
})

export const ValuationParamsSchema = z.object({
  wacc: z.number().min(0).max(30, 'WACC 超出合理范围'),
  terminalGrowthRate: z.number().min(-5).max(10, '永续增长率超出合理范围'),
  dividendRatio: z.number().min(0).max(1, '分红比例需在 0-1 之间'),
  projectionYears: z.number().int().min(1).max(10),
})

export const ValuationRequestSchema = z.object({
  companyName: z.string().min(1, '公司名称不能为空'),
  code: z.string().regex(/^\d{6}$/, '股票代码必须为6位数字').optional(),
  financialData: FinancialDataInputSchema,
  macroData: MacroSnapshotSchema,
  valuationParams: ValuationParamsSchema,
  currentPrice: z.number().min(0, '当前股价不能为负'),
})

// ============ Analysis Schemas ============
export const AnalysisRequestSchema = z.object({
  markdown: z.string().min(1, '分析内容不能为空'),
  companyName: z.string().min(1, '公司名称不能为空').optional(),
  code: z.string().regex(/^\d{6}$/, '股票代码必须为6位数字').optional(),
  currentPrice: z.number().min(0).optional(),
  macroData: MacroSnapshotSchema,
  sharesOutstanding: z.number().min(0).optional(),
  dividendPerShare: z.number().min(0).optional(),
})

// ============ Portfolio Schemas ============
export const PortfolioCreateSchema = z.object({
  name: z.string().min(1, '组合名称不能为空').max(100),
})

export const HoldingCreateSchema = z.object({
  portfolioId: z.string().min(1, '组合ID不能为空'),
  companyId: z.string().min(1, '公司ID不能为空'),
  buyPrice: z.number().min(0, '买入价格不能为负'),
  buyQuantity: z.number().int().min(1, '买入数量必须大于0'),
  currentPrice: z.number().min(0).optional(),
})

export const HoldingUpdateSchema = z.object({
  currentPrice: z.number().min(0, '当前价格不能为负').optional(),
})

// ============ Types Export ============
export type CompanyCreate = z.infer<typeof CompanyCreateSchema>
export type CompanyUpdate = z.infer<typeof CompanyUpdateSchema>
export type MacroSnapshot = z.infer<typeof MacroSnapshotSchema>
export type FinancialData = z.infer<typeof FinancialDataSchema>
export type ValuationRequest = z.infer<typeof ValuationRequestSchema>
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>
export type PortfolioCreate = z.infer<typeof PortfolioCreateSchema>
export type HoldingCreate = z.infer<typeof HoldingCreateSchema>
export type HoldingUpdate = z.infer<typeof HoldingUpdateSchema>