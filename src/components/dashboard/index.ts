import { FinancialTrendChart, ROEChart, CashFlowChart } from '../charts/FinancialTrendChart'
import { RiskRadar, RiskMetrics } from '../charts/RiskRadar'
import { MacroBoard } from '../charts/MacroBoard'
import { ValuationDashboard, ValuationSummary } from './ValuationDashboard'
import type { MacroData } from '@/lib/analysis'

export { FinancialTrendChart, ROEChart, CashFlowChart }
export { RiskRadar, RiskMetrics }
export { MacroBoard }
export { ValuationDashboard, ValuationSummary }

// 示例数据接口
export interface AnalysisResult {
  companyName: string
  code?: string
  financialData: Array<{
    year: number
    revenue?: number
    netProfit?: number
    grossMargin?: number
    netMargin?: number
    roe?: number
    roic?: number
    operatingCashFlow?: number
    investingCashFlow?: number
    financingCashFlow?: number
  }>
  macroData: MacroData
  valuation: {
    intrinsicValue: number
    currentPrice?: number
    marginOfSafety?: number
    conclusion: '买入' | '观望' | '清仓' | '规避'
    modelUsed: string
    allModels: Array<{
      name: string
      intrinsicValue: number
      marginOfSafety?: number
    }>
  }
  riskScore: number
}

// 默认示例数据
export const DEMO_DATA: AnalysisResult = {
  companyName: '贵州茅台',
  code: '600519',
  financialData: [
    { year: 2020, revenue: 979.9e8, netProfit: 466.97e8, grossMargin: 91.3, netMargin: 47.7, roe: 31.0, roic: 29.5, operatingCashFlow: 516.7e8, investingCashFlow: -29.8e8, financingCashFlow: -229.4e8 },
    { year: 2021, revenue: 1095.0e8, netProfit: 524.6e8, grossMargin: 91.5, netMargin: 47.9, roe: 29.9, roic: 28.7, operatingCashFlow: 640.3e8, investingCashFlow: -21.6e8, financingCashFlow: -247.9e8 },
    { year: 2022, revenue: 1275.6e8, netProfit: 627.2e8, grossMargin: 91.9, netMargin: 49.2, roe: 30.3, roic: 29.1, operatingCashFlow: 366.3e8, investingCashFlow: -19.2e8, financingCashFlow: -282.6e8 },
    { year: 2023, revenue: 1476.0e8, netProfit: 747.3e8, grossMargin: 91.9, netMargin: 50.6, roe: 32.1, roic: 31.0, operatingCashFlow: 582.0e8, investingCashFlow: -22.1e8, financingCashFlow: -315.3e8 },
    { year: 2024, revenue: 1629.0e8, netProfit: 862.3e8, grossMargin: 92.1, netMargin: 52.9, roe: 33.5, roic: 32.2, operatingCashFlow: 651.0e8, investingCashFlow: -25.0e8, financingCashFlow: -350.0e8 },
  ],
  macroData: {
    cn10y: 2.21,
    usdcny: 7.245,
    lpr: 3.45,
    socialFinancing: 9.5,
  },
  valuation: {
    intrinsicValue: 2150.0,
    currentPrice: 1680.0,
    marginOfSafety: 21.8,
    conclusion: '观望',
    modelUsed: 'DCF',
    allModels: [
      { name: 'DCF', intrinsicValue: 2150.0, marginOfSafety: 21.8 },
      { name: 'PE', intrinsicValue: 1980.0, marginOfSafety: 15.2 },
      { name: 'DDM', intrinsicValue: 2320.0, marginOfSafety: 27.6 },
      { name: 'PEG', intrinsicValue: 1850.0, marginOfSafety: 9.2 },
    ],
  },
  riskScore: 85,
}